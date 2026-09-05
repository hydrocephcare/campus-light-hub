import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const CLOUD_NAME = Deno.env.get("CLOUDINARY_CLOUD_NAME")!;
const API_KEY = Deno.env.get("CLOUDINARY_API_KEY")!;
const API_SECRET = Deno.env.get("CLOUDINARY_API_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

type Target = {
  table: string;
  column: string;
  folder: string;
  resource?: "image" | "video" | "auto";
};

const TARGETS: Target[] = [
  { table: "media_gallery", column: "media_url", folder: "mkucu/gallery", resource: "auto" },
  { table: "mission_media", column: "media_url", folder: "mkucu/missions", resource: "auto" },
  { table: "mission_media", column: "thumbnail_url", folder: "mkucu/missions/thumbs" },
  { table: "events", column: "image_url", folder: "mkucu/events" },
  { table: "blog_posts", column: "featured_image", folder: "mkucu/blog" },
  { table: "leaders", column: "image_url", folder: "mkucu/leaders" },
  { table: "leadership_terms", column: "poster_url", folder: "mkucu/leaders/posters" },
  { table: "hero_slides", column: "image_url", folder: "mkucu/hero" },
  { table: "missions", column: "cover_image", folder: "mkucu/missions/covers" },
  { table: "election_candidates", column: "image_url", folder: "mkucu/elections" },
  { table: "ministries", column: "image_url", folder: "mkucu/ministries" },
  { table: "announcements", column: "image_url", folder: "mkucu/announcements" },
];

async function sha1Hex(input: string) {
  const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function uploadToCloudinary(sourceUrl: string, folder: string, resource: string) {
  const timestamp = Math.floor(Date.now() / 1000);
  const params: Record<string, string> = {
    folder,
    overwrite: "false",
    timestamp: String(timestamp),
    unique_filename: "true",
    use_filename: "true",
  };
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  const signature = await sha1Hex(toSign + API_SECRET);

  const form = new FormData();
  form.append("file", sourceUrl);
  for (const [k, v] of Object.entries(params)) form.append(k, v);
  form.append("api_key", API_KEY);
  form.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resource}/upload`, {
    method: "POST",
    body: form,
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`[${res.status}] ${body}`);
  return JSON.parse(body) as { secure_url: string; public_id: string };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
      return json({ error: "Cloudinary credentials are not configured" }, 500);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false },
    });

    // Auth: service role key, or an authenticated admin user.
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "").trim();
    const migrationKey = Deno.env.get("MIGRATION_ADMIN_KEY");
    let authorized =
      token === SERVICE_ROLE ||
      (Boolean(migrationKey) && req.headers.get("x-migration-key") === migrationKey);
    if (!authorized && token) {
      const { data: userData } = await admin.auth.getUser(token);
      const uid = userData?.user?.id;
      if (uid) {
        const { data: isAdmin } = await admin.rpc("has_role", { _user_id: uid, _role: "admin" });
        authorized = Boolean(isAdmin);
      }
    }
    if (!authorized) return json({ error: "Not authorized" }, 403);

    const payload = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const limit = Math.min(Number(payload.limit) || 40, 100);
    const dryRun = Boolean(payload.dryRun);

    const results: Record<string, { migrated: number; failed: number; remaining: number }> = {};
    const errors: string[] = [];
    let budget = limit;

    for (const target of TARGETS) {
      const { data: rows, error } = await admin
        .from(target.table)
        .select(`id, ${target.column}`)
        .not(target.column, "is", null)
        .not(target.column, "ilike", "%res.cloudinary.com%")
        .limit(Math.max(budget, 1) + 200);

      if (error) {
        // Table/column may not exist in this project — skip quietly.
        continue;
      }

      const pending = (rows ?? []).filter((r: Record<string, unknown>) => {
        const v = r[target.column];
        if (typeof v !== "string" || !/^https?:\/\//.test(v)) return false;
        // Streaming/embed links (YouTube, Drive previews) stay as embeds — nothing to upload.
        return !/(youtube\.com|youtu\.be|drive\.google\.com\/file)/i.test(v);
      });

      let migrated = 0;
      let failed = 0;

      if (!dryRun) {
        for (const row of pending) {
          if (budget <= 0) break;
          const sourceUrl = (row as Record<string, string>)[target.column];
          try {
            const isVideo = /\.(mp4|mov|webm|m4v|avi)(\?|$)/i.test(sourceUrl);
            const resource = target.resource === "auto" ? (isVideo ? "video" : "image") : "image";
            const uploaded = await uploadToCloudinary(sourceUrl, target.folder, resource);
            const { error: updateError } = await admin
              .from(target.table)
              .update({ [target.column]: uploaded.secure_url })
              .eq("id", (row as { id: string }).id);
            if (updateError) throw new Error(updateError.message);
            migrated++;
          } catch (e) {
            failed++;
            if (errors.length < 10) {
              errors.push(`${target.table}.${target.column}: ${(e as Error).message}`);
            }
          }
          budget--;
        }
      }

      const key = `${target.table}.${target.column}`;
      results[key] = {
        migrated,
        failed,
        remaining: Math.max(pending.length - migrated, 0),
      };
    }

    const remaining = Object.values(results).reduce((sum, r) => sum + r.remaining, 0);
    return json({ ok: true, limit, dryRun, remaining, results, errors });
  } catch (e) {
    console.error("migrate-cloudinary failed:", e);
    return json({ error: (e as Error).message }, 500);
  }
});
