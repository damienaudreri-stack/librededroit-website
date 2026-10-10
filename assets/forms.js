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

  var EXTENSIONS = ['pdf', 'doc', 'docx', 'odt'];
  var TAILLE_MAX = 2 * 1024 * 1024;

  // Lit un fichier et renvoie son contenu en base64, sans le préfixe « data:...;base64, ».
  function lireEnBase64(fichier) {
    return new Promise(function (resoudre, rejeter) {
      var lecteur = new FileReader();
      lecteur.onload = function () {
        var res = String(lecteur.result || '');
        var i = res.indexOf('base64,');
        if (i === -1) { rejeter(new Error('lecture')); return; }
        resoudre(res.slice(i + 7));
      };
      lecteur.onerror = function () { rejeter(new Error('lecture')); };
      lecteur.readAsDataURL(fichier);
    });
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

      // Pièces jointes (formulaire de candidature) : contrôlées avant tout envoi.
      var entrees = [];
      var erreurFichier = '';
      form.querySelectorAll('input[type="file"][data-fichier]').forEach(function (input) {
        var f = input.files && input.files[0];
        if (!f || erreurFichier) return;
        var ext = (f.name.split('.').pop() || '').toLowerCase();
        if (f.name.indexOf('.') === -1 || EXTENSIONS.indexOf(ext) === -1) {
          erreurFichier = 'Le fichier « ' + f.name + ' » doit être au format PDF, Word ou OpenDocument.';
        } else if (f.size > TAILLE_MAX) {
          erreurFichier = 'Le fichier « ' + f.name + ' » dépasse 2 Mo.';
        } else if (f.size === 0) {
          erreurFichier = 'Le fichier « ' + f.name + ' » est vide.';
        } else {
          entrees.push({ libelle: input.getAttribute('data-fichier'), fichier: f });
        }
      });
      if (erreurFichier) {
        if (statut) { statut.classList.add('err'); statut.textContent = erreurFichier; }
        return;
      }

      if (btn) { btn.disabled = true; btn.textContent = 'Envoi en cours…'; }

      Promise.all(entrees.map(function (ent) {
        return lireEnBase64(ent.fichier).then(function (contenu) {
          return { libelle: ent.libelle, nom: ent.fichier.name, contenu: contenu };
        });
      }))
        .then(function (fichiers) {
          var donnees = { formulaire: type, champs: champs, piege: piege };
          // Sans pièce jointe, la requête reste strictement identique à l'existant.
          if (fichiers.length) donnees.fichiers = fichiers;
          return fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(donnees)
          });
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

  // Formulaire d'aide : le champ « prétexte SMS » n'apparaît et n'est
  // obligatoire que si la personne choisit d'être recontactée par SMS discret.
  // Le champ « numéro de téléphone » est obligatoire pour « Par téléphone » et
  // pour « Par SMS discret » (il faut un numéro pour envoyer le SMS).
  var recontact = document.getElementById('aide-recontact');
  var pretexteWrap = document.getElementById('aide-sms-pretexte-wrap');
  var pretexteInput = document.getElementById('aide-sms-pretexte');
  var telephoneWrap = document.getElementById('aide-telephone-wrap');
  var telephoneInput = document.getElementById('aide-telephone');
  if (recontact) {
    recontact.addEventListener('change', function () {
      var choix = valeurChamp(recontact);

      if (pretexteWrap && pretexteInput) {
        var smsChoisi = choix === 'Par SMS discret';
        pretexteWrap.hidden = !smsChoisi;
        pretexteInput.required = smsChoisi;
        if (!smsChoisi) pretexteInput.value = '';
      }

      if (telephoneWrap && telephoneInput) {
        var telChoisi = choix === 'Par téléphone' || choix === 'Par SMS discret';
        telephoneWrap.hidden = !telChoisi;
        telephoneInput.required = telChoisi;
        if (!telChoisi) telephoneInput.value = '';
      }
    });
  }
})();
