import { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import RNMapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

interface MapPin {
  id: string;
  latitude: number;
  longitude: number;
  label: string;
  icon?: string;
  selected?: boolean;
}

interface MapViewProps {
  pins: MapPin[];
  center?: { latitude: number; longitude: number };
  zoom?: number;
  onPinPress?: (id: string) => void;
  style?: any;
}

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
        {pins.map((pin) => (
          <Marker
            key={pin.id}
            coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
            title={pin.label}
            onPress={() => onPinPress?.(pin.id)}
            pinColor={pin.selected ? '#22C55E' : 'red'}
          />
        ))}
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
});
