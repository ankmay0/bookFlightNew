import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Divider,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FlightIcon from "@mui/icons-material/Flight";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

interface CancellationPolicyProps {
  flight: any;
  currencySymbol?: string;
}

const CancellationPolicy: React.FC<CancellationPolicyProps> = ({
  flight,
  currencySymbol = "₹",
}) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const departureDateTime = flight.trips[0].legs[0].departureDateTime;
  const departureDate = new Date(departureDateTime);
  const cutOffDate = new Date(departureDate);
  cutOffDate.setDate(cutOffDate.getDate() - 1);

  const lowPenalty = 1015;
  const highPenalty = 23624;

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) +
    " " +
    date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  return (
    <>
      <Paper
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 2,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          bgcolor: "#fff",
          width: "100%",
          maxWidth: 1200,
          mx: "auto",
          my: 2,
        }}
        role="region"
        aria-labelledby="cancellation-policy-title"
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography
            id="cancellation-policy-title"
            variant="h5"
            fontWeight={600}
            color="primary"
            sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}
          >
            Cancellation & Date Change Policy
          </Typography>
          <Link
            component="button"
            underline="hover"
            color="primary"
            onClick={handleOpen}
            sx={{ fontSize: { xs: "0.9rem", md: "1rem" }, fontWeight: 500 }}
          >
            View Full Policy
          </Link>
        </Stack>

        <Divider sx={{ my: 2, borderColor: "#e0e0e0" }} />

        {/* Airline & Route */}
        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <FlightIcon sx={{ color: "text.secondary", mr: 1 }} />
          <Typography variant="subtitle1" fontWeight={500}>
            {flight.trips[0].from} - {flight.trips[flight.trips.length - 1].to}
          </Typography>
          {flight.trips[0].airlineLogo && (
            <img
              src={flight.trips[0].airlineLogo}
              alt={`${flight.trips[0].airline} logo`}
              style={{ height: 20, marginLeft: 8 }}
            />
          )}
        </Stack>

        {/* Penalty Range */}
        <Box mb={3} position="relative">
          <Typography variant="subtitle1" fontWeight={500} mb={1}>
            Penalty Range
          </Typography>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" fontWeight={500} color="text.secondary">
              {currencySymbol}{lowPenalty.toLocaleString()}
            </Typography>
            <Typography variant="body2" fontWeight={500} color="text.secondary">
              {currencySymbol}{highPenalty.toLocaleString()}
            </Typography>
          </Stack>
          <Box
            sx={{
              height: 10,
              borderRadius: 5,
              background: "linear-gradient(to right, #2e7d32, #ffa000, #c62828)",
              my: 1,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              textAlign: "center",
            }}
          >
            <Typography variant="body2" fontWeight={500} color="text.primary">
              {formatDate(cutOffDate)}
            </Typography>
            <Box
              sx={{
                width: 2,
                height: 20,
                backgroundColor: "#999",
                margin: "2px auto 0 auto",
              }}
            />
          </Box>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <AccessTimeIcon fontSize="small" color="warning" />
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            Timings are in Indian Standard Time (IST)
          </Typography>
        </Stack>
      </Paper>

      {/* Modal */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        aria-labelledby="fare-rules-title"
      >
        <DialogTitle id="fare-rules-title" sx={{ fontSize: { xs: "1.25rem", md: "1.5rem" } }}>
          Fare Rules
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{ position: "absolute", right: 8, top: 8, color: "text.secondary" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 2, md: 3 } }}>
          <Typography
            variant="subtitle1"
            fontWeight={500}
            mb={2}
            sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }}
          >
            {flight.trips[0].from} - {flight.trips[flight.trips.length - 1].to}
          </Typography>

          <Table size="small" aria-label="Cancellation policy table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 500, color: "text.primary" }}>
                  Time Frame (From Scheduled Flight Departure)
                </TableCell>
                <TableCell sx={{ fontWeight: 500, color: "text.primary" }}>
                  Airline Fee + MMT Fee + Fare Difference
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>0 to 24 hours</TableCell>
                <TableCell>Non Changeable</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>24 hours to 365 days</TableCell>
                <TableCell>
                  {currencySymbol}8,909 + {currencySymbol}700 + Fare Difference
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Box mt={2}>
            <Typography variant="caption" color="text.secondary">
              *From the time of departure
            </Typography>
          </Box>

          <Box mt={2} p={2} bgcolor="#fff8e1" borderRadius={1}>
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <WarningAmberIcon sx={{ color: "warning.main", mt: 0.5 }} />
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                <strong>Important:</strong> The airline fee is indicative and not guaranteed. All fees are per passenger. Date change charges apply only when selecting the same airline on a new date. Fare differences between old and new bookings will be payable by the user.
              </Typography>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CancellationPolicy;