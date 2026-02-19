import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ClassSession } from '@/lib/types';

export function useUpcomingClasses(limit: number = 5) {
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('classes')
        .select('*, establishment:establishments(*)')
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at')
        .limit(limit);
      setClasses(data ?? []);
      setLoading(false);
    };
    fetch();
  }, [limit]);

  return { classes, loading };
}
