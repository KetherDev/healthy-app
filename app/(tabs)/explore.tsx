import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { supabase } from '@/lib/supabase';
import { colors, shadows } from '@/lib/theme';
import { Establishment, EstablishmentType } from '@/lib/types';
import MapView from '@/components/MapView';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 80;
const CARD_SPACING = 10;
const SIDE_PADDING = (SCREEN_WIDTH - CARD_WIDTH) / 2;

const CATEGORIES: { id: EstablishmentType | 'all'; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'all', label: 'All', icon: 'sparkles' },
  { id: 'gym', label: 'Gym', icon: 'barbell-outline' },
  { id: 'yoga', label: 'Yoga', icon: 'leaf-outline' },
  { id: 'restaurant', label: 'Food', icon: 'restaurant-outline' },
];

const SF_CENTER = { latitude: 37.7749, longitude: -122.4194 };

export default function ExploreScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string }>();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<EstablishmentType | 'all'>(
    (params.type as EstablishmentType) || 'all'
  );
  const [results, setResults] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (params.type) {
      setActiveFilter(params.type as EstablishmentType);
    }
  }, [params.type]);

  useEffect(() => {
    const search = async () => {
      setLoading(true);
      let q = supabase.from('establishments').select('*').order('name');
      if (activeFilter !== 'all') {
        q = q.eq('type', activeFilter);
      }
      if (query.trim()) {
        q = q.ilike('name', `%${query.trim()}%`);
      }
      const { data } = await q;
      setResults(data ?? []);
      setActiveIndex(0);
      setLoading(false);
    };
    const timeout = setTimeout(search, 300);
    return () => clearTimeout(timeout);
  }, [query, activeFilter]);

  const placesWithCoords = useMemo(() =>
    results.filter((p) => p.latitude && p.longitude),
    [results]
  );

  const selectedPlace = placesWithCoords[activeIndex] || null;

  const mapPins = useMemo(() =>
    placesWithCoords.map((p, i) => ({
      id: p.id,
      latitude: p.latitude!,
      longitude: p.longitude!,
      label: p.name,
      category: p.type,
      selected: i === activeIndex,
    })),
    [placesWithCoords, activeIndex]
  );

  const mapCenter = useMemo(() => {
    if (selectedPlace?.latitude && selectedPlace?.longitude) {
      return { latitude: selectedPlace.latitude, longitude: selectedPlace.longitude };
    }
    if (placesWithCoords.length > 0) {
      const avgLat = placesWithCoords.reduce((s, r) => s + r.latitude!, 0) / placesWithCoords.length;
      const avgLng = placesWithCoords.reduce((s, r) => s + r.longitude!, 0) / placesWithCoords.length;
      return { latitude: avgLat, longitude: avgLng };
    }
    return SF_CENTER;
  }, [placesWithCoords, selectedPlace]);

  const handlePinPress = useCallback((id: string) => {
    const idx = placesWithCoords.findIndex((p) => p.id === id);
    if (idx >= 0) {
      setActiveIndex(idx);
      flatListRef.current?.scrollToIndex({ index: idx, animated: true });
    }
  }, [placesWithCoords]);

  const onScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const idx = Math.round(offsetX / (CARD_WIDTH + CARD_SPACING));
    const clampedIdx = Math.max(0, Math.min(idx, placesWithCoords.length - 1));
    setActiveIndex(clampedIdx);
  }, [placesWithCoords.length]);

  const typeIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'gym': case 'crossfit': return 'barbell-outline';
      case 'yoga': case 'pilates': case 'meditation': return 'leaf-outline';
      case 'restaurant': return 'restaurant-outline';
      default: return 'location-outline';
    }
  };

  const renderCard = useCallback(({ item, index }: { item: Establishment; index: number }) => {
    const isActive = index === activeIndex;
    return (
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={() => router.push(`/establishment/${item.id}`)}
        style={[styles.carouselCard, isActive && styles.carouselCardActive]}
      >
        <Image source={{ uri: item.image_url || undefined }} style={styles.cardImage} />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
            <View style={styles.cardTypeTag}>
              <Ionicons name={typeIcon(item.type)} size={10} color={colors.primary} />
              <Text style={styles.cardTypeText}>{item.type}</Text>
            </View>
          </View>
          <View style={styles.cardMeta}>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color={colors.warning} />
              <Text style={styles.ratingText}>{item.rating?.toFixed(1)}</Text>
              <Text style={styles.reviewCount}>({item.review_count})</Text>
            </View>
            <View style={styles.dotSeparator} />
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={12} color={colors.textTertiary} />
              <Text style={styles.locationText}>{item.city}</Text>
            </View>
            <View style={styles.dotSeparator} />
            <Text style={styles.priceText}>{item.price_range}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [activeIndex, router]);

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: CARD_WIDTH + CARD_SPACING,
    offset: (CARD_WIDTH + CARD_SPACING) * index,
    index,
  }), []);

  return (
    <View style={styles.container}>
      <View style={styles.mapArea}>
        <MapView
          pins={mapPins}
          center={mapCenter}
          zoom={13}
          onPinPress={handlePinPress}
          style={{ flex: 1 }}
        />

        <SafeAreaView style={styles.searchOverlay} edges={['top']}>
          <View style={styles.searchRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.push('/(tabs)/home')}
            >
              <Ionicons name="arrow-back" size={20} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.searchInputWrap}>
              <Ionicons name="search" size={16} color={colors.textTertiary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search this area..."
                placeholderTextColor={colors.textMuted}
                value={query}
                onChangeText={setQuery}
              />
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {CATEGORIES.map((f) => (
              <TouchableOpacity
                key={f.id}
                style={[styles.filterPill, activeFilter === f.id && styles.filterPillActive]}
                onPress={() => setActiveFilter(f.id)}
              >
                <Ionicons
                  name={f.icon}
                  size={14}
                  color={activeFilter === f.id ? '#fff' : colors.textSecondary}
                />
                <Text style={[styles.filterLabel, activeFilter === f.id && styles.filterLabelActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </View>

      <View style={styles.carouselContainer}>
        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : placesWithCoords.length > 0 ? (
          <>
            <FlatList
              ref={flatListRef}
              data={placesWithCoords}
              renderItem={renderCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH + CARD_SPACING}
              snapToAlignment="start"
              decelerationRate="fast"
              contentContainerStyle={{
                paddingHorizontal: SIDE_PADDING,
              }}
              ItemSeparatorComponent={() => <View style={{ width: CARD_SPACING }} />}
              onMomentumScrollEnd={onScrollEnd}
              getItemLayout={getItemLayout}
            />
            <View style={styles.paginationDots}>
              {placesWithCoords.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === activeIndex && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          </>
        ) : (
          <View style={styles.loadingCard}>
            <Text style={styles.noResultsText}>No places found</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F0E8',
  },
  mapArea: {
    flex: 1,
    position: 'relative',
  },
  searchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    ...shadows.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    padding: 0,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingBottom: 4,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    ...shadows.sm,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  filterLabelActive: {
    color: '#fff',
  },
  carouselContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  loadingCard: {
    marginHorizontal: 40,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    ...shadows.lg,
  },
  carouselCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    opacity: 0.85,
  },
  carouselCardActive: {
    opacity: 1,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  cardImage: {
    width: '100%',
    height: 100,
    backgroundColor: colors.border,
  },
  cardContent: {
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  cardTypeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
  },
  cardTypeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'capitalize',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  reviewCount: {
    fontSize: 10,
    color: colors.textTertiary,
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textMuted,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  locationText: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  priceText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  dotActive: {
    width: 20,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  noResultsText: {
    fontSize: 13,
    color: colors.textTertiary,
  },
});
