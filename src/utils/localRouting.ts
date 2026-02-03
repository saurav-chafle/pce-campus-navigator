import { calculateDistance } from './navigation';
import { campusPathsData } from '@/data/campusPaths';

export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface LocalStep {
  instruction: string;
  distance: number;
  duration: number;
  point: RoutePoint;
  maneuver?: {
    type: string;
    modifier?: string;
  };
}

export interface LocalRoute {
  coordinates: RoutePoint[];
  distance: number;
  duration: number;
  steps: LocalStep[];
}

interface GraphNode {
  id: string;
  lat: number;
  lng: number;
}

interface GraphEdge {
  from: string;
  to: string;
  distance: number;
  path: RoutePoint[]; // The actual path coordinates between nodes
}

interface Graph {
  nodes: Map<string, GraphNode>;
  edges: Map<string, GraphEdge[]>;
}

// Parse the campus paths data and build the graph
function buildGraphFromGeoJSON(): Graph {
  const nodes = new Map<string, GraphNode>();
  const edges = new Map<string, GraphEdge[]>();
  
  const data = campusPathsData;
  
  if (!data.features) {
    console.error('Invalid campus paths data');
    return { nodes, edges };
  }
  
  // First, extract all unique points from LineStrings to create nodes
  let nodeId = 0;
  const pointToNodeId = new Map<string, string>();
  
  const getNodeId = (lng: number, lat: number): string => {
    // Round coordinates to avoid floating point issues
    const key = `${lng.toFixed(7)},${lat.toFixed(7)}`;
    if (!pointToNodeId.has(key)) {
      const id = `node_${nodeId++}`;
      pointToNodeId.set(key, id);
      nodes.set(id, { id, lat, lng });
    }
    return pointToNodeId.get(key)!;
  };
  
  // Process all LineString features to create edges
  data.features.forEach((feature: any) => {
    if (feature.geometry.type === 'LineString') {
      const coords = feature.geometry.coordinates as [number, number][];
      
      if (coords.length >= 2) {
        // Create nodes for start and end points
        const startCoord = coords[0];
        const endCoord = coords[coords.length - 1];
        
        const startNodeId = getNodeId(startCoord[0], startCoord[1]);
        const endNodeId = getNodeId(endCoord[0], endCoord[1]);
        
        // Also create nodes for intermediate junction points
        coords.forEach(coord => {
          getNodeId(coord[0], coord[1]);
        });
        
        // Calculate total distance of this path segment
        let totalDistance = 0;
        for (let i = 0; i < coords.length - 1; i++) {
          totalDistance += calculateDistance(
            coords[i][1], coords[i][0],
            coords[i + 1][1], coords[i + 1][0]
          );
        }
        
        // Create path points
        const pathPoints: RoutePoint[] = coords.map(c => ({ lat: c[1], lng: c[0] }));
        
        // Add forward edge
        const forwardEdge: GraphEdge = {
          from: startNodeId,
          to: endNodeId,
          distance: totalDistance,
          path: pathPoints,
        };
        
        if (!edges.has(startNodeId)) {
          edges.set(startNodeId, []);
        }
        edges.get(startNodeId)!.push(forwardEdge);
        
        // Add reverse edge (paths are bidirectional)
        const reverseEdge: GraphEdge = {
          from: endNodeId,
          to: startNodeId,
          distance: totalDistance,
          path: [...pathPoints].reverse(),
        };
        
        if (!edges.has(endNodeId)) {
          edges.set(endNodeId, []);
        }
        edges.get(endNodeId)!.push(reverseEdge);
      }
    }
  });
  
  return { nodes, edges };
}

// Find the nearest graph node to a given coordinate
function findNearestNode(graph: Graph, lat: number, lng: number): GraphNode | null {
  let nearestNode: GraphNode | null = null;
  let minDistance = Infinity;
  
  graph.nodes.forEach(node => {
    const dist = calculateDistance(lat, lng, node.lat, node.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearestNode = node;
    }
  });
  
  return nearestNode;
}

