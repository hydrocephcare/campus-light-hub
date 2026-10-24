import { MapPin, Clock, ArrowRight, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { shareItem } from "@/lib/shareLinks";
import { SectionHeading } from "@/components/SectionHeading";
import { ScrollRow } from "@/components/ScrollRow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getEventImage } from "@/lib/eventImages";
import { optimizedImageUrl } from "@/lib/imageUrl";
import { staticEvents } from "@/data/staticSiteContent";
import { semesterCalendar2026 } from "@/data/semesterCalendar2026";

interface Event { id:string; title:string; description:string|null; event_date:string; start_time:string; end_time:string|null; location:string; category:string|null; image_url:string|null; registration_link:string|null; theme?:string|null; scripture?:string|null; }
const localDateKey=()=>{const n=new Date();return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`};
const canonicalize=(e:Event):Event=>e.event_date==="2026-09-13"&&e.title.toLowerCase().includes("sunday")?{...e,title:"Sunday Service",description:"Once again, brothers and sisters in Christ, we invite you to our Sunday service. Come expectant, ready to listen to the Lord and be refreshed.",start_time:"7:00 AM",end_time:"12:45 PM",location:"CC Hall",category:"Sunday Service",theme:"Manifestation of the Glory of God",scripture:"Isaiah 60:1"}:e;
const eventKey=(e:Event)=>`${e.event_date}|${e.title.toLowerCase().replace(/[^a-z0-9]+/g," ").trim()}`;

export const UpcomingEvents=()=>{
 const initialOfficial=[...staticEvents,...semesterCalendar2026].filter(e=>e.event_date>=localDateKey()).map(e=>canonicalize(e as Event)).sort((a,b)=>a.event_date.localeCompare(b.event_date)).slice(0,8);
 const [events,setEvents]=useState<Event[]>(initialOfficial); const [loading,setLoading]=useState(false);
 useEffect(()=>{(async()=>{const today=localDateKey(); const official=[...staticEvents,...semesterCalendar2026].filter(e=>e.event_date>=today).map(e=>canonicalize(e as Event)); try{const {data,error}=await supabase.from("events").select("*").gte("event_date",today).order("event_date",{ascending:true}); if(error)throw error; const merged=new Map<string,Event>(); official.forEach(e=>merged.set(eventKey(e),e)); (data||[]).map(e=>canonicalize(e as Event)).forEach(e=>{const key=eventKey(e);const base=merged.get(key);merged.set(key,base?{...base,...e,image_url:e.image_url||base.image_url,description:e.description||base.description}:e)}); setEvents([...merged.values()].sort((a,b)=>a.event_date.localeCompare(b.event_date)).slice(0,8));}catch(err){console.error(err);setEvents(official.sort((a,b)=>a.event_date.localeCompare(b.event_date)).slice(0,8));}finally{setLoading(false)}})()},[]);
 if(!events.length)return null;
 return (
  <section className="py-12 md:py-16">
   <div className="container mx-auto px-4">
    <SectionHeading
     eyebrow="2026/2027 semester"
     title="Coming up"
     action={<Button asChild variant="outline" className="rounded-full border-border"><Link to="/events">Full calendar <ArrowRight className="ml-2 h-4 w-4"/></Link></Button>}
    />
    <ScrollRow>
     {events.map(event => {
      const d = new Date(`${event.event_date}T12:00:00`);
      return (
       <article key={event.id} className="group relative flex w-[82%] shrink-0 snap-start flex-col overflow-hidden rounded-3xl border border-border bg-card transition duration-300 hover:-translate-y-1 hover:border-secondary/50 hover:shadow-2xl sm:w-[21rem]">
        <Link to={`/events/${event.id}`} className="relative block aspect-[4/3] overflow-hidden bg-muted">
         <img src={optimizedImageUrl(getEventImage(event.category,event.image_url),{width:720,quality:76,resize:"cover"})} alt={event.title} className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105" loading="lazy" decoding="async"/>
         <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"/>
         <div className="absolute left-4 top-4 rounded-2xl bg-secondary px-3 py-2 text-center leading-none text-secondary-foreground shadow-lg">
          <p className="font-serif text-2xl font-semibold">{d.getDate()}</p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest">{d.toLocaleDateString("en-GB",{month:"short"})}</p>
         </div>
         {event.category && <Badge className="absolute bottom-3 left-4 bg-black/50 text-white backdrop-blur">{event.category}</Badge>}
        </Link>
        <div className="flex flex-1 flex-col p-5">
         <h3 className="line-clamp-2 font-serif text-xl font-semibold leading-snug text-card-foreground">{event.title}</h3>
         {event.theme && <p className="mt-1 line-clamp-1 text-sm font-medium text-primary">{event.theme}</p>}
         <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          <p className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-primary"/>{event.start_time}{event.end_time?` – ${event.end_time}`:""}</p>
          <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-primary"/>{event.location}</p>
         </div>
         <div className="mt-auto flex items-center justify-between pt-5">
          <Link to={`/events/${event.id}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline underline-offset-8">View details <ArrowRight className="h-4 w-4"/></Link>
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" aria-label={`Share ${event.title}`} onClick={()=>shareItem({kind:"event",key:event.id,title:event.title,text:`${event.title} — ${d.toLocaleDateString()} · ${event.start_time} · ${event.location}`,onCopied:()=>toast.success("Event link copied!")})}><Share2 className="h-3.5 w-3.5"/></Button>
         </div>
        </div>
       </article>
      );
     })}
    </ScrollRow>
   </div>
  </section>
 );
};
