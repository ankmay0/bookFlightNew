import React, { useState, useEffect, useRef } from 'react';
// import { BACKEND_URL } from '../config';

// Define types for our data structures
interface Price {
  amount: number;
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

const ActivitiesScreen: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [usingDefaultLocation, setUsingDefaultLocation] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  
  // Search-related state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search implementation
  useEffect(() => {
    const handler = setTimeout(() => {
      if (debouncedSearch) {
        searchLocation(debouncedSearch);
      }
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [debouncedSearch]);

  const searchLocation = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        {
          headers: {
            'User-Agent': 'YourAppName/1.0 (your@email.com)' // Required by Nominatim usage policy
          }
        }
      );
      
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
    
    // Fetch activities for the new location
    fetchActivities(newCoords, false, false);
  };

  const fetchActivitiesData = async (coords: { latitude: number; longitude: number }) => {
    const url = `http://localhost:8080/activities?latitude=${coords.latitude}&longitude=${coords.longitude}&radius=1`;
    console.log('GET', url); // verify final URL
    const res = await fetch(url);
    const text = await res.text(); // read body once
    if (!res.ok) {
      console.warn('Activities error:', res.status, text);
      throw new Error(`Failed to fetch activities (HTTP ${res.status})`);
    }
    return JSON.parse(text);
  };

  const fetchActivities = async (coords: { latitude: number; longitude: number }, isRefreshing = false, isFallback = false) => {
    try {
      const data = await fetchActivitiesData(coords);
      
      if (data.length === 0 && !isFallback) {
        // If no activities found and this is not already a fallback, try default location
        setUsingDefaultLocation(true);
        fetchActivities(DEFAULT_COORDINATES, isRefreshing, true);
        return;
      }
      
      setActivities(data);
      setError(null);
      
    } catch (err) {
      // Handle the error with proper type checking
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      
      if (!isFallback) {
        // If error occurs and we haven't tried default location yet
        setUsingDefaultLocation(true);
        fetchActivities(DEFAULT_COORDINATES, isRefreshing, true);
      } else {
        setError(errorMessage);
        alert('Error: ' + errorMessage);
      }
    } finally {
      if (!isFallback) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  const getCurrentLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      }
    });
  };

  const fetchLocationAndActivities = async (isRefreshing = false) => {
    try {
      if (isRefreshing) setRefreshing(true);
      else setLoading(true);

      setUsingDefaultLocation(false);

      // Get current location
      const position = await getCurrentLocation();
      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      setLocation(coords);
      
      // Fetch activities with user's location
      fetchActivities(coords, isRefreshing, false);
    } catch (err) {
      // Handle the error with proper type checking
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      // Use default location if getting location fails
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
    window.open(bookingLink, '_blank');
  };

  const stripHtmlTags = (html: string) => {
    return html ? html.replace(/<[^>]*>/g, '') : 'No description available';
  };

  const renderActivityItem = (item: Activity, index: number) => (
    <div 
      key={item.id}
      className={`w-full sm:w-1/2 p-3 ${index % 2 === 0 ? 'sm:pr-1.5' : 'sm:pl-1.5'}`}
    >
      <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col">
        {item.pictures && item.pictures.length > 0 && (
          <img 
            src={item.pictures[0]} 
            alt={item.name}
            className="w-full h-40 object-cover"
          />
        )}
        
        <div className="p-3 flex flex-col flex-grow">
          <h3 className="font-bold text-gray-800 text-base mb-1 truncate">{item.name}</h3>
          
          {item.shortDescription && (
            <p className="text-gray-500 text-sm mb-2 italic line-clamp-2">
              {item.shortDescription}
            </p>
          )}
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-grow">
            {stripHtmlTags(item.description)}
          </p>
          
          <div className="flex justify-between items-center mt-auto">
            <div>
              <span className="font-bold text-green-600 text-base">
                {item.price.amount} {item.price.currencyCode}
              </span>
            </div>
            
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 rounded text-sm"
              onClick={() => handleBookNow(item.bookingLink)}
            >
              Book
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Finding activities near you...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          {/* Search Bar */}
          <div className="relative flex items-center bg-gray-100 rounded-lg px-3 py-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              className="bg-transparent w-full outline-none text-gray-700"
              placeholder="Search for a location..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setDebouncedSearch(e.target.value);
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') searchLocation(searchQuery);
              }}
            />
            {searchQuery !== '' && (
              <button onClick={() => setSearchQuery('')} className="ml-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Search Results */}
          {showSearchResults && (
            <div className="bg-white border border-gray-200 rounded-md shadow-lg mt-1 absolute left-0 right-0 z-20 max-h-60 overflow-y-auto">
              {isSearching ? (
                <div className="flex items-center px-4 py-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                  <span className="text-gray-700">Searching...</span>
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((result) => (
                  <button
                    key={result.place_id}
                    className="flex items-center w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                    onClick={() => handleLocationSelect(result)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm text-gray-700 truncate">{result.display_name}</span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-700 text-sm">No results found</div>
              )}
            </div>
          )}
          
          {location && (
            <p className="text-xs text-gray-500 mt-1">
              Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              {usingDefaultLocation && ' (Using default location)'}
            </p>
          )}
          {usingDefaultLocation && !location && (
            <p className="text-xs text-gray-500 mt-1">
              Using default location for testing
            </p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 text-center mb-4">
              {usingDefaultLocation 
                ? 'No activities found at default location' 
                : 'No activities found in your area'
              }
            </p>
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              onClick={() => fetchLocationAndActivities()}
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap -mx-3">
            {activities.map((activity, index) => renderActivityItem(activity, index))}
          </div>
        )}
      </div>
      
      {/* Floating Action Button */}
      <button 
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center"
        onClick={() => setMapVisible(true)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      </button>
      
      {/* Map Modal */}
      {mapVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full h-full md:w-5/6 md:h-5/6 flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold text-gray-800">Activity Locations</h2>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setMapVisible(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-grow relative">
              {/* Map implementation would go here */}
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">Map view would be implemented here with a library like Leaflet or Google Maps</p>
              </div>
            </div>
            
            <div className="p-4 border-t flex justify-around bg-gray-50">
              {location && (
                <button className="flex items-center text-sm text-gray-700 bg-white px-3 py-2 rounded shadow">
                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                  Your Location
                </button>
              )}
              <button className="flex items-center text-sm text-gray-700 bg-white px-3 py-2 rounded shadow">
                <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                Activities ({activities.length})
              </button>
              {usingDefaultLocation && (
                <button className="flex items-center text-sm text-gray-700 bg-white px-3 py-2 rounded shadow">
                  <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                  Default Location
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivitiesScreen;