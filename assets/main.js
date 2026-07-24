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
    if (reduceMotion) { el.textContent = String(cible); return; }
    var duree = 1400, debut = null;
    function pas(ts) {
      if (!debut) debut = ts;
      var p = Math.min((ts - debut) / duree, 1);
      var val = Math.round(p * cible);
      el.textContent = String(val);
      if (p < 1) requestAnimationFrame(pas);
    }
    requestAnimationFrame(pas);
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

  // --- Simulateur de don ---
  var donButtons = document.querySelectorAll('.don-amount');
  if (donButtons.length) {
    var recapMontant = document.getElementById('don-recap-montant');
    var recapReel = document.getElementById('don-recap-reel');
    var donCta = document.getElementById('don-cta');
    function majDon(btn) {
      var montant = parseInt(btn.getAttribute('data-montant'), 10) || 0;
      var reel = Math.round(montant * 0.4);
      donButtons.forEach(function (b) { b.classList.remove('actif'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('actif');
      btn.setAttribute('aria-pressed', 'true');
      if (recapMontant) recapMontant.textContent = montant + ' €';
      if (recapReel) recapReel.textContent = reel + ' €';
      if (donCta) donCta.textContent = 'Faire un don de ' + montant + ' € →';
    }
    donButtons.forEach(function (btn) {
      btn.addEventListener('click', function () { majDon(btn); });
    });
    var defaut = document.querySelector('.don-amount[data-montant="50"]') || donButtons[0];
    if (defaut) majDon(defaut);
  }

  // --- Filtres articles (Ressources) ---
  var filterBtns = document.querySelectorAll('.filter-btn');
  if (filterBtns.length) {
    var cards = document.querySelectorAll('.article-card[data-cat]');
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cat = btn.getAttribute('data-filter');
        filterBtns.forEach(function (b) { b.classList.remove('actif'); });
        btn.classList.add('actif');
        cards.forEach(function (card) {
          var show = cat === 'all' || card.getAttribute('data-cat') === cat;
          card.style.display = show ? '' : 'none';
        });
      });
    });
  }
})();
