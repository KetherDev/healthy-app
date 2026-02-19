import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ClassSession } from '@/lib/types';

export function useClasses(establishmentId: string) {
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!establishmentId) return;
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('classes')
        .select('*, establishment:establishments(*)')
        .eq('establishment_id', establishmentId)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at');
      setClasses(data ?? []);
      setLoading(false);
    };
    fetch();
  }, [establishmentId]);

  return { classes, loading };
}

export function useClassById(classId: string) {
  const [classSession, setClassSession] = useState<ClassSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!classId) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('classes')
        .select('*, establishment:establishments(*)')
        .eq('id', classId)
        .single();
      setClassSession(data);
      setLoading(false);
    };
    fetch();
  }, [classId]);

  return { classSession, loading };
}
