/* Sats On The Road: bilingual EN/FR.
   Retrofit i18n by translating DOM text against a source-string dictionary,
   so the English HTML stays the single source of truth. */
(function i18n() {
  // French for every phrase that differs from English. Keys are the English
  // text, normalised (single spaces, straight quotes, plain hyphens).
  const FR = {
    // Nav
    "Journey": "Le trajet",
    "Stories": "Récits",
    "Gallery": "Galerie",
    "Partners": "Partenaires",
    "Fuel the truck →": "Faire un don →",
    "Africa · 2026": "Afrique · 2026",
    // Hero
    "Currently in motion · Nigeria → Ghana": "En route · Nigéria → Ghana",
    "Putting non-custodial wallets, offline payment rails and orange-pilled merchants on the map, village by village, market by market, kilometre by kilometre.":
      "Des portefeuilles auto-hébergés, des paiements hors-ligne et des commerçants convertis au Bitcoin, mis sur la carte, village par village, marché par marché, kilomètre par kilomètre.",
    "Fuel the next leg": "Financer la prochaine étape",
    "Follow the route": "Suivre le trajet",
    "Kilometres driven": "Kilomètres parcourus",
    "Merchants onboarded": "Commerçants intégrés",
    "Countries crossed": "Pays traversés",
    // Mission
    "A bitcoin standard,": "Un standard Bitcoin,",
    "delivered by road.": "livré par la route.",
    "Meet people where they are.": "Aller vers les gens, là où ils sont.",
    "No conferences. No livestreams. We pull up at marketplaces, fishing ports and roadside stalls and sit down with the people who'd most benefit from a neutral, open monetary network.":
      "Pas de conférences. Pas de directs. On s'arrête sur les marchés, les ports de pêche et les étals au bord de la route, et on s'assoit avec celles et ceux qui profiteraient le plus d'un réseau monétaire neutre et ouvert.",
    "Self-custody, by default.": "L'auto-conservation, par défaut.",
    "Every wallet we install is non-custodial. Every seed phrase is written by its owner. Sovereignty isn't a slide; it's a thing you do with your hands.":
      "Chaque portefeuille que nous installons est auto-hébergé. Chaque phrase de récupération est écrite par son propriétaire. La souveraineté n'est pas une diapositive ; c'est quelque chose que l'on fait de ses propres mains.",
    "Build for low-bandwidth life.": "Conçu pour la vie à faible débit.",
    "Spotty 2G, dead batteries, USSD phones, intermittent power. We test every flow against the worst conditions on the route, because that's where it has to work.":
      "2G capricieuse, batteries à plat, téléphones USSD, électricité intermittente. On teste chaque parcours dans les pires conditions de la route, car c'est là qu'il doit fonctionner.",
    "Train the trainers.": "Former les formateurs.",
    "In every town we leave behind a local educator with the materials, wallet, and merchant network to keep onboarding long after the truck has driven on.":
      "Dans chaque ville, nous laissons un formateur local avec le matériel, le portefeuille et le réseau de commerçants pour continuer à intégrer les gens bien après le départ du camion.",
    // Journey
    "02 / The route": "02 / Le trajet",
    "14,820 km of orange road.": "14 820 km de route orange.",
    "From Lagos to Dakar, tracing the West African coast with an inland leg through Ouagadougou. Nine languages, one rolling classroom.":
      "De Lagos à Dakar, en longeant la côte ouest-africaine avec une étape intérieure par Ouagadougou. Neuf langues, une salle de classe roulante.",
    "Route legs": "Étapes du trajet",
    "Lagos → Dakar · 11 legs": "Lagos → Dakar · 11 étapes",
    "Complete": "Terminée",
    "Up next": "Prochaine étape",
    "Planned": "Prévue",
    // Impact
    "03 / Impact, so far": "03 / Impact, à ce jour",
    "Numbers from the dashboard.": "Les chiffres du tableau de bord.",
    "people onboarded to a self-custodial wallet": "personnes équipées d'un portefeuille auto-hébergé",
    "merchants now accepting Lightning": "commerçants acceptent désormais le Lightning",
    "local educators trained & equipped": "formateurs locaux formés et équipés",
    "driven across nine countries": "parcourus à travers neuf pays",
    "circulated through merchant rails to date": "en circulation via les commerçants à ce jour",
    "countries reached on the planned route": "pays atteints sur le trajet prévu",
    // Stories
    "04 / On the ground": "04 / Sur le terrain",
    "Stories from the truck.": "Récits depuis le camion.",
    "Cotonou, Benin · Day 19": "Cotonou, Bénin · Jour 19",
    "\"It's the first money I own without a bank's permission.\"":
      "« C'est le premier argent qui m'appartient sans l'autorisation d'une banque. »",
    "Aïcha runs a roadside fabric stall in Cotonou. We set her up with a Lightning wallet on a five-year-old Android, paid for two metres of wax print in sats, and watched her show three of her neighbours how to do the same before we'd finished our coffee.":
      "Aïcha tient un étal de tissus au bord de la route à Cotonou. Nous lui avons installé un portefeuille Lightning sur un Android de cinq ans, payé deux mètres de wax en sats, et l'avons vue montrer à trois de ses voisines comment faire pareil avant même que nous ayons fini notre café.",
    "📍 11 merchants onboarded": "📍 11 commerçants intégrés",
    "🛞 312 km from previous stop": "🛞 312 km depuis l'étape précédente",
    "Lomé, Togo · Day 24": "Lomé, Togo · Jour 24",
    "A classroom on the back of a flatbed.": "Une salle de classe sur un plateau de camion.",
    "Forty-three students. Two laptops. One projector strapped to the side of the truck. By sunset every student had a wallet, a backup, and their first 1,000 sats.":
      "Quarante-trois élèves. Deux ordinateurs portables. Un projecteur sanglé sur le flanc du camion. Au coucher du soleil, chaque élève avait un portefeuille, une sauvegarde et ses premiers 1 000 sats.",
    "Ouagadougou, Burkina Faso · Current stop": "Ouagadougou, Burkina Faso · Étape actuelle",
    "Why Ouaga is the right place to be right now.": "Pourquoi Ouaga est le bon endroit, en ce moment.",
    "Burkina Faso's capital is young, dense and mobile-first, exactly the conditions where a neutral, permissionless money network takes root fastest. This is where we've parked the truck for the West African inland leg.":
      "La capitale du Burkina Faso est jeune, dense et tournée vers le mobile, exactement les conditions où un réseau monétaire neutre et sans permission s'enracine le plus vite. C'est là que nous avons garé le camion pour l'étape intérieure de l'Afrique de l'Ouest.",
    "Metro population": "Population de l'agglomération",
    "Under age 25": "Moins de 25 ans",
    "Mobile-money accounts": "Comptes mobile money",
    "majority of adults": "la majorité des adultes",
    "Primary languages": "Langues principales",
    "French · Mooré · Dioula": "Français · Mooré · Dioula",
    // Gallery
    "05 / From the road": "05 / Depuis la route",
    "Faces, markets & kilometres.": "Visages, marchés et kilomètres.",
    "Snapshots from the movement: the crew, the wrapped car, the merchants and the Bitcoin Afrique stage. Tap any photo to enlarge.":
      "Instantanés du mouvement : l'équipe, la voiture floquée, les commerçants et la scène de Bitcoin Afrique. Touchez une photo pour l'agrandir.",
    // Partners
    "06 / The coalition": "06 / La coalition",
    "Powered by an": "Portés par un",
    "open-source village.": "village open-source.",
    "No single sponsor, no single chain-of-command. A web of local builders, grant programs and orange-pilled humans keeping the wheels turning.":
      "Pas de sponsor unique, pas de hiérarchie unique. Un réseau de bâtisseurs locaux, de programmes de financement et de passionnés du Bitcoin qui font tourner les roues.",
    "Bitcoin Kwara community": "Communauté Bitcoin Kwara",
    "Pan-African conference": "Conférence panafricaine",
    "Education & media": "Éducation & médias",
    "Self-custody education": "Éducation à l'auto-conservation",
    "Merchant rates": "Taux pour commerçants",
    "Peer-to-peer trading": "Échange pair-à-pair",
    "Supporting sponsor": "Sponsor de soutien",
    "Open education": "Éducation libre",
    "Local community": "Communauté locale",
    "Community": "Communauté",
    "Lightning payments": "Paiements Lightning",
    "Nonprofit": "Association",
    "See all 14 partners": "Voir les 14 partenaires",
    "…and 240+ local merchants, mechanics, hostel owners and fellow travellers we've shared chai, fuel and a sats invoice with along the way.":
      "…et plus de 240 commerçants, mécaniciens, gérants d'auberge et compagnons de route avec qui nous avons partagé du thé, du carburant et une facture en sats en chemin.",
    // CTA
    "07 / Keep us moving": "07 / Aidez-nous à avancer",
    "Three more countries.": "Trois pays de plus.",
    "5,200 km to go.": "5 200 km à parcourir.",
    "Diesel, ferries, border papers, and a lot of wallet stickers. Every sat you send pays for the next merchant we orange-pill.":
      "Du diesel, des ferries, des papiers de douane et beaucoup d'autocollants de portefeuille. Chaque sat que vous envoyez finance le prochain commerçant que nous convertissons au Bitcoin.",
    "Scan to send sats · bitkwa@blink.sv": "Scannez pour envoyer des sats · bitkwa@blink.sv",
    "Copy": "Copier",
    // Contact
    "08 / Say hello": "08 / Dites bonjour",
    "Get in touch.": "Contactez-nous.",
    "Partnerships, press, volunteering, or an invite to bring the truck to your city. Reach us on any channel below, or send a note straight from here.":
      "Partenariats, presse, bénévolat, ou une invitation à amener le camion dans votre ville. Joignez-nous par n'importe quel canal ci-dessous, ou écrivez-nous directement ici.",
    "Email": "E-mail",
    "Call": "Appeler",
    "Name": "Nom",
    "Topic": "Sujet",
    "General enquiry": "Demande générale",
    "Partnership & sponsorship": "Partenariat & sponsoring",
    "Press & media": "Presse & médias",
    "Volunteer / join the crew": "Bénévolat / rejoindre l'équipe",
    "Invite the truck to my city": "Inviter le camion dans ma ville",
    "Send message →": "Envoyer le message →",
    "Sends straight to the Sats On The Road inbox.": "Envoyé directement à la boîte de réception de Sats On The Road.",
    // Footer
    "Grassroots Bitcoin education & financial inclusion across Africa":
      "Éducation Bitcoin de terrain et inclusion financière à travers l'Afrique",
    "Volunteer with us →": "Devenez bénévole →",
    "Keep your seed. Drive Africa. Stack sats.": "Gardez votre seed. Roulez l'Afrique. Empilez des sats.",
    // Soundbar
    "Play the soundtrack": "Écouter la bande-son",
    "♪ Soundtrack:": "♪ Bande-son :",
  };

  // Sentences split across inline tags: translate whole innerHTML.
  const RICH = [
    {
      sel: ".hero__title",
      en: 'Driving <em>Bitcoin</em><br> across the<br> <span class="hero__title-stroke">African continent.</span>',
      fr: 'Le <em>Bitcoin</em><br> à travers le<br> <span class="hero__title-stroke">continent africain.</span>',
    },
  ];

  // Attributes (placeholders, aria-labels, data-*).
  const ATTR = [
    { sel: "#cf-name", attr: "placeholder", en: "Your name", fr: "Votre nom" },
    { sel: "#cf-message", attr: "placeholder", en: "Tell us a little about it…", fr: "Dites-nous en un peu plus…" },
    { sel: '.copy[data-copy="bitkwa@blink.sv"]', attr: "aria-label", en: "Copy Lightning address", fr: "Copier l'adresse Lightning" },
    { sel: '.copy[data-copy^="bc1"]', attr: "aria-label", en: "Copy on-chain address", fr: "Copier l'adresse on-chain" },
    { sel: ".lightbox__close", attr: "aria-label", en: "Close", fr: "Fermer" },
    { sel: ".lightbox__nav--prev", attr: "aria-label", en: "Previous", fr: "Précédent" },
    { sel: ".lightbox__nav--next", attr: "aria-label", en: "Next", fr: "Suivant" },
    { sel: "#toTop", attr: "aria-label", en: "Back to top", fr: "Retour en haut" },
    { sel: "#navBrand", attr: "aria-label", en: "Sats On The Road home", fr: "Sats On The Road, accueil" },
    { sel: "#navToggle", attr: "aria-label", en: "Open menu", fr: "Ouvrir le menu" },
    { sel: ".see-all[data-fold='partners']", attr: "data-more", en: "See all 14 partners", fr: "Voir les 14 partenaires" },
    { sel: ".see-all[data-fold='partners']", attr: "data-less", en: "Show fewer", fr: "Voir moins" },
  ];

  const META = {
    title: {
      en: "Sats On The Road | Bitcoin Adoption Road Trip Across Africa",
      fr: "Sats On The Road | Le Bitcoin sur les routes d'Afrique",
    },
    desc: {
      en: "Sats On The Road is a grassroots Bitcoin road trip across Africa, onboarding people to non-custodial wallets and real merchant payments, village by village.",
      fr: "Sats On The Road est un périple Bitcoin de terrain à travers l'Afrique de l'Ouest : portefeuilles auto-hébergés et vrais paiements chez les commerçants, village par village.",
    },
  };

  function norm(s) {
    return s
      .replace(/\s+/g, " ")
      .trim()
      .replace(/[‐‑‒–—]/g, "-")
      .replace(/[‘’′]/g, "'")
      .replace(/[“”]/g, '"');
  }

  const cache = new WeakMap();

  function walk(toFr) {
    const rich = RICH.map((r) => document.querySelector(r.sel)).filter(Boolean);
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        const p = n.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        if (p.closest("script,style,code,svg")) return NodeFilter.FILTER_REJECT;
        for (const el of rich) if (el.contains(p)) return NodeFilter.FILTER_REJECT;
        if (!n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const nodes = [];
    while (tw.nextNode()) nodes.push(tw.currentNode);
    nodes.forEach((n) => {
      if (!cache.has(n)) cache.set(n, n.nodeValue);
      const orig = cache.get(n);
      if (toFr) {
        const fr = FR[norm(orig)];
        if (fr) {
          const lead = orig.match(/^\s*/)[0];
          const trail = orig.match(/\s*$/)[0];
          n.nodeValue = lead + fr + trail;
        }
      } else {
        n.nodeValue = orig;
      }
    });
  }

  function applyRich(toFr) {
    RICH.forEach((r) => {
      const el = document.querySelector(r.sel);
      if (el) el.innerHTML = toFr ? r.fr : r.en;
    });
  }
  function applyAttr(toFr) {
    ATTR.forEach((a) => {
      document.querySelectorAll(a.sel).forEach((el) => el.setAttribute(a.attr, toFr ? a.fr : a.en));
    });
  }
  function applyMeta(toFr) {
    document.documentElement.lang = toFr ? "fr" : "en";
    document.title = toFr ? META.title.fr : META.title.en;
    const d = document.querySelector('meta[name="description"]');
    if (d) d.setAttribute("content", toFr ? META.desc.fr : META.desc.en);
  }

  function apply(lang) {
    const toFr = lang === "fr";
    applyRich(toFr);
    walk(toFr);
    applyAttr(toFr);
    applyMeta(toFr);
    window.__sotrLang = lang;
    const btn = document.getElementById("langToggle");
    if (btn) {
      btn.textContent = toFr ? "English" : "Français";
      btn.setAttribute("aria-label", toFr ? "Passer en anglais" : "Switch to French");
    }
  }

  function detect() {
    try {
      const s = localStorage.getItem("sotr-lang");
      if (s === "fr" || s === "en") return s;
    } catch (e) {}
    const q = new URLSearchParams(location.search).get("lang");
    if (q === "fr" || q === "en") return q;
    if ((navigator.language || "").toLowerCase().startsWith("fr")) return "fr";
    return "en";
  }

  function setLang(lang, save) {
    apply(lang);
    if (save) {
      try { localStorage.setItem("sotr-lang", lang); } catch (e) {}
      const u = new URL(location.href);
      if (lang === "fr") u.searchParams.set("lang", "fr");
      else u.searchParams.delete("lang");
      history.replaceState({}, "", u);
    }
  }

  function init() {
    const initial = detect();
    if (initial === "fr") apply("fr");
    else apply("en");
    const btn = document.getElementById("langToggle");
    if (btn) btn.addEventListener("click", () => setLang(window.__sotrLang === "fr" ? "en" : "fr", true));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
