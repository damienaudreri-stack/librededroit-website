(function () {
  var GA_ID = 'G-P9YFQ6P4E8';
  var CLE = 'ld-consent-analytics';

  function chargerGA() {
    if (window.ldGAChargee) return;
    window.ldGAChargee = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID);
  }

  function chargerCSS() {
    if (document.querySelector('link[href="assets/cookies.css"]')) return;
    var feuille = document.createElement('link');
    feuille.rel = 'stylesheet';
    feuille.href = 'assets/cookies.css';
    document.head.appendChild(feuille);
  }

  function afficherBandeau() {
    var banniere = document.createElement('div');
    banniere.id = 'ld-cookie-banner';
    banniere.setAttribute('role', 'dialog');
    banniere.setAttribute('aria-label', 'Consentement aux cookies');
    banniere.innerHTML =
      '<p>Nous utilisons Google Analytics pour mesurer la fréquentation du Site. Ces données ne seront collectées qu\'avec votre accord. <a href="politique-de-confidentialite.html" class="ld-lien-savoir-plus">En savoir plus</a>.</p>' +
      '<div class="ld-actions"><button type="button" class="ld-refuser">Refuser</button><button type="button" class="ld-accepter">Accepter</button></div>';
    document.body.appendChild(banniere);

    banniere.querySelector('.ld-accepter').addEventListener('click', function () {
      localStorage.setItem(CLE, 'accepted');
      chargerGA();
      banniere.remove();
    });
    banniere.querySelector('.ld-refuser').addEventListener('click', function () {
      localStorage.setItem(CLE, 'refused');
      banniere.remove();
    });
  }

  function ajouterLienGestion() {
    var pied = document.querySelector('footer');
    if (!pied) return;
    var lien = document.createElement('a');
    lien.href = '#';
    lien.className = 'ld-gerer-cookies';
    lien.textContent = 'Gérer les cookies';
    lien.addEventListener('click', function (e) {
      e.preventDefault();
      localStorage.removeItem(CLE);
      // Choix demandé explicitement : le bandeau réapparaît tout de suite après rechargement
      try { sessionStorage.setItem('ld-cookies-immediat', '1'); } catch (err) {}
      location.reload();
    });
    var conteneur = pied.querySelector('.footer-bottom') || pied.querySelector('.wrap') || pied;
    conteneur.appendChild(document.createTextNode(' · '));
    conteneur.appendChild(lien);
  }

  document.addEventListener('DOMContentLoaded', function () {
    chargerCSS();
    var choix = localStorage.getItem(CLE);
    if (choix === 'accepted') {
      chargerGA();
    } else if (choix !== 'refused') {
      // Le bandeau apparaît 15 secondes après l'arrivée sur le site (le délai
      // continue d'une page à l'autre pendant la visite). Aucun cookie de mesure
      // n'est déposé avant l'acceptation.
      var DELAI = 15000, maintenant = Date.now(), arrivee = maintenant, immediat = false;
      try {
        arrivee = parseInt(sessionStorage.getItem('ld-arrivee'), 10) || maintenant;
        sessionStorage.setItem('ld-arrivee', String(arrivee));
        immediat = sessionStorage.getItem('ld-cookies-immediat') === '1';
        sessionStorage.removeItem('ld-cookies-immediat');
      } catch (err) {}
      var reste = immediat ? 0 : Math.max(0, DELAI - (maintenant - arrivee));
      setTimeout(afficherBandeau, reste);
    }
    ajouterLienGestion();
  });
})();
