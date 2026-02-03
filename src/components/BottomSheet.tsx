import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { MapPin, Navigation, Clock, X, Share, Star, Footprints } from 'lucide-react';
import { CampusLocation, categoryColors } from '@/data/campusLocations';
import { formatDistance, calculateWalkingTime, getCategoryDisplayName } from '@/utils/navigation';
import { DirectionsPanel } from './DirectionsPanel';
import { LocalStep } from '@/utils/localRouting';

interface BottomSheetProps {
  location: CampusLocation | null;
  distance: number | null;
  isNavigating: boolean;
  directions: LocalStep[];
  onStartNavigation: () => void;
  onStopNavigation: () => void;
  onClose: () => void;
}

export function BottomSheet({
  location,
  distance,
  isNavigating,
  directions,
  onStartNavigation,
  onStopNavigation,
  onClose,
}: BottomSheetProps) {
  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 500) {
      onClose();
    }
  };

  const totalDistance = directions.reduce((sum, step) => sum + step.distance, 0);

  return (
    <AnimatePresence>
      {location && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          className="fixed bottom-0 left-0 right-0 z-30 bottom-sheet safe-area-bottom"
        >
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
          </div>

          <div className="px-5 pb-6 max-h-[70vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div 
                    className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: categoryColors[location.category] }}
                  >
                    {getCategoryDisplayName(location.category)}
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-foreground">{location.name}</h2>
                {location.description && (
                  <p className="text-sm text-muted-foreground mt-1">{location.description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-secondary transition-colors -mr-2 -mt-1"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Distance and Time */}
            {distance !== null && (
              <div className="flex items-center gap-4 mb-5 py-3 px-4 bg-secondary rounded-xl">
                <div className="flex items-center gap-2">
                  <Footprints className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{formatDistance(distance)}</span>
                </div>
                <div className="w-px h-4 bg-border" />
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium">{calculateWalkingTime(distance)} walk</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {isNavigating ? (
                <button
                  onClick={onStopNavigation}
                  className="flex-1 nav-button bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  <X className="w-5 h-5" />
                  <span>Stop Navigation</span>
                </button>
              ) : (
                <button
                  onClick={onStartNavigation}
                  className="flex-1 nav-button-primary"
                >
                  <Navigation className="w-5 h-5" />
                  <span>Get Directions</span>
                </button>
              )}
              
              <button className="nav-button-secondary">
                <Share className="w-5 h-5" />
              </button>
              
              <button className="nav-button-secondary">
                <Star className="w-5 h-5" />
              </button>
            </div>

            {/* Directions Panel when navigating */}
            {isNavigating && directions.length > 0 && (
              <DirectionsPanel 
                steps={directions} 
                totalDistance={totalDistance}
                destinationName={location.name}
              />
            )}

            {/* Additional Info when navigating */}
            {isNavigating && distance !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-4 bg-primary/10 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <Navigation className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Following campus roads</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistance(distance)} • {calculateWalkingTime(distance)} remaining
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
