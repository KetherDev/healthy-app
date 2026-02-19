import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Establishment, EstablishmentType } from '@/lib/types';

export function useEstablishments(typeFilter?: EstablishmentType | null) {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      let query = supabase.from('establishments').select('*').order('name');
      if (typeFilter) {
        query = query.eq('type', typeFilter);
      }
      const { data } = await query;
      setEstablishments(data ?? []);
      setLoading(false);
    };
    fetch();
  }, [typeFilter]);

  return { establishments, loading };
}

export function useFeaturedEstablishments() {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('establishments')
        .select('*')
        .eq('featured', true)
        .order('name');
      setEstablishments(data ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  return { establishments, loading };
}

export function useEstablishment(id: string) {
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('establishments')
        .select('*')
        .eq('id', id)
        .single();
      setEstablishment(data);
      setLoading(false);
    };
    fetch();
  }, [id]);

  return { establishment, loading };
}
