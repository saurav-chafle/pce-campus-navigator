import { calculateDistance } from './navigation';

export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface OSRMStep {
  instruction: string;
  distance: number;
  duration: number;
  point: RoutePoint;
  maneuver?: {
    type: string;
    modifier?: string;
  };
}

export interface OSRMRoute {
  coordinates: RoutePoint[];
  distance: number;
  duration: number;
  steps: OSRMStep[];
}

// Fetch route from OSRM public API (walking profile)
export async function fetchOSRMRoute(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): Promise<OSRMRoute | null> {
  try {
    // OSRM uses lng,lat format
    const url = `https://router.project-osrm.org/route/v1/foot/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson&steps=true`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('OSRM API error:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      console.error('No route found:', data);
      return null;
    }
    
    const route = data.routes[0];
    const coordinates: RoutePoint[] = route.geometry.coordinates.map(
      (coord: [number, number]) => ({
        lat: coord[1],
        lng: coord[0],
      })
    );
    
    // Parse steps from legs
    const steps: OSRMStep[] = [];
    
    // Add start point
    steps.push({
      instruction: 'Start from your location',
      distance: 0,
      duration: 0,
      point: { lat: fromLat, lng: fromLng },
    });
    
    if (route.legs && route.legs.length > 0) {
      route.legs[0].steps.forEach((step: any) => {
        if (step.maneuver) {
          const instruction = formatInstruction(step.maneuver, step.name);
          steps.push({
            instruction,
            distance: Math.round(step.distance),
            duration: Math.round(step.duration),
            point: {
              lat: step.maneuver.location[1],
              lng: step.maneuver.location[0],
            },
            maneuver: {
              type: step.maneuver.type,
              modifier: step.maneuver.modifier,
            },
          });
        }
      });
    }
    
    // Add arrive step if not present
    const lastStep = steps[steps.length - 1];
    if (!lastStep || lastStep.instruction.toLowerCase().indexOf('arrive') === -1) {
      steps.push({
        instruction: 'Arrive at your destination',
        distance: 0,
        duration: 0,
        point: { lat: toLat, lng: toLng },
      });
    }
    
    return {
      coordinates,
      distance: Math.round(route.distance),
      duration: Math.round(route.duration),
      steps,
    };
  } catch (error) {
    console.error('Error fetching OSRM route:', error);
    return null;
  }
}

// Format OSRM maneuver instruction to human-readable text
function formatInstruction(maneuver: any, streetName?: string): string {
  const type = maneuver.type;
  const modifier = maneuver.modifier;
  
  let instruction = '';
  
  switch (type) {
    case 'depart':
      instruction = 'Head';
      if (modifier) instruction += ` ${modifier}`;
      break;
    case 'turn':
      if (modifier === 'left') instruction = 'Turn left';
      else if (modifier === 'right') instruction = 'Turn right';
      else if (modifier === 'slight left') instruction = 'Bear left';
      else if (modifier === 'slight right') instruction = 'Bear right';
      else if (modifier === 'sharp left') instruction = 'Take sharp left';
      else if (modifier === 'sharp right') instruction = 'Take sharp right';
      else instruction = 'Continue';
      break;
    case 'continue':
      instruction = 'Continue straight';
      break;
    case 'new name':
      instruction = 'Continue';
      break;
    case 'merge':
      instruction = 'Merge';
      if (modifier) instruction += ` ${modifier}`;
      break;
    case 'fork':
      if (modifier === 'left') instruction = 'Keep left';
      else if (modifier === 'right') instruction = 'Keep right';
      else instruction = 'Continue at fork';
      break;
    case 'end of road':
      if (modifier === 'left') instruction = 'Turn left at end of road';
      else if (modifier === 'right') instruction = 'Turn right at end of road';
      else instruction = 'Continue at end of road';
      break;
    case 'arrive':
      instruction = 'Arrive at your destination';
      break;
    default:
      instruction = 'Continue';
  }
  
  if (streetName && streetName.length > 0 && type !== 'arrive' && type !== 'depart') {
    instruction += ` onto ${streetName}`;
  }
  
  return instruction;
}

// Fallback route using direct path when OSRM fails
export function createDirectRoute(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): OSRMRoute {
  const distance = calculateDistance(fromLat, fromLng, toLat, toLng);
  const walkingSpeed = 1.4; // m/s average walking speed
  const duration = distance / walkingSpeed;
  
  return {
    coordinates: [
      { lat: fromLat, lng: fromLng },
      { lat: toLat, lng: toLng },
    ],
    distance: Math.round(distance),
    duration: Math.round(duration),
    steps: [
      {
        instruction: 'Start from your location',
        distance: 0,
        duration: 0,
        point: { lat: fromLat, lng: fromLng },
      },
      {
        instruction: 'Walk towards destination',
        distance: Math.round(distance),
        duration: Math.round(duration),
        point: { lat: toLat, lng: toLng },
      },
      {
        instruction: 'Arrive at your destination',
        distance: 0,
        duration: 0,
        point: { lat: toLat, lng: toLng },
      },
    ],
  };
}
