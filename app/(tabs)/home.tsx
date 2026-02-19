import { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth';
import { useEstablishments } from '@/hooks/useEstablishments';
import { useUpcomingClasses } from '@/hooks/useAllClasses';
import { useFavorites } from '@/hooks/useFavorites';
import { colors, spacing, radius, shadows } from '@/lib/theme';
import { EstablishmentType } from '@/lib/types';

const CATEGORIES: { id: EstablishmentType | 'all'; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'all', label: 'All', icon: 'sparkles' },
  { id: 'gym', label: 'Gym', icon: 'barbell-outline' },
  { id: 'yoga', label: 'Yoga', icon: 'leaf-outline' },
  { id: 'restaurant', label: 'Food', icon: 'restaurant-outline' },
];

export default function HomeScreen() {
  const { profile, user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<EstablishmentType | 'all'>('all');
  const { establishments, loading: estLoading } = useEstablishments(activeCategory === 'all' ? null : activeCategory);
  const { classes, loading: classesLoading } = useUpcomingClasses(3);
  const { isFavorite, toggleFavorite } = useFavorites();
  const router = useRouter();

  const firstName = profile?.full_name?.split(' ')[0] || 'there';
  const initial = (profile?.full_name || user?.email || '?').substring(0, 2).toUpperCase();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.name}>{firstName}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.bellButton}>
              <Ionicons name="notifications-outline" size={20} color={colors.textSecondary} />
              <View style={styles.bellDot} />
            </TouchableOpacity>
            <View style={styles.avatarSmall}>
              <Text style={styles.avatarSmallText}>{initial}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push('/(tabs)/explore')}
          activeOpacity={0.7}
        >
          <Ionicons name="search" size={20} color={colors.textTertiary} />
          <Text style={styles.searchPlaceholder}>Search gyms, classes, restaurants...</Text>
        </TouchableOpacity>

        <View style={styles.categoriesRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryPill, activeCategory === cat.id && styles.categoryPillActive]}
              onPress={() => setActiveCategory(cat.id)}
            >
              <Ionicons
                name={cat.icon}
                size={16}
                color={activeCategory === cat.id ? '#fff' : colors.textSecondary}
              />
              <Text style={[styles.categoryLabel, activeCategory === cat.id && styles.categoryLabelActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Places</Text>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => router.push('/(tabs)/explore')}
            >
              <Text style={styles.seeAllText}>See all</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
          {estLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.placesScroll}
            >
              {establishments.slice(0, 4).map((place) => (
                <TouchableOpacity
                  key={place.id}
                  style={styles.placeCard}
                  onPress={() => router.push(`/establishment/${place.id}`)}
                  activeOpacity={0.8}
                >
                  <View style={styles.placeImageWrap}>
                    <Image
                      source={{ uri: place.image_url || undefined }}
                      style={styles.placeImage}
                    />
                    <TouchableOpacity
                      style={styles.heartButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleFavorite(place.id);
                      }}
                    >
                      <Ionicons
                        name={isFavorite(place.id) ? 'heart' : 'heart-outline'}
                        size={14}
                        color={isFavorite(place.id) ? colors.error : colors.textTertiary}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.placeInfo}>
                    <Text style={styles.placeName} numberOfLines={1}>{place.name}</Text>
                    <View style={styles.placeMetaRow}>
                      <Ionicons name="star" size={12} color={colors.warning} />
                      <Text style={styles.placeRating}>{place.rating?.toFixed(1)}</Text>
                      <Text style={styles.placeDot}>&middot;</Text>
                      <Ionicons name="location-outline" size={12} color={colors.textTertiary} />
                      <Text style={styles.placeDistance}>{place.city || 'Nearby'}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Classes</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>View all</Text>
            </TouchableOpacity>
          </View>
          {classesLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
          ) : (
            <View style={styles.classesList}>
              {classes.map((cls) => (
                <TouchableOpacity
                  key={cls.id}
                  style={styles.classCard}
                  onPress={() => router.push(`/booking/${cls.id}`)}
                  activeOpacity={0.7}
                >
                  <View style={styles.classIconBox}>
                    <Ionicons name="time-outline" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.classInfo}>
                    <Text style={styles.className} numberOfLines={1}>{cls.name}</Text>
                    <Text style={styles.classMeta}>
                      {cls.instructor} &middot; {cls.duration} min
                    </Text>
                  </View>
                  <View style={styles.classRight}>
                    <Text style={styles.classPrice}>${(cls.price / 100).toFixed(0)}</Text>
                    {cls.max_spots && (
                      <Text style={styles.classSpots}>{cls.max_spots} spots</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  greeting: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.muted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  avatarSmallText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.muted,
    marginBottom: 16,
  },
  searchPlaceholder: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  categoriesRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 20,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.muted,
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  categoryLabelActive: {
    color: '#fff',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
  },
  placesScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  placeCard: {
    width: 156,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  placeImageWrap: {
    height: 100,
    position: 'relative',
  },
  placeImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.border,
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeInfo: {
    padding: 12,
  },
  placeName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  placeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  placeRating: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.text,
  },
  placeDot: {
    fontSize: 11,
    color: colors.textMuted,
  },
  placeDistance: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  classesList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  classCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  classIconBox: {
    width: 44,
    height: 44,
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
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  classSpots: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.warning,
    marginTop: 2,
  },
});
