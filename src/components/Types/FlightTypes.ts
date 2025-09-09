// FlightTypes.ts

// Existing interfaces (unchanged)
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

export interface Passenger {
  title: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  passport: string;
}

export interface Contact {
  email: string;
  phone: string;
  countryCode: string;
}

export interface Errors {
  passengers: Array<{
    firstName: string;
    lastName: string;
    dob: string;
    gender: string;
  }>;
  contact: {
    email: string;
    phone: string;
    countryCode: string;
  };
}

export interface LocationState {
  from: string;
  to: string;
  departDate: string;
  passengers: number;
  returnDate?: string;
  adults: number;
  children: number;
}

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
  stopCounts?: {
    "Non-stop": number;
    "1 stop": number;
    "2+ stops": number;
  };
}

export interface TripReviewProps {
  departureFlight: Flight;
  returnFlight?: Flight | null;
  multiCityFlights?: Flight[];
  passengers: number;
  from: string;
  to: string;
  fromDetails?: any;
  toDetails?: any;
  onBack: () => void;
  onConfirm: () => void;
}

// New interfaces for HomePage data
export interface Destination {
  city: string;
  country: string;
  image: string;
}

export interface TrendingDeal {
  route: string;
  price: string;
  image: string;
  desc: string;
}

export interface Testimonial {
  name: string;
  quote: string;
  img: string;
}

export interface TopAirline {
  name: string;
  rating: string;
  image: string;
  routes: string;
}

export interface TravelTip {
  title: string;
  tip: string;
  icon: string;
  image: string;
}

export interface FlightClass {
  class: string;
  features: string[];
  image: string;
  priceRange: string;
}

export interface SpecialOffer {
  title: string;
  description: string;
  code: string;
  image: string;
  validity: string;
}