// Dijkstra's algorithm for shortest path
function dijkstra(
  graph: Graph,
  startId: string,
  endId: string
): { path: string[]; totalDistance: number } {
  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const unvisited = new Set<string>();
  
  // Initialize
  graph.nodes.forEach((_, nodeId) => {
    distances.set(nodeId, Infinity);
    previous.set(nodeId, null);
    unvisited.add(nodeId);
  });
  distances.set(startId, 0);
  
  while (unvisited.size > 0) {
    // Find unvisited node with smallest distance
    let currentId: string | null = null;
    let minDist = Infinity;
    
    unvisited.forEach(nodeId => {
      const dist = distances.get(nodeId) ?? Infinity;
      if (dist < minDist) {
        minDist = dist;
        currentId = nodeId;
      }
    });
    
    if (currentId === null || currentId === endId) break;
    
    unvisited.delete(currentId);
    
    // Update neighbors
    const nodeEdges = graph.edges.get(currentId) ?? [];
    nodeEdges.forEach(edge => {
      if (unvisited.has(edge.to)) {
        const alt = (distances.get(currentId!) ?? Infinity) + edge.distance;
        if (alt < (distances.get(edge.to) ?? Infinity)) {
          distances.set(edge.to, alt);
          previous.set(edge.to, currentId);
        }
      }
    });
  }
  
  // Reconstruct path
  const path: string[] = [];
  let current: string | null = endId;
  
  while (current !== null) {
    path.unshift(current);
    current = previous.get(current) ?? null;
  }
  
  if (path[0] !== startId) {
    return { path: [], totalDistance: 0 };
  }
  
  return {
    path,
    totalDistance: distances.get(endId) ?? 0,
  };
}

// Get the edge between two nodes
function getEdgeBetween(graph: Graph, fromId: string, toId: string): GraphEdge | null {
  const nodeEdges = graph.edges.get(fromId) ?? [];
  return nodeEdges.find(edge => edge.to === toId) ?? null;
}

// Calculate turn direction between two path segments
function getTurnDirection(
  prevPoint: RoutePoint,
  currentPoint: RoutePoint,
  nextPoint: RoutePoint
): { type: string; modifier?: string } {
  const angle1 = Math.atan2(
    currentPoint.lng - prevPoint.lng,
    currentPoint.lat - prevPoint.lat
  );
  const angle2 = Math.atan2(
    nextPoint.lng - currentPoint.lng,
    nextPoint.lat - currentPoint.lat
  );
  
  let turnAngle = (angle2 - angle1) * (180 / Math.PI);
  
  // Normalize angle to -180 to 180
  while (turnAngle > 180) turnAngle -= 360;
  while (turnAngle < -180) turnAngle += 360;
  
  if (Math.abs(turnAngle) < 15) {
    return { type: 'continue' };
  } else if (turnAngle > 45) {
    return { type: 'turn', modifier: 'right' };
  } else if (turnAngle < -45) {
    return { type: 'turn', modifier: 'left' };
  } else if (turnAngle > 15) {
    return { type: 'turn', modifier: 'slight right' };
  } else if (turnAngle < -15) {
    return { type: 'turn', modifier: 'slight left' };
  }
  
  return { type: 'continue' };
}

// Format maneuver to instruction text
function formatInstruction(maneuver: { type: string; modifier?: string }): string {
  switch (maneuver.type) {
    case 'depart':
      return 'Start walking';
    case 'arrive':
      return 'Arrive at your destination';
    case 'turn':
      if (maneuver.modifier === 'left') return 'Turn left';
      if (maneuver.modifier === 'right') return 'Turn right';
      if (maneuver.modifier === 'slight left') return 'Bear left';
      if (maneuver.modifier === 'slight right') return 'Bear right';
      return 'Continue';
    case 'continue':
      return 'Continue straight';
    default:
      return 'Continue';
  }
}

// Singleton graph instance
let cachedGraph: Graph | null = null;

function getGraph(): Graph {
  if (!cachedGraph) {
    cachedGraph = buildGraphFromGeoJSON();
  }
  return cachedGraph;
}

