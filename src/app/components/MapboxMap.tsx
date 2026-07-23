import { useState, useRef, useCallback, useEffect } from 'react';
import Map, { Marker, Source, Layer, NavigationControl, type MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Navigation } from 'lucide-react';
import { useCountry } from '../contexts/CountryContext';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoic2VwaGFuZSIsImEiOiJjbXFjdWlqZnkwcXU0MnJxeW10bDA3Ym12In0.PK_YiNQe-V3EHjbzJI12Kg';

interface MapboxMapProps {
  origin?: [number, number] | null;
  destination?: [number, number] | null;
  routeGeoJSON?: GeoJSON.FeatureCollection | null;
  onMapClick?: (coords: { lng: number; lat: number }) => void;
  mode?: string;
  height?: string;
}

const routeLayerStyle: any = {
  id: 'route',
  type: 'line',
  layout: {
    'line-join': 'round',
    'line-cap': 'round',
  },
  paint: {
    'line-color': '#3b82f6',
    'line-width': 5,
    'line-opacity': 0.85,
  },
};

const routeCasingStyle: any = {
  id: 'route-casing',
  type: 'line',
  layout: {
    'line-join': 'round',
    'line-cap': 'round',
  },
  paint: {
    'line-color': '#1d4ed8',
    'line-width': 8,
    'line-opacity': 0.3,
  },
};

const modeMapStyle: Record<string, string> = {
  car: 'mapbox://styles/mapbox/streets-v12',
  taxi: 'mapbox://styles/mapbox/streets-v12',
  pedestrian: 'mapbox://styles/mapbox/outdoors-v12',
  bike: 'mapbox://styles/mapbox/outdoors-v12',
  scooter: 'mapbox://styles/mapbox/streets-v12',
  transit: 'mapbox://styles/mapbox/streets-v12',
  motorcycle: 'mapbox://styles/mapbox/streets-v12',
  carpool: 'mapbox://styles/mapbox/streets-v12',
  delivery: 'mapbox://styles/mapbox/streets-v12',
  tourist: 'mapbox://styles/mapbox/outdoors-v12',
  parent: 'mapbox://styles/mapbox/streets-v12',
};

export function MapboxMap({ origin, destination, routeGeoJSON, onMapClick, mode = 'car', height = '100%' }: MapboxMapProps) {
  const { mapCenter, mapZoom } = useCountry();
  const mapRef = useRef<MapRef>(null);

  const [viewState, setViewState] = useState({
    longitude: mapCenter[0],
    latitude: mapCenter[1],
    zoom: mapZoom,
  });

  useEffect(() => {
    setViewState(v => ({
      ...v,
      longitude: mapCenter[0],
      latitude: mapCenter[1],
      zoom: mapZoom,
    }));
  }, [mapCenter, mapZoom]);

  useEffect(() => {
    if (origin && destination && mapRef.current) {
      const bounds: [[number, number], [number, number]] = [
        [Math.min(origin[0], destination[0]) - 0.05, Math.min(origin[1], destination[1]) - 0.05],
        [Math.max(origin[0], destination[0]) + 0.05, Math.max(origin[1], destination[1]) + 0.05],
      ];
      mapRef.current.fitBounds(bounds, { padding: 80, duration: 1200 });
    } else if (origin) {
      mapRef.current?.flyTo({ center: origin, zoom: 14, duration: 1000 });
    }
  }, [origin, destination]);

  const handleClick = useCallback(
    (evt: { lngLat: { lng: number; lat: number } }) => {
      onMapClick?.({ lng: evt.lngLat.lng, lat: evt.lngLat.lat });
    },
    [onMapClick]
  );

  const mapStyle = modeMapStyle[mode] ?? 'mapbox://styles/mapbox/streets-v12';

  return (
    <div style={{ height, width: '100%' }} className="relative">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle={mapStyle}
        mapboxAccessToken={MAPBOX_TOKEN}
        onClick={handleClick}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
        onError={(e) => {
          if (e.error?.name === 'AbortError' || e.error?.message?.includes('Actor removed')) return;
          console.error(e.error);
        }}
      >
        <NavigationControl position="bottom-right" />

        {/* Route */}
        {routeGeoJSON && (
          <Source id="route-source" type="geojson" data={routeGeoJSON}>
            <Layer {...routeCasingStyle} />
            <Layer {...routeLayerStyle} />
          </Source>
        )}

        {/* Origin marker */}
        {origin && (
          <Marker longitude={origin[0]} latitude={origin[1]} anchor="bottom">
            <div className="flex flex-col items-center">
              <div className="bg-green-500 text-white rounded-full p-2 shadow-lg border-2 border-white">
                <Navigation className="w-4 h-4" />
              </div>
              <div className="w-0.5 h-2 bg-green-500" />
            </div>
          </Marker>
        )}

        {/* Destination marker */}
        {destination && (
          <Marker longitude={destination[0]} latitude={destination[1]} anchor="bottom">
            <div className="flex flex-col items-center">
              <div className="bg-red-500 text-white rounded-full p-2 shadow-lg border-2 border-white">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="w-0.5 h-2 bg-red-500" />
            </div>
          </Marker>
        )}
      </Map>

      {/* Attribution */}
      <div className="absolute bottom-2 left-2 text-xs text-gray-500 bg-white/80 rounded px-1">
        © Mapbox © OpenStreetMap
      </div>
    </div>
  );
}
