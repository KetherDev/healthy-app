import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useClassById } from '@/hooks/useClasses';
import { useBookings } from '@/hooks/useBookings';
import { colors, spacing, radius, typography, shadows } from '@/lib/theme';

export default function BookingScreen() {
  const { classId } = useLocalSearchParams<{ classId: string }>();
  const { classSession, loading } = useClassById(classId!);
  const { createBooking } = useBookings();
  const router = useRouter();
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(false);

  if (loading || !classSession) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  const est = classSession.establishment;
  const price = classSession.price / 100;

  const handleConfirm = async () => {
    setBooking(true);
    const { error } = await createBooking(classSession.id, classSession.price);
    setBooking(false);
    if (!error) {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.successContainer}>
        <View style={styles.successContent}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={48} color="#fff" />
          </View>
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successSubtitle}>
            {classSession.name} with {classSession.instructor}
          </Text>
          <Text style={styles.successDate}>
            {format(new Date(classSession.scheduled_at), 'EEEE, MMMM d · h:mm a')}
          </Text>
          <Text style={styles.successLocation}>{est?.name}</Text>

          <TouchableOpacity
            style={styles.viewBookingsButton}
            onPress={() => {
              router.dismiss();
              setTimeout(() => router.push('/(tabs)/bookings'), 100);
            }}
          >
            <Text style={styles.viewBookingsText}>View My Bookings</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Booking</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.className}>{classSession.name}</Text>
          {classSession.instructor && (
            <Text style={styles.instructor}>with {classSession.instructor}</Text>
          )}
          {classSession.description && (
            <Text style={styles.description}>{classSession.description}</Text>
          )}
        </View>

        <View style={styles.detailsCard}>
          <DetailRow icon="location-outline" label="Location" value={est?.name || ''} />
          <DetailRow
            icon="calendar-outline"
            label="Date"
            value={format(new Date(classSession.scheduled_at), 'EEEE, MMMM d, yyyy')}
          />
          <DetailRow
            icon="time-outline"
            label="Time"
            value={format(new Date(classSession.scheduled_at), 'h:mm a')}
          />
          <DetailRow
            icon="hourglass-outline"
            label="Duration"
            value={`${classSession.duration} minutes`}
          />
          {classSession.level && (
            <DetailRow icon="fitness-outline" label="Level" value={classSession.level} />
          )}
        </View>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>${price.toFixed(2)}</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.confirmButton, booking && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
          disabled={booking}
        >
          {booking ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm Booking - ${price.toFixed(2)}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={detailStyles.row}>
      <View style={detailStyles.iconContainer}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={detailStyles.textContainer}>
        <Text style={detailStyles.label}>{label}</Text>
        <Text style={detailStyles.value}>{value}</Text>
      </View>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  label: {
    ...typography.caption,
  },
  value: {
    ...typography.body,
    fontSize: 15,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    ...typography.h3,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  className: {
    ...typography.h2,
  },
  instructor: {
    ...typography.bodySmall,
    marginTop: spacing.xs,
    color: colors.primary,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
    lineHeight: 22,
  },
  detailsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  totalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadows.sm,
  },
  totalLabel: {
    ...typography.h3,
  },
  totalPrice: {
    ...typography.h2,
    color: colors.primary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
    paddingBottom: spacing.xxxl + 10,
    backgroundColor: colors.surface,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.7,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContent: {
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  successTitle: {
    ...typography.h1,
    marginBottom: spacing.sm,
  },
  successSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  successDate: {
    ...typography.label,
    marginTop: spacing.lg,
  },
  successLocation: {
    ...typography.bodySmall,
    marginTop: spacing.xs,
  },
  viewBookingsButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxxl,
    marginTop: spacing.xxxl,
  },
  viewBookingsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
