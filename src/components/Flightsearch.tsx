import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Button,
  MenuItem,
  Select,
  TextField,
  Typography,
  InputAdornment,
  Radio,
  RadioGroup,
  FormControlLabel,
  Snackbar,
  Alert,
  IconButton,
  Popover,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { FlightTakeoff, FlightLand, Person, Search, Add, Remove, ChildCare, ExpandMore, Close, LocationOn } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Autocomplete from "@mui/material/Autocomplete";
import { fetchLocations, createDebouncedFetcher } from "../utils/utils";
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import SearchHeaderTags from "../SearchHeaderTags";

const maxSegments = 6;
const minAdults = 1;
const maxAdults = 6;
const minChildren = 0;
const maxChildren = 6;

const commonInputStyles = {
  borderRadius: "14px",
  '& .MuiOutlinedInput-root': { borderRadius: "14px" }
};

const FlightSearch: React.FC = () => {
  const [tripType, setTripType] = useState("round");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fromDetails, setFromDetails] = useState<any>(null);
  const [toDetails, setToDetails] = useState<any>(null);
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [segments, setSegments] = useState([{ from: "", to: "", date: "", fromDetails: null, toDetails: null }, { from: "", to: "", date: "", fromDetails: null, toDetails: null }]);
  const [fromOptions, setFromOptions] = useState<any[]>([]);
  const [toOptions, setToOptions] = useState<any[]>([]);
  const [fromInputValue, setFromInputValue] = useState("");
  const [toInputValue, setToInputValue] = useState("");
  const [multiFromInputValue, setMultiFromInputValue] = useState<string[]>(["", ""]);
  const [multiToInputValue, setMultiToInputValue] = useState<string[]>(["", ""]);
  const [isFromLoading, setIsFromLoading] = useState(false);
  const [isToLoading, setIsToLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cabinClass, setCabinClass] = useState("ECONOMY");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  const debouncedFromFetch = useMemo(
    () => createDebouncedFetcher((keyword) => fetchLocations(keyword, setFromOptions, setIsFromLoading, setError), 200),
    []
  );

  const debouncedToFetch = useMemo(
    () => createDebouncedFetcher((keyword) => fetchLocations(keyword, setToOptions, setIsToLoading, setError), 200),
    []
  );

  useEffect(() => {
    if (tripType !== "round") setReturnDate("");
    if (tripType !== "multi") {
      setSegments([{ from: "", to: "", date: "", fromDetails: null, toDetails: null }, { from: "", to: "", date: "", fromDetails: null, toDetails: null }]);
      setMultiFromInputValue(["", ""]);
      setMultiToInputValue(["", ""]);
    }
  }, [tripType]);

  const renderAutocompleteOption = (props: any, option: any, isFromField = true) => {
    const Icon = option.isParent ? LocationOn : (isFromField ? FlightTakeoff : FlightLand);
    return (
      <li
        {...props}
        style={{
          padding: "10px 16px",
          paddingLeft: option.isParent ? "16px" : "32px",
          fontWeight: option.isParent ? 600 : 400,
          backgroundColor: option.isParent ? "#f7f7f7" : "inherit",
          borderBottom: "1px solid #eee",
          cursor: option.isParent ? "default" : "pointer",
          pointerEvents: option.isParent ? "none" : "auto",
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
        }}
      >
        <Icon 
          fontSize="small" 
          sx={{ color: option.isParent ? "#999" : "#43a047", mt: option.isParent ? "2px" : 0 }} 
        />
        <Box>
          <Typography variant="body2" sx={{ fontWeight: option.isParent ? 600 : 400, color: "text.primary" }}>
            {option.label}
          </Typography>
          {option.distance && (
            <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.3 }}>
              {option.distance} from city center
            </Typography>
          )}
        </Box>
      </li>
    );
  };

  const createAutocomplete = (
    options: any[],
    inputValue: string,
    onInputChange: (value: string) => void,
    onChange: (value: any) => void,
    placeholder: string,
    isFromField = true,
    label?: string
  ) => (
    <Autocomplete
      freeSolo
      options={options}
      getOptionLabel={(option) => typeof option === "string" ? option : option.label}
      inputValue={inputValue}
      onInputChange={(_, newInputValue) => onInputChange(newInputValue)}
      onChange={(_, value) => {
        if (value && typeof value !== "string") onChange(value);
      }}
      filterOptions={(options) => options}
      loading={isFromField ? isFromLoading : isToLoading}
      noOptionsText="No locations found"
      renderOption={(props, option) => renderAutocompleteOption(props, option, isFromField)}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                {isFromField ? <FlightTakeoff /> : <FlightLand />}
              </InputAdornment>
            ),
            sx: { borderRadius: "14px" },
          }}
          sx={commonInputStyles}
        />
      )}
    />
  );

  const validateInputs = () => {
    if (tripType === "multi") {
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        if (!seg.from || !seg.to || !seg.date) {
          setError(`Please fill all fields for segment ${i + 1}.`);
          return false;
        }
      }
      if (segments.length < 2) {
        setError("Please add at least 2 cities for multi-city search.");
        return false;
      }
      if (segments.length > maxSegments) {
        setError("You can select a maximum of 6 segments.");
        return false;
      }
    } else {
      if (!from || !to) {
        setError("Please select both 'From' and 'To' locations.");
        return false;
      }
      if (!departDate) {
        setError("Please select a departure date.");
        return false;
      }
      if (tripType === "round" && !returnDate) {
        setError("Please select a return date for round trips.");
        return false;
      }
    }
    
    if (adults < 1 || adults + children < 1) {
      setError("At least one adult is required.");
      return false;
    }
    
    return true;
  };

  const handleSubmit = () => {
    if (!validateInputs()) return;
    setIsSubmitting(true);
    setError(null);
    
    try {
      const commonData = { passengers: adults + children, adults, children, cabinClass };
      const navigationState = tripType === "multi" 
        ? { tripType, segments, ...commonData }
        : { tripType, from, to, departDate, returnDate, fromDetails, toDetails, ...commonData };
      
      navigate("/results", { state: navigationState });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSegmentChange = (idx: number, key: 'from' | 'to' | 'date' | 'fromDetails' | 'toDetails', value: any) => {
    setSegments(prev => prev.map((seg, i) => i === idx ? { ...seg, [key]: value } : seg));
  };

  const addSegment = () => {
    if (segments.length < maxSegments) {
      setSegments(s => [...s, { from: "", to: "", date: "", fromDetails: null, toDetails: null }]);
      setMultiFromInputValue(inputs => [...inputs, ""]);
      setMultiToInputValue(inputs => [...inputs, ""]);
    }
  };

  const removeSegment = (idx: number) => {
    if (segments.length > 1) {
      setSegments(s => s.filter((_, i) => i !== idx));
      setMultiFromInputValue(inputs => inputs.filter((_, i) => i !== idx));
      setMultiToInputValue(inputs => inputs.filter((_, i) => i !== idx));
    }
  };

  const PassengerControl = ({ type, count, setCount, min, max, icon: Icon, ageRange }: any) => (
    <Box sx={{ display: "flex", alignItems: "center", mb: type === "Adult" ? 2 : 0 }}>
      <Icon fontSize="small" />
      <Typography variant="subtitle2" sx={{ ml: 1, minWidth: 42 }}>{type}</Typography>
      <Typography variant="caption" sx={{ color: "#888", ml: 1 }}>({ageRange})</Typography>
      <IconButton
        size="small"
        disabled={count <= min}
        onClick={() => setCount((c: number) => Math.max(min, c - 1))}
        sx={{
          mx: 1.5, borderRadius: "50%", bgcolor: "#f5f5f5", color: "#7686ca",
          border: "1px solid #e0e0e0", width: 30, height: 30,
          "&:hover": { bgcolor: "#f4f4fd" },
        }}
      >
        <Remove fontSize="small" />
      </IconButton>
      <Typography sx={{ mx: 0.5, minWidth: 22, textAlign: "center", fontWeight: 600 }}>
        {count}
      </Typography>
      <IconButton
        size="small"
        disabled={count >= max}
        onClick={() => setCount((c: number) => Math.min(max, c + 1))}
        sx={{
          mx: 0.5, borderRadius: "50%", bgcolor: "#e3ebfa", color: "#2857ec",
          border: "1px solid #b2c1ec", width: 30, height: 30,
          "&:hover": { bgcolor: "#dbe9fa" },
        }}
      >
        <Add fontSize="small" />
      </IconButton>
    </Box>
  );

  return (
    <Box
      sx={{
        backgroundImage: "url('/flightsearch-1.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "5vh",
        px: { xs: 1, md: 2 },
        pt: { xs: 2, md: 3 },
        pb: { xs: 2, md: 3 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <SearchHeaderTags
        currency="INR"
        countryFlag="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg"
      />
      
      <Box
        sx={{
          bgcolor: "#fff",
          borderRadius: "30px",
          width: "100%",
          maxWidth: "1400px",
          p: { xs: 3, sm: 4, md: 5 },
          boxShadow: 6,
        }}
      >
        {/* Trip Type and Cabin Class */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <RadioGroup
            row
            value={tripType}
            onChange={(e) => setTripType(e.target.value)}
            sx={{
              flexWrap: "wrap",
              "& .MuiFormControlLabel-root": { mr: 4, fontWeight: "bold" },
            }}
          >
            <FormControlLabel value="round" control={<Radio color="primary" />} label="Round Trip" />
            <FormControlLabel value="oneway" control={<Radio color="primary" />} label="One Way" />
            <FormControlLabel value="multi" control={<Radio color="primary" />} label="Multi City" />
          </RadioGroup>
          
          <Select
            value={cabinClass}
            onChange={(e) => setCabinClass(e.target.value)}
            sx={{
              minWidth: 180,
              borderRadius: "30px",
              ".MuiOutlinedInput-notchedOutline": { borderRadius: "30px" },
              height: "40px",
              ml: 1,
              fontWeight: 500,
            }}
          >
            <MenuItem value="ECONOMY">Economy</MenuItem>
            <MenuItem value="PREMIUM_ECONOMY">Premium Economy</MenuItem>
            <MenuItem value="BUSINESS">Business Class</MenuItem>
            <MenuItem value="FIRST">First Class</MenuItem>
          </Select>
        </Box>

        {/* One Way / Round Trip - All in One Line */}
        {(tripType === "oneway" || tripType === "round") && (
          <Grid container spacing={2} alignItems="end">
            <Grid item xs={12} sm={6} md={3}>
              <Typography fontWeight={400} mb={1} sx={{ color: "rgba(0, 0, 0, 0.55)" }}>From</Typography>
              {createAutocomplete(
                fromOptions,
                fromInputValue,
                (value) => { setFromInputValue(value); debouncedFromFetch(value); },
                (value) => { 
                  setFrom(value.value); 
                  setFromInputValue(value.label); 
                  setFromDetails(value); 
                },
                "New York (NYC)",
                true
              )}
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Typography fontWeight={400} mb={1} sx={{ color: "rgba(0, 0, 0, 0.55)" }}>To</Typography>
              {createAutocomplete(
                toOptions,
                toInputValue,
                (value) => { setToInputValue(value); debouncedToFetch(value); },
                (value) => { 
                  setTo(value.value); 
                  setToInputValue(value.label); 
                  setToDetails(value); 
                },
                "Los Angeles (LAX)",
                false
              )}
            </Grid>
            
            <Grid item xs={12} sm={12} md={2}>
              <Typography fontWeight={400} mb={1} sx={{ color: "rgba(0, 0, 0, 0.55)" }}>Dates</Typography>
              {tripType === "round" ? (
                <DatePicker.RangePicker
                  placeholder={['Departure', 'Return']}
                  value={[departDate ? dayjs(departDate) : null, returnDate ? dayjs(returnDate) : null]}
                  onChange={(_, dateString) => {
                    setDepartDate(Array.isArray(dateString) ? dateString[0] : "");
                    setReturnDate(Array.isArray(dateString) ? dateString[1] : "");
                  }}
                  format="YYYY-MM-DD"
                  style={{ width: '100%', height: '56px', borderRadius: '14px' }}
                />
              ) : (
                <DatePicker
                  placeholder="Departure"
                  value={departDate ? dayjs(departDate) : null}
                  onChange={(_, dateString) => {
                    setDepartDate(typeof dateString === "string" ? dateString : "");
                    setReturnDate("");
                  }}
                  format="YYYY-MM-DD"
                  style={{ width: '100%', height: '56px', borderRadius: '14px' }}
                />
              )}
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Typography fontWeight={400} mb={1} sx={{ color: "rgba(0, 0, 0, 0.55)" }}>Passengers</Typography>
              <Button
                variant="outlined"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                endIcon={<ExpandMore />}
                sx={{
                  height: 56,
                  borderRadius: "14px",
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  background: "#fafcff",
                  border: "1px solid #e0e0e0",
                  color: "#333",
                  fontWeight: 500,
                  textTransform: "none",
                }}
              >
                {adults + children} Passengers
              </Button>
              
              <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                PaperProps={{ sx: { p: 2, borderRadius: "14px", minWidth: 250, boxShadow: 6 } }}
              >
                <PassengerControl
                  type="Adult"
                  count={adults}
                  setCount={setAdults}
                  min={minAdults}
                  max={maxAdults}
                  icon={Person}
                  ageRange="12+"
                />
                <PassengerControl
                  type="Child"
                  count={children}
                  setCount={setChildren}
                  min={minChildren}
                  max={maxChildren}
                  icon={ChildCare}
                  ageRange="2-11"
                />
              </Popover>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="contained"
                startIcon={<Search />}
                onClick={handleSubmit}
                disabled={isSubmitting}
                fullWidth
                sx={{
                  bgcolor: "#2c39e8",
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "16px",
                  height: "56px",
                  borderRadius: "14px",
                  ":hover": { bgcolor: "#1f2ac4" },
                }}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        )}

        {/* Multi City */}
        {tripType === "multi" && (
          <Box sx={{ mb: 4 }}>
            {segments.map((segment, idx) => (
              <Grid container spacing={1} alignItems="center" key={idx} sx={{ mt: idx > 0 ? 2 : 0 }}>
                <Grid item xs={12} sm={4} md={3}>
                  {createAutocomplete(
                    fromOptions,
                    multiFromInputValue[idx] || "",
                    (value) => {
                      setMultiFromInputValue(inputs => inputs.map((v, i) => i === idx ? value : v));
                      debouncedFromFetch(value);
                    },
                    (value) => {
                      handleSegmentChange(idx, "from", value.value);
                      handleSegmentChange(idx, "fromDetails", value);
                      setMultiFromInputValue(inputs => inputs.map((v, i) => i === idx ? value.label : v));
                    },
                    "",
                    true,
                    "From"
                  )}
                </Grid>
                
                <Grid item xs={12} sm={4} md={3}>
                  {createAutocomplete(
                    toOptions,
                    multiToInputValue[idx] || "",
                    (value) => {
                      setMultiToInputValue(inputs => inputs.map((v, i) => i === idx ? value : v));
                      debouncedToFetch(value);
                    },
                    (value) => {
                      handleSegmentChange(idx, "to", value.value);
                      handleSegmentChange(idx, "toDetails", value);
                      setMultiToInputValue(inputs => inputs.map((v, i) => i === idx ? value.label : v));
                    },
                    "",
                    false,
                    "To"
                  )}
                </Grid>
                
                <Grid item xs={12} sm={3} md={2}>
                  <DatePicker
                    placeholder="Date"
                    value={segment.date ? dayjs(segment.date) : null}
                    onChange={(_, dateString) =>
                      handleSegmentChange(idx, 'date', typeof dateString === 'string' ? dateString : "")
                    }
                    format="YYYY-MM-DD"
                    style={{ width: '100%', borderRadius: '14px', height: '56px' }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={1} md={1}>
                  {segments.length > 1 && (
                    <IconButton color="error" onClick={() => removeSegment(idx)} sx={{ mt: 0.5 }}>
                      <Close />
                    </IconButton>
                  )}
                </Grid>
              </Grid>
            ))}
            
            <Button
              onClick={addSegment}
              disabled={segments.length >= maxSegments}
              startIcon={<Add />}
              variant="outlined"
              sx={{ mt: 2 }}
            >
              Add City
            </Button>

            {/* Search button for multi-city - separate row */}
            <Grid container spacing={1} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6} md={2}>
                <Typography fontWeight={400} mb={1} sx={{ color: "rgba(0, 0, 0, 0.55)" }}>Passengers</Typography>
                <Button
                  variant="outlined"
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  endIcon={<ExpandMore />}
                  sx={{
                    height: 56,
                    borderRadius: "14px",
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    background: "#fafcff",
                    border: "1px solid #e0e0e0",
                    color: "#333",
                    fontWeight: 500,
                    textTransform: "none",
                  }}
                >
                  {adults + children} Passengers
                </Button>
                
                <Popover
                  open={Boolean(anchorEl)}
                  anchorEl={anchorEl}
                  onClose={() => setAnchorEl(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  PaperProps={{ sx: { p: 2, borderRadius: "14px", minWidth: 250, boxShadow: 6 } }}
                >
                  <PassengerControl
                    type="Adult"
                    count={adults}
                    setCount={setAdults}
                    min={minAdults}
                    max={maxAdults}
                    icon={Person}
                    ageRange="12+"
                  />
                  <PassengerControl
                    type="Child"
                    count={children}
                    setCount={setChildren}
                    min={minChildren}
                    max={maxChildren}
                    icon={ChildCare}
                    ageRange="2-11"
                  />
                </Popover>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <Button
                  variant="contained"
                  startIcon={<Search />}
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  fullWidth
                  sx={{
                    mt: 3.5,
                    bgcolor: "#2c39e8",
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: "16px",
                    height: "56px",
                    borderRadius: "14px",
                    ":hover": { bgcolor: "#1f2ac4" },
                  }}
                >
                  Search
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FlightSearch;