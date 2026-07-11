// GET /api/wall/approved  — admin: list PUBLISHED messages with their ids so the
// moderation page can unpublish them. Requires the x-admin-token header.

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const ADMIN = process.env.ADMIN_TOKEN || "";

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
  res.setHeader("Cache-Control", "no-store");
  const token = req.headers["x-admin-token"] || "";
  if (!ADMIN || token !== ADMIN) return res.status(401).send(JSON.stringify({ error: "unauthorized" }));
  if (!(KV_URL && KV_TOKEN)) return res.status(200).send(JSON.stringify({ items: [], kv: false }));
  try {
    const raw = (await kv(["LRANGE", "wall:approved", "0", "199"])) || [];
    const items = raw.map((s) => { try { return JSON.parse(s); } catch (e) { return null; } }).filter(Boolean);
    return res.status(200).send(JSON.stringify({ items, kv: true }));
  } catch (e) {
    return res.status(500).send(JSON.stringify({ error: "kv error" }));
  }
};
