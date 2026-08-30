import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SEOHeadProps {
  page?: string;
}

export const SEOHead = ({ page = "home" }: SEOHeadProps) => {
  const [seo, setSeo] = useState<any>(null);

  useEffect(() => {
    const fetchSEO = async () => {
      try {
        const { data } = await (supabase as any).from("site_settings").select("value").eq("key", "seo").maybeSingle();
        if (data?.value) setSeo(data.value);
      } catch (e) { console.error(e); }
    };
    fetchSEO();
  }, []);

  useEffect(() => {
    if (!seo) return;

    const pageSEO = seo.pages?.[page];
    const title = pageSEO?.title || seo.site_title || "MKU Christian Union";
    const description = pageSEO?.description || seo.site_description || "";
    const keywords = pageSEO?.keywords || seo.site_keywords || "";
    const ogImage = pageSEO?.og_image || seo.og_image || "";
    const canonical = seo.canonical_url || "https://mkucuu.lovable.app";

    document.title = title;

    const updateMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement;
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };

    updateMeta("name", "description", description);
    updateMeta("name", "keywords", keywords);
    updateMeta("property", "og:title", title);
    updateMeta("property", "og:description", description);
    updateMeta("property", "og:type", "website");
    updateMeta("property", "og:url", canonical);
    if (ogImage) updateMeta("property", "og:image", ogImage);
    updateMeta("name", "twitter:card", "summary_large_image");
    updateMeta("name", "twitter:title", title);
    updateMeta("name", "twitter:description", description);
    if (ogImage) updateMeta("name", "twitter:image", ogImage);

    if (seo.google_verification) updateMeta("name", "google-site-verification", seo.google_verification);
    if (seo.bing_verification) updateMeta("name", "msvalidate.01", seo.bing_verification);

    // Canonical link
    let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalEl) { canonicalEl = document.createElement("link"); canonicalEl.setAttribute("rel", "canonical"); document.head.appendChild(canonicalEl); }
    canonicalEl.setAttribute("href", `${canonical}${page === "home" ? "" : "/" + page}`);

    // JSON-LD structured data
    let scriptEl = document.getElementById("json-ld-seo") as HTMLScriptElement;
    if (!scriptEl) { scriptEl = document.createElement("script"); scriptEl.id = "json-ld-seo"; scriptEl.type = "application/ld+json"; document.head.appendChild(scriptEl); }
    
    const sameAs = [seo.social_facebook, seo.social_instagram, seo.social_youtube, seo.social_twitter].filter(Boolean);
    
    const jsonLD = {
      "@context": "https://schema.org",
      "@type": seo.organization_type || "ReligiousOrganization",
      "name": seo.organization_name || "MKU Christian Union",
      "url": canonical,
      "logo": seo.og_image || "",
      "description": seo.site_description,
      ...(seo.address_locality && {
        "address": {
          "@type": "PostalAddress",
          "addressLocality": seo.address_locality,
          "addressRegion": seo.address_region,
          "addressCountry": seo.address_country,
        }
      }),
      ...(sameAs.length > 0 && { "sameAs": sameAs }),
    };
    scriptEl.textContent = JSON.stringify(jsonLD);

  }, [seo, page]);

  return null;
};
