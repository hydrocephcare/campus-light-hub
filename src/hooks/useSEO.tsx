import { useEffect } from "react";
import { COMMUNITY_IMAGES, isMkucuCloudinaryImage } from "@/lib/siteImages";

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

    // Prefer the site's own Cloudinary photography. Existing MKUCU Cloudinary
    // images are preserved; stock/Unsplash fallbacks are replaced centrally.
    const socialImage = isMkucuCloudinaryImage(data.image)
      ? data.image!
      : data.image && !data.image.includes("unsplash.com")
        ? data.image
        : COMMUNITY_IMAGES[0];

    updateMeta("description", data.description);
    updateMeta("og:title", data.title, true);
    updateMeta("og:description", data.description, true);
    updateMeta("og:type", data.type || "website", true);
    updateMeta("og:image", socialImage, true);
    if (data.url) updateMeta("og:url", data.url, true);

    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:title", data.title);
    updateMeta("twitter:description", data.description);
    updateMeta("twitter:image", socialImage);

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
      updateMeta("description", "Join Mount Kenya University Christian Union - A vibrant community of students growing in faith.");
      updateMeta("og:title", "MKU Christian Union | Living the Knowledge of God", true);
      updateMeta("og:description", "Join MKU students growing in faith through discipleship, worship, fellowship and missions.", true);
      updateMeta("og:type", "website", true);
      updateMeta("og:image", COMMUNITY_IMAGES[0], true);
      updateMeta("twitter:image", COMMUNITY_IMAGES[0]);
    };
  }, [data.title, data.description, data.image, data.url, data.type]);
};
