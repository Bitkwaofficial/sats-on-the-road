/* Sats On The Road: "I fueled the truck" shareable card.
   Generates a branded PNG (Canvas, no libraries) and share links. Self-declared
   for now; can later be gated behind a verified Lightning payment. */
(function fueled() {
  const root = document.getElementById("fueled");
  if (!root) return;
  const nameIn = document.getElementById("fuelName");
  const dlBtn = document.getElementById("fuelDownload");
  const shareBtn = document.getElementById("fuelShare");
  const xLink = document.getElementById("fuelX");
  const waLink = document.getElementById("fuelWa");
  const canvas = document.getElementById("fuelCanvas");

  const URL_ = "https://satsontheroad.africa/fuelthetruck";
  const isFr = () => document.documentElement.lang === "fr";
  const shareText = () =>
    isFr()
      ? "Je soutiens le Bitcoin à travers l'Afrique avec Sats On The Road ⚡ Rejoignez-moi :"
      : "I'm fueling Bitcoin across Africa with Sats On The Road ⚡ Join me:";

  function updateLinks() {
    const t = shareText();
    xLink.href = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(t) + "&url=" + encodeURIComponent(URL_);
    waLink.href = "https://wa.me/?text=" + encodeURIComponent(t + " " + URL_);
  }
  updateLinks();
  document.addEventListener("sotr:rates", updateLinks); // cheap hook to re-run on lang changes too

  const SANS = '"Bricolage Grotesque", system-ui, sans-serif';
  const MONO = '"JetBrains Mono", ui-monospace, monospace';
  function fitFont(ctx, text, weight, family, startPx, maxWidth) {
    let px = startPx;
    do {
      ctx.font = `${weight} ${px}px ${family}`;
      if (ctx.measureText(text).width <= maxWidth) break;
      px -= 2;
    } while (px > 30);
    return px;
  }

  async function draw() {
    const ctx = canvas.getContext("2d");
    const W = 1200, H = 630;
    try { await document.fonts.ready; } catch (e) {}
    const name = (nameIn.value || "").trim();
    const fr = isFr();
    const title = name
      ? (fr ? `${name} a ravitaillé le camion` : `${name} fueled the truck`)
      : (fr ? "J'ai ravitaillé le camion" : "I fueled the truck");

    ctx.fillStyle = "#0e1116"; ctx.fillRect(0, 0, W, H);
    const g = ctx.createRadialGradient(W * 0.2, H * 0.2, 0, W * 0.2, H * 0.2, 760);
    g.addColorStop(0, "rgba(247,147,26,0.22)"); g.addColorStop(1, "rgba(247,147,26,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // watermark
    ctx.save(); ctx.globalAlpha = 0.06; ctx.fillStyle = "#F7931A";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = `800 560px ${SANS}`; ctx.fillText("₿", W * 0.82, H * 0.66);
    ctx.restore();

    // header
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#F7931A"; ctx.font = `800 40px ${SANS}`; ctx.fillText("₿", 64, 100);
    ctx.fillStyle = "#F6EFE3"; ctx.font = `700 30px ${SANS}`; ctx.fillText("SATS ON THE ROAD", 112, 98);
    ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(64, 128); ctx.lineTo(W - 64, 128); ctx.stroke();

    // headline (wrap to 2 lines if needed) + lightning
    const maxW = W - 128;
    ctx.fillStyle = "#F6EFE3";
    let px = fitFont(ctx, title, 800, SANS, 88, maxW);
    ctx.font = `800 ${px}px ${SANS}`;
    ctx.fillText(title, 64, 300);
    ctx.fillStyle = "#F7931A"; ctx.font = `800 108px ${SANS}`;
    ctx.fillText("⚡", 64, 430);

    // sub
    ctx.fillStyle = "rgba(246,239,227,0.75)"; ctx.font = `500 30px ${SANS}`;
    ctx.fillText(fr ? "Le Bitcoin à travers l'Afrique, village par village." : "Powering Bitcoin across Africa, village by village.", 64, 500);

    // footer
    ctx.fillStyle = "#F7931A"; ctx.font = `700 26px ${MONO}`;
    ctx.fillText("satsontheroad.africa", 64, H - 46);
    ctx.textAlign = "right"; ctx.fillStyle = "rgba(246,239,227,0.6)"; ctx.font = `600 24px ${SANS}`;
    ctx.fillText(fr ? "Rejoignez-moi →" : "Join me →", W - 64, H - 46);
  }

  async function toBlob() {
    await draw();
    return new Promise((res) => canvas.toBlob(res, "image/png"));
  }

  dlBtn.addEventListener("click", async () => {
    try {
      await draw();
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = "i-fueled-the-truck.png";
      document.body.appendChild(a); a.click(); a.remove();
    } catch (e) {}
  });

  // Native share with the image (mobile), if supported
  if (navigator.canShare) {
    try {
      const probe = new File([new Blob()], "x.png", { type: "image/png" });
      if (navigator.canShare({ files: [probe] })) shareBtn.hidden = false;
    } catch (e) {}
  }
  shareBtn.addEventListener("click", async () => {
    try {
      const blob = await toBlob();
      const file = new File([blob], "i-fueled-the-truck.png", { type: "image/png" });
      await navigator.share({ files: [file], text: shareText(), url: URL_ });
    } catch (e) {}
  });
})();
