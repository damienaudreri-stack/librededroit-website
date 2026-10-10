#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generateur statique du site LibredeDroit.

Assemble un gabarit de tete (head + SEO), un gabarit de nav commun, un gabarit
de pied de page commun et le contenu propre a chaque page pour ecrire les
fichiers HTML finaux. Aucune dependance : bibliotheque standard uniquement.

  python3 scripts/build_site.py

Le script est idempotent : deux executations consecutives produisent des
fichiers identiques. Il tourne EN LOCAL pour produire les fichiers commites ;
il ne s'execute jamais sur Netlify au deploiement.
"""

import os
import re
import sys

BASE_URL = "https://librededroit.co"

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TPL = os.path.join(RACINE, "scripts", "templates")
CONTENU = os.path.join(RACINE, "scripts", "content")

sys.path.insert(0, CONTENU)
from articles import ARTICLES  # noqa: E402


def lire(chemin):
    with open(chemin, "r", encoding="utf-8") as f:
        return f.read()


def ecrire(chemin, contenu):
    os.makedirs(os.path.dirname(chemin), exist_ok=True)
    with open(chemin, "w", encoding="utf-8") as f:
        f.write(contenu)


def hash_court(chemin):
    """Hash de contenu (8 caracteres) utilise comme parametre ?v= pour forcer
    le navigateur a recharger un CSS/JS des qu'il change reellement, sans
    casser l'idempotence du build (le hash ne depend que du contenu)."""
    import hashlib
    with open(chemin, "rb") as f:
        return hashlib.md5(f.read()).hexdigest()[:8]


# --------------------------------------------------------------------------
# Donnees transverses
# --------------------------------------------------------------------------

PARTENAIRES = [
    ("Le Hibou", "https://www.instagram.com/lecercledeshiboux", "le-hibou.png"),
    ("Just'Act", "https://www.instagram.com/justact.bordeaux", "just-act.png"),
    ("Lysias, Bordeaux", "https://www.instagram.com/lysiasbordeaux", "lysias.png"),
    ("Le Club AES", "https://www.instagram.com/club_aes_bdx", "aes.png"),
    ("BDE Blue Lions Bordeaux", "https://www.instagram.com/bdebluelions", "blue-lions.png"),
    ("Réseau des Amis Européens", "https://www.instagram.com/reseaudesamiseuropeens", "rae.png"),
    ("Master Droit Pénal Approfondi, Bordeaux", "https://www.instagram.com/m2_dpa", "droit-penal-approfondi.png"),
    ("Journal « Le SCRUB »", "https://www.instagram.com/le.scrub", "le-scrub.png"),
    ("RES PUBLICA, Master Droit Public Approfondi", "https://www.instagram.com/respublica_bdx", "respublica.png"),
    ("Master Droit de la Vigne et du Vin, Bordeaux", "https://www.instagram.com/droitdebouchon", "droit-de-bouchon.png"),
    ("Master Ingénierie Juridique et Financière des Sociétés", "https://www.instagram.com/ijfsbordeaux", "ijfs.png"),
    ("La Kaz", "https://www.instagram.com/lakaz_bdx", "la-kaz.png"),
    ("La Tribune Montesquieu", "https://www.instagram.com/latribunemontesquieu", "la-tribune-montesquieu.png"),
]

TEMOIGNAGES_SENSI = [
    ("Sophie L.", "Professionnel", "J'ai appris à repérer des signaux que je laissais passer avant. Les mises en situation m'ont vraiment aidée à savoir quoi dire."),
    ("Karim B.", "Professionnel", "J'ai pu m'entraîner sur des cas concrets. Je sais maintenant comment réagir si un·e élève se confie à moi, et vers qui l'orienter."),
    ("Inès M.", "Étudiant", "J'ai enfin mis des mots sur le consentement, avec des exemples qui me parlent. Je regarde certaines situations différemment maintenant."),
    ("Thomas R.", "Professionnel", "J'ai pratiqué des mises en situation qui m'ont bousculé. J'en ressors avec des repères clairs sur ce que dit la loi."),
    ("Lucas D.", "Étudiant", "Je pensais connaître le sujet. J'ai réalisé tout ce que je laissais passer entre potes, sans même m'en rendre compte."),
    ("Awa F.", "Professionnel", "J'ai pu poser mes questions sans filtre. Je me sens enfin outillée pour agir si une situation se présente."),
    ("Camille P.", "Étudiant", "Les mises en situation m'ont permis de m'entraîner à réagir. J'en ressors plus vigilante face à ce qui m'entoure."),
    ("Nadia E.", "Professionnel", "J'ai appris à reconnaître les signaux faibles. Je sais désormais comment signaler une situation à risque."),
]

