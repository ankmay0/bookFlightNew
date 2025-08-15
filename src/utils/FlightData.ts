export const countryCodes = [
    { code: "+1", label: "United States (+1)" },
    { code: "+44", label: "United Kingdom (+44)" },
    { code: "+91", label: "India (+91)" },
    { code: "+86", label: "China (+86)" },
    { code: "+81", label: "Japan (+81)" },
];

const cityNames: Record<string, string> = {
    EWR: "Newark",
    JFK: "New York",
    LGA: "New York",
    LAX: "Los Angeles",
    ORD: "Chicago",
    ATL: "Atlanta",
    DFW: "Dallas",
    SFO: "San Francisco",
    SEA: "Seattle",
    BOS: "Boston",
    DEL: "Delhi",
    BOM: "Mumbai",
    BLR: "Bengaluru",
    MAA: "Chennai",
    HYD: "Hyderabad",
    CCU: "Kolkata",
    DXB: "Dubai",
    PDX: "Portland",
};

const airlineNames: Record<string, string> = {
    AA: "American Airlines",
    UA: "United Airlines",
    DL: "Delta Air Lines",
    SW: "Southwest Airlines",
    AS: "Alaska Airlines",
    BA: "British Airways",
    AI: "Air India",   
    EK: "Emirates",
    LH: "Lufthansa",
    AF: "Air France",
    JL: "Japan Airlines",
    CX: "Cathay Pacific",
    SQ: "Singapore Airlines",
    SY: "SpiceJet",
    VY: "Vueling Airlines",
    // Add more airline mappings as needed
};

export const getCityName = (airportCode: string | undefined): string => {
    return airportCode ? cityNames[airportCode.toUpperCase()] || airportCode : "Unknown";
};

export const getAirlineName = (carrierCode: string): string => {
    return airlineNames[carrierCode] || carrierCode;
};

export const getFlightName = (carrierCode: string, flightNumber: string): string => {
    const airlineName = getAirlineName(carrierCode);
    return `${airlineName} ${flightNumber}`;
};