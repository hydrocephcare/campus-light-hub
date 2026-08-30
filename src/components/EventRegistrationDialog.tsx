import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Calendar, MapPin, Clock, CheckCircle, UserPlus } from "lucide-react";

interface EventRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: {
    title: string;
    event_date: string;
    start_time: string;
    end_time?: string | null;
    location: string;
  } | null;
}

export const EventRegistrationDialog = ({ open, onOpenChange, event }: EventRegistrationDialogProps) => {
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error("Please fill in your name and phone number");
      return;
    }
    setIsSubmitting(true);
    
    // Simulate registration (can be connected to a table later)
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setSubmitted(true);
    setIsSubmitting(false);
    toast.success("Registration successful!", { description: `You're registered for ${event?.title}` });
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", phone: "", email: "" });
    }, 300);
  };

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {submitted ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl">You're Registered! 🎉</DialogTitle>
              <DialogDescription className="mt-2">
                We've recorded your registration for <strong>{event.title}</strong>. See you there!
              </DialogDescription>
            </DialogHeader>
            <Button onClick={handleClose} className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground">
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <UserPlus className="w-5 h-5 text-primary" />
                Register for Event
              </DialogTitle>
              <DialogDescription>
                Fill in your details to register for this event.
              </DialogDescription>
            </DialogHeader>

            {/* Event Summary */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-1.5 text-sm">
              <h4 className="font-bold text-foreground">{event.title}</h4>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>{new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>{event.start_time}{event.end_time ? ` - ${event.end_time}` : ''}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>{event.location}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="reg-name">Full Name *</Label>
                <Input
                  id="reg-name"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="reg-phone">Phone Number *</Label>
                <Input
                  id="reg-phone"
                  type="tel"
                  placeholder="0712 345 678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="reg-email">Email (Optional)</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Registering..." : "Register Now"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
