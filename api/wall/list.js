// GET /api/wall/list  — public: approved Wall of Support messages (newest first).
// Returns { items: [] } when the KV store isn't configured, so the wall falls
// back to the seed messages.json.

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

async function kv(args) {
  const r = await fetch(KV_URL, {
    method: "POST",
    headers: { Authorization: "Bearer " + KV_TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
  const j = await r.json();
  if (j && j.error) throw new Error(j.error);
  return j ? j.result : null;
}

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=120");
  if (!(KV_URL && KV_TOKEN)) return res.status(200).send(JSON.stringify({ items: [], configured: false }));
  try {
    const raw = (await kv(["LRANGE", "wall:approved", "0", "199"])) || [];
    const items = raw
      .map((s) => { try { return JSON.parse(s); } catch (e) { return null; } })
      .filter(Boolean)
      .map((m) => ({ name: m.name, place: m.place, msg: m.msg, date: m.date || "" }));
    return res.status(200).send(JSON.stringify({ items, configured: true }));
  } catch (e) {
    return res.status(200).send(JSON.stringify({ items: [], configured: true, error: true }));
  }
};
