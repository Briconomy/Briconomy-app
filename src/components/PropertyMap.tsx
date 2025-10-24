import { useEffect, useMemo, useRef, useState } from 'react';
import { loadGoogleMapsApi } from '../utils/googleMaps.ts';

type MapProperty = {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  formattedAddress?: string;
};

type PropertyMapProps = {
  properties: MapProperty[];
  apiKey?: string | null;
  activePropertyId?: string | null;
  onMarkerSelect?: (propertyId: string) => void;
  labels: {
    unavailable: string;
    loading: string;
    noResults: string;
    interactionHint: string;
  };
};

type ActionableProperty = MapProperty & { latitude: number; longitude: number };

type MarkerRecord = Record<string, MarkerInstance | null>;

type GoogleMapInstance = {
  setCenter?: (position: { lat: number; lng: number }) => void;
  setZoom?: (zoom: number) => void;
  fitBounds?: (bounds: LatLngBoundsInstance, padding?: number) => void;
  panTo?: (position: unknown) => void;
  getZoom?: () => number | null | undefined;
};

type MarkerInstance = {
  setMap?: (map: GoogleMapInstance | null) => void;
  addListener?: (event: string, handler: () => void) => void;
  getPosition?: () => unknown;
  setZIndex?: (zIndex: number) => void;
};

type LatLngBoundsInstance = {
  extend?: (position: { lat: number; lng: number }) => void;
};

type InfoWindowInstance = {
  setContent?: (content: string) => void;
  open?: (options: { map: GoogleMapInstance; anchor: MarkerInstance }) => void;
  close?: () => void;
};

type GoogleMapsConstructor<T> = new (...args: unknown[]) => T;

type GoogleMapsApiShape = {
  Map: GoogleMapsConstructor<GoogleMapInstance>;
  Marker: GoogleMapsConstructor<MarkerInstance>;
  LatLngBounds: GoogleMapsConstructor<LatLngBoundsInstance>;
  InfoWindow: GoogleMapsConstructor<InfoWindowInstance>;
};

function isActionable(property: MapProperty): property is ActionableProperty {
  return typeof property.latitude === 'number' && typeof property.longitude === 'number';
}

function computeCenter(list: ActionableProperty[]): { lat: number; lng: number } {
  if (list.length === 0) {
    return { lat: 0, lng: 0 };
  }
  let latitudeTotal = 0;
  let longitudeTotal = 0;
  for (const item of list) {
    latitudeTotal += item.latitude;
    longitudeTotal += item.longitude;
  }
  return {
    lat: latitudeTotal / list.length,
    lng: longitudeTotal / list.length
  };
}

