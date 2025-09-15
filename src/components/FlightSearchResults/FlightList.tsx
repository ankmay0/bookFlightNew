import React from "react";
import {
  Box,
  Grid,
  Typography,
  Paper,
  Button,
  Stack,
  CircularProgress,
} from "@mui/material";
import Divider from "@mui/material/Divider";
import Lottie from "lottie-react";
import SidebarFilters from "./SidebarFilters";
import { Flight } from "../Types/FlightTypes";
import { BookingStep } from "./FlightSearchResults";

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
  AS: { name: "Alaska Airlines", icon: "https://content.airhex.com/content/logos/airlines_AS_75_75_s.png" },
  HA: { name: "Hawaiian Airlines", icon: "https://content.airhex.com/content/logos/airlines_HA_75_75_s.png" },
};

const getAirlineName = (code: string): string =>
  airlinesData[code as keyof typeof airlinesData]?.name || code;

const getAirlineIconURL = (code: string): string =>
  airlinesData[code as keyof typeof airlinesData]?.icon ||
  `https://content.airhex.com/content/logos/airlines_${code?.toUpperCase?.() ?? ""}_75_75_s.png`;

const airportCityMap: { [key: string]: string } = {
  EWR: "Newark",
  JFK: "New York",
  LGA: "New York",
  LAX: "Los Angeles",
  ORD: "Chicago",
  ATL: "Atlanta",
  DFW: "Dallas",
  SFO: "San Francisco",
  SEA: "Seattle",
  BOS: "Boston",
  DEL: "Delhi",
  BOM: "Mumbai",
  BLR: "Bengaluru",
  MAA: "Chennai",
  HYD: "Hyderabad",
  CCU: "Kolkata",
  DXB: "Dubai",
  PDX: "Portland",
};

const getCityName = (airportCode: string): string =>
  airportCityMap[airportCode?.toUpperCase?.()] || airportCode;

// Helper function to format dates
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    day: '2-digit', 
    month: 'short' 
  }).replace(',', '');
};

// Helper function to count flights by stops
const countFlightsByStops = (flights: Flight[]) => {
  const counts = {
    "Non-stop": 0,
    "1 stop": 0,
    "2+ stops": 0
  };

  flights.forEach(flight => {
    flight.trips.forEach(trip => {
      const stops = trip.stops || 0;
      if (stops === 0) counts["Non-stop"]++;
      else if (stops === 1) counts["1 stop"]++;
      else if (stops >= 2) counts["2+ stops"]++;
    });
  });

  return counts;
};

interface FlightListProps {
  loading: boolean;
  lottieJson: any;
  filteredFlights: Flight[];
  selectedDepartureFlight: Flight | null;
  from: string;
  to: string;
  showFilters: boolean;
  handleDepartureSelect: (flight: Flight) => void;
  handleConfirmSelection: (flight: Flight) => void;
  mapStopsToLabel: (stops: number | undefined) => string;
  priceRange: number[];
  setPriceRange: React.Dispatch<React.SetStateAction<number[]>>;
  selectedTimes: string[];
  setSelectedTimes: React.Dispatch<React.SetStateAction<string[]>>;
  selectedStops: string[];
  setSelectedStops: React.Dispatch<React.SetStateAction<string[]>>;
  selectedAirlines: string[];
  setSelectedAirlines: React.Dispatch<React.SetStateAction<string[]>>;
  availableStops: string[];
  availableAirlines: string[];
  minPrice: number;
  maxPrice: number;
  setSelectedDepartureFlight?: React.Dispatch<React.SetStateAction<Flight | null>>;
  currentStep: BookingStep;
  segments?: Array<{ from: string; to: string; date: string }>;
  selectedFlights?: (Flight | null)[];
  departureDate?: string; // Added for date display
  returnDate?: string;    // Added for date display
}

