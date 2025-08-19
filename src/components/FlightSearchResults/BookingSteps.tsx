import React from "react";
import {
  Box,
  Breadcrumbs,
  Typography,
  Link,
  Chip,
  Avatar,
} from "@mui/material";
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
  getAirlineIconURL: (code: string) => string;
  isMultiCity?: boolean;
  segments?: Array<{ from: string; to: string; date: string }>;
  selectedFlights?: (Flight | null)[];
}

const BookingSteps: React.FC<BookingStepsProps> = ({
  currentStep,
  setCurrentStep,
  selectedDepartureFlight,
  selectedReturnFlight,
  from,
  to,
  isOneWay,
  getAirlineIconURL,
  isMultiCity,
  segments,
  selectedFlights,
}) => {
  if (isOneWay) return null;

  const activeChip = {
    fontWeight: 600,
    bgcolor: "primary.light",
    color: "primary.main",
    border: "1px solid",
    borderColor: "primary.main",
  };

  const inactiveChip = {
    bgcolor: "grey.100",
    color: "text.secondary",
  };

  const renderLogoLabel = (carrierCode?: string, routeText?: string) => (
    <Box display="flex" alignItems="center" gap={1}>
      {carrierCode && (
        <Avatar
          src={getAirlineIconURL(carrierCode)}
          alt="airline-logo"
          sx={{ width: 24, height: 24, bgcolor: "transparent" }}
        />
      )}
      {routeText && (
        <Typography variant="body2" fontWeight={500}>
          {routeText}
        </Typography>
      )}
    </Box>
  );

  const renderMultiCitySteps = () => {
    if (!isMultiCity || !segments || !selectedFlights) return null;

    const currentSegmentIndex = currentStep.startsWith("segment-")
      ? parseInt(currentStep.split("-")[1])
      : segments.length;

    return (
      <>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
          sx={{ flexWrap: "wrap" }}
        >
          {segments.map((segment, index) => {
            const flight = selectedFlights[index];
            const isActive =
              currentStep === `segment-${index}` ||
              (currentStep === "review" && index < segments.length);

            const label = flight
              ? renderLogoLabel(
                flight.trips[0].legs[0].operatingCarrierCode,
                `${segment.from} → ${segment.to}`
              )
              : `${segment.from} → ${segment.to}`;

            return (
              <Chip
                key={index}
                label={label}
                clickable
                sx={{
                  ... (isActive ? activeChip : inactiveChip),
                  "& .MuiChip-label": {
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",   // ✅ space between logo & text
                  },
                }}
              />
            );
          })}
          <Chip
            label="Review your trip"
            sx={currentStep === "review" ? activeChip : inactiveChip}
          />
        </Breadcrumbs>

        {(currentStep === "review" || currentStep.startsWith("segment-")) && (
          <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 2 }}>
            {segments.map((_, index) => {
              if (index <= currentSegmentIndex && selectedFlights[index]) {
                return (
                  <Link
                    key={index}
                    underline="hover"
                    onClick={() => setCurrentStep(`segment-${index}`)}
                    sx={{ cursor: "pointer", fontSize: ".9em" }}
                  >
                    Change Segment {index + 1}
                  </Link>
                );
              }
              return null;
            })}
          </Box>
        )}
      </>
    );
  };

  const renderRoundTripSteps = () => {
    const departureLeg = selectedDepartureFlight?.trips?.[0]?.legs?.[0];
    const returnLeg = selectedReturnFlight?.trips?.[0]?.legs?.[0];

    return (
      <>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
          sx={{ flexWrap: "wrap" }}
        >
          {currentStep === "departure" ? (
            <>
              <Chip label="Select departure" sx={activeChip} />
              <Chip label="Choose return" sx={inactiveChip} />
              <Chip label="Review trip" sx={inactiveChip} />
            </>
          ) : currentStep === "return" ? (
            <>
              <Chip
                label={
                  departureLeg
                    ? renderLogoLabel(
                      departureLeg.operatingCarrierCode,
                      `${from} → ${to}`
                    )
                    : "Departure selected"
                }
                sx={activeChip}
              />
              <Chip label="Choose return" sx={activeChip} />
              <Chip label="Review trip" sx={inactiveChip} />
            </>
          ) : (
            <>
              <Chip
                label={
                  departureLeg
                    ? renderLogoLabel(
                      departureLeg.operatingCarrierCode,
                      `${from} → ${to}`
                    )
                    : "Departure selected"
                }
                sx={activeChip}
              />
              <Chip
                label={
                  returnLeg
                    ? renderLogoLabel(
                      returnLeg.operatingCarrierCode,
                      `${to} → ${from}`
                    )
                    : "Return selected"
                }
                sx={activeChip}
              />
              <Chip label="Review trip" sx={activeChip} />
            </>
          )}
        </Breadcrumbs>

        {currentStep === "return" && (
          <Link
            underline="hover"
            onClick={() => setCurrentStep("departure")}
            sx={{ mt: 1, cursor: "pointer", fontSize: ".9em" }}
          >
            Change departure
          </Link>
        )}

        {currentStep === "review" && (
          <Box sx={{ mt: 1, display: "flex", gap: 2 }}>
            <Link
              underline="hover"
              onClick={() => setCurrentStep("departure")}
              sx={{ cursor: "pointer", fontSize: ".9em" }}
            >
              Change departure
            </Link>
            <Link
              underline="hover"
              onClick={() => setCurrentStep("return")}
              sx={{ cursor: "pointer", fontSize: ".9em" }}
            >
              Change return
            </Link>
          </Box>
        )}
      </>
    );
  };

  return (
    <Box
      sx={{
        mb: 2,
        width: "100%",
        ml: { xs: 0, md: 45 }, // ✅ Pushes BookingSteps right to avoid overlap
      }}
    >
      {isMultiCity ? renderMultiCitySteps() : renderRoundTripSteps()}
    </Box>
  );
};

export default BookingSteps;
