import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Camera,
  CheckCircle,
  Clock,
  MapPin,
  Play,
  Share2,
  Sparkles,
  Tag,
  UserPlus,
  X,
} from "lucide-react";
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
import { videoEmbedUrl } from "@/lib/missions";

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
  theme?: string | null;
  scripture?: string | null;
  event_type?: string | null;
  slug?: string | null;
  is_published?: boolean | null;
}

interface EventPhoto {
  id: string;
  title: string;
  media_url: string;
  sort_order: number;
}

interface EventVideo {
  id: string;
  youtube_id: string;
  youtube_url: string;
  title: string | null;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [photos, setPhotos] = useState<EventPhoto[]>([]);
  const [videos, setVideos] = useState<EventVideo[]>([]);
  const [lightbox, setLightbox] = useState<EventPhoto | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const fallback = staticEvents.find((e) => e.id === id) || null;
      try {
        const column = UUID_RE.test(id) ? "id" : "slug";
        const { data } = await supabase.from("events").select("*").eq(column, id).maybeSingle();
        const record = (data as EventRecord) || fallback;
        setEvent(record);

        if (record?.id && UUID_RE.test(record.id)) {
          const [{ data: photoRows }, { data: videoRows }] = await Promise.all([
            supabase
              .from("media_gallery")
              .select("id,title,media_url,sort_order")
              .eq("event_id", record.id)
              .order("sort_order", { ascending: true }),
            (supabase as any)
              .from("archive_videos")
              .select("id,youtube_id,youtube_url,title")
              .eq("event_id", record.id)
              .order("sort_order", { ascending: true }),
          ]);
          setPhotos((photoRows as EventPhoto[]) || []);
          setVideos((videoRows as EventVideo[]) || []);
        }
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
      event?.theme ||
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

  if (!event || event.is_published === false) {
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
  const isPast = event.event_date < new Date().toISOString().split("T")[0];

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
                  className="mx-auto max-h-[60vh] w-full rounded-xl object-contain"
                />
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                {event.category && (
                  <Badge className="bg-primary/10 text-primary capitalize">
                    <Tag className="mr-1 h-3 w-3" /> {event.category}
                  </Badge>
                )}
                <Badge variant="outline">{dateLabel}</Badge>
                {isPast && <Badge variant="secondary">Archive</Badge>}
              </div>

              <h1 className="mt-4 font-serif text-3xl font-bold leading-tight text-foreground md:text-4xl">{event.title}</h1>

              {(event.theme || event.scripture) && (
                <Card className="mt-4 border-primary/20 bg-primary/5 p-4">
                  {event.theme && (
                    <p className="flex items-start gap-2 font-serif text-lg font-semibold text-primary">
                      <Sparkles className="mt-1 h-4 w-4 flex-shrink-0" /> {event.theme}
                    </p>
                  )}
                  {event.scripture && (
                    <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4 text-primary" /> {event.scripture}
                    </p>
                  )}
                </Card>
              )}

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
                {isPast ? (
                  <div className="py-4 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                      <Camera className="h-7 w-7 text-primary" />
                    </div>
                    <h2 className="font-serif text-xl font-bold text-card-foreground">This gathering has passed</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {photos.length > 0 || videos.length > 0
                        ? `Relive it below — ${photos.length} photo${photos.length === 1 ? "" : "s"}${
                            videos.length ? ` and ${videos.length} recording${videos.length === 1 ? "" : "s"}` : ""
                          }.`
                        : "Media from this gathering is being archived."}
                    </p>
                    <Link to="/events" className="mt-5 inline-block">
                      <Button variant="outline">See upcoming events</Button>
                    </Link>
                  </div>
                ) : registered ? (
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

        {/* Recordings */}
        {videos.length > 0 && (
          <section className="border-t border-border bg-muted/30 py-12">
            <div className="container mx-auto max-w-6xl px-4">
              <h2 className="mb-6 flex items-center gap-2 font-serif text-2xl font-bold text-foreground">
                <Play className="h-5 w-5 text-primary" /> Watch the recordings
              </h2>
              <div className="grid gap-5 md:grid-cols-2">
                {videos.map((v) => (
                  <div key={v.id} className="overflow-hidden rounded-xl border border-border bg-card">
                    <div className="aspect-video w-full bg-black">
                      <iframe
                        src={videoEmbedUrl(v.youtube_url)}
                        title={v.title || event.title}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                    {v.title && <p className="p-4 text-sm font-medium text-card-foreground">{v.title}</p>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Pictorial */}
        {photos.length > 0 && (
          <section className="border-t border-border py-12">
            <div className="container mx-auto max-w-6xl px-4">
              <h2 className="mb-6 flex items-center gap-2 font-serif text-2xl font-bold text-foreground">
                <Camera className="h-5 w-5 text-primary" /> Pictorial ({photos.length})
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {photos.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setLightbox(p)}
                    className="group aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted"
                  >
                    <img
                      src={optimizedImageUrl(p.media_url, { width: 700, quality: 70 })}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 p-4 backdrop-blur"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute right-4 top-4 rounded-full bg-card p-2 text-card-foreground shadow"
            onClick={() => setLightbox(null)}
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={lightbox.media_url}
            alt={lightbox.title}
            className="max-h-[88vh] max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <Footer />
    </div>
  );
};

export default EventDetail;
