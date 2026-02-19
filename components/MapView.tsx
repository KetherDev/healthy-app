import { View, StyleSheet } from 'react-native';
import RNMapView, { Marker, Callout } from 'react-native-maps';

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
    <View style={[styles.container, style]}>
      <RNMapView
        style={StyleSheet.absoluteFillObject}
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
});
