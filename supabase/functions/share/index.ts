// Public share endpoint: serves crawler-readable Open Graph HTML for a single
// event / story / photo, then redirects real visitors to the actual page.
// Usage: /functions/v1/share/event/<id>, /share/post/<slug>, /share/photo/<id>

const SITE = "https://campus-light-hub.lovable.app";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const esc = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const abs = (url: string | null | undefined) => {
  if (!url) return `${SITE}/pwa-icon-512.png`;
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE}${url.startsWith("/") ? "" : "/"}${url}`;
};

async function restGet(path: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  });
  if (!res.ok) return null;
  const rows = await res.json();
  return Array.isArray(rows) ? rows[0] ?? null : null;
}

function page(opts: {
  title: string;
  description: string;
  image: string;
  target: string;
  type: string;
}) {
  const { title, description, image, target, type } = opts;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<link rel="canonical" href="${esc(target)}" />
<meta property="og:site_name" content="MKU Christian Union" />
<meta property="og:type" content="${esc(type)}" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:url" content="${esc(target)}" />
<meta property="og:image" content="${esc(image)}" />
<meta property="og:image:secure_url" content="${esc(image)}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
<meta name="twitter:image" content="${esc(image)}" />
<meta http-equiv="refresh" content="0; url=${esc(target)}" />
</head>
<body style="font-family:system-ui;margin:0;padding:48px;text-align:center">
<img src="${esc(image)}" alt="${esc(title)}" style="max-width:420px;width:100%;height:auto;border-radius:12px" />
<h1 style="font-size:20px">${esc(title)}</h1>
<p><a href="${esc(target)}">Continue to MKU Christian Union</a></p>
<script>location.replace(${JSON.stringify(target)});</script>
</body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const shareIdx = parts.indexOf("share");
  const kind = (parts[shareIdx + 1] || url.searchParams.get("type") || "").toLowerCase();
  const key = decodeURIComponent(parts.slice(shareIdx + 2).join("/") || url.searchParams.get("id") || "");

  let title = "MKU Christian Union";
  let description = "A vibrant community of students growing in the knowledge of God.";
  let image = `${SITE}/pwa-icon-512.png`;
  let target = SITE;
  let type = "website";

  try {
    if (kind === "event" && key) {
      const row = await restGet(`events?id=eq.${encodeURIComponent(key)}&select=*`);
      target = `${SITE}/events/${key}`;
      if (row) {
        const when = new Date(row.event_date).toLocaleDateString("en-GB", {
          weekday: "long", day: "numeric", month: "long", year: "numeric",
        });
        title = row.title;
        description = row.description || `${when} · ${row.start_time} · ${row.location}`;
        image = abs(row.image_url);
        type = "article";
      }
    } else if ((kind === "post" || kind === "story" || kind === "blog") && key) {
      const row = await restGet(`blog_posts?slug=eq.${encodeURIComponent(key)}&is_published=eq.true&select=*`);
      target = `${SITE}/blog/${key}`;
      if (row) {
        title = row.title;
        description = row.excerpt || String(row.content || "").replace(/<[^>]+>/g, "").slice(0, 180);
        image = abs(row.featured_image);
        type = "article";
      }
    } else if (kind === "photo" && key) {
      const row = await restGet(`media_gallery?id=eq.${encodeURIComponent(key)}&select=*`);
      target = `${SITE}/gallery`;
      if (row) {
        title = row.title;
        description = row.description || "From the MKU Christian Union gallery.";
        image = abs(row.media_url);
      }
    } else if (kind === "page" && key) {
      target = `${SITE}/${key.replace(/^\//, "")}`;
      title = `MKU Christian Union · ${key.replace(/^\//, "") || "Home"}`;
    }
  } catch (_e) {
    // fall through with site defaults
  }

  return new Response(page({ title, description, image, target, type }), {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=600",
    },
  });
});
