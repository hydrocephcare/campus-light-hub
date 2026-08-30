import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Image, X, Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { optimizedImageUrl } from "@/lib/imageUrl";

interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  media_url: string;
  media_type: string;
  category: string | null;
  is_featured: boolean | null;
}

const categories = ["Events", "Worship", "Outreach", "Fellowship", "Other"];
const ADMIN_PAGE_SIZE = 120;

async function convertImageToWebP(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type.includes("gif") || file.type.includes("svg")) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const maxSide = 1800;
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.78));
    if (!blob) return file;
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, { type: "image/webp" });
  } catch {
    return file;
  }
}

export const GalleryManager = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    media_url: "",
    media_type: "image",
    category: "Events",
    is_featured: false,
  });
  const [bulkUrls, setBulkUrls] = useState("");
  const [bulkCategory, setBulkCategory] = useState("Events");
  const [bulkBusy, setBulkBusy] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from("media_gallery")
        .select("id,title,description,media_url,media_type,category,is_featured")
        .order("created_at", { ascending: false })
        .limit(ADMIN_PAGE_SIZE);

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching gallery:", error);
      toast.error("Failed to load gallery");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      media_url: "",
      media_type: "image",
      category: "Events",
      is_featured: false,
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (item: GalleryItem) => {
    setFormData({
      title: item.title,
      description: item.description || "",
      media_url: item.media_url,
      media_type: item.media_type,
      category: item.category || "Events",
      is_featured: item.is_featured || false,
    });
    setEditingId(item.id);
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from("media_gallery")
          .update({
            title: formData.title,
            description: formData.description || null,
            media_url: formData.media_url,
            media_type: formData.media_type,
            category: formData.category,
            is_featured: formData.is_featured,
          })
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Gallery item updated");
      } else {
        const { error } = await supabase.from("media_gallery").insert({
          title: formData.title,
          description: formData.description || null,
          media_url: formData.media_url,
          media_type: formData.media_type,
          category: formData.category,
          is_featured: formData.is_featured,
        });

        if (error) throw error;
        toast.success("Gallery item added");
      }

      resetForm();
      fetchItems();
    } catch (error) {
      console.error("Error saving gallery item:", error);
      toast.error("Failed to save gallery item");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const { error } = await supabase.from("media_gallery").delete().eq("id", id);
      if (error) throw error;
      toast.success("Gallery item deleted");
      fetchItems();
    } catch (error) {
      console.error("Error deleting gallery item:", error);
      toast.error("Failed to delete item");
    }
  };

  const handleBulkUrls = async () => {
    const urls = bulkUrls.split(/[\n,\s]+/).map(u => u.trim()).filter(u => /^https?:\/\//.test(u));
    if (urls.length === 0) { toast.error("Paste one or more image URLs"); return; }
    setBulkBusy(true);
    try {
      const rows = urls.map((url, i) => ({
        title: `Photo ${Date.now()}-${i + 1}`,
        media_url: url,
        media_type: "image",
        category: bulkCategory,
        is_featured: false,
      }));
      const { error } = await supabase.from("media_gallery").insert(rows);
      if (error) throw error;
      toast.success(`Added ${urls.length} photo${urls.length > 1 ? "s" : ""}`);
      setBulkUrls("");
      fetchItems();
    } catch (e: any) {
      toast.error(e.message || "Bulk add failed");
    } finally { setBulkBusy(false); }
  };

  const handleFilesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBulkBusy(true);
    let success = 0;
    try {
      const uploads = await Promise.all(Array.from(files).map(async (originalFile) => {
        const file = originalFile.type.startsWith("image/") ? await convertImageToWebP(originalFile) : originalFile;
        const ext = file.name.split(".").pop() || (file.type.startsWith("image/") ? "webp" : "mp4");
        const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage.from("gallery").upload(path, file, { cacheControl: "31536000", contentType: file.type, upsert: false });
        if (upErr) { console.error(upErr); return null; }
        const { data } = supabase.storage.from("gallery").getPublicUrl(path);
        return {
          title: originalFile.name.replace(/\.[^.]+$/, ""),
          media_url: data.publicUrl,
          media_type: file.type.startsWith("video") ? "video" : "image",
          category: bulkCategory,
          is_featured: false,
        };
      }));
      const rows = uploads.filter(Boolean) as any[];
      if (rows.length) {
        const { error } = await supabase.from("media_gallery").insert(rows);
        if (error) throw error;
        success = rows.length;
      }
      toast.success(`Uploaded ${success} of ${files.length} file${files.length > 1 ? "s" : ""}`);
      fetchItems();
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally { setBulkBusy(false); }
  };

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Loading gallery...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Bulk Upload */}
      <Card className="p-4 md:p-6 border-primary/30">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Upload className="w-5 h-5 text-primary" /> Bulk Upload Photos
        </h3>
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-3">
            <Textarea
              placeholder="Paste multiple image URLs (one per line, or comma-separated)"
              value={bulkUrls}
              onChange={(e) => setBulkUrls(e.target.value)}
              rows={3}
            />
            <div className="space-y-2">
              <Select value={bulkCategory} onValueChange={setBulkCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={handleBulkUrls} disabled={bulkBusy} className="w-full">
                {bulkBusy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Add URLs
              </Button>
            </div>
          </div>
          <div>
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border hover:border-primary/50 rounded-lg p-6 cursor-pointer transition-colors">
              <Upload className="w-5 h-5 text-primary" />
              <span className="text-sm">
                {bulkBusy ? "Optimizing and uploading..." : "Upload photos / videos — photos are compressed to WebP"}
              </span>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                disabled={bulkBusy}
                onChange={(e) => handleFilesUpload(e.target.files)}
              />
            </label>
          </div>
        </div>
      </Card>

      {/* Form */}
      <Card className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Image className="w-5 h-5 text-primary" />
            {editingId ? "Edit Gallery Item" : "Add Gallery Item"}
          </h3>
          {isEditing && (
            <Button variant="ghost" size="sm" onClick={resetForm}>
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Input
            placeholder="Image URL (paste image link here)"
            value={formData.media_url}
            onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
            required
          />

          {formData.media_url && (
            <div className="w-32 h-32 rounded-lg overflow-hidden border border-border">
              <img src={optimizedImageUrl(formData.media_url, { width: 320, quality: 70 })} alt="Preview" className="w-full h-full object-cover" loading="lazy" decoding="async" />
            </div>
          )}

          <Textarea
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
          />

          <div className="flex items-center gap-4">
            <Select
              value={formData.media_type}
              onValueChange={(value) => setFormData({ ...formData, media_type: value })}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm text-muted-foreground">Featured</span>
            </label>
          </div>

          <Button type="submit" className="w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            {editingId ? "Update" : "Add"} Item
          </Button>
        </form>
      </Card>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <Card key={item.id} className="overflow-hidden group">
            <div className="aspect-square relative">
              <img
                src={optimizedImageUrl(item.media_url, { width: 360, quality: 64 })}
                alt={item.title}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button size="icon" variant="secondary" onClick={() => handleEdit(item)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="destructive" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              {item.is_featured && (
                <Badge className="absolute top-2 left-2">Featured</Badge>
              )}
            </div>
            <div className="p-3">
              <p className="font-medium text-sm truncate">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.category}</p>
            </div>
          </Card>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12">
          <Image className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No gallery items yet</p>
        </div>
      )}
    </div>
  );
};
