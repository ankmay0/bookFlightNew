import { FlightClass } from "../components/Types/FlightTypes";

export const flightClasses: FlightClass[] = [
  {
    class: "Economy",
    features: ["Standard seating", "In-flight meal", "Entertainment system"],
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&auto=format",
    priceRange: "Most affordable",
  },
  {
    class: "Premium Economy",
    features: ["Extra legroom", "Priority boarding", "Enhanced meals"],
    image: "https://images.unsplash.com/photo-1544899489-a083461c4cd3?w=400&h=300&fit=crop&auto=format",
    priceRange: "Mid-range comfort",
  },
  {
    class: "Business",
    features: ["Lie-flat seats", "Lounge access", "Premium dining"],
    image: "https://images.unsplash.com/photo-1540979388789-6dcbb0db835f?w=400&h=300&fit=crop&auto=format",
    priceRange: "Luxury experience",
  },
];