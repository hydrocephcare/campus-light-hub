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
import { ImageUpload } from "./ImageUpload";

type Leader = Tables<"leaders">;

export const LeadersManager = () => {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    bio: "",
    email: "",
    image_url: "",
    display_order: 0,
    is_active: true,
    term: "2026-2027",
    docket: "Executive Committee",
  });

  useEffect(() => {
    fetchLeaders();
  }, []);

  const fetchLeaders = async () => {
    const { data, error } = await supabase
      .from("leaders")
      .select("*")
      .order("term", { ascending: false })
      .order("display_order");

    if (error) {
      toast.error("Failed to fetch leaders");
      return;
    }

    setLeaders(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        const { error } = await supabase
          .from("leaders")
          .update(formData)
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Leader updated successfully");
      } else {
        const { error } = await supabase
          .from("leaders")
          .insert([formData]);

        if (error) throw error;
        toast.success("Leader created successfully");
      }

      resetForm();
      fetchLeaders();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (leader: Leader) => {
    setEditingId(leader.id);
    setFormData({
      name: leader.name,
      position: leader.position,
      bio: leader.bio || "",
      email: leader.email || "",
      image_url: leader.image_url || "",
      display_order: leader.display_order || 0,
      is_active: leader.is_active ?? true,
      term: leader.term || "2026-2027",
      docket: leader.docket || "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this leader?")) return;

    const { error } = await supabase
      .from("leaders")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete leader");
      return;
    }

    toast.success("Leader deleted successfully");
    fetchLeaders();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      position: "",
      bio: "",
      email: "",
      image_url: "",
      display_order: 0,
      is_active: true,
      term: "2026-2027",
      docket: "Executive Committee",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit" : "Add"} Leader</CardTitle>
          <CardDescription>Manage church leadership team</CardDescription>
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
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <ImageUpload
                label="Photo"
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                folder="leaders"
                square
              />
              <div className="space-y-2">
                <Label htmlFor="term">Spiritual Year / Term</Label>
                <Input
                  id="term"
                  placeholder="2026-2027"
                  value={formData.term}
                  onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="docket">Docket / Group</Label>
                <Input
                  id="docket"
                  placeholder="Executive Committee"
                  value={formData.docket}
                  onChange={(e) => setFormData({ ...formData, docket: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
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
          <CardTitle>Leaders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaders.map((leader) => (
                <TableRow key={leader.id}>
                  <TableCell className="font-medium">{leader.name}</TableCell>
                  <TableCell>{leader.position}</TableCell>
                  <TableCell>{leader.term}</TableCell>
                  <TableCell>{leader.email}</TableCell>
                  <TableCell>{leader.display_order}</TableCell>
                  <TableCell>{leader.is_active ? "Active" : "Inactive"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(leader)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(leader.id)}
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
