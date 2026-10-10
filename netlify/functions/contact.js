// Envoi des formulaires du site (aide, contact, sensibilisation, candidature) vers la boîte
// de l'association, via Brevo.
//
// La clé Brevo et l'adresse de destination vivent dans les variables
// d'environnement Netlify : jamais dans le repo, jamais dans le navigateur.
// Rien n'est stocké ici, le message part directement dans la boîte.

const ORIGINES_AUTORISEES = (process.env.ORIGINES_AUTORISEES ||
  'https://inquisitive-maamoul-5ddc51.netlify.app')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const FORMULAIRES = {
  aide: { objet: "Demande d'aide", priorite: true },
  contact: { objet: 'Message de contact', priorite: false },
  sensibilisation: { objet: 'Demande de sensibilisation', priorite: false },
  candidature: { objet: 'Candidature bénévole', priorite: false },
};

const CHAMPS_MAX = 20;
const VALEUR_MAX_CARACTERES = 10000;

// Pièces jointes : acceptées uniquement pour le formulaire de candidature.
// Les fonctions Netlify plafonnent le corps de requête à 6 Mo : deux fichiers
// de 2 Mo en base64 font environ 5,4 Mo, on refuse tout corps au-delà de 5,8 Mo.
const CORPS_MAX_OCTETS = 5.8 * 1024 * 1024;
const FICHIERS_MAX = 2;
const FICHIER_MAX_OCTETS = 2 * 1024 * 1024;
const BASE64_MAX_CARACTERES = Math.ceil(FICHIER_MAX_OCTETS / 3) * 4;
const LIBELLES_FICHIERS = ['CV', 'Lettre de motivation'];
// Signature binaire attendue selon l'extension.
const SIGNATURES = {
  pdf: [0x25, 0x50, 0x44, 0x46], // %PDF
  docx: [0x50, 0x4b, 0x03, 0x04], // PK\x03\x04 (archive zip)
  odt: [0x50, 0x4b, 0x03, 0x04],
  doc: [0xd0, 0xcf, 0x11, 0xe0], // conteneur OLE2 (Word 97-2003)
};

function nettoyer_nom(nom) {
  return String(nom)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9._-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^[._-]+/, '')
    .slice(0, 100);
}

// Renvoie la liste des pièces jointes au format Brevo, ou null si invalide.
function valider_fichiers(fichiers) {
  if (!Array.isArray(fichiers) || fichiers.length < 1 || fichiers.length > FICHIERS_MAX) return null;
  const libelles_vus = new Set();
  const pieces = [];
  for (const f of fichiers) {
    if (!f || typeof f.libelle !== 'string' || typeof f.nom !== 'string' || typeof f.contenu !== 'string') return null;
    if (!LIBELLES_FICHIERS.includes(f.libelle) || libelles_vus.has(f.libelle)) return null;
    libelles_vus.add(f.libelle);

    const contenu = f.contenu;
    if (contenu.length === 0 || contenu.length > BASE64_MAX_CARACTERES) return null;
    if (contenu.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(contenu)) return null;
    const binaire = Buffer.from(contenu, 'base64');
    if (binaire.length === 0 || binaire.length > FICHIER_MAX_OCTETS) return null;

    const point = f.nom.lastIndexOf('.');
    if (point <= 0) return null;
    const extension = f.nom.slice(point + 1).toLowerCase();
    const signature = SIGNATURES[extension];
    if (!signature) return null;
    if (binaire.length < signature.length || !signature.every((octet, i) => binaire[i] === octet)) return null;

    const base = nettoyer_nom(f.nom.slice(0, point)) || 'document';
    pieces.push({ name: `${f.libelle} - ${base}.${extension}`, content: contenu });
  }
  return pieces;
}

// Limite de débit par IP : le formulaire ne doit pas devenir un canon à spam
// braqué sur la boîte de l'asso. Le compteur vit dans l'instance Netlify.
const FENETRE_MS = 10 * 60 * 1000;
const ENVOIS_MAX_PAR_FENETRE = 5;
const compteurs = new Map();

function trop_d_envois(ip) {
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
  return entree.nombre > ENVOIS_MAX_PAR_FENETRE;
}

