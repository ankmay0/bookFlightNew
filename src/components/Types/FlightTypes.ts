export interface Leg {
    legNo: string;
    flightNumber: string;
    operatingCarrierCode: string;
    aircraftCode: string;
    departureAirport: string;
    departureTerminal: string;
    departureDateTime: string;
    arrivalAirport: string;
    arrivalTerminal: string;
    arrivalDateTime: string;
    duration: string;
    layoverAfter: string | null;
}

export interface Trip {
    from: string;
    to: string;
    stops: number;
    totalFlightDuration: string;
    totalLayoverDuration: string;
    legs: Leg[];
}

export interface Flight {
    oneWay: boolean;
    seatsAvailable: number;
    currencyCode: string;
    basePrice: string;
    totalPrice: string;
    trips: Trip[];
    pricingAdditionalInfo?: string;
}

export type LocationState = {
  from: string;
  to: string;
  departDate: string;
  passengers: number;
  returnDate?: string;
  adults: number;
  children: number;
};



export interface SidebarFiltersProps {
    priceRange: number[];
    setPriceRange: React.Dispatch<React.SetStateAction<number[]>>;
    selectedTimes: string[];
    setSelectedTimes: React.Dispatch<React.SetStateAction<string[]>>;
    selectedStops: string[];
    setSelectedStops: React.Dispatch<React.SetStateAction<string[]>>;
    selectedAirlines: string[];
    setSelectedAirlines: React.Dispatch<React.SetStateAction<string[]>>;
    availableStops: string[];
    availableAirlines: string[];
    minPrice: number;
    maxPrice: number;
}
