import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { AirplanemodeActive as AirplaneIcon } from '@mui/icons-material';
import FlightCardChatBot from './FlightCardChatBot';

interface Flight {
  totalPrice: string;
  basePrice?: string;
  currencyCode?: string;
  seatsAvailable?: number;
  trips: {
    from: string;
    to: string;
    legs: {
      operatingCarrierCode: string;
      departureDateTime: string;
      arrivalDateTime: string;
      flightNumber?: string;
      departureAirport?: string;
      arrivalAirport?: string;
      duration?: string;
    }[];
    stops: number;
    totalFlightDuration?: string;
  }[];
}

interface FlightParams {
  origin: string;
  destination: string;
  date: string;
  adults: number;
  returnDate?: string;
  children?: number;
}

interface FlightCardsContainerProps {
  flights: Flight[];
  flightParams: FlightParams;
  onBookFlight: (flight: Flight, flightParams: FlightParams) => void;
  onSeeMore: (flightParams: FlightParams) => void;
}

const FlightCardsContainerChatBot: React.FC<FlightCardsContainerProps> = ({
  flights,
  flightParams,
  onBookFlight,
  onSeeMore
}) => {
  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="body1" sx={{ mb: 1 }}>
        Here are the available flights:
      </Typography>
      {flights.length > 0 ? (
        <>
          {flights.map((flight, flightIdx) => (
            <FlightCardChatBot
              key={flightIdx}
              flight={flight}
              flightParams={flightParams}
              index={flightIdx}
              onBookFlight={onBookFlight}
            />
          ))}
          <Typography
            component="a"
            href="#"
            sx={{ 
              color: "#3b73df", 
              textDecoration: "underline", 
              cursor: "pointer", 
              display: "block", 
              mt: 1 
            }}
            onClick={(e) => {
              e.preventDefault();
              onSeeMore(flightParams);
            }}
          >
            See More
          </Typography>
        </>
      ) : (
        <Paper
          sx={{
            p: 2,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            textAlign: "center",
          }}
        >
          <AirplaneIcon sx={{ fontSize: 40, color: "grey.400", mb: 1 }} />
          <Typography variant="body1">No flights found. Try adjusting your query.</Typography>
        </Paper>
      )}
    </Box>
  );
};

export default FlightCardsContainerChatBot;