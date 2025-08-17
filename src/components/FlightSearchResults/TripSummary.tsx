import React from "react";
import { Box, Paper, Typography, Button, Fade, Chip, Select, MenuItem, FormControl } from "@mui/material";
import { FlightTakeoff, Schedule as ScheduleIcon, Person as PersonIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface TripSummaryProps {
  from: string;
  to: string;
  departDate: string;
  returnDate?: string;
  adults: number;
  children: number;
  fromDetails?: { label?: string; name?: string };
  toDetails?: { label?: string; name?: string };
  loading: boolean;
  isOneWay: boolean;
  isMultiCity?: boolean;
  segments?: Array<{ from: string; to: string; date: string }>;
  flightCount?: number;
  sortBy?: string;
  onSortChange?: (value: string) => void;
  onFilterClick?: () => void;
}

const TripSummary: React.FC<TripSummaryProps> = ({
  from,
  to,
  departDate,
  returnDate,
  adults,
  children,
  fromDetails,
  toDetails,
  loading,
  isOneWay,
  isMultiCity,
  segments,
  flightCount = 250,
  sortBy = "Recommended",
  onSortChange,
  onFilterClick,
}) => {
  const navigate = useNavigate();
  const fd = fromDetails || {};
  const td = toDetails || {};
  const totalPassengers = (adults || 0) + (children || 0);

  if (loading) return null;

  return (
    <Fade in={!loading} timeout={600}>
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          p: 3,
          bgcolor: "white",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          mb: 2,
        }}
      >
        {/* Main container with proper spacing */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: { xs: "wrap", lg: "nowrap" },
            gap: 3,
            minHeight: 56,
          }}
        >
          {/* Left section - Search Summary + Edit */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              minWidth: 0,
            }}
          >
            <Typography 
              variant="h6" 
              fontWeight={600} 
              sx={{ 
                whiteSpace: "nowrap",
                fontSize: { xs: "1.1rem", sm: "1.25rem" }
              }}
            >
              Your search summary
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate(-1)}
              sx={{
                textTransform: "none",
                fontWeight: 500,
                borderRadius: 1.5,
                px: 2,
                py: 0.5,
                minWidth: "auto",
                whiteSpace: "nowrap",
                height: 36,
              }}
            >
              Edit Search
            </Button>
          </Box>

          {/* Middle section - Trip details */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flex: 1,
              justifyContent: "center",
              minWidth: 0,
            }}
          >
            {/* Route Info */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                px: 2,
                py: 1,
                bgcolor: "grey.50",
                borderRadius: 1.5,
                border: "1px solid",
                borderColor: "grey.200",
                minWidth: 0,
                maxWidth: 280,
              }}
            >
              <FlightTakeoff sx={{ fontSize: 18, color: "primary.main" }} />
              <Typography
                fontWeight={600}
                fontSize="0.9rem"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: 180,
                }}
              >
                {isMultiCity && segments && segments.length > 0
                  ? segments.map((seg, idx) =>
                      ` ${seg.from}→${seg.to}${idx < segments.length - 1 ? ',' : ''}`
                    )
                  : `${fd.label || fd.name || from} → ${td.label || td.name || to}`}
              </Typography>
            </Box>

            {/* Date Info */}
            <Chip
              icon={<ScheduleIcon sx={{ fontSize: 16 }} />}
              label={
                returnDate && !isOneWay
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
              size="medium"
              variant="outlined"
              sx={{
                fontWeight: 500,
                fontSize: "0.8rem",
                height: 36,
                bgcolor: "white",
              }}
            />

            {/* Passenger Info */}
            <Chip
              icon={<PersonIcon sx={{ fontSize: 16 }} />}
              label={`${totalPassengers} Passenger${totalPassengers !== 1 ? "s" : ""}`}
              size="medium"
              variant="outlined"
              sx={{
                fontWeight: 500,
                fontSize: "0.8rem",
                height: 36,
                bgcolor: "white",
              }}
            />
          </Box>

          {/* Right section - Flight count, Sort & Filter */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              minWidth: 0,
            }}
          >
          </Box>
        </Box>
      </Paper>
    </Fade>
  );
};

export default TripSummary;
