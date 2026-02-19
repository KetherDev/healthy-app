import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Booking } from '@/lib/types';

export function useBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('bookings')
      .select('*, class:classes(*, establishment:establishments(*))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setBookings(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const createBooking = async (classId: string, totalPaid: number) => {
    if (!user) return { error: 'Not authenticated' };
    const { data, error } = await supabase
      .from('bookings')
      .insert({ user_id: user.id, class_id: classId, status: 'confirmed', total_paid: totalPaid })
      .select('*, class:classes(*, establishment:establishments(*))')
      .single();
    if (!error && data) {
      setBookings((prev) => [data, ...prev]);
    }
    return { data, error };
  };

  const cancelBooking = async (bookingId: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);
    if (!error) {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' as const } : b))
      );
    }
    return { error };
  };

  return { bookings, loading, createBooking, cancelBooking, refetch: fetchBookings };
}
