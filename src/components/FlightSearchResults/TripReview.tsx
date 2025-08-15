import React from "react";
import {
  Box,
  Paper,
  Typography,
  Divider,
  Button,
  Grid,
} from "@mui/material";
import { Flight } from "../Types/FlightTypes";
import CarBunddle from "../CarBunddle";

// Airline data mapping
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

// Airport to city mapping
const airportCityMap: { [key: string]: string } = {
  EWR: "Newark", JFK: "New York", LGA: "New York",
  LAX: "Los Angeles", ORD: "Chicago", ATL: "Atlanta",
  DFW: "Dallas", SFO: "San Francisco", SEA: "Seattle",
  BOS: "Boston", DEL: "Delhi", BOM: "Mumbai", BLR: "Bengaluru",
  MAA: "Chennai", HYD: "Hyderabad", CCU: "Kolkata", DXB: "Dubai",
};

// Helper functions
const getAirlineName = (code: string): string =>
  airlinesData[code]?.name || "Unknown Airline";
const getAirlineIconURL = (code: string): string =>
  airlinesData[code]?.icon || "";
const formatPrice = (price: string | number) =>
  typeof price === "number"
    ? `₹${price.toLocaleString("en-IN")}`
    : `₹${parseFloat(price).toLocaleString("en-IN")}`;
const calculateFlightDuration = (flight: Flight) => {
  const dep = new Date(flight.trips[0].legs[0].departureDateTime).getTime();
  const arr = new Date(flight.trips[0].legs.slice(-1)[0].arrivalDateTime).getTime();
  return Math.round((arr - dep) / 60000); // minutes
};

interface TripReviewProps {
  departureFlight: Flight;
  returnFlight: Flight;
  passengers: number;
  from: string;
  to: string;
  fromDetails: any;
  toDetails: any;
  onBack: () => void;
  onConfirm: () => void;
}

const TripReview: React.FC<TripReviewProps> = ({
  departureFlight,
  returnFlight,
  passengers,
  from,
  to,
  onConfirm,
}) => {
  const departureLeg = departureFlight.trips[0].legs[0];
  const returnLeg = returnFlight.trips[0].legs[0];
  const totalPrice =
    parseFloat(departureFlight.totalPrice) + parseFloat(returnFlight.totalPrice);

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const formatDayMonth = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });

  const FlightCard = ({
    fromCity,
    toCity,
    leg,
    flight,
  }: {
    fromCity: string;
    toCity: string;
    leg: any;
    flight: Flight;
  }) => (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        borderRadius: 3,
        mb: 2,
        backgroundColor: "#fff",
      }}
    >
      <Typography sx={{ fontSize: 18, fontWeight: 600, mb: 0.5 }}>
        {fromCity} → {toCity}
      </Typography>
      <Typography sx={{ fontSize: 15, color: "text.secondary", mb: 1.5 }}>
        {formatTime(leg.departureDateTime)} - {formatTime(leg.arrivalDateTime)} ·{" "}
        {Math.floor(calculateFlightDuration(flight) / 60)}h
      </Typography>
      <Box display="flex" alignItems="center" gap={1}>
        <img
          src={getAirlineIconURL(leg.operatingCarrierCode)}
          alt={getAirlineName(leg.operatingCarrierCode)}
          width={20}
          height={20}
          style={{ objectFit: "contain" }}
        />
        <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
          {getAirlineName(leg.operatingCarrierCode)} • {formatDayMonth(leg.departureDateTime)}
        </Typography>
      </Box>
    </Paper>
  );

  return (
    <Grid container spacing={3}>
      {/* Left column */}
      <Grid item xs={12} md={8}>
        <FlightCard
          fromCity={airportCityMap[from] || from}
          toCity={airportCityMap[to] || to}
          leg={departureLeg}
          flight={departureFlight}
        />
        <FlightCard
          fromCity={airportCityMap[to] || to}
          toCity={airportCityMap[from] || from}
          leg={returnLeg}
          flight={returnFlight}
        />
        <CarBunddle />
      </Grid>
      
      {/* Right column */}
      <Grid item xs={12} md={4}>
        <Paper
          elevation={1}
          sx={{
            p: 3,
            borderRadius: 3,
            backgroundColor: "#fff",
          }}
        >
          <Typography sx={{ fontSize: 18, fontWeight: 600, mb: 1 }}>
            Price Summary
          </Typography>
          <Typography sx={{ fontSize: 14, color: "text.secondary", mb: 2 }}>
            Traveller: {passengers} Adult{passengers > 1 ? "s" : ""}
          </Typography>

          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography sx={{ fontSize: 15 }}>Flight</Typography>
            <Typography sx={{ fontSize: 15 }}>
              {formatPrice(totalPrice - 7060)}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography sx={{ fontSize: 15 }}>Taxes & Fees</Typography>
            <Typography sx={{ fontSize: 15 }}>
              {formatPrice(7060)}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box display="flex" justifyContent="space-between" mb={3}>
            <Typography sx={{ fontSize: 16, fontWeight: 600 }}>Trip Total</Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: "primary.main" }}>
              {formatPrice(totalPrice)}
            </Typography>
          </Box>

          <Button
            variant="contained"
            fullWidth
            sx={{
              textTransform: "none",
              fontSize: 16,
              py: 1.2,
              borderRadius: 2,
              fontWeight: 600,
            }}
            onClick={onConfirm}
          >
            Check Out
          </Button>
        </Paper>
        
      </Grid>
      
    </Grid>

    
  );
};

export default TripReview;
