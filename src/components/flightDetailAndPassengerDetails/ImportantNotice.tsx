import React from "react";
import { Paper, Typography, Stack, Divider, Box } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import FlightIcon from "@mui/icons-material/Flight";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ChildFriendlyIcon from "@mui/icons-material/ChildFriendly";
import LuggageIcon from "@mui/icons-material/Luggage";
import PassportIcon from "@mui/icons-material/Assignment";

interface ImportantNoticeProps {
  flight: any;
}

const ImportantNotice: React.FC<ImportantNoticeProps> = ({ flight }) => {
  const fromAirport = flight.trips[0].from;
  const toAirport = flight.trips[flight.trips.length - 1].to;
  const airline = flight.trips[0].airline;

  return (
    <Paper
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 2,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        bgcolor: "#fff",
        width: "100%",
        maxWidth: 1400,
        mx: "auto",
        my: 2,
      }}
      role="region"
      aria-labelledby="important-notice-title"
    >
      <Stack direction="row" spacing={1} alignItems="center" mb={2}>
        <InfoIcon color="warning" aria-hidden="true" />
        <Typography
          id="important-notice-title"
          variant="h5"
          fontWeight={600}
          color="primary"
          sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}
        >
          Important Information
        </Typography>
      </Stack>

      <Divider sx={{ my: 2, borderColor: "#e0e0e0" }} />

      <Box mb={3}>
        <Typography variant="subtitle1" fontWeight={500} gutterBottom>
          <FlightIcon sx={{ verticalAlign: "middle", mr: 1, color: "text.secondary" }} />
          Your Flight Details
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          Your flight with <strong>{airline}</strong> departs from <strong>{fromAirport}</strong> and arrives at <strong>{toAirport}</strong>. Please confirm all transit points and connections before your journey.
        </Typography>
      </Box>

      <Box mb={3}>
        <Typography variant="subtitle1" fontWeight={500} gutterBottom>
          <FlightIcon sx={{ verticalAlign: "middle", mr: 1, color: "text.secondary" }} />
          Nearby Airport Notice
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          • Departure from <strong>{fromAirport}</strong>, near a major airport hub. Verify alternate route options.<br />
          • Arrival at <strong>{toAirport}</strong>, which may differ from your originally searched airport. Confirm your final destination.
        </Typography>
      </Box>

      <Box mb={3}>
        <Typography variant="subtitle1" fontWeight={500} gutterBottom>
          <PassportIcon sx={{ verticalAlign: "middle", mr: 1, color: "text.secondary" }} />
          Visa & Travel Requirements
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          • Passengers on tourist or visit visas must carry confirmed return tickets and proof of accommodation.<br />
          • Passport must be valid for at least 6 months from departure.<br />
          • Carry printed copies of your visa; soft copies are not accepted at immigration.
        </Typography>
      </Box>

      <Box mb={3}>
        <Typography variant="subtitle1" fontWeight={500} gutterBottom>
          <LuggageIcon sx={{ verticalAlign: "middle", mr: 1, color: "text.secondary" }} />
          Baggage Information
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          Baggage dimensions and restricted items apply as per <strong>{airline}</strong>’s rules. Visit their official site for full baggage regulations.
        </Typography>
      </Box>

      <Box mb={3}>
        <Typography variant="subtitle1" fontWeight={500} gutterBottom>
          <ChildFriendlyIcon sx={{ verticalAlign: "middle", mr: 1, color: "text.secondary" }} />
          Unaccompanied Minors (UMNR)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          Children under 18 traveling alone may require prior clearance, forms, and additional charges from <strong>{airline}</strong>.
        </Typography>
      </Box>

      <Box mb={3}>
        <Typography variant="subtitle1" fontWeight={500} gutterBottom>
          <FlightIcon sx={{ verticalAlign: "middle", mr: 1, color: "text.secondary" }} />
          Fast Track Immigration (FTI-TTP)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          Available for Indian nationals and OCI cardholders. Visit <a href="https://mha.gov.in" target="_blank" rel="noopener noreferrer">mha.gov.in</a> for details.
        </Typography>
      </Box>

      <Typography
        variant="body2"
        color="error"
        sx={{ lineHeight: 1.6, fontWeight: 500 }}
        role="alert"
      >
        <WarningAmberIcon sx={{ verticalAlign: "middle", mr: 1 }} />
        Travelers are responsible for ensuring eligibility to enter destination and transit countries. Verify all regulations before departure.
      </Typography>
    </Paper>
  );
};

export default ImportantNotice;