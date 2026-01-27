import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CampusLocation, campusCenter, categoryColors } from '@/data/campusLocations';
import { RouteWaypoint } from '@/utils/navigation';

interface CampusMapProps {
  locations: CampusLocation[];
  selectedLocation: CampusLocation | null;
  userLocation: { lat: number; lng: number } | null;
  route: RouteWaypoint[] | null;
  onLocationSelect: (location: CampusLocation) => void;
  onMapReady?: () => void;
}

export function CampusMap({
  locations,
  selectedLocation,
  userLocation,
  route,
  onLocationSelect,
  onMapReady,
}: CampusMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const [mapType, setMapType] = useState<'satellite' | 'street'>('satellite');

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [campusCenter.lat, campusCenter.lng],
      zoom: 17,
      zoomControl: false,
      attributionControl: false,
    });

    // Satellite tile layer (Google Maps style)
    const satelliteLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 20,
      }
    );

    // Street tile layer
    const streetLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 20,
      }
    );

    // Add default layer
    satelliteLayer.addTo(map);

    // Store layers for switching
    (map as any)._layers_satellite = satelliteLayer;
    (map as any)._layers_street = streetLayer;

    mapInstanceRef.current = map;
    onMapReady?.();

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [onMapReady]);

  // Handle map type changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const satelliteLayer = (map as any)._layers_satellite;
    const streetLayer = (map as any)._layers_street;

    if (mapType === 'satellite') {
      if (map.hasLayer(streetLayer)) map.removeLayer(streetLayer);
      if (!map.hasLayer(satelliteLayer)) satelliteLayer.addTo(map);
    } else {
      if (map.hasLayer(satelliteLayer)) map.removeLayer(satelliteLayer);
      if (!map.hasLayer(streetLayer)) streetLayer.addTo(map);
    }
  }, [mapType]);

  // Add location markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => map.removeLayer(marker));
    markersRef.current.clear();

    // Add markers for each location
    locations.forEach((location) => {
      const color = categoryColors[location.category];
      
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="position: relative; width: 40px; height: 48px;">
            <svg viewBox="0 0 24 24" width="40" height="48" fill="${color}" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="3" fill="white"/>
            </svg>
          </div>
        `,
        iconSize: [40, 48],
        iconAnchor: [20, 48],
      });

      const marker = L.marker([location.lat, location.lng], { icon })
        .addTo(map)
        .on('click', () => onLocationSelect(location));

      markersRef.current.set(location.id, marker);
    });
  }, [locations, onLocationSelect]);

  // Update user location marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }

    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="position: relative;">
            <div class="user-marker-pulse"></div>
            <div class="user-marker"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map);
    }
  }, [userLocation]);

  // Draw route
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing route
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    if (route && route.length > 1) {
      const latlngs: L.LatLngExpression[] = route.map((point) => [point.lat, point.lng]);
      
      routeLayerRef.current = L.polyline(latlngs, {
        color: '#4285F4',
        weight: 6,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // Fit bounds to show the route
      const bounds = L.latLngBounds(latlngs);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [route]);

  // Pan to selected location
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedLocation) return;

    map.flyTo([selectedLocation.lat, selectedLocation.lng], 18, {
      duration: 0.5,
    });
  }, [selectedLocation]);

  const toggleMapType = () => {
    setMapType((prev) => (prev === 'satellite' ? 'street' : 'satellite'));
  };

  const centerOnUser = () => {
    const map = mapInstanceRef.current;
    if (!map || !userLocation) return;
    map.flyTo([userLocation.lat, userLocation.lng], 18, { duration: 0.5 });
  };

  const zoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const zoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Map Controls */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
        <button
          onClick={toggleMapType}
          className="floating-button"
          title={mapType === 'satellite' ? 'Switch to Street View' : 'Switch to Satellite View'}
        >
          {mapType === 'satellite' ? (
            <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </button>
        
        <button onClick={zoomIn} className="floating-button">
          <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        
        <button onClick={zoomOut} className="floating-button">
          <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        
        {userLocation && (
          <button onClick={centerOnUser} className="floating-button">
            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
