import React from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Stack,
  Chip,
} from "@mui/material";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import FlightLandIcon from "@mui/icons-material/FlightLand";
import LuggageIcon from "@mui/icons-material/Luggage";
import WifiIcon from "@mui/icons-material/Wifi";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import TvIcon from "@mui/icons-material/Tv";
import PowerIcon from "@mui/icons-material/Power";
import ScheduleIcon from "@mui/icons-material/Schedule";

interface FlightDetailsProps {
  flight: any;
}

const FlightDetails: React.FC<FlightDetailsProps> = ({ flight }) => {
  return (
    <Grid item xs={12}>
      <Paper
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 2,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          bgcolor: "#fff",
          width: "100%",
          maxWidth: 1200,
          mx: "auto",
          my: 2,
        }}
        role="region"
        aria-labelledby="flight-details-title"
      >
        <Typography
          id="flight-details-title"
          variant="h5"
          fontWeight={600}
          color="primary"
          gutterBottom
          sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}
        >
          {flight.trips[0].from} → {flight.trips[flight.trips.length - 1].to}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          mb={3}
          sx={{ fontSize: { xs: "0.875rem", md: "1rem" }, lineHeight: 1.6 }}
        >
          {new Date(flight.trips[0].legs[0].departureDateTime).toLocaleDateString([], {
            weekday: "long",
            month: "short",
            day: "numeric",
            year: "numeric",
          })}{" "}
          • {flight.trips[0].stops} stop{flight.trips[0].stops !== 1 ? "s" : ""} •{" "}
          {flight.trips[0].totalFlightDuration}
        </Typography>

        {flight.trips.map((trip: any, tripIdx: number) => (
          <Box key={tripIdx} mb={3}>
            {trip.legs.map((leg: any, legIdx: number) => (
              <Box
                key={legIdx}
                sx={{
                  borderBottom: "1px solid #e0e0e0",
                  pb: 2,
                  mb: 2,
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={3}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <FlightTakeoffIcon color="primary" aria-hidden="true" />
                      <Typography
                        variant="subtitle1"
                        fontWeight={500}
                        sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}
                      >
                        {leg.operatingCarrierCode} {leg.flightNumber}
                      </Typography>
                      <Chip
                        label={leg.aircraftCode}
                        size="small"
                        sx={{
                          bgcolor: "primary.light",
                          color: "primary.contrastText",
                          fontWeight: 500,
                          borderRadius: 1,
                        }}
                        aria-label={`Aircraft: ${leg.aircraftCode}`}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Typography
                      fontWeight={500}
                      sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}
                    >
                      {new Date(leg.departureDateTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" } }}
                    >
                      ({leg.departureAirport}
                      {leg.departureTerminal && `, T${leg.departureTerminal}`})
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <ScheduleIcon fontSize="small" color="action" />
                      <Typography
                        variant="body2"
                        sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" } }}
                      >
                        {leg.duration}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Typography
                      fontWeight={500}
                      sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}
                    >
                      {new Date(leg.arrivalDateTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" } }}
                    >
                      ({leg.arrivalAirport}
                      {leg.arrivalTerminal && `, T${leg.arrivalTerminal}`})
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" } }}
                    >
                      Economy Basic
                    </Typography>
                    <Stack direction="row" spacing={1} mt={1}>
                      <WifiIcon fontSize="small" color="action" titleAccess="Wi-Fi available" />
                      <LocalDiningIcon fontSize="small" color="action" titleAccess="Meals provided" />
                      <TvIcon fontSize="small" color="action" titleAccess="In-flight entertainment" />
                      <PowerIcon fontSize="small" color="action" titleAccess="Power outlet available" />
                    </Stack>
                  </Grid>
                </Grid>
                <Box display="flex" gap={2} mt={2}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <LuggageIcon fontSize="small" color="action" />
                    <Typography
                      variant="body2"
                      sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" } }}
                    >
                      Cabin: 8 kg / Adult
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <LuggageIcon fontSize="small" color="action" />
                    <Typography
                      variant="body2"
                      sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" } }}
                    >
                      Check-in: 23 kg / Adult
                    </Typography>
                  </Stack>
                </Box>
              </Box>
            ))}
            {trip.totalLayoverDuration && trip.totalLayoverDuration !== "0h 0m" && (
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <FlightLandIcon fontSize="small" color="error" />
                <Typography
                  variant="body2"
                  color="error"
                  sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" }, fontWeight: 500 }}
                >
                  Change of planes • Layover: {trip.totalLayoverDuration}
                </Typography>
              </Stack>
            )}
          </Box>
        ))}
      </Paper>
    </Grid>
  );
};

export default FlightDetails;