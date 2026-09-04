import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';

import { queryClient } from '@/api/query-client';
import { supabase } from '@/api/supabase';

interface SessionContextValue {
  session: Session | null;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextValue>({ session: null, isLoading: true });

export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    const applySession = (nextSession: Session | null) => {
      const nextUserId = nextSession?.user.id ?? null;
      if (userIdRef.current !== nextUserId) {
        // Every query in this app is scoped by Supabase RLS. Cached results
        // from the previous user must never be rendered for the next user.
        queryClient.clear();
        userIdRef.current = nextUserId;
      }
      setSession(nextSession);
    };

    supabase.auth
      .getSession()
      .then(({ data }) => applySession(data.session))
      .catch(() => applySession(null))
      .finally(() => setIsLoading(false));

    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      applySession(newSession);
      setIsLoading(false);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  return <SessionContext.Provider value={{ session, isLoading }}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}
