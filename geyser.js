/* Sats On The Road: live Geyser fundraiser total.
   Fetches /api/raised (a serverless proxy to Geyser's API). While the project
   is in review / not public, the API reports { live:false } and everything
   stays hidden. Once approved and active, this reveals the running total and
   the "Fuel the truck on Geyser" button, and exposes window.SOTR_RAISED. */
(function geyser() {
  const isFr = () => document.documentElement.lang === "fr";
  const fmt = (n) => new Intl.NumberFormat("en-US").format(Math.round(n || 0));

  function label(key) {
    const en = { unit: "sats raised", supporters: "supporters", supporter: "supporter" };
    const fr = { unit: "sats collectés", supporters: "soutiens", supporter: "soutien" };
    return (isFr() ? fr : en)[key];
  }

  function render(d) {
    const block = document.getElementById("geyserRaised");
    if (block) {
      if (!d.sats) {
        // Fresh campaign, no donations yet: encourage rather than show zeros.
        block.innerHTML =
          '<div class="geyser__zero">' +
          (isFr() ? "Soyez le premier à ravitailler le camion ⚡" : "Be the first to fuel the truck ⚡") +
          "</div>";
      } else {
        const sats = document.getElementById("grSats");
        const usd = document.getElementById("grUsd");
        const funders = document.getElementById("grFunders");
        const unit = block.querySelector(".geyser__unit");
        if (sats) sats.textContent = fmt(d.sats);
        if (unit) unit.textContent = label("unit");
        if (usd) usd.textContent = "≈ $" + fmt(d.usdCent / 100);
        if (funders)
          funders.textContent =
            fmt(d.funders) + " " + label(d.funders === 1 ? "supporter" : "supporters");
      }
      block.hidden = false;
    }
    document.querySelectorAll("[data-geyser-cta]").forEach((a) => {
      if (d.url) a.setAttribute("href", d.url);
      a.hidden = false;
    });
  }

  fetch("/api/raised")
    .then((r) => r.json())
    .then((d) => {
      if (!d || !d.live) return; // stay hidden until the project is approved
      window.SOTR_RAISED = d;
      render(d);
      document.dispatchEvent(new Event("sotr:raised"));
    })
    .catch(() => {});
})();
