import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';

export type PropertyLocation = {
  id: string;
  name: string;
  address?: string;
  coordinates?: [number, number];
};

type ResolvedPropertyLocation = PropertyLocation & { coordinates: [number, number] };

type MapboxMapInstance = {
  remove: () => void;
  resize: () => void;
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  fitBounds: (bounds: [[number, number], [number, number]], options?: Record<string, unknown>) => void;
};

type MapboxMarkerInstance = {
  setLngLat: (lngLat: [number, number]) => MapboxMarkerInstance;
  setPopup: (popup: MapboxPopupInstance) => MapboxMarkerInstance;
  addTo: (map: MapboxMapInstance) => MapboxMarkerInstance;
  remove: () => void;
};

type MapboxPopupInstance = {
  setHTML: (html: string) => MapboxPopupInstance;
};

type MapboxGLGlobal = {
  accessToken: string;
  Map: new (options: {
    container: HTMLElement;
    style: string;
    center: [number, number];
    zoom: number;
    attributionControl?: boolean;
  }) => MapboxMapInstance;
  Marker: new (options?: { color?: string }) => MapboxMarkerInstance;
  Popup: new (options?: Record<string, unknown>) => MapboxPopupInstance;
};

type WindowWithMapbox = Window & { mapboxgl?: MapboxGLGlobal };

declare const window: WindowWithMapbox;

type PropertyMapProps = {
  locations: PropertyLocation[];
};

const MAPBOX_SDK_URL = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
const MAPBOX_CSS_URL = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
const GEOCODE_ENDPOINT = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';
const DEFAULT_MAPBOX_TOKEN = 'pk.eyJ1IjoibWF4MHhkYXl2YyIsImEiOiJjbWVncTFkOXMxNmUwMmxzNGVnenRwaHRjIn0.h6CK_o-YpmYsimTqV1S2_Q';

let mapboxLoader: Promise<MapboxGLGlobal | null> | null = null;

function ensureMapboxStyles() {
  if (typeof document === 'undefined') return;
  const existing = document.getElementById('mapbox-gl-css-link');
  if (!existing) {
    const link = document.createElement('link');
    link.id = 'mapbox-gl-css-link';
    link.rel = 'stylesheet';
    link.href = MAPBOX_CSS_URL;
    document.head.appendChild(link);
  }
}

function loadMapboxScript(): Promise<MapboxGLGlobal | null> {
  if (typeof window === 'undefined') {
    return Promise.resolve(null);
  }
  if (window.mapboxgl) {
    return Promise.resolve(window.mapboxgl);
  }
  if (mapboxLoader) {
    return mapboxLoader;
  }

  mapboxLoader = new Promise((resolve, reject) => {
    const script = document.getElementById('mapbox-gl-js-script') as HTMLScriptElement | null;
    if (script && window.mapboxgl) {
      resolve(window.mapboxgl);
      return;
    }

    const newScript = script || document.createElement('script');
    newScript.id = 'mapbox-gl-js-script';
    newScript.src = MAPBOX_SDK_URL;
    newScript.async = true;
    newScript.onload = () => {
      resolve(window.mapboxgl ?? null);
    };
    newScript.onerror = (error) => {
      reject(error);
    };

    if (!script) {
      document.body.appendChild(newScript);
    }
  });

  return mapboxLoader;
}

function getMapboxToken(): string {
  const env = (globalThis as unknown as { __BRICONOMY_ENV__?: Record<string, string>; MAPBOX_TOKEN?: string }).__BRICONOMY_ENV__;
  const globalToken = (globalThis as unknown as { __BRICONOMY_ENV__?: Record<string, string>; MAPBOX_TOKEN?: string }).MAPBOX_TOKEN;
  const tokenFromEnv = env?.VITE_MAPBOX_TOKEN || globalToken || '';
  const token = tokenFromEnv || DEFAULT_MAPBOX_TOKEN;
  // #COMPLETION_DRIVE: Assuming runtime provides a valid Mapbox token through __BRICONOMY_ENV__.VITE_MAPBOX_TOKEN, MAPBOX_TOKEN, or the supplied default
  // #SUGGEST_VERIFY: Confirm map tiles load successfully when running via start.sh with the provided key injected
  return token;
}

const mapContainerStyle: CSSProperties = {
  width: '100%',
  height: '320px',
  borderRadius: '16px',
  overflow: 'hidden',
  position: 'relative'
};

const fallbackNoticeStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  textAlign: 'center',
  background: 'linear-gradient(135deg, rgba(22, 47, 27, 0.08), rgba(22, 47, 27, 0.02))',
  color: '#153826',
  fontWeight: 600,
  fontSize: '14px'
};

function calculateBoundsFromCoordinates(coordinates: [number, number][]): [[number, number], [number, number]] {
  const lngs = coordinates.map((entry) => entry[0]);
  const lats = coordinates.map((entry) => entry[1]);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  return [[minLng, minLat], [maxLng, maxLat]];
}

