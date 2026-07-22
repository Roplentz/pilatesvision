import { useAuthContext, type AuthContextValue } from "@/lib/auth-context";

export type UseAuthResult = AuthContextValue;

/**
 * Hook de autenticação. Consome o `AuthProvider` único montado em `__root.tsx`,
 * evitando múltiplos `onAuthStateChange` concorrentes.
 */
export function useAuth(): UseAuthResult {
  return useAuthContext();
}
