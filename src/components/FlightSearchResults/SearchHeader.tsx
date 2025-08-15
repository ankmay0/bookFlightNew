// components/SearchHeader.tsx
import React from "react";
import {
    Box,
    Paper,
    Typography,
    Stack,
    Chip,
    Button,
    Fade,
} from "@mui/material";
import {
    FlightTakeoff,
    Schedule as ScheduleIcon,
    Person as PersonIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface SearchHeaderProps {
    loading: boolean;
    from: string;
    to: string;
    departDate: string;
    returnDate?: string;
    adults?: number;
    children?: number;
    fromDetails?: any;
    toDetails?: any;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({
    loading,
    from,
    to,
    departDate,
    returnDate,
    adults,
    children,
    fromDetails,
    toDetails,
}) => {
    const navigate = useNavigate();
    
    const fd = fromDetails || {};
    const td = toDetails || {};
    const totalPassengers = (adults || 0) + (children || 0);

    if (loading) return null;

    return (
        <Fade in={!loading} timeout={600}>
            <Box sx={{ mb: { xs: 2, md: 0 } }}>
                {/* Top Row: Title & Edit Button */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "flex-start",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 1.5,
                        mb: 2,
                        px: { xs: 1.5, md: 0 },
                    }}
                >
                    <Typography variant="h6" fontWeight={600}>
                        Your search summary
                    </Typography>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(-1)}
                        sx={{
                            textTransform: "none",
                            fontWeight: 500,
                            borderRadius: 2,
                            px: 2,
                            color: "primary.main",
                            borderColor: "primary.main",
                            minWidth: 100,
                            "&:hover": {
                                bgcolor: "primary.50",
                            },
                        }}
                    >
                        Edit Search
                    </Button>
                </Box>

                {/* Summary Card */}
                <Paper
                    elevation={0}
                    sx={{
                        background: "white",
                        p: { xs: 2, sm: 3 },
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 2.5,
                        boxShadow: "none",
                        maxWidth: 640,
                    }}
                >
                    {/* Route & Dates */}
                    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" sx={{ flex: 1, minWidth: 0 }}>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                px: 2,
                                py: 1,
                                bgcolor: "white",
                                borderRadius: 2,
                                border: "1px solid",
                                borderColor: "divider",
                                boxShadow: "none",
                            }}
                        >
                            <FlightTakeoff sx={{ fontSize: 20, color: "primary.main" }} />
                            <Typography fontWeight={600} fontSize="0.95rem" noWrap>
                                {fd.label || fd.name || from} → {td.label || td.name || to}
                            </Typography>
                        </Box>

                        <Chip
                            icon={<ScheduleIcon sx={{ fontSize: 18 }} />}
                            label={
                                returnDate
                                    ? `${new Date(departDate).toLocaleDateString("en-GB", {
                                        day: "numeric",
                                        month: "short",
                                    })} - ${new Date(returnDate).toLocaleDateString("en-GB", {
                                        day: "numeric",
                                        month: "short",
                                    })}`
                                    : new Date(departDate).toLocaleDateString("en-GB", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                    })
                            }
                            size="small"
                            variant="outlined"
                            sx={{
                                fontWeight: 500,
                                fontSize: "0.8rem",
                            }}
                        />
                    </Stack>

                    {/* Passenger Info */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            px: 2,
                            py: 1,
                            bgcolor: "white",
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: "divider",
                            boxShadow: "none",
                        }}
                    >
                        <PersonIcon sx={{ fontSize: 18, color: "grey.700" }} />
                        <Typography fontSize="0.85rem" fontWeight={500}>
                            {totalPassengers} Passenger{totalPassengers !== 1 ? "s" : ""}
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Fade>
    );
};

export default SearchHeader;
