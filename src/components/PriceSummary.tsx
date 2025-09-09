import React from "react";
import { Box, Stack, Typography, Divider } from "@mui/material";
import { formatPrice } from "../utils/LocationUtils";

interface PriceSummaryProps {
  baseFare: number;
  taxes: number;
  total: number;
  passengerCount: number;
}

const PriceSummary: React.FC<PriceSummaryProps> = ({ baseFare, taxes, total, passengerCount }) => {
  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        Price Summary
      </Typography>
      <Stack spacing={1.5} sx={{ mb: 2 }}>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="body2">
            Base Fare ({passengerCount} {passengerCount > 1 ? "travelers" : "traveler"})
          </Typography>
          <Typography variant="body2">{formatPrice(baseFare)}</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="body2">Taxes & Fees</Typography>
          <Typography variant="body2">{formatPrice(taxes)}</Typography>
        </Box>
      </Stack>
      <Divider sx={{ my: 2 }} />
      <Box display="flex" justifyContent="space-between" sx={{ mt: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          Total Amount
        </Typography>
        <Typography variant="subtitle1" fontWeight={700} color="primary">
          {formatPrice(total)}
        </Typography>
      </Box>
    </Box>
  );
};

export default PriceSummary;