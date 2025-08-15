import React from "react";
import { Box } from "@mui/material";
import { getCityName } from "../../utils/cityName"; // Adjust the import path as necessary

interface FlightLeg {
  departureDateTime: string;
  arrivalDateTime: string;
  departureAirport: string;
  arrivalAirport: string;
  duration: string;
  aircraftCode: string;
}

interface FlightDetailsProps {
  legs: FlightLeg[];
}

const FlightDetails: React.FC<FlightDetailsProps> = ({ legs }) => {
  const prettyTime = (dt: string) => (
    <span style={{ fontWeight: 700, fontSize: 24 }}>
      {new Date(dt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
    </span>
  );

  const CityConnectorLine = () => (
    <Box
      sx={{
        height: 4,
        background: "linear-gradient(90deg, #209e48 70%, #8fdc94 100%)",
        borderRadius: 2,
        minWidth: 32,
        mx: 1.5,
        display: "inline-block",
      }}
    />
  );

  const cityText = (airport: string) => (
    <span>
      <span style={{ fontWeight: 600, fontSize: 16, color: "#222" }}>
        {getCityName(airport)}
      </span>
      <span style={{ color: "#888", fontWeight: 400, fontSize: 14, marginLeft: 4 }}>
        ({airport})
      </span>
    </span>
  );

  return (
    <Box>
      {legs.map((leg, idx) => (
        <Box
          key={idx}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            my: 2,
            px: 2,
            py: 1.5,
            borderRadius: 2,
            bgcolor: "#ffffff",
            border: "1px solid #eee",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", flex: 1, overflow: "auto" }}>
            <Box sx={{ textAlign: "right", minWidth: 130, pr: 1 }}>
              {prettyTime(leg.departureDateTime)}
              <br />
              {cityText(leg.departureAirport)}
            </Box>
            <CityConnectorLine />
            <Box sx={{ textAlign: "left", minWidth: 130, pl: 1 }}>
              {prettyTime(leg.arrivalDateTime)}
              <br />
              {cityText(leg.arrivalAirport)}
            </Box>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5, minWidth: 120 }}>
            <span style={{ color: "#666", fontWeight: 600, fontSize: 15 }}>{leg.duration}</span>
            <span style={{ color: "#aaa", fontSize: 14 }}>
              Aircraft: {leg.aircraftCode}
            </span>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default FlightDetails;