TEMOIGNAGES_ACCOMP = [
    ("Marie", "42 ans", "Victime de violences conjugales, Marie a été suivie au quotidien. Nos avocats partenaires l'ont accompagnée pour divorcer, se protéger et protéger ses enfants."),
    ("Chloé", "22 ans", "Sa plainte pour agression sexuelle avait été classée sans suite. Nous l'avons aidée à récupérer son dossier, et nos avocats partenaires ont engagé un recours en vue d'un procès et de la condamnation de son agresseur."),
    ("Yasmine", "19 ans", "Face à des violences intrafamiliales, Yasmine bénéficie d'un suivi psychologique régulier et d'une stratégie de protection mise en place directement avec elle, pour assurer sa sécurité au plus vite. Notre équipe reste à ses côtés à chaque étape."),
    ("Maylis", "25 ans", "Après un viol, Maylis a reçu une information juridique claire sur la suite de sa plainte, un suivi psychologique, et notre soutien dans l'attente de la décision sur les poursuites."),
]

URGENCES = [
    ("17", "Police secours", "Danger immédiat, 24h/24"),
    ("15", "SAMU", "Urgence médicale"),
    ("112", "Urgence européenne", "Depuis toute l'Europe"),
    ("114", "Urgence par SMS", "Sourds & malentendants"),
    ("3919", "Violences Femmes Info", "Anonyme & gratuit, 24h/24"),
    ("0 800 05 95 95", "Viols Femmes Info", "Collectif Féministe Contre le Viol"),
    ("3018", "Violences numériques", "Cyberharcèlement, gratuit"),
    ("116 006", "Aide aux victimes", "France Victimes, 7j/7"),
    ("119", "Enfance en danger", "Anonyme & gratuit, 24h/24"),
    ("3114", "Prévention du suicide", "Écoute 24h/24, gratuit"),
]

ASSOS = [
    ("CIDFF Gironde", "Information sur les droits des femmes et des familles, accompagnement juridique et social de proximité.", "https://gironde.cidff.info"),
    ("France Victimes", "Réseau national d'aide aux victimes : écoute, accompagnement et orientation gratuits partout en France.", "https://www.france-victimes.fr"),
    ("Planning Familial 33", "Écoute, information et orientation autour des sexualités et des violences faites aux femmes et aux minorités de genre.", "https://www.planning-familial.org"),
    ("La Maison des Femmes", "Accueil féministe fondé sur le respect, l'anonymat, la gratuité et la confidentialité.", "https://maisondesfemmes.net"),
    ("Les Orchidées Rouges", "Accompagnement des survivantes d'excision, de mariage forcé et des violences qui en découlent.", "https://lesorchideesrouges.org"),
    ("Écoute Violences Femmes Handicapées", "Soutien spécifique pour les femmes en situation de handicap face aux violences.", "https://ecoute-violences-femmes-handicapees.fr"),
]


