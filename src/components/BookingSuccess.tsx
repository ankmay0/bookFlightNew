import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Stack,
  Button,
  Chip,
  Container,
  Divider,
} from "@mui/material";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import FlightLandIcon from "@mui/icons-material/FlightLand";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";

const BookingSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const confettiRef = useRef<HTMLDivElement>(null);
  const data = (location.state as any) ?? {};

  useEffect(() => {
    if (!data.bookingData?.orderId) {
      navigate("/");
      return;
    }
    const confettiColors = [
      "#2c39e8",
      "#1f2ac4",
      "#10b981",
      "#e0f2f1",
      "#2563eb",
      "#fbbf24",
    ];
    const confettiContainer = confettiRef.current;
    if (!confettiContainer) return;
    for (let i = 0; i < 40; i++) {
      const conf = document.createElement("div");
      conf.style.position = "absolute";
      conf.style.left = Math.random() * 100 + "vw";
      conf.style.width = "10px";
      conf.style.height = "10px";
      conf.style.background = confettiColors[i % confettiColors.length];
      conf.style.opacity = "0.88";
      conf.style.borderRadius = "2px";
      conf.style.top = "-40px";
      conf.style.transform = `rotate(${Math.random() * 50 - 25}deg)`;
      conf.style.animation = `fallConfetti 1.6s ${(Math.random() * 1.1).toFixed(
        2
      )}s cubic-bezier(.62,.63,0,1) forwards`;
      confettiContainer.appendChild(conf);
    }
    return () => {
      if (confettiContainer) confettiContainer.innerHTML = "";
    };
  }, [data.bookingData?.orderId, navigate]);

  if (!data.bookingData?.orderId) return null;

  const traveler = data.passengers?.[0] || {};
  const passengers = data.passengers || [];
  const flight = data.flight || {};
  const trip = flight.trips?.[0] || {};
  const legs = trip.legs || [];
  const contact = data.contact || {};

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", position: "relative" }}>
      <Box
        ref={confettiRef}
        sx={{
          pointerEvents: "none",
          position: "fixed",
          inset: 0,
          zIndex: 50,
        }}
      />

      <Container maxWidth="md" sx={{ py: { xs: 3, sm: 6 } }}>
        <Paper
          sx={{
            p: { xs: 2, sm: 4 },
            borderRadius: 4,
            border: "1px solid #e2e8f0",
            boxShadow: "none",
            bgcolor: "#fff",
          }}
        >
          <Grid container spacing={4} alignItems="flex-start">
            <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
              <Box
                component="svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                sx={{
                  mx: "auto",
                  animation: "checkPop .58s cubic-bezier(.23,1.09,.59,.89) .11s both",
                  display: "block",
                }}
              >
                <circle cx="12" cy="12" r="12" fill="#10b981" opacity="0.18" />
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="#10b981"
                  strokeWidth="1.5"
                  fill="white"
                />
                <path
                  d="M7 12L10 15L17 8"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <animate
                    attributeName="stroke-dasharray"
                    from="0,20"
                    to="20,0"
                    dur="0.5s"
                    fill="freeze"
                  />
                </path>
              </Box>
            </Grid>

            <Grid item xs={12} sm={9}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h5" fontWeight={700} color="#10b981" sx={{ mb: 1 }}>
                    Flight Booked! ✈️
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    Your flight has been successfully booked. 🎉
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Booking Reference
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "#2c39e8",
                      letterSpacing: 2,
                      wordBreak: "break-all",
                      mt: 0.5,
                      mb: 1,
                    }}
                  >
                    {data.bookingData.orderId ? decodeURIComponent(data.bookingData.orderId) : "N/A"}
                  </Typography>
                </Box>

                <Divider sx={{ my: 1 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="h6" fontWeight={600} mb={1}>
                        <PersonIcon sx={{ mr: 1, verticalAlign: "middle", color: "#2c39e8" }} />
                        Passenger Details
                      </Typography>
                      <Typography variant="body2">
                        <strong>Name:</strong> {traveler.title || ''} {traveler.firstName || ''} {traveler.lastName || ''}
                      </Typography>
                      <Typography variant="body2">
                        <strong>DOB:</strong> {traveler.dob || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Gender:</strong> {traveler.gender || 'N/A'}
                      </Typography>
                      {contact.phone && (
                        <Typography variant="body2">
                          <PhoneIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }} />
                          {contact.countryCode || ''} {contact.phone || ''}
                        </Typography>
                      )}
                      <Typography variant="body2">
                        <strong>Email:</strong> {contact.email || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="h6" fontWeight={600} mb={1}>
                        <FlightTakeoffIcon sx={{ mr: 1, verticalAlign: "middle", color: "#2c39e8" }} />
                        Flight Information
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        {trip.from || 'N/A'} → {trip.to || 'N/A'} • {trip.stops === 0 ? "Direct" : `${trip.stops || 0} Stop${(trip.stops || 0) > 1 ? "s" : ""}`}
                      </Typography>
                      {legs.map((leg: any, idx: number) => (
                        <Box key={idx} sx={{ mb: 1, border: "1px solid #e2e8f0", borderRadius: 2, p: 0.5, bgcolor: "#f8fafc" }}>
                          <Grid container alignItems="center" spacing={1}>
                            <Grid item xs={12}>
                              <Chip
                                label={`${leg.operatingCarrierCode || ''} ${leg.flightNumber || ''}`}
                                color="primary"
                                size="small"
                                sx={{ fontWeight: 600, fontSize: "0.8rem" }}
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2">
                                <FlightTakeoffIcon sx={{ fontSize: 13, mr: 0.5, color: "#10b981" }} />
                                <strong>
                                  {leg.departureDateTime
                                    ? new Date(leg.departureDateTime).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : 'N/A'}
                                </strong> {leg.departureAirport || 'N/A'}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2">
                                <FlightLandIcon sx={{ fontSize: 13, mr: 0.5, color: "#f59e0b" }} />
                                <strong>
                                  {leg.arrivalDateTime
                                    ? new Date(leg.arrivalDateTime).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : 'N/A'}
                                </strong> {leg.arrivalAirport || 'N/A'}
                              </Typography>
                            </Grid>
                            <Grid item xs={12}>
                              {leg.layoverAfter && (
                                <Typography variant="body2" color="text.secondary">
                                  <strong>Layover:</strong> {leg.layoverAfter}
                                </Typography>
                              )}
                            </Grid>
                          </Grid>
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" fontWeight={600}>
                    Total Paid
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="#10b981">
                    ₹{(flight.totalPrice && passengers.length) ? (parseFloat(flight.totalPrice) * passengers.length).toFixed(2) : "N/A"}
                  </Typography>
                </Stack>

                <Box sx={{ textAlign: "center", pt: 1 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate("/")}
                    sx={{
                      borderRadius: 3,
                      px: 3,
                      py: 1,
                      fontSize: "1.05rem",
                      fontWeight: 600,
                      bgcolor: "#2c39e8",
                      "&:hover": { bgcolor: "#1f2ac4" },
                    }}
                  >
                    Book Another Flight
                  </Button>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      <style>
        {`
        @keyframes fallConfetti {
          to {
            top: 105vh;
            opacity: 0.05;
            transform: rotate(180deg);
          }
        }
        @keyframes fadeInPop {
          0% { opacity: 0; transform: translateY(20px);}
          100% { opacity: 1; transform: translateY(0);}
        }
        @keyframes titlePopIn {
          from {opacity:0; transform: scale(0.85);}
          to {opacity:1; transform: scale(1);}
        }
        @keyframes checkPop {
          0% { opacity: 0; transform: scale(0.2);}
          70% { opacity: 1; transform: scale(1.12);}
          100% { opacity: 1; transform: scale(1);}
        }
        `}
      </style>
    </Box>
  );
};

export default BookingSuccess;