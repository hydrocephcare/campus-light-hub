// Public branded share-preview endpoint. It returns server-rendered Open Graph
// metadata to WhatsApp/Facebook/X and immediately redirects human visitors to
// the corresponding public MKUCU page.
const SITE = "https://mku-cu-project.vercel.app";

export type ShareKind = "event" | "post" | "photo" | "page";

export function shareUrl(kind: ShareKind, key: string): string {
  const cleanKey = key.replace(/^\//, "");
  return `${SITE}/share/${kind}/${encodeURIComponent(cleanKey)}`;
}

export async function shareItem(opts: {
  kind: ShareKind;
  key: string;
  title: string;
  text?: string;
  onCopied?: () => void;
}) {
  const url = shareUrl(opts.kind, opts.key);
  const text = (opts.text || opts.title).replace(/\s+/g, " ").trim();
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title: opts.title, text, url });
      return;
    } catch (error) {
      if ((error as DOMException)?.name === "AbortError") return;
    }
  }
  await navigator.clipboard.writeText(`${text}\n${url}`);
  opts.onCopied?.();
}
