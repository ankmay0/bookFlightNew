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
import TuneIcon from "@mui/icons-material/Tune";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import ScheduleIcon from "@mui/icons-material/Schedule";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import FlightIcon from "@mui/icons-material/Flight";
import ConnectingAirportsIcon from "@mui/icons-material/ConnectingAirports";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
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

const SidebarFilters: React.FC<SidebarFiltersProps & { stopCounts: { [key: string]: number } }> = ({
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
  stopCounts,
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

  // Map stop labels to icons
  const stopIcons: { [key: string]: JSX.Element } = {
    Direct: <FlightIcon fontSize="medium" sx={{ color: "#000000" }} />,
    "1 Stop": <FlightTakeoffIcon fontSize="medium" sx={{ color: "#000000" }} />,
    "2+ Stops": <ConnectingAirportsIcon fontSize="medium" sx={{ color: "#000000" }} />,
  };

  // Map time labels to icons
  const timeIcons: { [key: string]: JSX.Element } = {
    "Morning (6AM-12PM)": <WbSunnyIcon fontSize="medium" sx={{ color: "#000000" }} />,
    "Afternoon (12PM-6PM)": <ScheduleIcon fontSize="medium" sx={{ color: "#000000" }} />,
    "Evening (6PM-12AM)": <ScheduleIcon fontSize="medium" sx={{ color: "#000000" }} />,
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 8,
        bgcolor: "white",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        transition: "transform 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
        },
      }}
    >
      <Box display="flex" alignItems="center" gap={1.5} mb={3}>
        <TuneIcon fontSize="medium" sx={{ color: "#000000" }} />
        <Typography variant="h6" fontWeight={600} color="#000000">
          Refine Your Search
        </Typography>
      </Box>

      <Divider sx={{ mb: 3, bgcolor: "#e0e0e0" }} />

      <Box mb={4}>
        <Typography
          variant="subtitle1"
          sx={{ display: "flex", alignItems: "center", gap: 1.5, color: "#000000" }}
          gutterBottom
        >
          <CurrencyRupeeIcon fontSize="medium" sx={{ color: "#000000" }} />
          Price Range
        </Typography>
        <Slider
          value={priceRange}
          onChange={(_, value) => setPriceRange(value as number[])}
          min={minPrice}
          max={maxPrice}
          valueLabelDisplay="auto"
          sx={{
            color: "#3f15c7ff",
            "& .MuiSlider-thumb": {
              backgroundColor: "white",
              boxShadow: "0 0 8px rgba(0, 0, 0, 0.2)",
            },
            "& .MuiSlider-track": {
              background: "linear-gradient(90deg, #151ec7ff, #2196f3)",
            },
          }}
        />
        <Chip
          label={`₹${minPrice.toLocaleString("en-IN")} - ₹${maxPrice.toLocaleString("en-IN")}`}
          size="small"
          sx={{
            mt: 1,
            background: "linear-gradient(90deg, #4215c7ff, #2196f3)",
            color: "white",
            fontWeight: 500,
            borderRadius: 4,
          }}
        />
      </Box>

      <Box mb={4}>
        <Typography
          variant="subtitle1"
          sx={{ display: "flex", alignItems: "center", gap: 1.5, color: "#000000" }}
          gutterBottom
        >
          <FlightTakeoffIcon fontSize="medium" sx={{ color: "#000000" }} />
          Stops
        </Typography>
        <FormGroup>
          {availableStops.map((stop) => (
            <FormControlLabel
              key={stop}
              control={
                <Checkbox
                  checked={selectedStops.includes(stop)}
                  onChange={handleCheckboxChange(stop, selectedStops, setSelectedStops)}
                  sx={{
                    color: "#000000",
                    "&.Mui-checked": {
                      color: "#4515c7ff",
                    },
                    "&:hover": {
                      backgroundColor: "rgba(33, 150, 243, 0.1)",
                    },
                    transform: "scale(1)",
                    transition: "transform 0.2s ease-in-out",
                    "&.Mui-checked:hover": {
                      transform: "scale(1.1)",
                    },
                  }}
                />
              }
              label={
                <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {stopIcons[stop] || <FlightTakeoffIcon fontSize="medium" sx={{ color: "#000000" }} />}
                    <Typography sx={{ color: "#000000" }}>{stop}</Typography>
                  </Box>
                  {stopCounts && stopCounts[stop as keyof typeof stopCounts] > 0 && (
                    <Chip
                      label={stopCounts[stop as keyof typeof stopCounts]}
                      size="small"
                      sx={{
                        background: "linear-gradient(90deg, #4715c7ff, #2196f3)",
                        color: "white",
                        fontWeight: 500,
                        borderRadius: 4,
                        ml: 1,
                      }}
                    />
                  )}
                </Box>
              }
              sx={{
                width: "100%",
                py: 0.5,
                px: 1,
                borderRadius: 2,
                "&:hover": {
                  backgroundColor: "rgba(33, 150, 243, 0.1)",
                },
              }}
            />
          ))}
        </FormGroup>
      </Box>

      <Box mb={4}>
        <Typography
          variant="subtitle1"
          sx={{ display: "flex", alignItems: "center", gap: 1.5, color: "#000000" }}
          gutterBottom
        >
          <FlightIcon fontSize="medium" sx={{ color: "#000000" }} />
          Airlines
        </Typography>
        <FormGroup>
          {availableAirlines.map((airline) => (
            <FormControlLabel
              key={airline}
              control={
                <Checkbox
                  checked={selectedAirlines.includes(airline)}
                  onChange={handleCheckboxChange(airline, selectedAirlines, setSelectedAirlines)}
                  sx={{
                    color: "#000000",
                    "&.Mui-checked": {
                      color: "#4a15c7ff",
                    },
                    "&:hover": {
                      backgroundColor: "rgba(33, 150, 243, 0.1)",
                    },
                    transform: "scale(1)",
                    transition: "transform 0.2s ease-in-out",
                    "&.Mui-checked:hover": {
                      transform: "scale(1.1)",
                    },
                  }}
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <img
                    src={getAirlineIconURL(airline)}
                    alt={`${getAirlineName(airline)} logo`}
                    style={{
                      height: 24,
                      width: 24,
                      borderRadius: 4,
                      background: "white",
                      padding: 2,
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Typography sx={{ color: "#000000" }}>{getAirlineName(airline)}</Typography>
                </Box>
              }
              sx={{
                width: "100%",
                py: 0.5,
                px: 1,
                borderRadius: 2,
                "&:hover": {
                  backgroundColor: "rgba(33, 150, 243, 0.1)",
                },
              }}
            />
          ))}
        </FormGroup>
      </Box>

      <Box mb={4}>
        <Typography
          variant="subtitle1"
          sx={{ display: "flex", alignItems: "center", gap: 1.5, color: "#000000" }}
          gutterBottom
        >
          <ScheduleIcon fontSize="medium" sx={{ color: "#000000" }} />
          Departure Time
        </Typography>
        <FormGroup>
          {["Morning (6AM-12PM)", "Afternoon (12PM-6PM)", "Evening (6PM-12AM)"].map((time) => (
            <FormControlLabel
              key={time}
              control={
                <Checkbox
                  checked={selectedTimes.includes(time)}
                  onChange={handleCheckboxChange(time, selectedTimes, setSelectedTimes)}
                  sx={{
                    color: "#000000",
                    "&.Mui-checked": {
                      color: "#c71585",
                    },
                    "&:hover": {
                      backgroundColor: "rgba(33, 150, 243, 0.1)",
                    },
                    transform: "scale(1)",
                    transition: "transform 0.2s ease-in-out",
                    "&.Mui-checked:hover": {
                      transform: "scale(1.1)",
                    },
                  }}
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {timeIcons[time] || <ScheduleIcon fontSize="medium" sx={{ color: "#000000" }} />}
                  <Typography sx={{ color: "#000000" }}>{time}</Typography>
                </Box>
              }
              sx={{
                width: "100%",
                py: 0.5,
                px: 1,
                borderRadius: 2,
                "&:hover": {
                  backgroundColor: "rgba(33, 150, 243, 0.1)",
                },
              }}
            />
          ))}
        </FormGroup>
      </Box>
    </Paper>
  );
};

export default SidebarFilters;