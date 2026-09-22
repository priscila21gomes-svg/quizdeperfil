// Vercel Serverless Function — /api/responses
// Guarda e lista as respostas do quiz em um banco Upstash Redis.
//
// Variáveis de ambiente necessárias (defina no projeto na Vercel):
//   UPSTASH_REDIS_REST_URL    -> vem da integração Upstash Redis
//   UPSTASH_REDIS_REST_TOKEN  -> vem da integração Upstash Redis
//   ADMIN_PASSWORD            -> a senha do painel de administrador

module.exports = async (req, res) => {
  const URL = process.env.UPSTASH_REDIS_REST_URL;
  const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
  const ADMIN = process.env.ADMIN_PASSWORD;

  if (!URL || !TOKEN) {
    res.status(500).json({ error: "missing_env", message: "Configure UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN na Vercel." });
    return;
  }

  async function redis(cmd) {
    const r = await fetch(URL, {
      method: "POST",
      headers: { Authorization: "Bearer " + TOKEN, "Content-Type": "application/json" },
      body: JSON.stringify(cmd),
    });
    const j = await r.json();
    if (j.error) throw new Error(j.error);
    return j.result;
  }

  function isAdmin() {
    if (!ADMIN) return false;
    const auth = req.headers.authorization || "";
    const token = auth.replace(/^Bearer\s+/i, "");
    return token && token === ADMIN;
  }

  try {
    if (req.method === "GET") {
      if (!isAdmin()) { res.status(401).json({ error: "unauthorized" }); return; }
      const raw = (await redis(["HGETALL", "respostas"])) || [];
      const items = [];
      for (let i = 0; i < raw.length; i += 2) {
        try { items.push(JSON.parse(raw[i + 1])); } catch (e) {}
      }
      res.status(200).json({ items: items });
      return;
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
      const required = ["id", "nome", "turno", "lider", "respostas", "pl", "pa", "perfil"];
      for (const k of required) {
        if (body[k] === undefined || body[k] === null || body[k] === "") {
          res.status(400).json({ error: "bad_request", field: k });
          return;
        }
      }
      const TURNOS = ["T1", "T2", "T3"];
      const LIDERES = ["Gabriela Duarte", "Edson Sousa", "André Marins", "Márcio Costa"];
      if (TURNOS.indexOf(body.turno) === -1 || LIDERES.indexOf(body.lider) === -1) {
        res.status(400).json({ error: "bad_request", field: "turno_lider" });
        return;
      }
      const rec = {
        id: String(body.id).slice(0, 100),
        nome: String(body.nome).slice(0, 80),
        turno: body.turno,
        lider: body.lider,
        respostas: String(body.respostas).slice(0, 10),
        pl: Math.max(0, Math.min(100, Number(body.pl) || 0)),
        pa: Math.max(0, Math.min(100, Number(body.pa) || 0)),
        perfil: body.perfil,
        ts: Date.now(),
      };
      await redis(["HSET", "respostas", rec.id, JSON.stringify(rec)]);
      res.status(200).json({ ok: true });
      return;
    }

    if (req.method === "DELETE") {
      if (!isAdmin()) { res.status(401).json({ error: "unauthorized" }); return; }
      const id = (req.query && req.query.id) || "";
      if (!id) { res.status(400).json({ error: "bad_request" }); return; }
      await redis(["HDEL", "respostas", id]);
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: "method_not_allowed" });
  } catch (e) {
    res.status(500).json({ error: "server_error" });
  }
};
