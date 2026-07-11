/* Sats On The Road: Wall of Support.
   Renders APPROVED messages from the moderation-backed API (/api/wall/list),
   falling back to the seed messages.json until the store is set up. New
   signatures POST to /api/wall/submit and wait in the queue until approved
   in /wall-admin. */
(function wall() {
  const grid = document.getElementById("wallGrid");
  const form = document.getElementById("wallForm");
  const statusEl = document.getElementById("wallStatus");
  const isFr = () => document.documentElement.lang === "fr";
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function cards(list) {
    return list
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
  }

  function renderSeed() {
    fetch("messages.json?cb=" + Date.now(), { cache: "no-store" })
      .then((r) => r.json())
      .then((list) => {
        if (Array.isArray(list) && list.length) grid.innerHTML = cards(list.slice().reverse()); // newest first
      })
      .catch(() => {});
  }

  if (grid) {
    // Live approved messages come back newest-first already.
    fetch("/api/wall/list")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (d && Array.isArray(d.items) && d.items.length) grid.innerHTML = cards(d.items);
        else renderSeed();
      })
      .catch(renderSeed);
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
      const fd = new FormData(form);
      const payload = {
        name: fd.get("name") || "",
        place: fd.get("place") || "",
        message: fd.get("message") || "",
        website: fd.get("website") || "", // honeypot
      };
      try {
        const res = await fetch("/api/wall/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
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
