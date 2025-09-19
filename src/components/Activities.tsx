import React, { useState, useEffect, useRef } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import Style from 'ol/style/Style';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Icon from 'ol/style/Icon';

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

// Replace with programmatic OAuth token retrieval in production
const token = 'yALqqbAYeq2A8T6UG4g6tLrwQfOe';

// Optional identifying email for Nominatim usage policy
const NOMINATIM_EMAIL = 'contact@example.com';

const ActivitiesScreen: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [usingDefaultLocation, setUsingDefaultLocation] = useState(false);

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Search-related state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // OpenLayers refs
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const activityLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const userLayerRef = useRef<VectorLayer<VectorSource> | null>(null);

  // Debounce search implementation
  useEffect(() => {
    const handler = setTimeout(() => {
      if (debouncedSearch) {
        searchLocation(debouncedSearch);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [debouncedSearch]);

  // Extract array from Amadeus envelope
  const extractActivitiesArray = (json: any): any[] => {
    if (Array.isArray(json)) return json;
    if (Array.isArray(json?.data)) return json.data;
    return [];
  };

  const searchLocation = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&limit=5${NOMINATIM_EMAIL ? `&email=${encodeURIComponent(NOMINATIM_EMAIL)}` : ''}`;

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

  const fetchActivitiesData = async (
    coords: { latitude: number; longitude: number },
    token: string
  ) => {
    const url = `https://test.api.amadeus.com/v1/shopping/activities?latitude=${coords.latitude}&longitude=${coords.longitude}&radius=1`;
    console.log('GET', url);

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const text = await res.text();
    if (!res.ok) {
      console.warn('Activities error:', res.status, text);
      throw new Error(`Failed to fetch activities (HTTP ${res.status})`);
    }
    const json = JSON.parse(text);
    return extractActivitiesArray(json);
  };

  const fetchActivities = async (
    coords: { latitude: number; longitude: number },
    isRefreshing = false,
    isFallback = false
  ) => {
    try {
      const items = await fetchActivitiesData(coords, token);

      if (items.length === 0 && !isFallback) {
        setUsingDefaultLocation(true);
        await fetchActivities(DEFAULT_COORDINATES, isRefreshing, true);
        return;
      }

      setActivities(items as Activity[]);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';

      if (!isFallback) {
        setUsingDefaultLocation(true);
        await fetchActivities(DEFAULT_COORDINATES, isRefreshing, true);
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

  const stripHtmlTags = (html?: string) => {
    return html ? html.replace(/<[^>]*>/g, '') : 'No description available';
  };

  // Initialize the OpenLayers map once (container is always mounted)
  useEffect(() => {
    if (mapElRef.current && !mapRef.current) {
      const baseLayer = new TileLayer({
        source: new OSM()
      });

      const activitySource = new VectorSource();
      const activityLayer = new VectorLayer({
        source: activitySource
      });
      activityLayerRef.current = activityLayer;

      const userSource = new VectorSource();
      const userLayer = new VectorLayer({
        source: userSource
      });
      userLayerRef.current = userLayer;

      const centerLon = location?.longitude ?? DEFAULT_COORDINATES.longitude;
      const centerLat = location?.latitude ?? DEFAULT_COORDINATES.latitude;

      mapRef.current = new Map({
        target: mapElRef.current,
        layers: [baseLayer, activityLayer, userLayer],
        view: new View({
          center: fromLonLat([centerLon, centerLat]),
          zoom: 13
        })
      });

      // Initial sizing; container may be hidden at first
      setTimeout(() => {
        mapRef.current?.updateSize();
      }, 0);
    }

    // Cleanup when component unmounts
    return () => {
      if (mapRef.current) {
        mapRef.current.setTarget(undefined);
        mapRef.current = null;
        activityLayerRef.current = null;
        userLayerRef.current = null;
      }
    };
  }, []);

  // Ensure correct sizing when switching to map tab
  useEffect(() => {
    if (viewMode === 'map') {
      requestAnimationFrame(() => mapRef.current?.updateSize());
    }
  }, [viewMode]);

  // Update markers when activities or location change
  useEffect(() => {
    if (!mapRef.current) return;

    // Activities layer
    const actLayer = activityLayerRef.current;
    if (actLayer) {
      const src = actLayer.getSource();
      src?.clear();

      const features: Feature[] = [];
      for (const a of activities) {
        const lat = parseFloat(a.geoCode?.latitude ?? '');
        const lon = parseFloat(a.geoCode?.longitude ?? '');
        if (Number.isNaN(lat) || Number.isNaN(lon)) continue;

        const f = new Feature({
          geometry: new Point(fromLonLat([lon, lat])),
          id: a.id,
          name: a.name
        });
        f.setStyle(
          new Style({
            image: new CircleStyle({
              radius: 6,
              fill: new Fill({ color: 'rgba(255, 140, 0, 0.9)' }),
              stroke: new Stroke({ color: '#ffffff', width: 2 })
            })
          })
        );
        features.push(f);
      }
      src?.addFeatures(features);
    }

    // User/default location layer
    const userLayer = userLayerRef.current;
    if (userLayer) {
      const src = userLayer.getSource();
      src?.clear();
      const coords = location ?? DEFAULT_COORDINATES;
      const f = new Feature({
        geometry: new Point(fromLonLat([coords.longitude, coords.latitude])),
        name: 'You'
      });
      f.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 7,
            fill: new Fill({ color: 'rgba(37, 99, 235, 0.9)' }),
            stroke: new Stroke({ color: '#ffffff', width: 2 })
          })
        })
      );
      src?.addFeature(f);
    }

    // Fit to activities if present, otherwise center on user/default
    const actSrc = activityLayerRef.current?.getSource();
    const feats = actSrc?.getFeatures() ?? [];
    if (feats.length > 0 && actSrc) {
      const extent = actSrc.getExtent();
      mapRef.current.getView().fit(extent, { padding: [50, 50, 50, 50], maxZoom: 15, duration: 400 });
    } else {
      const centerLon = location?.longitude ?? DEFAULT_COORDINATES.longitude;
      const centerLat = location?.latitude ?? DEFAULT_COORDINATES.latitude;
      mapRef.current.getView().setCenter(fromLonLat([centerLon, centerLat]));
      mapRef.current.getView().setZoom(13);
    }

    // Only update size if map is currently visible
    if (viewMode === 'map') {
      setTimeout(() => mapRef.current?.updateSize(), 0);
    }
  }, [activities, location, viewMode]);

  const renderActivityItem = (item: Activity, index: number) => (
    <div
      key={item.id}
      className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
    >
      {item.pictures && item.pictures.length > 0 && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={item.pictures[0]}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute top-3 right-3 bg-white rounded-full p-1 shadow-md">
            <span className="font-bold text-green-600 px-2">
              {item.price.amount} {item.price.currencyCode}
            </span>
          </div>
        </div>
      )}
      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-1">{item.name}</h3>
        {item.shortDescription && (
          <p className="text-gray-500 text-sm mb-3 italic line-clamp-2">{item.shortDescription}</p>
        )}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {stripHtmlTags(item.description)}
        </p>
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          onClick={() => handleBookNow(item.bookingLink)}
        >
          Book Now
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600 text-lg">Finding activities near you...</p>
        <p className="text-gray-400 text-sm mt-2">This may take a few moments</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <h1 className="text-2xl font-bold text-blue-600">Explore Activities</h1>

            <div className="flex-1 relative">
              <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
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
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-gray-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
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
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                title="Refresh activities"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

              <div className="bg-gray-200 rounded-lg p-1 flex">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-100'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 rounded-md ${viewMode === 'map' ? 'bg-white shadow-sm' : 'hover:bg-gray-100'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {location && (
            <p className="text-xs text-gray-500 mt-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Showing activities near {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              {usingDefaultLocation && ' (Using default location)'}
            </p>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* LIST VIEW: always mounted, toggled by CSS */}
        <div className={viewMode === 'list' ? 'block' : 'hidden'}>
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-gray-300 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500 text-center mb-4 text-lg">
                {usingDefaultLocation ? 'No activities found at default location' : 'No activities found in your area'}
              </p>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                onClick={() => fetchLocationAndActivities()}
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  {activities.length} Activity{activities.length !== 1 ? 'ies' : ''} Found
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activities.map((activity) => renderActivityItem(activity, 0))}
              </div>
            </>
          )}
        </div>

        {/* MAP VIEW: always mounted, toggled by CSS */}
        <div className={viewMode === 'map' ? 'block' : 'hidden'}>
          <div className="relative bg-white rounded-xl shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
            <div ref={mapElRef} className="w-full h-full" />
            <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md flex flex-col gap-2">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                <span className="text-sm">Your Location</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                <span className="text-sm">Activities ({activities.length})</span>
              </div>
              {usingDefaultLocation && (
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                  <span className="text-sm">Default Location</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ActivitiesScreen;
