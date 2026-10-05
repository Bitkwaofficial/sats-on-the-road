// build.js — static multi-page generator for Sats On The Road.
// Stitches src/base.html + partials + sections/pages into finished HTML at the
// repo root (index.html, mission.html, ...). Run: `node build.js`.
// Source of truth = src/. Generated root .html files are committed & served.
// UTF-8 throughout (Node default) — safe for the site's box-drawing/₿/→ chars.
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const SRC = path.join(ROOT, "src");
const ORIGIN = "https://satsontheroad.africa";

const read = (p) => fs.readFileSync(p, "utf8").replace(/\r\n/g, "\n");
const partial = (n) => read(path.join(SRC, "partials", n + ".html")).trim();
const section = (n) => read(path.join(SRC, "sections", n + ".html")).trim();

const base = read(path.join(SRC, "base.html"));
const cfg = JSON.parse(read(path.join(SRC, "pages.json")));
const TICKER = partial("ticker");
const HEADER = partial("header");
const FOOTER = partial("footer");
const SOUNDBAR = partial("soundbar");
const CONSENT = partial("consent");
const SCRIPTS = partial("scripts");

// Compact per-page header (guarantees one <h1> per subpage).
const PAGE_HERO = {
  mission:  { label: "Mission",   h1: "The Mission",          sub: "Why we drive." },
  journey:  { label: "Journey",   h1: "The Journey",          sub: "Every kilometre of the route." },
  stories:  { label: "Stories",   h1: "Stories from the road", sub: "The people behind the sats." },
  gallery:  { label: "Gallery",   h1: "Gallery",              sub: "Faces, markets and kilometres." },
  partners: { label: "Partners",  h1: "Partners",             sub: "The people powering the trip." },
  fuel:     { label: "Fuel the truck", h1: "Fuel the truck",  sub: "Power the next leg." },
  contact:  { label: "Contact",   h1: "Get in touch",         sub: "Bring the truck to your city." },
  join:     { label: "Join",      h1: "Join the waitlist",    sub: "Be first when SOTR goes live in your city." },
  privacy:  { label: "Privacy",   h1: "Privacy Policy",       sub: "What we collect, why, and your choices." },
  terms:    { label: "Terms",     h1: "Terms and Conditions", sub: "The rules for using this site." },
};

function pageHero(id) {
  const h = PAGE_HERO[id];
  if (!h) return "";
  return `<section class="page-hero" data-screen-label="Header">
  <div class="page-hero__inner">
    <nav class="page-hero__crumb" aria-label="Breadcrumb"><a href="/">Sats On The Road</a> <span aria-hidden="true">/</span> <span>${h.label}</span></nav>
    <h1 class="page-hero__title">${h.h1}</h1>
    <p class="page-hero__sub">${h.sub}</p>
  </div>
</section>`;
}

function buildBody(p) {
  // Custom body file with <!--#section:NAME--> includes, else join sections[].
  if (p.body) {
    let b = read(path.join(SRC, "pages", p.body));
    b = b.replace(/<!--#section:([a-z0-9_-]+)-->/gi, (_, n) => section(n));
    return b.trim();
  }
  const secs = (p.sections || []).map(section).join("\n\n");
  const appended = (p.append || []).map(partial).join("\n\n");
  return [pageHero(p.id), secs, appended].filter(Boolean).join("\n\n");
}

function activeHeader(nav) {
  if (!nav) return HEADER;
  return HEADER.replace(
    new RegExp(`(<a[^>]*data-nav="${nav}"[^>]*)>`),
    `$1 aria-current="page" class="is-active">`
  ).replace(
    // if the anchor already had a class (the CTA), merge instead of duplicating
    /class="nav__cta" data-nav="fuel" aria-current="page" class="is-active"/,
    `class="nav__cta is-active" data-nav="fuel" aria-current="page"`
  );
}

function jsonld(p, url) {
  const graph = [
    {
      "@type": "Organization",
      "@id": ORIGIN + "/#org",
      name: "Sats On The Road",
      url: ORIGIN + "/",
      logo: ORIGIN + "/assets/favicon-512.png",
      image: ORIGIN + "/assets/og-image.jpg",
      description: "A grassroots Bitcoin education and financial-inclusion road trip across Africa.",
      slogan: "Driving Bitcoin across the African continent.",
      foundingLocation: "Africa",
      sameAs: ["https://x.com/bitkwaofficial", "https://instagram.com/bitkwaofficial", "https://audiomack.com/bitkwamusic"],
    },
    {
      "@type": "WebSite",
      "@id": ORIGIN + "/#website",
      url: ORIGIN + "/",
      name: "Sats On The Road",
      publisher: { "@id": ORIGIN + "/#org" },
      inLanguage: "en",
    },
    {
      "@type": "WebPage",
      "@id": url + "#webpage",
      url: url,
      name: p.title.en,
      description: p.desc.en,
      isPartOf: { "@id": ORIGIN + "/#website" },
      inLanguage: "en",
      primaryImageOfPage: ORIGIN + "/assets/og-image.jpg",
      ...(p.path !== "/" ? { breadcrumb: { "@id": url + "#breadcrumb" } } : {}),
    },
  ];
  if (p.path !== "/") {
    const label = (PAGE_HERO[p.id] && PAGE_HERO[p.id].label) || p.id;
    graph.push({
      "@type": "BreadcrumbList",
      "@id": url + "#breadcrumb",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: ORIGIN + "/" },
        { "@type": "ListItem", position: 2, name: label, item: url },
      ],
    });
  }
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2);
}

