import { SpecialOffer } from "../components/Types/FlightTypes";

export const specialOffers: SpecialOffer[] = [
  {
    title: "Student Discount",
    description: "Up to 15% off on international flights",
    code: "STUDENT15",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=300&h=200&fit=crop&auto=format",
    validity: "Valid till Dec 2025",
  },
  {
    title: "Senior Citizen",
    description: "Special fares for passengers 60+ years",
    code: "SENIOR20",
    image: "https://images.unsplash.com/photo-1544967882-4dcbb8489cd0?w=300&h=200&fit=crop&auto=format",
    validity: "Year-round offer",
  },
  {
    title: "Group Booking",
    description: "Save more when booking for 6+ passengers",
    code: "GROUP25",
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=200&fit=crop&auto=format",
    validity: "Contact for details",
  },
];