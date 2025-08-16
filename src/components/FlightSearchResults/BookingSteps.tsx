import React from "react";
import { Box, Breadcrumbs, Typography, Link } from "@mui/material";
import { NavigateNext as NavigateNextIcon } from "@mui/icons-material";
import { Flight } from "../Types/FlightTypes";
import { BookingStep } from "./FlightSearchResults";

interface BookingStepsProps {
  currentStep: BookingStep;
  setCurrentStep: (step: BookingStep) => void;
  selectedDepartureFlight: Flight | null;
  selectedReturnFlight: Flight | null;
  from: string;
  to: string;
  isOneWay: boolean;
  getAirlineName: (code: string) => string;
}

const BookingSteps: React.FC<BookingStepsProps> = ({
  currentStep,
  setCurrentStep,
  selectedDepartureFlight,
  selectedReturnFlight,
  from,
  to,
  isOneWay,
  getAirlineName,
}) => {
  if (isOneWay) return null;

  const highlight = {
    fontWeight: 700,
    px: 1.5,
    py: 0.5,
    borderRadius: 1.5,
    transition: ".18s",
    bgcolor: "white",
    color: "primary.main",
    border: "1px solid",
    borderColor: "divider",
    boxShadow: "none",
    display: "inline-flex",
    alignItems: "center",
    whiteSpace: "nowrap",
  };

  const inactive = {
    color: "text.disabled",
    px: 1.5,
    py: 0.5,
    display: "inline-flex",
    alignItems: "center",
    whiteSpace: "nowrap",
  };

  const departureFlightInfo = selectedDepartureFlight?.trips?.[0]?.legs;
  const returnFlightInfo = selectedReturnFlight?.trips?.[1]?.legs;

  return (
    <Box sx={{ mb: { xs: 2, md: 2 }, width: "auto", maxWidth: "100%" }}>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ ml: { xs: 0.5, md: 0 }, flexWrap: "nowrap" }}
      >
        {currentStep === "departure" ? (
          <>
            <Typography sx={highlight}>Select departure</Typography>
            <Typography sx={inactive}>Choose returning flight</Typography>
            <Typography sx={inactive}>Review your trip</Typography>
          </>
        ) : currentStep === "return" ? (
          <>
            <Typography sx={highlight}>
              {departureFlightInfo
                ? `${getAirlineName(departureFlightInfo[0]?.operatingCarrierCode)} · ${from} → ${to}`
                : "Departure selected"}
            </Typography>
            <Typography sx={highlight}>Choose returning flight</Typography>
            <Typography sx={inactive}>Review your trip</Typography>
          </>
        ) : (
          <>
            <Typography sx={highlight}>
              {departureFlightInfo
                ? `${getAirlineName(departureFlightInfo[0]?.operatingCarrierCode)} · ${from} → ${to}`
                : "Departure selected"}
            </Typography>
            <Typography sx={highlight}>
              {returnFlightInfo
                ? `${getAirlineName(returnFlightInfo[0]?.operatingCarrierCode)} · ${to} → ${from}`
                : "Return selected"}
            </Typography>
            <Typography sx={highlight}>Review your trip</Typography>
          </>
        )}
      </Breadcrumbs>

      {currentStep === "return" && (
        <Link
          underline="hover"
          onClick={() => setCurrentStep("departure")}
          sx={{ mt: 0.5, cursor: "pointer", ml: 1.5, fontSize: ".97em" }}
        >
          Change flight
        </Link>
      )}

      {currentStep === "review" && (
        <Box>
          <Link
            underline="hover"
            onClick={() => setCurrentStep("departure")}
            sx={{ mt: 0.5, cursor: "pointer", fontSize: ".97em", mr: 3.5 }}
          >
            Change flight
          </Link>
          <Link
            underline="hover"
            onClick={() => setCurrentStep("return")}
            sx={{ mt: 0.5, cursor: "pointer", fontSize: ".97em", ml: 3 }}
          >
            Change flight
          </Link>
        </Box>
      )}
    </Box>
  );
};

export default BookingSteps;