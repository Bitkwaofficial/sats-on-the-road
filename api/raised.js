// Vercel serverless function: proxies the Sats On The Road Geyser project's
// public totals. Geyser's GraphQL API is CORS-locked to their own origin, so
// the static site can't call it directly; this runs server-side (no CORS).
//
// While the project is in review / not public, Geyser returns FORBIDDEN and we
// respond { live: false } so the UI stays hidden. Once approved and active, it
// returns the real balance (sats), USD value, and funder count.

const PROJECT = "satsontheroadafrica";
const ENDPOINT = "https://api.geyser.fund/graphql";
const QUERY =
  "query P($where: UniqueProjectQueryInput!){ projectGet(where:$where){ id title name status balance balanceUsdCent fundersCount } }";

module.exports = async function handler(req, res) {
  // Cache at the edge for 60s; serve stale up to 5 min while revalidating.
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
  res.setHeader("Content-Type", "application/json");

  try {
    const r = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: QUERY, variables: { where: { name: PROJECT } } }),
    });
    const j = await r.json();
    const p = j && j.data && j.data.projectGet;

    // Not public yet (review/draft) -> FORBIDDEN/NotFound -> p is null.
    if (!p || (p.status && p.status !== "active")) {
      return res.status(200).send(JSON.stringify({ live: false }));
    }

    return res.status(200).send(
      JSON.stringify({
        live: true,
        sats: p.balance || 0,
        usdCent: p.balanceUsdCent || 0,
        funders: p.fundersCount || 0,
        status: p.status,
        url: "https://geyser.fund/project/" + PROJECT,
      })
    );
  } catch (e) {
    return res.status(200).send(JSON.stringify({ live: false }));
  }
}
