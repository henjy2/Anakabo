import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";
import { cleanPreferences, cleanRoute, isPlainObject } from "./validation.ts";

const app = new Hono();
const API_PREFIX = "/make-server-7faefafb";

app.use("*", logger(console.log));
app.use(
  "/*",
  cors({
    origin: (origin) => {
      if (
        !origin
        || origin === "https://anakabo.com"
        || origin === "https://www.anakabo.com"
        || /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)
        || /^https:\/\/[a-z0-9-]+\.figma\.site$/i.test(origin)
        || /^https?:\/\/localhost(?::\d+)?$/i.test(origin)
      ) {
        return origin || "https://anakabo.com";
      }
      return "https://anakabo.com";
    },
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

function getAuthClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !anonKey) throw new Error("Configuration Supabase incomplète");
  return createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function requireUser(c: any) {
  const authorization = c.req.header("Authorization") ?? "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) return { response: c.json({ error: "Authentification requise" }, 401) };

  const { data, error } = await getAuthClient().auth.getUser(match[1]);
  if (error || !data.user) {
    return { response: c.json({ error: "Session invalide ou expirée" }, 401) };
  }
  return { user: data.user };
}

app.get(`${API_PREFIX}/health`, (c) => c.json({ status: "ok" }));

app.get(`${API_PREFIX}/preferences`, async (c) => {
  try {
    const auth = await requireUser(c);
    if (!auth.user) return auth.response;
    const preferences = await kv.get(`user_prefs:${auth.user.id}`);
    return c.json({ preferences: preferences ?? {} });
  } catch (error) {
    console.error("preferences:get", error);
    return c.json({ error: "Impossible de charger les préférences" }, 500);
  }
});

app.post(`${API_PREFIX}/preferences`, async (c) => {
  try {
    const auth = await requireUser(c);
    if (!auth.user) return auth.response;
    const preferences = cleanPreferences(await c.req.json());
    if (!preferences) return c.json({ error: "Préférences invalides" }, 400);
    await kv.set(`user_prefs:${auth.user.id}`, preferences);
    return c.json({ success: true, preferences });
  } catch (error) {
    console.error("preferences:save", error);
    return c.json({ error: "Impossible d’enregistrer les préférences" }, 500);
  }
});

app.get(`${API_PREFIX}/routes/history`, async (c) => {
  try {
    const auth = await requireUser(c);
    if (!auth.user) return auth.response;
    const routes = await kv.getByPrefix(`route:${auth.user.id}:`);
    const sorted = routes
      .filter(isPlainObject)
      .sort((a, b) => String(b.savedAt).localeCompare(String(a.savedAt)))
      .slice(0, 20);
    return c.json({ routes: sorted });
  } catch (error) {
    console.error("routes:get", error);
    return c.json({ error: "Impossible de charger l’historique" }, 500);
  }
});

app.post(`${API_PREFIX}/routes/history`, async (c) => {
  try {
    const auth = await requireUser(c);
    if (!auth.user) return auth.response;
    const route = cleanRoute(await c.req.json());
    if (!route) return c.json({ error: "Itinéraire invalide" }, 400);
    const id = crypto.randomUUID();
    const savedRoute = {
      ...route,
      id,
      savedAt: new Date().toISOString(),
    };
    await kv.set(`route:${auth.user.id}:${savedRoute.savedAt}:${id}`, savedRoute);
    return c.json({ success: true, route: savedRoute }, 201);
  } catch (error) {
    console.error("routes:save", error);
    return c.json({ error: "Impossible d’enregistrer l’itinéraire" }, 500);
  }
});

Deno.serve(app.fetch);
