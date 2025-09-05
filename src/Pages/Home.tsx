import React from "react";
import FlightSearch from "../components/Flightsearch";
import ChatBot from "../components/ChatBot";

// Updated destinations with reliable, fast-loading images
const destinations = [
  {
    city: "Delhi",
    country: "India",
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=600&fit=crop&auto=format",
  },
  {
    city: "Mumbai",
    country: "India",
    image: "https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=800&h=600&fit=crop&auto=format",
  },
  {
    city: "Bangalore",
    country: "India",
    image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&h=600&fit=crop&auto=format",
  },
  {
    city: "New York",
    country: "USA",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop&auto=format",
  },
  {
    city: "London",
    country: "UK",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop&auto=format",
  },
  {
    city: "Sydney",
    country: "Australia",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&auto=format",
  },
  {
    city: "Tokyo",
    country: "Japan",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop&auto=format",
  },
];

// Updated trending deals with aircraft images
const trendingDeals = [
  {
    route: "Delhi ↔ London",
    price: "₹32,500",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=400&fit=crop&auto=format",
    desc: "Non-stop, next week",
  },
  {
    route: "Bangalore ↔ Paris",
    price: "₹40,100",
    image: "https://images.unsplash.com/photo-1583946099379-f9c9cb8bc030?w=800&h=400&fit=crop&auto=format",
    desc: "Low fare, limited seats",
  },
  {
    route: "Mumbai ↔ New York",
    price: "₹68,200",
    image: "https://images.unsplash.com/photo-1544588440-fc12c57ccb7e?w=800&h=400&fit=crop&auto=format",
    desc: "1-stop, best for families",
  },
];

// Updated testimonials with professional profile images
const testimonials = [
  {
    name: "Jhon",
    quote: "Booking my flight was super fast and easy with SkyHub.",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format",
  },
  {
    name: "Priya",
    quote: "The deals section is awesome! I saved a lot.",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    name: "James",
    quote: "I could plan everything for my trip in one place.",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format",
  },
];

// Updated top airlines with better images
const topAirlines = [
  {
    name: "Air India",
    rating: "4.2/5",
    image: "https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?w=200&h=150&fit=crop&auto=format",
    routes: "150+ destinations",
  },
  {
    name: "IndiGo",
    rating: "4.0/5",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=200&h=150&fit=crop&auto=format",
    routes: "100+ destinations",
  },
  {
    name: "Emirates",
    rating: "4.5/5",
    image: "https://images.unsplash.com/photo-1583946099379-f9c9cb8bc030?w=200&h=150&fit=crop&auto=format",
    routes: "140+ destinations",
  },
  {
    name: "Qatar Airways",
    rating: "4.4/5",
    image: "https://images.unsplash.com/photo-1544588440-fc12c57ccb7e?w=200&h=150&fit=crop&auto=format",
    routes: "160+ destinations",
  },
];

// Updated travel tips with relevant images
const travelTips = [
  {
    title: "Pack Smart",
    tip: "Roll clothes instead of folding to save 30% more space",
    icon: "🎒",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=200&fit=crop&auto=format",
  },
  {
    title: "Travel Insurance",
    tip: "Always get travel insurance - it's cheaper than medical bills abroad",
    icon: "🛡️",
    image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=300&h=200&fit=crop&auto=format",
  },
  {
    title: "Currency Exchange",
    tip: "Use airport ATMs for better exchange rates than currency counters",
    icon: "💱",
    image: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=300&h=200&fit=crop&auto=format",
  },
  {
    title: "Documents",
    tip: "Keep digital and physical copies of important documents",
    icon: "📄",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300&h=200&fit=crop&auto=format",
  },
];

// Updated flight classes with cabin interior images
const flightClasses = [
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
    image: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=400&h=300&fit=crop&auto=format",
    priceRange: "Luxury experience",
  },
];

// Updated special offers with relevant images
const specialOffers = [
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

const HomePage: React.FC = () => (
  <main style={{ fontFamily: "sans-serif", background: "#fafbfc" }}>
    <FlightSearch />

    {/* Scrollable Popular Destinations */}
    <section style={{ padding: "2rem 1rem" }}>
      <h2 style={{ textAlign: "center", marginBottom: "1.2rem" }}>Popular Destinations</h2>
      <div
        style={{
          display: "flex",
          overflowX: "auto",
          gap: "1.2rem",
          padding: "0.8rem 0 0.5rem 0",
          maxWidth: "100vw",
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE 10
        }}
      >
        {destinations.map((dest, idx) => (
          <div
            key={idx}
            style={{
              minWidth: "230px",
              background: "#fff",
              borderRadius: "12px",
              boxShadow: "0 2px 8px #e6e6e6",
              border: "1px solid #f0f0f0",
              overflow: "hidden",
              flex: "0 0 auto",
              cursor: "pointer",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0px)"}
          >
            <img
              src={dest.image}
              alt={dest.city}
              style={{ width: "100%", height: "128px", objectFit: "cover" }}
              loading="lazy"
            />
            <div style={{ padding: "0.7rem 1rem 1.1rem 1rem" }}>
              <h3 style={{ margin: "0 0 0.3rem 0", fontSize: "1.17rem" }}>{dest.city}</h3>
              <p style={{ color: "#888", fontSize: "0.96rem" }}>{dest.country}</p>
            </div>
          </div>
        ))}
      </div>
    </section>





    {/* Special Offers */}
    <section style={{ padding: "2rem 1rem", background: "#fff" }}>
      <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>🎉 Special Offers</h2>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1.5rem",
          justifyContent: "center",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {specialOffers.map((offer, idx) => (
          <div
            key={idx}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              borderRadius: "15px",
              padding: "1.8rem",
              minWidth: "260px",
              maxWidth: "280px",
              textAlign: "center",
              boxShadow: "0 6px 20px rgba(102, 126, 234, 0.3)",
            }}
          >
            <h3 style={{ margin: "0 0 0.8rem 0" }}>{offer.title}</h3>
            <p style={{ margin: "0 0 1rem 0", fontSize: "0.95rem" }}>{offer.description}</p>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                padding: "0.5rem 1rem",
                borderRadius: "20px",
                margin: "1rem 0",
                fontWeight: "bold",
              }}
            >
              Code: {offer.code}
            </div>
            <p style={{ fontSize: "0.85rem", margin: 0, opacity: 0.9 }}>{offer.validity}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Testimonials */}
    <section style={{ padding: "2rem 1rem" }}>
      <h2 style={{ textAlign: "center", marginBottom: "1.2rem" }}>What Our Users Say</h2>
      <div
        style={{
          display: "flex",
          gap: "1.2rem",
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {testimonials.map((testi, i) => (
          <div
            key={i}
            style={{
              background: "#f5f7fa",
              borderRadius: "10px",
              padding: "1.3rem 1rem",
              flex: "1 1 220px",
              minWidth: "220px",
              textAlign: "center",
              boxShadow: "0 2px 6px #e3e3e3",
            }}
          >
            <img
              src={testi.img}
              alt={testi.name}
              style={{
                width: "54px",
                height: "54px",
                borderRadius: "50%",
                objectFit: "cover",
                marginBottom: "0.7rem"
              }}
              loading="lazy"
            />
            <p style={{ marginBottom: "1rem", fontStyle: "italic" }}>"{testi.quote}"</p>
            <div style={{ fontWeight: "bold", color: "#3b73df" }}>{testi.name}</div>
          </div>
        ))}
      </div>
    </section>

    <ChatBot />
    {/* Footer */}
  </main>
);

export default HomePage;