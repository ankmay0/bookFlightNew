import React from 'react';
import { Paper, Box, Typography, Button } from '@mui/material';

interface FlightLeg {
  operatingCarrierCode: string;
  departureDateTime: string;
  arrivalDateTime: string;
  flightNumber?: string;
  departureAirport?: string;
  arrivalAirport?: string;
  duration?: string;
}

interface FlightTrip {
  from: string;
  to: string;
  legs: FlightLeg[];
  stops: number;
  totalFlightDuration?: string;
}

interface Flight {
  totalPrice: string;
  basePrice?: string;
  currencyCode?: string;
  seatsAvailable?: number;
  trips: FlightTrip[];
}

interface FlightParams {
  origin: string;
  destination: string;
  date: string;
  adults: number;
  returnDate?: string;
  children?: number;
}

interface FlightCardProps {
  flight: Flight;
  flightParams: FlightParams;
  index: number;
  onBookFlight: (flight: Flight, flightParams: FlightParams) => void;
}

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

const getAirlineName = (code: string) => airlinesData[code]?.name || code;
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

const FlightCardChatBot: React.FC<FlightCardProps> = ({ flight, flightParams, index, onBookFlight }) => {
  if (!flight.trips?.[0]?.legs?.[0]) {
    console.warn("Invalid flight data:", flight);
    return null;
  }

  const trip = flight.trips[0];
  const firstLeg = trip.legs[0];
  const lastLeg = trip.legs[trip.legs.length - 1];
  const airlineCode = firstLeg.operatingCarrierCode;
  const duration = calculateFlightDuration(flight);
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
      aria-label={`Flight from ${trip.from} to ${trip.to} with ${getAirlineName(airlineCode)}`}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <img
            src={getAirlineIconURL(airlineCode)}
            alt={getAirlineName(airlineCode)}
            style={{ width: 40, height: 40 }}
          />
          <Box>
            <Typography variant="body1" fontWeight={600}>
              {getAirlineName(airlineCode)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {mapStopsToLabel(trip.stops)}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Typography variant="h6" fontWeight={700}>
            {formatPrice(flight.totalPrice)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {hours}h {minutes}m
          </Typography>
        </Box>
      </Box>
      <Box sx={{ mt: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="body2">
          {new Date(firstLeg.departureDateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
          {new Date(lastLeg.arrivalDateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {trip.from} → {trip.to}
        </Typography>
      </Box>
      <Button
        variant="contained"
        color="primary"
        onClick={() => onBookFlight(flight, flightParams)}
        sx={{ mt: 1, width: "100%" }}
        aria-label={`Book flight from ${trip.from} to ${trip.to} with ${getAirlineName(airlineCode)}`}
      >
        Book
      </Button>
    </Paper>
  );
};

export default FlightCardChatBot;