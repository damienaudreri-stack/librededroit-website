/* LibredeDroit — envoi des formulaires vers /.netlify/functions/contact. */
(function () {
  'use strict';

  var ENDPOINT = '/.netlify/functions/contact';

  function valeurChamp(el) {
    if (el.tagName === 'SELECT') {
      var opt = el.options[el.selectedIndex];
      // On envoie le LIBELLE de l'option choisie, jamais sa valeur technique.
      return opt ? opt.textContent.trim() : '';
    }
    return (el.value || '').trim();
  }

  function brancher(form) {
    var type = form.getAttribute('data-formulaire');
    var btn = form.querySelector('button[type="submit"]');
    var btnLibelle = btn ? btn.textContent : 'Envoyer';
    var statut = form.querySelector('.form-status');
    var succes = document.getElementById(form.getAttribute('data-succes'));

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (typeof form.checkValidity === 'function' && !form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Champ piege (honeypot) : rempli uniquement par les robots.
      var honeypot = form.querySelector('.honeypot-field');
      var piege = !!(honeypot && honeypot.value.trim());

      var champs = [];
      var elements = form.querySelectorAll('[data-label]');
      elements.forEach(function (el) {
        var v = valeurChamp(el);
        if (v) champs.push({ label: el.getAttribute('data-label'), valeur: v });
      });

      if (statut) { statut.textContent = ''; statut.classList.remove('err'); }
      if (btn) { btn.disabled = true; btn.textContent = 'Envoi en cours…'; }

      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formulaire: type, champs: champs, piege: piege })
      })
        .then(function (r) {
          if (r.status === 200) {
            if (succes) {
              form.style.display = 'none';
              succes.hidden = false;
              succes.setAttribute('tabindex', '-1');
              succes.focus();
            }
          } else {
            throw new Error('HTTP ' + r.status);
          }
        })
        .catch(function () {
          if (btn) { btn.disabled = false; btn.textContent = btnLibelle; }
          if (statut) {
            statut.classList.add('err');
            statut.textContent = "L'envoi n'a pas abouti. Merci de réessayer, ou de nous écrire directement à contact@librededroit.co.";
          }
        });
    });
  }

  document.querySelectorAll('form.js-contact-form').forEach(brancher);
})();
