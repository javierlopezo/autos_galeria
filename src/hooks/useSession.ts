'use client';

import { useState, useEffect } from 'react';
import { SessionData } from '@/types';

export function useSession() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          setSession(data.session);
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, []);

  return { session, loading };
}
