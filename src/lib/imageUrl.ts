type ImageOptions = {
  width?: number;
  quality?: number;
  resize?: "cover" | "contain" | "fill";
};

export function optimizedImageUrl(src: string | null | undefined, options: ImageOptions = {}): string {
  if (!src) return "";
  const { width = 900, quality = 72, resize = "cover" } = options;

  try {
    const url = new URL(src, window.location.origin);

    if (url.pathname.includes("/storage/v1/object/public/")) {
      url.pathname = url.pathname.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/");
      url.searchParams.set("width", String(width));
      url.searchParams.set("quality", String(quality));
      url.searchParams.set("resize", resize);
      url.searchParams.set("format", "webp");
      return url.toString();
    }

    if (url.hostname.includes("googleusercontent.com")) {
      // Drive-hosted photos: request a right-sized rendition instead of the full frame.
      return `${url.origin}${url.pathname.split("=")[0]}=w${width}`;
    }

    if (url.hostname.includes("images.unsplash.com")) {
      url.searchParams.set("auto", "format");
      url.searchParams.set("fit", "crop");
      url.searchParams.set("w", String(width));
      url.searchParams.set("q", String(quality));
      return url.toString();
    }
  } catch {
    return src;
  }

  return src;
}