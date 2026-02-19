import { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';

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

const CATEGORY_SVGS: Record<string, string> = {
  gym: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/></svg>`,
  crossfit: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/></svg>`,
  yoga: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/><circle cx="12" cy="6" r="2"/><path d="M15 12l-3 3-3-3v-1l3-2 3 2z"/></svg>`,
  pilates: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><circle cx="12" cy="6" r="2"/><path d="M15 12l-3 3-3-3v-1l3-2 3 2z"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>`,
  meditation: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><circle cx="12" cy="7" r="2"/><path d="M9 12h6v1H9z"/><path d="M8 15c0 2.21 1.79 4 4 4s4-1.79 4-4H8z"/></svg>`,
  restaurant: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/></svg>`,
};

const CATEGORY_COLORS: Record<string, string> = {
  gym: '#EF4444',
  crossfit: '#F97316',
  yoga: '#22C55E',
  pilates: '#8B5CF6',
  meditation: '#6366F1',
  restaurant: '#F59E0B',
};

function getCategoryIcon(category: string): string {
  return CATEGORY_SVGS[category] || CATEGORY_SVGS.gym;
}

function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || '#64748B';
}

export default function WebMapView({ pins, center, zoom = 13, onPinPress, style }: MapViewProps) {
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const clusterGroupRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const initialFitDoneRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const existingLeafletCss = document.querySelector('link[href*="leaflet@1.9"]');
    if (!existingLeafletCss) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const existingClusterCss = document.querySelector('link[href*="MarkerCluster"]');
    if (!existingClusterCss) {
      const link1 = document.createElement('link');
      link1.rel = 'stylesheet';
      link1.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css';
      document.head.appendChild(link1);
      const link2 = document.createElement('link');
      link2.rel = 'stylesheet';
      link2.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css';
      document.head.appendChild(link2);
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
      await import('leaflet.markercluster');
      const map = mapInstanceRef.current;

      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current);
        clusterGroupRef.current = null;
      }
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      const clusterGroup = (L as any).markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        iconCreateFunction: (cluster: any) => {
          const childMarkers = cluster.getAllChildMarkers();
          const categories: Record<string, number> = {};
          childMarkers.forEach((m: any) => {
            const cat = m.options.category || 'gym';
            categories[cat] = (categories[cat] || 0) + 1;
          });

          const dominantCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0][0];
          const color = getCategoryColor(dominantCategory);
          const count = cluster.getChildCount();

          const html = `
            <div style="
              width: 44px;
              height: 44px;
              border-radius: 50%;
              background: ${color};
              display: flex;
              align-items: center;
              justify-content: center;
              color: #fff;
              font-weight: 700;
              font-size: 14px;
              box-shadow: 0 3px 10px ${color}44;
              border: 3px solid #fff;
            ">${count}</div>
          `;

          return L.divIcon({
            html,
            className: 'custom-cluster-icon',
            iconSize: L.point(44, 44),
            iconAnchor: L.point(22, 22),
          });
        },
      });

      pins.forEach((pin) => {
        const isSelected = pin.selected;
        const category = pin.category || 'gym';
        const color = getCategoryColor(category);
        const svgIcon = getCategoryIcon(category);

        const iconHtml = `
          <div style="
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
          ">
            <div style="
              display: flex;
              align-items: center;
              gap: 6px;
              padding: 8px 12px;
              border-radius: 24px;
              background: #fff;
              color: ${color};
              font-size: 12px;
              font-weight: 600;
              box-shadow: 0 2px 10px rgba(0,0,0,0.15);
              white-space: nowrap;
              cursor: pointer;
              transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
              transition: all 0.2s ease;
              border: ${isSelected ? `2.5px solid ${color}` : '2px solid transparent'};
            ">
              <span style="
                display: flex;
                align-items: center;
                justify-content: center;
                width: 22px;
                height: 22px;
                border-radius: 50%;
                background: ${color}18;
                color: ${color};
                flex-shrink: 0;
              ">${svgIcon}</span>
              <span style="max-width: 100px; overflow: hidden; text-overflow: ellipsis; color: #1a1a2e;">${pin.label}</span>
            </div>
            <div style="
              width: 10px;
              height: 10px;
              background: #fff;
              transform: rotate(45deg);
              margin-top: -6px;
              box-shadow: 2px 2px 4px rgba(0,0,0,0.08);
              border-right: ${isSelected ? `2.5px solid ${color}` : '2px solid transparent'};
              border-bottom: ${isSelected ? `2.5px solid ${color}` : '2px solid transparent'};
            "></div>
          </div>
        `;

        const icon = L.divIcon({
          html: iconHtml,
          className: 'custom-map-pin',
          iconSize: [0, 0],
          iconAnchor: [60, 52],
        });

        const marker = L.marker([pin.latitude, pin.longitude], {
          icon,
          category,
          zIndexOffset: isSelected ? 1000 : 0,
        } as any)
          .on('click', () => {
            if (onPinPress) onPinPress(pin.id);
          });

        if (isSelected) {
          marker.addTo(map);
          markersRef.current.push(marker);
        } else {
          clusterGroup.addLayer(marker);
        }
      });

      map.addLayer(clusterGroup);
      clusterGroupRef.current = clusterGroup;

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
    mapInstanceRef.current.flyTo([center.latitude, center.longitude], Math.max(zoom, 14), {
      duration: 0.8,
    });
  }, [center?.latitude, center?.longitude]);

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
        .custom-cluster-icon {
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
        .marker-cluster {
          background: transparent !important;
        }
        .marker-cluster div {
          background: transparent !important;
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
