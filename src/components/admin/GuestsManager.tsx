import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, UserPlus, Mail, Phone, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Guest {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  message: string | null;
  created_at: string;
}

export const GuestsManager = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchGuests(); }, []);

  const fetchGuests = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("guests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setGuests(data || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load guests");
    } finally { setLoading(false); }
  };

  const deleteGuest = async (id: string) => {
    try {
      const { error } = await (supabase as any).from("guests").delete().eq("id", id);
      if (error) throw error;
      setGuests(prev => prev.filter(g => g.id !== id));
      toast.success("Guest removed");
    } catch (e) {
      toast.error("Failed to delete");
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{guests.length} visitor registration{guests.length !== 1 ? "s" : ""}</p>
      </div>

      {guests.length === 0 ? (
        <Card className="p-8 text-center">
          <UserPlus className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground">No visitor registrations yet</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {guests.map((guest) => (
            <Card key={guest.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground">{guest.full_name}</h4>
                  <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{guest.email}</span>
                    {guest.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{guest.phone}</span>}
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDistanceToNow(new Date(guest.created_at), { addSuffix: true })}</span>
                  </div>
                  {guest.message && <p className="mt-2 text-sm text-muted-foreground bg-muted p-2 rounded">{guest.message}</p>}
                </div>
                <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => deleteGuest(guest.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
