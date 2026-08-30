import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useSiteSetting<T>(key: string, fallback: T): { data: T; loading: boolean; refetch: () => void } {
  const cacheKey = `mkucu_setting_${key}`;
  const readCached = (): T => {
    if (typeof window === "undefined") return fallback;
    try {
      const cached = localStorage.getItem(cacheKey);
      return cached ? JSON.parse(cached) as T : fallback;
    } catch {
      return fallback;
    }
  };

  const [data, setData] = useState<T>(readCached);
  const [loading, setLoading] = useState(true);

  const fetchSetting = async () => {
    const timeout = window.setTimeout(() => setLoading(false), 3500);
    try {
      const { data: row, error } = await supabase
        .from("site_settings" as any)
        .select("value")
        .eq("key", key)
        .maybeSingle();

      if (!error && row) {
        const value = (row as any).value as T;
        setData(value);
        localStorage.setItem(cacheKey, JSON.stringify(value));
      }
    } catch (e) {
      console.error(`Error fetching setting ${key}:`, e);
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  };

  useEffect(() => { fetchSetting(); }, [key]);

  return { data, loading, refetch: fetchSetting };
}

export async function updateSiteSetting(key: string, value: any) {
  const { error } = await (supabase as any)
    .from("site_settings")
    .update({ value })
    .eq("key", key);
  
  if (error) throw error;
}
