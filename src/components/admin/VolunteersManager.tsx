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

type VolunteerOpportunity = Tables<"volunteer_opportunities">;

export const VolunteersManager = () => {
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    time_commitment: "",
    contact_link: "",
    is_active: true,
  });

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    const { data, error } = await supabase
      .from("volunteer_opportunities")
      .select("*")
      .order("title");

    if (error) {
      toast.error("Failed to fetch volunteer opportunities");
      return;
    }

    setOpportunities(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        const { error } = await supabase
          .from("volunteer_opportunities")
          .update(formData)
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Volunteer opportunity updated successfully");
      } else {
        const { error } = await supabase
          .from("volunteer_opportunities")
          .insert([formData]);

        if (error) throw error;
        toast.success("Volunteer opportunity created successfully");
      }

      resetForm();
      fetchOpportunities();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (opportunity: VolunteerOpportunity) => {
    setEditingId(opportunity.id);
    setFormData({
      title: opportunity.title,
      description: opportunity.description,
      requirements: opportunity.requirements || "",
      time_commitment: opportunity.time_commitment || "",
      contact_link: opportunity.contact_link,
      is_active: opportunity.is_active ?? true,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this volunteer opportunity?")) return;

    const { error } = await supabase
      .from("volunteer_opportunities")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete volunteer opportunity");
      return;
    }

    toast.success("Volunteer opportunity deleted successfully");
    fetchOpportunities();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      requirements: "",
      time_commitment: "",
      contact_link: "",
      is_active: true,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit" : "Add"} Volunteer Opportunity</CardTitle>
          <CardDescription>Manage volunteer opportunities</CardDescription>
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
                <Label htmlFor="time_commitment">Time Commitment</Label>
                <Input
                  id="time_commitment"
                  value={formData.time_commitment}
                  onChange={(e) => setFormData({ ...formData, time_commitment: e.target.value })}
                  placeholder="e.g., 2 hours per week"
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
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                rows={2}
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
          <CardTitle>Volunteer Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Time Commitment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opportunities.map((opportunity) => (
                <TableRow key={opportunity.id}>
                  <TableCell className="font-medium">{opportunity.title}</TableCell>
                  <TableCell>{opportunity.time_commitment}</TableCell>
                  <TableCell>{opportunity.is_active ? "Active" : "Inactive"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(opportunity)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(opportunity.id)}
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
