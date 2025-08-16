import { Flight } from "../Types/FlightTypes";

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