// Main routing function
export function generateLocalRoute(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): LocalRoute | null {
  const graph = getGraph();
  
  if (graph.nodes.size === 0) {
    console.error('Graph has no nodes');
    return null;
  }
  
  // Find nearest nodes to start and end points
  const startNode = findNearestNode(graph, fromLat, fromLng);
  const endNode = findNearestNode(graph, toLat, toLng);
  
  if (!startNode || !endNode) {
    console.error('Could not find start or end node');
    return null;
  }
  
  // Find shortest path using Dijkstra
  const { path: nodePath, totalDistance } = dijkstra(graph, startNode.id, endNode.id);
  
  if (nodePath.length === 0) {
    console.error('No path found between nodes');
    return null;
  }
  
  // Build the route coordinates from the path
  const coordinates: RoutePoint[] = [];
  const steps: LocalStep[] = [];
  
  // Add exact starting point if far from graph
  const distToStartNode = calculateDistance(fromLat, fromLng, startNode.lat, startNode.lng);
  if (distToStartNode > 5) {
    coordinates.push({ lat: fromLat, lng: fromLng });
  }
  
  // Add start step
  steps.push({
    instruction: 'Start walking',
    distance: 0,
    duration: 0,
    point: { lat: fromLat, lng: fromLng },
    maneuver: { type: 'depart' },
  });
  
  // Build coordinates from edges
  for (let i = 0; i < nodePath.length - 1; i++) {
    const edge = getEdgeBetween(graph, nodePath[i], nodePath[i + 1]);
    if (edge) {
      // Add all path points from this edge
      edge.path.forEach((point, idx) => {
        // Avoid duplicates at junctions
        if (coordinates.length === 0 || 
            coordinates[coordinates.length - 1].lat !== point.lat ||
            coordinates[coordinates.length - 1].lng !== point.lng) {
          coordinates.push(point);
        }
      });
      
      // Add turn instruction if there's a next edge
      if (i < nodePath.length - 2) {
        const nextEdge = getEdgeBetween(graph, nodePath[i + 1], nodePath[i + 2]);
        if (nextEdge && edge.path.length >= 2 && nextEdge.path.length >= 2) {
          const prevPoint = edge.path[edge.path.length - 2];
          const currentPoint = edge.path[edge.path.length - 1];
          const nextPoint = nextEdge.path[1];
          
          const maneuver = getTurnDirection(prevPoint, currentPoint, nextPoint);
          
          if (maneuver.type !== 'continue') {
            steps.push({
              instruction: formatInstruction(maneuver),
              distance: Math.round(edge.distance),
              duration: Math.round(edge.distance / 1.4), // Walking speed ~1.4 m/s
              point: currentPoint,
              maneuver,
            });
          }
        }
      }
    }
  }
  
  // Add exact destination point if far from graph
  const distToEndNode = calculateDistance(toLat, toLng, endNode.lat, endNode.lng);
  if (distToEndNode > 5) {
    coordinates.push({ lat: toLat, lng: toLng });
  }
  
  // Add arrival step
  steps.push({
    instruction: 'Arrive at your destination',
    distance: 0,
    duration: 0,
    point: { lat: toLat, lng: toLng },
    maneuver: { type: 'arrive' },
  });
  
  // Calculate walking time (average speed 1.4 m/s)
  const walkingSpeed = 1.4;
  const duration = totalDistance / walkingSpeed;
  
  return {
    coordinates,
    distance: Math.round(totalDistance),
    duration: Math.round(duration),
    steps,
  };
}

// Fallback direct route when no path is found
export function createDirectLocalRoute(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): LocalRoute {
  const distance = calculateDistance(fromLat, fromLng, toLat, toLng);
  const walkingSpeed = 1.4;
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
        instruction: 'Start walking',
        distance: 0,
        duration: 0,
        point: { lat: fromLat, lng: fromLng },
        maneuver: { type: 'depart' },
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
        maneuver: { type: 'arrive' },
      },
    ],
  };
}
