import React, { useState, useEffect } from "react";
import {
    Box,
    Paper,
    Typography,
    Stack,
    Breadcrumbs,
    Chip,
    Link,
    Collapse,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    CircularProgress,
    Tooltip,
    useMediaQuery,
    Fade,
    Alert,
} from "@mui/material";
import {
    FilterList as FilterListIcon,
    AirplanemodeActive as AirplaneIcon,
    FlightTakeoff,
    Schedule as ScheduleIcon,
    Person as PersonIcon,
    NavigateNext as NavigateNextIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { Flight } from "../Types/FlightTypes";
import Lottie from "lottie-react";
import FlightList from "./FlightList";
import TripReview from "./TripReview";

export type BookingStep = "departure" | "return" | "review";

// --- Utilities --- //
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
    TK: { name: "Turkish Airlines", icon: "https://content.airhex.com/content/logos/airlines_TK_75_75_s.png" },
};

const getAirlineName = (code: string) => {
    const d = airlinesData[code];
    return d ? d.name : code;
};

const getAirlineIconURL = (code: string) =>
    airlinesData[code]?.icon || `https://content.airhex.com/content/logos/airlines_${code.toUpperCase()}_75_75_s.png`;

const formatPrice = (price: string | number) => {
    const num = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(num || 0);
};

const mapStopsToLabel = (stops: number | undefined) => {
    if (stops === 0) return "Direct";
    if (stops === 1) return "1 stop";
    if (stops && stops > 1) return `${stops} stops`;
    return "Multiple stops";
};

const calculateFlightDuration = (flight: Flight): number => {
    if (!flight.trips?.[0]?.legs) return 0;
    const legs = flight.trips[0].legs;
    const first = legs[0],
        last = legs[legs.length - 1];
    if (!first?.departureDateTime || !last?.arrivalDateTime) return 0;
    return Math.floor(
        (new Date(last.arrivalDateTime).getTime() - new Date(first.departureDateTime).getTime()) / 60000
    );
};

