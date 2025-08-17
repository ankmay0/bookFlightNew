import React from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Fade,
} from "@mui/material";
import {
  FlightTakeoff,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  FilterList as FilterListIcon, // Just an example icon for the filter button
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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexDirection: "row",
          gap: 2,
          mb: 2,
          pl: { xs: 1.5, md: 0 },
          pr: { xs: 1.5, md: 0 },
          flexWrap: "nowrap",
          overflowX: "auto",
          width: "100%",
        }}
      >
        {/* Title */}
        <Typography variant="h6" fontWeight={600} noWrap>
          Your search summary
        </Typography>

        {/* Edit Button */}
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
            whiteSpace: "nowrap",
            "&:hover": {
              bgcolor: "primary.50",
            },
          }}
        >
          Edit Search
        </Button>

        {/* Summary Card */}
        <Paper
          elevation={0}
          sx={{
            background: "white",
            px: 2,
            py: 1.5,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 2,
            boxShadow: "none",
            flexWrap: "nowrap",
            whiteSpace: "nowrap",
            minWidth: 0,
          }}
        >
          {/* Route */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: "row",
              gap: 1,
              px: 2,
              py: 1,
              bgcolor: "white",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "none",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            <FlightTakeoff sx={{ fontSize: 20, color: "primary.main" }} />
            <Typography fontWeight={600} fontSize="0.95rem" noWrap>
              {fd.label || fd.name || from} → {td.label || td.name || to}
            </Typography>
          </Box>

          {/* Dates */}
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
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          />

          {/* Passengers */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: "row",
              gap: 1,
              px: 2,
              py: 1,
              bgcolor: "white",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "none",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            <PersonIcon sx={{ fontSize: 18, color: "grey.700" }} />
            <Typography fontSize="0.85rem" fontWeight={500}>
              {totalPassengers} Passenger{totalPassengers !== 1 ? "s" : ""}
            </Typography>
          </Box>
        </Paper>

        {/* Filter By Button (example) */}
        <Button
          variant="contained"
          color="secondary"
          startIcon={<FilterListIcon />}
          sx={{
            borderRadius: 2,
            minWidth: 120,
            whiteSpace: "nowrap",
            ml: "auto",
          }}
        >
          Filter By
        </Button>
      </Box>
    </Fade>
  );
};

export default SearchHeader;
