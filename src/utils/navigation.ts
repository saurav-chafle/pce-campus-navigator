import { CampusLocation, campusLocations } from '@/data/campusLocations';

// Haversine formula to calculate distance between two points
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Format distance for display
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

// Calculate estimated walking time (average speed 5 km/h)
export function calculateWalkingTime(meters: number): string {
  const minutes = Math.ceil(meters / 83.33); // 5 km/h = 83.33 m/min
  if (minutes < 1) return '< 1 min';
  if (minutes === 1) return '1 min';
  return `${minutes} min`;
}

// Find nearest location to a point
export function findNearestLocation(
  lat: number,
  lng: number,
  excludeId?: string
): CampusLocation | null {
  let nearest: CampusLocation | null = null;
  let minDistance = Infinity;

  for (const location of campusLocations) {
    if (excludeId && location.id === excludeId) continue;
    
    const distance = calculateDistance(lat, lng, location.lat, location.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = location;
    }
  }

  return nearest;
}

// Search locations by name
export function searchLocations(query: string): CampusLocation[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return campusLocations;

  return campusLocations.filter(
    (location) =>
      location.name.toLowerCase().includes(normalizedQuery) ||
      location.description?.toLowerCase().includes(normalizedQuery) ||
      location.category.toLowerCase().includes(normalizedQuery)
  );
}

// Generate route waypoints between two points (simplified direct route)
export interface RouteWaypoint {
  lat: number;
  lng: number;
}

export function generateRoute(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): RouteWaypoint[] {
  // For a campus, we'll create intermediate waypoints along campus roads
  // This is a simplified version - a real implementation would use road network data
  
  const waypoints: RouteWaypoint[] = [from];
  
  // Add intermediate points to simulate road following
  const steps = 10;
  const latDiff = (to.lat - from.lat) / steps;
  const lngDiff = (to.lng - from.lng) / steps;
  
  for (let i = 1; i < steps; i++) {
    // Add slight variations to make it look more natural like a road
    const variation = (Math.random() - 0.5) * 0.0001;
    waypoints.push({
      lat: from.lat + latDiff * i + (i % 2 === 0 ? variation : 0),
      lng: from.lng + lngDiff * i + (i % 2 === 1 ? variation : 0),
    });
  }
  
  waypoints.push(to);
  
  return waypoints;
}

// Calculate total route distance
export function calculateRouteDistance(waypoints: RouteWaypoint[]): number {
  let totalDistance = 0;
  
  for (let i = 0; i < waypoints.length - 1; i++) {
    totalDistance += calculateDistance(
      waypoints[i].lat,
      waypoints[i].lng,
      waypoints[i + 1].lat,
      waypoints[i + 1].lng
    );
  }
  
  return totalDistance;
}

// Get category display name
export function getCategoryDisplayName(category: CampusLocation['category']): string {
  const names: Record<CampusLocation['category'], string> = {
    academic: 'Academic',
    facility: 'Facility',
    recreation: 'Recreation',
    religious: 'Religious',
    food: 'Food & Dining',
    admin: 'Administration',
  };
  return names[category];
}
