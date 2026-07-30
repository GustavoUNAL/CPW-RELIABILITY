import type { SessionUser } from "./users";

export type AnalyticsEventType = "login" | "logout" | "page_view" | "heartbeat";

export type AnalyticsEvent = {
  type: AnalyticsEventType;
  sessionId: string;
  userId: string;
  email: string;
  name: string;
  role: string;
  ts: string;
  page?: string;
  leaf?: string;
  leafLabel?: string;
  previousPage?: string;
  previousLeaf?: string;
  previousLeafLabel?: string;
  durationMs?: number;
  pageDeltaMs?: number;
};

const LOCAL_KEY = "cpw-usage-analytics-v1";
const SESSION_ID_KEY = "cpw-usage-session-id-v1";

function nowIso() {
  return new Date().toISOString();
}

function newSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `s-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function readLocalStore(): { events: AnalyticsEvent[]; sessions: Record<string, unknown> } {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return { events: [], sessions: {} };
    const parsed = JSON.parse(raw);
    return {
      events: Array.isArray(parsed.events) ? parsed.events : [],
      sessions: parsed.sessions && typeof parsed.sessions === "object" ? parsed.sessions : {},
    };
  } catch {
    return { events: [], sessions: {} };
  }
}

function writeLocalStore(store: { events: AnalyticsEvent[]; sessions: Record<string, unknown> }) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(store));
  } catch {
    /* ignore */
  }
}

/** Aplica el mismo esquema local que el servidor (resumen offline / fallback). */
function applyLocal(event: AnalyticsEvent) {
  const store = readLocalStore();
  store.events.push(event);
  if (store.events.length > 5000) store.events = store.events.slice(-4000);

  const sid = event.sessionId;
  const sessions = store.sessions as Record<
    string,
    {
      sessionId: string;
      userId: string;
      email: string;
      name: string;
      role: string;
      startedAt: string;
      lastSeenAt: string;
      endedAt: string | null;
      durationMs: number;
      pages: Record<string, { page: string; leaf: string; label: string; views: number; ms: number }>;
    }
  >;

  if (!sessions[sid]) {
    sessions[sid] = {
      sessionId: sid,
      userId: event.userId,
      email: event.email,
      name: event.name,
      role: event.role,
      startedAt: event.ts,
      lastSeenAt: event.ts,
      endedAt: null,
      durationMs: 0,
      pages: {},
    };
  }
  const session = sessions[sid];
  session.lastSeenAt = event.ts;
  session.name = event.name || session.name;
  session.email = event.email || session.email;
  session.role = event.role || session.role;

  if (event.type === "login") {
    session.startedAt = event.ts;
    session.endedAt = null;
  }
  if (event.type === "page_view" && event.leaf) {
    if (!session.pages[event.leaf]) {
      session.pages[event.leaf] = {
        page: event.page || "",
        leaf: event.leaf,
        label: event.leafLabel || event.leaf,
        views: 0,
        ms: 0,
      };
    }
    session.pages[event.leaf].views += 1;
    session.pages[event.leaf].label = event.leafLabel || session.pages[event.leaf].label;
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
    session.pages[prev].ms += Math.max(0, Math.min(event.durationMs, 8 * 60 * 60 * 1000));
  }
  if (event.type === "heartbeat") {
    if (typeof event.durationMs === "number") {
      session.durationMs = Math.max(session.durationMs, event.durationMs);
    }
    if (event.leaf && typeof event.pageDeltaMs === "number" && event.pageDeltaMs > 0) {
      if (!session.pages[event.leaf]) {
        session.pages[event.leaf] = {
          page: event.page || "",
          leaf: event.leaf,
          label: event.leafLabel || event.leaf,
          views: 0,
          ms: 0,
        };
      }
      session.pages[event.leaf].ms += Math.min(event.pageDeltaMs, 120_000);
    }
  }
  if (event.type === "logout") {
    session.endedAt = event.ts;
    if (typeof event.durationMs === "number") {
      session.durationMs = Math.max(session.durationMs, event.durationMs);
    }
    if (event.leaf && typeof event.pageDeltaMs === "number") {
      if (!session.pages[event.leaf]) {
        session.pages[event.leaf] = {
          page: event.page || "",
          leaf: event.leaf,
          label: event.leafLabel || event.leaf,
          views: 0,
          ms: 0,
        };
      }
      session.pages[event.leaf].ms += Math.max(0, event.pageDeltaMs);
    }
  }

  writeLocalStore({ events: store.events, sessions });
}

async function postEvent(event: AnalyticsEvent) {
  applyLocal(event);
  try {
    await fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
      keepalive: event.type === "logout" || event.type === "heartbeat",
    });
  } catch {
    /* offline / vite-only: localStorage ya guardó */
  }
}

export function getOrCreateAnalyticsSessionId(forceNew = false): string {
  try {
    if (!forceNew) {
      const existing = sessionStorage.getItem(SESSION_ID_KEY);
      if (existing) return existing;
    }
    const id = newSessionId();
    sessionStorage.setItem(SESSION_ID_KEY, id);
    return id;
  } catch {
    return newSessionId();
  }
}

export function clearAnalyticsSessionId() {
  try {
    sessionStorage.removeItem(SESSION_ID_KEY);
  } catch {
    /* ignore */
  }
}

function baseEvent(
  type: AnalyticsEventType,
  user: SessionUser,
  sessionId: string,
): Omit<AnalyticsEvent, "type"> & { type: AnalyticsEventType } {
  return {
    type,
    sessionId,
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    ts: nowIso(),
  };
}

export async function trackLogin(user: SessionUser, sessionId: string) {
  await postEvent(baseEvent("login", user, sessionId));
}

export async function trackLogout(
  user: SessionUser,
  sessionId: string,
  extras: {
    durationMs: number;
    page?: string;
    leaf?: string;
    leafLabel?: string;
    pageDeltaMs?: number;
  },
) {
  await postEvent({
    ...baseEvent("logout", user, sessionId),
    ...extras,
  });
  clearAnalyticsSessionId();
}

export async function trackPageView(
  user: SessionUser,
  sessionId: string,
  next: { page: string; leaf: string; leafLabel: string },
  prev: {
    page?: string;
    leaf?: string;
    leafLabel?: string;
    durationMs: number;
  } | null,
) {
  await postEvent({
    ...baseEvent("page_view", user, sessionId),
    page: next.page,
    leaf: next.leaf,
    leafLabel: next.leafLabel,
    previousPage: prev?.page,
    previousLeaf: prev?.leaf,
    previousLeafLabel: prev?.leafLabel,
    durationMs: prev?.durationMs,
  });
}

export async function trackHeartbeat(
  user: SessionUser,
  sessionId: string,
  extras: {
    durationMs: number;
    page?: string;
    leaf?: string;
    leafLabel?: string;
    pageDeltaMs?: number;
  },
) {
  await postEvent({
    ...baseEvent("heartbeat", user, sessionId),
    ...extras,
  });
}

export type UsageReport = {
  generatedAt: string;
  source: "server" | "local";
  summary: {
    uniqueUsers: number;
    totalSessions: number;
    activeNow: number;
    totalMs: number;
    avgSessionMs: number;
    totalEvents: number;
  };
  users: Array<{
    userId: string;
    name: string;
    email: string;
    role: string;
    sessions: number;
    totalMs: number;
    avgMs: number;
    lastSeenAt: string;
    topPages: Array<{ leaf: string; label: string; views: number; ms: number }>;
  }>;
  topByTime: Array<{ leaf: string; page: string; label: string; views: number; ms: number }>;
  topByViews: Array<{ leaf: string; page: string; label: string; views: number; ms: number }>;
  recentSessions: Array<{
    sessionId: string;
    name: string;
    email: string;
    role: string;
    startedAt: string;
    lastSeenAt: string;
    endedAt: string | null;
    durationMs: number;
    pageCount: number;
  }>;
};

function buildLocalReport(): UsageReport {
  const store = readLocalStore();
  const sessions = Object.values(store.sessions) as Array<{
    sessionId: string;
    userId: string;
    email: string;
    name: string;
    role: string;
    startedAt: string;
    lastSeenAt: string;
    endedAt: string | null;
    durationMs: number;
    pages: Record<string, { page: string; leaf: string; label: string; views: number; ms: number }>;
  }>;

  const byUser = new Map<string, UsageReport["users"][number] & { pages: Record<string, { leaf: string; label: string; views: number; ms: number }> }>();
  const pageAgg = new Map<string, { leaf: string; page: string; label: string; views: number; ms: number }>();
  const cutoff = Date.now() - 2 * 60 * 1000;
  let activeNow = 0;

  for (const s of sessions) {
    const last = Date.parse(s.lastSeenAt || s.startedAt || "");
    if (Number.isFinite(last) && last >= cutoff && !s.endedAt) activeNow += 1;

    const start = Date.parse(s.startedAt || "");
    const end = Date.parse(s.endedAt || s.lastSeenAt || "");
    let duration = s.durationMs || 0;
    if ((!duration || duration < 1000) && Number.isFinite(start) && Number.isFinite(end) && end >= start) {
      duration = end - start;
    }

    const uid = s.userId || s.email;
    if (!byUser.has(uid)) {
      byUser.set(uid, {
        userId: uid,
        name: s.name,
        email: s.email,
        role: s.role,
        sessions: 0,
        totalMs: 0,
        avgMs: 0,
        lastSeenAt: s.lastSeenAt,
        topPages: [],
        pages: {},
      });
    }
    const u = byUser.get(uid)!;
    u.sessions += 1;
    u.totalMs += duration;
    if ((s.lastSeenAt || "") > (u.lastSeenAt || "")) u.lastSeenAt = s.lastSeenAt;

    for (const p of Object.values(s.pages || {})) {
      if (!pageAgg.has(p.leaf)) pageAgg.set(p.leaf, { ...p });
      else {
        const a = pageAgg.get(p.leaf)!;
        a.views += p.views;
        a.ms += p.ms;
      }
      if (!u.pages[p.leaf]) u.pages[p.leaf] = { leaf: p.leaf, label: p.label, views: 0, ms: 0 };
      u.pages[p.leaf].views += p.views;
      u.pages[p.leaf].ms += p.ms;
    }
  }

  const users = [...byUser.values()].map((u) => ({
    userId: u.userId,
    name: u.name,
    email: u.email,
    role: u.role,
    sessions: u.sessions,
    totalMs: u.totalMs,
    avgMs: u.sessions ? u.totalMs / u.sessions : 0,
    lastSeenAt: u.lastSeenAt,
    topPages: Object.values(u.pages)
      .sort((a, b) => b.ms - a.ms || b.views - a.views)
      .slice(0, 5),
  }));

  const totalMs = users.reduce((s, u) => s + u.totalMs, 0);

  return {
    generatedAt: nowIso(),
    source: "local",
    summary: {
      uniqueUsers: users.length,
      totalSessions: sessions.length,
      activeNow,
      totalMs,
      avgSessionMs: sessions.length ? totalMs / sessions.length : 0,
      totalEvents: store.events.length,
    },
    users: users.sort((a, b) => b.totalMs - a.totalMs),
    topByTime: [...pageAgg.values()].sort((a, b) => b.ms - a.ms).slice(0, 15),
    topByViews: [...pageAgg.values()].sort((a, b) => b.views - a.views).slice(0, 15),
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

export async function fetchUsageReport(): Promise<UsageReport> {
  try {
    const res = await fetch("/api/analytics/report", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as Omit<UsageReport, "source">;
    return { ...data, source: "server" };
  } catch {
    return buildLocalReport();
  }
}

export function formatDuration(ms: number): string {
  if (!ms || ms < 0) return "0 min";
  const totalSec = Math.round(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h} h ${m} min`;
  if (m > 0) return `${m} min ${s} s`;
  return `${s} s`;
}
