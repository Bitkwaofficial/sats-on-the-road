/* Sats On The Road: live Bitcoin price ticker.
   Live BTC/USD (CoinGecko → Coinbase → Binance) × USD→local forex
   (jsDelivr currency-api, no key). Computes 1 BTC in African currencies. */
(function priceTicker() {
  const track = document.getElementById("pxTrack");
  if (!track) return;

  // Route + broader-Africa currencies. XOF (CFA) is shared by Benin, Togo,
  // Burkina Faso, Côte d'Ivoire, Senegal and Guinea-Bissau.
  const CUR = [
    { c: "ngn", f: "🇳🇬", s: "₦" },
    { c: "ghs", f: "🇬🇭", s: "₵" },
    { c: "xof", f: "🌍", s: "CFA " },
    { c: "lrd", f: "🇱🇷", s: "L$" },
    { c: "sle", f: "🇸🇱", s: "Le " },
    { c: "gnf", f: "🇬🇳", s: "FG " },
    { c: "gmd", f: "🇬🇲", s: "D " },
    { c: "zar", f: "🇿🇦", s: "R" },
    { c: "kes", f: "🇰🇪", s: "KSh " },
    { c: "egp", f: "🇪🇬", s: "E£" },
    { c: "ugx", f: "🇺🇬", s: "USh " },
    { c: "tzs", f: "🇹🇿", s: "TSh " },
    { c: "usd", f: "🇺🇸", s: "$" },
  ].filter((x) => x.f); // drop the placeholder

  const fmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
  const LS = "sotr-px";

  const getJSON = (url) => fetch(url, { cache: "no-store" }).then((r) => (r.ok ? r.json() : Promise.reject(r.status)));

  async function btcUsd() {
    const tries = [
      () => getJSON("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd").then((j) => j.bitcoin.usd),
      () => getJSON("https://api.coinbase.com/v2/prices/BTC-USD/spot").then((j) => parseFloat(j.data.amount)),
      () => getJSON("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT").then((j) => parseFloat(j.price)),
    ];
    for (const t of tries) {
      try {
        const v = await t();
        if (v && isFinite(v)) return v;
      } catch (e) {}
    }
    return null;
  }

  async function usdRates() {
    const urls = [
      "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json",
      "https://latest.currency-api.pages.dev/v1/currencies/usd.json",
    ];
    for (const u of urls) {
      try {
        const j = await getJSON(u);
        if (j && j.usd) return j.usd;
      } catch (e) {}
    }
    return null;
  }

  function build(prices) {
    const items = CUR.filter((x) => prices[x.c] != null)
      .map(
        (x) =>
          `<span class="pxticker__item"><span class="pxticker__ccy">${x.c.toUpperCase()}</span> <b>${fmt.format(prices[x.c])}</b></span>`
      )
      .join("");
    if (!items) return;
    // duplicate the set so the marquee loops seamlessly at translateX(-50%)
    track.innerHTML = items + items;
  }

  async function refresh() {
    const [usd, rates] = await Promise.all([btcUsd(), usdRates()]);
    if (usd == null || rates == null) {
      try {
        const c = JSON.parse(localStorage.getItem(LS));
        if (c) build(c);
      } catch (e) {}
      return;
    }
    const prices = {};
    CUR.forEach((x) => {
      const r = rates[x.c];
      if (r != null && isFinite(r)) prices[x.c] = Math.round(usd * r);
    });
    build(prices);
    try {
      localStorage.setItem(LS, JSON.stringify(prices));
    } catch (e) {}
  }

  // Show cached values instantly (no empty flash), then fetch live.
  try {
    const c = JSON.parse(localStorage.getItem(LS));
    if (c) build(c);
  } catch (e) {}
  refresh();
  setInterval(refresh, 60000);
})();
