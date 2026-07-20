// Recherche IA de la page Ressources.
// Moteur : Mistral (IA française, données traitées en Europe).
// La clé API n'est jamais exposée au navigateur : le front appelle cette
// fonction, qui appelle Mistral côté serveur.
// NB : le nom de fichier « claude-search » est conservé pour ne pas modifier
// le bundle du site, qui appelle /.netlify/functions/claude-search.

const ORIGINES_AUTORISEES = (process.env.ORIGINES_AUTORISEES ||
  'https://inquisitive-maamoul-5ddc51.netlify.app')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// La recherche envoie la liste complète des articles + la situation décrite :
// le prompt assemblé fait plusieurs milliers de caractères. Plafond large ;
// l'abus reste freiné par la restriction d'origine et la limite de débit.
const PROMPT_MAX_CARACTERES = 10000;

// Limite de débit par IP. Le compteur vit dans l'instance Netlify : il se
// réinitialise à froid, donc il freine les abus sans les rendre impossibles.
const FENETRE_MS = 60 * 1000;
const REQUETES_MAX_PAR_FENETRE = 8;
const compteurs = new Map();

function trop_de_requetes(ip) {
  const maintenant = Date.now();
  const entree = compteurs.get(ip);

  if (!entree || maintenant > entree.expire_a) {
    compteurs.set(ip, { nombre: 1, expire_a: maintenant + FENETRE_MS });
    if (compteurs.size > 10000) {
      for (const [cle, valeur] of compteurs) {
        if (maintenant > valeur.expire_a) compteurs.delete(cle);
      }
    }
    return false;
  }

  entree.nombre += 1;
  return entree.nombre > REQUETES_MAX_PAR_FENETRE;
}

exports.handler = async function (event) {
  const origine = event.headers.origin || event.headers.Origin || '';
  // Origines configurées + localhost pour le développement local. Une page
  // distante ne peut pas usurper une origine localhost dans un navigateur.
  const origine_ok =
    ORIGINES_AUTORISEES.includes(origine) ||
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origine);
  const entetes_cors = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origine_ok ? origine : ORIGINES_AUTORISEES[0],
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: entetes_cors, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: entetes_cors, body: 'Method Not Allowed' };
  }

  if (!origine_ok) {
    return { statusCode: 403, headers: entetes_cors, body: 'Origine non autorisée' };
  }

  const ip =
    (event.headers['x-nf-client-connection-ip'] ||
      (event.headers['x-forwarded-for'] || '').split(',')[0] ||
      '').trim() || 'inconnue';

  if (trop_de_requetes(ip)) {
    return {
      statusCode: 429,
      headers: { ...entetes_cors, 'Retry-After': '60' },
      body: JSON.stringify({ error: 'Trop de recherches. Réessayez dans une minute.' }),
    };
  }

  let prompt;
  try {
    ({ prompt } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, headers: entetes_cors, body: 'Invalid JSON' };
  }

  if (typeof prompt !== 'string' || !prompt.trim()) {
    return { statusCode: 400, headers: entetes_cors, body: 'Missing prompt' };
  }

  if (prompt.length > PROMPT_MAX_CARACTERES) {
    return {
      statusCode: 413,
      headers: entetes_cors,
      body: JSON.stringify({ error: 'Recherche trop longue.' }),
    };
  }

  // Accepte les deux graphies de la variable Netlify (MISTRAL_API_KEY est la
  // forme conventionnelle ; MISTRAL_AI_KEY est tolérée pour éviter un blocage).
  const apiKey = process.env.MISTRAL_API_KEY || process.env.MISTRAL_AI_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers: entetes_cors, body: 'API key not configured' };
  }

  // Modèle configurable via variable d'environnement, pour pouvoir en changer
  // sans toucher au code. Défaut : le petit modèle Mistral, suffisant ici.
  const modele = process.env.MISTRAL_MODEL || 'mistral-small-latest';

  let response;
  try {
    response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
      body: JSON.stringify({
        model: modele,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
  } catch (e) {
    console.error('Appel Mistral impossible', e);
    return { statusCode: 502, headers: entetes_cors, body: 'Mistral API error' };
  }

  if (!response.ok) {
    console.error('Mistral a répondu en erreur', response.status, await response.text());
    return { statusCode: 502, headers: entetes_cors, body: 'Mistral API error' };
  }

  const data = await response.json();
  let texte =
    data && data.choices && data.choices[0] && data.choices[0].message
      ? data.choices[0].message.content || ''
      : '';

  // Certains modèles enrobent le JSON dans un bloc Markdown ```json … ```.
  // On le retire pour que le site reçoive du JSON directement analysable,
  // comme le faisait l'ancien moteur.
  texte = texte.trim();
  const bloc_md = texte.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (bloc_md) texte = bloc_md[1].trim();

  return {
    statusCode: 200,
    headers: entetes_cors,
    body: JSON.stringify({ result: texte }),
  };
};
