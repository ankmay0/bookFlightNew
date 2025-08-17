import React, { useState, useEffect } from "react";
import { Box, Typography, CircularProgress, Alert, Paper, Button } from "@mui/material";
import { AirplanemodeActive as AirplaneIcon } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { Flight } from "../Types/FlightTypes";
import Lottie from "lottie-react";
import FlightList from "./FlightList";
import { TripReviewProps } from "../Types/TripReviewProps";
import TripReview from "./TripReview";
import TripSummary from "./TripSummary";
import FlightCountBar from "./FlightCountBar";
import BookingSteps from "./BookingSteps";

export type BookingStep = "departure" | "return" | "review" | `segment-${number}`;

const airlinesData: { [key: string]: { name: string; icon: string } } = {
  DL: { name: "Delta Air Lines", icon: "https://content.airhex.com/content/logos/airlines_DL_75_75_s.png" },
  AA: { name: "American Airlines", icon: "https://content.airhex.com/content/logos/airlines_AA_75_75_s.png" },
  UA: { name: "United Airlines", icon: "https://content.airhex.com/content/logos/airlines_UA_75_75_s.png" },
  WN: { name: "Southwest Airlines", icon: "https://content.airhex.com/content/logos/airlines_WN_75_75_s.png" },
  B6: { name: "JetBlue Airways", icon: "https://content.airhex.com/content/logos/airlines_B6_75_75_s.png" },
  NK: { name: "Spirit Airlines", icon: "https://content.airhex.com/content/logos/airlines_NK_75_75_s.png" },
  F9: { name: "Frontier Airlines", icon: "https://content.airhex.com/content/logos/airlines_F9_75_75_s.png" },
  AI: { name: "Air India", icon: "https://content.airhex.com/content/logos/airlines_AI_75_75_s.png" },
  "6E": { name: "IndiGo", icon: "https://content.airhex.com/content/logos/airlines_6E_75_75_s.png" },
  SG: { name: "SpiceJet", icon: "https://content.airhex.com/content/logos/airlines_SG_75_75_s.png" },
  UK: { name: "Vistara", icon: "https://content.airhex.com/content/logos/airlines_UK_75_75_s.png" },
  TK: { name: "Turkish Airlines", icon: "https://content.airhex.com/content/logos/airlines_TK_75_75_s.png" },
};

const getAirlineName = (code: string) => {
  const d = airlinesData[code];
  return d ? d.name : code;
};

const getAirlineIconURL = (code: string) =>
  airlinesData[code]?.icon || `https://content.airhex.com/content/logos/airlines_${code.toUpperCase()}_75_75_s.png`;

const formatPrice = (price: string | number) => {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num || 0);
};

const mapStopsToLabel = (stops: number | undefined) => {
  if (stops === undefined || stops === null) return "Unknown";
  if (stops === 0) return "Non-stop";
  if (stops === 1) return "1 stop";
  return `${stops} stops`;
};

const calculateFlightDuration = (flight: Flight): number => {
  if (!flight.trips?.[0]?.legs) return 0;
  const legs = flight.trips[0].legs;
  const first = legs[0],
    last = legs[legs.length - 1];
  if (!first?.departureDateTime || !last?.arrivalDateTime) return 0;
  return Math.floor((new Date(last.arrivalDateTime).getTime() - new Date(first.departureDateTime).getTime()) / 60000);
};