function PropertyMap({ locations }: PropertyMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMapInstance | null>(null);
  const markersRef = useRef<MapboxMarkerInstance[]>([]);
  const geocodeCacheRef = useRef<Map<string, [number, number]>>(new Map());
  const token = useMemo(() => getMapboxToken(), []);
  const serializedLocations = useMemo(() => JSON.stringify(locations.map((item) => ({
    id: item.id,
    name: item.name,
    coordinates: item.coordinates ?? null,
    address: item.address || ''
  }))), [locations]);
  const [resolvedLocations, setResolvedLocations] = useState<ResolvedPropertyLocation[]>([]);
  const serializedResolved = useMemo(() => JSON.stringify(resolvedLocations.map((item) => ({
    id: item.id,
    name: item.name,
    address: item.address || '',
    coordinates: item.coordinates
  }))), [resolvedLocations]);

  useEffect(() => {
    if (!locations.length) {
      setResolvedLocations([]);
      return;
    }

    let cancelled = false;

    const resolveLocations = async () => {
      const resolved: ResolvedPropertyLocation[] = [];

      for (const location of locations) {
        if (location.coordinates) {
          resolved.push({ ...location, coordinates: location.coordinates });
          continue;
        }

        if (!token) {
          continue;
        }

        const lookup = (location.address || location.name || '').trim();
        if (!lookup) {
          continue;
        }

        let coords = geocodeCacheRef.current.get(lookup) ?? null;
        if (!coords) {
          try {
            const response = await fetch(`${GEOCODE_ENDPOINT}${encodeURIComponent(lookup)}.json?access_token=${token}&limit=1`);
            if (response.ok) {
              const data = await response.json() as { features?: Array<{ center?: [number, number] }> };
              const feature = data.features?.[0];
              if (feature?.center && feature.center.length >= 2) {
                coords = [feature.center[0], feature.center[1]] as [number, number];
                geocodeCacheRef.current.set(lookup, coords);
              }
            }
          } catch (error) {
            console.error('Mapbox geocoding failed for address:', lookup, error);
          }
        }

        if (coords) {
          resolved.push({ ...location, coordinates: coords });
        }
      }

      if (!cancelled) {
        setResolvedLocations(resolved);
      }
    };

    resolveLocations();

    return () => {
      cancelled = true;
    };
  }, [serializedLocations, locations, token]);

  useEffect(() => {
    if (!resolvedLocations.length) {
      return;
    }

    ensureMapboxStyles();

    let cancelled = false;

    const initialiseMap = async () => {
      try {
        const mapbox = await loadMapboxScript();
        if (!mapbox || cancelled || !containerRef.current) {
          return;
        }

        if (!token) {
          console.warn('Mapbox token missing; map will not render.');
          return;
        }

        if (!mapbox.accessToken) {
          mapbox.accessToken = token;
        }

        const firstLocation = resolvedLocations[0];

        if (!mapRef.current) {
          mapRef.current = new mapbox.Map({
            container: containerRef.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: firstLocation.coordinates,
            zoom: 13,
            attributionControl: false
          });
        }

        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];

        resolvedLocations.forEach((location) => {
          const marker = new mapbox.Marker({ color: '#1f7a3a' })
            .setLngLat(location.coordinates);

          if (location.name || location.address) {
            const popupContent = `<strong>${location.name}</strong>${location.address ? `<br/>${location.address}` : ''}`;
            const popup = new mapbox.Popup({ closeButton: false }).setHTML(popupContent);
            marker.setPopup(popup);
          }

          marker.addTo(mapRef.current as MapboxMapInstance);
          markersRef.current.push(marker);
        });

        if (resolvedLocations.length > 1) {
          const bounds = calculateBoundsFromCoordinates(resolvedLocations.map((item) => item.coordinates));
          mapRef.current.fitBounds(bounds, { padding: 48, maxZoom: 15 });
        } else {
          mapRef.current.setCenter(firstLocation.coordinates);
          mapRef.current.setZoom(14);
        }

        mapRef.current.resize();
      } catch (error) {
        console.error('Failed to initialise Mapbox map', error);
      }
    };

    initialiseMap();

    return () => {
      cancelled = true;
    };
  }, [serializedResolved, resolvedLocations, token]);

  useEffect(() => {
    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const hasToken = Boolean(token);
  const hasResolvedLocations = resolvedLocations.length > 0;
  const awaitingGeocode = locations.length > 0 && !hasResolvedLocations && hasToken;
  const overlayMessage = !hasToken
    ? 'Map preview unavailable. Provide a Mapbox token to view property locations.'
    : awaitingGeocode
      ? 'Locating properties on the map...'
      : (locations.length > 0 && !hasResolvedLocations)
        ? 'Unable to plot property locations. Please verify address details.'
        : null;

  return (
    <div style={mapContainerStyle}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {overlayMessage && (
        <div style={fallbackNoticeStyle}>
          {overlayMessage}
        </div>
      )}
    </div>
  );
}

export default PropertyMap;
