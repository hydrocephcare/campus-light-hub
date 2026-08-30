import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, MapPin, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface HomeFellowship {
  id: string;
  name: string;
  area: string;
  meeting_day: string;
  meeting_time: string;
  venue: string | null;
  leader_name: string | null;
  contact_link: string | null;
  description: string | null;
  is_active: boolean;
}

export const HomeFellowshipsManager = () => {
  const [items, setItems] = useState<HomeFellowship[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HomeFellowship | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    area: "",
    meeting_day: "",
    meeting_time: "",
    venue: "",
    leader_name: "",
    contact_link: "",
    description: "",
    is_active: true,
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from("home_fellowships")
        .select("*")
        .order("name");
      
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching home fellowships:", error);
      toast.error("Failed to load home fellowships");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        venue: formData.venue || null,
        leader_name: formData.leader_name || null,
        contact_link: formData.contact_link || null,
        description: formData.description || null,
      };

      if (editingItem) {
        const { error } = await supabase
          .from("home_fellowships")
          .update(payload)
          .eq("id", editingItem.id);
        
        if (error) throw error;
        toast.success("Home fellowship updated");
      } else {
        const { error } = await supabase
          .from("home_fellowships")
          .insert([payload]);
        
        if (error) throw error;
        toast.success("Home fellowship added");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchItems();
    } catch (error) {
      console.error("Error saving home fellowship:", error);
      toast.error("Failed to save home fellowship");
    }
  };

  const handleEdit = (item: HomeFellowship) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      area: item.area,
      meeting_day: item.meeting_day,
      meeting_time: item.meeting_time,
      venue: item.venue || "",
      leader_name: item.leader_name || "",
      contact_link: item.contact_link || "",
      description: item.description || "",
      is_active: item.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this home fellowship?")) return;
    
    try {
      const { error } = await supabase
        .from("home_fellowships")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast.success("Home fellowship deleted");
      fetchItems();
    } catch (error) {
      console.error("Error deleting home fellowship:", error);
      toast.error("Failed to delete home fellowship");
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      area: "",
      meeting_day: "",
      meeting_time: "",
      venue: "",
      leader_name: "",
      contact_link: "",
      description: "",
      is_active: true,
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading home fellowships...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl">Home Fellowships Manager</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Fellowship
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Fellowship" : "Add Fellowship"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Fellowship Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Runda Home Fellowship"
                  required
                />
              </div>

              <div>
                <Label>Area/Location *</Label>
                <Input
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="e.g., Runda estate"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Meeting Day *</Label>
                  <Input
                    value={formData.meeting_day}
                    onChange={(e) => setFormData({ ...formData, meeting_day: e.target.value })}
                    placeholder="e.g., Weekly / Tuesday"
                    required
                  />
                </div>
                <div>
                  <Label>Meeting Time *</Label>
                  <Input
                    value={formData.meeting_time}
                    onChange={(e) => setFormData({ ...formData, meeting_time: e.target.value })}
                    placeholder="e.g., 6:00 PM - 8:00 PM"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Venue</Label>
                <Input
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="e.g., Member homes in Runda"
                />
              </div>

              <div>
                <Label>Leader Name</Label>
                <Input
                  value={formData.leader_name}
                  onChange={(e) => setFormData({ ...formData, leader_name: e.target.value })}
                  placeholder="e.g., John Doe"
                />
              </div>

              <div>
                <Label>Contact Link (WhatsApp)</Label>
                <Input
                  value={formData.contact_link}
                  onChange={(e) => setFormData({ ...formData, contact_link: e.target.value })}
                  placeholder="e.g., https://wa.me/254..."
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Fellowship description..."
                  rows={2}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                />
                <Label>Active</Label>
              </div>

              <Button type="submit" className="w-full">
                {editingItem ? "Update" : "Add"} Fellowship
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No home fellowships found. Add your first one!</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Day & Time</TableHead>
                  <TableHead>Leader</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="w-3 h-3" />
                        {item.area}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{item.meeting_day}</div>
                        <div className="text-muted-foreground">{item.meeting_time}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.leader_name && (
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="w-3 h-3" />
                          {item.leader_name}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
