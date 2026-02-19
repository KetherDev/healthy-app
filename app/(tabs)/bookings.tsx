import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { useBookings } from '@/hooks/useBookings';
import { Booking } from '@/lib/types';
import { colors, shadows } from '@/lib/theme';

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: keyof typeof Ionicons.glyphMap }> = {
  confirmed: { bg: '#F0FDF4', text: '#15803D', icon: 'checkmark-circle' },
  completed: { bg: '#EFF6FF', text: '#1D4ED8', icon: 'trophy' },
  cancelled: { bg: '#FEF2F2', text: '#DC2626', icon: 'close-circle' },
};

export default function BookingsScreen() {
  const { bookings, loading, cancelBooking } = useBookings();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const upcoming = bookings.filter((b) => b.status === 'confirmed');
  const past = bookings.filter((b) => b.status === 'completed' || b.status === 'cancelled');
  const list = activeTab === 'upcoming' ? upcoming : past;

  const renderBooking = (booking: Booking) => {
    const cls = booking.class;
    const status = STATUS_STYLES[booking.status] || STATUS_STYLES.confirmed;

    return (
      <View key={booking.id} style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
          <View style={styles.bookingIconBox}>
            <Ionicons name="time-outline" size={18} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bookingName} numberOfLines={1}>
              {cls?.name || 'Class'}
            </Text>
            <Text style={styles.bookingMeta}>
              {cls?.instructor || ''} &middot; {cls?.establishment?.name || ''}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Ionicons name={status.icon} size={12} color={status.text} />
            <Text style={[styles.statusText, { color: status.text }]}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.bookingDetails}>
          <View style={styles.detailChip}>
            <Ionicons name="calendar-outline" size={12} color={colors.textTertiary} />
            <Text style={styles.detailChipText}>
              {cls?.scheduled_at
                ? format(new Date(cls.scheduled_at), 'MMM d, yyyy')
                : format(new Date(booking.created_at), 'MMM d, yyyy')}
            </Text>
          </View>
          <View style={styles.detailChip}>
            <Ionicons name="time-outline" size={12} color={colors.textTertiary} />
            <Text style={styles.detailChipText}>
              {cls?.scheduled_at
                ? format(new Date(cls.scheduled_at), 'h:mm a')
                : ''}
            </Text>
          </View>
          <View style={styles.detailChip}>
            <Ionicons name="card-outline" size={12} color={colors.textTertiary} />
            <Text style={styles.detailChipText}>
              ${(booking.total_paid / 100).toFixed(2)}
            </Text>
          </View>
        </View>

        {booking.status === 'confirmed' && (
          <View style={styles.bookingActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => cancelBooking(booking.id)}
            >
              <Ionicons name="close-outline" size={14} color={colors.error} />
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rescheduleBtn}>
              <Ionicons name="swap-horizontal-outline" size={14} color={colors.text} />
              <Text style={styles.rescheduleBtnText}>Reschedule</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>

      <View style={styles.tabToggle}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
            Upcoming ({upcoming.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.tabActive]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>
            Past ({past.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : list.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons
              name={activeTab === 'upcoming' ? 'calendar-outline' : 'time-outline'}
              size={28}
              color={colors.primary}
            />
          </View>
          <Text style={styles.emptyTitle}>
            {activeTab === 'upcoming' ? 'No Upcoming Bookings' : 'No Past Bookings'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {activeTab === 'upcoming'
              ? 'Browse classes and book your first session!'
              : 'Your completed and cancelled bookings will appear here.'}
          </Text>
          {activeTab === 'upcoming' && (
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => router.push('/(tabs)/home')}
            >
              <Text style={styles.browseButtonText}>Browse Classes</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {list.map(renderBooking)}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  tabToggle: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#fff',
    ...shadows.sm,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94A3B8',
  },
  tabTextActive: {
    color: colors.text,
    fontWeight: '600',
  },
  listContent: {
    padding: 20,
    gap: 14,
    paddingBottom: 40,
  },
  bookingCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bookingIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  bookingMeta: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  bookingDetails: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  detailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  detailChipText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
  },
  cancelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  cancelBtnText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.error,
  },
  rescheduleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rescheduleBtnText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 19,
  },
  browseButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  browseButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
});
