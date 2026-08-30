import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const nativeFetch = window.fetch.bind(window);
window.fetch = (input, init = {}) => {
  const url = typeof input === "string" ? input : input instanceof Request ? input.url : String(input);
  // Never abort auth calls — a cancelled token refresh silently destroys the session.
  const shouldTimeout = url.includes(".supabase.co/rest/v1/") && !init.signal;
  if (!shouldTimeout) return nativeFetch(input, init);

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);

  return nativeFetch(input, { ...init, signal: controller.signal }).finally(() =>
    window.clearTimeout(timeout)
  );
};

if (sessionStorage.redirect) {
  const redirect = sessionStorage.redirect;
  delete sessionStorage.redirect;
  history.replaceState(null, "", redirect);
}

// Clear chunk-reload flag on a successful load
window.addEventListener("load", () => {
  sessionStorage.removeItem("mkucu_chunk_reload");
});

// Global safety net: if a dynamic chunk fails (e.g. after a fresh deploy
// invalidated old hashed asset filenames), nuke caches and reload once.
const handleChunkError = async (msg: string) => {
  const isChunkError =
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /Loading chunk [\d]+ failed/i.test(msg) ||
    /Importing a module script failed/i.test(msg);
  if (!isChunkError) return;
  if (sessionStorage.getItem("mkucu_chunk_reload")) return;
  sessionStorage.setItem("mkucu_chunk_reload", "1");
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
};

window.addEventListener("error", (e) => {
  handleChunkError(String(e?.message || ""));
});
window.addEventListener("unhandledrejection", (e) => {
  handleChunkError(String((e as any)?.reason?.message || (e as any)?.reason || ""));
});

createRoot(document.getElementById("root")!).render(<App />);
