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

type Fellowship = Tables<"fellowships">;

export const FellowshipsManager = () => {
  const [fellowships, setFellowships] = useState<Fellowship[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    meeting_day: "",
    meeting_time: "",
    contact_person: "",
    contact_link: "",
    capacity: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchFellowships();
  }, []);

  const fetchFellowships = async () => {
    const { data, error } = await supabase
      .from("fellowships")
      .select("*")
      .order("name");

    if (error) {
      toast.error("Failed to fetch fellowships");
      return;
    }

    setFellowships(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        const { error } = await supabase
          .from("fellowships")
          .update(formData)
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Fellowship updated successfully");
      } else {
        const { error } = await supabase
          .from("fellowships")
          .insert([formData]);

        if (error) throw error;
        toast.success("Fellowship created successfully");
      }

      resetForm();
      fetchFellowships();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (fellowship: Fellowship) => {
    setEditingId(fellowship.id);
    setFormData({
      name: fellowship.name,
      description: fellowship.description,
      location: fellowship.location,
      meeting_day: fellowship.meeting_day,
      meeting_time: fellowship.meeting_time,
      contact_person: fellowship.contact_person || "",
      contact_link: fellowship.contact_link,
      capacity: fellowship.capacity || 0,
      is_active: fellowship.is_active ?? true,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this fellowship?")) return;

    const { error } = await supabase
      .from("fellowships")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete fellowship");
      return;
    }

    toast.success("Fellowship deleted successfully");
    fetchFellowships();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      location: "",
      meeting_day: "",
      meeting_time: "",
      contact_person: "",
      contact_link: "",
      capacity: 0,
      is_active: true,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit" : "Add"} Fellowship</CardTitle>
          <CardDescription>Manage campus fellowships</CardDescription>
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
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meeting_day">Meeting Day</Label>
                <Input
                  id="meeting_day"
                  value={formData.meeting_day}
                  onChange={(e) => setFormData({ ...formData, meeting_day: e.target.value })}
                  placeholder="e.g., Friday"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meeting_time">Meeting Time</Label>
                <Input
                  id="meeting_time"
                  value={formData.meeting_time}
                  onChange={(e) => setFormData({ ...formData, meeting_time: e.target.value })}
                  placeholder="e.g., 6:00 PM"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_person">Contact Person</Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
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
              <Label htmlFor="contact_link">Contact Link</Label>
              <Input
                id="contact_link"
                type="url"
                value={formData.contact_link}
                onChange={(e) => setFormData({ ...formData, contact_link: e.target.value })}
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
          <CardTitle>Fellowships</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Meeting</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fellowships.map((fellowship) => (
                <TableRow key={fellowship.id}>
                  <TableCell className="font-medium">{fellowship.name}</TableCell>
                  <TableCell>{fellowship.location}</TableCell>
                  <TableCell>
                    {fellowship.meeting_day} {fellowship.meeting_time}
                  </TableCell>
                  <TableCell>{fellowship.contact_person}</TableCell>
                  <TableCell>{fellowship.is_active ? "Active" : "Inactive"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(fellowship)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(fellowship.id)}
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
