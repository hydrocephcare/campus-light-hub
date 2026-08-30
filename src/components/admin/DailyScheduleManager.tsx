import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Clock, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DailyScheduleItem {
  id: string;
  day_of_week: string;
  theme: string | null;
  activity_name: string;
  activity_type: string;
  start_time: string;
  end_time: string | null;
  venue: string;
  description: string | null;
  facilitator: string | null;
  is_recurring: boolean;
  is_active: boolean;
  display_order: number;
}

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const activityTypes = ["regular", "fasting", "special", "outreach", "practice", "service"];

export const DailyScheduleManager = () => {
  const [items, setItems] = useState<DailyScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DailyScheduleItem | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>("all");
  
  const [formData, setFormData] = useState({
    day_of_week: "Sunday",
    theme: "",
    activity_name: "",
    activity_type: "regular",
    start_time: "",
    end_time: "",
    venue: "",
    description: "",
    facilitator: "",
    is_recurring: true,
    is_active: true,
    display_order: 0,
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from("daily_schedule")
        .select("*")
        .order("day_of_week")
        .order("display_order");
      
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching daily schedule:", error);
      toast.error("Failed to load schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        end_time: formData.end_time || null,
        theme: formData.theme || null,
        description: formData.description || null,
        facilitator: formData.facilitator || null,
      };

      if (editingItem) {
        const { error } = await supabase
          .from("daily_schedule")
          .update(payload)
          .eq("id", editingItem.id);
        
        if (error) throw error;
        toast.success("Schedule item updated");
      } else {
        const { error } = await supabase
          .from("daily_schedule")
          .insert([payload]);
        
        if (error) throw error;
        toast.success("Schedule item added");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchItems();
    } catch (error) {
      console.error("Error saving schedule item:", error);
      toast.error("Failed to save schedule item");
    }
  };

  const handleEdit = (item: DailyScheduleItem) => {
    setEditingItem(item);
    setFormData({
      day_of_week: item.day_of_week,
      theme: item.theme || "",
      activity_name: item.activity_name,
      activity_type: item.activity_type,
      start_time: item.start_time,
      end_time: item.end_time || "",
      venue: item.venue,
      description: item.description || "",
      facilitator: item.facilitator || "",
      is_recurring: item.is_recurring,
      is_active: item.is_active,
      display_order: item.display_order,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this schedule item?")) return;
    
    try {
      const { error } = await supabase
        .from("daily_schedule")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast.success("Schedule item deleted");
      fetchItems();
    } catch (error) {
      console.error("Error deleting schedule item:", error);
      toast.error("Failed to delete schedule item");
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      day_of_week: "Sunday",
      theme: "",
      activity_name: "",
      activity_type: "regular",
      start_time: "",
      end_time: "",
      venue: "",
      description: "",
      facilitator: "",
      is_recurring: true,
      is_active: true,
      display_order: 0,
    });
  };

  const filteredItems = selectedDay === "all" 
    ? items 
    : items.filter(item => item.day_of_week === selectedDay);

  if (loading) {
    return <div className="text-center py-8">Loading schedule...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl">Daily Schedule Manager</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Activity
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Activity" : "Add Activity"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Day of Week *</Label>
                  <Select value={formData.day_of_week} onValueChange={(v) => setFormData({ ...formData, day_of_week: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map(day => (
                        <SelectItem key={day} value={day}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Activity Type</Label>
                  <Select value={formData.activity_type} onValueChange={(v) => setFormData({ ...formData, activity_type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {activityTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Activity Name *</Label>
                <Input
                  value={formData.activity_name}
                  onChange={(e) => setFormData({ ...formData, activity_name: e.target.value })}
                  placeholder="e.g., Morning Devotions"
                  required
                />
              </div>

              <div>
                <Label>Theme</Label>
                <Input
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  placeholder="e.g., Prayer & Fasting Focus"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Time *</Label>
                  <Input
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    placeholder="e.g., 5:00 AM"
                    required
                  />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    placeholder="e.g., 6:00 AM"
                  />
                </div>
              </div>

              <div>
                <Label>Venue *</Label>
                <Input
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="e.g., MLT Hall B"
                  required
                />
              </div>

              <div>
                <Label>Facilitator</Label>
                <Input
                  value={formData.facilitator}
                  onChange={(e) => setFormData({ ...formData, facilitator: e.target.value })}
                  placeholder="e.g., Choir Ministry"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Activity description..."
                  rows={2}
                />
              </div>

              <div>
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                  />
                  <Label>Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_recurring}
                    onCheckedChange={(v) => setFormData({ ...formData, is_recurring: v })}
                  />
                  <Label>Recurring</Label>
                </div>
              </div>

              <Button type="submit" className="w-full">
                {editingItem ? "Update" : "Add"} Activity
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Select value={selectedDay} onValueChange={setSelectedDay}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by day" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Days</SelectItem>
              {daysOfWeek.map(day => (
                <SelectItem key={day} value={day}>{day}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredItems.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No schedule items found. Add your first activity!</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.day_of_week}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.activity_name}</div>
                        {item.theme && <div className="text-xs text-muted-foreground">{item.theme}</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="w-3 h-3" />
                        {item.start_time}{item.end_time && ` - ${item.end_time}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="w-3 h-3" />
                        {item.venue}
                      </div>
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
