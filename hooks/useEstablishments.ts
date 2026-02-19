import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Establishment, EstablishmentType } from '@/lib/types';

export function useEstablishments(typeFilter?: EstablishmentType | null) {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('establishments').select('*').order('name');
    if (typeFilter) {
      query = query.eq('type', typeFilter);
    }
    const { data } = await query;
    setEstablishments(data ?? []);
    setLoading(false);
  }, [typeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { establishments, loading, refetch: fetchData };
}

export function useFeaturedEstablishments() {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('establishments')
      .select('*')
      .eq('featured', true)
      .order('name');
    setEstablishments(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { establishments, loading, refetch: fetchData };
}

export function useEstablishment(id: string) {
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const { data } = await supabase
      .from('establishments')
      .select('*')
      .eq('id', id)
      .single();
    setEstablishment(data);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { establishment, loading, refetch: fetchData };
}