// ========================== FlightCard ==========================
const FlightCard: React.FC<{
  flight: Flight;
  tripIndex: number;
  onSelect: () => void;
}> = ({ flight, tripIndex, onSelect }) => {
  const trip = flight.trips[tripIndex];
  if (!trip || !trip.legs?.length) return null;

  const legs = trip.legs;
  const firstLeg = legs[0];
  const lastLeg = legs[legs.length - 1];

  const prettyTime = (dt: string) =>
    new Date(dt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const cityText = (airport: string) =>
    `${getCityName(airport)} (${airport})`;

  const formatPrice = (price: number | string | undefined) =>
    typeof price === "number" ? price.toLocaleString("en-IN") : String(price ?? 0);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 1.5,
        p: 1.5,
        backgroundColor: "#ffffff",
        border: "1px solid #ddd",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: 140,
      }}
    >
      {/* Airline + Price */}
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <img
              src={getAirlineIconURL(firstLeg.operatingCarrierCode)}
              alt={getAirlineName(firstLeg.operatingCarrierCode)}
              style={{
                height: 18,
                width: 18,
                borderRadius: 3,
                background: "#fff",
              }}
            />
            <Typography variant="subtitle2" fontWeight={700}>
              {getAirlineName(firstLeg.operatingCarrierCode)} {firstLeg.flightNumber}
            </Typography>
          </Box>
        </Grid>
        <Grid item>
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: "green" }}>
            ₹{formatPrice(flight.totalPrice)}
          </Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 1 }} />

      {/* Departure/Arrival/Line grouped on left */}
      <Box sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        pl: 0.5
      }}>
        {/* DEPARTURE */}
        <Box sx={{ textAlign: "left", minWidth: "fit-content" }}>
          <Typography fontWeight={700}>{prettyTime(firstLeg.departureDateTime)}</Typography>
          <Typography variant="caption">{cityText(firstLeg.departureAirport)}</Typography>
        </Box>
        {/* LINE + STOP INFO */}
        <Box sx={{
          minWidth: 80,
          textAlign: "center",
          position: "relative"
        }}>
          <Box sx={{
            position: "relative",
            height: "2px",
            background: "linear-gradient(to right, #1976d2, #42a5f5)",
            borderRadius: "1px",
            mb: 0.5,
            "&::before": {
              content: '""',
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "#1976d2",
            },
            "&::after": {
              content: '""',
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "#42a5f5",
            }
          }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
            {trip.stops > 0 ? `${trip.stops} stop${trip.stops > 1 ? "s" : ""}` : "Non-stop"}
          </Typography>
        </Box>
        {/* ARRIVAL */}
        <Box sx={{ textAlign: "left", minWidth: "fit-content" }}>
          <Typography fontWeight={700}>{prettyTime(lastLeg.arrivalDateTime)}</Typography>
          <Typography variant="caption">{cityText(lastLeg.arrivalAirport)}</Typography>
        </Box>
      </Box>

      {/* Select button at bottom right */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0 }}>
        <Button
          variant="contained"
          size="small"
          onClick={onSelect}
          sx={{ minHeight: 32, fontSize: 13, borderRadius: 2 }}
        >
          SELECT
        </Button>
      </Box>

      {/* Layovers if any */}
      {legs.length > 1 && (
        <Box sx={{ mt: 1 }}>
          {legs.slice(0, -1).map((leg, idx) => {
            const nextLeg = legs[idx + 1];
            if (!nextLeg) return null;
            return (
              <Box
                key={idx}
                sx={{
                  p: 1,
                  bgcolor: "#fafafa",
                  borderRadius: 1,
                  border: "1px solid #eee",
                  my: 0.5,
                }}
              >
                <Typography variant="caption">
                  {prettyTime(leg.arrivalDateTime)} {cityText(leg.arrivalAirport)}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Layover: {nextLeg.duration}
                </Typography>
                <Typography variant="caption">
                  Aircraft: {leg.aircraftCode}
                </Typography>
                <Typography variant="caption" display="block">
                  Departs: {prettyTime(nextLeg.departureDateTime)} {cityText(nextLeg.departureAirport)}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </Paper>
  );
};

// ========================== FlightList ==========================
const FlightList: React.FC<FlightListProps> = ({
  loading,
  lottieJson,
  filteredFlights,
  selectedDepartureFlight,
  from,
  to,
  showFilters,
  handleDepartureSelect,
  handleConfirmSelection,
  priceRange,
  setPriceRange,
  selectedTimes,
  setSelectedTimes,
  selectedStops,
  setSelectedStops,
  selectedAirlines,
  setSelectedAirlines,
  availableStops,
  availableAirlines,
  minPrice,
  maxPrice,
  setSelectedDepartureFlight,
  currentStep,
  segments,
  selectedFlights,
  departureDate,
  returnDate,
}) => {
  const isMultiCity = segments && segments.length > 1;
  const segmentIndex =
    isMultiCity && currentStep.startsWith("segment-")
      ? parseInt(currentStep.split("-")[1])
      : 0;
  const segmentFlights = filteredFlights.filter(
    (flight) => flight.trips[0]?.from === from && flight.trips[0]?.to === to
  );

  // Calculate stop counts - this was missing and causing the error
  const stopCounts = countFlightsByStops(filteredFlights);

  return (
    <Grid container spacing={3}>
      {showFilters && (
        <Grid item xs={12} md={3} mt={-6}>
          <SidebarFilters
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
            stopCounts={stopCounts}
          />
        </Grid>
      )}
      <Grid item xs={12} md={showFilters ? 9 : 12}>
        {loading ? (
          lottieJson ? (
            <Lottie
              animationData={lottieJson}
              style={{ height: 200, width: 200, margin: "0 auto" }}
              loop
              autoplay
            />
          ) : (
            <CircularProgress sx={{ display: "block", margin: "0 auto" }} />
          )
        ) : isMultiCity && currentStep.startsWith("segment-") ? (
          <Stack spacing={2}>
            <Typography variant="h5" fontWeight={600}>
              Choose Flight for Segment {segmentIndex + 1}: {getCityName(from)} to {getCityName(to)}
              {segments && segments[segmentIndex]?.date && (
                <span> on {formatDate(segments[segmentIndex].date)}</span>
              )}
            </Typography>
            {segmentFlights.length === 0 ? (
              <Typography variant="body1" color="text.secondary">
                No flights available for this segment. Try adjusting your filters.
              </Typography>
            ) : (
              segmentFlights.map((flight, idx) => (
                <FlightCard
                  key={idx}
                  flight={flight}
                  tripIndex={0}
                  onSelect={() => handleDepartureSelect(flight)}
                />
              ))
            )}
            {segmentIndex > 0 && (
              <Button
                variant="outlined"
                onClick={() => setSelectedDepartureFlight && setSelectedDepartureFlight(null)}
              >
                Change Previous Segment
              </Button>
            )}
          </Stack>
        ) : !selectedDepartureFlight ? (
          <Stack spacing={2}>
            <Typography variant="h5" fontWeight={600}>
              Choose Your Departure Flight from {getCityName(from)} to {getCityName(to)}
              {departureDate && <span> on {formatDate(departureDate)}</span>}
            </Typography>
            {segmentFlights.length === 0 ? (
              <Typography variant="body1" color="text.secondary">
                No departure flights available. Try adjusting your filters.
              </Typography>
            ) : (
              segmentFlights.map((flight, idx) => (
                <FlightCard
                  key={idx}
                  flight={flight}
                  tripIndex={0}
                  onSelect={() => handleDepartureSelect(flight)}
                />
              ))
            )}
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Typography variant="h5" fontWeight={600}>
              Choose Your Return Flight from {getCityName(to)} to {getCityName(from)}
              {returnDate && <span> on {formatDate(returnDate)}</span>}
            </Typography>
            {segmentFlights.length === 0 ? (
              <Typography variant="body1" color="text.secondary">
                No return flights available. Try adjusting your filters.
              </Typography>
            ) : (
              segmentFlights.map((flight, idx) => (
                <FlightCard
                  key={idx}
                  flight={flight}
                  tripIndex={1}
                  onSelect={() => handleConfirmSelection(flight)}
                />
              ))
            )}
            <Button
              variant="outlined"
              onClick={() => setSelectedDepartureFlight && setSelectedDepartureFlight(null)}
            >
              Change Departure Flight
            </Button>
          </Stack>
        )}
      </Grid>
    </Grid>
  );
};

export default FlightList;
