import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe2, Loader2, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { optimizedImageUrl } from "@/lib/imageUrl";
import { Mission, MissionMedia, MISSION_FIELDS } from "@/lib/missions";

const emptyForm = {
  title: "",
  slug: "",
  subtitle: "",
  location: "",
  description: "",
  start_date: "",
  end_date: "",
  cover_image: "",
  youtube_playlist_url: "",
  highlights: "",
  status: "completed",
  is_featured: false,
  sort_order: 0,
};

const slugify = (v: string) =>
  v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const MissionsManager = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const [selected, setSelected] = useState<Mission | null>(null);
  const [media, setMedia] = useState<MissionMedia[]>([]);
  const [bulkUrls, setBulkUrls] = useState("");
  const [bulkType, setBulkType] = useState("image");
  const [busy, setBusy] = useState(false);

  const fetchMissions = async () => {
    const { data, error } = await (supabase as any)
      .from("missions")
      .select(MISSION_FIELDS)
      .order("sort_order", { ascending: false });
    if (error) toast.error("Failed to load missions");
    setMissions((data || []) as Mission[]);
    setLoading(false);
  };

  const fetchMedia = async (missionId: string) => {
    const { data } = await (supabase as any)
      .from("mission_media")
      .select("id,mission_id,media_url,media_type,thumbnail_url,caption,sort_order")
      .eq("mission_id", missionId)
      .order("sort_order", { ascending: true })
      .limit(400);
    setMedia((data || []) as MissionMedia[]);
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
  };

  const handleEdit = (m: Mission) => {
    setForm({
      title: m.title,
      slug: m.slug,
      subtitle: m.subtitle || "",
      location: m.location || "",
      description: m.description || "",
      start_date: m.start_date || "",
      end_date: m.end_date || "",
      cover_image: m.cover_image || "",
      youtube_playlist_url: m.youtube_playlist_url || "",
      highlights: (m.highlights || []).join("\n"),
      status: m.status,
      is_featured: m.is_featured,
      sort_order: m.sort_order,
    });
    setEditingId(m.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      slug: form.slug ? slugify(form.slug) : slugify(form.title),
      subtitle: form.subtitle || null,
      location: form.location || null,
      description: form.description || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      cover_image: form.cover_image || null,
      youtube_playlist_url: form.youtube_playlist_url || null,
      highlights: form.highlights
        ? form.highlights.split("\n").map((h) => h.trim()).filter(Boolean)
        : null,
      status: form.status,
      is_featured: form.is_featured,
      sort_order: Number(form.sort_order) || 0,
    };
    try {
      if (editingId) {
        const { error } = await (supabase as any).from("missions").update(payload).eq("id", editingId);
        if (error) throw error;
        toast.success("Mission updated");
      } else {
        const { error } = await (supabase as any).from("missions").insert(payload);
        if (error) throw error;
        toast.success("Mission created");
      }
      resetForm();
      fetchMissions();
    } catch (err: any) {
      toast.error(err.message || "Failed to save mission");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this mission and all its photos/videos?")) return;
    const { error } = await (supabase as any).from("missions").delete().eq("id", id);
    if (error) return toast.error("Failed to delete mission");
    toast.success("Mission deleted");
    if (selected?.id === id) setSelected(null);
    fetchMissions();
  };

  const openMedia = async (m: Mission) => {
    setSelected(m);
    setMedia([]);
    await fetchMedia(m.id);
  };

  const addBulkUrls = async () => {
    if (!selected) return;
    const urls = bulkUrls.split(/[\n,\s]+/).map((u) => u.trim()).filter((u) => /^https?:\/\//.test(u));
    if (!urls.length) return toast.error("Paste one or more URLs");
    setBusy(true);
    try {
      const base = media.length;
      const rows = urls.map((url, i) => ({
        mission_id: selected.id,
        media_url: url,
        media_type: bulkType,
        sort_order: base + i,
      }));
      const { error } = await (supabase as any).from("mission_media").insert(rows);
      if (error) throw error;
      toast.success(`Added ${rows.length} item${rows.length > 1 ? "s" : ""}`);
      setBulkUrls("");
      fetchMedia(selected.id);
    } catch (err: any) {
      toast.error(err.message || "Failed to add media");
    } finally {
      setBusy(false);
    }
  };

  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length || !selected) return;
    setBusy(true);
    try {
      const base = media.length;
      const rows: any[] = [];
      for (const [i, file] of Array.from(files).entries()) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `missions/${selected.slug}/${Date.now()}-${i}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("gallery")
          .upload(path, file, { cacheControl: "31536000", contentType: file.type });
        if (upErr) {
          console.error(upErr);
          continue;
        }
        const { data } = supabase.storage.from("gallery").getPublicUrl(path);
        rows.push({
          mission_id: selected.id,
          media_url: data.publicUrl,
          media_type: file.type.startsWith("video") ? "video" : "image",
          caption: null,
          sort_order: base + i,
        });
      }
      if (rows.length) {
        const { error } = await (supabase as any).from("mission_media").insert(rows);
        if (error) throw error;
      }
      toast.success(`Uploaded ${rows.length} of ${files.length}`);
      fetchMedia(selected.id);
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const deleteMedia = async (id: string) => {
    const { error } = await (supabase as any).from("mission_media").delete().eq("id", id);
    if (error) return toast.error("Failed to delete");
    setMedia((prev) => prev.filter((m) => m.id !== id));
  };

  if (loading) return <div className="p-6 text-center text-muted-foreground">Loading missions...</div>;

  return (
    <div className="space-y-6">
      {/* Mission form */}
      <Card className="p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Globe2 className="h-5 w-5 text-primary" />
            {editingId ? "Edit Mission" : "Add Mission"}
          </h3>
          {editingId && (
            <Button variant="ghost" size="sm" onClick={resetForm}>
              <X className="mr-1 h-4 w-4" /> Cancel
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              placeholder="Mission title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <Input
              placeholder="URL slug (auto from title)"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
            <Input
              placeholder="Subtitle / theme"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            />
            <Input
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Start date</label>
              <Input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">End date</label>
              <Input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              />
            </div>
            <Input
              placeholder="Cover image URL"
              value={form.cover_image}
              onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
            />
            <Input
              placeholder="YouTube playlist / video URL"
              value={form.youtube_playlist_url}
              onChange={(e) => setForm({ ...form, youtube_playlist_url: e.target.value })}
            />
          </div>

          <Textarea
            placeholder="Mission story / description"
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Textarea
            placeholder="Highlights — one per line (e.g. 120 homes visited)"
            rows={3}
            value={form.highlights}
            onChange={(e) => setForm({ ...form, highlights: e.target.value })}
          />

          <div className="flex flex-wrap items-center gap-4">
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              className="w-32"
              placeholder="Order"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
            />
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
              />
              <span className="text-sm text-muted-foreground">Featured on homepage</span>
            </label>
          </div>

          <Button type="submit" className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" /> {editingId ? "Update" : "Create"} Mission
          </Button>
        </form>
      </Card>

      {/* Mission list */}
      <div className="grid gap-4 md:grid-cols-2">
        {missions.map((m) => (
          <Card key={m.id} className="overflow-hidden">
            <div className="flex gap-4 p-4">
              <div className="h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                {m.cover_image && (
                  <img
                    src={optimizedImageUrl(m.cover_image, { width: 240, quality: 60 })}
                    alt={m.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{m.title}</p>
                    <p className="truncate text-xs text-muted-foreground">/missions/{m.slug}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(m)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(m.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  <Badge variant="secondary" className="capitalize">{m.status}</Badge>
                  {m.is_featured && <Badge>Featured</Badge>}
                </div>
                <Button size="sm" variant="outline" className="mt-3" onClick={() => openMedia(m)}>
                  Manage photos & videos
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Media manager */}
      {selected && (
        <Card className="border-primary/30 p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Media — {selected.title}</h3>
            <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
              <X className="mr-1 h-4 w-4" /> Close
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_200px]">
            <Textarea
              rows={3}
              placeholder="Paste photo or video URLs (one per line)"
              value={bulkUrls}
              onChange={(e) => setBulkUrls(e.target.value)}
            />
            <div className="space-y-2">
              <Select value={bulkType} onValueChange={setBulkType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Photos</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                </SelectContent>
              </Select>
              <Button className="w-full" disabled={busy} onClick={addBulkUrls}>
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Add URLs
              </Button>
            </div>
          </div>

          <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-6 transition-colors hover:border-primary/50">
            <Upload className="h-5 w-5 text-primary" />
            <span className="text-sm">{busy ? "Uploading..." : "Upload mission photos / videos"}</span>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              disabled={busy}
              onChange={(e) => uploadFiles(e.target.files)}
            />
          </label>

          <p className="mt-4 text-sm text-muted-foreground">{media.length} items</p>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {media.map((item) => (
              <div key={item.id} className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
                {item.media_type === "video" ? (
                  <div className="flex h-full w-full items-center justify-center bg-foreground/10 text-xs text-muted-foreground">
                    Video
                  </div>
                ) : (
                  <img
                    src={optimizedImageUrl(item.thumbnail_url || item.media_url, { width: 240, quality: 55 })}
                    alt={item.caption || "Mission media"}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                )}
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute right-1 top-1 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => deleteMedia(item.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
