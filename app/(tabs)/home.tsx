import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { useEstablishments, useFeaturedEstablishments } from '@/hooks/useEstablishments';
import { colors, spacing, radius, typography, shadows } from '@/lib/theme';
import { Ionicons } from '@expo/vector-icons';
import { EstablishmentType } from '@/lib/types';

const categories: { label: string; emoji: string; type: EstablishmentType }[] = [
  { label: 'Yoga', emoji: '🧘', type: 'yoga' },
  { label: 'Gym', emoji: '💪', type: 'gym' },
  { label: 'Pilates', emoji: '🤸', type: 'pilates' },
  { label: 'Food', emoji: '🥗', type: 'restaurant' },
  { label: 'Meditate', emoji: '🧠', type: 'meditation' },
  { label: 'CrossFit', emoji: '🏋️', type: 'crossfit' },
];

export default function HomeScreen() {
  const { profile } = useAuth();
  const { establishments: featured, loading: featuredLoading } = useFeaturedEstablishments();
  const { establishments: nearby, loading: nearbyLoading } = useEstablishments();
  const router = useRouter();

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {firstName}</Text>
          <Text style={styles.heading}>Find your wellness</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.type}
              style={styles.categoryPill}
              onPress={() => router.push({ pathname: '/(tabs)/search', params: { type: cat.type } })}
            >
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text style={styles.categoryLabel}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured</Text>
          {featuredLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.xl }} />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredContainer}
            >
              {featured.map((est) => (
                <TouchableOpacity
                  key={est.id}
                  style={styles.featuredCard}
                  onPress={() => router.push(`/establishment/${est.id}`)}
                >
                  <Image source={{ uri: est.image_url || undefined }} style={styles.featuredImage} />
                  <View style={styles.featuredOverlay}>
                    <Text style={styles.featuredName}>{est.name}</Text>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text style={styles.featuredRating}>
                        {est.rating?.toFixed(1) || 'N/A'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nearby</Text>
          {nearbyLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.xl }} />
          ) : (
            nearby.map((est) => (
              <TouchableOpacity
                key={est.id}
                style={styles.nearbyCard}
                onPress={() => router.push(`/establishment/${est.id}`)}
              >
                <Image source={{ uri: est.image_url || undefined }} style={styles.nearbyImage} />
                <View style={styles.nearbyInfo}>
                  <Text style={styles.nearbyName} numberOfLines={1}>{est.name}</Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={styles.nearbyRating}>{est.rating?.toFixed(1) || 'N/A'}</Text>
                    <Text style={styles.nearbyReviews}>({est.review_count})</Text>
                  </View>
                  <Text style={styles.nearbyAddress} numberOfLines={1}>{est.address}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  greeting: {
    ...typography.body,
    color: colors.textSecondary,
  },
  heading: {
    ...typography.h1,
    marginTop: spacing.xs,
  },
  categoriesContainer: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    gap: spacing.xs,
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryLabel: {
    ...typography.label,
    color: colors.primaryDark,
  },
  section: {
    marginTop: spacing.xxl,
  },
  sectionTitle: {
    ...typography.h3,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  featuredContainer: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  featuredCard: {
    width: 260,
    height: 160,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.border,
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  featuredName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  featuredRating: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  nearbyCard: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    ...shadows.sm,
  },
  nearbyImage: {
    width: 80,
    height: 80,
    backgroundColor: colors.border,
  },
  nearbyInfo: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  nearbyName: {
    ...typography.label,
    fontSize: 15,
  },
  nearbyRating: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  nearbyReviews: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  nearbyAddress: {
    ...typography.caption,
    marginTop: 2,
  },
});
