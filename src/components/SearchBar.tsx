import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, MapPin, Clock, ArrowLeft, List, Navigation } from 'lucide-react';
import { CampusLocation, campusLocations, categoryColors } from '@/data/campusLocations';
import { searchLocations, getCategoryDisplayName, formatDistance, calculateDistance } from '@/utils/navigation';

interface SearchBarProps {
  onLocationSelect: (location: CampusLocation) => void;
  onClose?: () => void;
  onShowAllLocations?: () => void;
  isNavigating?: boolean;
  destination?: CampusLocation | null;
  userLocation?: { lat: number; lng: number } | null;
}

export function SearchBar({ 
  onLocationSelect, 
  onClose, 
  onShowAllLocations,
  isNavigating, 
  destination,
  userLocation 
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [results, setResults] = useState<CampusLocation[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.trim()) {
      setResults(searchLocations(query));
    } else {
      // Show all locations when search is empty but expanded
      setResults(campusLocations);
    }
  }, [query]);

  const handleFocus = () => {
    setIsExpanded(true);
    setResults(campusLocations);
  };

  const handleClose = () => {
    setQuery('');
    setResults([]);
    setIsExpanded(false);
    inputRef.current?.blur();
    onClose?.();
  };

  const handleSelect = (location: CampusLocation) => {
    onLocationSelect(location);
    setQuery('');
    setIsExpanded(false);
    inputRef.current?.blur();
  };

  const getDistanceText = (location: CampusLocation) => {
    if (!userLocation) return null;
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      location.lat,
      location.lng
    );
    return formatDistance(distance);
  };

  if (isNavigating && destination) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="search-card mx-4 mt-4 p-4"
      >
        <div className="flex items-center gap-3">
          <button 
            onClick={handleClose}
            className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>Your location</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium mt-1">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              <span>{destination.name}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="relative mx-4 mt-4 z-20">
      <motion.div
        layout
        className={`search-card overflow-hidden ${isExpanded ? 'rounded-2xl' : 'rounded-full'}`}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          {isExpanded ? (
            <button 
              onClick={handleClose}
              className="p-1 rounded-full hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
          ) : (
            <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          )}
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            placeholder="Search buildings, places..."
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
          />
          
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded-full hover:bg-secondary transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}

          {!isExpanded && (
            <button
              onClick={onShowAllLocations}
              className="p-2 -mr-1 rounded-full hover:bg-secondary transition-colors"
              title="View all locations"
            >
              <List className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border"
            >
              {/* View All Button */}
              <button
                onClick={() => {
                  setIsExpanded(false);
                  onShowAllLocations?.();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors text-left border-b border-border"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <List className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-primary">View All {campusLocations.length} Locations</p>
                  <p className="text-xs text-muted-foreground">Browse by category</p>
                </div>
              </button>

              {/* Search Results */}
              <div className="max-h-80 overflow-y-auto py-2">
                {query && results.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <p>No locations found for "{query}"</p>
                  </div>
                ) : (
                  <>
                    <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {query ? `${results.length} Results` : 'All Campus Locations'}
                    </div>
                    {results.map((location) => (
                      <button
                        key={location.id}
                        onClick={() => handleSelect(location)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors text-left"
                      >
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: `${categoryColors[location.category]}15` }}
                        >
                          <MapPin 
                            className="w-5 h-5" 
                            style={{ color: categoryColors[location.category] }} 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{location.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="truncate">{getCategoryDisplayName(location.category)}</span>
                            {userLocation && (
                              <>
                                <span>•</span>
                                <span className="text-primary font-medium flex items-center gap-1">
                                  <Navigation className="w-3 h-3" />
                                  {getDistanceText(location)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
