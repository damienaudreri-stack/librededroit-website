# -*- coding: utf-8 -*-
"""Donnees des 14 articles juridiques de LibredeDroit.

Ajouter un article = ajouter une entree a la liste ARTICLES ci-dessous.
Le script build_site.py genere automatiquement la page articles/<id>.html
et l'inclut dans la liste de la page Ressources et le sitemap.

Chaque article :
  id      : slug (nom du fichier + URL)
  theme   : theme affiche (doit rester coherent avec assets/search.js)
  cat     : 'droit' ou 'psy' (filtre de la page Ressources)
  titre   : titre H1
  extrait : meta description (unique)
  temps   : temps de lecture affiche
  corps   : corps HTML de l'article
"""

ARTICLES = [
    {
        "id": "types-violences",
        "theme": "Types de violences",
        "cat": "droit",
        "titre": "Outrage sexiste, agression, viol : de quoi parle-t-on ?",
        "extrait": "Les mots du droit ont un sens précis. Comprendre les qualifications aide à savoir de quoi l'on parle et quels recours existent.",
        "temps": "5 min",
        "corps": """
<p>Mettre un mot juste sur ce que l'on a vécu n'est pas anodin : chaque qualification correspond à une infraction distincte, avec ses propres règles. En voici les principales, des plus « visibles » aux plus graves.</p>
<h2>L'outrage sexiste</h2>
<p>Imposer à une personne des propos ou comportements à connotation sexuelle ou sexiste qui portent atteinte à sa dignité ou créent une situation intimidante. C'est une contravention ou un délit selon les circonstances.</p>
<h2>Le harcèlement sexuel</h2>
<p>Des propos ou comportements à connotation sexuelle répétés, ou une forme de pression grave même non répétée, dans un but sexuel. Il est puni y compris au travail.</p>
<h2>Agression sexuelle et viol</h2>
<p>L'agression sexuelle est un contact sexuel imposé sans consentement. Le viol est un acte de pénétration ou bucco-génital imposé. Tous deux sont des crimes ou délits, caractérisés par l'absence de consentement — jamais par l'absence de résistance de la victime.</p>
<div class="article-note"><p>Quelle que soit la qualification, vous n'avez pas à la déterminer seul·e. Nous vous aidons à y voir clair et à être orienté·e vers le bon interlocuteur.</p></div>
""",
    },
    {
        "id": "porter-plainte",
        "theme": "Procédure pénale",
        "cat": "droit",
        "titre": "Porter plainte : comment ça se passe, étape par étape",
        "extrait": "Où déposer, ce qu'on vous demande, ce qu'il se passe ensuite. Un repère clair pour aborder la démarche sans appréhension.",
        "temps": "6 min",
        "corps": """
<p>Porter plainte, c'est signaler officiellement à la justice une infraction dont vous avez été victime. Cela déclenche une enquête. Ce n'est jamais une obligation, et vous pouvez le faire à votre rythme — mais connaître le déroulé aide souvent à se sentir moins démuni·e.</p>
<h2>Où déposer plainte ?</h2>
<ul>
  <li>Dans n'importe quel commissariat ou gendarmerie, quel que soit le lieu des faits.</li>
  <li>Directement auprès du procureur de la République, par courrier adressé au tribunal judiciaire.</li>
  <li>Une pré-plainte en ligne est possible pour préparer le rendez-vous, mais elle ne remplace pas le dépôt sur place.</li>
</ul>
<div class="article-note"><p>Les forces de l'ordre ne peuvent pas refuser d'enregistrer votre plainte. Si on vous oriente vers une simple main courante alors que vous souhaitez porter plainte, vous êtes en droit d'insister.</p></div>
<h2>Ce qu'il se passe pendant le dépôt</h2>
<p>Un·e agent recueille votre récit dans un procès-verbal. Vous pouvez demander à être entendu·e par une personne formée, à huis clos, et être accompagné·e d'une personne de confiance ou d'un·e avocat·e. Prenez le temps qu'il vous faut : vous n'avez pas à tout dire d'un coup ni à tout justifier.</p>
<h2>Plainte ou main courante ?</h2>
<p>La main courante ne fait que dater une déclaration : elle ne déclenche pas d'enquête. La plainte, elle, saisit la justice. Pour des faits de violences, c'est généralement la plainte qui permet d'agir.</p>
""",
    },
    {
        "id": "classement-sans-suite",
        "theme": "Procédure pénale",
        "cat": "droit",
        "titre": "Plainte classée sans suite : quels recours ?",
        "extrait": "Un classement n'est pas la fin du chemin. Trois voies existent pour faire réexaminer votre affaire.",
        "temps": "5 min",
        "corps": """
<p>Recevoir un avis de classement sans suite est douloureux et peut donner le sentiment de ne pas avoir été cru·e. Ce n'est pourtant pas un jugement sur la réalité des faits : c'est une décision du procureur, qui peut être contestée.</p>
<h2>Comprendre le motif</h2>
<p>L'avis de classement indique un motif (auteur non identifié, infraction insuffisamment caractérisée…). Le connaître est essentiel pour choisir la suite. Vous pouvez en demander le détail.</p>
<h2>Vos trois recours</h2>
<ul>
  <li>Le recours auprès du procureur général : demander un réexamen de la décision.</li>
  <li>La plainte avec constitution de partie civile, auprès d'un juge d'instruction, qui oblige l'ouverture d'une information judiciaire.</li>
  <li>La citation directe, pour porter directement l'affaire devant le tribunal lorsque les faits et l'auteur sont établis.</li>
</ul>
<div class="article-note"><p>Ces démarches comportent des délais et des conditions. Un·e avocat·e — que nous pouvons vous aider à trouver — sécurise le choix de la bonne voie.</p></div>
""",
    },
    {
        "id": "prescription",
        "theme": "Procédure pénale",
        "cat": "droit",
        "titre": "Les délais de prescription des violences sexuelles",
        "extrait": "Combien de temps avez-vous pour agir ? Les délais sont longs, et particuliers pour les faits subis pendant l'enfance.",
        "temps": "5 min",
        "corps": """
<p>La prescription est le délai au-delà duquel une infraction ne peut plus être poursuivie. Pour les violences sexuelles, ces délais ont été allongés et comportent des règles protectrices, en particulier pour les mineur·es.</p>
<h2>Le principe du point de départ</h2>
<p>Pour les victimes mineures au moment des faits, le délai ne commence à courir qu'à partir de leur majorité. Une personne agressée enfant dispose donc d'un délai qui démarre à ses 18 ans.</p>
<h2>La prescription glissante</h2>
<p>Si une même personne commet de nouvelles violences sexuelles sur une autre victime mineure, le délai de prescription des faits anciens peut être prolongé jusqu'à celui des faits les plus récents. Une règle pensée pour les auteurs en série.</p>
<div class="article-note"><p>Les délais évoluent régulièrement et dépendent de la qualification exacte des faits. Ne renoncez jamais en supposant que « c'est trop tard » : faites vérifier votre situation.</p></div>
""",
    },
    {
        "id": "droits-victime",
        "theme": "Droits & indemnisation",
        "cat": "droit",
        "titre": "Vos droits en tant que victime pendant la procédure",
        "extrait": "Information, accompagnement, protection, réparation : ce que la loi vous garantit à chaque étape.",
        "temps": "4 min",
        "corps": """
<p>Être victime, c'est avoir des droits — pas seulement subir une procédure. En voici les principaux, valables tout au long du parcours judiciaire.</p>
<ul>
  <li>Être informé·e de l'avancée de l'enquête et des décisions prises.</li>
  <li>Être accompagné·e d'un·e avocat·e, avec une aide juridictionnelle selon vos ressources.</li>
  <li>Bénéficier d'un soutien psychologique et de l'aide d'une association de victimes.</li>
  <li>Demander réparation du préjudice subi en vous constituant partie civile.</li>
  <li>Être protégé·e (mesures d'éloignement, anonymisation de l'adresse, etc.).</li>
</ul>
<div class="article-note"><p>L'aide juridictionnelle peut couvrir tout ou partie des frais d'avocat. Nous vous aidons à constituer le dossier.</p></div>
""",
    },
    {
        "id": "procedure-civile",
        "theme": "Procédure civile",
        "cat": "droit",
        "titre": "L'ordonnance de protection et les recours au civil",
        "extrait": "Au-delà du pénal, le juge civil peut protéger rapidement et réparer le préjudice. Un levier souvent méconnu.",
        "temps": "5 min",
        "corps": """
<p>La voie pénale n'est pas la seule. Le juge civil peut intervenir vite pour vous protéger, indépendamment d'une plainte, et statuer sur la réparation du préjudice.</p>
<h2>L'ordonnance de protection</h2>
<p>Délivrée par le juge aux affaires familiales, elle peut, en quelques jours, interdire à l'auteur de vous approcher ou de vous contacter, statuer sur le logement et, le cas échéant, sur les enfants. Elle ne nécessite pas de plainte préalable.</p>
<ul>
  <li>Interdiction d'entrer en contact ou de paraître en certains lieux.</li>
  <li>Attribution du logement à la victime.</li>
  <li>Mesures relatives aux enfants et à la pension.</li>
</ul>
<h2>La réparation du préjudice</h2>
<p>Vous pouvez demander des dommages-intérêts, soit en vous constituant partie civile au pénal, soit devant le juge civil. La CIVI (commission d'indemnisation des victimes) peut aussi intervenir.</p>
<div class="article-note"><p>Ces démarches se mènent idéalement avec un·e avocat·e. Nous vous aidons à en trouver un·e et à monter le dossier d'aide juridictionnelle.</p></div>
""",
    },
    {
        "id": "psychotraumatisme",
        "theme": "Comprendre le trauma",
        "cat": "psy",
        "titre": "Comprendre le psychotraumatisme et la mémoire traumatique",
        "extrait": "Pourquoi le souvenir revient par flashs, pourquoi le corps réagit seul : des réactions normales à un événement anormal.",
        "temps": "6 min",
        "corps": """
<p>Face à un événement qui menace l'intégrité, le cerveau peut être débordé. Les souvenirs ne s'enregistrent alors pas normalement : ils restent « bruts », non digérés. C'est ce qu'on appelle la mémoire traumatique.</p>
<h2>Des symptômes qui ont un sens</h2>
<ul>
  <li>Reviviscences : flashs, cauchemars, sensations qui ramènent brutalement à l'événement.</li>
  <li>Évitement : fuir les lieux, personnes ou pensées qui rappellent les faits.</li>
  <li>Hypervigilance : sursauts, tension permanente, sommeil perturbé.</li>
  <li>Dissociation : sentiment d'être déconnecté·e de soi ou de la réalité.</li>
</ul>
<p>Ces réactions ne sont pas un signe de faiblesse ni de folie : ce sont des mécanismes de survie. Elles peuvent apparaître longtemps après les faits.</p>
<div class="article-note"><p>La mémoire traumatique se soigne. Des prises en charge spécialisées (psychothérapie du psychotrauma, EMDR…) permettent de retraiter ces souvenirs.</p></div>
""",
    },
    {
        "id": "sideration",
        "theme": "Comprendre le trauma",
        "cat": "psy",
        "titre": "La sidération : pourquoi on ne réagit pas toujours sur le moment",
        "extrait": "Ne pas avoir crié, ni fui, ni dit non n'enlève rien à la gravité de ce que vous avez vécu.",
        "temps": "4 min",
        "corps": """
<p>Beaucoup de victimes se reprochent de « ne pas avoir réagi ». La sidération explique ce figement : devant un danger extrême, le cerveau peut court-circuiter et imposer l'immobilité, indépendamment de la volonté.</p>
<h2>Un réflexe, pas un choix</h2>
<p>La sidération, parfois suivie de dissociation, est une réponse neurobiologique automatique. On ne la décide pas. L'absence de réaction n'est jamais un consentement, et ne diminue en rien la responsabilité de l'auteur.</p>
<div class="article-note"><p>Si vous portez de la culpabilité à ce sujet, en parler à un·e professionnel·le aide à déposer ce poids. Vous n'avez rien fait de mal.</p></div>
""",
    },
    {
        "id": "trouver-psy",
        "theme": "Se reconstruire",
        "cat": "psy",
        "titre": "Trouver un·e psychologue spécialisé·e en psychotrauma",
        "extrait": "Vers qui se tourner, comment reconnaître une prise en charge adaptée, et les dispositifs qui peuvent la financer.",
        "temps": "5 min",
        "corps": """
<p>Tous les professionnels ne sont pas formés au psychotraumatisme. Choisir une prise en charge spécialisée change beaucoup la qualité de l'accompagnement.</p>
<h2>Où chercher</h2>
<ul>
  <li>Les Centres régionaux du psychotraumatisme, présents en Nouvelle-Aquitaine.</li>
  <li>Les associations spécialisées (CIDFF, maisons des femmes, France Victimes).</li>
  <li>Les psychologues libéraux formés à l'EMDR ou aux thérapies du trauma.</li>
</ul>
<h2>Comment financer</h2>
<p>Certaines consultations sont gratuites en association ou en centre. Le dispositif « Mon soutien psy » et certaines mutuelles peuvent prendre en charge des séances en libéral.</p>
<div class="article-note"><p>Nous orientons chaque personne vers le·la professionnel·le le plus adapté à sa situation, et restons en lien tout du long.</p></div>
""",
    },
    {
        "id": "soutenir-proche",
        "theme": "Soutenir un proche",
        "cat": "psy",
        "titre": "Comment soutenir un·e proche victime de violences ?",
        "extrait": "Être là sans s'imposer, croire sans enquêter, accompagner sans décider à sa place : quelques repères pour l'entourage.",
        "temps": "4 min",
        "corps": """
<p>L'entourage joue un rôle déterminant dans le rétablissement. Quelques attitudes simples font une vraie différence — et certaines, à éviter, peuvent blesser malgré de bonnes intentions.</p>
<h2>Ce qui aide</h2>
<ul>
  <li>Croire la personne et le lui dire, sans exiger de preuves ni de détails.</li>
  <li>Respecter son rythme et ses choix, y compris celui de ne pas porter plainte.</li>
  <li>Rappeler que la responsabilité est celle de l'auteur, jamais la sienne.</li>
  <li>Proposer une aide concrète (accompagner à un rendez-vous, chercher un contact).</li>
</ul>
<h2>Ce qui peut blesser</h2>
<p>Minimiser, presser de « tourner la page », poser des questions qui ressemblent à un interrogatoire, ou décider à sa place. Soutenir, c'est accompagner — pas diriger.</p>
<div class="article-note"><p>Les proches aussi peuvent être affecté·es. Vous pouvez nous contacter pour être conseillé·e sur la bonne posture, ou simplement en parler.</p></div>
""",
    },
    {
        "id": "domiciliation-adresse",
        "theme": "Procédure pénale",
        "cat": "droit",
        "titre": "Votre adresse sur la plainte : comment la protéger",
        "extrait": "Pour éviter que votre agresseur connaisse votre adresse en accédant à son dossier, vous pouvez domicilier votre plainte chez votre avocat ou un tiers de confiance. Un droit prévu par la loi, souvent ignoré.",
        "temps": "4 min",
        "corps": """
<p>Lorsqu'une personne mise en cause accède au dossier pénal, elle peut voir certaines informations — dont l'adresse de la victime. La loi vous permet d'éviter cela dès le dépôt de plainte.</p>
<h2>Ce que dit la loi</h2>
<p>L'article 10-2 du Code de procédure pénale prévoit que vous pouvez déclarer, comme adresse de domiciliation, l'adresse de votre avocat ou celle d'un tiers de confiance — à condition que ce tiers accepte expresssément. Cette adresse figurera dans le dossier à la place de votre domicile réel.</p>
<h2>Comment en bénéficier ?</h2>
<ul>
  <li>Informez l'agent qui recueille votre plainte que vous souhaitez domicilier votre plainte à une autre adresse.</li>
  <li>Si vous avez un·e avocat·e, son adresse professionnelle peut être utilisée sans formalité particulière.</li>
  <li>Si vous choisissez un tiers de confiance (ami·e, association, famille), cette personne doit donner son accord explicite.</li>
  <li>Cette option est disponible même si votre plainte est déposée directement au commissariat ou à la gendarmerie.</li>
</ul>
<div class="article-note"><p>Si les forces de l'ordre refusent de prendre en compte cette demande, vous pouvez contacter le procureur de la République ou votre avocat·e. C'est un droit, pas une faveur.</p></div>
<h2>Pourquoi c'est important</h2>
<p>Dans certaines procédures, la personne mise en cause et son avocat peuvent consulter le dossier, y compris les coordonnées de la victime. Domicilier votre plainte chez un tiers permet de vous protéger, notamment si vous craignez des représailles ou si vous avez quitté votre domicile commun.</p>
""",
    },
    {
        "id": "reflexes-preuves",
        "theme": "Procédure pénale",
        "cat": "droit",
        "titre": "Les bons réflexes après une agression, avant toute démarche",
        "extrait": "Certaines actions simples dans les heures ou jours qui suivent une agression peuvent faciliter la suite. Si vous ne les avez pas faites : aucune inquiétude, elles ne conditionnent pas votre droit de poursuivre.",
        "temps": "5 min",
        "corps": """
<p>Il n'existe pas de « bonne victime ». Dans un moment de choc ou de sidération, personne ne pense à tout. Ce qui suit est une liste de réflexes utiles — pas une liste d'obligations.</p>
<h2>Conserver les messages et échanges</h2>
<p>Si des messages — SMS, messages vocaux, emails, conversations sur les réseaux sociaux — ont eu lieu avant ou après les faits, faites-en des captures d'écran et sauvegardez-les. Ces éléments peuvent documenter une relation, un contexte, des menaces ou des aveux implicites.</p>
<ul>
  <li>Capturez les messages en entier, avec la date et l'heure visibles.</li>
  <li>Sauvegardez-les sur un autre appareil ou dans un cloud personnel.</li>
  <li>Ne supprimez pas les messages de l'expéditeur, même s'ils vous font du mal à relire.</li>
</ul>
<h2>Préserver les traces physiques</h2>
<ul>
  <li>Si possible, ne lavez pas les vêtements portés lors des faits et conservez-les dans un sac.</li>
  <li>Photographiez les blessures visibles, idéalement avec un fond neutre et en plusieurs angles.</li>
  <li>Consultez un médecin ou rendez-vous aux urgences : un certificat médical peut être établi même sans plainte.</li>
</ul>
<h2>Le recueil de preuves sans plainte</h2>
<p>Depuis 2021, il est possible de faire recueillir des preuves médicales (examen, photos, prélèvements) dans un établissement de santé, sans déposer plainte immédiatement. Ces éléments sont conservés et pourront être utilisés si vous décidez d'agir plus tard.</p>
<div class="article-note"><p>Vous n'avez pas fait tout ça ? Ce n'est pas grave. Des poursuites aboutissent chaque jour sans aucun de ces éléments. Votre parole compte, et nous sommes là pour vous aider à construire votre dossier.</p></div>
""",
    },
    {
        "id": "aide-juridictionnelle",
        "theme": "Droits & indemnisation",
        "cat": "droit",
        "titre": "Financer son avocat : l'aide juridictionnelle et la protection juridique",
        "extrait": "Deux dispositifs méconnus peuvent prendre en charge tout ou partie des honoraires d'avocat : l'aide juridictionnelle et la garantie protection juridique souvent incluse dans votre assurance habitation.",
        "temps": "5 min",
        "corps": """
<p>Les honoraires d'avocat peuvent représenter un frein réel pour engager une procédure. Deux mécanismes permettent d'y remédier — et ils sont cumulativement applicables dans certains cas.</p>
<h2>L'aide juridictionnelle (AJ)</h2>
<p>L'aide juridictionnelle est une prise en charge par l'État des frais d'avocat et de procédure, accordée aux personnes dont les ressources ne dépassent pas un certain plafond. Elle peut être totale (0 € à votre charge) ou partielle.</p>
<ul>
  <li>Les victimes de crimes (viol, meurtre, torture…) bénéficient de l'AJ de droit, sans condition de ressources.</li>
  <li>Pour les violences conjugales, l'AJ peut être accordée à titre provisoire dès le début de la procédure.</li>
  <li>La demande se fait auprès du bureau d'aide juridictionnelle du tribunal judiciaire de votre domicile.</li>
  <li>En cas d'urgence, une AJ provisoire peut être accordée très rapidement.</li>
</ul>
<h2>La garantie protection juridique de votre assurance</h2>
<p>Beaucoup de contrats d'assurance habitation, auto, ou de comptes bancaires incluent une garantie protection juridique — souvent ignorée. Elle peut prendre en charge les honoraires d'avocat et les frais de procédure, sans condition de ressources.</p>
<ul>
  <li>Vérifiez vos contrats d'assurance habitation et auto : cherchez les termes protection juridique ou défense recours.</li>
  <li>Contactez votre assureur avant de choisir un·e avocat·e : certains contrats imposent de les prévenir en amont.</li>
  <li>Cette garantie est distincte de l'AJ et peut être utilisée même si vous ne remplissez pas les conditions de revenus.</li>
</ul>
<div class="article-note"><p>Si vous ne savez pas si vous avez droit à l'AJ ou si votre assurance couvre les frais, contactez-nous. Nous vous aidons à vérifier votre situation sans engagement.</p></div>
""",
    },
    {
        "id": "aide-urgence-caf",
        "theme": "Droits & indemnisation",
        "cat": "droit",
        "titre": "L'aide d'urgence de la CAF pour les victimes de violences conjugales",
        "extrait": "La CAF verse une aide financière d'urgence aux victimes de violences conjugales pour faire face aux dépenses immédiates liées à la séparation. Un dispositif ouvert à toutes et tous, souvent méconnu.",
        "temps": "4 min",
        "corps": """
<p>Quitter une situation de violences conjugales implique souvent des dépenses immédiates : hébergement, déplacements, frais de justice. La CAF propose une aide financière d'urgence spécifiquement conçue pour cette situation.</p>
<h2>À quoi correspond cette aide ?</h2>
<p>L'aide universelle d'urgence pour les victimes de violences conjugales (AUUVC) est versée en une seule fois. Elle peut prendre la forme d'un don non remboursable ou d'un prêt. Si c'est un prêt, l'auteur des violences peut être condamné à le rembourser à votre place.</p>
<h2>Quel montant ?</h2>
<p>Le montant varie entre 243 € et plus de 1 330 € selon vos ressources et le nombre d'enfants de moins de 21 ans à charge. L'aide est versée en 3 à 5 jours après réception du dossier complet.</p>
<h2>Quelles conditions ?</h2>
<ul>
  <li>Être victime de violences commises par un·e conjoint·e ou ex-conjoint·e (marié·e, pacsé·e, ou en concubinage).</li>
  <li>Fournir un justificatif de moins de 12 mois : ordonnance de protection, récépissé de dépôt de plainte, jugement pénal, ou signalement au procureur.</li>
  <li>La demande se fait directement sur le site caf.fr ou auprès de votre CAF locale.</li>
</ul>
<div class="article-note"><p>Vous n'avez pas encore déposé plainte ? Un signalement au procureur suffit comme justificatif. Cette aide ne se substitue pas aux autres aides (aide au logement, RSA…) auxquelles vous pouvez avoir droit simultanément.</p></div>
<h2>Comment demander ?</h2>
<p>Rendez-vous sur caf.fr, rubrique Violences conjugales, ou contactez directement votre CAF. Si vous avez du mal à constituer le dossier, une assistante sociale ou une association d'aide aux victimes peut vous accompagner.</p>
""",
    },
]
