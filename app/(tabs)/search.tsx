import { useState, useEffect } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { colors, spacing, radius, typography, shadows } from '@/lib/theme';
import { Establishment, EstablishmentType } from '@/lib/types';

const filters: { label: string; value: EstablishmentType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Yoga 🧘', value: 'yoga' },
  { label: 'Gym 💪', value: 'gym' },
  { label: 'Pilates 🤸', value: 'pilates' },
  { label: 'Food 🥗', value: 'restaurant' },
  { label: 'Meditate 🧠', value: 'meditation' },
  { label: 'CrossFit 🏋️', value: 'crossfit' },
];

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string }>();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<EstablishmentType | 'all'>(
    (params.type as EstablishmentType) || 'all'
  );
  const [results, setResults] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search wellness spots..."
          placeholderTextColor={colors.textTertiary}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <View style={styles.filtersWrap}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterPill, activeFilter === f.value && styles.filterPillActive]}
            onPress={() => setActiveFilter(f.value)}
          >
            <Text
              style={[styles.filterLabel, activeFilter === f.value && styles.filterLabelActive]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.resultsList} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxxl }} />
        ) : results.length === 0 ? (
          <Text style={styles.emptyText}>No results found</Text>
        ) : (
          results.map((est) => (
            <TouchableOpacity
              key={est.id}
              style={styles.resultCard}
              onPress={() => router.push(`/establishment/${est.id}`)}
            >
              <Image source={{ uri: est.image_url || undefined }} style={styles.resultImage} />
              <View style={styles.resultInfo}>
                <Text style={styles.resultName} numberOfLines={1}>{est.name}</Text>
                <Text style={styles.resultDesc} numberOfLines={2}>{est.description}</Text>
                <View style={styles.resultMeta}>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={styles.ratingText}>{est.rating?.toFixed(1) || 'N/A'}</Text>
                  </View>
                  {est.price_range && (
                    <Text style={styles.priceText}>{est.price_range}</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  filtersWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  filterPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterLabel: {
    ...typography.caption,
    fontSize: 13,
    color: colors.textSecondary,
  },
  filterLabelActive: {
    color: '#fff',
    fontWeight: '600',
  },
  resultsList: {
    padding: spacing.xl,
    gap: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    ...shadows.sm,
  },
  resultImage: {
    width: '100%',
    height: 150,
    backgroundColor: colors.border,
  },
  resultInfo: {
    padding: spacing.md,
  },
  resultName: {
    ...typography.label,
    fontSize: 16,
  },
  resultDesc: {
    ...typography.bodySmall,
    marginTop: spacing.xs,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  priceText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  emptyText: {
    ...typography.body,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.xxxl,
  },
});
