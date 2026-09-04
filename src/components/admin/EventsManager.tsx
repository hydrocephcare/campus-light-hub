import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Calendar, MapPin, Clock, Video } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { ImageUpload } from "./ImageUpload";

type Event = Tables<"events">;

interface ArchiveVideo {
  id: string;
  youtube_id: string;
  youtube_url: string;
  title: string | null;
  event_id: string | null;
  is_verified: boolean;
  notes: string | null;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const EVENT_TYPES = ["Service", "Sunday Service", "Special Service", "Worship Night", "Kesha", "Mission", "Conference", "Archive", "Unverified"];

export const EventsManager = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [videos, setVideos] = useState<ArchiveVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    theme: "",
    scripture: "",
    event_type: "Service",
    event_date: "",
    start_time: "",
    end_time: "",
    location: "",
    category: "General",
    registration_link: "",
    drive_folder_url: "",
    image_url: "",
    is_featured: false,
    is_published: true,
  });

  useEffect(() => {
    fetchEvents();
    fetchVideos();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: false });

    if (error) {
      toast.error("Failed to fetch events");
      return;
    }

    setEvents(data || []);
  };

  const fetchVideos = async () => {
    const { data } = await (supabase as any)
      .from("archive_videos")
      .select("id,youtube_id,youtube_url,title,event_id,is_verified,notes")
      .order("sort_order", { ascending: true });
    setVideos((data as ArchiveVideo[]) || []);
  };

  const assignVideo = async (videoId: string, eventId: string) => {
    const { error } = await (supabase as any)
      .from("archive_videos")
      .update({ event_id: eventId === "none" ? null : eventId, is_verified: eventId !== "none" })
      .eq("id", videoId);
    if (error) {
      toast.error("Could not update recording");
      return;
    }
    toast.success("Recording updated");
    fetchVideos();
  };

  const deleteVideo = async (videoId: string) => {
    if (!confirm("Remove this recording from the archive?")) return;
    await (supabase as any).from("archive_videos").delete().eq("id", videoId);
    toast.success("Recording removed");
    fetchVideos();
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSubmit = {
        ...formData,
        slug: (formData.slug ? slugify(formData.slug) : slugify(formData.title)) || null,
        theme: formData.theme || null,
        scripture: formData.scripture || null,
        drive_folder_url: formData.drive_folder_url || null,
        image_url: formData.image_url || null,
      };

      if (editingId) {
        const { error } = await supabase
          .from("events")
          .update(dataToSubmit)
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Event updated");
      } else {
        const { error } = await supabase
          .from("events")
          .insert([dataToSubmit]);

        if (error) throw error;
        toast.success("Event created");
      }

      resetForm();
      fetchEvents();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingId(event.id);
    setFormData({
      title: event.title,
      slug: event.slug || "",
      description: event.description || "",
      theme: event.theme || "",
      scripture: event.scripture || "",
      event_type: event.event_type || "Service",
      event_date: event.event_date,
      start_time: event.start_time,
      end_time: event.end_time || "",
      location: event.location,
      category: event.category || "General",
      registration_link: event.registration_link || "",
      drive_folder_url: event.drive_folder_url || "",
      image_url: event.image_url || "",
      is_featured: event.is_featured ?? false,
      is_published: event.is_published ?? true,
    });
  };


  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete");
      return;
    }

    toast.success("Event deleted");
    fetchEvents();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      event_date: "",
      start_time: "",
      end_time: "",
      location: "",
      category: "General",
      registration_link: "",
      image_url: "",
      is_featured: false,
    });
  };

  return (
    <div className="space-y-4">
      {/* Form Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            {editingId ? <Pencil className="h-4 w-4 text-primary" /> : <Plus className="h-4 w-4 text-primary" />}
            <div>
              <CardTitle className="text-base">{editingId ? "Edit" : "Add"} Event</CardTitle>
              <CardDescription className="text-xs">Manage upcoming events</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="h-9 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="event_date" className="text-xs">Date *</Label>
                <Input
                  id="event_date"
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  required
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="text-xs">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="h-9 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="start_time" className="text-xs">Start Time *</Label>
                <Input
                  id="start_time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  placeholder="e.g., 10:00 AM"
                  required
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time" className="text-xs">End Time</Label>
                <Input
                  id="end_time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  placeholder="e.g., 12:00 PM"
                  className="h-9 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-xs">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="text-sm resize-none"
              />
            </div>

            <ImageUpload
              label="Event Photo"
              value={formData.image_url}
              onChange={(url) => setFormData({ ...formData, image_url: url })}
              folder="events"
            />

            <div className="space-y-2">
              <Label htmlFor="registration_link" className="text-xs">Registration Link</Label>
              <Input
                id="registration_link"
                type="url"
                value={formData.registration_link}
                onChange={(e) => setFormData({ ...formData, registration_link: e.target.value })}
                placeholder="https://..."
                className="h-9 text-sm"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={loading} size="sm">
                {loading ? "Saving..." : editingId ? "Update" : "Create"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm} size="sm">
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Events List - Mobile friendly cards */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Events ({events.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No events yet</p>
          ) : (
            <div className="space-y-2">
              {events.map((event) => (
                <div key={event.id} className="flex items-start justify-between gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-foreground truncate">{event.title}</h4>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(event.event_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {event.start_time}
                      </span>
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(event)} className="h-8 w-8 p-0">
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(event.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};