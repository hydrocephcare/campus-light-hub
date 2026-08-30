import { useEffect } from "react";

interface SEOData {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
}

export const useSEO = (data: SEOData) => {
  useEffect(() => {
    document.title = `${data.title} | MKU Christian Union`;

    const updateMeta = (property: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let meta = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attr, property);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    updateMeta("description", data.description);
    updateMeta("og:title", data.title, true);
    updateMeta("og:description", data.description, true);
    updateMeta("og:type", data.type || "website", true);
    if (data.image) updateMeta("og:image", data.image, true);
    if (data.url) updateMeta("og:url", data.url, true);

    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:title", data.title);
    updateMeta("twitter:description", data.description);
    if (data.image) updateMeta("twitter:image", data.image);

    // Canonical URL
    if (data.url) {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.appendChild(canonical);
      }
      canonical.setAttribute("href", data.url);
    }

    return () => {
      document.title = "MKU Christian Union | Living the Knowledge of God";
      updateMeta("description", "Join Mount Kenya University Christian Union - A vibrant community of 500+ students growing in faith.");
      updateMeta("og:title", "MKU Christian Union | Living the Knowledge of God", true);
      updateMeta("og:description", "Join 500+ students at MKU growing in faith through discipleship, worship, and missions.", true);
      updateMeta("og:type", "website", true);
    };
  }, [data.title, data.description, data.image, data.url, data.type]);
};
