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

  function afficherBandeau() {
    var style = document.createElement('style');
    style.textContent =
      '#ld-cookie-banner{position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#1B1B4D;color:#FCFAF5;padding:18px 24px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;font-family:"Hanken Grotesk",system-ui,-apple-system,BlinkMacSystemFont,sans-serif;font-size:15px;box-shadow:0 -4px 20px rgba(0,0,0,.18);}' +
      '#ld-cookie-banner p{margin:0;max-width:640px;line-height:1.5;}' +
      '#ld-cookie-banner .ld-actions{display:flex;gap:10px;flex-shrink:0;}' +
      '#ld-cookie-banner button{font-family:inherit;font-weight:600;font-size:14px;padding:11px 20px;border-radius:999px;border:1px solid transparent;cursor:pointer;transition:transform .15s ease,box-shadow .15s ease;}' +
      '#ld-cookie-banner .ld-accepter{background:#C99A3F;color:#3a2c07;}' +
      '#ld-cookie-banner .ld-accepter:hover{box-shadow:0 8px 20px rgba(201,154,63,.3);}' +
      '#ld-cookie-banner .ld-refuser{background:transparent;color:#FCFAF5;border-color:#FCFAF5;}' +
      '#ld-cookie-banner .ld-refuser:hover{background:rgba(255,255,255,.1);}';
    document.head.appendChild(style);

    var banniere = document.createElement('div');
    banniere.id = 'ld-cookie-banner';
    banniere.setAttribute('role', 'dialog');
    banniere.setAttribute('aria-label', 'Consentement aux cookies');
    banniere.innerHTML =
      '<p>Nous utilisons Google Analytics pour mesurer la fréquentation du Site. Ces données ne seront collectées qu\'avec votre accord. <a href="politique-de-confidentialite.html" style="color:#FCFAF5;text-decoration:underline;">En savoir plus</a>.</p>' +
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
    lien.style.marginLeft = '8px';
    lien.addEventListener('click', function (e) {
      e.preventDefault();
      localStorage.removeItem(CLE);
      location.reload();
    });
    var conteneur = pied.querySelector('.footer-bottom') || pied.querySelector('.wrap') || pied;
    conteneur.appendChild(document.createTextNode(' · '));
    conteneur.appendChild(lien);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var choix = localStorage.getItem(CLE);
    if (choix === 'accepted') {
      chargerGA();
    } else if (choix !== 'refused') {
      afficherBandeau();
    }
    ajouterLienGestion();
  });
})();
