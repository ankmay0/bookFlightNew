import React from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Tooltip,
  Collapse,
} from "@mui/material";
import {
  AirplanemodeActive as AirplaneIcon,
  FilterList as FilterListIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { useMediaQuery } from "@mui/material";

interface FlightCountBarProps {
  count: number;
  sortBy: string;
  setSortBy: (value: string) => void;
  showFilters: boolean;
  setShowFilters: (value: boolean) => void;
  expandedFilters: boolean;
  setExpandedFilters: (value: boolean) => void;
  isOneWay: boolean;
  selectedDepartureFlight: any;
  isMultiCity: boolean;
}

const FlightCountBar: React.FC<FlightCountBarProps> = ({
  count,
  sortBy,
  setSortBy,
  showFilters,
  setShowFilters,
  expandedFilters,
  setExpandedFilters,
  isOneWay,
  selectedDepartureFlight,
  isMultiCity,
}) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const currentStep = isMultiCity ? window.location.pathname.split("/").pop() || "segment-0" : "";

  const getFlightCountMessage = () => {
    if (isMultiCity && currentStep.startsWith("segment-")) {
      const segmentIndex = parseInt(currentStep.split("-")[1]) + 1;
      return `Segment ${segmentIndex} flights`;
    }
    if (!isOneWay && selectedDepartureFlight) {
      return "Recommended returning flights";
    }
    return `${count} flights found`;
  };

  return (
    <Box
      sx={{
        position: { xs: "sticky", md: "static" },
        zIndex: 8,
        top: { xs: 0, md: "auto" },
        mt: 0,
      }}
      aria-label="results bar"
    >
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 3,
          mb: 0,
          borderRadius: 3,
          bgcolor: "white",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "none",
          mt: 2,
        }}
      >
        <Box display="flex" alignItems="center" gap={1.2}>
          <AirplaneIcon color="primary" fontSize="small" />
          <Typography fontWeight={700}>
            {getFlightCountMessage()}
          </Typography>
          <Chip
            label={`${count}`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ ml: 1, fontWeight: 600 }}
          />
        </Box>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Sort by</InputLabel>
            <Select
              value={sortBy}
              label="Sort by"
              onChange={(e) => setSortBy(e.target.value)}
              sx={{ bgcolor: "white" }}
            >
              <MenuItem value="recommended">Recommended</MenuItem>
              <MenuItem value="priceLow">Price: Low to High</MenuItem>
              <MenuItem value="priceHigh">Price: High to Low</MenuItem>
              <MenuItem value="duration">Shortest Duration</MenuItem>
              <MenuItem value="departure">Departure Time</MenuItem>
            </Select>
          </FormControl>
          <Tooltip arrow title="Show or hide advanced filters">
            <Button
              variant={showFilters ? "contained" : "outlined"}
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{ minWidth: 120, textTransform: "none", fontWeight: 500 }}
            >
              Filter by
            </Button>
          </Tooltip>
        </Stack>
      </Paper>
      {isMobile && showFilters && (
        <Collapse in={showFilters}>
          <Box sx={{ mt: 1, mb: 2 }}>
            <Button
              fullWidth
              variant="text"
              startIcon={expandedFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              onClick={() => setExpandedFilters(!expandedFilters)}
              sx={{ textTransform: "none", justifyContent: "flex-start" }}
            >
              {expandedFilters ? "Hide Filters" : "Show All Filters"}
            </Button>
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

export default FlightCountBar;