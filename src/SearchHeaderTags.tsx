// src/components/SearchHeaderTags.tsx
import React from "react";
import { Box, Typography, Avatar } from "@mui/material";
import FlightIcon from "@mui/icons-material/Flight";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";

interface SearchHeaderTagsProps {
  currency: string;
  countryFlag: string;
}

const SearchHeaderTags: React.FC<SearchHeaderTagsProps> = ({ currency, countryFlag }) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        mb: 2,
        justifyContent: "flex-start",
        width: "100%",
        maxWidth: "1400px",
      }}
    >
      {/* Book Flight & Manage Trip */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          bgcolor: "#f5f5f5",
          borderRadius: "20px",
          px: 2,
          py: 1,
        }}
      >
        <FlightIcon fontSize="small" sx={{ mr: 1, color: "#2c39e8" }} />
        <Typography variant="body2" fontWeight={500}>
          Book Flight & Manage Trip
        </Typography>
      </Box>

      {/* Currency Option */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          bgcolor: "#f5f5f5",
          borderRadius: "20px",
          px: 2,
          py: 1,
        }}
      >
        <CurrencyExchangeIcon fontSize="small" sx={{ mr: 1, color: "#2c39e8" }} />
        <Avatar
          src={countryFlag}
          alt="Country Flag"
          sx={{ width: 20, height: 20, mr: 1 }}
        />
        <Typography variant="body2" fontWeight={500}>
          {currency}
        </Typography>
      </Box>
    </Box>
  );
};

export default SearchHeaderTags;