function PropertyMap({ properties, apiKey, activePropertyId, onMarkerSelect, labels }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapsApiRef = useRef<GoogleMapsApiShape | null>(null);
  const mapInstanceRef = useRef<GoogleMapInstance | null>(null);
  const markersRef = useRef<MarkerRecord>({});
  const infoWindowRef = useRef<InfoWindowInstance | null>(null);
  const [mapsReady, setMapsReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const actionableProperties = useMemo(() => properties.filter(isActionable), [properties]);

  useEffect(() => {
    if (!apiKey) {
      setError(labels.unavailable);
      setMapsReady(false);
      setLoading(false);
      return;
    }
    setError(null);
    if (mapsApiRef.current) {
      setMapsReady(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    loadGoogleMapsApi(apiKey)
      .then((mapsApi) => {
        if (cancelled) {
          return;
        }
        mapsApiRef.current = mapsApi as GoogleMapsApiShape;
        setMapsReady(true);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) {
          return;
        }
        console.error('Google Maps load failed:', err);
        setMapsReady(false);
        setLoading(false);
        setError(labels.unavailable);
      });
    return () => {
      cancelled = true;
    };
  }, [apiKey, labels.unavailable]);

  useEffect(() => {
    if (!mapsReady) {
      return;
    }
    if (!mapsApiRef.current) {
      return;
    }
    if (mapInstanceRef.current) {
      return;
    }
    if (!mapRef.current) {
      return;
    }
    if (actionableProperties.length === 0) {
      return;
    }
    const mapsApi = mapsApiRef.current as GoogleMapsApiShape;
    const initialCenter = computeCenter(actionableProperties);
    const map = new mapsApi.Map(mapRef.current, {
      center: initialCenter,
      zoom: actionableProperties.length === 1 ? 14 : 11,
      disableDefaultUI: true,
      gestureHandling: 'greedy'
    });
    mapInstanceRef.current = map;
    infoWindowRef.current = new mapsApi.InfoWindow();
  }, [mapsReady, actionableProperties]);

  useEffect(() => {
    if (!mapsReady) {
      return;
    }
    const mapInstance = mapInstanceRef.current;
    const mapsApi = mapsApiRef.current as GoogleMapsApiShape;
    if (!mapInstance || !mapsApi) {
      return;
    }

    Object.values(markersRef.current).forEach((marker) => {
      if (marker && typeof marker.setMap === 'function') {
        marker.setMap(null);
      }
    });
    markersRef.current = {};

    if (infoWindowRef.current && typeof infoWindowRef.current.close === 'function') {
      infoWindowRef.current.close();
    }

    if (actionableProperties.length === 0) {
      return;
    }

    const bounds = new mapsApi.LatLngBounds();
    actionableProperties.forEach((property) => {
      const marker = new mapsApi.Marker({
        map: mapInstance,
        position: { lat: property.latitude, lng: property.longitude },
        title: property.name
      });
      marker.addListener('click', () => {
        if (typeof onMarkerSelect === 'function') {
          onMarkerSelect(property.id);
        }
        if (infoWindowRef.current && typeof infoWindowRef.current.setContent === 'function') {
          const locationText = property.formattedAddress ?? property.address ?? '';
          infoWindowRef.current.setContent(`<div class="property-map-infowindow"><strong>${property.name}</strong><div>${locationText}</div></div>`);
          if (typeof infoWindowRef.current.open === 'function') {
            infoWindowRef.current.open({ map: mapInstance, anchor: marker });
          }
        }
      });
      markersRef.current[property.id] = marker;
      if (typeof bounds.extend === 'function') {
        bounds.extend({ lat: property.latitude, lng: property.longitude });
      }
    });

    if (actionableProperties.length === 1) {
      const single = actionableProperties[0];
      if (typeof mapInstance.setCenter === 'function') {
        mapInstance.setCenter({ lat: single.latitude, lng: single.longitude });
      }
      if (typeof mapInstance.setZoom === 'function') {
        mapInstance.setZoom(14);
      }
    } else if (typeof mapInstance.fitBounds === 'function') {
      mapInstance.fitBounds(bounds, 32);
    }
  }, [actionableProperties, mapsReady, onMarkerSelect]);

  useEffect(() => {
    if (!mapsReady) {
      return;
    }
    const mapInstance = mapInstanceRef.current;
    const mapsApi = mapsApiRef.current as GoogleMapsApiShape;
    if (!mapInstance || !mapsApi) {
      return;
    }

    if (!activePropertyId) {
      Object.values(markersRef.current).forEach((marker) => {
        if (marker && typeof marker.setZIndex === 'function') {
          marker.setZIndex(1);
        }
      });
      if (infoWindowRef.current && typeof infoWindowRef.current.close === 'function') {
        infoWindowRef.current.close();
      }
      return;
    }

    const marker = markersRef.current[activePropertyId];
    const target = actionableProperties.find((item) => item.id === activePropertyId);

    Object.entries(markersRef.current).forEach(([id, item]) => {
      if (item && typeof item.setZIndex === 'function') {
        item.setZIndex(id === activePropertyId ? 100 : 1);
      }
    });

    if (marker && typeof marker.getPosition === 'function') {
      const position = marker.getPosition();
      if (position && typeof mapInstance.panTo === 'function') {
        mapInstance.panTo(position);
      }
      if (target && infoWindowRef.current && typeof infoWindowRef.current.setContent === 'function') {
        const locationText = target.formattedAddress ?? target.address ?? '';
        infoWindowRef.current.setContent(`<div class="property-map-infowindow"><strong>${target.name}</strong><div>${locationText}</div></div>`);
        if (typeof infoWindowRef.current.open === 'function') {
          infoWindowRef.current.open({ map: mapInstance, anchor: marker });
        }
      }
      if (typeof mapInstance.setZoom === 'function') {
        const currentZoom = typeof mapInstance.getZoom === 'function' ? mapInstance.getZoom() : null;
        if (!currentZoom || currentZoom < 14) {
          mapInstance.setZoom(14);
        }
      }
    }
  }, [activePropertyId, actionableProperties, mapsReady]);

  const shouldShowPlaceholder = error || !mapsReady || loading || actionableProperties.length === 0;

  let placeholderMessage = '';
  if (error) {
    placeholderMessage = error;
  } else if (!mapsReady || loading) {
    placeholderMessage = labels.loading;
  } else if (actionableProperties.length === 0) {
    placeholderMessage = labels.noResults;
  }

  return (
    <div className="property-map-wrapper">
      <div className={`property-map-container${error ? ' is-unavailable' : ''}`}>
        {shouldShowPlaceholder ? (
          <div className="property-map-placeholder">{placeholderMessage}</div>
        ) : (
          <div ref={mapRef} className="property-map-canvas" />
        )}
      </div>
      {!error && actionableProperties.length > 0 ? (
        <div className="property-map-hint">{labels.interactionHint}</div>
      ) : null}
    </div>
  );
}

export default PropertyMap;
