import React, { useState } from "react";
import { Box, Card, CardContent, Typography, IconButton, Collapse, Grid, Avatar, Chip } from "@mui/material";
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from "@mui/icons-material";
import { format } from "date-fns";
import { Flight, Trip, Leg } from "./Types/FlightTypes";
import { getCityName, getAirlineName } from "../utils/FlightData";
import { formatTime } from "../utils/LocationUtils";

interface FlightItineraryProps {
  flight: Flight;
}

// Utility function to parse duration string (e.g., "2h 30m") to minutes
const parseDurationToMinutes = (duration: string): number => {
  const [hours, minutes] = duration.split(" ").map((part) => {
    const num = parseInt(part.replace(/\D/g, ""));
    return isNaN(num) ? 0 : num;
  });
  return hours * 60 + (minutes || 0);
};

// Utility function to format minutes to "Xh Ym"
const formatMinutesToDuration = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

const FlightItinerary: React.FC<FlightItineraryProps> = ({ flight }) => {
  const [expandedFlight, setExpandedFlight] = useState<number | null>(0);

  const handleFlightExpand = (tripIndex: number) => {
    setExpandedFlight(expandedFlight === tripIndex ? null : tripIndex);
  };

  // Calculate total trip duration including layovers
  const calculateTotalTripDuration = (trip: Trip): string => {
    const legDurations = trip.legs.reduce((total, leg) => {
      return total + parseDurationToMinutes(leg.duration);
    }, 0);
    const layoverDuration = trip.totalLayoverDuration
      ? parseDurationToMinutes(trip.totalLayoverDuration)
      : 0;
    return formatMinutesToDuration(legDurations + layoverDuration);
  };

  return (
    <>
      <Typography variant="h6" fontWeight={600} color="primary" sx={{ mb: 3 }}>
        Your Flight Itinerary
      </Typography>
      {flight.trips.map((trip: Trip, tripIdx: number) => (
        <Box key={tripIdx} sx={{ mb: 3 }}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 2,
              borderColor: expandedFlight === tripIdx ? "primary.main" : "divider",
              boxShadow: expandedFlight === tripIdx ? "0 0 0 1px #1976d2" : "none",
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{ cursor: "pointer" }}
                onClick={() => handleFlightExpand(tripIdx)}
              >
                <Box>
                  <Typography fontWeight={600}>
                    {tripIdx === 0 ? "Departure" : "Return"} Flight
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {format(new Date(trip.legs[0].departureDateTime), "EEE, MMM d, yyyy")} • Total: {calculateTotalTripDuration(trip)}
                  </Typography>
                </Box>
                <IconButton size="small">
                  {expandedFlight === tripIdx ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>

              <Collapse in={expandedFlight === tripIdx}>
                <Box sx={{ mt: 2 }}>
                  {trip.legs.map((leg: Leg, legIdx: number) => (
                    <Box key={legIdx} sx={{ mb: 3 }}>
                      <Box display="flex" alignItems="center" mb={1.5}>
                        <Avatar
                          src={`https://content.airhex.com/content/logos/airlines_${leg.operatingCarrierCode}_50_50_r.png`}
                          sx={{ width: 24, height: 24, mr: 1 }}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "";
                          }}
                        />
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {leg.operatingCarrierCode} {leg.flightNumber} - {getAirlineName(leg.operatingCarrierCode)}
                          </Typography>
                        </Box>
                        <Chip label={leg.aircraftCode} size="small" sx={{ ml: 1 }} />
                      </Box>

                      <Grid container spacing={1} sx={{ mb: 1 }}>
                        <Grid item xs={5}>
                          <Typography fontWeight={500}>
                            {formatTime(leg.departureDateTime)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {getCityName(leg.departureAirport)} ({leg.departureAirport})
                          </Typography>
                          {leg.departureTerminal && (
                            <Typography variant="caption" color="text.secondary">
                              Terminal {leg.departureTerminal}
                            </Typography>
                          )}
                        </Grid>
                        <Grid item xs={2} sx={{ textAlign: "center" }}>
                          <Box
                            sx={{
                              width: "100%",
                              height: "1px",
                              backgroundColor: "#bdbdbd",
                              position: "relative",
                              top: "12px",
                              "&:before, &:after": {
                                content: '""',
                                display: "block",
                                width: 8,
                                height: 8,
                                backgroundColor: "#bdbdbd",
                                borderRadius: "50%",
                                position: "absolute",
                                top: -4,
                              },
                              "&:before": { left: -4 },
                              "&:after": { right: -4 },
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {leg.duration}
                          </Typography>
                        </Grid>
                        <Grid item xs={5}>
                          <Typography fontWeight={500}>
                            {formatTime(leg.arrivalDateTime)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {getCityName(leg.arrivalAirport)} ({leg.arrivalAirport})
                          </Typography>
                          {leg.arrivalTerminal && (
                            <Typography variant="caption" color="text.secondary">
                              Terminal {leg.arrivalTerminal}
                            </Typography>
                          )}
                        </Grid>
                      </Grid>

                      {leg.layoverAfter &&
                        leg.layoverAfter !== "0h 0m" &&
                        legIdx < trip.legs.length - 1 && (
                          <Box
                            sx={{
                              backgroundColor: "#fff8e1",
                              p: 1.5,
                              borderRadius: 1,
                              textAlign: "center",
                              mb: 2,
                            }}
                          >
                            <Typography variant="body2" color="text.secondary">
                              Layover in {getCityName(leg.arrivalAirport)} (
                              {leg.arrivalAirport}): {leg.layoverAfter}
                            </Typography>
                          </Box>
                        )}
                    </Box>
                  ))}

                  {trip.totalLayoverDuration &&
                    trip.totalLayoverDuration !== "0h 0m" && (
                      <Box
                        sx={{
                          backgroundColor: "#fff8e1",
                          p: 1.5,
                          borderRadius: 1,
                          textAlign: "center",
                          mb: 2,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Total Layover: {trip.totalLayoverDuration}
                        </Typography>
                      </Box>
                    )}
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        </Box>
      ))}
    </>
  );
};

export default FlightItinerary;