import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, CheckCircle, Clock, MapPin, Share2, Tag, UserPlus } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { staticEvents } from "@/data/staticSiteContent";
import { getEventImage } from "@/lib/eventImages";
import { optimizedImageUrl } from "@/lib/imageUrl";
import { useSEO } from "@/hooks/useSEO";
import { shareItem } from "@/lib/shareLinks";

interface EventRecord {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string;
  end_time: string | null;
  location: string;
  category: string | null;
  image_url: string | null;
  registration_link?: string | null;
}

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const fallback = staticEvents.find((e) => e.id === id) || null;
      try {
        const { data } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
        setEvent((data as EventRecord) || fallback);
      } catch {
        setEvent(fallback);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const image = event ? getEventImage(event.category, event.image_url) : "";

  useSEO({
    title: event?.title || "Event",
    description:
      event?.description ||
      (event ? `${new Date(event.event_date).toDateString()} · ${event.start_time} · ${event.location}` : "MKU Christian Union event"),
    image,
    url: typeof window !== "undefined" ? window.location.href : undefined,
    type: "article",
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Please add your name and phone number");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);
    setRegistered(true);
    toast.success("Registration received", { description: `You're registered for ${event?.title}` });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-24 text-center text-muted-foreground">Loading event…</main>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-24 text-center">
          <h1 className="font-serif text-3xl font-bold text-foreground">Event not found</h1>
          <Link to="/events" className="mt-6 inline-block">
            <Button variant="outline">Back to all events</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const dateLabel = new Date(event.event_date).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <main>
        <section className="border-b border-border bg-muted/30 py-6">
          <div className="container mx-auto px-4">
            <Link to="/events" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              <ArrowLeft className="h-4 w-4" /> All events
            </Link>
          </div>
        </section>

        <section className="py-8 md:py-12">
          <div className="container mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-[1.15fr_1fr]">
            <div>
              <div className="overflow-hidden rounded-2xl border border-border bg-muted p-2">
                <img
                  src={optimizedImageUrl(image, { width: 1200, quality: 78 })}
                  alt={event.title}
                  className="h-full w-full rounded-xl object-contain"
                />
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                {event.category && (
                  <Badge className="bg-primary/10 text-primary capitalize">
                    <Tag className="mr-1 h-3 w-3" /> {event.category}
                  </Badge>
                )}
                <Badge variant="outline">{dateLabel}</Badge>
              </div>

              <h1 className="mt-4 font-serif text-3xl font-bold leading-tight text-foreground md:text-4xl">{event.title}</h1>

              {event.description && (
                <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-muted-foreground">{event.description}</p>
              )}

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  { icon: Calendar, label: "Date", value: dateLabel },
                  { icon: Clock, label: "Time", value: `${event.start_time}${event.end_time ? ` – ${event.end_time}` : ""}` },
                  { icon: MapPin, label: "Venue", value: event.location },
                ].map(({ icon: Icon, label, value }) => (
                  <Card key={label} className="border-border bg-card p-4">
                    <Icon className="mb-2 h-4 w-4 text-primary" />
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
                    <p className="mt-1 text-sm font-semibold text-card-foreground">{value}</p>
                  </Card>
                ))}
              </div>

              <Button
                variant="outline"
                className="mt-6"
                onClick={() =>
                  shareItem({
                    kind: "event",
                    key: event.id,
                    title: event.title,
                    text: `${event.title} — ${dateLabel} at ${event.location}`,
                    onCopied: () => toast.success("Event link copied"),
                  })
                }
              >
                <Share2 className="mr-2 h-4 w-4" /> Share this event
              </Button>
            </div>

            <div className="lg:sticky lg:top-24 lg:self-start">
              <Card className="border-border bg-card p-6">
                {registered ? (
                  <div className="py-6 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                      <CheckCircle className="h-7 w-7 text-primary" />
                    </div>
                    <h2 className="font-serif text-xl font-bold text-card-foreground">You're registered</h2>
                    <p className="mt-2 text-sm text-muted-foreground">See you at {event.location} on {dateLabel}.</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 flex items-center gap-2">
                      <UserPlus className="h-5 w-5 text-primary" />
                      <h2 className="font-serif text-xl font-bold text-card-foreground">Register to attend</h2>
                    </div>
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div>
                        <Label htmlFor="ev-name">Full name *</Label>
                        <Input id="ev-name" placeholder="Your full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                      </div>
                      <div>
                        <Label htmlFor="ev-phone">Phone number *</Label>
                        <Input id="ev-phone" type="tel" placeholder="0712 345 678" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                      </div>
                      <div>
                        <Label htmlFor="ev-email">Email (optional)</Label>
                        <Input id="ev-email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                      </div>
                      <Button type="submit" className="w-full" disabled={submitting}>
                        {submitting ? "Registering…" : "Register now"}
                      </Button>
                    </form>
                    {event.registration_link && (
                      <a href={event.registration_link} target="_blank" rel="noopener noreferrer" className="mt-3 block">
                        <Button variant="outline" className="w-full">Open official registration</Button>
                      </a>
                    )}
                  </>
                )}
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default EventDetail;
