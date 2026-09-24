import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useCountry } from '../contexts/CountryContext';

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
}

export const MapboxMap = forwardRef<MapboxMapRef, MapboxMapProps>(
  ({ origin, destination, routeGeoJSON, onMapClick, height = '100%' }, ref) => {
    const { mapCenter, mapZoom } = useCountry();
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);
    const originMarkerRef = useRef<maplibregl.Marker | null>(null);
    const destMarkerRef = useRef<maplibregl.Marker | null>(null);

    useImperativeHandle(ref, () => ({
      zoomIn: () => mapRef.current?.zoomIn({ duration: 300 }),
      zoomOut: () => mapRef.current?.zoomOut({ duration: 300 }),
      flyTo: (center, zoom) => mapRef.current?.flyTo({ center, zoom, duration: 800 }),
    }));

    useEffect(() => {
      if (!containerRef.current || mapRef.current) return;

      const map = new maplibregl.Map({
        container: containerRef.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            },
          },
          layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
        },
        center: mapCenter,
        zoom: mapZoom,
      });

      if (onMapClick) {
        map.on('click', (e) => onMapClick({ lng: e.lngLat.lng, lat: e.lngLat.lat }));
      }

      mapRef.current = map;
      return () => { map.remove(); mapRef.current = null; };
    }, []);

    useEffect(() => {
      mapRef.current?.flyTo({ center: mapCenter, zoom: mapZoom, duration: 800 });
    }, [mapCenter, mapZoom]);

    useEffect(() => {
      originMarkerRef.current?.remove();
      if (!origin || !mapRef.current) return;
      const el = document.createElement('div');
      el.style.cssText = 'width:14px;height:14px;background:#2563EB;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);';
      originMarkerRef.current = new maplibregl.Marker({ element: el }).setLngLat(origin).addTo(mapRef.current);
    }, [origin]);

    useEffect(() => {
      destMarkerRef.current?.remove();
      if (!destination || !mapRef.current) return;
      const el = document.createElement('div');
      el.innerHTML = `<svg width="28" height="36" viewBox="0 0 28 36" fill="none"><path d="M14 0C6.268 0 0 6.268 0 14C0 24.5 14 36 14 36C14 36 28 24.5 28 14C28 6.268 21.732 0 14 0Z" fill="#EF4444"/><circle cx="14" cy="14" r="6" fill="white"/></svg>`;
      destMarkerRef.current = new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat(destination).addTo(mapRef.current);
      if (origin) {
        const bounds = new maplibregl.LngLatBounds(origin, destination);
        mapRef.current.fitBounds(bounds, { padding: 80, duration: 1000 });
      } else {
        mapRef.current.flyTo({ center: destination, zoom: 14, duration: 800 });
      }
    }, [destination]);

    useEffect(() => {
      const map = mapRef.current;
      if (!map) return;
      const cleanup = () => {
        if (map.getLayer('route')) map.removeLayer('route');
        if (map.getLayer('route-casing')) map.removeLayer('route-casing');
        if (map.getSource('route')) map.removeSource('route');
      };
      if (!routeGeoJSON) { cleanup(); return; }
      const draw = () => {
        cleanup();
        map.addSource('route', { type: 'geojson', data: routeGeoJSON });
        map.addLayer({ id: 'route-casing', type: 'line', source: 'route', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#1d4ed8', 'line-width': 9, 'line-opacity': 0.25 } });
        map.addLayer({ id: 'route', type: 'line', source: 'route', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#2563EB', 'line-width': 5 } });
      };
      if (map.isStyleLoaded()) draw(); else map.once('load', draw);
      return cleanup;
    }, [routeGeoJSON]);

    return <div ref={containerRef} style={{ width: '100%', height }} />;
  }
);
