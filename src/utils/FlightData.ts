export const countryCodes = [
    { code: "+1", label: "United States (+1)" },
    { code: "+44", label: "United Kingdom (+44)" },
    { code: "+91", label: "India (+91)" },
    { code: "+86", label: "China (+86)" },
    { code: "+81", label: "Japan (+81)" },
];

export const getCityName = (airportCode: string | undefined): string => {
    const airportCityMap: { [key: string]: string } = {
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
    return airportCode ? airportCityMap[airportCode.toUpperCase()] || airportCode : "Unknown";
};

export {}