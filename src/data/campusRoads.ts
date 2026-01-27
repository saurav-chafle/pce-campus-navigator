// Campus road network for realistic navigation
// Each road segment connects two points

export interface RoadNode {
  id: string;
  lat: number;
  lng: number;
  name?: string;
}

export interface RoadSegment {
  from: string;
  to: string;
}

// Road junction points on campus
export const roadNodes: RoadNode[] = [
  // Main entrance area
  { id: 'gate', lat: 21.103063, lng: 79.004020, name: 'Main Gate' },
  { id: 'junction1', lat: 21.103200, lng: 79.004500 },
  { id: 'junction2', lat: 21.103400, lng: 79.005000 },
  
  // First year area
  { id: 'junction3', lat: 21.103600, lng: 79.005200 },
  { id: 'fy_building', lat: 21.103415, lng: 79.005001 },
  { id: 'fy_canteen', lat: 21.103954, lng: 79.005062 },
  { id: 'civil_elec', lat: 21.103659, lng: 79.005430 },
  
  // Sports area
  { id: 'sports_junction', lat: 21.102200, lng: 79.004500 },
  { id: 'sports_building', lat: 21.102051, lng: 79.004304 },
  { id: 'first_ground', lat: 21.102249, lng: 79.004838 },
  
  // Central campus
  { id: 'central1', lat: 21.102500, lng: 79.005500 },
  { id: 'central2', lat: 21.102300, lng: 79.006000 },
  { id: 'pce_lake', lat: 21.102662, lng: 79.006276 },
  { id: 'swimming_pool', lat: 21.103705, lng: 79.006245 },
  
  // IT area
  { id: 'it_junction', lat: 21.101800, lng: 79.006200 },
  { id: 'it_garden', lat: 21.101866, lng: 79.006795 },
  { id: 'it_auditorium', lat: 21.101265, lng: 79.005897 },
  { id: 'it_cs_ct', lat: 21.101590, lng: 79.006817 },
  { id: 'saraswati_temple', lat: 21.101881, lng: 79.005989 },
  
  // Library and academic area
  { id: 'library_junction', lat: 21.101600, lng: 79.007500 },
  { id: 'library', lat: 21.101417, lng: 79.007840 },
  { id: 'aids_iot', lat: 21.101714, lng: 79.007636 },
  
  // Canteen and EE area
  { id: 'canteen_junction', lat: 21.102400, lng: 79.007600 },
  { id: 'main_canteen', lat: 21.102479, lng: 79.007738 },
  { id: 'ee_etc_aero', lat: 21.102353, lng: 79.007597 },
  
  // Temple area
  { id: 'temple_road', lat: 21.103200, lng: 79.007000 },
  { id: 'mahadev_temple', lat: 21.103592, lng: 79.007413 },
  
  // MBA and Admin area
  { id: 'mba_junction', lat: 21.102000, lng: 79.008200 },
  { id: 'mba_bba', lat: 21.102040, lng: 79.008184 },
  
  // Mechanical area
  { id: 'mech_junction', lat: 21.101800, lng: 79.008800 },
  { id: 'mechanical_tnp', lat: 21.101812, lng: 79.009012 },
  { id: 'admin_section', lat: 21.101874, lng: 79.009377 },
  { id: 'mech_ground', lat: 21.101601, lng: 79.009004 },
];

// Road connections (bidirectional)
export const roadSegments: RoadSegment[] = [
  // Main entrance to first year area
  { from: 'gate', to: 'junction1' },
  { from: 'junction1', to: 'junction2' },
  { from: 'junction2', to: 'fy_building' },
  { from: 'junction2', to: 'junction3' },
  { from: 'junction3', to: 'fy_canteen' },
  { from: 'junction3', to: 'civil_elec' },
  
  // Sports area connections
  { from: 'junction1', to: 'sports_junction' },
  { from: 'sports_junction', to: 'sports_building' },
  { from: 'sports_junction', to: 'first_ground' },
  
  // Central campus connections
  { from: 'junction2', to: 'central1' },
  { from: 'central1', to: 'central2' },
  { from: 'central2', to: 'pce_lake' },
  { from: 'central1', to: 'swimming_pool' },
  { from: 'civil_elec', to: 'swimming_pool' },
  
  // IT area connections
  { from: 'central2', to: 'it_junction' },
  { from: 'it_junction', to: 'it_garden' },
  { from: 'it_junction', to: 'it_auditorium' },
  { from: 'it_junction', to: 'it_cs_ct' },
  { from: 'it_junction', to: 'saraswati_temple' },
  
  // Library connections
  { from: 'it_cs_ct', to: 'library_junction' },
  { from: 'library_junction', to: 'library' },
  { from: 'library_junction', to: 'aids_iot' },
  
  // Canteen and EE connections
  { from: 'pce_lake', to: 'canteen_junction' },
  { from: 'library_junction', to: 'canteen_junction' },
  { from: 'canteen_junction', to: 'main_canteen' },
  { from: 'canteen_junction', to: 'ee_etc_aero' },
  
  // Temple area
  { from: 'swimming_pool', to: 'temple_road' },
  { from: 'temple_road', to: 'mahadev_temple' },
  { from: 'canteen_junction', to: 'temple_road' },
  
  // MBA and Admin area
  { from: 'canteen_junction', to: 'mba_junction' },
  { from: 'mba_junction', to: 'mba_bba' },
  
  // Mechanical area
  { from: 'mba_junction', to: 'mech_junction' },
  { from: 'mech_junction', to: 'mechanical_tnp' },
  { from: 'mech_junction', to: 'admin_section' },
  { from: 'mech_junction', to: 'mech_ground' },
];

// Map location IDs to nearest road nodes
export const locationToRoadNode: Record<string, string> = {
  'main-gate': 'gate',
  'first-year-canteen': 'fy_canteen',
  'civil-electrical': 'civil_elec',
  'first-year-building': 'fy_building',
  'swimming-pool': 'swimming_pool',
  'sports-building': 'sports_building',
  'first-ground': 'first_ground',
  'pce-lake': 'pce_lake',
  'it-garden': 'it_garden',
  'it-auditorium': 'it_auditorium',
  'it-cs-ct': 'it_cs_ct',
  'saraswati-temple': 'saraswati_temple',
  'library': 'library',
  'aids-iot-robotics': 'aids_iot',
  'main-canteen': 'main_canteen',
  'ee-etc-aero': 'ee_etc_aero',
  'mahadev-temple': 'mahadev_temple',
  'mechanical-tnp': 'mechanical_tnp',
  'admin-section': 'admin_section',
  'mechanical-ground': 'mech_ground',
  'mba-bba': 'mba_bba',
};
