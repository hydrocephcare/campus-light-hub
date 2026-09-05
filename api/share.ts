import type { VercelRequest, VercelResponse } from '@vercel/node';
import { findBuiltInBlogPost } from '../src/data/blogPosts';

const SITE = 'https://mku-cu-project.vercel.app';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://qxrllmbyznsnfzdkupbt.supabase.co';
const ANON = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_3whrL3DPF8n8DOyhWqJhLA_ph80S45v';

const esc = (v = '') => v.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const abs = (v?: string | null) => !v ? `${SITE}/pwa-icon-512.png` : /^https?:\/\//i.test(v) ? v : `${SITE}${v.startsWith('/')?'':'/'}${v}`;

async function get(table:string, filter:string) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
    headers:{ apikey:ANON, Authorization:`Bearer ${ANON}`, Accept:'application/json' }
  });
  if (!r.ok) return null;
  const rows = await r.json();
  return Array.isArray(rows) ? rows[0] || null : null;
}

const PAGE_META: Record<string,{title:string;description:string;image?:string}> = {
  '': { title:'MKU Christian Union', description:'A vibrant community of students growing in the knowledge of God.' },
  events: { title:'Events | MKU Christian Union', description:'Discover upcoming gatherings, services, missions and archived events from MKU Christian Union.' },
  gallery: { title:'Gallery | MKU Christian Union', description:'Photos and memories from worship, fellowship, missions and ministry life at MKU Christian Union.' },
  blog: { title:'The Journal | MKU Christian Union', description:'Read sermons, reflections, testimonies and stories from MKU Christian Union.' },
  leaders: { title:'Leaders | MKU Christian Union', description:'Meet the leaders serving the Mount Kenya University Christian Union community.' },
  ministries: { title:'Ministries | MKU Christian Union', description:'Explore the ministries serving and equipping students at MKU Christian Union.' },
  missions: { title:'Missions | MKU Christian Union', description:'Follow MKU Christian Union missions, outreach and gospel work beyond campus.' },
  sermons: { title:'Sermons | MKU Christian Union', description:'Listen to and revisit teaching from MKU Christian Union gatherings.' },
};

export default async function handler(req:VercelRequest,res:VercelResponse) {
  const kind = String(req.query.kind || '');
  const key = String(req.query.key || '');
  let title='MKU Christian Union';
  let description='A vibrant community of students growing in the knowledge of God.';
  let image=`${SITE}/pwa-icon-512.png`;
  let target=SITE;

  try {
    if(kind==='event' && key){
      const row=await get('events',`id=eq.${encodeURIComponent(key)}&select=*`);
      target=`${SITE}/events/${encodeURIComponent(key)}`;
      if(row){
        const isCurrentSunday = row.event_date === '2026-09-06' && String(row.title || '').toLowerCase().includes('sunday service');
        const date=new Date(`${row.event_date}T12:00:00`).toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
        const start = isCurrentSunday ? '7:00 AM' : (row.start_time || '');
        const end = isCurrentSunday ? '12:45 PM' : (row.end_time || '');
        const location = isCurrentSunday ? 'CC Hall' : (row.location || '');
        const theme = isCurrentSunday ? 'Manifestation of the Glory of God' : row.theme;
        const scripture = isCurrentSunday ? 'Isaiah 60:1' : row.scripture;
        const body = isCurrentSunday
          ? 'Ministering: Pastor Muange Kiseku. Come expectant and ready to listen to the Lord and be refreshed. We will also be praying for our country, Kenya.'
          : row.description;
        title=row.title || 'MKU Christian Union Event';
        description=[theme, scripture, body, `${date} · ${start}${end?` – ${end}`:''} · ${location}`]
          .filter(Boolean).join(' — ').slice(0,320);
        image=abs(row.image_url);
      }
    } else if(kind==='post' && key){
      const remote=await get('blog_posts',`slug=eq.${encodeURIComponent(key)}&is_published=eq.true&select=*`);
      const row = remote || findBuiltInBlogPost(key);
      target=`${SITE}/blog/${encodeURIComponent(key)}`;
      if(row){
        title=row.title || 'MKU Christian Union';
        description=row.excerpt || String(row.content||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().slice(0,260);
        image=abs(row.featured_image);
      }
    } else if(kind==='photo' && key){
      const row=await get('media_gallery',`id=eq.${encodeURIComponent(key)}&select=*`);
      target=`${SITE}/gallery?photo=${encodeURIComponent(key)}`;
      if(row){
        title=row.title || 'MKU Christian Union Gallery';
        description=row.description || 'From the MKU Christian Union gallery.';
        image=abs(row.media_url);
      }
    } else if(kind==='page') {
      const clean = key.replace(/^\//,'');
      target = clean ? `${SITE}/${clean}` : SITE;
      const meta = PAGE_META[clean] || { title:`${clean ? clean.replace(/-/g,' ') : 'MKU Christian Union'} | MKU Christian Union`, description:'Mount Kenya University Christian Union — growing in faith, fellowship, service and mission.' };
      title = meta.title;
      description = meta.description;
      image = abs(meta.image);
    }
  } catch {}

  const html=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${esc(target)}"><meta property="og:site_name" content="MKU Christian Union"><meta property="og:type" content="article"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${esc(target)}"><meta property="og:image" content="${esc(image)}"><meta property="og:image:secure_url" content="${esc(image)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${esc(image)}"><meta http-equiv="refresh" content="0;url=${esc(target)}"></head><body><a href="${esc(target)}">Continue to ${esc(title)}</a><script>location.replace(${JSON.stringify(target)})</script></body></html>`;

  res.setHeader('Content-Type','text/html; charset=utf-8');
  res.setHeader('Cache-Control','public, s-maxage=60, stale-while-revalidate=300');
  res.status(200).send(html);
}