// --- Main Component --- //
const FlightSearchResults: React.FC = () => {
    // --- State Declarations ---
    const [flights, setFlights] = useState<Flight[]>([]);
    const [filteredFlights, setFilteredFlights] = useState<Flight[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<string>("recommended");
    const [showFilters, setShowFilters] = useState<boolean>(true);
    const [priceRange, setPriceRange] = useState<number[]>([200, 150000]);
    const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
    const [selectedStops, setSelectedStops] = useState<string[]>([]);
    const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
    const [availableStops, setAvailableStops] = useState<string[]>([]);
    const [availableAirlines, setAvailableAirlines] = useState<string[]>([]);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(0);
    const [lottieJson, setLottieJson] = useState<any>(null);
    const [selectedDepartureFlight, setSelectedDepartureFlight] = useState<Flight | null>(null);
    const [expandedFilters, setExpandedFilters] = useState<boolean>(false);
    const [selectedReturnFlight, setSelectedReturnFlight] = useState<Flight | null>(null);
    const [currentStep, setCurrentStep] = useState<BookingStep>("departure");

    // --- Responsive & Routing ---
    const isMobile = useMediaQuery("(max-width:600px)");
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state || {};
    const { from, to, departDate, returnDate, adults, children, fromDetails, toDetails, tripType } = state;
    const isOneWay = tripType === "oneway" || !returnDate;

    // --- Data Fetching/Effect Logic ---
    useEffect(() => {
        fetch("/animation.json")
            .then((resp) => resp.json())
            .then(setLottieJson)
            .catch(() => setLottieJson(null));
    }, []);

    useEffect(() => {
        if (!from || !to || !departDate || (!adults && !children)) {
            setError("Missing search parameters. Please try again.");
            setLoading(false);
            return;
        }
        const adt = adults || 0,
            chd = children || 0;
        let url = `http://localhost:8080/flights/search?originLocationCode=${from}&destinationLocationCode=${to}&departureDate=${departDate}&currencyCode=INR`;
        if (adt) url += `&adults=${adt}`;
        if (chd) url += `&children=${chd}`;
        if (returnDate && !isOneWay) url += `&returnDate=${returnDate}`;
        setLoading(true);
        fetch(url)
            .then((res) => {
                if (!res.ok) {
                    throw new Error(
                        res.status === 400
                            ? "Invalid search parameters."
                            : res.status === 500
                            ? "Server error. Please try again later."
                            : `HTTP error ${res.status}`
                    );
                }
                return res.json();
            })
            .then((data) => {
                console.log("Flight search response:", data);
                let flightsArr: Flight[] = Array.isArray(data.flightsAvailable) ? data.flightsAvailable : [];
                setFlights(flightsArr);
                setFilteredFlights(flightsArr);
                const prices = flightsArr.map((f) => parseFloat(f.totalPrice || f.basePrice || "0") || 0);
                setMinPrice(Math.min(...prices) || 200);
                setMaxPrice(Math.max(...prices) || 150000);
                const stopsSet = new Set<string>(),
                    airlinesSet = new Set<string>();
                flightsArr.forEach((f) => {
                    stopsSet.add(mapStopsToLabel(f.trips?.[0]?.stops));
                    f.trips?.forEach((trip) => trip.legs.forEach((leg) => airlinesSet.add(leg.operatingCarrierCode)));
                });
                setAvailableStops(Array.from(stopsSet));
                setAvailableAirlines(Array.from(airlinesSet));
                setLoading(false);
            })
            .catch((err) => {
                console.error("Flight search error:", err);
                setError(err.message || "Failed to fetch flights. Please try again.");
                setFlights([]);
                setFilteredFlights([]);
                setLoading(false);
            });
    }, [from, to, departDate, returnDate, adults, children, isOneWay]);

    useEffect(() => {
        let updated = flights.filter((flight) => {
            const price = parseFloat(flight.totalPrice || flight.basePrice || "0") || 0;
            const airlineList = flight.trips.flatMap((t) => t.legs.map((l) => l.operatingCarrierCode));
            if (price < priceRange[0] || price > priceRange[1]) return false;
            if (selectedAirlines.length && !selectedAirlines.some((a) => airlineList.includes(a))) return false;
            if (selectedStops.length && !selectedStops.includes(mapStopsToLabel(flight.trips?.[0]?.stops))) return false;
            if (selectedTimes.length) {
                const hour = new Date(flight.trips?.[0]?.legs?.[0]?.departureDateTime ?? "").getHours();
                const match = selectedTimes.some((time) => {
                    if (time.includes("Morning")) return hour >= 6 && hour < 12;
                    if (time.includes("Afternoon")) return hour >= 12 && hour < 18;
                    if (time.includes("Evening")) return hour >= 18 && hour < 24;
                    return false;
                });
                if (!match) return false;
            }
            return true;
        });

        switch (sortBy) {
            case "priceLow":
                updated.sort((a, b) => (parseFloat(a.totalPrice) || 0) - (parseFloat(b.totalPrice) || 0));
                break;
            case "priceHigh":
                updated.sort((a, b) => (parseFloat(b.totalPrice) || 0) - (parseFloat(a.totalPrice) || 0));
                break;
            case "duration":
                updated.sort((a, b) => calculateFlightDuration(a) - calculateFlightDuration(b));
                break;
            case "departure":
                updated.sort(
                    (a, b) =>
                        new Date(a.trips?.[0]?.legs?.[0]?.departureDateTime ?? 0).getTime() -
                        new Date(b.trips?.[0]?.legs?.[0]?.departureDateTime ?? 0).getTime()
                );
                break;
            default:
                break;
        }
        setFilteredFlights(Array.isArray(updated) ? updated : []);
    }, [priceRange, selectedTimes, selectedStops, selectedAirlines, sortBy, flights]);

    // Compute count BEFORE any render functions that use it
    const count = isOneWay
        ? filteredFlights.filter((f) => f.trips?.[0]?.from === from && f.trips?.[0]?.to === to).length
        : selectedDepartureFlight
        ? filteredFlights.filter((f) => f.trips[1]?.from === to && f.trips[1]?.to === from).length
        : filteredFlights.filter((f) => f.trips?.[0]?.from === from && f.trips?.[0]?.to === to).length;

    // --- UI sections --- //
    const renderSearchHeader = () => {
        const fd = fromDetails || {};
        const td = toDetails || {};
        const totalPassengers = (adults || 0) + (children || 0);

        if (loading) return null; // GUARD FOR TRANSITIONS

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

    const renderBreadcrumb = () => {
        if (isOneWay) return null; // Hide breadcrumbs for one-way trips

        const highlight = {
            fontWeight: 700,
            px: 1.5,
            py: 0.5,
            borderRadius: 1.5,
            transition: ".18s",
            bgcolor: "white",
            color: "primary.main",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "none",
            display: "inline-flex",
            alignItems: "center",
            whiteSpace: "nowrap",
        };

        const inactive = {
            color: "text.disabled",
            px: 1.5,
            py: 0.5,
            display: "inline-flex",
            alignItems: "center",
            whiteSpace: "nowrap",
        };

        const departureFlightInfo = selectedDepartureFlight?.trips?.[0]?.legs;
        const returnFlightInfo = selectedReturnFlight?.trips?.[1]?.legs;

        return (
            <Box sx={{ mb: { xs: 2, md: 2 }, width: "auto", maxWidth: "100%" }}>
                <Breadcrumbs
                    separator={<NavigateNextIcon fontSize="small" />}
                    aria-label="breadcrumb"
                    sx={{ ml: { xs: 0.5, md: 0 }, flexWrap: "nowrap" }}
                >
                    {currentStep === "departure" ? (
                        <>
                            <Typography sx={highlight}>Select departure</Typography>
                            <Typography sx={inactive}>Choose returning flight</Typography>
                            <Typography sx={inactive}>Review your trip</Typography>
                        </>
                    ) : currentStep === "return" ? (
                        <>
                            <Typography sx={highlight}>
                                {departureFlightInfo
                                    ? `${getAirlineName(departureFlightInfo[0]?.operatingCarrierCode)} · ${from} → ${to}`
                                    : "Departure selected"}
                            </Typography>
                            <Typography sx={highlight}>Choose returning flight</Typography>
                            <Typography sx={inactive}>Review your trip</Typography>
                        </>
                    ) : (
                        <>
                            <Typography sx={highlight}>
                                {departureFlightInfo
                                    ? `${getAirlineName(departureFlightInfo[0]?.operatingCarrierCode)} · ${from} → ${to}`
                                    : "Departure selected"}
                            </Typography>
                            <Typography sx={highlight}>
                                {returnFlightInfo
                                    ? `${getAirlineName(returnFlightInfo[0]?.operatingCarrierCode)} · ${to} → ${from}`
                                    : "Return selected"}
                            </Typography>
                            <Typography sx={highlight}>Review your trip</Typography>
                        </>
                    )}
                </Breadcrumbs>

                {currentStep === "return" && (
                    <Link
                        underline="hover"
                        onClick={() => setCurrentStep("departure")}
                        sx={{ mt: 0.5, cursor: "pointer", ml: 1.5, fontSize: ".97em" }}
                    >
                        Change flight
                    </Link>
                )}

                {currentStep === "review" && (
                    <Box>
                        <Link
                            underline="hover"
                            onClick={() => setCurrentStep("departure")}
                            sx={{ mt: 0.5, cursor: "pointer", fontSize: ".97em", mr: 3.5 }}
                        >
                            Change flight
                        </Link>
                        <Link
                            underline="hover"
                            onClick={() => setCurrentStep("return")}
                            sx={{ mt: 0.5, cursor: "pointer", fontSize: ".97em", ml: 3 }}
                        >
                            Change flight
                        </Link>
                    </Box>
                )}
            </Box>
        );
    };

    const renderFlightCount = () => (
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
                        {isOneWay
                            ? `${count} flights found`
                            : selectedDepartureFlight
                            ? "Recommended returning flights"
                            : `${count} flights found`}
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
                            onClick={() => setShowFilters((p) => !p)}
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

    const renderLoading = () => (
        <Box
            sx={{
                minHeight: "65vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "white",
                p: 2,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "none",
            }}
        >
            {lottieJson ? <Lottie animationData={lottieJson} style={{ width: 320, height: 320 }} /> : <CircularProgress sx={{ mb: 2 }} />}
            <Typography variant="h6" sx={{ color: "primary.main", mt: 1 }}>
                Jetting through clouds to find you the best flights...
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 420, textAlign: "center" }}>
                Please wait a moment while we gather the top deals and schedules for your journey!
            </Typography>
        </Box>
    );

    const handleDepartureSelect = (flight: Flight) => {
        setSelectedDepartureFlight(flight);
        if (isOneWay) {
            navigate("/passenger-details", {
                state: {
                    flight: {
                        ...flight,
                        trips: [flight.trips[0]], // Only departure itinerary
                    },
                    passengers: (adults || 0) + (children || 0),
                },
            });
        } else {
            setCurrentStep("return");
        }
    };

    if (loading) return renderLoading();

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "white", p: { xs: 1, md: 4 } }}>
            {/* Side-by-side summary and flight count */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    justifyContent: "flex-start",
                    alignItems: { xs: "stretch", md: "flex-start" },
                    gap: 2,
                    mb: 2,
                }}
            >
                <Box sx={{ flex: { xs: "1 1 auto", md: "0 1 640px" }, minWidth: 0 }}>{renderSearchHeader()}</Box>
                <Box sx={{ flex: { xs: "1 1 auto", md: "0 0 auto" }, minWidth: 0, alignSelf: { xs: "auto", md: "center" } }}>
                    {renderFlightCount()}
                </Box>
            </Box>

            {error && (
                <Box sx={{ mb: 2 }}>
                    <Alert severity="error" onClose={() => setError(null)}>
                        {error}
                    </Alert>
                </Box>
            )}

            {currentStep === "review" ? (
                <TripReview
                    departureFlight={selectedDepartureFlight!}
                    returnFlight={selectedReturnFlight!}
                    passengers={(adults || 0) + (children || 0)}
                    from={from}
                    to={to}
                    fromDetails={fromDetails}
                    toDetails={toDetails}
                    onBack={() => setCurrentStep("return")}
                    onConfirm={() =>
                        navigate("/passenger-details", {
                            state: {
                                flight: {
                                    ...selectedDepartureFlight,
                                    trips: [selectedDepartureFlight!.trips[0], selectedReturnFlight!.trips[1]],
                                },
                                passengers: (adults || 0) + (children || 0),
                            },
                        })
                    }
                />
            ) : (
                <>
                    {renderBreadcrumb()}

                    {!loading && filteredFlights.length === 0 && (
                        <Paper
                            sx={{
                                p: 4,
                                mt: 4,
                                mb: 4,
                                borderRadius: 3,
                                textAlign: "center",
                                border: "1px solid",
                                borderColor: "divider",
                                boxShadow: "none",
                            }}
                        >
                            <AirplaneIcon sx={{ fontSize: 64, color: "grey.400", mb: 2 }} />
                            <Typography variant="h5" fontWeight={700}>
                                No flights found
                            </Typography>
                            <Typography color="text.secondary" sx={{ mb: 3 }}>
                                Try adjusting your filters or broaden your search dates.
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => {
                                    setSelectedAirlines([]);
                                    setSelectedStops([]);
                                    setSelectedTimes([]);
                                    setPriceRange([minPrice, maxPrice]);
                                }}
                            >
                                Clear All Filters
                            </Button>
                        </Paper>
                    )}

                    <FlightList
                        loading={loading}
                        lottieJson={lottieJson}
                        filteredFlights={filteredFlights}
                        selectedDepartureFlight={selectedDepartureFlight}
                        from={from}
                        to={to}
                        showFilters={showFilters}
                        handleDepartureSelect={handleDepartureSelect}
                        handleConfirmSelection={(flight) => {
                            setSelectedReturnFlight(flight);
                            setCurrentStep("review");
                        }}
                        mapStopsToLabel={mapStopsToLabel}
                        priceRange={priceRange}
                        setPriceRange={setPriceRange}
                        selectedTimes={selectedTimes}
                        setSelectedTimes={setSelectedTimes}
                        selectedStops={selectedStops}
                        setSelectedStops={setSelectedStops}
                        selectedAirlines={selectedAirlines}
                        setSelectedAirlines={setSelectedAirlines}
                        availableStops={availableStops}
                        availableAirlines={availableAirlines}
                        minPrice={minPrice}
                        maxPrice={maxPrice}
                        setSelectedDepartureFlight={setSelectedDepartureFlight}
                        currentStep={currentStep}
                    />
                </>
            )}
        </Box>
    );
};

export default FlightSearchResults;