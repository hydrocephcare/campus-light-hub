import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import { lazyWithRetry } from "@/lib/lazyWithRetry";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/hooks/useAuth";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";

// Lazy load pages for better performance (with chunk-error auto-recovery)
const Index = lazyWithRetry(() => import("./pages/Index"));
const About = lazyWithRetry(() => import("./pages/About"));
const Events = lazyWithRetry(() => import("./pages/Events"));
const EventDetail = lazyWithRetry(() => import("./pages/EventDetail"));
const Media = lazyWithRetry(() => import("./pages/Media"));
const Blog = lazyWithRetry(() => import("./pages/Blog"));
const BlogPost = lazyWithRetry(() => import("./pages/BlogPost"));
const Notifications = lazyWithRetry(() => import("./pages/Notifications"));
const Contact = lazyWithRetry(() => import("./pages/Contact"));
const Volunteer = lazyWithRetry(() => import("./pages/Volunteer"));
const Gallery = lazyWithRetry(() => import("./pages/Gallery"));
const Photos = lazyWithRetry(() => import("./pages/Gallery"));
const Admin = lazyWithRetry(() => import("./pages/Admin"));
const Schedule = lazyWithRetry(() => import("./pages/Schedule"));
const Elections = lazyWithRetry(() => import("./pages/Elections"));
const Missions = lazyWithRetry(() => import("./pages/Missions"));
const MissionDetail = lazyWithRetry(() => import("./pages/MissionDetail"));
const Ministries = lazyWithRetry(() => import("./pages/Ministries"));
const Visitors = lazyWithRetry(() => import("./pages/Visitors"));
const Leadership = lazyWithRetry(() => import("./pages/Leadership"));
const Login = lazyWithRetry(() => import("./pages/Login"));
const Signup = lazyWithRetry(() => import("./pages/Signup"));
const NotFound = lazyWithRetry(() => import("./pages/NotFound"));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-pulse text-navy-light text-xl font-serif">Loading...</div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Warm common public routes after the first render without blocking the homepage.
if (typeof window !== "undefined") {
  setTimeout(() => {
    const idle = (cb: () => void) =>
      "requestIdleCallback" in window
        ? (window as any).requestIdleCallback(cb, { timeout: 6000 })
        : setTimeout(cb, 2500);
    idle(() => {
      import("./pages/Events");
      import("./pages/Gallery");
      import("./pages/Media");
    });
  }, 3500);
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <PWAInstallPrompt />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/leadership" element={<Leadership />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/media" element={<Media />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/volunteer" element={<Volunteer />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/photos" element={<Photos />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin-login" element={<Admin />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/elections" element={<Elections />} />
              <Route path="/missions" element={<Missions />} />
              <Route path="/missions/:slug" element={<MissionDetail />} />
              <Route path="/ministries" element={<Ministries />} />
              <Route path="/visitors" element={<Visitors />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
