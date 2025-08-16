import React, { useState, useEffect } from "react";
import { Box, Paper, Typography, Button, CircularProgress, Alert } from "@mui/material";
import { AirplanemodeActive as AirplaneIcon } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { Flight } from "../Types/FlightTypes";
import Lottie from "lottie-react";
import FlightList from "./FlightList";
import TripReview from "./TripReview";
import TripSummary from "./TripSummary";
import FlightCountBar from "./FlightCountBar";
import BookingSteps from "./BookingSteps";

export type BookingStep = "departure" | "return" | "review";

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
  if (stops === 0) return "Direct";
  if (stops === 1) return "1 stop";
  if (stops && stops > 1) return `${stops} stops`;
  return "Multiple stops";
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
  const [expandedFilters, setExpandedFilters] = useState<boolean>(false);
  const [selectedReturnFlight, setSelectedReturnFlight] = useState<Flight | null>(null);
  const [currentStep, setCurrentStep] = useState<BookingStep>("departure");

  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};
  const { from, to, departDate, returnDate, adults, children, fromDetails, toDetails, tripType } = state;
  const isOneWay = tripType === "oneway" || !returnDate;

  useEffect(() => {
    fetch("/animation.json")
      .then((resp) => resp.json())
      .then(setLottieJson)
      .catch(() => setLottieJson(null));
  }, []);

  useEffect(() => {
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
        setMinPrice(Math.min(...prices) || 200);
        setMaxPrice(Math.max(...prices) || 150000);
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
  }, [from, to, departDate, returnDate, adults, children, isOneWay]);

  useEffect(() => {
    let updated = flights.filter((flight) => {
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
  }, [priceRange, selectedTimes, selectedStops, selectedAirlines, sortBy, flights]);

  const count = isOneWay
    ? filteredFlights.filter((f) => f.trips?.[0]?.from === from && f.trips?.[0]?.to === to).length
    : selectedDepartureFlight
    ? filteredFlights.filter((f) => f.trips[1]?.from === to && f.trips[1]?.to === from).length
    : filteredFlights.filter((f) => f.trips?.[0]?.from === from && f.trips?.[0]?.to === to).length;

  const handleDepartureSelect = (flight: Flight) => {
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
            from={from}
            to={to}
            departDate={departDate}
            returnDate={returnDate}
            adults={adults}
            children={children}
            fromDetails={fromDetails}
            toDetails={toDetails}
            loading={loading}
            isOneWay={isOneWay}
          />
        </Box>
        <Box sx={{ flex: { xs: "1 1 auto", md: "0 0 auto" }, minWidth: 0, alignSelf: { xs: "auto", md: "center" } }}>
          <FlightCountBar
            count={count}
            sortBy={sortBy}
            setSortBy={setSortBy}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            expandedFilters={expandedFilters}
            setExpandedFilters={setExpandedFilters}
            isOneWay={isOneWay}
            selectedDepartureFlight={selectedDepartureFlight}
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

      {currentStep === "review" ? (
        <TripReview
          departureFlight={selectedDepartureFlight!}
          returnFlight={selectedReturnFlight!}
          passengers={(adults || 0) + (children || 0)}
          from={from}
          to={to}
          fromDetails={fromDetails}
          toDetails={toDetails}
          onBack={() => setCurrentStep("return")}
          onConfirm={() =>
            navigate("/passenger-details", {
              state: {
                flight: {
                  ...selectedDepartureFlight,
                  trips: [selectedDepartureFlight!.trips[0], selectedReturnFlight!.trips[1]],
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
            from={from}
            to={to}
            showFilters={showFilters}
            handleDepartureSelect={handleDepartureSelect}
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
          />
        </>
      )}
    </Box>
  );
};

export default FlightSearchResults;