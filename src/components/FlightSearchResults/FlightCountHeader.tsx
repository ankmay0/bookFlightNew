import React from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Tooltip,
  Collapse,
  useMediaQuery,
} from "@mui/material";
import { FilterList as FilterListIcon, AirplanemodeActive as AirplaneIcon, ExpandMore, ExpandLess } from "@mui/icons-material";

interface FlightCountHeaderProps {
  count: number;
  sortBy: string;
  setSortBy: (value: string) => void;
  showFilters: boolean;
  setShowFilters: (updater: (prev: boolean) => boolean) => void;
  isMobile?: boolean;
  expandedFilters: boolean;
  setExpandedFilters: (updater: (prev: boolean) => boolean) => void;
  selectedDepartureFlight: unknown | null;
}

const FlightCountHeader: React.FC<FlightCountHeaderProps> = ({
  count,
  sortBy,
  setSortBy,
  showFilters,
  setShowFilters,
  isMobile,
  expandedFilters,
  setExpandedFilters,
  selectedDepartureFlight,
}) => {
  const mobile = isMobile ?? useMediaQuery("(max-width:600px)");

  return (
    <Box
      sx={{
        position: { xs: "sticky", md: "static" },
        zIndex: 8,
        top: { xs: 0, md: "auto" },
        mt: 2,
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
          mt: 6,
        }}
      >
        <Box display="flex" alignItems="center" gap={1.2}>
          <AirplaneIcon color="primary" fontSize="small" />
          <Typography fontWeight={700}>
            {selectedDepartureFlight ? "Recommended returning flights" : `${count} flights found`}
          </Typography>
          <Chip
            label={`${count}`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ ml: 1, fontWeight: 600 }}
          />
        </Box>
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Sort by</InputLabel>
            <Select
              value={sortBy}
              label="Sort by"
              onChange={(e) => setSortBy(e.target.value as string)}
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
              onClick={() => setShowFilters((p) => !p)}
              sx={{ minWidth: 120, textTransform: "none", fontWeight: 500 }}
            >
              Filter by
            </Button>
          </Tooltip>
        </Box>
      </Paper>

      {mobile && showFilters && (
        <Collapse in={showFilters}>
          <Box sx={{ mt: 1, mb: 2 }}>
            <Button
              fullWidth
              variant="text"
              startIcon={expandedFilters ? <ExpandLess /> : <ExpandMore />}
              onClick={() => setExpandedFilters((v) => !v)}
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

export default FlightCountHeader;