function echapper(texte) {
  return String(texte)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Première valeur qui ressemble à une adresse mail : sert de "répondre à",
// pour que Damien réponde directement depuis sa boîte.
function trouver_email(champs) {
  const candidat = champs.find((c) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((c.valeur || '').trim()));
  return candidat ? candidat.valeur.trim() : null;
}

exports.handler = async function (event) {
  const origine = event.headers.origin || event.headers.Origin || '';
  // Origines configurées + localhost pour le développement local. Une page
  // distante ne peut pas usurper une origine localhost dans un navigateur.
  const origine_ok =
    ORIGINES_AUTORISEES.includes(origine) ||
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origine);
  const entetes = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origine_ok ? origine : ORIGINES_AUTORISEES[0],
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: entetes, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: entetes, body: 'Method Not Allowed' };
  }
  if (!origine_ok) {
    return { statusCode: 403, headers: entetes, body: 'Origine non autorisée' };
  }

  const ip =
    (event.headers['x-nf-client-connection-ip'] ||
      (event.headers['x-forwarded-for'] || '').split(',')[0] ||
      '').trim() || 'inconnue';

  if (trop_d_envois(ip)) {
    return {
      statusCode: 429,
      headers: { ...entetes, 'Retry-After': '600' },
      body: JSON.stringify({ error: 'Trop d’envois. Réessayez dans quelques minutes.' }),
    };
  }

  if (typeof event.body === 'string' && Buffer.byteLength(event.body, 'utf8') > CORPS_MAX_OCTETS) {
    return { statusCode: 413, headers: entetes, body: 'Requête trop volumineuse' };
  }

  let formulaire;
  let champs;
  let piege;
  let fichiers;
  try {
    ({ formulaire, champs, piege, fichiers } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, headers: entetes, body: 'Invalid JSON' };
  }

  // Champ invisible rempli seulement par les robots.
  if (piege) {
    return { statusCode: 200, headers: entetes, body: JSON.stringify({ ok: true }) };
  }

  const config = FORMULAIRES[formulaire];
  if (!config) {
    return { statusCode: 400, headers: entetes, body: 'Formulaire inconnu' };
  }
  if (!Array.isArray(champs) || champs.length === 0 || champs.length > CHAMPS_MAX) {
    return { statusCode: 400, headers: entetes, body: 'Champs invalides' };
  }

  // Pièces jointes : seulement pour la candidature.
  let pieces_jointes = null;
  if (fichiers !== undefined) {
    if (formulaire !== 'candidature') {
      return { statusCode: 400, headers: entetes, body: 'Pièce jointe non acceptée' };
    }
    pieces_jointes = valider_fichiers(fichiers);
    if (!pieces_jointes) {
      return { statusCode: 400, headers: entetes, body: 'Pièce jointe invalide' };
    }
  }
  // Candidature : CV et lettre de motivation obligatoires.
  if (formulaire === 'candidature' && !(pieces_jointes && pieces_jointes.some((p) => p.name.startsWith('CV - ')) && pieces_jointes.some((p) => p.name.startsWith('Lettre de motivation - ')))) {
    return { statusCode: 400, headers: entetes, body: 'Pièce jointe invalide' };
  }

  const propres = champs
    .filter((c) => c && typeof c.label === 'string' && typeof c.valeur === 'string')
    .map((c) => ({
      label: c.label.slice(0, 200),
      valeur: c.valeur.slice(0, VALEUR_MAX_CARACTERES),
    }))
    .filter((c) => c.valeur.trim());

  if (propres.length === 0) {
    return { statusCode: 400, headers: entetes, body: 'Message vide' };
  }

  const cle_brevo = process.env.BREVO_API_KEY;
  const destination = process.env.EMAIL_DESTINATION;
  const expediteur = process.env.EMAIL_EXPEDITEUR || destination;
  if (!cle_brevo || !destination) {
    console.error('BREVO_API_KEY ou EMAIL_DESTINATION absent');
    return { statusCode: 500, headers: entetes, body: 'Envoi non configuré' };
  }

  const corps = propres
    .map((c) => `<p><strong>${echapper(c.label)}</strong><br>${echapper(c.valeur).replace(/\n/g, '<br>')}</p>`)
    .join('\n');

  const email_repondre = trouver_email(propres);

  const message = {
    sender: { name: 'Site LibredeDroit', email: expediteur },
    to: [{ email: destination }],
    subject: `${config.priorite ? '[AIDE] ' : ''}${config.objet} — site LibredeDroit`,
    htmlContent: `<html><body>
      <p style="color:#666">Message envoyé depuis le formulaire « ${echapper(config.objet)} » du site.</p>
      <hr>
      ${corps}
    </body></html>`,
  };

  if (email_repondre) {
    message.replyTo = { email: email_repondre };
  }

  if (pieces_jointes) {
    message.attachment = pieces_jointes;
  }

  const reponse = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': cle_brevo,
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify(message),
  });

  if (!reponse.ok) {
    // Le détail va dans les logs Netlify, jamais dans la réponse au navigateur.
    console.error('Brevo a refusé l’envoi', reponse.status, await reponse.text());
    return {
      statusCode: 502,
      headers: entetes,
      body: JSON.stringify({ error: 'Envoi impossible pour le moment.' }),
    };
  }

  return { statusCode: 200, headers: entetes, body: JSON.stringify({ ok: true }) };
};
