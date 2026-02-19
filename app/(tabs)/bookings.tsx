import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { useBookings } from '@/hooks/useBookings';
import { colors, spacing, radius, typography, shadows } from '@/lib/theme';
import { Booking } from '@/lib/types';

export default function BookingsScreen() {
  const { bookings, loading, cancelBooking, refetch } = useBookings();
  const [refreshing, setRefreshing] = useState(false);

  const upcoming = bookings.filter((b) => b.status === 'confirmed');
  const past = bookings.filter((b) => b.status === 'cancelled' || b.status === 'completed');

  const handleCancel = (booking: Booking) => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: () => cancelBooking(booking.id),
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const statusColors: Record<string, string> = {
    confirmed: colors.success,
    cancelled: colors.error,
    completed: colors.primary,
  };

  const renderBooking = (booking: Booking) => {
    const cls = booking.class;
    const est = cls?.establishment;
    return (
      <View key={booking.id} style={styles.bookingCard}>
        <View style={styles.bookingRow}>
          {est?.image_url && (
            <Image source={{ uri: est.image_url }} style={styles.bookingImage} />
          )}
          <View style={styles.bookingInfo}>
            <Text style={styles.className} numberOfLines={1}>{cls?.name || 'Class'}</Text>
            <Text style={styles.estName} numberOfLines={1}>{est?.name || ''}</Text>
            {cls?.scheduled_at && (
              <Text style={styles.dateText}>
                {format(new Date(cls.scheduled_at), 'MMM d, yyyy · h:mm a')}
              </Text>
            )}
            <View style={styles.statusRow}>
              <View
                style={[styles.statusBadge, { backgroundColor: statusColors[booking.status] + '20' }]}
              >
                <Text style={[styles.statusText, { color: statusColors[booking.status] }]}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </Text>
              </View>
              {booking.status === 'confirmed' && (
                <TouchableOpacity onPress={() => handleCancel(booking)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <Text style={styles.title}>My Bookings</Text>

        {bookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No bookings yet</Text>
            <Text style={styles.emptySubtext}>Find a class and book your first session!</Text>
          </View>
        ) : (
          <>
            {upcoming.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Upcoming</Text>
                {upcoming.map(renderBooking)}
              </View>
            )}
            {past.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Past</Text>
                {past.map(renderBooking)}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  bookingCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  bookingRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  bookingImage: {
    width: 60,
    height: 60,
    borderRadius: radius.sm,
    backgroundColor: colors.border,
  },
  bookingInfo: {
    flex: 1,
  },
  className: {
    ...typography.label,
    fontSize: 15,
  },
  estName: {
    ...typography.caption,
    marginTop: 2,
  },
  dateText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cancelText: {
    fontSize: 13,
    color: colors.error,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: spacing.xxxl * 2,
  },
  emptyText: {
    ...typography.h3,
    color: colors.textTertiary,
  },
  emptySubtext: {
    ...typography.bodySmall,
    marginTop: spacing.sm,
  },
});
