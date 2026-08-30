import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Loader2, Search, Globe, FileText, Image, Share2, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PageSEO {
  title: string;
  description: string;
  keywords: string;
  og_image: string;
}

interface SEOSettings {
  site_title: string;
  site_description: string;
  site_keywords: string;
  og_image: string;
  canonical_url: string;
  google_verification: string;
  bing_verification: string;
  organization_name: string;
  organization_type: string;
  address_locality: string;
  address_region: string;
  address_country: string;
  social_facebook: string;
  social_instagram: string;
  social_youtube: string;
  social_twitter: string;
  pages: Record<string, PageSEO>;
}

const defaultSEO: SEOSettings = {
  site_title: "MKU Christian Union | Living the Knowledge of God",
  site_description: "Join Mount Kenya University Christian Union - A vibrant community of 500+ students growing in faith, reaching beyond campus through missions, and living as true disciples of Jesus Christ.",
  site_keywords: "MKU CU, Mount Kenya University Christian Union, Christian fellowship, campus ministry, Kenya, FOCUS Kenya, discipleship, evangelism",
  og_image: "",
  canonical_url: "https://mkucuu.lovable.app",
  google_verification: "",
  bing_verification: "",
  organization_name: "MKU Christian Union",
  organization_type: "ReligiousOrganization",
  address_locality: "Thika",
  address_region: "Kiambu",
  address_country: "KE",
  social_facebook: "",
  social_instagram: "",
  social_youtube: "",
  social_twitter: "",
  pages: {
    home: { title: "MKU Christian Union | Living the Knowledge of God", description: "Join 500+ students at MKU growing in faith through discipleship, worship, and missions.", keywords: "MKU CU, Christian union, campus fellowship", og_image: "" },
    about: { title: "About Us | MKU Christian Union", description: "Learn about our vision, mission, leadership, and the heart behind MKU Christian Union.", keywords: "about MKU CU, leadership, vision, mission", og_image: "" },
    events: { title: "Events | MKU Christian Union", description: "Upcoming events, conferences, fellowships and activities at MKU Christian Union.", keywords: "MKU CU events, fellowship, conferences", og_image: "" },
    blog: { title: "Blog | MKU Christian Union", description: "Read faith stories, devotionals, and updates from MKU Christian Union.", keywords: "MKU CU blog, devotionals, faith stories", og_image: "" },
    contact: { title: "Contact Us | MKU Christian Union", description: "Get in touch with MKU Christian Union. We'd love to hear from you!", keywords: "contact MKU CU, reach us", og_image: "" },
    gallery: { title: "Gallery | MKU Christian Union", description: "Photos and videos from MKU Christian Union events and activities.", keywords: "MKU CU gallery, photos, videos", og_image: "" },
    ministries: { title: "Ministries | MKU Christian Union", description: "Explore the various ministries at MKU Christian Union and find where you belong.", keywords: "MKU CU ministries, serving, departments", og_image: "" },
    elections: { title: "Elections | MKU Christian Union", description: "Vote in MKU Christian Union elections and choose your leaders.", keywords: "MKU CU elections, voting, leadership", og_image: "" },
    media: { title: "Sermons & Media | MKU Christian Union", description: "Watch sermons, worship sessions and testimonies from MKU Christian Union.", keywords: "MKU CU sermons, worship videos, YouTube", og_image: "" },
    schedule: { title: "Weekly Schedule | MKU Christian Union", description: "See our full weekly programme of services, fellowships and Bible studies.", keywords: "MKU CU schedule, service times, weekly programme", og_image: "" },
    fellowships: { title: "Campus Fellowships | MKU Christian Union", description: "Find a campus fellowship or home fellowship near you and grow together.", keywords: "MKU CU fellowships, home fellowship, small groups", og_image: "" },
    visitors: { title: "I'm New | MKU Christian Union", description: "New to MKU CU? Here is everything you need for your first visit.", keywords: "visit MKU CU, new here, first time", og_image: "" },
    volunteer: { title: "Volunteer & Serve | MKU Christian Union", description: "Discover opportunities to serve and use your gifts at MKU Christian Union.", keywords: "MKU CU volunteer, serve, ministry opportunities", og_image: "" },
    giving: { title: "Giving & Tithe | MKU Christian Union", description: "Support the work of MKU Christian Union through tithes and offerings.", keywords: "MKU CU giving, tithe, offering, M-Pesa", og_image: "" },
  }
};

