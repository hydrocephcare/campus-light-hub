import { lazy, Suspense } from "react";
import { EnhancedHeroSlider } from "@/components/EnhancedHeroSlider";
import { DailyVerse } from "@/components/DailyVerse";
import { QuickActions } from "@/components/QuickActions";
import { ServiceTimes } from "@/components/ServiceTimes";
import { UpcomingEvents } from "@/components/UpcomingEvents";
import { ChurchAnnouncements } from "@/components/ChurchAnnouncements";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import { SEOHead } from "@/components/SEOHead";

const VisionMission = lazy(() => import("@/components/VisionMission").then(m => ({ default: m.VisionMission })));
const MinistriesPreview = lazy(() => import("@/components/MinistriesPreview").then(m => ({ default: m.MinistriesPreview })));
const LatestSermons = lazy(() => import("@/components/LatestSermons").then(m => ({ default: m.LatestSermons })));
const PhotoGalleryPreview = lazy(() => import("@/components/PhotoGalleryPreview").then(m => ({ default: m.PhotoGalleryPreview })));
const LeadersPreview = lazy(() => import("@/components/LeadersPreview").then(m => ({ default: m.LeadersPreview })));
const PrayerRequestForm = lazy(() => import("@/components/PrayerRequestForm").then(m => ({ default: m.PrayerRequestForm })));
const GivingSection = lazy(() => import("@/components/GivingSection").then(m => ({ default: m.GivingSection })));
const ConnectWithUs = lazy(() => import("@/components/ConnectWithUs").then(m => ({ default: m.ConnectWithUs })));

const SectionFallback = () => <div className="py-8" />;

const Index = () => (
  <div className="min-h-screen bg-background overflow-x-hidden">
    <SEOHead page="home" />
    <Header />
    <main className="[&>*+*]:border-t [&>*+*]:border-border/40">
      <EnhancedHeroSlider />
      <AnimatedSection animation="fade-up"><QuickActions /></AnimatedSection>
      <AnimatedSection animation="fade-up"><ServiceTimes /></AnimatedSection>
      <AnimatedSection animation="fade-up"><UpcomingEvents /></AnimatedSection>
      <AnimatedSection animation="fade-up"><ChurchAnnouncements /></AnimatedSection>
      <AnimatedSection animation="fade-up"><DailyVerse /></AnimatedSection>
      <Suspense fallback={<SectionFallback />}>
        <AnimatedSection animation="fade-up"><LatestSermons /></AnimatedSection>
        <AnimatedSection animation="fade-up"><PhotoGalleryPreview /></AnimatedSection>
        <AnimatedSection animation="fade-up"><MinistriesPreview /></AnimatedSection>
        <AnimatedSection animation="fade-up"><VisionMission /></AnimatedSection>
        <AnimatedSection animation="fade-up"><LeadersPreview /></AnimatedSection>
        <AnimatedSection animation="fade-up"><PrayerRequestForm /></AnimatedSection>
        <AnimatedSection animation="fade-up"><GivingSection /></AnimatedSection>
        <AnimatedSection animation="fade-up"><ConnectWithUs /></AnimatedSection>
      </Suspense>
    </main>
    <Footer />
    <Toaster />
  </div>
);

export default Index;
