import { lazy, Suspense } from "react";
import { EnhancedHeroSlider } from "@/components/EnhancedHeroSlider";
import { DailyVerse } from "@/components/DailyVerse";
import { QuickActions } from "@/components/QuickActions";
import { EnhancedStatsCounter } from "@/components/EnhancedStatsCounter";
import { ServiceTimes } from "@/components/ServiceTimes";
import { SchedulePreview } from "@/components/SchedulePreview";
import { UpcomingEvents } from "@/components/UpcomingEvents";
import { ChurchAnnouncements } from "@/components/ChurchAnnouncements";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import { SEOHead } from "@/components/SEOHead";

// Lazy load below-fold heavy sections
const EventCalendarPopup = lazy(() => import("@/components/EventCalendarPopup").then(m => ({ default: m.EventCalendarPopup })));
const VisionMission = lazy(() => import("@/components/VisionMission").then(m => ({ default: m.VisionMission })));
const LeadersPreview = lazy(() => import("@/components/LeadersPreview").then(m => ({ default: m.LeadersPreview })));
const MinistriesPreview = lazy(() => import("@/components/MinistriesPreview").then(m => ({ default: m.MinistriesPreview })));
const CampusFellowships = lazy(() => import("@/components/CampusFellowships").then(m => ({ default: m.CampusFellowships })));
const LatestSermons = lazy(() => import("@/components/LatestSermons").then(m => ({ default: m.LatestSermons })));
const PrayerRequestForm = lazy(() => import("@/components/PrayerRequestForm").then(m => ({ default: m.PrayerRequestForm })));
const GivingSection = lazy(() => import("@/components/GivingSection").then(m => ({ default: m.GivingSection })));
const GuestForm = lazy(() => import("@/components/GuestForm").then(m => ({ default: m.GuestForm })));
const LatestBlogPost = lazy(() => import("@/components/LatestBlogPost").then(m => ({ default: m.LatestBlogPost })));
const GalleryPreview = lazy(() => import("@/components/GalleryPreview").then(m => ({ default: m.GalleryPreview })));
const ConnectWithUs = lazy(() => import("@/components/ConnectWithUs").then(m => ({ default: m.ConnectWithUs })));

const SectionFallback = () => <div className="py-8" />;

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SEOHead page="home" />
      <Header />
      <main>
        <EnhancedHeroSlider />
        
        <AnimatedSection animation="fade-up">
          <DailyVerse />
        </AnimatedSection>
        
        <AnimatedSection animation="fade-up" delay={100}>
          <QuickActions />
        </AnimatedSection>
        
        <AnimatedSection animation="scale">
          <EnhancedStatsCounter />
        </AnimatedSection>
        
        <AnimatedSection animation="fade-up">
          <ServiceTimes />
        </AnimatedSection>

        <AnimatedSection animation="fade-up">
          <SchedulePreview />
        </AnimatedSection>
        
        <AnimatedSection animation="fade-up">
          <UpcomingEvents />
        </AnimatedSection>

        <AnimatedSection animation="fade-up">
          <ChurchAnnouncements />
        </AnimatedSection>

        {/* Below-fold lazy-loaded sections */}
        <Suspense fallback={<SectionFallback />}>
          <AnimatedSection animation="fade-up">
            <EventCalendarPopup />
          </AnimatedSection>
          
          <AnimatedSection animation="fade-up">
            <VisionMission />
          </AnimatedSection>
          
          <AnimatedSection animation="fade-up">
            <LeadersPreview />
          </AnimatedSection>
          
          <AnimatedSection animation="fade-up">
            <MinistriesPreview />
          </AnimatedSection>
          
          <AnimatedSection animation="fade-up">
            <CampusFellowships />
          </AnimatedSection>
          
          <AnimatedSection animation="fade-up">
            <LatestSermons />
          </AnimatedSection>
          
          <AnimatedSection animation="fade-up">
            <PrayerRequestForm />
          </AnimatedSection>
          
          <AnimatedSection animation="fade-up">
            <GivingSection />
          </AnimatedSection>
          
          <AnimatedSection animation="fade-up">
            <GuestForm />
          </AnimatedSection>
          
          <AnimatedSection animation="fade-up">
            <LatestBlogPost />
          </AnimatedSection>
          
          <AnimatedSection animation="fade-up">
            <GalleryPreview />
          </AnimatedSection>
          
          <AnimatedSection animation="fade-up">
            <ConnectWithUs />
          </AnimatedSection>
        </Suspense>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
};

export default Index;
