import { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';

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

export default function WebMapView({ pins, center, zoom = 13, onPinPress, style }: MapViewProps) {
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const initialFitDoneRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const existingLink = document.querySelector('link[href*="leaflet"]');
    if (!existingLink) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const loadLeaflet = async () => {
      const L = (await import('leaflet')).default;

      if (!mapRef.current || mapInstanceRef.current) return;

      const lat = center?.latitude || 37.7749;
      const lng = center?.longitude || -122.4194;

      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([lat, lng], zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;

      setTimeout(() => map.invalidateSize(), 100);
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const loadMarkers = async () => {
      const L = (await import('leaflet')).default;
      const map = mapInstanceRef.current;

      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      pins.forEach((pin) => {
        const isSelected = pin.selected;

        const iconHtml = `
          <div style="
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 6px 12px;
            border-radius: 20px;
            background: ${isSelected ? '#22C55E' : '#fff'};
            color: ${isSelected ? '#fff' : '#1a1a2e'};
            font-size: 12px;
            font-weight: 600;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            white-space: nowrap;
            cursor: pointer;
            transform: ${isSelected ? 'scale(1.1)' : 'scale(1)'};
            transition: all 0.2s ease;
          ">
            ${pin.label}
          </div>
          <div style="
            width: 8px;
            height: 8px;
            background: ${isSelected ? '#22C55E' : '#fff'};
            transform: rotate(45deg);
            margin: -5px auto 0;
            box-shadow: 2px 2px 4px rgba(0,0,0,0.1);
          "></div>
        `;

        const icon = L.divIcon({
          html: iconHtml,
          className: 'custom-map-pin',
          iconSize: [0, 0],
          iconAnchor: [40, 45],
        });

        const marker = L.marker([pin.latitude, pin.longitude], { icon })
          .addTo(map)
          .on('click', () => {
            if (onPinPress) onPinPress(pin.id);
          });

        markersRef.current.push(marker);
      });

      if (pins.length > 0 && !initialFitDoneRef.current) {
        const bounds = L.latLngBounds(pins.map((p) => [p.latitude, p.longitude]));
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
        initialFitDoneRef.current = true;
      }
    };

    loadMarkers();
  }, [pins, onPinPress]);

  useEffect(() => {
    if (!mapInstanceRef.current || !center) return;
    mapInstanceRef.current.setView([center.latitude, center.longitude], zoom, { animate: true });
  }, [center?.latitude, center?.longitude, zoom]);

  return (
    <View style={[styles.container, style]}>
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 0,
        }}
      />
      <style>{`
        .custom-map-pin {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
          border-radius: 12px !important;
          overflow: hidden;
        }
        .leaflet-control-zoom a {
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          font-size: 18px !important;
          color: #1a1a2e !important;
          background: #fff !important;
          border: none !important;
        }
        .leaflet-control-zoom a:hover {
          background: #f1f5f9 !important;
        }
      `}</style>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
});