const pageLabels: Record<string, string> = {
  home: "🏠 Homepage",
  about: "ℹ️ About",
  events: "📅 Events",
  blog: "📝 Blog",
  contact: "📞 Contact",
  gallery: "🖼️ Gallery",
  ministries: "⛪ Ministries",
  elections: "🗳️ Elections",
  media: "🎥 Sermons & Media",
  schedule: "🗓️ Weekly Schedule",
  fellowships: "👥 Fellowships",
  visitors: "🙌 I'm New / Visitors",
  volunteer: "🤝 Volunteer",
  giving: "💚 Giving",
};

const SEOScoreIndicator = ({ score }: { score: number }) => {
  const color = score >= 80 ? "text-green-600" : score >= 50 ? "text-yellow-600" : "text-red-600";
  const bg = score >= 80 ? "bg-green-100" : score >= 50 ? "bg-yellow-100" : "bg-red-100";
  const label = score >= 80 ? "Good" : score >= 50 ? "Needs Work" : "Poor";
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${bg} ${color}`}>
      {score >= 80 ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {score}/100 — {label}
    </div>
  );
};

const calculateSEOScore = (seo: SEOSettings): number => {
  let score = 0;
  if (seo.site_title && seo.site_title.length <= 60) score += 15;
  else if (seo.site_title) score += 8;
  if (seo.site_description && seo.site_description.length <= 160 && seo.site_description.length >= 50) score += 15;
  else if (seo.site_description) score += 8;
  if (seo.site_keywords) score += 10;
  if (seo.og_image) score += 10;
  if (seo.canonical_url) score += 10;
  if (seo.google_verification) score += 5;
  if (seo.organization_name) score += 5;
  if (seo.address_locality) score += 5;
  if (seo.social_facebook || seo.social_instagram || seo.social_youtube) score += 10;
  const pagesWithSEO = Object.values(seo.pages).filter(p => p.title && p.description).length;
  score += Math.min(15, Math.round((pagesWithSEO / Object.keys(seo.pages).length) * 15));
  return Math.min(100, score);
};

export const SEOManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seo, setSeo] = useState<SEOSettings>(defaultSEO);

  useEffect(() => { fetchSEO(); }, []);

  const fetchSEO = async () => {
    try {
      const { data, error } = await (supabase as any).from("site_settings").select("value").eq("key", "seo").maybeSingle();
      if (!error && data?.value) {
        setSeo({ ...defaultSEO, ...data.value, pages: { ...defaultSEO.pages, ...(data.value.pages || {}) } });
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const saveSEO = async () => {
    setSaving(true);
    try {
      const { error: updateError } = await (supabase as any).from("site_settings").update({ value: seo }).eq("key", "seo");
      if (updateError) {
        const { error } = await (supabase as any).from("site_settings").upsert({ key: "seo", value: seo }, { onConflict: "key" });
        if (error) throw error;
      }
      toast.success("SEO settings saved! Changes will reflect across the site.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save SEO settings");
    } finally { setSaving(false); }
  };

  const updatePage = (page: string, field: keyof PageSEO, value: string) => {
    setSeo(prev => ({
      ...prev,
      pages: { ...prev.pages, [page]: { ...prev.pages[page], [field]: value } }
    }));
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  const score = calculateSEOScore(seo);

  return (
    <div className="space-y-6">
      {/* Score Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Search className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Google SEO Score</CardTitle>
                <CardDescription>Optimize your site for Google search results</CardDescription>
              </div>
            </div>
            <SEOScoreIndicator score={score} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2">
              {seo.site_title ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
              <span>Site Title</span>
            </div>
            <div className="flex items-center gap-2">
              {seo.site_description ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
              <span>Meta Description</span>
            </div>
            <div className="flex items-center gap-2">
              {seo.og_image ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
              <span>OG Image</span>
            </div>
            <div className="flex items-center gap-2">
              {seo.google_verification ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
              <span>Google Verified</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="global" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted p-1">
          <TabsTrigger value="global" className="text-xs"><Globe className="w-3 h-3 mr-1" />Global SEO</TabsTrigger>
          <TabsTrigger value="pages" className="text-xs"><FileText className="w-3 h-3 mr-1" />Page SEO</TabsTrigger>
          <TabsTrigger value="social" className="text-xs"><Share2 className="w-3 h-3 mr-1" />Social & Schema</TabsTrigger>
          <TabsTrigger value="verification" className="text-xs"><Search className="w-3 h-3 mr-1" />Verification</TabsTrigger>
        </TabsList>

        {/* Global SEO */}
        <TabsContent value="global" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Global Meta Tags</CardTitle>
              <CardDescription>These are the default SEO tags used across your site. Individual pages can override them.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Site Title <Badge variant="outline" className="ml-2 text-xs">{seo.site_title.length}/60</Badge></Label>
                <Input value={seo.site_title} onChange={e => setSeo({ ...seo, site_title: e.target.value })} placeholder="MKU Christian Union | Living the Knowledge of God" />
                {seo.site_title.length > 60 && <p className="text-xs text-destructive mt-1">Title should be under 60 characters for best Google display</p>}
              </div>
              <div>
                <Label>Meta Description <Badge variant="outline" className="ml-2 text-xs">{seo.site_description.length}/160</Badge></Label>
                <Textarea value={seo.site_description} onChange={e => setSeo({ ...seo, site_description: e.target.value })} rows={3} placeholder="A compelling description of your church..." />
                {seo.site_description.length > 160 && <p className="text-xs text-destructive mt-1">Description should be under 160 characters</p>}
              </div>
              <div>
                <Label>Keywords <span className="text-xs text-muted-foreground">(comma separated)</span></Label>
                <Input value={seo.site_keywords} onChange={e => setSeo({ ...seo, site_keywords: e.target.value })} placeholder="MKU CU, Christian fellowship, campus ministry..." />
              </div>
              <div>
                <Label>Default OG Image URL</Label>
                <Input value={seo.og_image} onChange={e => setSeo({ ...seo, og_image: e.target.value })} placeholder="https://your-domain.com/og-image.jpg" />
                <p className="text-xs text-muted-foreground mt-1">Recommended: 1200×630px. This image shows when your site is shared on social media.</p>
                {seo.og_image && (
                  <div className="mt-2 p-2 bg-muted rounded-lg">
                    <img src={seo.og_image} alt="OG preview" className="w-full max-w-md rounded object-cover aspect-[1200/630]" />
                  </div>
                )}
              </div>
              <div>
                <Label>Canonical URL</Label>
                <Input value={seo.canonical_url} onChange={e => setSeo({ ...seo, canonical_url: e.target.value })} placeholder="https://mkucuu.lovable.app" />
              </div>
            </CardContent>
          </Card>

          {/* Google Preview */}
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Search className="w-5 h-5" />Google Search Preview</CardTitle></CardHeader>
            <CardContent>
              <div className="p-4 bg-background border rounded-lg max-w-xl">
                <p className="text-sm text-green-700 truncate">{seo.canonical_url || "https://mkucuu.lovable.app"}</p>
                <h3 className="text-lg text-blue-700 font-medium hover:underline cursor-pointer truncate">{seo.site_title || "Your Site Title"}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{seo.site_description || "Your site description will appear here..."}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Page-level SEO */}
        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Per-Page SEO</CardTitle>
              <CardDescription>Customize the title, description, and keywords for each page individually for better ranking.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(seo.pages).map(([page, data]) => (
                <div key={page} className="p-4 border rounded-lg space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    {pageLabels[page] || page}
                    {data.title && data.description ? (
                      <Badge variant="outline" className="text-green-600 border-green-300">✓ Set</Badge>
                    ) : (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-300">Incomplete</Badge>
                    )}
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <Label className="text-xs">Title <Badge variant="outline" className="ml-1 text-[10px]">{data.title.length}/60</Badge></Label>
                      <Input value={data.title} onChange={e => updatePage(page, "title", e.target.value)} placeholder={`${page} page title`} className="text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs">Description <Badge variant="outline" className="ml-1 text-[10px]">{data.description.length}/160</Badge></Label>
                      <Textarea value={data.description} onChange={e => updatePage(page, "description", e.target.value)} rows={2} className="text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs">Keywords</Label>
                      <Input value={data.keywords} onChange={e => updatePage(page, "keywords", e.target.value)} placeholder="page-specific keywords" className="text-sm" />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social & Schema */}
        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Organization Schema (JSON-LD)</CardTitle>
              <CardDescription>This structured data helps Google understand your church and show rich results.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Organization Name</Label><Input value={seo.organization_name} onChange={e => setSeo({ ...seo, organization_name: e.target.value })} /></div>
                <div><Label>Organization Type</Label><Input value={seo.organization_type} onChange={e => setSeo({ ...seo, organization_type: e.target.value })} placeholder="ReligiousOrganization" /></div>
                <div><Label>City / Locality</Label><Input value={seo.address_locality} onChange={e => setSeo({ ...seo, address_locality: e.target.value })} /></div>
                <div><Label>Region / County</Label><Input value={seo.address_region} onChange={e => setSeo({ ...seo, address_region: e.target.value })} /></div>
                <div><Label>Country Code</Label><Input value={seo.address_country} onChange={e => setSeo({ ...seo, address_country: e.target.value })} placeholder="KE" /></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Social Profiles for Schema</CardTitle>
              <CardDescription>These URLs are included in structured data so Google links your social accounts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div><Label>Facebook URL</Label><Input value={seo.social_facebook} onChange={e => setSeo({ ...seo, social_facebook: e.target.value })} placeholder="https://facebook.com/mkucu" /></div>
              <div><Label>Instagram URL</Label><Input value={seo.social_instagram} onChange={e => setSeo({ ...seo, social_instagram: e.target.value })} placeholder="https://instagram.com/mkucu" /></div>
              <div><Label>YouTube URL</Label><Input value={seo.social_youtube} onChange={e => setSeo({ ...seo, social_youtube: e.target.value })} placeholder="https://youtube.com/@mkucu" /></div>
              <div><Label>Twitter/X URL</Label><Input value={seo.social_twitter} onChange={e => setSeo({ ...seo, social_twitter: e.target.value })} placeholder="https://x.com/mkucu" /></div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Verification */}
        <TabsContent value="verification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search Engine Verification</CardTitle>
              <CardDescription>Paste your verification codes from Google Search Console and Bing Webmaster Tools.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Google Search Console Verification Code</Label>
                <Input value={seo.google_verification} onChange={e => setSeo({ ...seo, google_verification: e.target.value })} placeholder="Paste the content= value from Google" />
                <p className="text-xs text-muted-foreground mt-1">Go to <strong>Google Search Console → Settings → Ownership verification → HTML tag</strong>, copy just the content value.</p>
              </div>
              <div>
                <Label>Bing Webmaster Verification Code</Label>
                <Input value={seo.bing_verification} onChange={e => setSeo({ ...seo, bing_verification: e.target.value })} placeholder="Paste the content= value from Bing" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Technical SEO Status</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /><span>Sitemap: <code>/sitemap.xml</code> — Auto-generated ✓</span></div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /><span>Robots.txt: <code>/robots.txt</code> — Configured ✓</span></div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /><span>Canonical URLs — Enabled ✓</span></div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /><span>JSON-LD Structured Data — Enabled ✓</span></div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /><span>Open Graph & Twitter Cards — Enabled ✓</span></div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /><span>Semantic HTML with single H1 per page ✓</span></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button - sticky */}
      <div className="sticky bottom-4 z-10">
        <Button onClick={saveSEO} disabled={saving} className="w-full h-12 text-base shadow-lg">
          {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
          Save All SEO Settings
        </Button>
      </div>
    </div>
  );
};
