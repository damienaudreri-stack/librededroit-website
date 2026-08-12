/* LibredeDroit — interactions communes, sans dependance externe. */
(function () {
  'use strict';

  // --- Sortie rapide (securite victimes) : redirection immediate, sans confirmation ---
  function quickExit() {
    window.location.replace('https://www.google.com/search?q=meteo');
  }
  var exitBtn = document.getElementById('quick-exit');
  if (exitBtn) {
    exitBtn.addEventListener('click', quickExit);
  }
  // Touche Echap = sortie rapide egalement.
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') quickExit();
  });

  // --- Menu mobile ---
  var burger = document.getElementById('burger');
  var mobileMenu = document.getElementById('mobile-menu');
  if (burger && mobileMenu) {
    burger.addEventListener('click', function () {
      var ouvert = mobileMenu.classList.toggle('ouvert');
      burger.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
    });
  }

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Apparition au scroll ---
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      reveals.forEach(function (el) { el.classList.add('visible'); });
    } else {
      var ro = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            ro.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      reveals.forEach(function (el) { ro.observe(el); });
    }
  }

  // --- Compteurs animes ---
  var counters = document.querySelectorAll('[data-count]');
  function runCount(el) {
    var cible = parseInt(el.getAttribute('data-count'), 10) || 0;
    var plus = el.hasAttribute('data-count-plus');
    var suffixe = el.getAttribute('data-count-suffix') || '';
    var texteFinal = (plus ? '+ de ' : '') + cible.toLocaleString('fr-FR') + suffixe;
    if (reduceMotion) { el.textContent = texteFinal; return; }

    function afficher(v, estFinal) {
      el.textContent = estFinal ? texteFinal : v.toLocaleString('fr-FR') + suffixe;
    }

    // 5 derniers chiffres affichés un par un, 0,5s d'intervalle
    function phaseLente(v) {
      if (v >= cible) { afficher(cible, true); return; }
      afficher(v, false);
      setTimeout(function () { phaseLente(v + 1); }, 500);
    }

    var seuil = Math.max(cible - 5, 0);
    if (seuil <= 0) { phaseLente(0); return; }

    // Montee rapide jusqu'au seuil, puis relais vers la phase lente
    var duree = Math.min(900 + Math.sqrt(seuil) * 5, 2200), debut = null;
    function phaseRapide(ts) {
      if (!debut) debut = ts;
      var p = Math.min((ts - debut) / duree, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(eased * seuil);
      if (p < 1) {
        afficher(val, false);
        requestAnimationFrame(phaseRapide);
      } else {
        phaseLente(seuil);
      }
    }
    requestAnimationFrame(phaseRapide);
  }
  if (counters.length) {
    if (!('IntersectionObserver' in window)) {
      counters.forEach(runCount);
    } else {
      var co = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { runCount(entry.target); co.unobserve(entry.target); }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { co.observe(el); });
    }
  }

  // --- Effet machine a ecrire ---
  var typeEls = document.querySelectorAll('[data-type]');
  typeEls.forEach(function (el) {
    var texte = el.getAttribute('data-type') || '';
    if (reduceMotion) { el.textContent = texte; return; }
    el.textContent = '';
    var caret = document.createElement('span');
    caret.className = 'caret';
    caret.setAttribute('aria-hidden', 'true');
    caret.style.height = '0.9em';
    el.appendChild(caret);
    var i = 0;
    function taper() {
      if (i <= texte.length) {
        caret.insertAdjacentText('beforebegin', texte.charAt(i - 1) || '');
        i++;
        setTimeout(taper, 55);
      }
    }
    setTimeout(taper, 300);
  });

  // --- Filtres articles (Ressources) : catégorie + thème ---
  var catBtns = document.querySelectorAll('[data-filter]');
  var themeBtns = document.querySelectorAll('[data-theme-filter]');
  if (catBtns.length) {
    var cards = document.querySelectorAll('.article-card[data-cat]');

    function appliquerFiltres() {
      var catActive = document.querySelector('[data-filter].actif');
      var themeActive = document.querySelector('[data-theme-filter].actif');
      var cat = catActive ? catActive.getAttribute('data-filter') : 'all';
      var theme = themeActive ? themeActive.getAttribute('data-theme-filter') : 'all';
      cards.forEach(function (card) {
        var okCat = cat === 'all' || card.getAttribute('data-cat') === cat;
        var okTheme = theme === 'all' || card.getAttribute('data-theme') === theme;
        card.style.display = (okCat && okTheme) ? '' : 'none';
      });
    }

    catBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cat = btn.getAttribute('data-filter');
        catBtns.forEach(function (b) { b.classList.remove('actif'); });
        btn.classList.add('actif');
        themeBtns.forEach(function (tb) {
          tb.classList.remove('actif');
          if (tb.getAttribute('data-theme-filter') === 'all') tb.classList.add('actif');
          var cats = (tb.getAttribute('data-cats') || '').split(',');
          tb.style.display = cats.indexOf(cat) !== -1 ? '' : 'none';
        });
        appliquerFiltres();
      });
    });

    themeBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        themeBtns.forEach(function (b) { b.classList.remove('actif'); });
        btn.classList.add('actif');
        appliquerFiltres();
      });
    });
  }
})();
