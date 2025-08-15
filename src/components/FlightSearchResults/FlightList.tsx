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
import { useNavigate } from "react-router-dom";
import { BookingStep } from "./FlightSearchResults";

// --- Airline utilities --- //
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

// --- Airport (city) mapping --- //
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
  // ...add more as needed
};

const getCityName = (airportCode: string): string =>
  airportCityMap[airportCode?.toUpperCase?.()] || airportCode;

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
}

// Extracted FlightCard component for reusability - COMPACT VERSION
const FlightCard: React.FC<{
  flight: Flight;
  tripIndex: number;
  onSelect: () => void;
  mapStopsToLabel: (stops: number | undefined) => string;
}> = ({ flight, tripIndex, onSelect, mapStopsToLabel }) => {
  const trip = flight.trips[tripIndex];
  const firstLeg = trip?.legs?.[0];

  const prettyTime = (dt: string) => (
    <span style={{ fontWeight: 700, fontSize: 18 }}>
      {new Date(dt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
    </span>
  );

  const CityConnectorLine = () => (
    <Box
      sx={{
        height: 3,
        background: "linear-gradient(90deg, #209e48 70%, #8fdc94 100%)",
        borderRadius: 2,
        minWidth: 24,
        mx: 1,
        display: "inline-block",
      }}
    />
  );

  const cityText = (airport: string) => (
    <span>
      <span style={{ fontWeight: 600, fontSize: 14, color: "#222" }}>{getCityName(airport)}</span>
      <span style={{ color: "#888", fontWeight: 400, fontSize: 12, marginLeft: 4 }}>({airport})</span>
    </span>
  );

  const formatPrice = (price: number | string | undefined) => {
    if (typeof price === "number") {
      return price.toLocaleString("en-IN");
    }
    return String(price ?? 0);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        p: 1.5,
        backgroundColor: "#ffffff",
        border: "1px solid #ddd",
        transition: "border-color 0.3s, background-color 0.3s",
        "&:hover": {
          borderColor: "#aaa",
          backgroundColor: "#ffffff",
        },
      }}
    >
      <Grid container alignItems="center" justifyContent="space-between">
        <Grid item xs={9}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {firstLeg && (
              <>
                <img
                  src={getAirlineIconURL(firstLeg.operatingCarrierCode)}
                  alt={`${getAirlineName(firstLeg.operatingCarrierCode)} logo`}
                  style={{ height: 20, width: 20, marginRight: 6, verticalAlign: "middle", borderRadius: 3, background: "#fff" }}
                />
                <strong style={{ fontWeight: 800, fontSize: 14 }}>{getAirlineName(firstLeg.operatingCarrierCode)}</strong>{" "}
                <span style={{ fontWeight: 700, fontSize: 13 }}>{firstLeg.flightNumber}</span>
              </>
            )}
          </Typography>
          <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mt: 0.25 }}>
            {mapStopsToLabel(trip?.stops)}
          </Typography>
        </Grid>
        <Grid item xs={3} sx={{ textAlign: "right" }}>
          <Typography
            variant="subtitle1"
            fontWeight={700}
            sx={{ color: "green", padding: "4px 8px" }}
          >
            ₹{formatPrice(flight.totalPrice)}
          </Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 1 }} />

      <Box>
        {trip?.legs?.map((leg, lIdx) => (
          <Box
            key={lIdx}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              my: 1,
              px: 1.5,
              py: 1,
              borderRadius: 2,
              bgcolor: "#ffffff",
              border: "1px solid #eee",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", flex: 1, overflow: "auto" }}>
              <Box sx={{ textAlign: "right", minWidth: 110, pr: 0.5 }}>
                {prettyTime(leg.departureDateTime)}
                <br />
                {cityText(leg.departureAirport)}
              </Box>
              <CityConnectorLine />
              <Box sx={{ textAlign: "left", minWidth: 110, pl: 0.5 }}>
                {prettyTime(leg.arrivalDateTime)}
                <br />
                {cityText(leg.arrivalAirport)}
              </Box>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.25, minWidth: 100 }}>
              <span style={{ color: "#666", fontWeight: 600, fontSize: 13 }}>{leg.duration}</span>
              <span style={{ color: "#aaa", fontSize: 12 }}>
                Aircraft: {leg.aircraftCode}
              </span>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Select Button */}
      <Box sx={{ textAlign: "right", mt: 1.5 }}>
        <Button variant="contained" color="primary" size="small" onClick={onSelect}>
          Select
        </Button>
      </Box>
    </Paper>
  );
};

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
  mapStopsToLabel,
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
}) => {
  const flightsToShow = currentStep === 'departure' 
    ? filteredFlights.filter(f => f.trips[0]?.from === from && f.trips[0]?.to === to)
    : filteredFlights.filter(f => f.trips[1]?.from === to && f.trips[1]?.to === from);

  const departureFlights = filteredFlights.filter((flight) => flight.trips[0]?.from === from && flight.trips[0]?.to === to);
  const returnFlights = selectedDepartureFlight
    ? filteredFlights.filter((flight) => flight.trips[1]?.from === to && flight.trips[1]?.to === from)
    : [];

  return (
    <Grid container spacing={3}>
      {showFilters && (
        <Grid item xs={12} md={3}>
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
          />
        </Grid>
      )}
      <Grid item xs={12} md={showFilters ? 9 : 12}>
        {loading ? (
          lottieJson ? (
            <Lottie animationData={lottieJson} style={{ height: 200, width: 200, margin: "0 auto" }} loop autoplay />
          ) : (
            <CircularProgress sx={{ display: "block", margin: "0 auto" }} />
          )
        ) : !selectedDepartureFlight ? (
          <Stack spacing={3}>
            <Typography variant="h5" fontWeight={600}>
              Choose Your Departure Flight from {getCityName(from)} to {getCityName(to)}
            </Typography>
            {departureFlights.length === 0 ? (
              <Typography variant="body1" color="text.secondary">
                No departure flights available. Try adjusting your filters.
              </Typography>
            ) : (
              departureFlights.map((flight, idx) => (
                <FlightCard
                  key={idx}
                  flight={flight}
                  tripIndex={0}
                  onSelect={() => handleDepartureSelect(flight)}
                  mapStopsToLabel={mapStopsToLabel}
                />
              ))
            )}

            {setSelectedDepartureFlight && (
              <Button
                variant="outlined"
                onClick={() => setSelectedDepartureFlight(null)}
                sx={{ mt: 2, alignSelf: "flex-start" }}
              >
                Change Departure Flight
              </Button>
            )}
          </Stack>
        ) : (
          <Stack spacing={3}>
            <Typography variant="h5" fontWeight={600}>
              Choose Your Return Flight from {getCityName(to)} to {getCityName(from)}
            </Typography>
            {returnFlights.length === 0 ? (
              <Typography variant="body1" color="text.secondary">
                No return flights available. Try adjusting your filters or select a different departure.
              </Typography>
            ) : (
              returnFlights.map((flight, idx) => (
                <FlightCard
                  key={idx}
                  flight={flight}
                  tripIndex={1}
                  onSelect={() => handleConfirmSelection(flight)}
                  mapStopsToLabel={mapStopsToLabel}
                />
              ))
            )}
            <Button
              variant="outlined"
              onClick={() => setSelectedDepartureFlight && setSelectedDepartureFlight(null)}
              sx={{ mt: 2, alignSelf: "flex-start" }}
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
