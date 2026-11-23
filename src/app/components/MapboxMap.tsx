import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useCountry } from '../contexts/CountryContext';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const destIcon = L.divIcon({
  html: `<svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 0C6.268 0 0 6.268 0 14C0 24.5 14 36 14 36C14 36 28 24.5 28 14C28 6.268 21.732 0 14 0Z" fill="#EF4444"/>
    <circle cx="14" cy="14" r="6" fill="white"/>
  </svg>`,
  className: '',
  iconSize: [28, 36],
  iconAnchor: [14, 36],
});

const originIcon = L.divIcon({
  html: `<div style="width:14px;height:14px;background:#2563EB;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
  className: '',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

export interface MapboxMapRef {
  zoomIn: () => void;
  zoomOut: () => void;
  flyTo: (center: [number, number], zoom?: number) => void;
}

interface MapboxMapProps {
  origin?: [number, number] | null;
  destination?: [number, number] | null;
  routeGeoJSON?: GeoJSON.FeatureCollection | null;
  onMapClick?: (coords: { lng: number; lat: number }) => void;
  mode?: string;
  height?: string;
  mapStyle?: 'street' | 'satellite';
}

const TILE_URLS = {
  street: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
};

const TILE_ATTRIBUTIONS = {
  street: 'Tiles &copy; Esri',
  satellite: 'Tiles &copy; Esri &mdash; Source: Esri, USGS, NOAA',
};

const FALLBACK_CENTER: [number, number] = [-72, 19];

function isValidLngLat(value: unknown): value is [number, number] {
  if (!Array.isArray(value) || value.length < 2) return false;
  const [lng, lat] = value;
  return Number.isFinite(lng)
    && Number.isFinite(lat)
    && lng >= -180
    && lng <= 180
    && lat >= -90
    && lat <= 90;
}

function hasFiniteCoordinates(value: unknown): boolean {
  if (typeof value === 'number') return Number.isFinite(value);
  return Array.isArray(value) && value.length > 0 && value.every(hasFiniteCoordinates);
}

function isValidRouteGeoJSON(value: GeoJSON.FeatureCollection): boolean {
  return value.features.length > 0 && value.features.every(feature => {
    const geometry = feature.geometry;
    return !!geometry
      && 'coordinates' in geometry
      && hasFiniteCoordinates(geometry.coordinates);
  });
}

export const MapboxMap = forwardRef<MapboxMapRef, MapboxMapProps>(
  ({ origin, destination, routeGeoJSON, onMapClick, height = '100%', mapStyle = 'street' }, ref) => {
    const { mapCenter, mapZoom } = useCountry();
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const tileLayerRef = useRef<L.TileLayer | null>(null);
    const originMarkerRef = useRef<L.Marker | null>(null);
    const destMarkerRef = useRef<L.Marker | null>(null);
    const routeLayerRef = useRef<L.GeoJSON | null>(null);

    useImperativeHandle(ref, () => ({
      zoomIn: () => mapRef.current?.zoomIn(),
      zoomOut: () => mapRef.current?.zoomOut(),
      flyTo: (center, zoom) => {
        const map = mapRef.current;
        if (!map || !isValidLngLat(center)) return;
        const targetZoom = Number.isFinite(zoom) ? zoom : map.getZoom();
        map.flyTo([center[1], center[0]], targetZoom, { duration: 0.8 });
      },
    }));

    // Initialize map once
    useEffect(() => {
      if (!containerRef.current || mapRef.current) return;
      const [lng, lat] = isValidLngLat(mapCenter) ? mapCenter : FALLBACK_CENTER;
      const initialZoom = Number.isFinite(mapZoom) ? mapZoom : 5;
      let map: L.Map;
      try {
        map = L.map(containerRef.current, {
          center: [lat, lng],
          zoom: initialZoom,
          zoomControl: false,
        });
      } catch {
        return;
      }
      const tl = L.tileLayer(TILE_URLS[mapStyle], {
        attribution: TILE_ATTRIBUTIONS[mapStyle],
        maxZoom: 19,
      }).addTo(map);
      tileLayerRef.current = tl;
      mapRef.current = map;
      return () => {
        map.remove();
        mapRef.current = null;
      };
    }, []);

    // Tile layer style switch
    useEffect(() => {
      const map = mapRef.current;
      if (!map) return;
      tileLayerRef.current?.remove();
      const tl = L.tileLayer(TILE_URLS[mapStyle], {
        attribution: TILE_ATTRIBUTIONS[mapStyle],
        maxZoom: 19,
      }).addTo(map);
      tileLayerRef.current = tl;
    }, [mapStyle]);

    // Click handler
    useEffect(() => {
      const map = mapRef.current;
      if (!map) return;
      const handler = (e: L.LeafletMouseEvent) =>
        onMapClick?.({ lng: e.latlng.lng, lat: e.latlng.lat });
      map.on('click', handler);
      return () => { map.off('click', handler); };
    }, [onMapClick]);

    // Center / zoom — skip if map not ready or coords invalid
    useEffect(() => {
      const map = mapRef.current;
      if (!map || !isValidLngLat(mapCenter)) return;
      const [lng, lat] = mapCenter;
      const nextZoom = Number.isFinite(mapZoom) ? mapZoom : map.getZoom();
      map.flyTo([lat, lng], nextZoom, { duration: 0.8 });
    }, [mapCenter, mapZoom]);

    // Origin marker
    useEffect(() => {
      const map = mapRef.current;
      if (!map) return;
      originMarkerRef.current?.remove();
      originMarkerRef.current = null;
      if (isValidLngLat(origin)) {
        originMarkerRef.current = L.marker([origin[1], origin[0]], { icon: originIcon }).addTo(map);
      }
    }, [origin]);

    // Destination marker
    useEffect(() => {
      const map = mapRef.current;
      if (!map) return;
      destMarkerRef.current?.remove();
      destMarkerRef.current = null;
      if (isValidLngLat(destination)) {
        destMarkerRef.current = L.marker([destination[1], destination[0]], { icon: destIcon }).addTo(map);
        map.flyTo([destination[1], destination[0]], 14, { duration: 0.8 });
      }
    }, [destination]);

    // Route GeoJSON
    useEffect(() => {
      const map = mapRef.current;
      if (!map) return;
      routeLayerRef.current?.remove();
      routeLayerRef.current = null;
      if (routeGeoJSON && isValidRouteGeoJSON(routeGeoJSON)) {
        routeLayerRef.current = L.geoJSON(routeGeoJSON, {
          style: { color: '#2563EB', weight: 5, opacity: 1 },
        }).addTo(map);
      }
    }, [routeGeoJSON]);

    return <div ref={containerRef} style={{ width: '100%', height }} />;
  }
);
