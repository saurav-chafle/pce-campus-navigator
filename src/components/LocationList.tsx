import { motion } from 'framer-motion';
import { MapPin, Navigation, X, ChevronRight } from 'lucide-react';
import { CampusLocation, categoryColors } from '@/data/campusLocations';
import { getCategoryDisplayName, formatDistance, calculateDistance } from '@/utils/navigation';

interface LocationListProps {
  locations: CampusLocation[];
  userLocation: { lat: number; lng: number } | null;
  onLocationSelect: (location: CampusLocation) => void;
  onClose: () => void;
}

export function LocationList({ 
  locations, 
  userLocation, 
  onLocationSelect, 
  onClose 
}: LocationListProps) {
  // Sort locations by distance if user location is available
  const sortedLocations = userLocation
    ? [...locations].sort((a, b) => {
        const distA = calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
        const distB = calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
        return distA - distB;
      })
    : locations;

  // Group by category
  const groupedLocations = sortedLocations.reduce((acc, location) => {
    if (!acc[location.category]) {
      acc[location.category] = [];
    }
    acc[location.category].push(location);
    return acc;
  }, {} as Record<string, CampusLocation[]>);

  const categoryOrder: CampusLocation['category'][] = [
    'academic', 'facility', 'food', 'recreation', 'religious', 'admin'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-40 bg-background"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border safe-area-top">
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="text-xl font-semibold text-foreground">All Locations</h1>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <div className="px-4 pb-3">
          <p className="text-sm text-muted-foreground">
            {locations.length} places in PCE Campus
          </p>
        </div>
      </div>

      {/* Location List */}
      <div className="overflow-y-auto h-[calc(100vh-120px)] pb-safe">
        {categoryOrder.map((category) => {
          const categoryLocations = groupedLocations[category];
          if (!categoryLocations?.length) return null;

          return (
            <div key={category} className="mb-4">
              <div 
                className="sticky top-0 px-4 py-2 bg-secondary/80 backdrop-blur-sm"
                style={{ borderLeft: `4px solid ${categoryColors[category]}` }}
              >
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  {getCategoryDisplayName(category)}
                </h2>
              </div>

              <div>
                {categoryLocations.map((location, index) => {
                  const distance = userLocation
                    ? calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        location.lat,
                        location.lng
                      )
                    : null;

                  return (
                    <motion.button
                      key={location.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => onLocationSelect(location)}
                      className="w-full flex items-center gap-3 px-4 py-4 hover:bg-secondary/50 
                                 transition-colors text-left border-b border-border/50"
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${categoryColors[location.category]}15` }}
                      >
                        <MapPin
                          className="w-6 h-6"
                          style={{ color: categoryColors[location.category] }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{location.name}</p>
                        {location.description && (
                          <p className="text-sm text-muted-foreground truncate">
                            {location.description}
                          </p>
                        )}
                        {distance !== null && (
                          <div className="flex items-center gap-1 mt-1">
                            <Navigation className="w-3 h-3 text-primary" />
                            <span className="text-xs text-primary font-medium">
                              {formatDistance(distance)}
                            </span>
                          </div>
                        )}
                      </div>

                      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
