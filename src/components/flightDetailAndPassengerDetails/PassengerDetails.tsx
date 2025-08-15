import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Grid, Typography } from "@mui/material";
import FlightDetails from "../flightDetailAndPassengerDetails/FlightDetials";
import PassengerForm from "../flightDetailAndPassengerDetails/PassangerForm";
import CancellationPolicy from "./CancellationPolicy";
import ImportantNotice from "./ImportantNotice";

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

const PassengerDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { flight, passengers } = location.state as { flight?: any; passengers?: number };

  if (!flight) return <Typography>No flight selected. Please go back.</Typography>;

  // Process flight data to include airline names and icons
  const processedFlight = {
    ...flight,
    trips: flight.trips?.map((trip: any) => ({
      ...trip,
      legs: trip.legs?.map((leg: any) => ({
        ...leg,
        airlineName: getAirlineName(leg.operatingCarrierCode),
        airlineIcon: getAirlineIconURL(leg.operatingCarrierCode),
      }))
    }))
  };

  return (
    <Grid container spacing={3} p={3}>
      <PassengerForm flight={processedFlight} passengersNumber={passengers} navigate={navigate} />
      {/* <FlightDetails flight={processedFlight} /> */}
      <CancellationPolicy flight={processedFlight}/>
      <ImportantNotice flight={processedFlight} />
    </Grid>
  );
};

export default PassengerDetails;
