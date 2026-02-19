import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { supabase } from '@/lib/supabase';
import { colors, shadows } from '@/lib/theme';
import { Establishment, EstablishmentType } from '@/lib/types';
import MapView from '@/components/MapView';

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
  const [selectedPin, setSelectedPin] = useState<string | null>(null);

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
      setLoading(false);
    };
    const timeout = setTimeout(search, 300);
    return () => clearTimeout(timeout);
  }, [query, activeFilter]);

  const selectedPlace = selectedPin ? results.find((p) => p.id === selectedPin) : null;

  const typeIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'gym': case 'crossfit': return 'barbell-outline';
      case 'yoga': case 'pilates': case 'meditation': return 'leaf-outline';
      case 'restaurant': return 'restaurant-outline';
      default: return 'location-outline';
    }
  };

  const mapPins = useMemo(() =>
    results
      .filter((p) => p.latitude && p.longitude)
      .map((p) => ({
        id: p.id,
        latitude: p.latitude!,
        longitude: p.longitude!,
        label: `${p.price_range || '$'} ${p.name}`,
        selected: selectedPin === p.id,
      })),
    [results, selectedPin]
  );

  const mapCenter = useMemo(() => {
    if (selectedPlace?.latitude && selectedPlace?.longitude) {
      return { latitude: selectedPlace.latitude, longitude: selectedPlace.longitude };
    }
    if (results.length > 0) {
      const withCoords = results.filter((r) => r.latitude && r.longitude);
      if (withCoords.length > 0) {
        const avgLat = withCoords.reduce((s, r) => s + r.latitude!, 0) / withCoords.length;
        const avgLng = withCoords.reduce((s, r) => s + r.longitude!, 0) / withCoords.length;
        return { latitude: avgLat, longitude: avgLng };
      }
    }
    return SF_CENTER;
  }, [results, selectedPlace]);

  const handlePinPress = (id: string) => {
    setSelectedPin(selectedPin === id ? null : id);
  };

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

      {loading ? (
        <View style={styles.bottomCard}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : selectedPlace ? (
        <View style={styles.bottomCard}>
          <TouchableOpacity
            style={styles.closePin}
            onPress={() => setSelectedPin(null)}
          >
            <Ionicons name="close" size={14} color={colors.textTertiary} />
          </TouchableOpacity>
          <View style={styles.selectedRow}>
            <Image source={{ uri: selectedPlace.image_url || undefined }} style={styles.selectedImage} />
            <View style={styles.selectedInfo}>
              <Text style={styles.selectedName} numberOfLines={1}>{selectedPlace.name}</Text>
              <Text style={styles.selectedType}>{selectedPlace.type} &middot; {selectedPlace.price_range}</Text>
              <View style={styles.selectedMeta}>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={12} color={colors.warning} />
                  <Text style={styles.ratingText}>{selectedPlace.rating?.toFixed(1)}</Text>
                  <Text style={styles.reviewCount}>({selectedPlace.review_count})</Text>
                </View>
                <View style={styles.distanceRow}>
                  <Ionicons name="location-outline" size={12} color={colors.textTertiary} />
                  <Text style={styles.distanceText}>{selectedPlace.city}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.viewDetailsBtn}
                onPress={() => router.push(`/establishment/${selectedPlace.id}`)}
              >
                <Text style={styles.viewDetailsBtnText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.bottomCard}>
          <Text style={styles.nearbyCount}>{results.length} places nearby</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {results.slice(0, 4).map((place) => (
              <TouchableOpacity
                key={place.id}
                style={styles.miniCard}
                onPress={() => setSelectedPin(place.id)}
              >
                <Image source={{ uri: place.image_url || undefined }} style={styles.miniImage} />
                <View>
                  <Text style={styles.miniName} numberOfLines={1}>{place.name}</Text>
                  <Text style={styles.miniCity}>{place.city}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
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
  bottomCard: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    zIndex: 1000,
  },
  closePin: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.muted,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  selectedRow: {
    flexDirection: 'row',
    gap: 14,
  },
  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: colors.border,
  },
  selectedInfo: {
    flex: 1,
    minWidth: 0,
  },
  selectedName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  selectedType: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 2,
  },
  selectedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.text,
  },
  reviewCount: {
    fontSize: 10,
    color: colors.textTertiary,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  distanceText: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  viewDetailsBtn: {
    marginTop: 10,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  viewDetailsBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  nearbyCount: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  miniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  miniImage: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  miniName: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.text,
    maxWidth: 100,
  },
  miniCity: {
    fontSize: 10,
    color: colors.textTertiary,
  },
});
