import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useEstablishment } from '@/hooks/useEstablishments';
import { useClasses } from '@/hooks/useClasses';
import { useFavorites } from '@/hooks/useFavorites';
import { colors, spacing, radius, typography, shadows } from '@/lib/theme';

export default function EstablishmentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { establishment, loading } = useEstablishment(id!);
  const { classes, loading: classesLoading } = useClasses(id!);
  const { isFavorite, toggleFavorite } = useFavorites();
  const router = useRouter();

  if (loading || !establishment) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  const favorited = isFavorite(establishment.id);

  const typeLabels: Record<string, string> = {
    gym: 'Gym',
    yoga: 'Yoga Studio',
    pilates: 'Pilates Studio',
    restaurant: 'Restaurant',
    meditation: 'Meditation Center',
    crossfit: 'CrossFit Box',
  };

  const levelColors: Record<string, string> = {
    beginner: colors.success,
    intermediate: colors.warning,
    advanced: colors.error,
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: establishment.image_url || undefined }} style={styles.heroImage} />

      <SafeAreaView style={styles.topBar} edges={['top']}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => toggleFavorite(establishment.id)}
        >
          <Ionicons
            name={favorited ? 'heart' : 'heart-outline'}
            size={24}
            color={favorited ? colors.error : colors.text}
          />
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoSection}>
          <Text style={styles.type}>{typeLabels[establishment.type] || establishment.type}</Text>
          <Text style={styles.name}>{establishment.name}</Text>

          <View style={styles.metaRow}>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>
                {establishment.rating?.toFixed(1) || 'N/A'}
              </Text>
              <Text style={styles.reviewCount}>({establishment.review_count} reviews)</Text>
            </View>
            {establishment.price_range && (
              <Text style={styles.priceRange}>{establishment.price_range}</Text>
            )}
          </View>

          {establishment.address && (
            <View style={styles.addressRow}>
              <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.addressText}>{establishment.address}</Text>
            </View>
          )}

          {establishment.description && (
            <Text style={styles.description}>{establishment.description}</Text>
          )}

          {establishment.amenities && establishment.amenities.length > 0 && (
            <View style={styles.amenitiesWrap}>
              {establishment.amenities.map((amenity) => (
                <View key={amenity} style={styles.amenityTag}>
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.classesSection}>
          <Text style={styles.classesTitle}>Available Classes</Text>
          {classesLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
          ) : classes.length === 0 ? (
            <Text style={styles.noClasses}>No upcoming classes</Text>
          ) : (
            classes.map((cls) => (
              <TouchableOpacity
                key={cls.id}
                style={styles.classCard}
                onPress={() => router.push(`/booking/${cls.id}`)}
              >
                <View style={styles.classHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.className}>{cls.name}</Text>
                    {cls.instructor && (
                      <Text style={styles.instructor}>with {cls.instructor}</Text>
                    )}
                  </View>
                  <Text style={styles.classPrice}>
                    ${(cls.price / 100).toFixed(0)}
                  </Text>
                </View>
                <View style={styles.classMeta}>
                  <Text style={styles.classDate}>
                    {format(new Date(cls.scheduled_at), 'MMM d · h:mm a')}
                  </Text>
                  <Text style={styles.classDuration}>{cls.duration} min</Text>
                  {cls.level && (
                    <View
                      style={[
                        styles.levelBadge,
                        { backgroundColor: (levelColors[cls.level.toLowerCase()] || colors.primary) + '20' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.levelText,
                          { color: levelColors[cls.level.toLowerCase()] || colors.primary },
                        ]}
                      >
                        {cls.level}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
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
  heroImage: {
    width: '100%',
    height: 280,
    backgroundColor: colors.border,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  content: {
    flex: 1,
    marginTop: -spacing.xl,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: colors.background,
  },
  infoSection: {
    padding: spacing.xl,
  },
  type: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    ...typography.h1,
    marginTop: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  reviewCount: {
    ...typography.bodySmall,
  },
  priceRange: {
    ...typography.label,
    color: colors.primaryDark,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  addressText: {
    ...typography.bodySmall,
    flex: 1,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
    marginTop: spacing.lg,
  },
  amenitiesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  amenityTag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  amenityText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '500',
  },
  classesSection: {
    padding: spacing.xl,
    paddingTop: 0,
    paddingBottom: spacing.xxxl * 2,
  },
  classesTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  noClasses: {
    ...typography.body,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingVertical: spacing.xxl,
  },
  classCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  className: {
    ...typography.label,
    fontSize: 15,
  },
  instructor: {
    ...typography.caption,
    marginTop: 2,
  },
  classPrice: {
    ...typography.h3,
    color: colors.primary,
  },
  classMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  classDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  classDuration: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  levelBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
