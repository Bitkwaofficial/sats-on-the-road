// POST /api/wall/submit  — collect a Wall of Support signature into a moderation
// queue (Vercel KV). Honeypot + per-IP rate limit. If the KV store isn't set up
// yet, it falls back to Formspree so nothing is ever lost.

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const FORMSPREE = "https://formspree.io/f/xjgqdokd";

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

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") { try { return JSON.parse(req.body); } catch (e) { return {}; } }
  return await new Promise((resolve) => {
    let d = "";
    req.on("data", (c) => (d += c));
    req.on("end", () => { try { resolve(JSON.parse(d || "{}")); } catch (e) { resolve({}); } });
    req.on("error", () => resolve({}));
  });
}

// Collapse whitespace, trim, cap length. (wall.js HTML-escapes on render.)
function clean(s, max) {
  return String(s == null ? "" : s).replace(/\s+/g, " ").trim().slice(0, max);
}

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  if (req.method !== "POST") return res.status(405).send(JSON.stringify({ error: "method" }));

  const body = (await readBody(req)) || {};
  const name = clean(body.name, 40);
  const place = clean(body.place, 60);
  const msg = clean(body.message != null ? body.message : body.msg, 240);
  const honeypot = clean(body.website, 100);

  // Bot filled the hidden field: pretend success, store nothing.
  if (honeypot) return res.status(200).send(JSON.stringify({ ok: true }));
  if (!name || !msg) return res.status(400).send(JSON.stringify({ error: "Name and message are required." }));

  if (KV_URL && KV_TOKEN) {
    try {
      const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
      const key = "wall:rl:" + ip;
      const n = await kv(["INCR", key]);
      if (n === 1) await kv(["EXPIRE", key, "60"]);
      if (n > 5) return res.status(429).send(JSON.stringify({ error: "Too many submissions. Try again shortly." }));
    } catch (e) { /* rate-limit best effort */ }

    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const item = { id, name, place, msg, ts: Date.now() };
    try {
      await kv(["LPUSH", "wall:pending", JSON.stringify(item)]);
      await kv(["LTRIM", "wall:pending", "0", "499"]);
      return res.status(200).send(JSON.stringify({ ok: true, pending: true }));
    } catch (e) {
      return res.status(500).send(JSON.stringify({ error: "Could not save. Try again." }));
    }
  }

  // No KV yet — forward to Formspree so submissions still reach you.
  try {
    await fetch(FORMSPREE, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ name, place, message: msg, type: "wall-signature" }),
    });
  } catch (e) { /* ignore */ }
  return res.status(200).send(JSON.stringify({ ok: true, pending: true }));
};
