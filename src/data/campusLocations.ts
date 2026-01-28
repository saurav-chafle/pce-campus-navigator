export interface CampusLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: 'academic' | 'facility' | 'recreation' | 'religious' | 'food' | 'admin';
  description?: string;
  icon?: string;
}

export const campusLocations: CampusLocation[] = [
  {
    id: 'main-gate',
    name: 'PCE Main Gate',
    lat: 21.103063,
    lng: 79.004020,
    category: 'facility',
    description: 'Main entrance to the campus',
  },
  {
    id: 'first-year-canteen',
    name: 'First Year Canteen',
    lat: 21.103954,
    lng: 79.005062,
    category: 'food',
    description: 'Canteen for first year students',
  },
  {
    id: 'civil-electrical',
    name: 'Civil/Electrical Department',
    lat: 21.103659,
    lng: 79.005430,
    category: 'academic',
    description: 'Civil and Electrical Engineering Building',
  },
  {
    id: 'first-year-building',
    name: 'First Year Building',
    lat: 21.103415,
    lng: 79.005001,
    category: 'academic',
    description: 'Building for first year students',
  },
  {
    id: 'swimming-pool',
    name: 'Swimming Pool',
    lat: 21.103705,
    lng: 79.006245,
    category: 'recreation',
    description: 'College swimming pool',
  },
  {
    id: 'sports-building',
    name: 'Sports Building',
    lat: 21.102051,
    lng: 79.004304,
    category: 'recreation',
    description: 'Sports and athletics facility',
  },
  {
    id: 'first-ground',
    name: 'First Ground',
    lat: 21.102249,
    lng: 79.004838,
    category: 'recreation',
    description: 'Main sports ground',
  },
  {
    id: 'pce-lake',
    name: 'PCE Lake',
    lat: 21.102662,
    lng: 79.006276,
    category: 'recreation',
    description: 'Beautiful lake within campus',
  },
  {
    id: 'it-garden',
    name: 'IT Garden',
    lat: 21.101866,
    lng: 79.006795,
    category: 'recreation',
    description: 'Garden near IT department',
  },
  {
    id: 'it-auditorium',
    name: 'IT Auditorium',
    lat: 21.101265,
    lng: 79.005897,
    category: 'facility',
    description: 'Auditorium for events and seminars',
  },
  {
    id: 'it-cs-ct',
    name: 'IT/CS/CT Department',
    lat: 21.101590,
    lng: 79.006817,
    category: 'academic',
    description: 'Information Technology, Computer Science and CT Building',
  },
  {
    id: 'saraswati-temple',
    name: 'Saraswati Temple',
    lat: 21.101881,
    lng: 79.005989,
    category: 'religious',
    description: 'Temple dedicated to Goddess Saraswati',
  },
  {
    id: 'library',
    name: 'Library',
    lat: 21.101417,
    lng: 79.007840,
    category: 'academic',
    description: 'Central library with vast collection',
  },
  {
    id: 'aids-iot-robotics',
    name: 'AIDS/IOT/Robotics',
    lat: 21.101714,
    lng: 79.007636,
    category: 'academic',
    description: 'AI, Data Science, IoT and Robotics Lab',
  },
  {
    id: 'main-canteen',
    name: 'Main Canteen',
    lat: 21.102479,
    lng: 79.007738,
    category: 'food',
    description: 'Main college canteen',
  },
  {
    id: 'ee-etc-aero',
    name: 'EE/ETC/AERO',
    lat: 21.102353,
    lng: 79.007597,
    category: 'academic',
    description: 'Electronics, ETC and Aerospace Department',
  },
  {
    id: 'mahadev-temple',
    name: 'Mahadev Temple',
    lat: 21.103592,
    lng: 79.007413,
    category: 'religious',
    description: 'Temple dedicated to Lord Shiva',
  },
  {
    id: 'mechanical-tnp',
    name: 'Mechanical & T&P',
    lat: 21.101812,
    lng: 79.009012,
    category: 'academic',
    description: 'Mechanical Engineering and Training & Placement',
  },
  {
    id: 'admin-section',
    name: 'Admin Section',
    lat: 21.101874,
    lng: 79.009377,
    category: 'admin',
    description: 'Administrative office building',
  },
  {
    id: 'mechanical-ground',
    name: 'Mechanical Ground',
    lat: 21.101601,
    lng: 79.009004,
    category: 'recreation',
    description: 'Ground near mechanical department',
  },
  {
    id: 'mba-bba',
    name: 'MBA/BBA',
    lat: 21.102040,
    lng: 79.008184,
    category: 'academic',
    description: 'Business Administration Building',
  },
  {
    id: 'architecture',
    name: 'Architecture',
    lat: 21.100782,
    lng: 79.013313,
    category: 'academic',
    description: 'Architecture Department',
  },
  {
    id: 'architecture-canteen',
    name: 'Architecture Canteen',
    lat: 21.100698,
    lng: 79.013856,
    category: 'food',
    description: 'Canteen near Architecture building',
  },
  {
    id: 'main-auditorium',
    name: 'Main Auditorium PCE',
    lat: 21.100057,
    lng: 79.014895,
    category: 'facility',
    description: 'Main college auditorium for major events',
  },
  {
    id: 'biotech',
    name: 'Biotech',
    lat: 21.099346,
    lng: 79.016460,
    category: 'academic',
    description: 'Biotechnology Department',
  },
  {
    id: 'chemical-technology',
    name: 'Chemical Technology',
    lat: 21.099346,
    lng: 79.016460,
    category: 'academic',
    description: 'Chemical Technology Department',
  },
  {
    id: 'back-gate',
    name: 'Back Gate',
    lat: 21.099573,
    lng: 79.019126,
    category: 'facility',
    description: 'Back entrance to the campus',
  },
];

// Campus center coordinates (updated to cover new locations)
export const campusCenter = {
  lat: 21.101500,
  lng: 79.010000,
};

// Campus bounds (expanded to include new locations)
export const campusBounds = {
  north: 21.104500,
  south: 21.098500,
  east: 79.020000,
  west: 79.003500,
};

// Category colors for markers
export const categoryColors: Record<CampusLocation['category'], string> = {
  academic: '#4285F4',
  facility: '#34A853',
  recreation: '#FBBC04',
  religious: '#EA4335',
  food: '#FF6D00',
  admin: '#9C27B0',
};

// Category icons
export const categoryIcons: Record<CampusLocation['category'], string> = {
  academic: 'school',
  facility: 'building',
  recreation: 'park',
  religious: 'church',
  food: 'utensils',
  admin: 'briefcase',
};
