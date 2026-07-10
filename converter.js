/* Sats On The Road: sats converter.
   Two-way currency <-> sats calculator that reuses the live rates the price
   ticker already fetches (window.SOTR_RATES / localStorage 'sotr-px').
   Exports the result as a branded, watermarked PNG. */
(function converter() {
  const root = document.getElementById("converter");
  if (!root) return;
  const fiatIn = document.getElementById("convFiat");
  const satsIn = document.getElementById("convSats");
  const curSel = document.getElementById("convCur");
  const rateEl = document.getElementById("convRate");
  const dlBtn = document.getElementById("convDownload");
  const canvas = document.getElementById("convCanvas");

  const SATS_PER_BTC = 100000000;
  const grp = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
  const grp2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
  let last = "fiat"; // which side the user last edited

  const isFr = () => document.documentElement.lang === "fr";
  const rates = () => {
    if (window.SOTR_RATES) return window.SOTR_RATES;
    try { return JSON.parse(localStorage.getItem("sotr-px")) || {}; } catch (e) { return {}; }
  };
  const btcIn = () => {
    const r = rates();
    const v = r[curSel.value];
    return v && isFinite(v) ? v : null; // price of 1 BTC in selected currency
  };
  const parse = (s) => {
    const n = parseFloat(String(s).replace(/[^0-9.]/g, ""));
    return isFinite(n) ? n : 0;
  };

  function updateRate() {
    const b = btcIn();
    rateEl.textContent = b ? `1 BTC = ${curSel.value.toUpperCase()} ${grp.format(b)}` : "";
  }
  function fromFiat() {
    const b = btcIn(); if (!b) return;
    const sats = Math.round((parse(fiatIn.value) * SATS_PER_BTC) / b);
    satsIn.value = sats ? grp.format(sats) : "";
  }
  function fromSats() {
    const b = btcIn(); if (!b) return;
    const fiat = (parse(satsIn.value) * b) / SATS_PER_BTC;
    fiatIn.value = fiat ? grp2.format(fiat) : "";
  }
  function recompute() {
    updateRate();
    if (last === "sats") fromSats();
    else fromFiat();
  }

  fiatIn.addEventListener("input", () => { last = "fiat"; fromFiat(); });
  satsIn.addEventListener("input", () => { last = "sats"; fromSats(); });
  curSel.addEventListener("change", recompute);
  document.addEventListener("sotr:rates", recompute);

  recompute(); // initial (uses cache if present; updates when rates arrive)

  /* ---- Branded, watermarked PNG export ---- */
  function fitFont(ctx, text, weight, family, startPx, maxWidth) {
    let px = startPx;
    do {
      ctx.font = `${weight} ${px}px ${family}`;
      if (ctx.measureText(text).width <= maxWidth) break;
      px -= 2;
    } while (px > 22);
    return px;
  }

  async function download() {
    const b = btcIn();
    if (!b) return;
    const W = 1200, H = 630;
    const ctx = canvas.getContext("2d");
    try { await document.fonts.ready; } catch (e) {}

    const CODE = curSel.value.toUpperCase();
    const fiatStr = fiatIn.value || "0";
    const satsStr = satsIn.value || "0";
    const dateStr = new Date().toISOString().slice(0, 10);
    const SANS = '"Bricolage Grotesque", system-ui, sans-serif';
    const MONO = '"JetBrains Mono", ui-monospace, monospace';

    // Background + warm glow
    ctx.fillStyle = "#0e1116";
    ctx.fillRect(0, 0, W, H);
    const g = ctx.createRadialGradient(W * 0.85, H * 0.12, 0, W * 0.85, H * 0.12, 680);
    g.addColorStop(0, "rgba(247,147,26,0.20)");
    g.addColorStop(1, "rgba(247,147,26,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Watermark: large faint bitcoin glyph
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = "#F7931A";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `800 600px ${SANS}`;
    ctx.fillText("₿", W * 0.8, H * 0.64);
    ctx.restore();

    // Header brand
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#F7931A";
    ctx.font = `800 40px ${SANS}`;
    ctx.fillText("₿", 64, 96);
    ctx.fillStyle = "#F6EFE3";
    ctx.font = `700 30px ${SANS}`;
    ctx.fillText("SATS ON THE ROAD", 112, 94);
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(64, 124); ctx.lineTo(W - 64, 124); ctx.stroke();

    // Label
    ctx.fillStyle = "#F7A93A";
    ctx.font = `600 26px ${MONO}`;
    ctx.fillText(isFr() ? "VOTRE ARGENT EN SATS" : "YOUR MONEY IN SATS", 64, 210);

    // Main conversion
    const maxW = W - 128;
    const line1 = `${fiatStr} ${CODE}`;
    const line2 = `${satsStr} sats`;
    ctx.fillStyle = "#F6EFE3";
    let p1 = fitFont(ctx, line1, 800, SANS, 84, maxW);
    ctx.font = `800 ${p1}px ${SANS}`;
    ctx.fillText(line1, 64, 312);
    ctx.fillStyle = "rgba(246,239,227,0.55)";
    ctx.font = `700 44px ${SANS}`;
    ctx.fillText("=", 64, 384);
    ctx.fillStyle = "#F7931A";
    let p2 = fitFont(ctx, line2, 800, SANS, 84, maxW);
    ctx.font = `800 ${p2}px ${SANS}`;
    ctx.fillText(line2, 64, 470);

    // Rate + date
    ctx.fillStyle = "rgba(246,239,227,0.55)";
    ctx.font = `500 24px ${MONO}`;
    ctx.fillText(`1 BTC = ${CODE} ${grp.format(b)}  ·  ${dateStr}`, 64, 524);

    // Footer
    ctx.fillStyle = "#F7931A";
    ctx.font = `700 26px ${MONO}`;
    ctx.fillText("satsontheroad.africa", 64, H - 46);
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(246,239,227,0.5)";
    ctx.font = `400 22px ${SANS}`;
    ctx.fillText(isFr() ? "Le Bitcoin à travers l'Afrique" : "Driving Bitcoin across Africa", W - 64, H - 46);

    // Export
    try {
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `sats-on-the-road-${CODE}-${dateStr}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {}
  }

  dlBtn.addEventListener("click", download);
})();