# Bande de photos defilante de l'accueil (sous le hero), de droite a gauche.
# Dossier source des vraies photos (a recadrer/compresser puis copier dans
# assets/img/accueil/) : /Users/damienaudrerie/Documents/JARVIS/Photos site/Accueil - défilement/
# Une ligne = une photo : (nom de fichier relatif a assets/img/, texte alternatif).
# Fichier None = emplacement provisoire « Photo à venir ».
# (fichier dans assets/img/, largeur, hauteur, texte alternatif)
PHOTOS_ACCUEIL = [
    ("atelier-1.jpg", 1160, 672, "Atelier de sensibilisation LibredeDroit auprès d'étudiants"),
    ("accueil/photo-02.jpg", 560, 560, "Un bénévole échange avec des étudiants pendant un atelier en amphithéâtre"),
    ("accueil/photo-08.jpg", 997, 560, "Un entretien d'accompagnement avec des membres de LibredeDroit"),
    ("accueil/photo-05.jpg", 996, 560, "Un amphithéâtre d'étudiants pendant une intervention de LibredeDroit"),
    ("atelier-2.jpg", 824, 672, "Une bénévole échange avec des étudiants pendant un atelier de sensibilisation en amphithéâtre"),
    ("accueil/photo-06.jpg", 420, 560, "Le stand de LibredeDroit à la rencontre des étudiants"),
    ("accueil/photo-08.jpg", 997, 560, "Un entretien d'accompagnement avec des membres de LibredeDroit"),
    ("accueil/photo-07.jpg", 842, 560, "Une bénévole anime un échange avec des étudiants pendant un atelier"),
]


def esc(t):
    return (t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
             .replace('"', "&quot;"))


# --------------------------------------------------------------------------
# Fragments generes
# --------------------------------------------------------------------------

def bloc_partenaires():
    def item(nom, url, logo):
        return (
            '<a class="partner" href="{u}" target="_blank" rel="noopener noreferrer">'
            '<span class="plogo"><img src="assets/img/partenaires/{l}" alt="" loading="lazy"></span>{n}</a>'
        ).format(u=esc(url), n=esc(nom), l=esc(logo))
    liste = "".join(item(n, u, l) for n, u, l in PARTENAIRES)
    # Double pour un defilement infini fluide (translateX -50%). La copie est
    # masquee aux lecteurs d'ecran et sortie de l'ordre de tabulation ; sous
    # prefers-reduced-motion elle est retiree (classe dup) et la liste devient statique.
    copie = liste.replace('<a class="partner" ', '<a class="partner dup" aria-hidden="true" tabindex="-1" ')
    return liste + copie


# Bénévoles du bandeau défilant de Notre histoire (Damien et Zoé ont leurs fiches fixes au-dessus).
# Photo absente = None : portrait anonyme.
EQUIPE_BANDEAU = [
    ("Oriane Le Saëc", "Membre du pôle sensibilisation", "oriane-portrait.jpg"),
    ("Kamelya Harouach", "Membre du pôle sensibilisation", "kamelya-portrait.jpg"),
    ("Yassine Myassal", "Membre du pôle sensibilisation", "yassine-portrait.jpg"),
    ("Marie Gazeau", "Membre du pôle aide victimes et sensibilisation", "marie-portrait.jpg"),
    ("Maureen Simphor", "Membre du pôle aide victimes et sensibilisation", "maureen-portrait.jpg"),
    ("Pauline Willem-Dupau", "Membre du pôle sensibilisation", None),
    ("Lounes Belkacem", "Membre du pôle sensibilisation", None),
    ("Lia Troadec", "Membre du pôle sensibilisation", "lia-portrait.jpg"),
    ("Clara Lamouroux", "Membre du pôle sensibilisation", "clara-portrait.jpg"),
    ("Emma Bauzerand", "Membre du pôle communication", "emma-portrait.jpg"),
]


def bloc_equipe_bandeau():
    def item(nom, role, photo, cache):
        src = photo or "anonyme-portrait.svg"
        alt = "Portrait de " + nom if photo else "Portrait non communiqué"
        return (
            '<div class="team-card{d}"{h}><div class="team-card-photo">'
            '<img src="assets/img/equipe/{s}" alt="{a}"></div>'
            '<div class="team-card-info"><h3>{n}</h3><p class="role">{r}</p></div></div>'
        ).format(h=' aria-hidden="true"' if cache else "", d=" dup" if cache else "", s=src,
                 a="" if cache else esc(alt), n=esc(nom), r=esc(role))
    # Deuxième passage masqué aux lecteurs d'écran : il ne sert qu'à la boucle infinie.
    return ("".join(item(n, r, ph, False) for n, r, ph in EQUIPE_BANDEAU)
            + "".join(item(n, r, ph, True) for n, r, ph in EQUIPE_BANDEAU))


