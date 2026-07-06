import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export interface UseProfileResult {
  profile: ProfileRow | null;
  clinicId: string | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Lê o perfil do usuário logado em `profiles`.
 * Centraliza a obtenção do `clinic_id` usado pelos demais hooks.
 */
export function useProfile(): UseProfileResult {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setError(new Error(error.message));
        else setProfile((data as ProfileRow | null) ?? null);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  return {
    profile,
    clinicId: (profile?.clinic_id as string | null | undefined) ?? null,
    loading: authLoading || loading,
    error,
  };
}
