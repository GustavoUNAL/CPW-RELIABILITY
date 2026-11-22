/**
 * Servidor de producción: estáticos (dist) + API de analítica de uso.
 * Puerto/host: PORT / HOST (default 127.0.0.1:4173)
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const STORE_DIR = path.join(ROOT, "data", "analytics");
const STORE_FILE = path.join(STORE_DIR, "usage.json");

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT || 4173);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".map": "application/json",
};

function ensureStore() {
  fs.mkdirSync(STORE_DIR, { recursive: true });
  if (!fs.existsSync(STORE_FILE)) {
    fs.writeFileSync(STORE_FILE, JSON.stringify({ version: 1, events: [], sessions: {} }, null, 2));
  }
}

function readStore() {
  ensureStore();
  try {
    return JSON.parse(fs.readFileSync(STORE_FILE, "utf8"));
  } catch {
    return { version: 1, events: [], sessions: {} };
  }
}

function writeStore(store) {
  ensureStore();
  const tmp = `${STORE_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2));
  fs.renameSync(tmp, STORE_FILE);
}

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

function applyEvent(store, event) {
  const now = event.ts || new Date().toISOString();
  store.events.push({ ...event, ts: now });
  if (store.events.length > 20000) {
    store.events = store.events.slice(-15000);
  }

  const sid = event.sessionId;
  if (!sid) return;

  if (!store.sessions[sid]) {
    store.sessions[sid] = {
      sessionId: sid,
      userId: event.userId,
      email: event.email,
      name: event.name,
      role: event.role,
      startedAt: now,
      lastSeenAt: now,
      endedAt: null,
      durationMs: 0,
      pages: {},
    };
  }

  const session = store.sessions[sid];
  session.lastSeenAt = now;
  session.userId = event.userId || session.userId;
  session.email = event.email || session.email;
  session.name = event.name || session.name;
  session.role = event.role || session.role;

  if (event.type === "login") {
    session.startedAt = now;
    session.endedAt = null;
  }

  if (event.type === "page_view" && event.leaf) {
    const key = event.leaf;
    if (!session.pages[key]) {
      session.pages[key] = {
        page: event.page || "",
        leaf: key,
        label: event.leafLabel || key,
        views: 0,
        ms: 0,
      };
    }
    session.pages[key].views += 1;
    session.pages[key].label = event.leafLabel || session.pages[key].label;
    if (typeof event.durationMs === "number" && event.durationMs > 0) {
      // durationMs es el tiempo en la página ANTERIOR; se aplica abajo vía previousLeaf
    }
  }

  if (event.type === "page_view" && event.previousLeaf && typeof event.durationMs === "number") {
    const prev = event.previousLeaf;
    if (!session.pages[prev]) {
      session.pages[prev] = {
        page: event.previousPage || "",
        leaf: prev,
        label: event.previousLeafLabel || prev,
        views: 0,
        ms: 0,
      };
    }
    session.pages[prev].ms += Math.max(0, Math.min(event.durationMs, 1000 * 60 * 60 * 8));
  }

  if (event.type === "heartbeat" && typeof event.durationMs === "number") {
    session.durationMs = Math.max(session.durationMs, event.durationMs);
    if (event.leaf) {
      const key = event.leaf;
      if (!session.pages[key]) {
        session.pages[key] = {
          page: event.page || "",
          leaf: key,
          label: event.leafLabel || key,
          views: 0,
          ms: 0,
        };
      }
      // heartbeat manda delta de la página actual
      if (typeof event.pageDeltaMs === "number" && event.pageDeltaMs > 0) {
        session.pages[key].ms += Math.min(event.pageDeltaMs, 120_000);
      }
    }
  }

  if (event.type === "logout") {
    session.endedAt = now;
    if (typeof event.durationMs === "number") {
      session.durationMs = Math.max(session.durationMs, event.durationMs);
    } else {
      const start = Date.parse(session.startedAt);
      const end = Date.parse(now);
      if (Number.isFinite(start) && Number.isFinite(end)) {
        session.durationMs = Math.max(session.durationMs, Math.max(0, end - start));
      }
    }
    if (event.leaf && typeof event.pageDeltaMs === "number") {
      const key = event.leaf;
      if (!session.pages[key]) {
        session.pages[key] = {
          page: event.page || "",
          leaf: key,
          label: event.leafLabel || key,
          views: 0,
          ms: 0,
        };
      }
      session.pages[key].ms += Math.max(0, event.pageDeltaMs);
    }
  }
}

function buildReport(store) {
  const sessions = Object.values(store.sessions || {});
  const byUser = new Map();
  const pageAgg = new Map();
  let activeNow = 0;
  const cutoff = Date.now() - 2 * 60 * 1000;

  for (const s of sessions) {
    const last = Date.parse(s.lastSeenAt || s.startedAt || 0);
    if (Number.isFinite(last) && last >= cutoff && !s.endedAt) activeNow += 1;

    const start = Date.parse(s.startedAt || 0);
    const end = Date.parse(s.endedAt || s.lastSeenAt || 0);
    let duration = s.durationMs || 0;
    if ((!duration || duration < 1000) && Number.isFinite(start) && Number.isFinite(end) && end >= start) {
      duration = end - start;
    }

    const uid = s.userId || s.email || "unknown";
    if (!byUser.has(uid)) {
      byUser.set(uid, {
        userId: uid,
        name: s.name || "—",
        email: s.email || "—",
        role: s.role || "—",
        sessions: 0,
        totalMs: 0,
        lastSeenAt: s.lastSeenAt || s.startedAt,
        pages: {},
      });
    }
    const u = byUser.get(uid);
    u.sessions += 1;
    u.totalMs += duration;
    u.name = s.name || u.name;
    u.email = s.email || u.email;
    u.role = s.role || u.role;
    if ((s.lastSeenAt || "") > (u.lastSeenAt || "")) u.lastSeenAt = s.lastSeenAt;

    for (const p of Object.values(s.pages || {})) {
      if (!pageAgg.has(p.leaf)) {
        pageAgg.set(p.leaf, { leaf: p.leaf, page: p.page, label: p.label, views: 0, ms: 0 });
      }
      const agg = pageAgg.get(p.leaf);
      agg.views += p.views || 0;
      agg.ms += p.ms || 0;
      agg.label = p.label || agg.label;

      if (!u.pages[p.leaf]) u.pages[p.leaf] = { leaf: p.leaf, label: p.label, views: 0, ms: 0 };
      u.pages[p.leaf].views += p.views || 0;
      u.pages[p.leaf].ms += p.ms || 0;
    }
  }

  const users = [...byUser.values()]
    .map((u) => ({
      ...u,
      avgMs: u.sessions ? u.totalMs / u.sessions : 0,
      topPages: Object.values(u.pages)
        .sort((a, b) => b.ms - a.ms || b.views - a.views)
        .slice(0, 5),
    }))
    .sort((a, b) => b.totalMs - a.totalMs);

  const topByTime = [...pageAgg.values()].sort((a, b) => b.ms - a.ms).slice(0, 15);
  const topByViews = [...pageAgg.values()].sort((a, b) => b.views - a.views).slice(0, 15);

  const totalMs = users.reduce((s, u) => s + u.totalMs, 0);
  const totalSessions = sessions.length;

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      uniqueUsers: users.length,
      totalSessions,
      activeNow,
      totalMs,
      avgSessionMs: totalSessions ? totalMs / totalSessions : 0,
      totalEvents: (store.events || []).length,
    },
    users,
    topByTime,
    topByViews,
    recentSessions: sessions
      .slice()
      .sort((a, b) => String(b.lastSeenAt).localeCompare(String(a.lastSeenAt)))
      .slice(0, 40)
      .map((s) => ({
        sessionId: s.sessionId,
        name: s.name,
        email: s.email,
        role: s.role,
        startedAt: s.startedAt,
        lastSeenAt: s.lastSeenAt,
        endedAt: s.endedAt,
        durationMs: s.durationMs,
        pageCount: Object.keys(s.pages || {}).length,
      })),
  };
}

function safeJoin(root, reqPath) {
  const decoded = decodeURIComponent(reqPath.split("?")[0]);
  const cleaned = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  const full = path.join(root, cleaned);
  if (!full.startsWith(root)) return null;
  return full;
}

function serveStatic(req, res) {
  const urlPath = req.url === "/" ? "/index.html" : req.url.split("?")[0];
  let filePath = safeJoin(DIST, urlPath);
  if (!filePath) {
    json(res, 400, { error: "bad path" });
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    // SPA fallback
    filePath = path.join(DIST, "index.html");
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found — run npm run build");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    "Content-Type": MIME[ext] || "application/octet-stream",
    "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=86400",
  });
  fs.createReadStream(filePath).pipe(res);
}

ensureStore();

const server = http.createServer(async (req, res) => {
  const url = req.url || "/";

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  if (url.startsWith("/api/analytics/event") && req.method === "POST") {
    try {
      const body = await readBody(req);
      if (!body?.sessionId || !body?.type || !body?.userId) {
        json(res, 400, { error: "sessionId, type y userId son requeridos" });
        return;
      }
      const store = readStore();
      applyEvent(store, body);
      writeStore(store);
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store",
      });
      res.end();
    } catch (e) {
      json(res, 400, { error: String(e?.message || e) });
    }
    return;
  }

  if (url.startsWith("/api/analytics/report") && req.method === "GET") {
    const store = readStore();
    json(res, 200, buildReport(store));
    return;
  }

  if (url.startsWith("/api/health")) {
    json(res, 200, { ok: true, service: "opsai-reliability" });
    return;
  }

  if (req.method === "GET" || req.method === "HEAD") {
    serveStatic(req, res);
    return;
  }

  json(res, 405, { error: "method not allowed" });
});

server.listen(PORT, HOST, () => {
  console.log(`opsai-reliability listening on http://${HOST}:${PORT}`);
});
