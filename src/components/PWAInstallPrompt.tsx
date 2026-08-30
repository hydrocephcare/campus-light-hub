import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Check if dismissed recently
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      // Show again after 3 days
      if (Date.now() - dismissedAt < 3 * 24 * 60 * 60 * 1000) return;
    }

    // Detect iOS
    const ua = navigator.userAgent;
    const isiOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isiOS);

    if (isiOS) {
      // Show banner after a delay on iOS
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(timer);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowBanner(true), 2000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSGuide(false);
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  };

  if (isInstalled || !showBanner) return null;

  return (
    <>
      {/* Install Banner */}
      <div
        className={cn(
          "fixed inset-x-3 bottom-3 z-[100] pb-[env(safe-area-inset-bottom)] transition-transform duration-500 sm:inset-x-6 sm:bottom-6",
          showBanner ? "translate-y-0" : "translate-y-[120%]"
        )}
      >
        <div className="mx-auto w-full max-w-md sm:max-w-xl">
          <div className="relative bg-card border border-border rounded-lg shadow-2xl p-4 sm:p-5">
            <button
              onClick={handleDismiss}
              className="absolute right-3 top-3 p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground"
              aria-label="Dismiss install prompt"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="grid gap-4 pr-9 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:pr-0">
              <div className="flex items-center gap-3 sm:contents">
                <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
                  <img src="/pwa-icon-192.png" alt="MKU CU" className="w-11 h-11 rounded-md" />
                </div>
                <div className="min-w-0 sm:hidden">
                  <h3 className="font-serif font-bold text-foreground text-lg leading-tight">Install MKU CU App</h3>
                </div>
              </div>

              <div className="min-w-0">
                <h3 className="hidden sm:block font-serif font-bold text-foreground text-base leading-tight">Install MKU CU App</h3>
                <p className="text-sm text-muted-foreground leading-relaxed sm:mt-1">
                  Quick access to sermons, events, schedules, and offline viewing.
                </p>
              </div>

              <Button
                onClick={handleInstall}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              >
                <Download className="w-4 h-4" />
                Install
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* iOS Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-end justify-center p-4" onClick={handleDismiss}>
          <div
            className="bg-card border border-border rounded-2xl shadow-2xl p-6 w-full max-w-md mb-4 animate-in slide-in-from-bottom-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Smartphone className="w-6 h-6 text-primary" />
                <h3 className="font-serif font-bold text-foreground text-lg">Install MKU CU</h3>
              </div>
              <button onClick={handleDismiss} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">1</span>
                <p>Tap the <strong className="text-foreground">Share</strong> button <span className="inline-block">⬆️</span> at the bottom of Safari</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">2</span>
                <p>Scroll down and tap <strong className="text-foreground">"Add to Home Screen"</strong></p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">3</span>
                <p>Tap <strong className="text-foreground">"Add"</strong> to install the app</p>
              </div>
            </div>
            <Button onClick={handleDismiss} variant="outline" className="w-full mt-5">
              Got it!
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
