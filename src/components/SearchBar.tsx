import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, MapPin, Clock, ArrowLeft } from 'lucide-react';
import { CampusLocation } from '@/data/campusLocations';
import { searchLocations, getCategoryDisplayName } from '@/utils/navigation';
import { categoryColors } from '@/data/campusLocations';

interface SearchBarProps {
  onLocationSelect: (location: CampusLocation) => void;
  onClose?: () => void;
  isNavigating?: boolean;
  destination?: CampusLocation | null;
}

export function SearchBar({ onLocationSelect, onClose, isNavigating, destination }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [results, setResults] = useState<CampusLocation[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.trim()) {
      setResults(searchLocations(query));
    } else {
      setResults([]);
    }
  }, [query]);

  const handleFocus = () => {
    setIsExpanded(true);
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
    setQuery(location.name);
    setIsExpanded(false);
    inputRef.current?.blur();
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
              <div className="w-2 h-2 rounded-full bg-primary" />
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
            placeholder="Search PCE Campus"
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
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border"
            >
              {results.length > 0 ? (
                <div className="max-h-80 overflow-y-auto py-2">
                  {results.map((location) => (
                    <button
                      key={location.id}
                      onClick={() => handleSelect(location)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors text-left"
                    >
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${categoryColors[location.category]}20` }}
                      >
                        <MapPin 
                          className="w-5 h-5" 
                          style={{ color: categoryColors[location.category] }} 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{location.name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {getCategoryDisplayName(location.category)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : query ? (
                <div className="py-8 text-center text-muted-foreground">
                  <p>No locations found</p>
                </div>
              ) : (
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Popular Places
                  </div>
                  {searchLocations('').slice(0, 5).map((location) => (
                    <button
                      key={location.id}
                      onClick={() => handleSelect(location)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                        <Clock className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{location.name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {getCategoryDisplayName(location.category)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
