import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Favorite } from '@/lib/types';

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', user.id);
    setFavorites(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const isFavorite = (establishmentId: string) => {
    return favorites.some((f) => f.establishment_id === establishmentId);
  };

  const toggleFavorite = async (establishmentId: string) => {
    if (!user) return;
    const existing = favorites.find((f) => f.establishment_id === establishmentId);
    if (existing) {
      await supabase.from('favorites').delete().eq('id', existing.id);
      setFavorites((prev) => prev.filter((f) => f.id !== existing.id));
    } else {
      const { data } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, establishment_id: establishmentId })
        .select()
        .single();
      if (data) {
        setFavorites((prev) => [...prev, data]);
      }
    }
  };

  return { favorites, loading, isFavorite, toggleFavorite };
}
