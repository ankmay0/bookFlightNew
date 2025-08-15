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
import { FlightTakeoff, FlightLand, Person, Search, Add, Remove, ChildCare, ExpandMore } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Autocomplete from "@mui/material/Autocomplete";
import { fetchLocations, createDebouncedFetcher } from "../utils/utils";
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import SearchHeaderTags from "../SearchHeaderTags";
import { Flight, LocationOn } from "@mui/icons-material";


const FlightSearch: React.FC = () => {
  const [tripType, setTripType] = useState("round");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const [fromOptions, setFromOptions] = useState<any[]>([]);
  const [toOptions, setToOptions] = useState<any[]>([]);
  const [fromInputValue, setFromInputValue] = useState("");
  const [toInputValue, setToInputValue] = useState("");
  const [isFromLoading, setIsFromLoading] = useState(false);
  const [isToLoading, setIsToLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cabinClass, setCabinClass] = useState("ECONOMY");
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const debouncedFromFetch = useMemo(
    () =>
      createDebouncedFetcher((keyword) => {
        fetchLocations(keyword, setFromOptions, setIsFromLoading, setError);
      }, 200),
    []
  );

  const debouncedToFetch = useMemo(
    () =>
      createDebouncedFetcher((keyword) => {
        fetchLocations(keyword, setToOptions, setIsToLoading, setError);
      }, 200),
    []
  );

  useEffect(() => {
    console.log("From Options:", JSON.stringify(fromOptions, null, 2));
    console.log("To Options:", JSON.stringify(toOptions, null, 2));
  }, [fromOptions, toOptions]);

  const validateInputs = () => {
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
    if (tripType === "multi") {
      setError("Multi-city is not yet supported.");
      return false;
    }
    if (adults < 1) {
      setError("At least one adult is required.");
      return false;
    }
    if (adults + children < 1) {
      setError("At least one passenger is required.");
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateInputs()) return;
    setIsSubmitting(true);
    setError(null);

    try {
      navigate("/results", {
        state: {
          tripType,
          from,
          to,
          departDate,
          returnDate,
          passengers: adults + children,
          adults,
          children,
        },
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "An error occurred.");
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const minAdults = 1;
  const maxAdults = 6;
  const minChildren = 0;
  const maxChildren = 6;

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
        {/* Inline group: radios and cabin dropdown */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <RadioGroup
            row
            value={tripType}
            onChange={(e) => setTripType(e.target.value)}
            sx={{
              flexWrap: "wrap",
              "& .MuiFormControlLabel-root": {
                mr: 4,
                fontWeight: "bold",
              },
            }}
          >
            <FormControlLabel
              value="round"
              control={<Radio color="primary" />}
              label="Round Trip"
            />
            <FormControlLabel
              value="oneway"
              control={<Radio color="primary" />}
              label="One Way"
            />
            <FormControlLabel
              value="multi"
              control={<Radio color="primary" />}
              label="Multi City"
            />
          </RadioGroup>
          <Select
            value={cabinClass}
            onChange={(e) => setCabinClass(e.target.value)}
            displayEmpty
            fullWidth={false}
            sx={{
              minWidth: 180,
              borderRadius: "30px",
              ".MuiOutlinedInput-notchedOutline": {
                borderRadius: "30px",
              },
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

        <Grid container spacing={1}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography fontWeight={400} mb={1} sx={{ color: "rgba(0, 0, 0, 0.55)" }}>
              From
            </Typography>
            <Autocomplete
              freeSolo
              options={fromOptions}
              getOptionLabel={(option) => (typeof option === "string" ? option : option.label)}
              inputValue={fromInputValue}
              onInputChange={(event, newInputValue) => {
                setFromInputValue(newInputValue);
                debouncedFromFetch(newInputValue);
              }}
              onChange={(event, value) => {
                if (value && typeof value !== "string") {
                  setFrom(value.value);
                  setFromInputValue(value.label); // Use label to include distance
                }
              }}
              filterOptions={(options) => options}
              loading={isFromLoading}
              noOptionsText="No locations found"
              renderOption={(props, option) => (
                <li
                  {...props}
                  style={{
                    padding: "10px 16px",
                    paddingLeft: option.isParent ? "16px" : "32px", // <-- Added indent for children
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

                  {/* Icon based on type */}
                  {option.isParent ? (
                    <LocationOn sx={{ color: "#999", mt: "2px" }} />
                  ) : (
                    <FlightTakeoff fontSize="small" style={{ color: "#43a047" }} />
                  )}

                  {/* Label & Distance */}
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: option.isParent ? 600 : 400,
                        color: "text.primary",
                      }}
                    >
                      {option.label}
                    </Typography>
                    {option.distance && (
                      <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.3 }}>
                        {option.distance} from city center
                      </Typography>
                    )}
                  </Box>
                </li>
              )}

              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="New York (NYC)"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <FlightTakeoff />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <>
                        {isFromLoading ? <></> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                    sx: { borderRadius: "14px" },
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: "14px" } }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography fontWeight={400} mb={1} sx={{ color: "rgba(0, 0, 0, 0.55)" }}>
              To
            </Typography>
            <Autocomplete
              freeSolo
              options={toOptions}
              getOptionLabel={(option) => (typeof option === "string" ? option : option.label)}
              inputValue={toInputValue}
              onInputChange={(event, newInputValue) => {
                setToInputValue(newInputValue);
                debouncedToFetch(newInputValue);
              }}
              onChange={(event, value) => {
                if (value && typeof value !== "string") {
                  setTo(value.value);
                  setToInputValue(value.label); // Use label to include distance
                }
              }}
              filterOptions={(options) => options}
              loading={isToLoading}
              noOptionsText="No locations found"
              renderOption={(props, option) => (
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
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <FlightLand fontSize="small" style={{ color: "#43a047" }} />

                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: option.isParent ? 600 : 400,
                        color: "text.primary",
                      }}
                    >
                      {option.label}
                    </Typography>
                    {option.distance && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          fontSize: "0.75rem",
                        }}
                      >
                        {option.distance} from city center
                      </Typography>
                    )}
                  </Box>
                </li>
              )}


              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Los Angeles (LAX)"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <FlightLand />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <>
                        {isToLoading ? <></> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                    sx: { borderRadius: "14px" },
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: "14px" } }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={12} md={2}>
            <Typography fontWeight={400} mb={1} sx={{ color: "rgba(0, 0, 0, 0.55)" }}>
              Dates
            </Typography>
            <DatePicker.RangePicker
              placeholder={['Departure', tripType === 'round' ? 'Return' : 'Till Now']}
              allowEmpty={[false, tripType === 'round' ? false : true]}
              value={[departDate ? dayjs(departDate) : null, returnDate ? dayjs(returnDate) : null]}
              onChange={(date, dateString) => {
                setDepartDate(dateString[0]);
                setReturnDate(dateString[1]);
              }}
              format="YYYY-MM-DD"
              style={{
                width: '100%',
                height: '56px',
                borderRadius: '14px'
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography fontWeight={400} mb={1} sx={{ color: "rgba(0, 0, 0, 0.55)" }}>
              Passengers
            </Typography>
            <Box
              sx={{
                width: "100%",
                maxWidth: "100%",
                position: "relative",
              }}
            >
              <Button
                variant="outlined"
                onClick={(e) => setAnchorEl(e.currentTarget)}
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
                endIcon={<ExpandMore />}
              >
                {adults + children} Passengers
              </Button>
              <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                PaperProps={{
                  sx: {
                    p: 2,
                    borderRadius: "14px",
                    minWidth: 250,
                    boxShadow: 6,
                  }
                }}
              >
                {/* Adult Controls */}
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Person fontSize="small" />
                  <Typography variant="subtitle2" sx={{ ml: 1, minWidth: 42 }}>Adult</Typography>
                  <Typography variant="caption" sx={{ color: "#888", ml: 1 }}>
                    (12+)
                  </Typography>
                  <IconButton
                    aria-label="remove adult"
                    size="small"
                    disabled={adults <= minAdults}
                    onClick={() => setAdults((count) => Math.max(minAdults, count - 1))}
                    sx={{
                      mx: 1.5,
                      borderRadius: "50%",
                      bgcolor: "#f5f5f5",
                      color: "#7686ca",
                      border: "1px solid #e0e0e0",
                      transition: "all 0.1s",
                      width: 30,
                      height: 30,
                      "&:hover": { bgcolor: "#f4f4fd" },
                    }}
                  >
                    <Remove fontSize="small" />
                  </IconButton>
                  <Typography component="span" sx={{ mx: 0.5, minWidth: 22, textAlign: "center", fontWeight: 600 }}>
                    {adults}
                  </Typography>
                  <IconButton
                    aria-label="add adult"
                    size="small"
                    disabled={adults >= maxAdults}
                    onClick={() => setAdults((count) => Math.min(maxAdults, count + 1))}
                    sx={{
                      mx: 0.5,
                      borderRadius: "50%",
                      bgcolor: "#e3ebfa",
                      color: "#2857ec",
                      border: "1px solid #b2c1ec",
                      transition: "all 0.1s",
                      width: 30,
                      height: 30,
                      "&:hover": { bgcolor: "#dbe9fa" },
                    }}
                  >
                    <Add fontSize="small" />
                  </IconButton>
                </Box>
                {/* Child Controls */}
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <ChildCare fontSize="small" sx={{ ml: 0 }} />
                  <Typography variant="subtitle2" sx={{ ml: 1, minWidth: 40 }}>Child</Typography>
                  <Typography variant="caption" sx={{ color: "#888", ml: 1 }}>
                    (2-11)
                  </Typography>
                  <IconButton
                    aria-label="remove child"
                    size="small"
                    disabled={children <= minChildren}
                    onClick={() => setChildren((count) => Math.max(minChildren, count - 1))}
                    sx={{
                      mx: 1.5,
                      borderRadius: "50%",
                      bgcolor: "#f5f5f5",
                      color: "#7686ca",
                      border: "1px solid #e0e0e0",
                      transition: "all 0.1s",
                      width: 30,
                      height: 30,
                      "&:hover": { bgcolor: "#f4f4fd" },
                    }}
                  >
                    <Remove fontSize="small" />
                  </IconButton>
                  <Typography component="span" sx={{ mx: 0.5, minWidth: 22, textAlign: "center", fontWeight: 600 }}>
                    {children}
                  </Typography>
                  <IconButton
                    aria-label="add child"
                    size="small"
                    disabled={children >= maxChildren}
                    onClick={() => setChildren((count) => Math.min(maxChildren, count + 1))}
                    sx={{
                      mx: 0.5,
                      borderRadius: "50%",
                      bgcolor: "#e3ebfa",
                      color: "#2857ec",
                      border: "1px solid #b2c1ec",
                      transition: "all 0.1s",
                      width: 30,
                      height: 30,
                      "&:hover": { bgcolor: "#dbe9fa" },
                    }}
                  >
                    <Add fontSize="small" />
                  </IconButton>
                </Box>
              </Popover>
            </Box>


          </Grid>
          <Grid item xs={4} sm={6} md={2}>
            <Button
              variant="contained"
              startIcon={<Search />}
              onClick={handleSubmit}
              disabled={isSubmitting}
              fullWidth
              sx={{
                mt: { xs: 0, sm: 3.5 },
                bgcolor: "#2c39e8",
                color: "#fff",
                fontWeight: "bold",
                fontSize: "16px",
                height: "56px",
                borderRadius: "14px",
                ":hover": {
                  bgcolor: "#1f2ac4",
                },
              }}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Box>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FlightSearch;