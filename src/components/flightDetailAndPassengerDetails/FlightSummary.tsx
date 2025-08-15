import React from "react";
import {
    Box,
    Typography,
    Button,
    Paper,
    Divider,
    Stack,
} from "@mui/material";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import FlightLandIcon from "@mui/icons-material/FlightLand";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { Flight, Passenger } from "../Types/FlightTypes";
import { formatPrice, formatTime, formatDate, calculateFlightDuration } from "../../utils/utils"
import { getCityName } from "../../utils/FlightData";

interface FlightSummaryProps {
    flight: Flight;
    passengers: Passenger[];
    totalPricePerTraveler: number;
    basePricePerTraveler: number;
    onConfirm: () => void;
}

const FlightSummary: React.FC<FlightSummaryProps> = ({
    flight,
    passengers,
    totalPricePerTraveler,
    basePricePerTraveler,
    onConfirm,
}) => {
    const taxesAndFees = (totalPricePerTraveler - basePricePerTraveler).toFixed(2);
    const totalPrice = (totalPricePerTraveler * passengers.length).toFixed(2);

    return (
        <Paper
            sx={{
                p: { xs: 2, md: 3 },
                borderRadius: 2,
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                bgcolor: "#fff",
            }}
        >
            <Typography
                variant="h6"
                fontWeight={600}
                sx={{ mb: 2, fontSize: { xs: "1.2rem", md: "1.5rem" } }}
            >
                Flight Summary
            </Typography>

            {flight.trips.map((trip, index) => (
                <Box key={index} mb={2}>
                    <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        sx={{ mb: 1, color: "primary.main" }}
                    >
                        {index === 0 ? "Outbound" : "Return"} Flight
                    </Typography>
                    {trip.legs.map((leg, legIndex) => (
                        <Box key={legIndex} display="flex" alignItems="center" mb={1}>
                            <Stack direction="row" spacing={1} alignItems="center" flex={1}>
                                <Box>
                                    {legIndex === 0 ? (
                                        <FlightTakeoffIcon sx={{ color: "text.secondary" }} />
                                    ) : (
                                        <FlightLandIcon sx={{ color: "text.secondary" }} />
                                    )}
                                </Box>
                                <Box>
                                    <Typography variant="body2" fontWeight={600}>
                                        {formatTime(leg.departureDateTime)} - {formatTime(leg.arrivalDateTime)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {getCityName(leg.departureAirport)} ({leg.departureAirport}) →{" "}
                                        {getCityName(leg.arrivalAirport)} ({leg.arrivalAirport}) {"\u00b7"} {formatDate(leg.departureDateTime)}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>
                    ))}
                    <Box display="flex" alignItems="center" mt={1}>
                        <ScheduleIcon sx={{ mr: 1, color: "text.secondary" }} />
                        <Typography variant="caption" color="text.secondary">
                            Duration: {calculateFlightDuration(trip.legs)}
                        </Typography>
                    </Box>
                </Box>
            ))}

            <Divider sx={{ my: 2 }} />

            <Typography
                variant="subtitle1"
                fontWeight={600}
                sx={{ mb: 1, color: "primary.main" }}
            >
                Price Details
            </Typography>
            <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">
                    Base Price ({passengers.length} Traveler{passengers.length > 1 ? "s" : ""})
                </Typography>
                <Typography variant="body2">{formatPrice(basePricePerTraveler)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Taxes & Fees</Typography>
                <Typography variant="body2">{formatPrice(taxesAndFees)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="subtitle2" fontWeight={600}>
                    Price per Traveler
                </Typography>
                <Typography variant="subtitle2" fontWeight={600}>
                    {formatPrice(totalPricePerTraveler)}
                </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={3}>
                <Typography variant="subtitle1" fontWeight={600}>
                    Total
                </Typography>
                <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                    {formatPrice(totalPrice)}
                </Typography>
            </Box>

            <Button
                variant="contained"
                fullWidth
                onClick={onConfirm}
                disabled={totalPricePerTraveler <= 0}
                sx={{
                    textTransform: "none",
                    fontSize: 16,
                    py: 1.2,
                    borderRadius: 2,
                    fontWeight: 600,
                }}
            >
                Continue to Payment
            </Button>
        </Paper>
    );
};

export default FlightSummary;