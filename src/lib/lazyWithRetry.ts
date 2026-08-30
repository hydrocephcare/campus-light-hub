import { ComponentType, lazy } from "react";

const RELOAD_KEY = "mkucu_chunk_reload";

/**
 * Wraps React.lazy with auto-retry & one-shot hard reload when a chunk
 * fails to load (typically after a new deployment invalidates old hashed files).
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (err: any) {
      const msg = String(err?.message || err);
      const isChunkError =
        /Failed to fetch dynamically imported module/i.test(msg) ||
        /Loading chunk [\d]+ failed/i.test(msg) ||
        /Importing a module script failed/i.test(msg);

      if (isChunkError) {
        // Retry once after a short delay
        try {
          await new Promise((r) => setTimeout(r, 400));
          return await factory();
        } catch {
          // Avoid infinite reload loops
          const alreadyReloaded = sessionStorage.getItem(RELOAD_KEY);
          if (!alreadyReloaded) {
            sessionStorage.setItem(RELOAD_KEY, "1");
            // Clear PWA caches and unregister SW so the next load is fresh
            try {
              if ("caches" in window) {
                const keys = await caches.keys();
                await Promise.all(keys.map((k) => caches.delete(k)));
              }
              if ("serviceWorker" in navigator) {
                const regs = await navigator.serviceWorker.getRegistrations();
                await Promise.all(regs.map((r) => r.unregister()));
              }
            } catch {
              /* ignore */
            }
            window.location.reload();
            // Return a placeholder while reloading
            return { default: (() => null) as unknown as T };
          }
        }
      }
      throw err;
    }
  });
}
