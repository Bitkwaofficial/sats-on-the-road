// POST /api/wall/moderate  — admin: approve or reject a pending message.
// Body: { id, action: "approve" | "reject" }. Requires x-admin-token header.

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

function pad(n) { return n < 10 ? "0" + n : "" + n; }
function ymd(ts) {
  const d = new Date(ts || Date.now());
  return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate());
}

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  const token = req.headers["x-admin-token"] || "";
  if (!ADMIN || token !== ADMIN) return res.status(401).send(JSON.stringify({ error: "unauthorized" }));
  if (req.method !== "POST") return res.status(405).send(JSON.stringify({ error: "method" }));
  if (!(KV_URL && KV_TOKEN)) return res.status(500).send(JSON.stringify({ error: "kv not configured" }));

  const body = (await readBody(req)) || {};
  const id = String(body.id || "");
  const action = String(body.action || "");
  if (["approve", "reject", "unpublish"].indexOf(action) === -1)
    return res.status(400).send(JSON.stringify({ error: "valid action required" }));
  // approve/reject need an id (pending items always have one). unpublish can also
  // match by content, so notes published before ids existed can still be removed.
  if (action !== "unpublish" && !id)
    return res.status(400).send(JSON.stringify({ error: "id required" }));

  const bName = String(body.name || ""), bPlace = String(body.place || "");
  const bMsg = String(body.msg || ""), bDate = String(body.date || "");
  if (action === "unpublish" && !id && !(bName && bMsg))
    return res.status(400).send(JSON.stringify({ error: "id or message required" }));

  const listKey = action === "unpublish" ? "wall:approved" : "wall:pending";
  try {
    const raw = (await kv(["LRANGE", listKey, "0", "-1"])) || [];
    let match = null;
    let obj = null;
    for (const s of raw) {
      let o;
      try { o = JSON.parse(s); } catch (e) { continue; }
      if (!o) continue;
      const byId = id && o.id === id;
      const byContent =
        action === "unpublish" &&
        o.msg === bMsg && (o.name || "") === bName &&
        (o.place || "") === bPlace && (o.date || "") === bDate;
      if (byId || byContent) { match = s; obj = o; break; }
    }
    if (!match) return res.status(404).send(JSON.stringify({ error: "not found" }));

    await kv(["LREM", listKey, "1", match]);
    if (action === "approve") {
      // Keep the id so the message can be unpublished later.
      const clean = { id: obj.id, name: obj.name, place: obj.place, msg: obj.msg, date: ymd(obj.ts) };
      await kv(["LPUSH", "wall:approved", JSON.stringify(clean)]);
      await kv(["LTRIM", "wall:approved", "0", "499"]);
    }
    return res.status(200).send(JSON.stringify({ ok: true, action }));
  } catch (e) {
    return res.status(500).send(JSON.stringify({ error: "kv error" }));
  }
};
