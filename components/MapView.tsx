import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import RNMapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Ionicons from '@expo/vector-icons/Ionicons';

interface MapPin {
  id: string;
  latitude: number;
  longitude: number;
  label: string;
  category?: string;
  selected?: boolean;
}

interface MapViewProps {
  pins: MapPin[];
  center?: { latitude: number; longitude: number };
  zoom?: number;
  onPinPress?: (id: string) => void;
  style?: any;
}

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  gym: 'barbell',
  crossfit: 'barbell',
  yoga: 'leaf',
  pilates: 'body',
  meditation: 'flower',
  restaurant: 'restaurant',
};

const CATEGORY_COLORS: Record<string, string> = {
  gym: '#EF4444',
  crossfit: '#F97316',
  yoga: '#22C55E',
  pilates: '#8B5CF6',
  meditation: '#6366F1',
  restaurant: '#F59E0B',
};

export default function NativeMapView({ pins, center, zoom = 13, onPinPress, style }: MapViewProps) {
  const mapRef = useRef<RNMapView>(null);
  const lat = center?.latitude || 37.7749;
  const lng = center?.longitude || -122.4194;
  const delta = 0.05 * Math.pow(2, 13 - zoom);

  useEffect(() => {
    if (mapRef.current && center?.latitude && center?.longitude) {
      mapRef.current.animateToRegion(
        {
          latitude: center.latitude,
          longitude: center.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        600
      );
    }
  }, [center?.latitude, center?.longitude]);

  return (
    <View style={[styles.container, style]}>
      <RNMapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={{
          latitude: lat,
          longitude: lng,
          latitudeDelta: delta,
          longitudeDelta: delta,
        }}
        showsUserLocation
        showsMyLocationButton
        mapType="standard"
      >
        {pins.map((pin) => {
          const color = CATEGORY_COLORS[pin.category || 'gym'] || '#64748B';
          const iconName = CATEGORY_ICONS[pin.category || 'gym'] || 'location';
          return (
            <Marker
              key={pin.id}
              coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
              title={pin.label}
              onPress={() => onPinPress?.(pin.id)}
            >
              <View style={[
                styles.pinContainer,
                pin.selected && { borderColor: color, borderWidth: 2.5, transform: [{ scale: 1.15 }] },
              ]}>
                <View style={[styles.pinIconWrap, { backgroundColor: color + '18' }]}>
                  <Ionicons name={iconName} size={14} color={color} />
                </View>
                <Text style={styles.pinLabel} numberOfLines={1}>{pin.label}</Text>
              </View>
              <View style={[
                styles.pinArrow,
                pin.selected && { borderTopColor: color },
              ]} />
            </Marker>
          );
        })}
      </RNMapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  pinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  pinIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1a1a2e',
    maxWidth: 80,
  },
  pinArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
    alignSelf: 'center',
    marginTop: -1,
  },
});
