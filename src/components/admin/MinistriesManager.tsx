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

type Ministry = Tables<"ministries">;

export const MinistriesManager = () => {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    leader_name: "",
    meeting_schedule: "",
    joining_link: "",
    is_active: true,
  });

  useEffect(() => {
    fetchMinistries();
  }, []);

  const fetchMinistries = async () => {
    const { data, error } = await supabase
      .from("ministries")
      .select("*")
      .order("name");

    if (error) {
      toast.error("Failed to fetch ministries");
      return;
    }

    setMinistries(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        const { error } = await supabase
          .from("ministries")
          .update(formData)
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Ministry updated successfully");
      } else {
        const { error } = await supabase
          .from("ministries")
          .insert([formData]);

        if (error) throw error;
        toast.success("Ministry created successfully");
      }

      resetForm();
      fetchMinistries();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ministry: Ministry) => {
    setEditingId(ministry.id);
    setFormData({
      name: ministry.name,
      description: ministry.description,
      icon: ministry.icon || "",
      leader_name: ministry.leader_name || "",
      meeting_schedule: ministry.meeting_schedule || "",
      joining_link: ministry.joining_link,
      is_active: ministry.is_active ?? true,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ministry?")) return;

    const { error } = await supabase
      .from("ministries")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete ministry");
      return;
    }

    toast.success("Ministry deleted successfully");
    fetchMinistries();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      icon: "",
      leader_name: "",
      meeting_schedule: "",
      joining_link: "",
      is_active: true,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit" : "Add"} Ministry</CardTitle>
          <CardDescription>Manage church ministries with joining links</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leader_name">Leader Name</Label>
                <Input
                  id="leader_name"
                  value={formData.leader_name}
                  onChange={(e) => setFormData({ ...formData, leader_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">Icon (Lucide icon name)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="e.g., Users, Heart, Music"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meeting_schedule">Meeting Schedule</Label>
                <Input
                  id="meeting_schedule"
                  value={formData.meeting_schedule}
                  onChange={(e) => setFormData({ ...formData, meeting_schedule: e.target.value })}
                  placeholder="e.g., Every Sunday 9:00 AM"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="joining_link">Joining Link</Label>
              <Input
                id="joining_link"
                type="url"
                value={formData.joining_link}
                onChange={(e) => setFormData({ ...formData, joining_link: e.target.value })}
                placeholder="https://..."
                required
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
          <CardTitle>Ministries</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Leader</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ministries.map((ministry) => (
                <TableRow key={ministry.id}>
                  <TableCell className="font-medium">{ministry.name}</TableCell>
                  <TableCell>{ministry.leader_name}</TableCell>
                  <TableCell>{ministry.meeting_schedule}</TableCell>
                  <TableCell>{ministry.is_active ? "Active" : "Inactive"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(ministry)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(ministry.id)}
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
