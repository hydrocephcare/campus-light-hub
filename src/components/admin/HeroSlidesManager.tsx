import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, GripVertical, Image, ExternalLink } from "lucide-react";
import { ImageUpload } from "./ImageUpload";

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string | null;
  verse: string | null;
  verse_ref: string | null;
  image_url: string;
  cta1_text: string | null;
  cta1_link: string | null;
  cta2_text: string | null;
  cta2_link: string | null;
  display_order: number | null;
  is_active: boolean | null;
}

const defaultSlide: Partial<HeroSlide> = {
  title: "",
  subtitle: "",
  verse: "",
  verse_ref: "",
  image_url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1920&q=80",
  cta1_text: "",
  cta1_link: "",
  cta2_text: "",
  cta2_link: "",
  display_order: 0,
  is_active: true,
};

export const HeroSlidesManager = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<HeroSlide>>(defaultSlide);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      setSlides(data || []);
    } catch (error) {
      console.error("Error fetching slides:", error);
      toast.error("Failed to load hero slides");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title?.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      if (editing) {
        const { error } = await supabase
          .from("hero_slides")
          .update({
            title: formData.title,
            subtitle: formData.subtitle || null,
            verse: formData.verse || null,
            verse_ref: formData.verse_ref || null,
            image_url: formData.image_url || defaultSlide.image_url!,
            cta1_text: formData.cta1_text || null,
            cta1_link: formData.cta1_link || null,
            cta2_text: formData.cta2_text || null,
            cta2_link: formData.cta2_link || null,
            display_order: formData.display_order || 0,
            is_active: formData.is_active ?? true,
          })
          .eq("id", editing.id);
        if (error) throw error;
        toast.success("Slide updated!");
      } else {
        const { error } = await supabase
          .from("hero_slides")
          .insert({
            title: formData.title,
            subtitle: formData.subtitle || null,
            verse: formData.verse || null,
            verse_ref: formData.verse_ref || null,
            image_url: formData.image_url || defaultSlide.image_url!,
            cta1_text: formData.cta1_text || null,
            cta1_link: formData.cta1_link || null,
            cta2_text: formData.cta2_text || null,
            cta2_link: formData.cta2_link || null,
            display_order: formData.display_order || 0,
            is_active: formData.is_active ?? true,
          });
        if (error) throw error;
        toast.success("Slide created!");
      }

      setEditing(null);
      setIsCreating(false);
      setFormData(defaultSlide);
      fetchSlides();
    } catch (error) {
      console.error("Error saving slide:", error);
      toast.error("Failed to save slide");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this slide?")) return;
    try {
      const { error } = await supabase.from("hero_slides").delete().eq("id", id);
      if (error) throw error;
      toast.success("Slide deleted");
      fetchSlides();
    } catch (error) {
      toast.error("Failed to delete slide");
    }
  };

  const startEdit = (slide: HeroSlide) => {
    setEditing(slide);
    setIsCreating(false);
    setFormData(slide);
  };

  const startCreate = () => {
    setEditing(null);
    setIsCreating(true);
    setFormData({ ...defaultSlide, display_order: slides.length + 1 });
  };

  const cancelForm = () => {
    setEditing(null);
    setIsCreating(false);
    setFormData(defaultSlide);
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground">Loading slides...</div>;

  const showForm = isCreating || editing;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">Hero Slideshow</h3>
          <p className="text-sm text-muted-foreground">Manage homepage hero slider images and content</p>
        </div>
        {!showForm && (
          <Button onClick={startCreate} size="sm" className="bg-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-1" /> Add Slide
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="p-5 border-primary/20 bg-card">
          <h4 className="font-bold mb-4 text-foreground">{editing ? "Edit Slide" : "New Slide"}</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Title *</Label>
                <Input value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Slide title" />
              </div>
              <div>
                <Label>Subtitle</Label>
                <Input value={formData.subtitle || ""} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} placeholder="Subtitle text" />
              </div>
            </div>

            <ImageUpload
              label="Background Image"
              value={formData.image_url || ""}
              onChange={(url) => setFormData({ ...formData, image_url: url })}
              folder="hero"
              hint="Upload a photo from your phone or paste a link. Wide landscape photos look best."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Bible Verse</Label>
                <Textarea value={formData.verse || ""} onChange={(e) => setFormData({ ...formData, verse: e.target.value })} placeholder="Enter verse text" rows={2} />
              </div>
              <div>
                <Label>Verse Reference</Label>
                <Input value={formData.verse_ref || ""} onChange={(e) => setFormData({ ...formData, verse_ref: e.target.value })} placeholder="— John 3:16" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Button 1 Text</Label>
                <Input value={formData.cta1_text || ""} onChange={(e) => setFormData({ ...formData, cta1_text: e.target.value })} placeholder="Join Us" />
              </div>
              <div>
                <Label>Button 1 Link</Label>
                <Input value={formData.cta1_link || ""} onChange={(e) => setFormData({ ...formData, cta1_link: e.target.value })} placeholder="/events or https://..." />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Button 2 Text</Label>
                <Input value={formData.cta2_text || ""} onChange={(e) => setFormData({ ...formData, cta2_text: e.target.value })} placeholder="Learn More" />
              </div>
              <div>
                <Label>Button 2 Link</Label>
                <Input value={formData.cta2_link || ""} onChange={(e) => setFormData({ ...formData, cta2_link: e.target.value })} placeholder="/about or https://..." />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Label>Order</Label>
                <Input type="number" className="w-20" value={formData.display_order || 0} onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.is_active ?? true} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
                <Label>Active</Label>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} className="bg-primary text-primary-foreground">
                {editing ? "Update Slide" : "Create Slide"}
              </Button>
              <Button variant="outline" onClick={cancelForm}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Slides List */}
      <div className="space-y-3">
        {slides.map((slide) => (
          <Card key={slide.id} className={`overflow-hidden ${!slide.is_active ? 'opacity-50' : ''}`}>
            <div className="flex items-stretch">
              <div className="w-32 md:w-48 flex-shrink-0 bg-muted">
                <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover min-h-[80px]" />
              </div>
              <div className="flex-1 p-3 md:p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <h4 className="font-bold text-sm text-foreground truncate">{slide.title}</h4>
                      {!slide.is_active && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">Hidden</span>
                      )}
                    </div>
                    {slide.subtitle && <p className="text-xs text-muted-foreground truncate">{slide.subtitle}</p>}
                    <div className="flex gap-2 mt-1">
                      {slide.cta1_text && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{slide.cta1_text}</span>
                      )}
                      {slide.cta2_text && (
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">{slide.cta2_text}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(slide)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(slide.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {slides.length === 0 && !showForm && (
        <div className="text-center py-12 text-muted-foreground">
          <Image className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No hero slides yet. Add your first slide!</p>
        </div>
      )}
    </div>
  );
};
