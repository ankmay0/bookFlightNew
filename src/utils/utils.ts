import axios from "axios";
import debounce from "lodash.debounce";
import { v4 as uuidv4 } from "uuid";

/**
 * Calculates the distance between two coordinates using the Haversine formula.
 */
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (
    lat1 === undefined ||
    lon1 === undefined ||
    lat2 === undefined ||
    lon2 === undefined
  ) {
    return NaN;
  }
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Fetches location data (city/airport) based on a keyword and formats them for Autocomplete.
 */
export const fetchLocations = async (
  keyword: string,
  setOptions: React.Dispatch<React.SetStateAction<any[]>>,
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>,
  setError?: React.Dispatch<React.SetStateAction<string | null>>
) => {
  if (!keyword) {
    console.log("No keyword provided, clearing options");
    setOptions([]);
    if (setLoading) setLoading(false);
    return;
  }
  try {
    if (setLoading) setLoading(true);
    console.log(`Making API request for keyword: "${keyword}"`);
    const res = await axios.get(
      `http://localhost:8080/locations/search?keyword=${encodeURIComponent(keyword)}`
    );
    console.log("Raw API Response:", JSON.stringify(res.data, null, 2));
    const data = res.data;

    // Handle both array and object response structures
    const locationResponses = Array.isArray(data) ? data : data.locationResponses;

    const formattedOptions: any[] = [];

    if (!locationResponses || !Array.isArray(locationResponses)) {
      console.warn("Invalid or empty locationResponses:", JSON.stringify(data, null, 2));
      setOptions([]);
      if (setLoading) setLoading(false);
      if (setError) setError("Invalid response from server");
      return;
    }

    locationResponses.forEach((item: any) => {
      console.log("Processing item:", JSON.stringify(item, null, 2));
      if (item.subType === "CITY") {
        const cityName = item.name || `${item.iata} Metropolitan Area`;
        formattedOptions.push({
          label: `${cityName} (${item.iata})`,
          value: item.iata,
          isParent: true,
          isChild: false,
          displayText: `${cityName} (${item.iata})`,
        });

        // Check for groupData (your backend) or group_data.simpleAirports (working environment)
        const airports = item.groupData || (item.group_data && item.group_data.simpleAirports) || [];
        if (Array.isArray(airports)) {
          // Determine if there are multiple airports for this city
          const hasMultipleAirports = airports.length > 1;

          airports.forEach((airport: any) => {
            console.log("Processing airport:", JSON.stringify(airport, null, 2));
            const cityInfo = airport.city ? `, ${airport.city}` : "";
            let distance: string | undefined = undefined;
            if (
              typeof item.latitude === "number" &&
              typeof item.longitude === "number" &&
              typeof airport.latitude === "number" &&
              typeof airport.longitude === "number"
            ) {
              const dist = haversineDistance(
                item.latitude,
                item.longitude,
                airport.latitude,
                airport.longitude
              );
              distance = `${dist.toFixed(1)} km`;
            }
            // Include distance in label only if there are multiple airports
            const airportLabel = `${airport.name} (${airport.iata})${cityInfo}`;
            formattedOptions.push({
              label: airportLabel,
              value: airport.iata,
              isParent: false,
              isChild: true,
              displayText: `${airport.name} (${airport.iata})`,
              distance: distance, // Keep distance in a separate field
            });

          });
        }
      } else if (item.subType === "AIRPORT") {
        const cityInfo = item.city ? `, ${item.city}` : "";
        formattedOptions.push({
          label: `${item.name} (${item.iata})${cityInfo}`,
          value: item.iata,
          isParent: false,
          isChild: false,
          displayText: `${item.name} (${item.iata})`,
        });
      }
    });

    console.log("Formatted Options:", JSON.stringify(formattedOptions, null, 2));
    setOptions(formattedOptions);
    if (setLoading) setLoading(false);
  } catch (error) {
    console.error("Failed to fetch locations:", error);
    setOptions([]);
    if (setLoading) setLoading(false);
    if (setError) setError("Failed to load locations. Please try again.");
  }
};

/**
 * Creates a debounced version of the location fetcher.
 */
export const createDebouncedFetcher = (
  fetcher: (keyword: string) => void,
  delay: number = 200
) => {
  return debounce(fetcher, delay);
};


export const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return `₹${numPrice.toFixed(2)}`;
};

export const formatTime = (dateTime: string): string => {
    return new Date(dateTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const formatDate = (dateTime: string): string => {
    return new Date(dateTime).toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
    });
};

export const calculateFlightDuration = (legs: Array<{ departureDateTime: string; arrivalDateTime: string }>): string => {
    const totalDurationMs = legs.reduce((total, leg) => {
        const departure = new Date(leg.departureDateTime).getTime();
        const arrival = new Date(leg.arrivalDateTime).getTime();
        return total + (arrival - departure);
    }, 0);
    const hours = Math.floor(totalDurationMs / (1000 * 60 * 60));
    const minutes = Math.floor((totalDurationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
};