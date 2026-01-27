import { useState, useEffect, useCallback } from 'react';
import { CampusMap } from '@/components/CampusMap';
import { SearchBar } from '@/components/SearchBar';
import { BottomSheet } from '@/components/BottomSheet';
import { QuickCategories } from '@/components/QuickCategories';
import { LocationPermissionModal } from '@/components/LocationPermissionModal';
import { useGeolocation } from '@/hooks/useGeolocation';
import { CampusLocation, campusLocations } from '@/data/campusLocations';
import { 
  calculateDistance, 
  generateRoute, 
  RouteWaypoint 
} from '@/utils/navigation';

const Index = () => {
  const [selectedLocation, setSelectedLocation] = useState<CampusLocation | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CampusLocation['category'] | null>(null);
  const [filteredLocations, setFilteredLocations] = useState<CampusLocation[]>(campusLocations);
  const [isNavigating, setIsNavigating] = useState(false);
  const [route, setRoute] = useState<RouteWaypoint[] | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  
  const { 
    latitude, 
    longitude, 
    error: locationError, 
    loading: locationLoading,
    startWatching 
  } = useGeolocation();

  // Check if we need to ask for location permission
  useEffect(() => {
    const hasAskedBefore = localStorage.getItem('location-permission-asked');
    if (!hasAskedBefore && !latitude && !locationError) {
      setShowPermissionModal(true);
    }
  }, [latitude, locationError]);

  // Filter locations by category
  useEffect(() => {
    if (selectedCategory) {
      setFilteredLocations(
        campusLocations.filter((loc) => loc.category === selectedCategory)
      );
    } else {
      setFilteredLocations(campusLocations);
    }
  }, [selectedCategory]);

  // Calculate distance when user location or selected location changes
  useEffect(() => {
    if (latitude && longitude && selectedLocation) {
      const dist = calculateDistance(
        latitude,
        longitude,
        selectedLocation.lat,
        selectedLocation.lng
      );
      setDistance(dist);
    } else {
      setDistance(null);
    }
  }, [latitude, longitude, selectedLocation]);

  // Update route when navigating
  useEffect(() => {
    if (isNavigating && latitude && longitude && selectedLocation) {
      const newRoute = generateRoute(
        { lat: latitude, lng: longitude },
        { lat: selectedLocation.lat, lng: selectedLocation.lng }
      );
      setRoute(newRoute);
    } else if (!isNavigating) {
      setRoute(null);
    }
  }, [isNavigating, latitude, longitude, selectedLocation]);

  const handleLocationSelect = useCallback((location: CampusLocation) => {
    setSelectedLocation(location);
    setIsNavigating(false);
  }, []);

  const handleCategorySelect = useCallback((category: CampusLocation['category']) => {
    setSelectedCategory((prev) => (prev === category ? null : category));
  }, []);

  const handleStartNavigation = useCallback(() => {
    if (!latitude || !longitude) {
      setShowPermissionModal(true);
      return;
    }
    setIsNavigating(true);
  }, [latitude, longitude]);

  const handleStopNavigation = useCallback(() => {
    setIsNavigating(false);
    setRoute(null);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSelectedLocation(null);
    setIsNavigating(false);
    setRoute(null);
  }, []);

  const handleRequestPermission = useCallback(() => {
    localStorage.setItem('location-permission-asked', 'true');
    setShowPermissionModal(false);
    startWatching();
  }, [startWatching]);

  const handleSkipPermission = useCallback(() => {
    localStorage.setItem('location-permission-asked', 'true');
    setShowPermissionModal(false);
  }, []);

  const userLocation = latitude && longitude ? { lat: latitude, lng: longitude } : null;

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      {/* Map */}
      <div className="flex-1 relative">
        <CampusMap
          locations={filteredLocations}
          selectedLocation={selectedLocation}
          userLocation={userLocation}
          route={route}
          onLocationSelect={handleLocationSelect}
        />

        {/* Search Bar - positioned over the map */}
        <div className="absolute top-0 left-0 right-0 safe-area-top">
          <SearchBar
            onLocationSelect={handleLocationSelect}
            onClose={handleCloseSheet}
            isNavigating={isNavigating}
            destination={selectedLocation}
          />
          
          {/* Quick Categories */}
          {!isNavigating && (
            <QuickCategories
              onCategorySelect={handleCategorySelect}
              selectedCategory={selectedCategory}
            />
          )}
        </div>
      </div>

      {/* Bottom Sheet */}
      <BottomSheet
        location={selectedLocation}
        distance={distance}
        isNavigating={isNavigating}
        onStartNavigation={handleStartNavigation}
        onStopNavigation={handleStopNavigation}
        onClose={handleCloseSheet}
      />

      {/* Location Permission Modal */}
      <LocationPermissionModal
        isOpen={showPermissionModal}
        onRequestPermission={handleRequestPermission}
        onSkip={handleSkipPermission}
      />
    </div>
  );
};

export default Index;
