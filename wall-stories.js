// Stories page: show up to 5 Wall of Support messages.
// The page ships with a curated static set (good for SEO / no-JS). If the live
// wall has approved messages, replace them with the 5 most recent. If the API
// is empty or errors, the static set stays — so the section is never blank.
(function wallStories() {
  const box = document.getElementById("wallStories");
  if (!box) return;
  const MAX = 5;

  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  function card(m) {
    const place = m.place ? `<span class="wallquote__place">${esc(m.place)}</span>` : "";
    return `<figure class="wallquote">
      <blockquote class="wallquote__msg">${esc(m.msg)}</blockquote>
      <figcaption class="wallquote__by"><span class="wallquote__name">${esc(m.name)}</span>${place}</figcaption>
    </figure>`;
  }

  function render(items) {
    const list = items
      .slice()
      .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
      .slice(0, MAX);
    if (list.length) box.innerHTML = list.map(card).join("");
  }

  // Only replace the static fallback when the live wall returns real messages.
  fetch("/api/wall/list")
    .then((r) => r.json())
    .then((d) => {
      if (d && !d.error && Array.isArray(d.items) && d.items.length) render(d.items);
    })
    .catch(() => {
      /* keep the static curated set */
    });
})();
