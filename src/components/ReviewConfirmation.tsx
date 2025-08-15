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
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import axios from "axios";
import { Flight, Passenger, Contact } from "./Types/FlightTypes";
import TravelerDetails from "../components/TravelerDetails";
import ContactInformation from "../components/ContactInformation";
import PaymentMethod from "../components/PaymentMethod";
import FlightItinerary from "../components/FlightItinerary";
import BaggageAllowance from "../components/BaggageAllowance";
import PriceSummary from "../components/PriceSummary";

const ReviewConfirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { passengers = [], contact = {}, flight } = location.state ?? {} as {
    passengers: Passenger[];
    contact: Contact;
    flight: Flight;
  };

  const handleConfirmBooking = async (
    payment: {
      cardName: string;
      cardNumber: string;
      expiryMonth: string;
      expiryYear: string;
      cvv: string;
    },
    termsAccepted: boolean
  ) => {
    if (!termsAccepted) {
      setError("You must accept the terms and conditions");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const flightOffer = flight.pricingAdditionalInfo;
      if (!flightOffer) {
        throw new Error("Flight offer data is missing");
      }

      const travelers = passengers.map((p: Passenger, idx: number) => {
        const traveler: any = {
          id: (idx + 1).toString(),
          title: p.title,
          firstName: p.firstName,
          lastName: p.lastName,
          dateOfBirth: p.dob,
          gender: p.gender.toUpperCase(),
          phones: [],
        };

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
        number: payment.cardNumber.replace(/\s/g, ""),
        expiry: `${payment.expiryMonth}/${payment.expiryYear}`,
        cvv: payment.cvv,
      };

      const flightOfferStr =
        typeof flightOffer === "string" ? flightOffer : JSON.stringify(flightOffer);
      const { data: bookingData } = await axios.post(
        "http://localhost:8080/booking/flight-order",
        { flightOffer: flightOfferStr, travelers, payment: paymentDetails }
      );

      console.log("Backend response:", bookingData); // Debug backend response
      navigate("/booking-success", {
        state: { bookingData, passengers, contact, flight },
      });
    } catch (err: any) {
      console.error("Booking error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Booking failed. Please try again or contact support."
      );
    } finally {
      setLoading(false);
    }
  };

  const total = parseFloat(flight.totalPrice) * passengers.length;
  const baseFare = parseFloat(flight.basePrice) * passengers.length;
  const taxes = total - baseFare;

  if (!flight || passengers.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <CheckCircleIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Missing Booking Details
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Please return to the search page and start your booking again.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/")}
          sx={{ px: 4, py: 1.5, borderRadius: 2 }}
        >
          Back to Search
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh", py: { xs: 3, sm: 4 } }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          fontWeight={700}
          color="primary"
          sx={{ mb: 4, textAlign: "center" }}
        >
          Review Your Booking
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Card elevation={0} sx={{ borderRadius: 3, mb: 3 }}>
              <CardContent>
                <TravelerDetails passengers={passengers} navigate={navigate} />
                <Divider sx={{ my: 3 }} />
                <ContactInformation contact={contact} />
                <Divider sx={{ my: 3 }} />
                <PaymentMethod
                  onConfirmBooking={handleConfirmBooking}
                  loading={loading}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={5}>
            <Card elevation={0} sx={{ borderRadius: 3, position: "sticky", top: 20 }}>
              <CardContent>
                <FlightItinerary flight={flight} />
                <Divider sx={{ my: 3 }} />
                <BaggageAllowance />
                <Divider sx={{ my: 3 }} />
                <PriceSummary
                  baseFare={baseFare}
                  taxes={taxes}
                  total={total}
                  passengerCount={passengers.length}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setError(null)}
            severity="error"
            sx={{ width: "100%" }}
          >
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default ReviewConfirmation;