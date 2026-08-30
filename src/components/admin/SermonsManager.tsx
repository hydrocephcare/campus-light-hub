import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type Sermon = Tables<"sermons">;

export const SermonsManager = () => {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    youtube_url: "",
    youtube_id: "",
    speaker: "",
    sermon_date: "",
    category: "Sunday Service",
    is_featured: false,
  });

  useEffect(() => {
    fetchSermons();
  }, []);

  const fetchSermons = async () => {
    const { data, error } = await supabase
      .from("sermons")
      .select("*")
      .order("sermon_date", { ascending: false });

    if (error) {
      toast.error("Failed to fetch sermons");
      return;
    }

    setSermons(data || []);
  };

  const extractYouTubeId = (url: string): string => {
    // Handles multiple URL formats:
    // - https://www.youtube.com/watch?v=VIDEO_ID
    // - https://youtu.be/VIDEO_ID
    // - https://www.youtube.com/embed/VIDEO_ID
    // - https://www.youtube.com/live/VIDEO_ID?si=...
    const regExp = /^.*(youtu\.be\/|youtube\.com\/(watch\?v=|embed\/|live\/|v\/|u\/\w\/|shorts\/))([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[3]?.length === 11 ? match[3] : "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const youtubeId = extractYouTubeId(formData.youtube_url);
      if (!youtubeId) {
        toast.error("Invalid YouTube URL");
        setLoading(false);
        return;
      }

      const dataToSubmit = {
        ...formData,
        youtube_id: youtubeId,
      };

      if (editingId) {
        const { error } = await supabase
          .from("sermons")
          .update(dataToSubmit)
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Sermon updated successfully");
      } else {
        const { error } = await supabase
          .from("sermons")
          .insert([dataToSubmit]);

        if (error) throw error;
        toast.success("Sermon created successfully");
      }

      resetForm();
      fetchSermons();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (sermon: Sermon) => {
    setEditingId(sermon.id);
    setFormData({
      title: sermon.title,
      description: sermon.description || "",
      youtube_url: sermon.youtube_url,
      youtube_id: sermon.youtube_id,
      speaker: sermon.speaker || "",
      sermon_date: sermon.sermon_date || "",
      category: sermon.category || "Sunday Service",
      is_featured: sermon.is_featured ?? false,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sermon?")) return;

    const { error } = await supabase
      .from("sermons")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete sermon");
      return;
    }

    toast.success("Sermon deleted successfully");
    fetchSermons();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      youtube_url: "",
      youtube_id: "",
      speaker: "",
      sermon_date: "",
      category: "Sunday Service",
      is_featured: false,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit" : "Add"} Sermon</CardTitle>
          <CardDescription>Manage sermons and YouTube videos</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="speaker">Speaker</Label>
                <Input
                  id="speaker"
                  value={formData.speaker}
                  onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sermon_date">Date</Label>
                <Input
                  id="sermon_date"
                  type="date"
                  value={formData.sermon_date}
                  onChange={(e) => setFormData({ ...formData, sermon_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtube_url">YouTube URL</Label>
              <Input
                id="youtube_url"
                type="url"
                value={formData.youtube_url}
                onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : editingId ? "Update" : "Create"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sermons</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Speaker</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sermons.map((sermon) => (
                <TableRow key={sermon.id}>
                  <TableCell className="font-medium">{sermon.title}</TableCell>
                  <TableCell>{sermon.speaker}</TableCell>
                  <TableCell>
                    {sermon.sermon_date ? new Date(sermon.sermon_date).toLocaleDateString() : "N/A"}
                  </TableCell>
                  <TableCell>{sermon.category}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(sermon)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(sermon.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
