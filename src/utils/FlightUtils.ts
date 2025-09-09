import { Flight } from "../../src/components/Types/FlightTypes";

export const fetchFlights = async (
  isMultiCity: boolean,
  segments: { from: string; to: string; date: string }[] | undefined,
  from: string | undefined,
  to: string | undefined,
  departDate: string | undefined,
  returnDate: string | undefined,
  adults: number | undefined,
  children: number | undefined,
  setFlights: React.Dispatch<React.SetStateAction<Flight[]>>,
  setSegmentFlights: React.Dispatch<React.SetStateAction<Flight[][]>>,
  setFilteredFlights: React.Dispatch<React.SetStateAction<Flight[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setMinPrice: React.Dispatch<React.SetStateAction<number>>,
  setMaxPrice: React.Dispatch<React.SetStateAction<number>>,
  setAvailableStops: React.Dispatch<React.SetStateAction<string[]>>,
  setAvailableAirlines: React.Dispatch<React.SetStateAction<string[]>>
) => {

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const mapStopsToLabel = (stops: number | undefined) => {
    if (stops === undefined || stops === null) return "Unknown";
    if (stops === 0) return "Non-stop";
    if (stops === 1) return "1 stop";
    return `${stops} stops`;
  };

  if (isMultiCity) {
    if (!segments || !Array.isArray(segments) || segments.length < 2) {
      setError("Invalid multi-city search parameters. Please try again.");
      setLoading(false);
      return;
    }
    setLoading(true);
    const fetchPromises = segments.map((seg: { from: string; to: string; date: string }) => {
      if (!seg.from || !seg.to || !seg.date || (!adults && !children)) {
        return Promise.reject(new Error(`Missing parameters for segment: ${JSON.stringify(seg)}`));
      }
      const adt = adults || 0,
        chd = children || 0;
      let url = `${backendUrl}/flights/search?originLocationCode=${seg.from}&destinationLocationCode=${seg.to}&departureDate=${seg.date}&currencyCode=INR`;
      if (adt) url += `&adults=${adt}`;
      if (chd) url += `&children=${chd}`;
      return fetch(url).then((res) => {
        if (!res.ok) {
          throw new Error(
            res.status === 400
              ? `Invalid parameters for segment ${seg.from} to ${seg.to}.`
              : res.status === 500
                ? "Server error. Please try again later."
                : `HTTP error ${res.status}`
          );
        }
        return res.json();
      });
    });

    Promise.allSettled(fetchPromises)
      .then((results) => {
        const segmentFlightsArray: Flight[][] = [];
        const errors: string[] = [];
        results.forEach((result, idx) => {
          if (result.status === "fulfilled") {
            const flightsArr: Flight[] = Array.isArray(result.value.flightsAvailable) ? result.value.flightsAvailable : [];
            segmentFlightsArray.push(flightsArr);
          } else {
            errors.push(`Segment ${idx + 1}: ${result.reason.message}`);
            segmentFlightsArray.push([]);
          }
        });
        setSegmentFlights(segmentFlightsArray);
        setFilteredFlights(segmentFlightsArray[0] || []);
        const prices = segmentFlightsArray.flat().map((f) => parseFloat(f.totalPrice || f.basePrice || "0") || 0);
        setMinPrice(prices.length ? Math.min(...prices) : 200);
        setMaxPrice(prices.length ? Math.max(...prices) : 150000);
        const stopsSet = new Set<string>(),
          airlinesSet = new Set<string>();
        segmentFlightsArray.flat().forEach((f) => {
          stopsSet.add(mapStopsToLabel(f.trips?.[0]?.stops));
          f.trips?.forEach((trip) => trip.legs.forEach((leg) => airlinesSet.add(leg.operatingCarrierCode)));
        });
        setAvailableStops(Array.from(stopsSet));
        setAvailableAirlines(Array.from(airlinesSet));
        setError(errors.length ? errors.join("; ") : null);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to fetch multi-city flights. Please try again.");
        setSegmentFlights([]);
        setFilteredFlights([]);
        setLoading(false);
      });
  } else {
    if (!from || !to || !departDate || (!adults && !children)) {
      setError("Missing search parameters. Please try again.");
      setLoading(false);
      return;
    }
    const adt = adults || 0,
      chd = children || 0;
    let url = `${backendUrl}/flights/search?originLocationCode=${from}&destinationLocationCode=${to}&departureDate=${departDate}&currencyCode=INR`;
    if (adt) url += `&adults=${adt}`;
    if (chd) url += `&children=${chd}`;
    if (returnDate) url += `&returnDate=${returnDate}`;
    setLoading(true);
    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            res.status === 400
              ? "Invalid search parameters."
              : res.status === 500
                ? "Server error. Please try again later."
                : `HTTP error ${res.status}`
          );
        }
        return res.json();
      })
      .then((data) => {
        console.log("Flight search response:", data);
        let flightsArr: Flight[] = Array.isArray(data.flightsAvailable) ? data.flightsAvailable : [];
        setFlights(flightsArr);
        setFilteredFlights(flightsArr);
        const prices = flightsArr.map((f) => parseFloat(f.totalPrice || f.basePrice || "0") || 0);
        setMinPrice(prices.length ? Math.min(...prices) : 200);
        setMaxPrice(prices.length ? Math.max(...prices) : 150000);
        const stopsSet = new Set<string>(),
          airlinesSet = new Set<string>();
        flightsArr.forEach((f) => {
          f.trips?.forEach(trip => {
            stopsSet.add(mapStopsToLabel(trip.stops));
          });
          f.trips?.forEach((trip) => trip.legs.forEach((leg) => airlinesSet.add(leg.operatingCarrierCode)));
        });
        setAvailableStops(Array.from(stopsSet).sort((a, b) => {
          if (a === "Non-stop") return -1;
          if (b === "Non-stop") return 1;
          if (a === "1 stop") return -1;
          if (b === "1 stop") return 1;
          return parseInt(a) - parseInt(b);
        }));
        setAvailableAirlines(Array.from(airlinesSet));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Flight search error:", err);
        setError(err.message || "Failed to fetch flights. Please try again.");
        setFlights([]);
        setFilteredFlights([]);
        setLoading(false);
      });
  }
};