function esc(s) { return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;"); }

function applyLinkRewrites(html) {
  for (const [from, to] of Object.entries(cfg.linkRewrites || {})) {
    html = html.split(`href="${from}"`).join(`href="${to}"`);
  }
  return html;
}

function buildPage(p) {
  const url = ORIGIN + (p.path === "/" ? "/" : p.path);
  const canonicalFr = url + (url.includes("?") ? "&" : "?") + "lang=fr";
  const meta = { title: { en: p.title.en, fr: p.title.fr }, desc: { en: p.desc.en, fr: p.desc.fr } };

  let body = buildBody(p);
  let header = activeHeader(p.nav);
  // link normalisation applies to everything we assemble
  const assembled = [header, body, FOOTER].map(applyLinkRewrites);

  let out = base
    .replace("{{TITLE}}", esc(p.title.en))
    .replace("{{DESC}}", esc(p.desc.en))
    .replace(/\{\{OGTITLE\}\}/g, esc(p.ogtitle.en))
    .replace(/\{\{OGDESC\}\}/g, esc(p.desc.en))
    .replace(/\{\{CANONICAL\}\}/g, url)
    .replace(/\{\{CANONICAL_FR\}\}/g, canonicalFr)
    .replace("{{PAGE}}", p.id)
    .replace("{{JSONLD}}", jsonld(p, url))
    .replace("{{META_JSON}}", JSON.stringify(meta))
    .replace("{{TICKER}}", TICKER)
    .replace("{{HEADER}}", assembled[0])
    .replace("{{BODY}}", assembled[1])
    .replace("{{FOOTER}}", assembled[2])
    .replace("{{SOUNDBAR}}", SOUNDBAR)
    .replace("{{CONSENT}}", CONSENT)
    .replace("{{SCRIPTS}}", [SCRIPTS, ...(p.scripts || []).map((s) => `<script src="${s}"></script>`)].join("\n"));

  fs.writeFileSync(path.join(ROOT, p.out), out, "utf8");
  console.log("built " + p.out + "  (" + p.path + ")  " + out.length + " bytes");
  return { path: p.path, out: p.out, sitemap: p.sitemap !== false };
}

const built = cfg.pages.map(buildPage);

// sitemap.xml (all pages + /wall)
const urls = built.filter((b) => b.sitemap).map((b) => (b.path === "/" ? "/" : b.path)).concat(["/wall"]);
const today = new Date().toISOString().slice(0, 10);
const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((u) =>
    `  <url>\n    <loc>${ORIGIN}${u === "/" ? "/" : u}</loc>\n    <lastmod>${today}</lastmod>\n` +
    `    <xhtml:link xmlns:xhtml="http://www.w3.org/1999/xhtml" rel="alternate" hreflang="fr" href="${ORIGIN}${u}${u.includes("?") ? "&" : "?"}lang=fr"/>\n  </url>`
  ).join("\n") +
  `\n</urlset>\n`;
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sitemap, "utf8");
console.log("built sitemap.xml (" + urls.length + " urls)");

console.log("\nDone.");
