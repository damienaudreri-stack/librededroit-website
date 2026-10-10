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
    // Le HTML porte les valeurs finales (lisibles sans JavaScript et par les
    // moteurs de recherche) ; on repart de 0 seulement si l'animation va jouer.
    if (!reduceMotion && 'IntersectionObserver' in window) {
      counters.forEach(function (el) { el.textContent = '0'; });
    }
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

  // --- Nav : compactage au defilement (hysteresis pour eviter le clignotement) ---
  var header = document.querySelector('.site-header');
  if (header) {
    var compact = false, tickNav = false;
    var majNav = function () {
      tickNav = false;
      var y = window.scrollY || window.pageYOffset;
      if (!compact && y > 40) { compact = true; header.classList.add('est-compact'); }
      else if (compact && y < 8) { compact = false; header.classList.remove('est-compact'); }
    };
    window.addEventListener('scroll', function () {
      if (!tickNav) { tickNav = true; requestAnimationFrame(majNav); }
    }, { passive: true });
    majNav();
  }

  // --- Barre d'action mobile : visible apres le hero, masquee quand un
  // formulaire de la page est a l'ecran (pour ne jamais gener la saisie). ---
  var barre = document.getElementById('cta-bar');
  if (barre) {
    var racine = document.documentElement;
    var montrer = function (oui) {
      barre.classList.toggle('est-visible', oui);
      racine.classList.toggle('cta-visible', oui);
    };
    if (!('IntersectionObserver' in window)) {
      montrer(true);
    } else {
      var premier = document.querySelector('main > :first-child');
      var heroVisible = !!premier;
      var formsVisibles = new Set();
      var majBarre = function () { montrer(!heroVisible && formsVisibles.size === 0); };
      if (premier) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (e) { heroVisible = e.isIntersecting; });
          majBarre();
        }).observe(premier);
      }
      var cibles = [];
      document.querySelectorAll('form.js-contact-form').forEach(function (f) {
        var bloc = f.closest('.form-card, .form-panel') || f;
        if (cibles.indexOf(bloc) === -1) cibles.push(bloc);
      });
      if (cibles.length) {
        var fo = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) formsVisibles.add(e.target); else formsVisibles.delete(e.target);
          });
          majBarre();
        });
        cibles.forEach(function (c) { fo.observe(c); });
      }
      majBarre();
    }
  }

  // --- Selecteur a onglets accessible (sans JS : blocs affiches les uns sous les autres) ---
  document.querySelectorAll('[data-onglets]').forEach(function (boite) {
    var liste = boite.querySelector('[role="tablist"]');
    if (!liste) return;
    var onglets = Array.prototype.slice.call(liste.querySelectorAll('[role="tab"]'));
    var panneaux = onglets.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
    if (panneaux.some(function (p) { return !p; })) return;
    panneaux.forEach(function (p, i) {
      p.setAttribute('role', 'tabpanel');
      p.setAttribute('aria-labelledby', onglets[i].id);
      p.setAttribute('tabindex', '0');
    });
    function choisir(i, focus) {
      onglets.forEach(function (t, j) {
        var actif = j === i;
        t.setAttribute('aria-selected', actif ? 'true' : 'false');
        t.tabIndex = actif ? 0 : -1;
        panneaux[j].hidden = !actif;
      });
      if (focus) onglets[i].focus();
    }
    onglets.forEach(function (t, i) {
      t.addEventListener('click', function () { choisir(i, false); });
      t.addEventListener('keydown', function (e) {
        var n = onglets.length, cible = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') cible = (i + 1) % n;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') cible = (i - 1 + n) % n;
        else if (e.key === 'Home') cible = 0;
        else if (e.key === 'End') cible = n - 1;
        if (cible !== null) { e.preventDefault(); choisir(cible, true); }
      });
    });
    function depuisAncre() {
      var id = window.location.hash.slice(1);
      var idx = -1;
      panneaux.forEach(function (p, j) { if (p.id === id) idx = j; });
      if (idx !== -1) { choisir(idx, false); boite.scrollIntoView(); return true; }
      return false;
    }
    liste.hidden = false;
    boite.classList.add('est-actif');
    if (!depuisAncre()) choisir(0, false);
    window.addEventListener('hashchange', depuisAncre);
  });

  // --- Rangees a defilement manuel : boutons precedent / suivant ---
  document.querySelectorAll('[data-defile]').forEach(function (bloc) {
    var piste = bloc.querySelector('.defile-piste');
    var commandes = bloc.querySelector('.defile-commandes');
    var prec = bloc.querySelector('[data-defile-prec]');
    var suiv = bloc.querySelector('[data-defile-suiv]');
    if (!piste || !commandes || !prec || !suiv) return;
    function pas() {
      var item = piste.querySelector('.defile-item');
      var largeur = item ? item.getBoundingClientRect().width + 18 : piste.clientWidth * 0.8;
      return Math.max(largeur, Math.floor(piste.clientWidth / largeur) * largeur);
    }
    function maj() {
      var max = piste.scrollWidth - piste.clientWidth;
      commandes.hidden = max <= 2;
      prec.disabled = piste.scrollLeft <= 2;
      suiv.disabled = piste.scrollLeft >= max - 2;
    }
    function aller(sens) {
      piste.scrollBy({ left: sens * pas(), behavior: reduceMotion ? 'auto' : 'smooth' });
    }
    prec.addEventListener('click', function () { aller(-1); });
    suiv.addEventListener('click', function () { aller(1); });
    var tick = false;
    piste.addEventListener('scroll', function () {
      if (!tick) { tick = true; requestAnimationFrame(function () { tick = false; maj(); }); }
    }, { passive: true });
    window.addEventListener('resize', maj);
    maj();
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

  // --- Fondements interactifs (Sensibilisation) : clic, fleches clavier, et
  // defilement automatique toutes les 6 s. Une minuterie fait avancer les onglets
  // et relance la barre doree a chaque etape ; seule la sortie d'ecran met
  // minuterie ET barre en pause ensemble (reprise la ou elles en etaient).
  // Arret definitif des que la personne choisit un onglet. Coupe si mouvement reduit.
  // Sans JS : les 4 blocs restent affiches les uns sous les autres.
  document.querySelectorAll('[data-temps]').forEach(function (boite) {
    var onglets = Array.prototype.slice.call(boite.querySelectorAll('[role="tab"]'));
    var panneaux = onglets.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
    var DUREE = 6000, actif = 0, choisi = false;
    var minuteur = null, reste = DUREE, debut = 0, survol = false, visible = false;
    var calme = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    boite.classList.add('temps-js');
    function montrer(i, focus) {
      actif = i;
      onglets.forEach(function (t, j) {
        var on = j === i;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        panneaux[j].hidden = !on;
      });
      if (focus) onglets[i].focus();
    }
    function relancerBarre() {
      onglets.forEach(function (t) { t.classList.remove('en-cours'); });
      if (choisi || calme) return;
      var b = onglets[actif].querySelector('.temps-barre');
      if (b) void b.getBoundingClientRect(); // repart de zero
      onglets[actif].classList.add('en-cours');
    }
    function enPause() { return survol || !visible; }
    function planifier() {
      clearTimeout(minuteur); minuteur = null;
      if (choisi || calme || enPause()) return;
      debut = Date.now();
      minuteur = setTimeout(function () {
        montrer((actif + 1) % onglets.length);
        reste = DUREE;
        relancerBarre();
        planifier();
      }, reste);
    }
    function suspendre() {
      if (minuteur) { clearTimeout(minuteur); minuteur = null; reste = Math.max(0, reste - (Date.now() - debut)); }
      boite.classList.add('temps-pause');
    }
    function reprendre() {
      if (enPause()) return;
      boite.classList.remove('temps-pause');
      if (!onglets[actif].classList.contains('en-cours')) { reste = DUREE; relancerBarre(); }
      planifier();
    }
    function choisir(i, focus) {
      choisi = true; clearTimeout(minuteur); minuteur = null;
      montrer(i, focus); relancerBarre();
    }
    onglets.forEach(function (t, i) {
      t.addEventListener('click', function () { choisir(i); });
      t.addEventListener('keydown', function (e) {
        var n = onglets.length, c = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') c = (i + 1) % n;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') c = (i - 1 + n) % n;
        else if (e.key === 'Home') c = 0;
        else if (e.key === 'End') c = n - 1;
        if (c !== null) { e.preventDefault(); choisir(c, true); }
      });
    });
    // Pas de pause au survol : la barre continue meme souris sur les cadres.
    montrer(0);
    boite.classList.add('temps-pause');
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          visible = e.isIntersecting;
          if (visible) reprendre(); else suspendre();
        });
      }, { threshold: 0.35 }).observe(boite);
    } else { visible = true; reprendre(); }
  });

  // --- Nous rejoindre : « Candidater à ce poste » présélectionne le poste dans le formulaire ---
  // L'ancre #candidature fait ensuite défiler la page (fonctionne aussi sans JS).
  var selectPoste = document.getElementById('cand-poste');
  if (selectPoste) {
    document.querySelectorAll('a[data-poste]').forEach(function (lien) {
      lien.addEventListener('click', function () {
        var valeur = lien.getAttribute('data-poste');
        var existe = Array.prototype.some.call(selectPoste.options, function (o) { return o.value === valeur; });
        if (!existe) return;
        selectPoste.value = valeur;
        selectPoste.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
  }
})();
