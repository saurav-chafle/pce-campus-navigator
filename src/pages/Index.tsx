import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { CampusMap } from '@/components/CampusMap';
import { SearchBar } from '@/components/SearchBar';
import { BottomSheet } from '@/components/BottomSheet';
import { QuickCategories } from '@/components/QuickCategories';
import { LocationPermissionModal } from '@/components/LocationPermissionModal';
import { LocationList } from '@/components/LocationList';
import { useGeolocation } from '@/hooks/useGeolocation';
import { CampusLocation, campusLocations } from '@/data/campusLocations';
import { calculateDistance } from '@/utils/navigation';
import { fetchOSRMRoute, createDirectRoute, OSRMStep } from '@/utils/osrmRouting';

const Index = () => {
  const [selectedLocation, setSelectedLocation] = useState<CampusLocation | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CampusLocation['category'] | null>(null);
  const [filteredLocations, setFilteredLocations] = useState<CampusLocation[]>(campusLocations);
  const [isNavigating, setIsNavigating] = useState(false);
  const [route, setRoute] = useState<{ lat: number; lng: number }[] | null>(null);
  const [directions, setDirections] = useState<OSRMStep[]>([]);
  const [distance, setDistance] = useState<number | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showLocationList, setShowLocationList] = useState(false);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  
  const { 
    latitude, 
    longitude, 
    error: locationError, 
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

  // Update route when navigating - using OSRM for road-following routes
  useEffect(() => {
    if (isNavigating && latitude && longitude && selectedLocation) {
      setIsLoadingRoute(true);
      
      // Fetch route from OSRM API (uses OpenStreetMap data)
      fetchOSRMRoute(
        latitude,
        longitude,
        selectedLocation.lat,
        selectedLocation.lng
      ).then((osrmRoute) => {
        if (osrmRoute && osrmRoute.coordinates.length > 0) {
          setRoute(osrmRoute.coordinates);
          setDirections(osrmRoute.steps);
        } else {
          // Fallback to direct route if OSRM fails
          const fallbackRoute = createDirectRoute(
            latitude,
            longitude,
            selectedLocation.lat,
            selectedLocation.lng
          );
          setRoute(fallbackRoute.coordinates);
          setDirections(fallbackRoute.steps);
        }
        setIsLoadingRoute(false);
      }).catch(() => {
        // Fallback to direct route on error
        const fallbackRoute = createDirectRoute(
          latitude,
          longitude,
          selectedLocation.lat,
          selectedLocation.lng
        );
        setRoute(fallbackRoute.coordinates);
        setDirections(fallbackRoute.steps);
        setIsLoadingRoute(false);
      });
    } else if (!isNavigating) {
      setRoute(null);
      setDirections([]);
    }
  }, [isNavigating, latitude, longitude, selectedLocation]);

  const handleLocationSelect = useCallback((location: CampusLocation) => {
    setSelectedLocation(location);
    setIsNavigating(false);
    setShowLocationList(false);
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
    setDirections([]);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSelectedLocation(null);
    setIsNavigating(false);
    setRoute(null);
    setDirections([]);
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
            onShowAllLocations={() => setShowLocationList(true)}
            isNavigating={isNavigating}
            destination={selectedLocation}
            userLocation={userLocation}
          />
          
          {/* Quick Categories */}
          {!isNavigating && !showLocationList && (
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
        directions={directions}
        onStartNavigation={handleStartNavigation}
        onStopNavigation={handleStopNavigation}
        onClose={handleCloseSheet}
      />

      {/* Location List Modal */}
      <AnimatePresence>
        {showLocationList && (
          <LocationList
            locations={campusLocations}
            userLocation={userLocation}
            onLocationSelect={handleLocationSelect}
            onClose={() => setShowLocationList(false)}
          />
        )}
      </AnimatePresence>

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
