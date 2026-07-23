import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use('*', logger(console.log));

app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

const getServiceClient = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

const getAnonClient = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  );

async function getAuthUser(authHeader: string | null) {
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  if (!token) return null;
  const { data: { user }, error } = await getAnonClient().auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// ─── Health ────────────────────────────────────────────────────────────────
app.get("/make-server-7faefafb/health", (c) => c.json({ status: "ok" }));

// ─── Auth: Sign Up ─────────────────────────────────────────────────────────
app.post("/make-server-7faefafb/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    if (!email || !password || !name) {
      return c.json({ error: "email, password et name sont requis" }, 400);
    }
    const { data, error } = await getServiceClient().auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true,
    });
    if (error) {
      console.log(`Signup error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }
    return c.json({ user: data.user });
  } catch (err) {
    console.log(`Signup unexpected error: ${err}`);
    return c.json({ error: `Erreur serveur signup: ${err}` }, 500);
  }
});

// ─── Auth: Sign In ─────────────────────────────────────────────────────────
app.post("/make-server-7faefafb/signin", async (c) => {
  try {
    const { email, password } = await c.req.json();
    const { data, error } = await getAnonClient().auth.signInWithPassword({ email, password });
    if (error) {
      console.log(`Signin error: ${error.message}`);
      return c.json({ error: error.message }, 401);
    }
    return c.json({ access_token: data.session?.access_token, user: data.user });
  } catch (err) {
    console.log(`Signin unexpected error: ${err}`);
    return c.json({ error: `Erreur serveur signin: ${err}` }, 500);
  }
});

// ─── Preferences: Save ─────────────────────────────────────────────────────
app.post("/make-server-7faefafb/preferences", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "Non autorisé" }, 401);
    const prefs = await c.req.json();
    await kv.set(`user_prefs:${user.id}`, prefs);
    return c.json({ success: true });
  } catch (err) {
    console.log(`Save preferences error: ${err}`);
    return c.json({ error: `Erreur sauvegarde préférences: ${err}` }, 500);
  }
});

// ─── Preferences: Get ──────────────────────────────────────────────────────
app.get("/make-server-7faefafb/preferences", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "Non autorisé" }, 401);
    const prefs = await kv.get(`user_prefs:${user.id}`);
    return c.json({ preferences: prefs ?? {} });
  } catch (err) {
    console.log(`Get preferences error: ${err}`);
    return c.json({ error: `Erreur récupération préférences: ${err}` }, 500);
  }
});

// ─── Route History: Save ───────────────────────────────────────────────────
app.post("/make-server-7faefafb/routes/history", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    const body = await c.req.json();
    const userId = user?.id ?? body.sessionId ?? "anonymous";
    const timestamp = Date.now();
    await kv.set(`route:${userId}:${timestamp}`, {
      ...body,
      savedAt: new Date().toISOString(),
      userId,
    });
    return c.json({ success: true });
  } catch (err) {
    console.log(`Save route error: ${err}`);
    return c.json({ error: `Erreur sauvegarde trajet: ${err}` }, 500);
  }
});

// ─── Route History: Get ────────────────────────────────────────────────────
app.get("/make-server-7faefafb/routes/history", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    const sessionId = c.req.query("sessionId");
    const userId = user?.id ?? sessionId ?? "anonymous";
    const routes = await kv.getByPrefix(`route:${userId}:`);
    const sorted = (routes as any[])
      .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
      .slice(0, 20);
    return c.json({ routes: sorted });
  } catch (err) {
    console.log(`Get routes error: ${err}`);
    return c.json({ error: `Erreur récupération historique: ${err}` }, 500);
  }
});

// ─── Metrics: Get ──────────────────────────────────────────────────────────
app.get("/make-server-7faefafb/metrics", async (c) => {
  try {
    const metrics = await kv.get("app_metrics:global");
    return c.json({
      metrics: metrics ?? { totalDownloads: 127800, totalViews: 4200000, totalLikes: 98400 },
    });
  } catch (err) {
    console.log(`Get metrics error: ${err}`);
    return c.json({ error: `Erreur métriques: ${err}` }, 500);
  }
});

// ─── Metrics: Increment ────────────────────────────────────────────────────
app.post("/make-server-7faefafb/metrics/:type", async (c) => {
  try {
    const type = c.req.param("type");
    const current: any = await kv.get("app_metrics:global") ?? {
      totalDownloads: 127800, totalViews: 4200000, totalLikes: 98400,
    };
    if (type === "like") current.totalLikes = (current.totalLikes ?? 0) + 1;
    if (type === "view") current.totalViews = (current.totalViews ?? 0) + 1;
    if (type === "download") current.totalDownloads = (current.totalDownloads ?? 0) + 1;
    await kv.set("app_metrics:global", current);
    return c.json({ success: true, metrics: current });
  } catch (err) {
    console.log(`Increment metrics error: ${err}`);
    return c.json({ error: `Erreur mise à jour métriques: ${err}` }, 500);
  }
});

Deno.serve(app.fetch);
