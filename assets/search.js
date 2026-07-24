/* LibredeDroit — recherche de ressources (page Ressources).
   Chemin principal : fonction Netlify claude-search (moteur IA cote serveur).
   Filet de securite : correspondance par mots-cles, 100 % local. */
(function () {
  'use strict';

  var ENDPOINT = '/.netlify/functions/claude-search';

  // Metadonnees locales des 14 articles (source de verite cote client).
  var ARTICLES = [
    { id: 'types-violences', theme: 'Types de violences', titre: "Outrage sexiste, agression, viol : de quoi parle-t-on ?", mots: ['outrage', 'sexiste', 'agression', 'viol', 'harcelement', 'definition', 'qualification', 'infraction'] },
    { id: 'porter-plainte', theme: 'Procédure pénale', titre: "Porter plainte : comment ça se passe, étape par étape", mots: ['plainte', 'porter plainte', 'commissariat', 'gendarmerie', 'procureur', 'main courante', 'enquete', 'depot'] },
    { id: 'classement-sans-suite', theme: 'Procédure pénale', titre: "Plainte classée sans suite : quels recours ?", mots: ['classement', 'sans suite', 'recours', 'partie civile', 'citation directe', 'procureur general', 'classee'] },
    { id: 'prescription', theme: 'Procédure pénale', titre: "Les délais de prescription des violences sexuelles", mots: ['prescription', 'delai', 'mineur', 'enfance', 'majorite', 'trop tard', 'ancien', 'longtemps'] },
    { id: 'droits-victime', theme: 'Droits & indemnisation', titre: "Vos droits en tant que victime pendant la procédure", mots: ['droits', 'victime', 'information', 'protection', 'reparation', 'partie civile', 'avocat', 'accompagnement'] },
    { id: 'procedure-civile', theme: 'Procédure civile', titre: "L'ordonnance de protection et les recours au civil", mots: ['ordonnance de protection', 'civil', 'juge aux affaires familiales', 'eloignement', 'logement', 'enfants', 'danger', 'conjoint', 'protection', 'indemnisation', 'civi'] },
    { id: 'psychotraumatisme', theme: 'Comprendre le trauma', titre: "Comprendre le psychotraumatisme et la mémoire traumatique", mots: ['psychotraumatisme', 'trauma', 'memoire', 'flashs', 'cauchemars', 'reviviscence', 'dissociation', 'hypervigilance', 'emdr'] },
    { id: 'sideration', theme: 'Comprendre le trauma', titre: "La sidération : pourquoi on ne réagit pas toujours sur le moment", mots: ['sideration', 'figement', 'reaction', 'culpabilite', 'consentement', 'immobilite', 'pas reagi', 'dissociation'] },
    { id: 'trouver-psy', theme: 'Se reconstruire', titre: "Trouver un·e psychologue spécialisé·e en psychotrauma", mots: ['psychologue', 'psy', 'suivi', 'therapie', 'emdr', 'mon soutien psy', 'reconstruction', 'centre psychotraumatisme'] },
    { id: 'soutenir-proche', theme: 'Soutenir un proche', titre: "Comment soutenir un·e proche victime de violences ?", mots: ['proche', 'entourage', 'soutenir', 'aider', 'ami', 'famille', 'ecouter', 'croire'] },
    { id: 'domiciliation-adresse', theme: 'Procédure pénale', titre: "Votre adresse sur la plainte : comment la protéger", mots: ['adresse', 'domiciliation', 'plainte', 'representailles', 'avocat', 'tiers de confiance', 'anonymat', 'securite', 'domicile'] },
    { id: 'reflexes-preuves', theme: 'Procédure pénale', titre: "Les bons réflexes après une agression, avant toute démarche", mots: ['preuves', 'reflexes', 'agression', 'messages', 'captures', 'certificat medical', 'vetements', 'traces', 'urgences'] },
    { id: 'aide-juridictionnelle', theme: 'Droits & indemnisation', titre: "Financer son avocat : l'aide juridictionnelle et la protection juridique", mots: ['avocat', 'aide juridictionnelle', 'financer', 'protection juridique', 'assurance', 'honoraires', 'gratuit', 'frais', 'argent'] },
    { id: 'aide-urgence-caf', theme: 'Droits & indemnisation', titre: "L'aide d'urgence de la CAF pour les victimes de violences conjugales", mots: ['caf', 'aide urgence', 'violences conjugales', 'argent', 'hebergement', 'separation', 'conjoint', 'financiere', 'auuvc'] }
  ];

  var CONSEIL_DEFAUT = "Selon votre situation, plusieurs voies peuvent se compléter : la voie civile (comme l'ordonnance de protection) permet souvent d'être protégé·e rapidement, tandis que la voie pénale vise à faire reconnaître et sanctionner les faits. Vous pouvez les envisager ensemble, et rien ne vous oblige à choisir seul·e.";

  var form = document.getElementById('search-form');
  if (!form) return;
  var textarea = document.getElementById('search-input');
  var btn = document.getElementById('search-btn');
  var resultsBox = document.getElementById('search-results');

  function normaliser(t) {
    return (t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function scoreMotsCles(situation) {
    var s = normaliser(situation);
    var notes = ARTICLES.map(function (a) {
      var score = 0;
      a.mots.forEach(function (m) { if (s.indexOf(normaliser(m)) !== -1) score++; });
      return { a: a, score: score };
    });
    notes.sort(function (x, y) { return y.score - x.score; });
    var retenus = notes.filter(function (n) { return n.score > 0; }).slice(0, 5);
    if (retenus.length < 2) retenus = notes.slice(0, 3);
    return retenus.map(function (n) { return n.a.id; });
  }

  function construirePrompt(situation) {
    var liste = ARTICLES.map(function (a) {
      return '- id: ' + a.id + ' | thème: ' + a.theme + ' | titre: ' + a.titre + ' | mots-clés: ' + a.mots.join(', ');
    }).join('\n');
    return "Tu es l'assistant bienveillant d'une association française d'aide aux victimes de violences sexistes et sexuelles. " +
      "Voici les articles disponibles :\n" + liste + "\n\n" +
      "Une personne décrit sa situation : « " + situation + " ».\n" +
      "1) Rédige un court paragraphe « Ce qui est bon à savoir », bienveillant, sans jargon, sans jamais culpabiliser la personne, sans donner de diagnostic ni de conseil juridique définitif.\n" +
      "2) Sélectionne entre 2 et 5 articles VRAIMENT pertinents parmi la liste ci-dessus (par leur id exact).\n" +
      "Réponds UNIQUEMENT par du JSON valide, sans texte autour, au format exact : " +
      '{"conseil": "…", "articles": ["id1", "id2"]}';
  }

  function articleParId(id) {
    for (var i = 0; i < ARTICLES.length; i++) { if (ARTICLES[i].id === id) return ARTICLES[i]; }
    return null;
  }

  // Rendu 100 % via createElement + textContent : aucune insertion HTML brute.
  function afficher(conseil, ids) {
    resultsBox.textContent = '';

    var advice = document.createElement('div');
    advice.className = 'search-advice';
    var h3 = document.createElement('h3');
    h3.textContent = 'Ce qui est bon à savoir';
    var p = document.createElement('p');
    p.textContent = conseil || CONSEIL_DEFAUT;
    advice.appendChild(h3);
    advice.appendChild(p);
    resultsBox.appendChild(advice);

    var grid = document.createElement('div');
    grid.className = 'articles-grid';
    var vus = {};
    ids.forEach(function (id) {
      if (vus[id]) return; vus[id] = true;
      var a = articleParId(id);
      if (!a) return;
      var link = document.createElement('a');
      link.className = 'article-card';
      link.href = 'articles/' + a.id + '.html';
      var cat = document.createElement('span');
      cat.className = 'cat';
      cat.textContent = a.theme;
      var titre = document.createElement('h3');
      titre.textContent = a.titre;
      var lire = document.createElement('span');
      lire.className = 'meta';
      lire.textContent = "Lire l'article →";
      link.appendChild(cat);
      link.appendChild(titre);
      link.appendChild(lire);
      grid.appendChild(link);
    });
    resultsBox.appendChild(grid);
    resultsBox.setAttribute('tabindex', '-1');
    resultsBox.focus();
  }

  function parserReponse(txt) {
    try {
      var data = JSON.parse(txt);
      var ids = Array.isArray(data.articles) ? data.articles.filter(function (id) { return !!articleParId(id); }) : [];
      if (ids.length < 2) return null;
      return { conseil: typeof data.conseil === 'string' ? data.conseil : CONSEIL_DEFAUT, articles: ids };
    } catch (e) { return null; }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var situation = (textarea.value || '').trim();
    if (!situation) { textarea.focus(); return; }

    var libelle = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Recherche en cours…';

    function replier() {
      afficher(CONSEIL_DEFAUT, scoreMotsCles(situation));
    }

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: construirePrompt(situation) })
    })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        var parsed = data && typeof data.result === 'string' ? parserReponse(data.result.trim()) : null;
        if (parsed) { afficher(parsed.conseil, parsed.articles); }
        else { replier(); }
      })
      .catch(function () { replier(); })
      .then(function () {
        btn.disabled = false;
        btn.textContent = libelle;
      });
  });
})();
