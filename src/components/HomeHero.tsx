import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { optimizedImageUrl } from "@/lib/imageUrl";
import { COMMUNITY_IMAGES, WHATSAPP_LINK } from "@/lib/siteImages";

export const HomeHero = () => (
  <section className="relative overflow-hidden pt-28 pb-14 md:pt-36 md:pb-24">
    <div className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-secondary/20 blur-3xl" />
    <div className="container relative mx-auto px-4">
      <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-6">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
            Mount Kenya University · Christian Union
          </p>
          <h1 className="text-balance text-5xl font-semibold leading-[1.02] text-foreground sm:text-6xl lg:text-7xl">
            Know God.
            <br />
            <span className="italic text-primary">Belong</span> here.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
            A student family on campus that worships, studies the Word, prays and serves together. Whoever you are, there is a seat for you.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Join MKU CU <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              to="/events"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/20 px-7 py-3.5 text-base font-semibold text-foreground transition hover:bg-foreground hover:text-background"
            >
              See what's on
            </Link>
          </div>
          <p className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            Sundays from 7:00 AM · CC Hall
          </p>
        </div>

        <div className="relative lg:col-span-6">
          <div className="grid grid-cols-6 grid-rows-6 gap-3 md:gap-4">
            <img
              src={optimizedImageUrl(COMMUNITY_IMAGES[0], { width: 1100, quality: 74 })}
              alt="MKU Christian Union gathering"
              className="col-span-4 row-span-6 h-full min-h-[22rem] w-full rounded-[2rem] object-cover md:min-h-[30rem]"
              loading="eager"
              decoding="async"
            />
            <img
              src={optimizedImageUrl(COMMUNITY_IMAGES[2], { width: 600, quality: 72 })}
              alt="Fellowship at MKU CU"
              className="col-span-2 row-span-3 h-full w-full rounded-[1.5rem] object-cover"
              loading="eager"
              decoding="async"
            />
            <img
              src={optimizedImageUrl(COMMUNITY_IMAGES[4], { width: 600, quality: 72 })}
              alt="Worship at MKU CU"
              className="col-span-2 row-span-3 h-full w-full rounded-[1.5rem] object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
          <figure className="absolute -bottom-5 left-4 max-w-[17rem] rounded-2xl bg-primary p-5 text-primary-foreground shadow-xl md:-left-6">
            <blockquote className="font-serif text-base italic leading-snug">
              “Now this is eternal life: that they know you, the only true God.”
            </blockquote>
            <figcaption className="mt-2 text-xs font-semibold uppercase tracking-widest text-secondary">John 17:3</figcaption>
          </figure>
        </div>
      </div>
    </div>
  </section>
);
