/* Sats On The Road: Wall of Support.
   Renders curated messages from messages.json and collects new signatures via
   Formspree (moderated: approved notes are added to messages.json). */
(function wall() {
  const grid = document.getElementById("wallGrid");
  const form = document.getElementById("wallForm");
  const statusEl = document.getElementById("wallStatus");
  const isFr = () => document.documentElement.lang === "fr";
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  if (grid) {
    fetch("messages.json?cb=" + Date.now(), { cache: "no-store" })
      .then((r) => r.json())
      .then((list) => {
        if (!Array.isArray(list) || !list.length) return;
        grid.innerHTML = list
          .slice()
          .reverse() // newest first
          .map(
            (m, i) =>
              `<figure class="wall-card wall-card--t${i % 4}">
                 <blockquote>${esc(m.msg)}</blockquote>
                 <figcaption>
                   <span class="wall-card__name">${esc(m.name || "Anonymous")}</span>
                   ${m.place ? `<span class="wall-card__place">${esc(m.place)}</span>` : ""}
                 </figcaption>
               </figure>`
          )
          .join("");
      })
      .catch(() => {});
  }

  if (form) {
    const btn = form.querySelector('button[type="submit"]');
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const label = btn.textContent;
      btn.disabled = true;
      btn.textContent = isFr() ? "Envoi…" : "Signing…";
      statusEl.className = "wall-form__status";
      statusEl.textContent = "";
      try {
        const res = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error("bad");
        form.reset();
        statusEl.textContent = isFr()
          ? "Merci ! Votre message apparaîtra après validation."
          : "Thank you! Your message will appear once approved.";
        statusEl.classList.add("wall-form__status--ok");
      } catch (err) {
        statusEl.textContent = isFr()
          ? "Une erreur est survenue. Réessayez."
          : "Something went wrong. Please try again.";
        statusEl.classList.add("wall-form__status--err");
      }
      btn.disabled = false;
      btn.textContent = label;
    });
  }
})();
