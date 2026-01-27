import { roadNodes, roadSegments, locationToRoadNode, RoadNode } from '@/data/campusRoads';
import { calculateDistance } from './navigation';

interface Graph {
  [key: string]: { node: string; distance: number }[];
}

// Build adjacency graph from road segments
function buildGraph(): Graph {
  const graph: Graph = {};
  
  // Initialize all nodes
  roadNodes.forEach(node => {
    graph[node.id] = [];
  });
  
  // Add edges (bidirectional)
  roadSegments.forEach(segment => {
    const fromNode = roadNodes.find(n => n.id === segment.from);
    const toNode = roadNodes.find(n => n.id === segment.to);
    
    if (fromNode && toNode) {
      const distance = calculateDistance(fromNode.lat, fromNode.lng, toNode.lat, toNode.lng);
      
      graph[segment.from].push({ node: segment.to, distance });
      graph[segment.to].push({ node: segment.from, distance });
    }
  });
  
  return graph;
}

// Dijkstra's algorithm for shortest path
function dijkstra(graph: Graph, start: string, end: string): string[] {
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>();
  
  // Initialize
  Object.keys(graph).forEach(node => {
    distances[node] = Infinity;
    previous[node] = null;
    unvisited.add(node);
  });
  distances[start] = 0;
  
  while (unvisited.size > 0) {
    // Find unvisited node with smallest distance
    let current: string | null = null;
    let minDist = Infinity;
    unvisited.forEach(node => {
      if (distances[node] < minDist) {
        minDist = distances[node];
        current = node;
      }
    });
    
    if (current === null || current === end) break;
    
    unvisited.delete(current);
    
    // Update neighbors
    graph[current].forEach(neighbor => {
      if (unvisited.has(neighbor.node)) {
        const alt = distances[current!] + neighbor.distance;
        if (alt < distances[neighbor.node]) {
          distances[neighbor.node] = alt;
          previous[neighbor.node] = current;
        }
      }
    });
  }
  
  // Reconstruct path
  const path: string[] = [];
  let current: string | null = end;
  while (current !== null) {
    path.unshift(current);
    current = previous[current];
  }
  
  return path[0] === start ? path : [];
}

// Find nearest road node to a coordinate
function findNearestNode(lat: number, lng: number): RoadNode | null {
  let nearest: RoadNode | null = null;
  let minDistance = Infinity;
  
  roadNodes.forEach(node => {
    const distance = calculateDistance(lat, lng, node.lat, node.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = node;
    }
  });
  
  return nearest;
}

// Generate road-following route between two points
export function generateRoadRoute(
  fromLat: number,
  fromLng: number,
  toLocationId: string
): { lat: number; lng: number }[] {
  const graph = buildGraph();
  
  // Find start node (nearest to user's location)
  const startNode = findNearestNode(fromLat, fromLng);
  if (!startNode) return [];
  
  // Find end node (from location mapping)
  const endNodeId = locationToRoadNode[toLocationId];
  if (!endNodeId) return [];
  
  // Find path using Dijkstra
  const pathNodeIds = dijkstra(graph, startNode.id, endNodeId);
  if (pathNodeIds.length === 0) return [];
  
  // Convert to coordinates
  const route: { lat: number; lng: number }[] = [];
  
  // Add starting point
  route.push({ lat: fromLat, lng: fromLng });
  
  // Add path nodes
  pathNodeIds.forEach(nodeId => {
    const node = roadNodes.find(n => n.id === nodeId);
    if (node) {
      route.push({ lat: node.lat, lng: node.lng });
    }
  });
  
  return route;
}

// Get turn-by-turn directions
export interface DirectionStep {
  instruction: string;
  distance: number;
  point: { lat: number; lng: number };
}

export function getDirections(route: { lat: number; lng: number }[]): DirectionStep[] {
  if (route.length < 2) return [];
  
  const steps: DirectionStep[] = [];
  
  steps.push({
    instruction: 'Start from your location',
    distance: 0,
    point: route[0],
  });
  
  for (let i = 1; i < route.length - 1; i++) {
    const prev = route[i - 1];
    const curr = route[i];
    const next = route[i + 1];
    
    const distance = calculateDistance(prev.lat, prev.lng, curr.lat, curr.lng);
    
    // Calculate turn direction
    const angle1 = Math.atan2(curr.lng - prev.lng, curr.lat - prev.lat);
    const angle2 = Math.atan2(next.lng - curr.lng, next.lat - curr.lat);
    let turnAngle = (angle2 - angle1) * (180 / Math.PI);
    
    // Normalize angle
    while (turnAngle > 180) turnAngle -= 360;
    while (turnAngle < -180) turnAngle += 360;
    
    let instruction = 'Continue straight';
    if (turnAngle > 30) instruction = 'Turn right';
    else if (turnAngle < -30) instruction = 'Turn left';
    else if (turnAngle > 10) instruction = 'Bear right';
    else if (turnAngle < -10) instruction = 'Bear left';
    
    // Check if this is a named location
    const node = roadNodes.find(n => n.lat === curr.lat && n.lng === curr.lng);
    if (node?.name) {
      instruction += ` at ${node.name}`;
    }
    
    steps.push({
      instruction,
      distance: Math.round(distance),
      point: curr,
    });
  }
  
  // Final step
  const lastDistance = calculateDistance(
    route[route.length - 2].lat,
    route[route.length - 2].lng,
    route[route.length - 1].lat,
    route[route.length - 1].lng
  );
  
  steps.push({
    instruction: 'Arrive at destination',
    distance: Math.round(lastDistance),
    point: route[route.length - 1],
  });
  
  return steps;
}
