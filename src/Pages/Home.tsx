import React from "react";
import FlightSearch from "../components/Flightsearch";
import ChatBot from "../components/ChatBot";
import { destinations } from "../utils/Destination";
import { specialOffers } from "../utils/SpecialOffers";
import { testimonials } from "../utils/Testimonial";

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
          scrollbarWidth: "none",
          msOverflowStyle: "none",
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
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0px)")}
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
                marginBottom: "0.7rem",
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
  </main>
);

export default HomePage;