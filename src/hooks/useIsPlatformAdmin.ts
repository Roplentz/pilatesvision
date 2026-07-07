import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useIsPlatformAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsPlatformAdmin(false);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    supabase.rpc("is_platform_admin").then(({ data, error }) => {
      if (cancelled) return;
      setIsPlatformAdmin(!error && data === true);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  return { isPlatformAdmin, loading: authLoading || loading };
}