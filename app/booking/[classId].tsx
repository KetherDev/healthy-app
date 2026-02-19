import { useState, useMemo } from 'react';
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
import Ionicons from '@expo/vector-icons/Ionicons';
import { format, addDays } from 'date-fns';
import { useClassById } from '@/hooks/useClasses';
import { useBookings } from '@/hooks/useBookings';
import { colors, shadows } from '@/lib/theme';

const TIME_SLOTS = [
  { time: '7:00 AM', spots: 4 },
  { time: '9:30 AM', spots: 2 },
  { time: '11:00 AM', spots: 6 },
  { time: '1:00 PM', spots: 8 },
  { time: '3:30 PM', spots: 3 },
  { time: '5:30 PM', spots: 1 },
];

export default function BookingScreen() {
  const { classId } = useLocalSearchParams<{ classId: string }>();
  const { classSession, loading } = useClassById(classId!);
  const { createBooking } = useBookings();
  const router = useRouter();
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedDate, setSelectedDate] = useState(1);
  const [selectedTime, setSelectedTime] = useState<number | null>(0);

  const dates = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(today, i);
      return {
        day: format(d, 'EEE'),
        date: d.getDate(),
        month: format(d, 'MMM'),
        full: d,
      };
    });
  }, []);

  if (loading || !classSession) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  const est = classSession.establishment;
  const price = classSession.price / 100;
  const serviceFee = 2;
  const total = price + serviceFee;

  const handleConfirm = async () => {
    setBooking(true);
    const { error } = await createBooking(classSession.id, classSession.price);
    setBooking(false);
    if (!error) {
      setSuccess(true);
    }
  };

  if (success) {
    const selectedDateObj = dates[selectedDate];
    return (
      <SafeAreaView style={styles.successContainer}>
        <View style={styles.successContent}>
          <View style={styles.checkCircleOuter}>
            <View style={styles.checkCircleInner}>
              <Ionicons name="checkmark" size={28} color="#fff" strokeWidth={3} />
            </View>
          </View>

          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successSubtitle}>
            Your class has been booked successfully. See you on the mat!
          </Text>

          <View style={styles.bookingCard}>
            <View style={styles.bookingCardHeader}>
              <View>
                <Text style={styles.bookingCardName}>{classSession.name}</Text>
                <Text style={styles.bookingCardPlace}>{est?.name}</Text>
              </View>
              <View style={styles.confirmedBadge}>
                <Text style={styles.confirmedBadgeText}>Confirmed</Text>
              </View>
            </View>

            <View style={styles.bookingDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                <Text style={styles.detailText}>
                  {format(selectedDateObj.full, 'EEEE, MMM d, yyyy')}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={16} color={colors.primary} />
                <Text style={styles.detailText}>
                  {selectedTime !== null ? TIME_SLOTS[selectedTime].time : format(new Date(classSession.scheduled_at), 'h:mm a')} ({classSession.duration} min)
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={16} color={colors.primary} />
                <Text style={styles.detailText}>
                  {est?.address || '123 Wellness St, Downtown'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="card-outline" size={16} color={colors.primary} />
                <Text style={styles.detailText}>
                  ${total.toFixed(2)} — Visa ****4242
                </Text>
              </View>
            </View>

            <View style={styles.qrSection}>
              <View style={styles.qrPlaceholder}>
                <Ionicons name="qr-code-outline" size={48} color={colors.text} />
              </View>
              <Text style={styles.qrLabel}>Booking #HLT-{format(new Date(), 'yyyy-MMdd')}</Text>
            </View>
          </View>

          <View style={styles.successActions}>
            <TouchableOpacity style={styles.calendarButton}>
              <Ionicons name="calendar-outline" size={16} color={colors.text} />
              <Text style={styles.calendarButtonText}>Add to Calendar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.homeButton}
              onPress={() => {
                router.dismiss();
                setTimeout(() => router.push('/(tabs)/home'), 100);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="home-outline" size={16} color="#fff" />
              <Text style={styles.homeButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBack}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book a Class</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.classInfoCard}>
          <View style={styles.classInfoRow}>
            <View style={styles.classInfoIcon}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.classInfoName}>{classSession.name}</Text>
              <Text style={styles.classInfoMeta}>
                {classSession.instructor} &middot; {classSession.duration} min &middot; {est?.name}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>Select Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
            {dates.map((d, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.dateCard, selectedDate === i && styles.dateCardActive]}
                onPress={() => setSelectedDate(i)}
              >
                <Text style={[styles.dateDay, selectedDate === i && styles.dateTextActive]}>{d.day}</Text>
                <Text style={[styles.dateNumber, selectedDate === i && styles.dateTextActive]}>{d.date}</Text>
                <Text style={[styles.dateMonth, selectedDate === i && styles.dateTextActive]}>{d.month}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>Available Times</Text>
          <View style={styles.timeSlotsGrid}>
            {TIME_SLOTS.map((slot, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.timeSlot, selectedTime === i && styles.timeSlotActive]}
                onPress={() => setSelectedTime(i)}
              >
                <Text style={[styles.timeSlotText, selectedTime === i && styles.timeSlotTextActive]}>
                  {slot.time}
                </Text>
                <Text style={[
                  styles.timeSlotSpots,
                  selectedTime === i && styles.timeSlotSpotsActive,
                  slot.spots <= 2 && selectedTime !== i && { color: colors.error },
                ]}>
                  {slot.spots} spots left
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.paymentSummary}>
          <Text style={styles.paymentTitle}>Payment Summary</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>{classSession.name} (1x)</Text>
            <Text style={styles.paymentValue}>${price.toFixed(2)}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Service fee</Text>
            <Text style={styles.paymentValue}>${serviceFee.toFixed(2)}</Text>
          </View>
          <View style={styles.paymentTotal}>
            <Text style={styles.paymentTotalLabel}>Total</Text>
            <Text style={styles.paymentTotalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.paymentMethod}>
          <Text style={styles.paymentTitle}>Payment Method</Text>
          <View style={styles.paymentMethodCard}>
            <View style={styles.paymentMethodIcon}>
              <Ionicons name="card-outline" size={16} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.paymentMethodName}>Visa ending in 4242</Text>
              <Text style={styles.paymentMethodExpiry}>Expires 12/27</Text>
            </View>
            <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.confirmButton, booking && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
          disabled={booking}
          activeOpacity={0.8}
        >
          {booking ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm & Pay — ${total.toFixed(2)}</Text>
          )}
        </TouchableOpacity>
      </View>
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
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerBack: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  classInfoCard: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  classInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  classInfoIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  classInfoName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  classInfoMeta: {
    fontSize: 12,
    color: '#15803D',
    marginTop: 2,
  },
  sectionBlock: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  dateRow: {
    gap: 8,
  },
  dateCard: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 52,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  dateCardActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dateDay: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 2,
  },
  dateNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  dateMonth: {
    fontSize: 9,
    color: '#64748B',
  },
  dateTextActive: {
    color: '#fff',
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeSlot: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  timeSlotActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeSlotText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  timeSlotTextActive: {
    color: '#fff',
  },
  timeSlotSpots: {
    fontSize: 10,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 2,
  },
  timeSlotSpotsActive: {
    color: 'rgba(255,255,255,0.7)',
  },
  paymentSummary: {
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  paymentTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  paymentValue: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
  },
  paymentTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    marginTop: 4,
  },
  paymentTotalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  paymentTotalValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  paymentMethod: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    backgroundColor: colors.primaryLight,
  },
  paymentMethodIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.text,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentMethodName: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
  },
  paymentMethodExpiry: {
    fontSize: 11,
    color: '#94A3B8',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 28,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  confirmButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.7,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  successContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  checkCircleOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkCircleInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 240,
  },
  bookingCard: {
    width: '100%',
    marginTop: 32,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  bookingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  bookingCardName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  bookingCardPlace: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  confirmedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
  },
  confirmedBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#15803D',
  },
  bookingDetails: {
    gap: 12,
    marginTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontSize: 13,
    color: '#475569',
  },
  qrSection: {
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  qrPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 8,
  },
  successActions: {
    width: '100%',
    marginTop: 24,
    gap: 10,
  },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  calendarButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  homeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
});
