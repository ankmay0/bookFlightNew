import React, { useState, useEffect, useRef } from 'react';

// Google Maps type declarations
declare global {
  interface Window {
    google: any;
  }
}

// Define types for our data structures
interface Price {
  amount: string;
  currencyCode: string;
}

interface GeoCode {
  latitude: string;
  longitude: string;
}

interface Activity {
  id: string;
  name: string;
  shortDescription?: string;
  description: string;
  price: Price;
  bookingLink: string;
  pictures: string[];
  geoCode: GeoCode;
  category?: string;
  rating?: number;
  duration?: string;
}

interface SearchResult {
  place_id: string;
  lat: string;
  lon: string;
  display_name: string;
}

// Default coordinates for testing (Barcelona)
const DEFAULT_COORDINATES = {
  latitude: 41.39715,
  longitude: 2.160873
};

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = 'AIzaSyC0DU0EE254dfgrw_TWxrBgmslLTnFUv4M';

const ActivitiesScreen: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [usingDefaultLocation, setUsingDefaultLocation] = useState(false);

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Search-related state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Google Maps refs - using any to avoid type issues
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All Activities', icon: '🎯' },
    { id: 'adventure', name: 'Adventure', icon: '🧗' },
    { id: 'culture', name: 'Culture', icon: '🏛️' },
    { id: 'food', name: 'Food & Drink', icon: '🍴' },
    { id: 'nature', name: 'Nature', icon: '🌳' },
    { id: 'sports', name: 'Sports', icon: '⚽' }
  ];

  // Load Google Maps API
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      setIsGoogleMapsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry,places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsGoogleMapsLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Google Maps API');
      setError('Failed to load maps. Please check your connection.');
    };
    document.head.appendChild(script);

    return () => {
      clearMarkers();
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
      }
    };
  }, []);

  // Debounce search implementation
  useEffect(() => {
    const handler = setTimeout(() => {
      if (debouncedSearch) {
        searchLocation(debouncedSearch);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [debouncedSearch]);

  const searchLocation = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setSearchResults(data);
      setShowSearchResults(true);
    } catch (error) {
      alert('Error: Failed to search location');
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocationSelect = (result: SearchResult) => {
    const newCoords = {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon)
    };

    setLocation(newCoords);
    setUsingDefaultLocation(false);
    setSearchQuery(result.display_name);
    setShowSearchResults(false);
    fetchActivities(newCoords, false, false);
  };

  const fetchActivitiesData = async (coords: { latitude: number; longitude: number }) => {
    const url = `http://localhost:8080/activities?latitude=${coords.latitude}&longitude=${coords.longitude}&radius=1`;
    console.log('Fetching activities from:', url);

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch activities (HTTP ${res.status})`);
    }

    const data = await res.json();
    return Array.isArray(data) ? data : (data.data || []);
  };

  const fetchActivities = async (coords: { latitude: number; longitude: number }, isRefreshing = false, isFallback = false) => {
    try {
      const items = await fetchActivitiesData(coords);

      if (items.length === 0 && !isFallback) {
        setUsingDefaultLocation(true);
        await fetchActivities(DEFAULT_COORDINATES, isRefreshing, true);
        return;
      }

      // Add mock categories and ratings for demonstration
      const enhancedItems = items.map((item: Activity, index: number) => ({
        ...item,
        category: categories[(index % (categories.length - 1)) + 1].id,
        rating: Math.random() * 2 + 3,
        duration: `${Math.floor(Math.random() * 6) + 2} hours`
      }));

      setActivities(enhancedItems);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';

      if (!isFallback) {
        setUsingDefaultLocation(true);
        await fetchActivities(DEFAULT_COORDINATES, isRefreshing, true);
      } else {
        setError(errorMessage);
        console.error('Error fetching activities:', errorMessage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getCurrentLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      }
    });
  };

  const fetchLocationAndActivities = async (isRefreshing = false) => {
    try {
      if (isRefreshing) setRefreshing(true);
      else setLoading(true);

      setUsingDefaultLocation(false);
      const position = await getCurrentLocation();
      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      setLocation(coords);
      fetchActivities(coords, isRefreshing, false);
    } catch (err) {
      setUsingDefaultLocation(true);
      fetchActivities(DEFAULT_COORDINATES, isRefreshing, true);
    }
  };

  useEffect(() => {
    fetchLocationAndActivities();
  }, []);

  const handleRefresh = () => {
    fetchLocationAndActivities(true);
  };

  const handleBookNow = (bookingLink: string) => {
    window.open(bookingLink, '_blank', 'noopener,noreferrer');
  };

  const stripHtmlTags = (html?: string) => {
    return html ? html.replace(/<[^>]*>/g, '') : 'No description available';
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Filter activities by category
  const filteredActivities = selectedCategory === 'all'
    ? activities
    : activities.filter(activity => activity.category === selectedCategory);

  // Google Maps functions
  const initMap = () => {
    if (!mapElRef.current || !window.google) return;

    const centerCoords = location || DEFAULT_COORDINATES;
    const center = new window.google.maps.LatLng(centerCoords.latitude, centerCoords.longitude);

    // Industry standard map options
    mapRef.current = new window.google.maps.Map(mapElRef.current, {
      center: center,
      zoom: 13,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU,
        position: window.google.maps.ControlPosition.TOP_RIGHT
      },
      streetViewControl: true,
      streetViewControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_BOTTOM
      },
      fullscreenControl: true,
      fullscreenControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_BOTTOM
      },
      zoomControl: true,
      zoomControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_CENTER
      },
      scaleControl: true,
      styles: [
        {
          featureType: 'poi.business',
          stylers: [{ visibility: 'off' }]
        },
        {
          featureType: 'transit',
          elementType: 'labels.icon',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    addUserMarker(centerCoords);
  };

  const addUserMarker = (coords: { latitude: number; longitude: number }) => {
    if (!mapRef.current || !window.google) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
    }

    userMarkerRef.current = new window.google.maps.Marker({
      position: new window.google.maps.LatLng(coords.latitude, coords.longitude),
      map: mapRef.current,
      title: 'Your Location',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2
      },
      zIndex: 1000
    });
  };

  const clearMarkers = () => {
    markersRef.current.forEach((marker: any) => marker.setMap(null));
    markersRef.current = [];
  };

const addActivityMarkers = () => {
  if (!mapRef.current || !window.google || filteredActivities.length === 0) return;

  clearMarkers();

  const bounds = new window.google.maps.LatLngBounds();
  let hasValidActivities = false;

  // First pass: extend bounds for all valid activities
  filteredActivities.forEach((activity: Activity) => {
    const lat = parseFloat(activity.geoCode?.latitude ?? '');
    const lon = parseFloat(activity.geoCode?.longitude ?? '');
    if (Number.isNaN(lat) || Number.isNaN(lon)) return;

    const position = new window.google.maps.LatLng(lat, lon);
    bounds.extend(position);
    hasValidActivities = true;
  });

  // If no valid activities found, center on user location
  if (!hasValidActivities) {
    const centerCoords = location || DEFAULT_COORDINATES;
    const center = new window.google.maps.LatLng(centerCoords.latitude, centerCoords.longitude);
    mapRef.current.setCenter(center);
    mapRef.current.setZoom(13);
    return;
  }

  // Create markers after bounds are calculated
  filteredActivities.forEach((activity: Activity) => {
    const lat = parseFloat(activity.geoCode?.latitude ?? '');
    const lon = parseFloat(activity.geoCode?.longitude ?? '');
    if (Number.isNaN(lat) || Number.isNaN(lon)) return;

    const position = new window.google.maps.LatLng(lat, lon);

    // Create marker
    const marker = new window.google.maps.Marker({
      position: position,
      map: mapRef.current,
      title: activity.name,
      icon: {
        url: 'data:image/svg+xml;base64,' + btoa(`
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <path fill="#EA4335" d="M20 0C12.27 0 6 6.27 6 14c0 10.5 14 26 14 26s14-15.5 14-26C34 6.27 27.73 0 20 0zm0 20c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
            <circle cx="20" cy="14" r="4" fill="#FFFFFF"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 40)
      }
    });

    // Info window code remains the same...
    const infoWindow = new window.google.maps.InfoWindow({
      maxWidth: 350,
      maxHeight: 450
    });

    const imageHtml = activity.pictures && activity.pictures.length > 0
      ? `<img src="${activity.pictures[0]}" alt="${activity.name}" class="w-full h-32 object-cover rounded-t-lg mb-3" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
         <div class="w-full h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-t-lg mb-3 flex items-center justify-center text-gray-500 hidden">
           <div class="text-center">
             <svg class="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
             </svg>
             <span class="text-sm">No Image Available</span>
           </div>
         </div>`
      : `<div class="w-full h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-t-lg mb-3 flex items-center justify-center text-gray-500">
           <div class="text-center">
             <svg class="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
             </svg>
             <span class="text-sm">No Image Available</span>
           </div>
         </div>`;

    marker.addListener('click', () => {
      infoWindow.setContent(`
        <div class="max-w-sm bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
          ${imageHtml}
          <div class="p-4">
            <h3 class="font-bold text-lg text-gray-900 mb-2 leading-tight">${activity.name}</h3>
            ${activity.shortDescription ? `<p class="text-gray-600 text-sm mb-3 leading-relaxed">${stripHtmlTags(activity.shortDescription)}</p>` : ''}
            
            <div class="flex justify-between items-center mb-3">
              <span class="font-bold text-green-600 text-lg">${activity.price.amount} ${activity.price.currencyCode}</span>
              ${activity.rating ? `<span class="flex items-center text-sm text-gray-600"><span class="text-yellow-400 mr-1">⭐</span> ${activity.rating.toFixed(1)}</span>` : ''}
            </div>
            
            ${activity.duration ? `<p class="text-xs text-gray-500 mb-3"><span class="font-medium">Duration:</span> ${activity.duration}</p>` : ''}
            
            <button onclick="window.open('${activity.bookingLink}', '_blank')" 
                    class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm shadow-md">
              Book Now
            </button>
          </div>
        </div>
      `);

      markersRef.current.forEach((m: any) => {
        if (m.infoWindow) {
          m.infoWindow.close();
        }
      });
      marker.infoWindow = infoWindow;
      infoWindow.open(mapRef.current, marker);
    });

    markersRef.current.push(marker);
  });

  // Optimize zoom level based on number of activities and area coverage
  if (hasValidActivities) {
    // Add padding for better view
    const padding = {
      top: 80,
      right: 80,
      bottom: 80,
      left: 80
    };

    // Fit bounds with padding
    mapRef.current.fitBounds(bounds, padding);

    // Add listener to prevent excessive zoom for clustered markers
    const listener = window.google.maps.event.addListener(mapRef.current, 'bounds_changed', () => {
      const currentZoom = mapRef.current.getZoom();
      
      // Set maximum zoom based on number of activities
      let maxZoom = 15;
      if (filteredActivities.length === 1) {
        maxZoom = 16; // Closer zoom for single activity
      } else if (filteredActivities.length <= 3) {
        maxZoom = 14; // Moderate zoom for few activities
      } else {
        maxZoom = 13; // Wider view for many activities
      }

      // Prevent excessive zoom for single marker or very close markers
      if (currentZoom > maxZoom) {
        mapRef.current.setZoom(maxZoom);
      }

      // Remove listener after first adjustment
      window.google.maps.event.removeListener(listener);
    });

    // Also set a timeout as fallback
    setTimeout(() => {
      const currentZoom = mapRef.current.getZoom();
      if (currentZoom > 18) {
        mapRef.current.setZoom(16);
      }
    }, 1000);
  }
};

  // Initialize map when Google Maps is loaded
  useEffect(() => {
    if (isGoogleMapsLoaded && viewMode === 'map' && mapElRef.current && !mapRef.current) {
      initMap();
    }
  }, [isGoogleMapsLoaded, viewMode]);

  // Update markers when activities or location change
  useEffect(() => {
    if (viewMode === 'map' && mapRef.current && isGoogleMapsLoaded) {
      if (location) addUserMarker(location);
      addActivityMarkers();
    }
  }, [filteredActivities, location, viewMode, isGoogleMapsLoaded]);

  // Ensure map is properly sized when switching to map view
  useEffect(() => {
    if (viewMode === 'map' && mapRef.current && window.google) {
      setTimeout(() => {
        window.google.maps.event.trigger(mapRef.current, 'resize');
        // Re-center map after resize
        if (location) {
          const center = new window.google.maps.LatLng(location.latitude, location.longitude);
          mapRef.current.setCenter(center);
        }
      }, 100);
    }
  }, [viewMode]);

  const renderActivityItem = (item: Activity) => (
    <div key={item.id} className="group bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-200">
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={item.pictures?.[0] || '/api/placeholder/400/300'}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Category Badge */}
        <div className="absolute top-3 left-3 bg-white/90 rounded-full px-3 py-1">
          <span className="text-sm font-semibold text-gray-800 capitalize">
            {categories.find(cat => cat.id === item.category)?.icon} {item.category}
          </span>
        </div>

        {/* Price Badge */}
        <div className="absolute top-3 right-3 bg-green-500 text-white rounded-lg px-3 py-2 shadow-md">
          <span className="font-bold text-lg">{item.price.amount}</span>
          <span className="text-sm ml-1">{item.price.currencyCode}</span>
        </div>

        {/* Rating */}
        <div className="absolute bottom-3 left-3 bg-white/90 rounded-lg px-3 py-1">
          {item.rating && renderStars(item.rating)}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">
          {item.name}
        </h3>

        {item.shortDescription && (
          <p className="text-gray-600 text-sm mb-3 italic line-clamp-2">
            {item.shortDescription}
          </p>
        )}

        <p className="text-gray-700 text-sm mb-4 line-clamp-3">
          {stripHtmlTags(item.description)}
        </p>

        {/* Meta Information */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {item.duration}
          </span>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {parseFloat(item.geoCode.latitude).toFixed(4)}, {parseFloat(item.geoCode.longitude).toFixed(4)}
          </span>
        </div>

        <button
          onClick={() => handleBookNow(item.bookingLink)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          Book Now
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Discovering Amazing Activities</h2>
        <p className="text-gray-600">We're finding the best experiences near you...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <div className="flex items-center bg-white rounded-lg border border-gray-300 px-3 py-2">
                  <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-500"
                    placeholder="Search for a city or location..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setDebouncedSearch(e.target.value);
                    }}
                    onFocus={() => searchQuery && setShowSearchResults(true)}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="ml-2 p-1 hover:bg-gray-100 rounded">
                      <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Search Results */}
                {showSearchResults && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 overflow-hidden z-50">
                    {isSearching ? (
                      <div className="flex items-center justify-center px-4 py-3">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                        <span className="ml-2 text-gray-600">Searching...</span>
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((result) => (
                        <button
                          key={result.place_id}
                          className="flex items-center w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-200 last:border-b-0"
                          onClick={() => handleLocationSelect(result)}
                        >
                          <svg className="h-4 w-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-gray-700 text-sm truncate">{result.display_name}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-center text-gray-500 text-sm">
                        No locations found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                title="Refresh activities"
              >
                <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

              <div className="bg-gray-100 rounded-lg p-1 flex">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 rounded ${viewMode === 'map' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Location Info */}
          {location && (
            <div className="mt-3 flex items-center text-sm text-gray-600">
              <svg className="h-4 w-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Showing activities near your location
              {usingDefaultLocation && ' (Using default location)'}
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* LIST VIEW */}
        <div className={viewMode === 'list' ? 'block' : 'hidden'}>
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">No Activities Found</h3>
              <p className="text-gray-600 mb-4">
                {usingDefaultLocation
                  ? "No activities found at the default location."
                  : "No activities found in your area."
                }
              </p>
              <button
                onClick={handleRefresh}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Search Again
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {filteredActivities.length} Activity{filteredActivities.length !== 1 ? 'ies' : ''} Found
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredActivities.map(renderActivityItem)}
              </div>
            </>
          )}
        </div>

        {/* MAP VIEW - Enhanced with Images */}
        <div className={viewMode === 'map' ? 'block' : 'hidden'}>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-300" style={{ height: '75vh', minHeight: '600px' }}>
            {!isGoogleMapsLoaded ? (
              <div className="flex items-center justify-center h-full bg-gray-50">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Loading Interactive Map</h3>
                  <p className="text-gray-600">Discovering amazing activities near you...</p>
                </div>
              </div>
            ) : (
              <>
                <div ref={mapElRef} className="w-full h-full" />

               

                {/* Enhanced Results Summary */}
                <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-4 border border-gray-200">
                  <div className="text-base font-semibold text-gray-900 mb-1">
                    {filteredActivities.length} Activity{filteredActivities.length !== 1 ? 'ies' : ''} Found
                  </div>
                  <div className="text-xs text-gray-600">
                    Click on markers for details and images
                  </div>
                </div>

                {/* Quick Actions Panel */}
                <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-3 border border-gray-200">
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleRefresh}
                      className="p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Refresh activities"
                    >
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        if (location && mapRef.current) {
                          const center = new window.google.maps.LatLng(location.latitude, location.longitude);
                          mapRef.current.setCenter(center);
                          mapRef.current.setZoom(13);
                        }
                      }}
                      className="p-2 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                      title="Center on my location"
                    >
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ActivitiesScreen;