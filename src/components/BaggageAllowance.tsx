import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { Luggage as LuggageIcon } from "@mui/icons-material";

const BaggageAllowance: React.FC = () => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        Baggage Allowance
      </Typography>
      <Stack spacing={1.5}>
        <Box display="flex" alignItems="center">
          <LuggageIcon color="action" sx={{ mr: 2 }} />
          <Box>
            <Typography variant="body2">Cabin baggage</Typography>
            <Typography variant="body2" color="text.secondary">
              1 piece (max 8 kg)
            </Typography>
          </Box>
        </Box>
        <Box display="flex" alignItems="center">
          <LuggageIcon color="action" sx={{ mr: 2 }} />
          <Box>
            <Typography variant="body2">Checked baggage</Typography>
            <Typography variant="body2" color="text.secondary">
              1 piece (max 23 kg)
            </Typography>
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};

export default BaggageAllowance;