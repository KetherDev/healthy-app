import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Review } from '@/lib/types';

export function useReviews(establishmentId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [userReview, setUserReview] = useState<Review | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles:user_id(full_name, avatar_url)')
      .eq('establishment_id', establishmentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch reviews:', error.message);
      setLoading(false);
      return;
    }

    const reviewsList = (data as Review[]) ?? [];
    setReviews(reviewsList);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Failed to get user:', authError.message);
    } else if (user) {
      const mine = reviewsList.find((r) => r.user_id === user.id);
      setUserReview(mine || null);
    }

    setLoading(false);
  }, [establishmentId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const submitReview = async (rating: number, comment: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not logged in');

    if (userReview) {
      const { error } = await supabase
        .from('reviews')
        .update({ rating, comment, updated_at: new Date().toISOString() })
        .eq('id', userReview.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          establishment_id: establishmentId,
          rating,
          comment,
        });
      if (error) throw error;
    }

    await fetchReviews();
  };

  const deleteReview = async () => {
    if (!userReview) return;
    const { error } = await supabase.from('reviews').delete().eq('id', userReview.id);
    if (error) throw error;
    await fetchReviews();
  };

  return { reviews, loading, userReview, submitReview, deleteReview, refresh: fetchReviews };
}

export function useHasBooked(establishmentId: string) {
  const [hasBooked, setHasBooked] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setChecking(false);
        return;
      }

      const { data, error } = await supabase
        .from('bookings')
        .select('id, class:class_id(establishment_id)')
        .eq('user_id', user.id)
        .in('status', ['confirmed', 'completed']);

      if (error) {
        console.error('Failed to check bookings:', error.message);
        setChecking(false);
        return;
      }

      const booked = (data || []).some((b: any) => b.class?.establishment_id === establishmentId);
      setHasBooked(booked);
      setChecking(false);
    };
    check();
  }, [establishmentId]);

  return { hasBooked, checking };
}
