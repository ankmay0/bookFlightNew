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

// Detect card brand for formOfPayments.creditCard
const detectCardBrand = (num: string | undefined) => {
  if (!num) return undefined;
  const n = num.replace(/\s|-/g, "");
  if (/^4\d{12}(\d{3})?(\d{3})?$/.test(n)) return "VISA";
  if (/^(5[1-5]\d{14}|2(2\d|[3-6]\d|7[01])\d{12})$/.test(n)) return "MASTERCARD";
  if (/^3[47]\d{13}$/.test(n)) return "AMERICAN_EXPRESS";
  if (/^6(?:011|5\d{2})\d{12}$/.test(n)) return "DISCOVER";
  if (/^(?:2131|1800|35\d{3})\d{11}$/.test(n)) return "JCB";
  if (/^3(?:0[0-5]|[68]\d)\d{11}$/.test(n)) return "DINERS";
  return undefined;
};

const toYYYYMM = (year: string, month: string) => {
  const y4 = year.length === 2 ? `20${year}` : year;
  const m2 = month.padStart(2, "0");
  return `${y4}-${m2}`;
};

type NavState = {
  passengers?: Passenger[];
  contact?: Partial<Contact>;
  flight?: Flight;
};

const ReviewConfirmation: React.FC = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Safely read and normalize navigation state
  const state = (location.state ?? {}) as NavState;
  const passengers: Passenger[] = state.passengers ?? [];
  const contactNormalized: Contact = {
    email: state.contact?.email ?? "",
    phone: state.contact?.phone ?? "",
    countryCode: state.contact?.countryCode ?? "91",
  };
  const flight = state.flight as Flight;

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
      const flightOffer = flight?.pricingAdditionalInfo;
      if (!flightOffer) {
        throw new Error("Flight offer data is missing");
      }

      // Normalize flightOffers to array of objects as required by Flight Create Orders
      const rawOffer =
        typeof flightOffer === "string" ? JSON.parse(flightOffer) : flightOffer;
      const flightOffers = Array.isArray(rawOffer) ? rawOffer : [rawOffer];

      // Build travelers per Amadeus schema
      const travelers = passengers.map((p: Passenger, idx: number) => {
        const lead = idx === 0;
        const t: any = {
          id: String(idx + 1),
          dateOfBirth: p.dob,
          gender: (p.gender || "").toUpperCase(),
          name: {
            firstName: p.firstName,
            lastName: p.lastName,
          },
        };

        if (lead) {
          t.contact = {
            emailAddress: contactNormalized.email,
            phones: contactNormalized.phone
              ? [
                  {
                    deviceType: "MOBILE",
                    countryCallingCode: contactNormalized.countryCode
                      .toString()
                      .replace("+", ""),
                    number: contactNormalized.phone,
                  },
                ]
              : [],
          };
        }

        if ((p as any).passport) {
          t.documents = [
            {
              documentType: "PASSPORT",
              number: (p as any).passport,
              issuanceDate: (p as any).passportIssuanceDate || "2020-01-01",
              expiryDate: (p as any).passportExpiryDate || "2030-01-01",
              issuanceCountry:
                (p as any).passportIssuanceCountry || "IN",
              validityCountry:
                (p as any).passportValidityCountry || "IN",
              nationality: (p as any).nationality || "IN",
              birthPlace: (p as any).birthPlace || "Unknown",
              issuanceLocation: (p as any).issuanceLocation || "Unknown",
              holder: true,
            },
          ];
        }

        return t;
      });

      // Optional booking-level contacts
      const orderContacts =
        contactNormalized.email || contactNormalized.phone
          ? [
              {
                addresseeName: {
                  firstName: passengers[0]?.firstName || "Lead",
                  lastName: passengers[0]?.lastName || "Passenger",
                },
                purpose: "STANDARD",
                emailAddress: contactNormalized.email,
                phones: contactNormalized.phone
                  ? [
                      {
                        deviceType: "MOBILE",
                        countryCallingCode: contactNormalized.countryCode
                          .toString()
                          .replace("+", ""),
                        number: contactNormalized.phone,
                      },
                    ]
                  : [],
              },
            ]
          : [];

      // Optional payment -> formOfPayments.creditCard with YYYY-MM
      const sanitizedCard = payment.cardNumber?.replace(/\s|-/g, "");
      const brand = detectCardBrand(sanitizedCard);
      const formOfPayments =
        sanitizedCard && brand
          ? [
              {
                creditCard: {
                  brand,
                  holder: payment.cardName,
                  number: sanitizedCard,
                  expiryDate: toYYYYMM(
                    payment.expiryYear,
                    payment.expiryMonth
                  ),
                  securityCode: payment.cvv,
                },
              },
            ]
          : undefined;

      const payload: any = {
        data: {
          type: "flight-order",
          flightOffers,
          travelers,
          contacts: orderContacts,
        },
      };

      if (formOfPayments) {
        payload.data.formOfPayments = formOfPayments;
      }

      const { data: bookingData } = await axios.post(
        `${backendUrl}/flights/flight-order`,
        payload
      );

      navigate("/booking-success", {
        state: { bookingData, passengers, contact: contactNormalized, flight },
      });
    } catch (err: any) {
      console.error("Booking error:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Booking failed. Please try again or contact support."
      );
    } finally {
      setLoading(false);
    }
  };

  const total = parseFloat(flight?.totalPrice ?? "0") * passengers.length;
  const baseFare = parseFloat(flight?.basePrice ?? "0") * passengers.length;
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
                <ContactInformation contact={contactNormalized} />
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
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: "100%" }}>
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default ReviewConfirmation;
