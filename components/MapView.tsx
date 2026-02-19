import { View, StyleSheet, Text } from 'react-native';
import RNMapView, { Marker } from 'react-native-maps';
import { colors } from '@/lib/theme';

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
  const lat = center?.latitude || 37.7749;
  const lng = center?.longitude || -122.4194;
  const delta = 0.05 * Math.pow(2, 13 - zoom);

  return (
    <RNMapView
      style={[{ flex: 1 }, style]}
      initialRegion={{
        latitude: lat,
        longitude: lng,
        latitudeDelta: delta,
        longitudeDelta: delta,
      }}
      showsUserLocation
      showsMyLocationButton
    >
      {pins.map((pin) => (
        <Marker
          key={pin.id}
          coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
          title={pin.label}
          onPress={() => onPinPress?.(pin.id)}
          pinColor={pin.selected ? '#22C55E' : undefined}
        />
      ))}
    </RNMapView>
  );
}