const FlightSearchResults: React.FC = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [segmentFlights, setSegmentFlights] = useState<Flight[][]>([]);
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("recommended");
  const [showFilters, setShowFilters] = useState<boolean>(true);
  const [priceRange, setPriceRange] = useState<number[]>([200, 150000]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [selectedStops, setSelectedStops] = useState<string[]>([]);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [availableStops, setAvailableStops] = useState<string[]>([]);
  const [availableAirlines, setAvailableAirlines] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [lottieJson, setLottieJson] = useState<any>(null);
  const [selectedDepartureFlight, setSelectedDepartureFlight] = useState<Flight | null>(null);
  const [selectedReturnFlight, setSelectedReturnFlight] = useState<Flight | null>(null);
  const [selectedFlights, setSelectedFlights] = useState<(Flight | null)[]>([]);
  const [expandedFilters, setExpandedFilters] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<BookingStep>("departure");

  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};
  const { from, to, departDate, returnDate, adults, children, fromDetails, toDetails, tripType, segments } = state;
  const isOneWay = tripType === "oneway" || !returnDate;
  const isMultiCity = tripType === "multi";

  useEffect(() => {
    fetch("/animation.json")
      .then((resp) => resp.json())
      .then(setLottieJson)
      .catch(() => setLottieJson(null));
  }, []);

  useEffect(() => {
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
        let url = `http://localhost:8080/flights/search?originLocationCode=${seg.from}&destinationLocationCode=${seg.to}&departureDate=${seg.date}&currencyCode=INR`;
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
          setSelectedFlights(new Array(segments.length).fill(null));
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
      let url = `http://localhost:8080/flights/search?originLocationCode=${from}&destinationLocationCode=${to}&departureDate=${departDate}&currencyCode=INR`;
      if (adt) url += `&adults=${adt}`;
      if (chd) url += `&children=${chd}`;
      if (returnDate && !isOneWay) url += `&returnDate=${returnDate}`;
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
            stopsSet.add(mapStopsToLabel(f.trips?.[0]?.stops));
            f.trips?.forEach((trip) => trip.legs.forEach((leg) => airlinesSet.add(leg.operatingCarrierCode)));
          });
          setAvailableStops(Array.from(stopsSet));
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
  }, [from, to, departDate, returnDate, adults, children, isOneWay, isMultiCity, segments]);

  useEffect(() => {
    let updated: Flight[] = [];
    if (isMultiCity && currentStep !== "review") {
      const segmentIndex = currentStep.startsWith("segment-") ? parseInt(currentStep.split("-")[1]) : 0;
      if (segmentFlights && Array.isArray(segmentFlights) && segmentFlights[segmentIndex]) {
        updated = segmentFlights[segmentIndex];
      }
    } else {
      updated = flights;
    }

    console.log("Filtering flights:", { isMultiCity, currentStep, segmentFlights, flights, updated });

    updated = updated.filter((flight) => {
      const price = parseFloat(flight.totalPrice || flight.basePrice || "0") || 0;
      const airlineList = flight.trips.flatMap((t) => t.legs.map((l) => l.operatingCarrierCode));
      if (price < priceRange[0] || price > priceRange[1]) return false;
      if (selectedAirlines.length && !selectedAirlines.some((a) => airlineList.includes(a))) return false;
      if (selectedStops.length && !selectedStops.includes(mapStopsToLabel(flight.trips?.[0]?.stops))) return false;
      if (selectedTimes.length) {
        const hour = new Date(flight.trips?.[0]?.legs?.[0]?.departureDateTime ?? "").getHours();
        const match = selectedTimes.some((time) => {
          if (time.includes("Morning")) return hour >= 6 && hour < 12;
          if (time.includes("Afternoon")) return hour >= 12 && hour < 18;
          if (time.includes("Evening")) return hour >= 18 && hour < 24;
          return false;
        });
        if (!match) return false;
      }
      return true;
    });

    switch (sortBy) {
      case "priceLow":
        updated.sort((a, b) => (parseFloat(a.totalPrice) || 0) - (parseFloat(b.totalPrice) || 0));
        break;
      case "priceHigh":
        updated.sort((a, b) => (parseFloat(b.totalPrice) || 0) - (parseFloat(a.totalPrice) || 0));
        break;
      case "duration":
        updated.sort((a, b) => calculateFlightDuration(a) - calculateFlightDuration(b));
        break;
      case "departure":
        updated.sort(
          (a, b) =>
            new Date(a.trips?.[0]?.legs?.[0]?.departureDateTime ?? 0).getTime() -
            new Date(b.trips?.[0]?.legs?.[0]?.departureDateTime ?? 0).getTime()
        );
        break;
      default:
        break;
    }
    setFilteredFlights(Array.isArray(updated) ? updated : []);
  }, [priceRange, selectedTimes, selectedStops, selectedAirlines, sortBy, flights, segmentFlights, currentStep, isMultiCity]);

  const handleSegmentSelect = (flight: Flight, segmentIndex: number) => {
    setSelectedFlights((prev) => {
      const newSelected = [...prev];
      newSelected[segmentIndex] = flight;
      return newSelected;
    });
    if (segmentIndex + 1 < segments.length) {
      setCurrentStep(`segment-${segmentIndex + 1}`);
      setFilteredFlights(segmentFlights[segmentIndex + 1] || []);
    } else {
      setCurrentStep("review");
    }
  };

  const renderLoading = () => (
    <Box
      sx={{
        minHeight: "65vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "white",
        p: 2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
      }}
    >
      {lottieJson ? <Lottie animationData={lottieJson} style={{ width: 320, height: 320 }} /> : <CircularProgress sx={{ mb: 2 }} />}
      <Typography variant="h6" sx={{ color: "primary.main", mt: 1 }}>
        Jetting through clouds to find you the best flights...
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 420, textAlign: "center" }}>
        Please wait a moment while we gather the top deals and schedules for your journey!
      </Typography>
    </Box>
  );

  if (loading) return renderLoading();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "white", p: { xs: 1, md: 4 } }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "flex-start",
          alignItems: { xs: "stretch", md: "flex-start" },
          gap: 2,
          mb: 2,
        }}
      >
        <Box sx={{ flex: { xs: "1 1 auto", md: "0 1 640px" }, minWidth: 0 }}>
          <TripSummary
            from={isMultiCity ? segments[0]?.from : from}
            to={isMultiCity ? segments[segments.length - 1]?.to : to}
            departDate={isMultiCity ? segments[0]?.date : departDate}
            returnDate={returnDate}
            adults={adults}
            children={children}
            fromDetails={fromDetails || {}}
            toDetails={toDetails || {}}
            loading={loading}
            isOneWay={isOneWay}
            isMultiCity={isMultiCity}
            segments={isMultiCity ? segments : undefined}
          />
        </Box>
        <Box sx={{ flex: { xs: "1 1 auto", md: "0 0 auto" }, minWidth: 0, alignSelf: { xs: "auto", md: "center" } }}>
          <FlightCountBar
            count={filteredFlights.length}
            sortBy={sortBy}
            setSortBy={setSortBy}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            expandedFilters={expandedFilters}
            setExpandedFilters={setExpandedFilters}
            isOneWay={isOneWay}
            selectedDepartureFlight={selectedDepartureFlight}
            isMultiCity={isMultiCity}
          />
        </Box>
      </Box>

      {error && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Box>
      )}

      {currentStep === "review" && isMultiCity ? (
        <TripReview
          departureFlight={selectedFlights[0]!}
          returnFlight={null}
          multiCityFlights={selectedFlights as Flight[]}
          passengers={(adults || 0) + (children || 0)}
          from={segments[0]?.from}
          to={segments[segments.length - 1]?.to}
          fromDetails={fromDetails || {}}
          toDetails={toDetails || {}}
          onBack={() => setCurrentStep(`segment-${segments.length - 1}`)}
          onConfirm={() =>
            navigate("/passenger-details", {
              state: {
                flight: {
                  trips: selectedFlights.map((flight, idx) => ({
                    from: segments[idx].from,
                    to: segments[idx].to,
                    legs: flight!.trips[0].legs,
                    stops: flight!.trips[0].stops,
                  })),
                  totalPrice: selectedFlights.reduce((sum, f) => sum + (parseFloat(f!.totalPrice) || 0), 0).toString(),
                  oneWay: true,
                  seatsAvailable: selectedFlights[0]?.seatsAvailable || 0,
                  currencyCode: "INR",
                  basePrice: selectedFlights.reduce((sum, f) => sum + (parseFloat(f!.basePrice || "0") || 0), 0).toString(),
                },
                passengers: (adults || 0) + (children || 0),
              },
            })
          }
        />
      ) : currentStep === "review" ? (
        <TripReview
          departureFlight={selectedDepartureFlight!}
          returnFlight={selectedReturnFlight}
          passengers={(adults || 0) + (children || 0)}
          from={from}
          to={to}
          fromDetails={fromDetails || {}}
          toDetails={toDetails || {}}
          onBack={() => setCurrentStep("return")}
          onConfirm={() =>
            navigate("/passenger-details", {
              state: {
                flight: {
                  ...selectedDepartureFlight,
                  trips: [
                    selectedDepartureFlight!.trips[0],
                    ...(selectedReturnFlight ? [selectedReturnFlight.trips[0]] : []),
                  ],
                },
                passengers: (adults || 0) + (children || 0),
              },
            })
          }
        />
      ) : (
        <>
          <BookingSteps
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            selectedDepartureFlight={selectedDepartureFlight}
            selectedReturnFlight={selectedReturnFlight}
            from={from}
            to={to}
            isOneWay={isOneWay}
            getAirlineName={getAirlineName}
            isMultiCity={isMultiCity}
            segments={isMultiCity ? segments : undefined}
            selectedFlights={isMultiCity ? selectedFlights : undefined}
          />
          {!loading && filteredFlights.length === 0 && (
            <Paper
              sx={{
                p: 4,
                mt: 4,
                mb: 4,
                borderRadius: 3,
                textAlign: "center",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "none",
              }}
            >
              <AirplaneIcon sx={{ fontSize: 64, color: "grey.400", mb: 2 }} />
              <Typography variant="h5" fontWeight={700}>
                No flights found
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Try adjusting your filters or broaden your search dates.
              </Typography>
              <Button
                variant="contained"
                onClick={() => {
                  setSelectedAirlines([]);
                  setSelectedStops([]);
                  setSelectedTimes([]);
                  setPriceRange([minPrice, maxPrice]);
                }}
              >
                Clear All Filters
              </Button>
            </Paper>
          )}
          <FlightList
            loading={loading}
            lottieJson={lottieJson}
            filteredFlights={filteredFlights}
            selectedDepartureFlight={selectedDepartureFlight}
            from={isMultiCity ? segments[parseInt(currentStep.split("-")[1])]?.from : from}
            to={isMultiCity ? segments[parseInt(currentStep.split("-")[1])]?.to : to}
            showFilters={showFilters}
            handleDepartureSelect={(flight) => {
              if (isMultiCity) {
                handleSegmentSelect(flight, parseInt(currentStep.split("-")[1]));
              } else {
                setSelectedDepartureFlight(flight);
                if (isOneWay) {
                  navigate("/passenger-details", {
                    state: {
                      flight: {
                        ...flight,
                        trips: [flight.trips[0]],
                      },
                      passengers: (adults || 0) + (children || 0),
                    },
                  });
                } else {
                  setCurrentStep("return");
                }
              }
            }}
            handleConfirmSelection={(flight) => {
              setSelectedReturnFlight(flight);
              setCurrentStep("review");
            }}
            mapStopsToLabel={mapStopsToLabel}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            selectedTimes={selectedTimes}
            setSelectedTimes={setSelectedTimes}
            selectedStops={selectedStops}
            setSelectedStops={setSelectedStops}
            selectedAirlines={selectedAirlines}
            setSelectedAirlines={setSelectedAirlines}
            availableStops={availableStops}
            availableAirlines={availableAirlines}
            minPrice={minPrice}
            maxPrice={maxPrice}
            setSelectedDepartureFlight={setSelectedDepartureFlight}
            currentStep={currentStep}
            segments={isMultiCity ? segments : undefined}
            selectedFlights={isMultiCity ? selectedFlights : undefined}
          />
        </>
      )}
    </Box>
  );
};

export default FlightSearchResults;