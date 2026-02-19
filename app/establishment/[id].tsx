import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { format, formatDistanceToNow } from 'date-fns';
import { useEstablishment } from '@/hooks/useEstablishments';
import { useClasses } from '@/hooks/useClasses';
import { useFavorites } from '@/hooks/useFavorites';
import { useReviews, useHasBooked } from '@/hooks/useReviews';
import { colors, spacing, radius, shadows } from '@/lib/theme';

const AMENITY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'Free WiFi': 'wifi-outline',
  'WiFi': 'wifi-outline',
  'Parking': 'car-outline',
  'Showers': 'water-outline',
  'Shower Facilities': 'water-outline',
  'Lockers': 'people-outline',
  'Locker Room': 'people-outline',
  'Sauna': 'flame-outline',
  'Towel Service': 'shirt-outline',
  'Mat Rental': 'fitness-outline',
  default: 'checkmark-circle-outline',
};

export default function EstablishmentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { establishment, loading } = useEstablishment(id!);
  const { classes, loading: classesLoading } = useClasses(id!);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { reviews, loading: reviewsLoading, userReview, submitReview, deleteReview } = useReviews(id!);
  const { hasBooked } = useHasBooked(id!);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'classes' | 'info' | 'reviews'>('classes');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading || !establishment) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const favorited = isFavorite(establishment.id);
  const lowestPrice = classes.length > 0 ? Math.min(...classes.map(c => c.price)) / 100 : null;

  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) {
      const msg = 'Please write a comment for your review.';
      if (Platform.OS === 'web') { window.alert(msg); } else { Alert.alert('Missing Comment', msg); }
      return;
    }
    setSubmitting(true);
    try {
      await submitReview(reviewRating, reviewComment.trim());
      setShowReviewForm(false);
      setReviewComment('');
      setReviewRating(5);
    } catch (err: any) {
      const msg = err.message || 'Failed to submit review';
      if (Platform.OS === 'web') { window.alert(msg); } else { Alert.alert('Error', msg); }
    }
    setSubmitting(false);
  };

  const handleDeleteReview = async () => {
    const doDelete = async () => {
      try {
        await deleteReview();
      } catch (err: any) {
        const msg = err.message || 'Failed to delete';
        if (Platform.OS === 'web') { window.alert(msg); } else { Alert.alert('Error', msg); }
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Delete your review?')) doDelete();
    } else {
      Alert.alert('Delete Review', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const openEditReview = () => {
    if (userReview) {
      setReviewRating(userReview.rating);
      setReviewComment(userReview.comment || '');
    }
    setShowReviewForm(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.heroWrap}>
        <Image source={{ uri: establishment.image_url || undefined }} style={styles.heroImage} />
        <View style={styles.heroGradient} />

        <SafeAreaView style={styles.topBar} edges={['top']}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.topBarRight}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="share-outline" size={16} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => toggleFavorite(establishment.id)}
            >
              <Ionicons
                name={favorited ? 'heart' : 'heart-outline'}
                size={16}
                color={favorited ? colors.error : colors.text}
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <View style={styles.imageDots}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.dot, i === 0 ? styles.dotActive : styles.dotInactive]} />
          ))}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{establishment.name}</Text>
              <Text style={styles.typeLabel}>
                {establishment.type.charAt(0).toUpperCase() + establishment.type.slice(1)} &middot; Wellness
              </Text>
            </View>
            <View style={styles.openBadge}>
              <Text style={styles.openBadgeText}>Open</Text>
            </View>
          </View>

          <View style={styles.ratingLocationRow}>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Ionicons
                  key={s}
                  name="star"
                  size={16}
                  color={s <= Math.floor(establishment.rating || 0) ? colors.warning : colors.border}
                />
              ))}
              <Text style={styles.ratingNumber}>{establishment.rating?.toFixed(1)}</Text>
              <Text style={styles.reviewCountText}>({establishment.review_count})</Text>
            </View>
            {establishment.city && (
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color={colors.textTertiary} />
                <Text style={styles.locationText}>{establishment.city}</Text>
              </View>
            )}
          </View>

          <View style={styles.quickInfoRow}>
            {[
              { icon: 'time-outline' as const, label: '6AM - 10PM' },
              { icon: 'people-outline' as const, label: `${establishment.review_count} members` },
              { icon: 'location-outline' as const, label: establishment.city || 'Downtown' },
            ].map((item, i) => (
              <View key={i} style={styles.quickInfoItem}>
                <Ionicons name={item.icon} size={14} color={colors.primary} />
                <Text style={styles.quickInfoText}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.tabBar}>
          {(['classes', 'info', 'reviews'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tabContent}>
          {activeTab === 'classes' && (
            <View style={styles.classesTab}>
              {classesLoading ? (
                <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
              ) : classes.length === 0 ? (
                <Text style={styles.noClasses}>No upcoming classes</Text>
              ) : (
                classes.map((cls) => (
                  <TouchableOpacity
                    key={cls.id}
                    style={styles.classCard}
                    onPress={() => router.push(`/booking/${cls.id}`)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.classIconBox}>
                      <Ionicons name="time-outline" size={16} color={colors.primary} />
                    </View>
                    <View style={styles.classInfo}>
                      <Text style={styles.className}>{cls.name}</Text>
                      <Text style={styles.classMeta}>
                        {cls.instructor} &middot; {format(new Date(cls.scheduled_at), 'h:mm a')} &middot; {cls.duration} min
                      </Text>
                    </View>
                    <View style={styles.classRight}>
                      <Text style={styles.classPrice}>${(cls.price / 100).toFixed(0)}</Text>
                      {cls.max_spots && (
                        <Text style={[styles.classSpots, cls.max_spots <= 5 && { color: colors.error }]}>
                          {cls.max_spots} spots
                        </Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          {activeTab === 'info' && (
            <View style={styles.infoTab}>
              <Text style={styles.aboutTitle}>About</Text>
              <Text style={styles.aboutText}>
                {establishment.description || 'A wonderful wellness establishment offering a variety of classes and services designed to strengthen body and calm mind.'}
              </Text>

              {establishment.amenities && establishment.amenities.length > 0 && (
                <>
                  <Text style={[styles.aboutTitle, { marginTop: 20 }]}>Amenities</Text>
                  <View style={styles.amenitiesGrid}>
                    {establishment.amenities.map((a) => (
                      <View key={a} style={styles.amenityChip}>
                        <Ionicons
                          name={AMENITY_ICONS[a] || AMENITY_ICONS.default}
                          size={14}
                          color={colors.primary}
                        />
                        <Text style={styles.amenityText}>{a}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>
          )}

          {activeTab === 'reviews' && (
            <View style={styles.reviewsTab}>
              {hasBooked && !userReview && !showReviewForm && (
                <TouchableOpacity style={styles.writeReviewBtn} onPress={() => setShowReviewForm(true)}>
                  <Ionicons name="create-outline" size={16} color="#fff" />
                  <Text style={styles.writeReviewBtnText}>Write a Review</Text>
                </TouchableOpacity>
              )}

              {userReview && !showReviewForm && (
                <View style={[styles.reviewCard, styles.userReviewCard]}>
                  <View style={styles.reviewHeader}>
                    <View style={[styles.reviewAvatar, { backgroundColor: colors.primary }]}>
                      <Text style={[styles.reviewAvatarText, { color: '#fff' }]}>
                        {(userReview.profiles as any)?.full_name?.charAt(0) || 'Y'}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reviewName}>
                        {(userReview.profiles as any)?.full_name || 'You'}
                        <Text style={styles.yourReviewBadge}> (Your review)</Text>
                      </Text>
                      <View style={styles.reviewStarsRow}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Ionicons key={s} name="star" size={12} color={s <= userReview.rating ? colors.warning : colors.border} />
                        ))}
                        <Text style={styles.reviewTime}>
                          {formatDistanceToNow(new Date(userReview.created_at), { addSuffix: true })}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {userReview.comment && <Text style={styles.reviewText}>{userReview.comment}</Text>}
                  <View style={styles.reviewActions}>
                    <TouchableOpacity style={styles.reviewActionBtn} onPress={openEditReview}>
                      <Ionicons name="pencil-outline" size={14} color={colors.primary} />
                      <Text style={styles.reviewActionText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.reviewActionBtn} onPress={handleDeleteReview}>
                      <Ionicons name="trash-outline" size={14} color={colors.error} />
                      <Text style={[styles.reviewActionText, { color: colors.error }]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {showReviewForm && (
                <View style={styles.reviewFormCard}>
                  <Text style={styles.reviewFormTitle}>
                    {userReview ? 'Edit Your Review' : 'Write a Review'}
                  </Text>
                  <View style={styles.starPicker}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <TouchableOpacity key={s} onPress={() => setReviewRating(s)}>
                        <Ionicons
                          name="star"
                          size={28}
                          color={s <= reviewRating ? colors.warning : colors.border}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TextInput
                    style={styles.reviewInput}
                    placeholder="Share your experience..."
                    placeholderTextColor={colors.textMuted}
                    value={reviewComment}
                    onChangeText={setReviewComment}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                  <View style={styles.reviewFormActions}>
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => { setShowReviewForm(false); setReviewComment(''); setReviewRating(5); }}
                    >
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                      onPress={handleSubmitReview}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.submitBtnText}>{userReview ? 'Update' : 'Submit'}</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {reviewsLoading ? (
                <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
              ) : reviews.filter(r => r.id !== userReview?.id).length === 0 && !userReview ? (
                <Text style={styles.noReviewsText}>No reviews yet. {hasBooked ? 'Be the first to leave one!' : 'Book a class to leave a review.'}</Text>
              ) : (
                reviews.filter(r => r.id !== userReview?.id).map((review, i, arr) => (
                  <View key={review.id} style={[styles.reviewCard, i < arr.length - 1 && styles.reviewBorder]}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewAvatar}>
                        <Text style={styles.reviewAvatarText}>
                          {(review.profiles as any)?.full_name?.charAt(0) || '?'}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reviewName}>
                          {(review.profiles as any)?.full_name || 'Anonymous'}
                        </Text>
                        <View style={styles.reviewStarsRow}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Ionicons key={s} name="star" size={12} color={s <= review.rating ? colors.warning : colors.border} />
                          ))}
                          <Text style={styles.reviewTime}>
                            {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                          </Text>
                        </View>
                      </View>
                    </View>
                    {review.comment && <Text style={styles.reviewText}>{review.comment}</Text>}
                  </View>
                ))
              )}
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomCTA}>
        <View>
          <Text style={styles.ctaLabel}>Starting from</Text>
          <Text style={styles.ctaPrice}>
            ${lowestPrice?.toFixed(0) || '15'}
            <Text style={styles.ctaPriceSuffix}>/class</Text>
          </Text>
        </View>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => {
            if (classes.length > 0) {
              router.push(`/booking/${classes[0].id}`);
            }
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaButtonText}>Book a Class</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  heroWrap: {
    height: 220,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.border,
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  topBarRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageDots: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: '#fff',
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  content: {
    flex: 1,
  },
  infoSection: {
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  typeLabel: {
    fontSize: 13,
    color: colors.textTertiary,
    marginTop: 2,
  },
  openBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
  },
  openBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.successDark,
  },
  ratingLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 12,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 4,
  },
  reviewCountText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  quickInfoRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  quickInfoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
  },
  quickInfoText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingHorizontal: 20,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  tabTextActive: {
    fontWeight: '600',
    color: colors.primary,
  },
  tabContent: {
    padding: 20,
  },
  classesTab: {
    gap: 10,
  },
  classCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  classIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  classInfo: {
    flex: 1,
    minWidth: 0,
  },
  className: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  classMeta: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 2,
  },
  classRight: {
    alignItems: 'flex-end',
  },
  classPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  classSpots: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.warning,
    marginTop: 2,
  },
  noClasses: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingVertical: 24,
  },
  infoTab: {},
  aboutTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.surfaceSecondary,
  },
  amenityText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  reviewsTab: {
    gap: 0,
  },
  writeReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.primary,
    marginBottom: 20,
  },
  writeReviewBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  userReviewCard: {
    borderWidth: 1,
    borderColor: colors.primary + '30',
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  yourReviewBadge: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.primary,
  },
  reviewActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  reviewActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
  },
  reviewFormCard: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    backgroundColor: colors.surfaceSecondary,
  },
  reviewFormTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  starPicker: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    color: colors.text,
    backgroundColor: '#fff',
    minHeight: 80,
    marginBottom: 12,
  },
  reviewFormActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  submitBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  noReviewsText: {
    fontSize: 13,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingVertical: 24,
  },
  reviewCard: {
    paddingBottom: 16,
    marginBottom: 16,
  },
  reviewBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewAvatarText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  reviewName: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
  },
  reviewStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  reviewTime: {
    fontSize: 10,
    color: colors.textTertiary,
    marginLeft: 4,
  },
  reviewText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 19,
    marginTop: 8,
  },
  bottomCTA: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  ctaLabel: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  ctaPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  ctaPriceSuffix: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textTertiary,
  },
  ctaButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  ctaButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
