// scaffold.js — ONE-TIME extractor.
// Reads the current index.html and splits its chrome + sections into src/.
// Run once: `node scaffold.js`. After this, src/ is the source of truth and
// build.js regenerates the site. UTF-8 in/out (Node default) — no mojibake.
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const SRC = path.join(ROOT, "src");
// Normalize CRLF -> LF so slice markers are predictable.
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8").replace(/\r\n/g, "\n");

function write(rel, content) {
  const p = path.join(SRC, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content.trim() + "\n", "utf8");
  console.log("wrote src/" + rel + "  (" + content.length + " chars)");
}
function grab(re, label) {
  const m = html.match(re);
  if (!m) throw new Error("not found: " + label);
  return m[0];
}

// HEAD inner (reference only; base.html is authored by hand from this)
write("_head-original.html", grab(/<head>[\s\S]*?<\/head>/, "head"));

// Chrome
write("partials/ticker.html",   grab(/<div class="pxticker"[\s\S]*?\n<\/div>/, "ticker"));
write("partials/header.html",   grab(/<header class="nav"[\s\S]*?<\/header>/, "header"));
write("partials/footer.html",   grab(/<footer class="foot"[\s\S]*?<\/footer>/, "footer"));
write("partials/soundbar.html", grab(/<aside class="soundbar"[\s\S]*?<\/aside>/, "soundbar"));
write("partials/scripts.html",  grab(/<script src="i18n\.js"[\s\S]*?<\/script>\n(?=<\/body>)/, "scripts"));

// SECTIONS: every <section id="..."> ... </section>
const secRe = /<section\b[^>]*\bid="([^"]+)"[\s\S]*?<\/section>/g;
let m, count = 0, ids = [];
while ((m = secRe.exec(html))) { write("sections/" + m[1] + ".html", m[0]); ids.push(m[1]); count++; }
console.log("\nExtracted " + count + " sections: " + ids.join(", "));
