import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Save, Loader2, Sparkles, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ImageUpload } from "./ImageUpload";
import { PAGE_KEYS, type PageContentMap } from "@/hooks/usePageContent";

interface StatItem { icon: string; value: number; suffix: string; label: string; }
interface CoreValue { icon: string; title: string; description: string; }
interface SocialLink { platform: string; link: string; handle: string; }
interface DailyVerse { verse: string; reference: string; encouragement: string; }
interface QuickAction { icon: string; title: string; description: string; color: string; link: string; }

export const SiteSettingsManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [branding, setBranding] = useState({ site_name: "", tagline: "", logo_url: "", youtube_live_url: "", whatsapp_community_link: "" });
  const [stats, setStats] = useState<StatItem[]>([]);
  const [vision, setVision] = useState({ title: "", description: "" });
  const [mission, setMission] = useState({ title: "", description: "" });
  const [coreValues, setCoreValues] = useState<CoreValue[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [contactInfo, setContactInfo] = useState({ whatsapp: "", phone: "", email: "", location: "", map_link: "" });
  const [givingInfo, setGivingInfo] = useState({ till_number: "", till_name: "", scripture: "", scripture_ref: "" });
  const [dailyVerses, setDailyVerses] = useState<DailyVerse[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [pageContent, setPageContent] = useState<PageContentMap>({});
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const { data, error } = await (supabase as any).from("site_settings").select("*");
      if (error) throw error;
      const settings: Record<string, any> = {};
      (data || []).forEach((row: any) => { settings[row.key] = row.value; });
      if (settings.branding) setBranding(settings.branding);
      if (settings.stats) setStats(settings.stats);
      if (settings.vision) setVision(settings.vision);
      if (settings.mission) setMission(settings.mission);
      if (settings.core_values) setCoreValues(settings.core_values);
      if (settings.social_links) setSocialLinks(settings.social_links);
      if (settings.contact_info) setContactInfo(settings.contact_info);
      if (settings.giving_info) setGivingInfo(settings.giving_info);
      if (settings.daily_verses) setDailyVerses(settings.daily_verses);
      if (settings.quick_actions) setQuickActions(settings.quick_actions);
      if (settings.page_content) setPageContent(settings.page_content);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load settings");
    } finally { setLoading(false); }
  };

  const saveSetting = async (key: string, value: any) => {
    setSaving(key);
    try {
      const { error } = await (supabase as any)
        .from("site_settings")
        .upsert({ key, value }, { onConflict: "key" });
      if (error) throw error;
      toast.success("Saved successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save");
    } finally { setSaving(null); }
  };

  const askAI = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiResponse("");
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [{ role: "user", content: aiPrompt }], type: "content" }),
      });

      if (!resp.ok) {
        const errData = await resp.json();
        toast.error(errData.error || "AI request failed");
        setAiLoading(false);
        return;
      }

      const reader = resp.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setAiResponse(fullText);
            }
          } catch {}
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("AI assistant error");
    } finally { setAiLoading(false); }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="branding" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted p-1">
          <TabsTrigger value="branding" className="text-xs">🌐 Branding</TabsTrigger>
          <TabsTrigger value="stats" className="text-xs">Stats</TabsTrigger>
          <TabsTrigger value="vision" className="text-xs">Vision & Mission</TabsTrigger>
          <TabsTrigger value="contact" className="text-xs">Contact & Social</TabsTrigger>
          <TabsTrigger value="giving" className="text-xs">Giving</TabsTrigger>
          <TabsTrigger value="verses" className="text-xs">Daily Verses</TabsTrigger>
          <TabsTrigger value="actions" className="text-xs">Quick Actions</TabsTrigger>
          <TabsTrigger value="pages" className="text-xs">📄 Pages</TabsTrigger>
          <TabsTrigger value="ai" className="text-xs">✨ AI Assistant</TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Globe className="w-5 h-5 text-primary" />Site Branding</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">These settings control the site name, logo, and key links shown in the header, footer, and throughout the site.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Site Name</Label><Input value={branding.site_name} onChange={e => setBranding({ ...branding, site_name: e.target.value })} placeholder="MKU CU CHURCH" /></div>
                <div><Label>Tagline</Label><Input value={branding.tagline} onChange={e => setBranding({ ...branding, tagline: e.target.value })} placeholder="Living the Knowledge of God" /></div>
              </div>
              <ImageUpload
                label="Site Logo"
                value={branding.logo_url}
                onChange={(url) => setBranding({ ...branding, logo_url: url })}
                folder="branding"
                square
                hint="Upload a square logo (PNG with transparent background works best) or paste a link."
              />
              <div><Label>YouTube Live URL</Label><Input value={branding.youtube_live_url} onChange={e => setBranding({ ...branding, youtube_live_url: e.target.value })} placeholder="https://www.youtube.com/live/..." /></div>
              <div><Label>WhatsApp Community Link</Label><Input value={branding.whatsapp_community_link} onChange={e => setBranding({ ...branding, whatsapp_community_link: e.target.value })} placeholder="https://chat.whatsapp.com/..." /></div>
              <Button size="sm" onClick={() => saveSetting("branding", branding)} disabled={saving === "branding"}>
                {saving === "branding" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}Save Branding
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Stats Counter</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {stats.map((stat, i) => (
                <div key={i} className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 border rounded-lg">
                  <div><Label className="text-xs">Icon</Label><Input value={stat.icon} onChange={e => { const s = [...stats]; s[i].icon = e.target.value; setStats(s); }} /></div>
                  <div><Label className="text-xs">Value</Label><Input type="number" value={stat.value} onChange={e => { const s = [...stats]; s[i].value = parseInt(e.target.value) || 0; setStats(s); }} /></div>
                  <div><Label className="text-xs">Suffix</Label><Input value={stat.suffix} onChange={e => { const s = [...stats]; s[i].suffix = e.target.value; setStats(s); }} /></div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1"><Label className="text-xs">Label</Label><Input value={stat.label} onChange={e => { const s = [...stats]; s[i].label = e.target.value; setStats(s); }} /></div>
                    <Button size="icon" variant="destructive" className="h-10 w-10" onClick={() => setStats(stats.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setStats([...stats, { icon: "Star", value: 0, suffix: "+", label: "New Stat" }])}><Plus className="w-4 h-4 mr-1" />Add Stat</Button>
                <Button size="sm" onClick={() => saveSetting("stats", stats)} disabled={saving === "stats"}>{saving === "stats" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}Save</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vision" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Vision</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div><Label>Title</Label><Input value={vision.title} onChange={e => setVision({ ...vision, title: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={vision.description} onChange={e => setVision({ ...vision, description: e.target.value })} rows={3} /></div>
              <Button size="sm" onClick={() => saveSetting("vision", vision)} disabled={saving === "vision"}>{saving === "vision" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}Save</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Mission</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div><Label>Title</Label><Input value={mission.title} onChange={e => setMission({ ...mission, title: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={mission.description} onChange={e => setMission({ ...mission, description: e.target.value })} rows={3} /></div>
              <Button size="sm" onClick={() => saveSetting("mission", mission)} disabled={saving === "mission"}>{saving === "mission" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}Save</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Core Values</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {coreValues.map((val, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 border rounded-lg">
                  <Input placeholder="Icon name" value={val.icon} onChange={e => { const v = [...coreValues]; v[i].icon = e.target.value; setCoreValues(v); }} />
                  <Input placeholder="Title" value={val.title} onChange={e => { const v = [...coreValues]; v[i].title = e.target.value; setCoreValues(v); }} />
                  <div className="flex gap-2">
                    <Input placeholder="Description" value={val.description} onChange={e => { const v = [...coreValues]; v[i].description = e.target.value; setCoreValues(v); }} />
                    <Button size="icon" variant="destructive" onClick={() => setCoreValues(coreValues.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setCoreValues([...coreValues, { icon: "Star", title: "", description: "" }])}><Plus className="w-4 h-4 mr-1" />Add Value</Button>
                <Button size="sm" onClick={() => saveSetting("core_values", coreValues)} disabled={saving === "core_values"}><Save className="w-4 h-4 mr-1" />Save</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Contact Info</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><Label>WhatsApp Link</Label><Input value={contactInfo.whatsapp} onChange={e => setContactInfo({ ...contactInfo, whatsapp: e.target.value })} /></div>
                <div><Label>Phone</Label><Input value={contactInfo.phone} onChange={e => setContactInfo({ ...contactInfo, phone: e.target.value })} /></div>
                <div><Label>Email</Label><Input value={contactInfo.email} onChange={e => setContactInfo({ ...contactInfo, email: e.target.value })} /></div>
                <div><Label>Location</Label><Input value={contactInfo.location} onChange={e => setContactInfo({ ...contactInfo, location: e.target.value })} /></div>
              </div>
              <div><Label>Map Link</Label><Input value={contactInfo.map_link} onChange={e => setContactInfo({ ...contactInfo, map_link: e.target.value })} /></div>
              <Button size="sm" onClick={() => saveSetting("contact_info", contactInfo)} disabled={saving === "contact_info"}><Save className="w-4 h-4 mr-1" />Save</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Social Links</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {socialLinks.map((link, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 border rounded-lg">
                  <Input placeholder="Platform (Facebook, YouTube, Instagram, Twitter)" value={link.platform} onChange={e => { const s = [...socialLinks]; s[i].platform = e.target.value; setSocialLinks(s); }} />
                  <Input placeholder="URL" value={link.link} onChange={e => { const s = [...socialLinks]; s[i].link = e.target.value; setSocialLinks(s); }} />
                  <div className="flex gap-2">
                    <Input placeholder="Handle" value={link.handle} onChange={e => { const s = [...socialLinks]; s[i].handle = e.target.value; setSocialLinks(s); }} />
                    <Button size="icon" variant="destructive" onClick={() => setSocialLinks(socialLinks.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSocialLinks([...socialLinks, { platform: "", link: "", handle: "" }])}><Plus className="w-4 h-4 mr-1" />Add Link</Button>
                <Button size="sm" onClick={() => saveSetting("social_links", socialLinks)} disabled={saving === "social_links"}><Save className="w-4 h-4 mr-1" />Save</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="giving" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">M-Pesa Giving Info</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><Label>Till Number</Label><Input value={givingInfo.till_number} onChange={e => setGivingInfo({ ...givingInfo, till_number: e.target.value })} /></div>
                <div><Label>Till Name</Label><Input value={givingInfo.till_name} onChange={e => setGivingInfo({ ...givingInfo, till_name: e.target.value })} /></div>
              </div>
              <div><Label>Scripture</Label><Textarea value={givingInfo.scripture} onChange={e => setGivingInfo({ ...givingInfo, scripture: e.target.value })} rows={2} /></div>
              <div><Label>Scripture Reference</Label><Input value={givingInfo.scripture_ref} onChange={e => setGivingInfo({ ...givingInfo, scripture_ref: e.target.value })} /></div>
              <Button size="sm" onClick={() => saveSetting("giving_info", givingInfo)} disabled={saving === "giving_info"}><Save className="w-4 h-4 mr-1" />Save</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verses" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Daily Verses Rotation</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {dailyVerses.map((v, i) => (
                <div key={i} className="p-3 border rounded-lg space-y-2">
                  <Textarea placeholder="Bible verse text" value={v.verse} onChange={e => { const d = [...dailyVerses]; d[i].verse = e.target.value; setDailyVerses(d); }} rows={2} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Input placeholder="Reference (e.g. John 3:16)" value={v.reference} onChange={e => { const d = [...dailyVerses]; d[i].reference = e.target.value; setDailyVerses(d); }} />
                    <div className="flex gap-2">
                      <Input placeholder="Encouragement" value={v.encouragement} onChange={e => { const d = [...dailyVerses]; d[i].encouragement = e.target.value; setDailyVerses(d); }} />
                      <Button size="icon" variant="destructive" onClick={() => setDailyVerses(dailyVerses.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setDailyVerses([...dailyVerses, { verse: "", reference: "", encouragement: "" }])}><Plus className="w-4 h-4 mr-1" />Add Verse</Button>
                <Button size="sm" onClick={() => saveSetting("daily_verses", dailyVerses)} disabled={saving === "daily_verses"}><Save className="w-4 h-4 mr-1" />Save</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Quick Actions</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {quickActions.map((action, i) => (
                <div key={i} className="grid grid-cols-2 md:grid-cols-5 gap-2 p-3 border rounded-lg">
                  <Input placeholder="Icon" value={action.icon} onChange={e => { const a = [...quickActions]; a[i].icon = e.target.value; setQuickActions(a); }} />
                  <Input placeholder="Title" value={action.title} onChange={e => { const a = [...quickActions]; a[i].title = e.target.value; setQuickActions(a); }} />
                  <Input placeholder="Description" value={action.description} onChange={e => { const a = [...quickActions]; a[i].description = e.target.value; setQuickActions(a); }} />
                  <Input placeholder="Link" value={action.link} onChange={e => { const a = [...quickActions]; a[i].link = e.target.value; setQuickActions(a); }} />
                  <div className="flex gap-2">
                    <Input placeholder="Color class" value={action.color} onChange={e => { const a = [...quickActions]; a[i].color = e.target.value; setQuickActions(a); }} />
                    <Button size="icon" variant="destructive" onClick={() => setQuickActions(quickActions.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setQuickActions([...quickActions, { icon: "Star", title: "", description: "", color: "bg-primary", link: "/" }])}><Plus className="w-4 h-4 mr-1" />Add Action</Button>
                <Button size="sm" onClick={() => saveSetting("quick_actions", quickActions)} disabled={saving === "quick_actions"}><Save className="w-4 h-4 mr-1" />Save</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Page Titles & Hero Images</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm text-muted-foreground">Edit the heading, subtitle, small badge label and background image at the top of each page. Leave a field blank to keep the built-in default.</p>
              {PAGE_KEYS.map(({ key, label }) => {
                const page = pageContent[key] || {};
                const update = (field: string, value: string) =>
                  setPageContent({ ...pageContent, [key]: { ...page, [field]: value } });
                return (
                  <div key={key} className="p-4 border rounded-lg space-y-3">
                    <h4 className="font-semibold text-sm">{label}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div><Label className="text-xs">Badge label</Label><Input value={page.badge || ""} onChange={e => update("badge", e.target.value)} placeholder="e.g. Notice Board" /></div>
                      <div><Label className="text-xs">Title</Label><Input value={page.title || ""} onChange={e => update("title", e.target.value)} placeholder="Page heading" /></div>
                    </div>
                    <div><Label className="text-xs">Subtitle</Label><Textarea value={page.subtitle || ""} onChange={e => update("subtitle", e.target.value)} rows={2} placeholder="Short intro sentence" /></div>
                    <ImageUpload
                      label="Hero background image"
                      value={page.image || ""}
                      onChange={(url) => update("image", url)}
                      folder="pages"
                      hint="Upload a wide image or paste a link."
                    />
                  </div>
                );
              })}
              <Button size="sm" onClick={() => saveSetting("page_content", pageContent)} disabled={saving === "page_content"}>
                {saving === "page_content" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}Save Pages
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" />AI Content Assistant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Use AI to help generate content for your website — announcements, blog posts, event descriptions, Bible verses, and more.</p>
              <Textarea placeholder="Ask AI to help you... e.g. 'Write an announcement for our upcoming kesha night' or 'Suggest 5 Bible verses about perseverance'" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} rows={3} />
              <Button onClick={askAI} disabled={aiLoading || !aiPrompt.trim()} className="w-full md:w-auto">
                {aiLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Sparkles className="w-4 h-4 mr-2" />Generate Content</>}
              </Button>
              {aiResponse && (
                <div className="p-4 bg-muted rounded-lg border">
                  <Label className="text-xs text-muted-foreground mb-2 block">AI Response:</Label>
                  <div className="whitespace-pre-wrap text-sm">{aiResponse}</div>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => navigator.clipboard.writeText(aiResponse).then(() => toast.success("Copied!"))}>
                    Copy to Clipboard
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
