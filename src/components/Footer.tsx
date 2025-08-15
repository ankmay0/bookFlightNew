import React from "react";
import Box from "@mui/material/Box";
import { Grid } from "@mui/material";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Send,
} from "@mui/icons-material";

const Footer = () => {
  return (
    <Box sx={{ bgcolor: "#0c1222", color: "#fff", px: 4, py: 6 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={3}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" fontWeight="bold">
              ✈ BookFlight
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Your trusted partner for seamless travel experiences worldwide.
          </Typography>
          <Box sx={{ mt: 3, display: "flex", gap: 1 }}>
            <IconButton color="inherit"><Facebook /></IconButton>
            <IconButton color="inherit"><Twitter /></IconButton>
            <IconButton color="inherit"><Instagram /></IconButton>
            <IconButton color="inherit"><LinkedIn /></IconButton>
          </Box>
        </Grid>

        <Grid item xs={6} md={3}>
          <Typography variant="h6" gutterBottom>Services</Typography>
          <Typography variant="body2">Flight Booking</Typography>
          <Typography variant="body2">Hotel Booking</Typography>
          <Typography variant="body2">Car Rental</Typography>
          <Typography variant="body2">Travel Packages</Typography>
        </Grid>

        <Grid item xs={6} md={3}>
          <Typography variant="h6" gutterBottom>Support</Typography>
          <Typography variant="body2">Help Center</Typography>
          <Typography variant="body2">Contact Us</Typography>
          <Typography variant="body2">Privacy Policy</Typography>
          <Typography variant="body2">Terms of Service</Typography>
        </Grid>

        <Grid item xs={12} md={3}>
          <Typography variant="h6" gutterBottom>Newsletter</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Get the latest deals and travel tips
          </Typography>
          <TextField
            variant="outlined"
            placeholder="Enter your email"
            size="small"
            fullWidth
            sx={{
              bgcolor: "#1c2233",
              input: { color: "#fff" },
              "& fieldset": { borderColor: "transparent" },
              borderRadius: 1,
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    sx={{
                      minWidth: 0,
                      p: 1,
                      bgcolor: "#2a45d9",
                      "&:hover": { bgcolor: "#223bbb" },
                      borderRadius: 1,
                    }}
                  >
                    <Send sx={{ color: "#fff", fontSize: 18 }} />
                  </Button>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Footer;
