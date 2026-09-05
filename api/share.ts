const SITE = 'https://mku-cu-project.vercel.app';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://qxrllmbyznsnfzdkupbt.supabase.co';
const ANON = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_3whrL3DPF8n8DOyhWqJhLA_ph80S45v';

const esc = (v = '') => String(v)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const abs = (v) => {
  if (!v) return `${SITE}/pwa-icon-512.png`;
  return /^https?:\/\//i.test(String(v)) ? String(v) : `${SITE}${String(v).startsWith('/') ? '' : '/'}${v}`;
};

const BUILT_IN_POSTS = {
  'new-to-mku-welcome-to-mku-christian-union': {
    title: 'New to MKU? Welcome to MKU Christian Union',
    description: 'Starting university can feel like stepping into a completely new world. For first-year students, visitors and anyone looking for a Christian community at Mount Kenya University, MKU Christian Union is a place to worship, grow, serve and find fellowship.',
    image: 'https://res.cloudinary.com/l4wbzpfr/image/upload/v1788632618/mkucu/blog/new-to-mku-welcome-to-mku-christian-union.jpg'
  },
  'manifesting-the-presence-of-the-lord': {
    title: 'Manifesting the Presence of the Lord',
    description: 'Pst. Kiseku Muange’s Semester Premier message challenged students to pursue God’s presence, discover their assignment, build people, develop their gifts, and remain faithful beyond the excitement of a new beginning.',
    image: `${SITE}/images/blog/manifesting-the-presence-of-the-lord.jpg`
  }
};

async function getRow(table, filter) {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
      headers: { apikey: ANON, Authorization: `Bearer ${ANON}`, Accept: 'application/json' }
    });
    if (!r.ok) return null;
    const rows = await r.json();
    return Array.isArray(rows) ? (rows[0] || null) : null;
  } catch {
    return null;
  }
}

function isPreviewCrawler(req) {
  const ua = String(req.headers?.['user-agent'] || '').toLowerCase();
  return /whatsapp|facebookexternalhit|facebot|twitterbot|linkedinbot|slackbot|discordbot|telegrambot|skypeuripreview|googlebot|bingbot|pinterestbot/.test(ua);
}

function sendHtml(res, title, description, image, target) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${esc(target)}"><meta property="og:site_name" content="MKU Christian Union"><meta property="og:type" content="article"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${esc(target)}"><meta property="og:image" content="${esc(image)}"><meta property="og:image:secure_url" content="${esc(image)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${esc(image)}"></head><body></body></html>`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  return res.status(200).send(html);
}

export default async function handler(req, res) {
  let title = 'MKU Christian Union';
  let description = 'A vibrant community of students growing in the knowledge of God.';
  let image = `${SITE}/pwa-icon-512.png`;
  let target = SITE;

  try {
    const kind = String((req.query && req.query.kind) || '');
    const key = String((req.query && req.query.key) || '');

    if (kind === 'event' && key) {
      const row = await getRow('events', `id=eq.${encodeURIComponent(key)}&select=*`);
      target = `${SITE}/events/${encodeURIComponent(key)}`;
      if (row) {
        const date = row.event_date
          ? new Date(`${row.event_date}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
          : '';
        const isCurrentSunday = row.event_date === '2026-09-06' && String(row.title || '').toLowerCase().includes('sunday service');
        const start = isCurrentSunday ? '7:00 AM' : (row.start_time || '');
        const end = isCurrentSunday ? '12:45 PM' : (row.end_time || '');
        const location = isCurrentSunday ? 'CC Hall' : (row.location || '');
        const theme = isCurrentSunday ? 'Manifestation of the Glory of God' : row.theme;
        const scripture = isCurrentSunday ? 'Isaiah 60:1' : row.scripture;
        const body = isCurrentSunday
          ? 'Ministering: Pastor Muange Kiseku. Come expectant and ready to listen to the Lord and be refreshed. We will also be praying for our country, Kenya.'
          : row.description;
        title = row.title || 'MKU Christian Union Event';
        description = [theme, scripture, body, `${date}${start ? ` · ${start}${end ? ` – ${end}` : ''}` : ''}${location ? ` · ${location}` : ''}`]
          .filter(Boolean).join(' — ').slice(0, 320);
        image = abs(row.image_url);
      }
    } else if (kind === 'post' && key) {
      target = `${SITE}/blog/${encodeURIComponent(key)}`;
      const builtIn = BUILT_IN_POSTS[key];
      const row = await getRow('blog_posts', `slug=eq.${encodeURIComponent(key)}&is_published=eq.true&select=*`);
      if (row) {
        title = row.title || 'MKU Christian Union';
        description = row.excerpt || String(row.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 260);
        image = abs(row.featured_image);
      } else if (builtIn) {
        title = builtIn.title;
        description = builtIn.description;
        image = abs(builtIn.image);
      }
    } else if (kind === 'photo' && key) {
      const row = await getRow('media_gallery', `id=eq.${encodeURIComponent(key)}&select=*`);
      target = `${SITE}/gallery?photo=${encodeURIComponent(key)}`;
      if (row) {
        title = row.title || 'MKU Christian Union Gallery';
        description = row.description || 'From the MKU Christian Union gallery.';
        image = abs(row.media_url);
      }
    } else if (kind === 'page') {
      const clean = key.replace(/^\//, '');
      target = clean ? `${SITE}/${clean}` : SITE;
      const meta = {
        events: ['Events | MKU Christian Union', 'Discover upcoming gatherings, services, missions and archived events from MKU Christian Union.'],
        gallery: ['Gallery | MKU Christian Union', 'Photos and memories from worship, fellowship, missions and ministry life at MKU Christian Union.'],
        blog: ['The Journal | MKU Christian Union', 'Read sermons, reflections, testimonies and stories from MKU Christian Union.'],
        leadership: ['Leadership | MKU Christian Union', 'Meet the leaders serving the Mount Kenya University Christian Union community.'],
        ministries: ['Ministries | MKU Christian Union', 'Explore the ministries serving and equipping students at MKU Christian Union.'],
        missions: ['Missions | MKU Christian Union', 'Follow MKU Christian Union missions, outreach and gospel work beyond campus.'],
        media: ['Media | MKU Christian Union', 'Watch, listen and explore media from MKU Christian Union gatherings and ministry life.'],
        schedule: ['Schedule | MKU Christian Union', 'View the latest MKU Christian Union weekly activities and service schedule.'],
        about: ['About | MKU Christian Union', 'Learn about the vision, mission and community of Mount Kenya University Christian Union.'],
        contact: ['Contact | MKU Christian Union', 'Connect with Mount Kenya University Christian Union.']
      }[clean];
      if (meta) {
        title = meta[0];
        description = meta[1];
      }
    }
  } catch {
    // Keep valid fallback metadata.
  }

  // Social crawlers get Open Graph HTML. Human visitors never see this preview page.
  if (!isPreviewCrawler(req)) {
    res.setHeader('Cache-Control', 'no-store');
    return res.redirect(302, target);
  }

  return sendHtml(res, title, description, image, target);
}
