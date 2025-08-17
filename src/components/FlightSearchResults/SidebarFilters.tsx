import React from "react";
import {
  Typography,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Paper,
  Divider,
  Box,
  Chip,
} from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ConnectingAirportsIcon from "@mui/icons-material/ConnectingAirports";
import FlightIcon from "@mui/icons-material/Flight";
import { SidebarFiltersProps } from "../Types/FlightTypes";

// --- Airline utilities --- //
const airlinesData: { [key: string]: { name: string; icon: string } } = {
  DL: { name: "Delta Air Lines", icon: "https://content.airhex.com/content/logos/airlines_DL_75_75_s.png" },
  AA: { name: "American Airlines", icon: "https://content.airhex.com/content/logos/airlines_AA_75_75_s.png" },
  UA: { name: "United Airlines", icon: "https://content.airhex.com/content/logos/airlines_UA_75_75_s.png" },
  WN: { name: "Southwest Airlines", icon: "https://content.airhex.com/content/logos/airlines_WN_75_75_s.png" },
  B6: { name: "JetBlue Airways", icon: "https://content.airhex.com/content/logos/airlines_B6_75_75_s.png" },
  NK: { name: "Spirit Airlines", icon: "https://content.airhex.com/content/logos/airlines_NK_75_75_s.png" },
  F9: { name: "Frontier Airlines", icon: "https://content.airhex.com/content/logos/airlines_F9_75_75_s.png" },
  AI: { name: "Air India", icon: "https://content.airhex.com/content/logos/airlines_AI_75_75_s.png" },
  "6E": { name: "IndiGo", icon: "https://content.airhex.com/content/logos/airlines_6E_75_75_s.png" },
  SG: { name: "SpiceJet", icon: "https://content.airhex.com/content/logos/airlines_SG_75_75_s.png" },
  UK: { name: "Vistara", icon: "https://content.airhex.com/content/logos/airlines_UK_75_75_s.png" },
  AS: { name: "Alaska Airlines", icon: "https://content.airhex.com/content/logos/airlines_AS_75_75_s.png" },
  HA: { name: "Hawaiian Airlines", icon: "https://content.airhex.com/content/logos/airlines_HA_75_75_s.png" },
};

const getAirlineName = (code: string): string =>
  airlinesData[code as keyof typeof airlinesData]?.name || code;

const getAirlineIconURL = (code: string): string =>
  airlinesData[code as keyof typeof airlinesData]?.icon ||
  `https://content.airhex.com/content/logos/airlines_${code?.toUpperCase?.() ?? ""}_75_75_s.png`;

const SidebarFilters: React.FC<SidebarFiltersProps> = ({
  priceRange,
  setPriceRange,
  selectedTimes,
  setSelectedTimes,
  selectedStops,
  setSelectedStops,
  selectedAirlines,
  setSelectedAirlines,
  availableStops,
  availableAirlines,
  minPrice,
  maxPrice,
}) => {
  const handleCheckboxChange = (
    value: string,
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSelected((prev) =>
      checked ? [...prev, value] : prev.filter((v) => v !== value)
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{ p: 3, borderRadius: 4, border: "1px solid #ddd", bgcolor: "white" }}
    >
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <FilterAltIcon color="primary" />
        <Typography variant="h6" fontWeight={600}>
          Filter Results
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box mb={3}>
        <Typography variant="subtitle2" sx={{ display: "flex", alignItems: "center", gap: 1 }} gutterBottom>
          <AttachMoneyIcon fontSize="small" /> Price Range
        </Typography>
        <Slider
          value={priceRange}
          onChange={(_, value) => setPriceRange(value as number[])}
          min={minPrice}
          max={maxPrice}
          valueLabelDisplay="auto"
        />
        <Chip label={`₹${minPrice} - ₹${maxPrice}`} size="small" color="primary" />
      </Box>

       <Box mb={3}>
        <Typography variant="subtitle2" sx={{ display: "flex", alignItems: "center", gap: 1 }} gutterBottom>
          <ConnectingAirportsIcon fontSize="small" /> Stops
        </Typography>
        <FormGroup>
          {availableStops.map((stop) => (
            <FormControlLabel
              key={stop}
              control={
                <Checkbox
                  checked={selectedStops.includes(stop)}
                  onChange={handleCheckboxChange(stop, selectedStops, setSelectedStops)}
                />
              }
              label={stop}
            />
          ))}
        </FormGroup>
      </Box>

      <Box mb={3}>
        <Typography variant="subtitle2" sx={{ display: "flex", alignItems: "center", gap: 1 }} gutterBottom>
          <AccessTimeIcon fontSize="small" /> Departure Time
        </Typography>
        <FormGroup>
          {["Morning (6AM-12PM)", "Afternoon (12PM-6PM)", "Evening (6PM-12AM)"].map((time) => (
            <FormControlLabel
              key={time}
              control={
                <Checkbox
                  checked={selectedTimes.includes(time)}
                  onChange={handleCheckboxChange(time, selectedTimes, setSelectedTimes)}
                />
              }
              label={time}
            />
          ))}
        </FormGroup>
      </Box>

     

      <Box>
        <Typography variant="subtitle2" sx={{ display: "flex", alignItems: "center", gap: 1 }} gutterBottom>
          <FlightIcon fontSize="small" /> Airlines
        </Typography>
        <FormGroup>
          {availableAirlines.map((airline) => (
            <FormControlLabel
              key={airline}
              control={
                <Checkbox
                  checked={selectedAirlines.includes(airline)}
                  onChange={handleCheckboxChange(airline, selectedAirlines, setSelectedAirlines)}
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <img
                    src={getAirlineIconURL(airline)}
                    alt={`${getAirlineName(airline)} logo`}
                    style={{ 
                      height: 20, 
                      width: 20, 
                      borderRadius: 2, 
                      background: "#fff" 
                    }}
                  />
                  <span>{getAirlineName(airline)}</span>
                </Box>
              }
            />
          ))}
        </FormGroup>
      </Box>
    </Paper>
  );
};

export default SidebarFilters;