def boucle_defilante(items, rendre, minimum=10):
    """Piste de defilement infini (translateX -50%) : la liste reelle, puis des
    copies masquees aux lecteurs d'ecran (aria-hidden, classe dup) jusqu'a
    remplir au moins `minimum` elements par moitie, puis la moitie entiere
    recopiee. `rendre(item, cache)` produit le HTML d'un element."""
    n = max(1, -(-minimum // max(1, len(items))))  # arrondi superieur
    moitie = [rendre(it, False) for it in items]
    for _ in range(n - 1):
        moitie += [rendre(it, True) for it in items]
    copie = [rendre(it, True) for it in items] * n
    return "\n          ".join(moitie + copie)


SVG_PHOTO = ('<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5"/>'
             '<circle cx="9" cy="10" r="1.8"/><path d="M21 16l-5.5-5L6 19"/></svg>')


def bloc_photos_accueil():
    def item(photo, cache):
        fichier, larg, haut, alt = photo
        attrs = ' aria-hidden="true"' if cache else ""
        dup = " dup" if cache else ""
        if fichier:
            # Dimensions en attributs : la bande se mesure avant le chargement des images.
            return ('<figure class="bande-item{d}"{h}><img src="assets/img/{f}" width="{w}" height="{ht}" alt="{a}"></figure>'
                    ).format(d=dup, h=attrs, f=esc(fichier), w=larg, ht=haut, a="" if cache else esc(alt))
        return ('<figure class="bande-item bande-slot slot{d}"{h}>{svg}<span>Photo à venir</span></figure>'
                ).format(d=dup, h=attrs, svg=SVG_PHOTO)
    return boucle_defilante(PHOTOS_ACCUEIL, item, minimum=10)


def bloc_temoignages_defilants(temoignages):
    """Temoignages de l'accompagnement en defilement automatique lent (pause au
    survol et au focus). Copies de boucle masquees et hors tabulation."""
    def item(t, cache):
        nom, meta, texte = t
        return (
            '<figure class="quote-card tagged victime{d}"{h}><h3 class="q-name">{n} <span class="mark">&rdquo;</span></h3>'
            '<blockquote><p>{t}</p></blockquote><hr>'
            '<figcaption class="who"><span class="avatar etu">{i}</span><span class="age">{m}</span></figcaption></figure>'
        ).format(d=" dup" if cache else "", h=' aria-hidden="true" tabindex="-1"' if cache else "",
                 t=esc(texte), n=esc(nom), m=esc(meta), i=esc(nom[0]))
    return boucle_defilante(temoignages, item, minimum=8)


def bloc_avis_defilants(temoignages):
    """Avis d'ateliers (Sensibilisation) en defilement automatique lent, meme
    principe que les temoignages de l'accompagnement."""
    def item(t, cache):
        nom, meta, texte = t
        c = "pro" if meta == "Professionnel" else "etu"
        return (
            '<figure class="quote-card tagged{d}"{h}><span class="q-tag {c}">{m}</span>'
            '<blockquote><p>{t}</p></blockquote><hr>'
            '<figcaption class="who"><span class="avatar {c}">{i}</span>{n}</figcaption></figure>'
        ).format(d=" dup" if cache else "", h=' aria-hidden="true" tabindex="-1"' if cache else "",
                 t=esc(texte), n=esc(nom), m=esc(meta), c=c, i=esc(nom[0]))
    return boucle_defilante(temoignages, item, minimum=8)


# Bandeau d'appel aux dons commun à toutes les pages sauf la page Don.
# Le bouton mène directement au formulaire de don HelloAsso. Montants repris de la page Don.
IMPACTS_DON = [
    ("50 €", "la sensibilisation d'un groupe lors d'un atelier"),
    ("80 €", "un rendez-vous chez un·e psychologue pour une victime"),
    ("120 €", "une partie des frais d'avocat·e pour une victime"),
]


def bloc_bandeau_don():
    impacts = "".join(
        '<li class="don2-impact"><span class="don2-montant">{m}</span>'
        '<span class="don2-texte">{t}</span></li>'.format(m=esc(m), t=esc(t))
        for m, t in IMPACTS_DON)
    return (
        '<section class="section section-don" aria-labelledby="bandeau-don-titre">\n'
        '      <div class="wrap">\n'
        '        <div class="don2 reveal">\n'
        '          <div class="don2-texte-bloc">\n'
        '            <span class="kicker">Nous soutenir</span>\n'
        '            <h2 class="titre" id="bandeau-don-titre">Soutenez notre action.</h2>\n'
        '            <p class="lead">Chaque don finance nos ateliers de sensibilisation et l\'accompagnement gratuit des victimes.</p>\n'
        '            <p class="don2-actions"><a class="btn btn-dore btn-lg" href="https://www.helloasso.com/associations/libre-de-droit/formulaires/1" target="_blank" rel="noopener noreferrer">Faire un don <span class="fleche" aria-hidden="true">›</span></a>'
        '<a class="lien-fleche" href="https://www.helloasso.com/associations/libre-de-droit/adhesions/adherer" target="_blank" rel="noopener noreferrer">ou adhérer à l\'association <span class="fleche" aria-hidden="true">›</span></a></p>\n'
        '            <p class="don2-securite">Paiement sécurisé via HelloAsso</p>\n'
        '          </div>\n'
        '          <div class="don2-panneau">\n'
        '            <p class="don2-panneau-titre">Ce que permet votre don</p>\n'
        '            <ul class="don2-impacts">' + impacts + '</ul>\n'
        '          </div>\n'
        '        </div>\n'
        '      </div>\n'
        '    </section>')

def bloc_quotes(temoignages, tag=False, victime=False):
    def item(nom, meta, texte):
        if victime:
            return (
                '<figure class="quote-card tagged victime"><h3 class="q-name">{n} <span class="mark">&rdquo;</span></h3>'
                '<blockquote><p>{t}</p></blockquote><hr>'
                '<figcaption class="who"><span class="avatar etu">{i}</span><span class="age">{m}</span></figcaption></figure>'
            ).format(t=esc(texte), n=esc(nom), m=esc(meta), i=esc(nom[0]))
        if tag:
            classe_tag = "pro" if meta == "Professionnel" else "etu"
            return (
                '<figure class="quote-card tagged"><span class="q-tag {c}">{m}</span>'
                '<blockquote><p>{t}</p></blockquote><hr>'
                '<figcaption class="who"><span class="avatar {c}">{i}</span>{n}</figcaption></figure>'
            ).format(t=esc(texte), n=esc(nom), m=esc(meta), c=classe_tag, i=esc(nom[0]))
        return (
            '<figure class="quote-card"><blockquote><p>{t}</p></blockquote>'
            '<figcaption class="who">{n} <span>· {m}</span></figcaption></figure>'
        ).format(t=esc(texte), n=esc(nom), m=esc(meta))
    # Rangee a defilement manuel (scroll-snap) : une seule occurrence de chaque
    # temoignage, chacun dans un element de liste.
    return "\n          ".join('<li class="defile-item">' + item(n, m, t) + '</li>'
                              for n, m, t in temoignages)


def bloc_urgences():
    lignes = []
    for num, label, desc in URGENCES:
        tel = "tel:" + num.replace(" ", "")
        lignes.append(
            '<li><a class="urgence-card" href="{tel}"><span class="num">{n}</span>'
            '<span class="l">{l}</span><span class="d">{d}</span></a></li>'.format(
                tel=esc(tel), n=esc(num), l=esc(label), d=esc(desc)))
    # Grille statique : les numeros d'urgence restent toujours visibles et
    # lisibles (aucun defilement automatique).
    return "\n            ".join(lignes)


def bloc_assos():
    cartes = []
    for nom, desc, url in ASSOS:
        cartes.append(
            '<div class="asso-card"><h3>{n}</h3><p>{d}</p>'
            '<a class="card-link" href="{u}" target="_blank" rel="noopener noreferrer">Voir le site →</a></div>'.format(
                n=esc(nom), d=esc(desc), u=esc(url)))
    return "\n          ".join(cartes)


def bloc_articles_cards():
    cartes = []
    for a in ARTICLES:
        cartes.append(
            '<a class="article-card" data-cat="{cat}" data-theme="{theme_attr}" href="articles/{id}.html">'
            '<span class="cat">{badge}</span><h3>{titre}</h3><p>{extrait}</p>'
            '<span class="meta">{temps} de lecture · Lire →</span></a>'.format(
                cat=a["cat"], id=a["id"], theme_attr=esc(a["theme"]), badge=esc(a["badge"]),
                titre=esc(a["titre"]), extrait=esc(a["extrait"]), temps=esc(a["temps"])))
    cartes.append(
        '<a class="article-card cta-card" href="accompagnement.html#ld-contact-confidentiel">'
        '<span class="cta-icon" aria-hidden="true">📞</span>'
        '<span class="cat">Une question, un doute ? Parlons-en · 24h/24</span>'
        '<h3>Écrivez-nous en confidentialité</h3>'
        '<p>Un membre de notre équipe d\'accompagnement vous répond, avec douceur et discrétion.</p>'
        '<span class="meta">Nous contacter →</span></a>')
    return "\n          ".join(cartes)


# --------------------------------------------------------------------------
# Assemblage
# --------------------------------------------------------------------------

BASE = lire(os.path.join(TPL, "base.html"))
NAV = lire(os.path.join(TPL, "nav.html"))
FOOTER = lire(os.path.join(TPL, "footer.html"))
ARTICLE_TPL = lire(os.path.join(TPL, "article.html"))

ACTIFS = ["accueil", "sensi", "accomp", "histoire", "rejoindre", "don"]
GROUPE_APROPOS = ("histoire", "rejoindre")


def rendre_nav(root, actif):
    out = NAV.replace("{{root}}", root)
    for cle in ACTIFS:
        out = out.replace("{{a_" + cle + "}}", "actif" if cle == actif else "")
    out = out.replace("{{a_apropos_group}}", "actif" if actif in GROUPE_APROPOS else "")
    return out


def rendre_footer(root):
    return FOOTER.replace("{{root}}", root)


def rendre_page(root, actif, title, description, canonical, ogtype, contenu, scripts):
    out = BASE
    out = out.replace("{{title}}", esc(title))
    out = out.replace("{{description}}", esc(description))
    out = out.replace("{{canonical}}", canonical)
    out = out.replace("{{ogtype}}", ogtype)
    out = out.replace("{{root}}", root)
    out = out.replace("{{nav}}", rendre_nav(root, actif))
    out = out.replace("{{footer}}", rendre_footer(root))
    out = out.replace("{{v_css}}", V_CSS)
    out = out.replace("{{v_main}}", V_MAIN)
    out = out.replace("{{scripts}}", scripts)
    out = out.replace("{{content}}", contenu)
    out = out.replace("{{actif}}", actif)
    return out


V_CSS = hash_court(os.path.join(RACINE, "assets", "site.css"))
V_MAIN = hash_court(os.path.join(RACINE, "assets", "main.js"))
V_FORMS = hash_court(os.path.join(RACINE, "assets", "forms.js"))


PAGES = [
    {
        "fichier": "index.html", "actif": "accueil", "src": "accueil.html",
        "title": "LibredeDroit | Contre les violences sexistes et sexuelles, à Bordeaux",
        "description": "Association bordelaise de prévention par la sensibilisation et d'accompagnement juridique et psychologique des victimes de violences sexistes et sexuelles.",
        "loc": "/", "scripts": "",
    },
    {
        "fichier": "sensibilisation.html", "actif": "sensi", "src": "sensibilisation.html",
        "title": "Sensibilisation aux violences sexistes et sexuelles, ateliers | LibredeDroit",
        "description": "Nous concevons et animons des ateliers de prévention des violences sexistes et sexuelles, adaptés aux étudiants, professionnels et agents publics, partout en Gironde.",
        "loc": "/sensibilisation.html", "scripts": f'  <script src="assets/forms.js?v={V_FORMS}" defer></script>',
    },
    {
        "fichier": "accompagnement.html", "actif": "accomp", "src": "accompagnement.html",
        "title": "Accompagnement des victimes, aide juridique et psychologique | LibredeDroit",
        "description": "Un accompagnement confidentiel et gratuit pour toute personne victime de violences sexuelles, conjugales ou intrafamiliales : avocats et psychologues spécialisés à vos côtés.",
        "loc": "/accompagnement.html", "scripts": f'  <script src="assets/forms.js?v={V_FORMS}" defer></script>',
    },
    {
        "fichier": "notre-histoire.html", "actif": "histoire", "src": "notre-histoire.html",
        "title": "Notre histoire, notre association et notre engagement | LibredeDroit",
        "description": "LibredeDroit est une association loi 1901 née à Bordeaux, portée par une quinzaine de bénévoles, qui agit contre les violences sexistes et sexuelles, des causes aux conséquences.",
        "loc": "/notre-histoire.html", "scripts": "",
    },
    {
        "fichier": "nous-rejoindre.html", "actif": "rejoindre", "src": "nous-rejoindre.html",
        "title": "Nous rejoindre, devenir bénévole | LibredeDroit",
        "description": "LibredeDroit cherche de nouveaux bénévoles pour ses pôles sensibilisation, aide aux victimes, partenariats, communication et coordination. Aucune expérience requise, nous te formons.",
        "loc": "/nous-rejoindre.html", "scripts": f'  <script src="assets/forms.js?v={V_FORMS}" defer></script>',
    },
    {
        "fichier": "don.html", "actif": "don", "src": "don.html",
        "title": "Faire un don, soutenez notre action | LibredeDroit",
        "description": "Chaque don finance nos ateliers de sensibilisation et l'accompagnement gratuit des victimes de violences sexistes et sexuelles.",
        "loc": "/don.html", "scripts": "",
    },
]


def construire_pages():
    ecrits = []
    for p in PAGES:
        contenu = lire(os.path.join(CONTENU, p["src"]))
        contenu = contenu.replace("{{partenaires}}", bloc_partenaires())
        contenu = contenu.replace("{{temoignages_sensi}}", bloc_avis_defilants(TEMOIGNAGES_SENSI))
        contenu = contenu.replace("{{temoignages_accomp}}", bloc_temoignages_defilants(TEMOIGNAGES_ACCOMP))
        contenu = contenu.replace("{{photos_accueil}}", bloc_photos_accueil())
        contenu = contenu.replace("{{urgences}}", bloc_urgences())
        contenu = contenu.replace("{{equipe_bandeau}}", bloc_equipe_bandeau())
        contenu = contenu.replace("{{bandeau_don}}", bloc_bandeau_don())
        contenu = contenu.replace("{{articles_cards}}", bloc_articles_cards())
        contenu = contenu.replace("{{assos_cards}}", bloc_assos())
        canonical = BASE_URL + p["loc"]
        html = rendre_page("", p["actif"], p["title"], p["description"],
                           canonical, "website", contenu, p["scripts"])
        chemin = os.path.join(RACINE, p["fichier"])
        ecrire(chemin, html)
        ecrits.append(chemin)
    return ecrits


def construire_articles():
    ecrits = []
    for a in ARTICLES:
        corps = ARTICLE_TPL
        corps = corps.replace("{{theme}}", esc(a["theme"]))
        corps = corps.replace("{{titre}}", esc(a["titre"]))
        corps = corps.replace("{{temps}}", esc(a["temps"]))
        corps = corps.replace("{{corps}}", a["corps"].strip())
        canonical = BASE_URL + "/articles/" + a["id"] + ".html"
        title = a["titre"] + " | LibredeDroit"
        html = rendre_page("../", "accomp", title, a["extrait"],
                           canonical, "article", corps, "")
        chemin = os.path.join(RACINE, "articles", a["id"] + ".html")
        ecrire(chemin, html)
        ecrits.append(chemin)
    return ecrits


# --------------------------------------------------------------------------
# Pages legales : correction des polices + externalisation du CSS (CSP stricte)
# --------------------------------------------------------------------------

LEGALES = ["mentions-legales.html", "cgu.html", "politique-de-confidentialite.html"]

MAP_FONTS = [
    ("fonts/lora-400.woff2", "../fonts/spectral-400.woff2"),
    ("fonts/lora-700.woff2", "../fonts/spectral-700.woff2"),
    ("fonts/heebo-400.woff2", "../fonts/hanken-400.woff2"),
    ("fonts/heebo-700.woff2", "../fonts/hanken-700.woff2"),
]


def transformer_css_legal(css):
    for avant, apres in MAP_FONTS:
        css = css.replace(avant, apres)
    css = css.replace("'Lora'", "'Spectral'").replace("'Heebo'", "'Hanken Grotesk'")
    return css


def construire_legales():
    ecrits = []
    for nom in LEGALES:
        chemin = os.path.join(RACINE, nom)
        html = lire(chemin)
        base = nom[:-5]  # sans .html
        css_path = os.path.join(RACINE, "assets", base + ".css")

        tete, sep, reste = html.partition("</head>")
        if "<style>" in tete:
            # Extraire tout le CSS inline (les deux blocs <style>) puis l'externaliser.
            debut = tete.index("<style>")
            fin = tete.rindex("</style>")
            inner = tete[debut + len("<style>"):fin]
            inner = inner.replace("</style>", "").replace("<style>", "")
            css = transformer_css_legal(inner).strip() + "\n"
            ecrire(css_path, css)
            lien = '<link rel="stylesheet" href="assets/{b}.css">'.format(b=base)
            nouvelle_tete = tete[:debut] + lien + tete[fin + len("</style>"):]
            ecrire(chemin, nouvelle_tete + sep + reste)
            ecrits.append(chemin)
            ecrits.append(css_path)
        else:
            # Deja externalise : on regenere seulement le CSS a partir de la source
            # si besoin (idempotence) : rien a changer dans le HTML.
            pass
    return ecrits


# --------------------------------------------------------------------------
# SEO : sitemap
# --------------------------------------------------------------------------

def construire_sitemap():
    urls = []

    def bloc(loc, prio, freq="monthly"):
        return ("  <url>\n    <loc>{loc}</loc>\n    <changefreq>{f}</changefreq>\n"
                "    <priority>{p}</priority>\n  </url>").format(loc=loc, f=freq, p=prio)

    urls.append(bloc(BASE_URL + "/", "1.0", "weekly"))
    for p in PAGES[1:]:
        urls.append(bloc(BASE_URL + p["loc"], "0.8", "monthly"))
    for a in ARTICLES:
        urls.append(bloc(BASE_URL + "/articles/" + a["id"] + ".html", "0.6", "monthly"))
    for nom in LEGALES:
        urls.append(bloc(BASE_URL + "/" + nom, "0.3", "yearly"))

    xml = ('<?xml version="1.0" encoding="UTF-8"?>\n'
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
           + "\n".join(urls) + "\n</urlset>\n")
    chemin = os.path.join(RACINE, "sitemap.xml")
    ecrire(chemin, xml)
    return chemin


def main():
    pages = construire_pages()
    articles = construire_articles()
    legales = construire_legales()
    sitemap = construire_sitemap()
    total = len(pages) + len(articles)
    print("Pages principales :", len(pages))
    print("Pages articles    :", len(articles))
    print("Pages legales      :", "traitees" if legales else "deja externalisees")
    print("Sitemap           :", sitemap)
    print("Total fichiers HTML de contenu :", total)


if __name__ == "__main__":
    main()
