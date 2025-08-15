import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Snackbar,
  Alert,
  Grid,
  TextField,
  Divider,
  Stack,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Paper,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import FlightLandIcon from "@mui/icons-material/FlightLand";
import ScheduleIcon from "@mui/icons-material/Schedule";
import LuggageIcon from "@mui/icons-material/Luggage";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";

const ReviewConfirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { passengers = [], contact = {}, flight } = location.state ?? {};

  // Payment state
  const [payment, setPayment] = useState({
    cardName: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });
  const [paymentErrors, setPaymentErrors] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  if (!flight || passengers.length === 0) {
    return (
      <Typography align="center" sx={{ mt: 12, fontWeight: 500, color: "text.secondary" }}>
        Missing booking details. Please start again.
      </Typography>
    );
  }

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    const groups = digits.match(/.{1,4}/g);
    return groups ? groups.join("-").slice(0, 19) : digits;
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "cardNumber") {
      setPayment({ ...payment, [name]: formatCardNumber(value) });
    } else if (name === "cvv") {
      setPayment({ ...payment, [name]: value.replace(/\D/g, "").slice(0, 4) });
    } else {
      setPayment({ ...payment, [name]: value });
    }
  };

  const validatePayment = () => {
    const errors = { cardName: "", cardNumber: "", expiry: "", cvv: "" };
    if (!payment.cardName) errors.cardName = "Cardholder name is required";
    const cleanCardNumber = payment.cardNumber.replace(/-/g, "");
    if (!cleanCardNumber || cleanCardNumber.length !== 16 || !/^\d{16}$/.test(cleanCardNumber))
      errors.cardNumber = "Valid 16-digit card number is required";
    if (!payment.expiryMonth || !payment.expiryYear) errors.expiry = "Expiry date is required";
    else {
      const expiryDate = new Date(parseInt(payment.expiryYear) + 2000, parseInt(payment.expiryMonth) - 1);
      if (expiryDate < new Date()) errors.expiry = "Expiry date must be in the future";
    }
    if (!payment.cvv || (payment.cvv.length < 3 || payment.cvv.length > 4) || !/^\d+$/.test(payment.cvv))
      errors.cvv = "Valid CVV (3-4 digits) is required";
    return errors;
  };

  const handleConfirmBooking = async () => {
    const paymentValidationErrors = validatePayment();
    setPaymentErrors(paymentValidationErrors);

    const hasPaymentErrors = Object.values(paymentValidationErrors).some((err) => !!err);
    if (hasPaymentErrors || !termsAccepted) {
      setError(
        hasPaymentErrors
          ? "Please correct the payment details."
          : "You must accept the terms and conditions."
      );
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const flightOffer = flight.flightOffer || flight.pricingAdditionalInfo;
      if (!flightOffer) {
        setError("Flight offer data is missing. Please try again.");
        setLoading(false);
        return;
      }

      const travelers = passengers.map((p: any, idx: number) => {
        const traveler = {
          id: (idx + 1).toString(),
          title: p.title,
          firstName: p.firstName,
          lastName: p.lastName,
          dateOfBirth: p.dob,
          gender: p.gender.toUpperCase(),
          phones: [],
        } as any;

        if (idx === 0) {
          traveler.phones = [
            {
              deviceType: "MOBILE",
              countryCallingCode: contact.countryCode.replace("+", ""),
              number: contact.phone,
            },
          ];
          traveler.email = contact.email;
        }

        if (p.passport) {
          traveler.documents = [
            {
              documentType: "PASSPORT",
              number: p.passport,
              issuanceDate: "2020-01-01",
              expiryDate: "2030-01-01",
              issuanceCountry: "IN",
              validityCountry: "IN",
              nationality: "IN",
              birthPlace: "Unknown",
              issuanceLocation: "Unknown",
              holder: true,
            },
          ];
        }

        return traveler;
      });

      const paymentDetails = {
        type: "credit_card",
        name: payment.cardName,
        number: payment.cardNumber.replace(/-/g, ""),
        expiry: `${payment.expiryMonth}/${payment.expiryYear}`,
        cvv: payment.cvv,
      };

      const flightOfferStr = typeof flightOffer === "string" ? flightOffer : JSON.stringify(flightOffer);
      const { data: bookingData } = await axios.post(
        "http://localhost:8080/booking/flight-order",
        { flightOffer: flightOfferStr, travelers, payment: paymentDetails }
      );
      navigate("/booking-success", { state: bookingData });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        "Booking failed. Please try again or contact support."
      );
      setLoading(false);
    }
  };

  const total = (parseFloat(flight.totalPrice) * passengers.length).toFixed(2);

  return (
    <Box sx={{ bgcolor: "#f4f6f8", minHeight: "100vh", py: { xs: 3, sm: 8 } }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight={700} color="primary" sx={{ flexGrow: 1, textAlign: "center" }}>
          Review & Book
        </Typography>
        <Grid container spacing={3}>
          
          {/* Main Content: Traveler, Contact, and Payment */}
          <Grid item xs={12} md={7}>
            <Paper
              sx={{
                p: { xs: 2, sm: 4 },
                borderRadius: 2,
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                bgcolor: "#fff",
              }}
            >
              <Box display="flex" alignItems="center" mb={4}>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate(-1)}
                  sx={{ textTransform: "none", color: "primary.main" }}
                >
                  Back to Edit
                </Button>
              </Box>

              {/* Travelers */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2, pb: 1, borderBottom: "1px solid #e0e0e0" }}>
                  Traveler Details
                </Typography>
                {passengers.map((p: any, idx: number) => (
                  <Box key={idx} sx={{ mb: 3, pb: 2, borderBottom: idx < passengers.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                    <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 1 }}>
                      Traveler {idx + 1} {idx === 0 && <Chip label="Primary" size="small" color="primary" sx={{ ml: 1 }} />}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Name:</strong> {p.title} {p.firstName} {p.lastName}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Date of Birth:</strong> {p.dob}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Gender:</strong> {p.gender}
                        </Typography>
                      </Grid>
                      {p.passport && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Passport:</strong> {p.passport}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ my: 4 }} />

              {/* Contact */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2, pb: 1, borderBottom: "1px solid #e0e0e0" }}>
                  Contact Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Email:</strong> {contact.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Phone:</strong> {contact.countryCode} {contact.phone}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 4 }} />

              {/* Payment Form */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2, pb: 1, borderBottom: "1px solid #e0e0e0" }}>
                  Payment Details
                </Typography>
                <Paper
                  sx={{
                    p: 3,
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    bgcolor: "#fafafa",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Cardholder Name"
                        name="cardName"
                        value={payment.cardName}
                        onChange={handlePaymentChange}
                        fullWidth
                        required
                        error={!!paymentErrors.cardName}
                        helperText={paymentErrors.cardName}
                        InputProps={{
                          sx: { borderRadius: 1, bgcolor: "#fff" },
                        }}
                        InputLabelProps={{ sx: { fontWeight: 500 } }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Card Number"
                        name="cardNumber"
                        value={payment.cardNumber}
                        onChange={handlePaymentChange}
                        fullWidth
                        required
                        inputProps={{ maxLength: 19 }}
                        error={!!paymentErrors.cardNumber}
                        helperText={paymentErrors.cardNumber}
                        InputProps={{
                          sx: { borderRadius: 1, bgcolor: "#fff" },
                        }}
                        InputLabelProps={{ sx: { fontWeight: 500 } }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth error={!!paymentErrors.expiry}>
                        <InputLabel sx={{ fontWeight: 500 }}>Expiry Month</InputLabel>
                        <Select
                          name="expiryMonth"
                          value={payment.expiryMonth}
                          onChange={(e) => setPayment({ ...payment, expiryMonth: e.target.value as string })}
                          label="Expiry Month"
                          sx={{ borderRadius: 1, bgcolor: "#fff" }}
                        >
                          {Array.from({ length: 12 }, (_, i) => (
                            <MenuItem key={i + 1} value={(i + 1).toString().padStart(2, "0")}>
                              {(i + 1).toString().padStart(2, "0")}
                            </MenuItem>
                          ))}
                        </Select>
                        {!!paymentErrors.expiry && <FormHelperText>{paymentErrors.expiry}</FormHelperText>}
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth error={!!paymentErrors.expiry}>
                        <InputLabel sx={{ fontWeight: 500 }}>Expiry Year</InputLabel>
                        <Select
                          name="expiryYear"
                          value={payment.expiryYear}
                          onChange={(e) => setPayment({ ...payment, expiryYear: e.target.value as string })}
                          label="Expiry Year"
                          sx={{ borderRadius: 1, bgcolor: "#fff" }}
                        >
                          {Array.from({ length: 10 }, (_, i) => {
                            const year = (new Date().getFullYear() + i).toString().slice(2);
                            return <MenuItem key={year} value={year}>{year}</MenuItem>;
                          })}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="CVV"
                        name="cvv"
                        value={payment.cvv}
                        onChange={handlePaymentChange}
                        fullWidth
                        required
                        inputProps={{ maxLength: 4 }}
                        error={!!paymentErrors.cvv}
                        helperText={paymentErrors.cvv}
                        InputProps={{
                          sx: { borderRadius: 1, bgcolor: "#fff" },
                        }}
                        InputLabelProps={{ sx: { fontWeight: 500 } }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            color="primary"
                          />
                        }
                        label={
                          <Typography variant="body2" color="text.secondary">
                            I agree to the{" "}
                            <a href="/terms" target="_blank" style={{ color: "#30476e" }}>
                              terms and conditions
                            </a>
                          </Typography>
                        }
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Box>

              {/* Action Button */}
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleConfirmBooking}
                disabled={loading || !termsAccepted}
                sx={{
                  borderRadius: 1,
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 700,
                  background: "#30476e",
                  "&:hover": { background: "#243455" },
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                {loading ? "Processing..." : "Complete Booking"}
              </Button>
            </Paper>
          </Grid>

          {/* Sidebar: Flight Details and Price */}
          <Grid
            item
            xs={12}
            md={5}
            sx={{
              position: { md: "sticky" },
              top: { md: 20 },
              alignSelf: { md: "flex-start" },
            }}
          >
            <Paper
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 2,
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                bgcolor: "#fff",
              }}
            >
              <Typography variant="h6" fontWeight={600} color="primary" sx={{ mb: 2, pb: 1, borderBottom: "1px solid #e0e0e0" }}>
                Flight Summary
              </Typography>

              {/* Flight Details */}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {new Date(flight.trips[0].legs[0].departureDateTime).toLocaleDateString([], {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </Typography>

              {flight.trips.map((trip: any, tripIdx: number) => (
                <Box key={tripIdx} sx={{ mb: 3 }}>
                  {trip.legs.map((leg: any, legIdx: number) => (
                    <Box key={legIdx} sx={{ mb: 2 }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        <FlightTakeoffIcon color="primary" fontSize="small" />
                        <Typography variant="body1" fontWeight={600}>
                          {leg.operatingCarrierCode} {leg.flightNumber}
                        </Typography>
                        <Chip
                          label={leg.aircraftCode}
                          size="small"
                          sx={{
                            bgcolor: "primary.light",
                            color: "primary.contrastText",
                            fontSize: "0.7rem",
                          }}
                        />
                      </Stack>
                      <Grid container spacing={1} sx={{ pl: 3, mb: 1 }}>
                        <Grid item xs={5}>
                          <Typography variant="body2" fontWeight={500}>
                            {new Date(leg.departureDateTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {leg.departureAirport}
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
                              "&:before": {
                                content: '""',
                                display: "block",
                                width: "8px",
                                height: "8px",
                                backgroundColor: "#bdbdbd",
                                borderRadius: "50%",
                                position: "absolute",
                                left: "-4px",
                                top: "-4px",
                              },
                              "&:after": {
                                content: '""',
                                display: "block",
                                width: "8px",
                                height: "8px",
                                backgroundColor: "#bdbdbd",
                                borderRadius: "50%",
                                position: "absolute",
                                right: "-4px",
                                top: "-4px",
                              },
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {leg.duration}
                          </Typography>
                        </Grid>
                        <Grid item xs={5}>
                          <Typography variant="body2" fontWeight={500}>
                            {new Date(leg.arrivalDateTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {leg.arrivalAirport}
                          </Typography>
                          {leg.arrivalTerminal && (
                            <Typography variant="caption" color="text.secondary">
                              Terminal {leg.arrivalTerminal}
                            </Typography>
                          )}
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                  {trip.totalLayoverDuration && trip.totalLayoverDuration !== "0h 0m" && (
                    <Box sx={{ backgroundColor: "#fff8e1", p: 1, borderRadius: 1, textAlign: "center", mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Layover: {trip.totalLayoverDuration}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ))}

              <Divider sx={{ my: 3 }} />
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                Baggage Information
              </Typography>
              <Stack spacing={1} sx={{ mb: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <LuggageIcon color="action" fontSize="small" />
                  <Typography variant="body2">Cabin: 8 kg / Adult</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <LuggageIcon color="action" fontSize="small" />
                  <Typography variant="body2">Check-in: 23 kg / Adult</Typography>
                </Stack>
              </Stack>

              <Divider sx={{ my: 3 }} />

              {/* Price Summary */}
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2, pb: 1, borderBottom: "1px solid #e0e0e0" }}>
                Price Summary
              </Typography>
              <Stack spacing={1} sx={{ mb: 2 }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Base Fare</Typography>
                  <Typography variant="body2">₹{(parseFloat(flight.totalPrice) / passengers.length).toFixed(2)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Taxes & Fees</Typography>
                  <Typography variant="body2">₹0.00</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Number of Travelers</Typography>
                  <Typography variant="body2">{passengers.length}</Typography>
                </Stack>
              </Stack>
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Total Price
                </Typography>
                <Typography variant="subtitle1" fontWeight={700} color="primary">
                  ₹{total}
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Error Snackbar */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: "100%" }}>
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default ReviewConfirmation;