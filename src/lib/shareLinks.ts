// Share links point at a small public endpoint that serves real Open Graph tags
// (title + the item's own image) to link-preview crawlers, then instantly
// redirects people to the matching page on the site.

const FUNCTIONS_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/share`;

export type ShareKind = "event" | "post" | "photo" | "page";

export function shareUrl(kind: ShareKind, key: string): string {
  return `${FUNCTIONS_BASE}/${kind}/${encodeURIComponent(key)}`;
}

export async function shareItem(opts: {
  kind: ShareKind;
  key: string;
  title: string;
  text?: string;
  onCopied?: () => void;
}) {
  const url = shareUrl(opts.kind, opts.key);
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title: opts.title, text: opts.text || opts.title, url });
      return;
    } catch {
      /* user cancelled — fall through to copy */
    }
  }
  await navigator.clipboard.writeText(url);
  opts.onCopied?.();
}
