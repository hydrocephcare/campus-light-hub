import type { VercelRequest, VercelResponse } from '@vercel/node';

const SITE = 'https://mkucuu.lovable.app';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://qxrllmbyznsnfzdkupbt.supabase.co';
const ANON = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

const esc = (v = '') => v.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const abs = (v?: string | null) => !v ? `${SITE}/pwa-icon-512.png` : /^https?:\/\//i.test(v) ? v : `${SITE}${v.startsWith('/')?'':'/'}${v}`;

async function get(table:string, filter:string) {
  if (!ANON) return null;
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {headers:{apikey:ANON,Authorization:`Bearer ${ANON}`}});
  if (!r.ok) return null;
  const rows = await r.json(); return rows?.[0] || null;
}

export default async function handler(req:VercelRequest,res:VercelResponse) {
  const kind = String(req.query.kind || ''); const key = String(req.query.key || '');
  let title='MKU Christian Union', description='A vibrant community of students growing in the knowledge of God.', image=`${SITE}/pwa-icon-512.png`, target=SITE;
  try {
    if(kind==='event' && key){
      const row=await get('events',`id=eq.${encodeURIComponent(key)}&select=*`); target=`${SITE}/events/${encodeURIComponent(key)}`;
      if(row){ const date=new Date(`${row.event_date}T12:00:00`).toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'}); title=row.title; description=[row.theme,row.scripture,`${date} · ${row.start_time||''}${row.end_time?` – ${row.end_time}`:''} · ${row.location||''}`,row.description].filter(Boolean).join(' — ').slice(0,300); image=abs(row.image_url); }
    } else if(kind==='post' && key){
      const row=await get('blog_posts',`slug=eq.${encodeURIComponent(key)}&is_published=eq.true&select=*`); target=`${SITE}/blog/${encodeURIComponent(key)}`;
      if(row){title=row.title;description=row.excerpt||String(row.content||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().slice(0,240);image=abs(row.featured_image);}
    } else if(kind==='photo' && key){
      const row=await get('media_gallery',`id=eq.${encodeURIComponent(key)}&select=*`); target=`${SITE}/gallery?photo=${encodeURIComponent(key)}`;
      if(row){title=row.title||'MKU Christian Union Gallery';description=row.description||'From the MKU Christian Union gallery.';image=abs(row.media_url);}
    }
  } catch {}
  const html=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta property="og:site_name" content="MKU Christian Union"><meta property="og:type" content="article"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${esc(target)}"><meta property="og:image" content="${esc(image)}"><meta property="og:image:secure_url" content="${esc(image)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${esc(image)}"><meta http-equiv="refresh" content="0;url=${esc(target)}"></head><body><a href="${esc(target)}">Continue to ${esc(title)}</a><script>location.replace(${JSON.stringify(target)})</script></body></html>`;
  res.setHeader('Content-Type','text/html; charset=utf-8'); res.setHeader('Cache-Control','public, s-maxage=300, stale-while-revalidate=600'); res.status(200).send(html);
}
