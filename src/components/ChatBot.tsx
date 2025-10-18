import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Paper, Button, CircularProgress } from "@mui/material";
import { AirplanemodeActive as AirplaneIcon } from "@mui/icons-material";
import FlightCardsContainerChatBot from "./FlightCardContainerChatBot";
import ActivityCardChatBot from "./ActivityCardChatBot";
import ActivitiesMap from "./ActivitiesMap";
import { Console } from "console";

interface FlightParams {
  origin: string;
  destination: string;
  date: string;
  adults: number;
  returnDate?: string;
  children?: number;
}

interface Flight {
  totalPrice: string;
  basePrice?: string;
  currencyCode?: string;
  seatsAvailable?: number;
  trips: {
    from: string;
    to: string;
    legs: {
      operatingCarrierCode: string;
      departureDateTime: string;
      arrivalDateTime: string;
      flightNumber?: string;
      departureAirport?: string;
      arrivalAirport?: string;
      duration?: string;
    }[];
    stops: number;
    totalFlightDuration?: string;
  }[];
}

interface ActivityParams {
  location: string;
}

interface Activity {
  id: string;
  name: string;
  shortDescription?: string;
  description: string;
  price: { amount: string; currencyCode: string };
  bookingLink: string;
  pictures: string[];
  geoCode: { latitude: string; longitude: string };
}

interface Message {
  role: "user" | "assistant";
  text: string;
  flightParams?: FlightParams;
  flights?: Flight[];
  activityParams?: { coords: { latitude: number; longitude: number } };
  activities?: Activity[];
}

const parseBoldText = (text: unknown): string => {
  if (typeof text !== "string") {
    console.warn("parseBoldText received non-string input:", text);
    return String(text ?? "⚠️ Invalid message content");
  }
  return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
};

// Hardcoded activities for testing
const activitiesMap = [
  {
    id: "65709974",
    type: "activity",
    title: "Four Centuries of Entertainment on London's South Bank: A Self-Guided Audio Tour",
    subtitle: "None",
    description: "<div><p>Walk from London Bridge to the Tate Modern while you explore the South Bank of the River Thames at your own pace on this affordable self-guided tour...</p></div>",
    geoCode: { latitude: "51.5099787", longitude: "-0.0859812" },
    images: [
      "https://images.holibob.tech/eyJrZXkiOiJ...",
      "https://images.holibob.tech/eyJrZXkiOiJ..."
    ],
    bookingLink: "https://amadeus.booking.holibob.tech/product/e3a959a2-4ea7-4f2c-a72f-369ede3b6376",
    price: { currency: "GBP", amount: "6.0" },
    duration: "45 minutes",
    additionalInfo: "None"
  },
  {
    id: "137341038",
    type: "activity",
    title: "Build Your Own 7-hour Private London Tour in a Black Cab",
    subtitle: "None",
    description: "<div><p>At <strong>Black Cab Heritage Tours</strong>, we have a wide range of private tours...</p></div>",
    geoCode: { latitude: "51.5069873", longitude: "-0.123196" },
    images: [
      "https://images.holibob.tech/eyJrZXkiOiJ...",
      "https://images.holibob.tech/eyJrZXkiOiJ..."
    ],
    bookingLink: "https://amadeus.booking.holibob.tech/product/7cc5ca39-9bde-43d4-90c5-222469997f12",
    price: { currency: "GBP", amount: "770.0" },
    duration: "7 hours",
    additionalInfo: "None"
  },
];

const ChatBot: React.FC = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Hi 👋, how can I help you with your **flight booking** or **activities**?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch flights from API
  const fetchFlights = async (flightParams: FlightParams): Promise<Flight[]> => {
    try {
      const url = `http://127.0.0.1:8080/flights/search?originLocationCode=${flightParams.origin}&destinationLocationCode=${flightParams.destination}&departureDate=${flightParams.date}&adults=${flightParams.adults || 1}&infants=0&travelClass=ECONOMY&currencyCode=INR&max=3`;
      const flightRes = await fetch(url);


      if (!flightRes.ok) {
        throw new Error("Flight API failed");
      }

      const flightData = await flightRes.json();
      console.log(flightData);

      return flightData.map((flight: any) => ({
        totalPrice: String(flight.totalPrice || flight.basePrice || "0"),
        currencyCode: flight.currencyCode || "INR",
        seatsAvailable: flight.seatsAvailable || 0,
        trips: flight.trips.map((trip: any) => ({
          from: trip.from || flightParams.origin,
          to: trip.to || flightParams.destination,
          legs: trip.legs.map((leg: any) => ({
            operatingCarrierCode: leg.operatingCarrierCode || "Unknown",
            departureDateTime: leg.departureDateTime || "",
            arrivalDateTime: leg.arrivalDateTime || "",
            flightNumber: leg.flightNumber || "N/A",
            departureAirport: leg.departureAirport || flightParams.origin,
            arrivalAirport: leg.arrivalAirport || flightParams.destination,
            duration: leg.duration || "",
          })),
          stops: trip.stops || 0,
          totalFlightDuration: trip.totalFlightDuration || "",
        })),
      }));
    } catch (error) {
      console.warn("Flight API failed, using mock data");
      // Return mock data as fallback
      return [
        {
          totalPrice: "80000",
          currencyCode: "INR",
          seatsAvailable: 10,
          trips: [
            {
              from: flightParams.origin,
              to: flightParams.destination,
              legs: [
                {
                  operatingCarrierCode: "AI",
                  departureDateTime: `${flightParams.date}T08:00:00`,
                  arrivalDateTime: `${flightParams.date}T18:00:00`,
                  flightNumber: "AI101",
                  departureAirport: flightParams.origin,
                  arrivalAirport: flightParams.destination,
                  duration: "10h 00m",
                },
              ],
              stops: 1,
              totalFlightDuration: "10h 00m",
            },
          ],
        },
        {
          totalPrice: "70000",
          currencyCode: "INR",
          seatsAvailable: 2,
          trips: [
            {
              from: flightParams.origin,
              to: flightParams.destination,
              legs: [
                {
                  operatingCarrierCode: "6E",
                  departureDateTime: `${flightParams.date}T10:00:00`,
                  arrivalDateTime: `${flightParams.date}T20:00:00`,
                  flightNumber: "6E202",
                  departureAirport: flightParams.origin,
                  arrivalAirport: flightParams.destination,
                  duration: "10h 00m",
                },
              ],
              stops: 0,
              totalFlightDuration: "10h 00m",
            },
          ],
        },
        {
          totalPrice: "75000",
          currencyCode: "INR",
          seatsAvailable: 5,
          trips: [
            {
              from: flightParams.origin,
              to: flightParams.destination,
              legs: [
                {
                  operatingCarrierCode: "UK",
                  departureDateTime: `${flightParams.date}T12:00:00`,
                  arrivalDateTime: `${flightParams.date}T22:00:00`,
                  flightNumber: "UK303",
                  departureAirport: flightParams.origin,
                  arrivalAirport: flightParams.destination,
                  duration: "10h 00m",
                },
              ],
              stops: 1,
              totalFlightDuration: "10h 00m",
            },
          ],
        },
      ];
    }
  };

  // Fetch activities data
  const fetchActivities = async (activityParams: ActivityParams): Promise<{ activities: Activity[], coords: { latitude: number; longitude: number } }> => {
    let coords = { latitude: 51.5074, longitude: -0.1278 }; // Default: London

    if (activityParams.location === "current location") {
      try {
        coords = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
            reject
          );
        });
      } catch (error) {
        console.warn("Geolocation failed, using default coords");
      }
    } else if (activityParams.location) {
      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(activityParams.location)}&format=json&limit=1`
        );
        const geoData = await geoRes.json();
        if (geoData[0]) {
          coords = { latitude: parseFloat(geoData[0].lat), longitude: parseFloat(geoData[0].lon) };
        }
      } catch (error) {
        console.warn("Geocoding failed, using default coords");
      }
    }

    // Map hardcoded activities to Activity interface
    const activities: Activity[] = activitiesMap.map((act: any) => ({
      id: act.id,
      name: act.title,
      shortDescription: act.subtitle,
      description: act.description,
      price: { amount: act.price.amount, currencyCode: act.price.currency },
      bookingLink: act.bookingLink,
      pictures: act.images,
      geoCode: act.geoCode || { latitude: coords.latitude.toString(), longitude: coords.longitude.toString() },
    }));

    return { activities, coords };
  };

  const handleSend = async (userInput?: string) => {
    if (!userInput && input.trim() === "") {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Please enter a message to continue." },
      ]);
      return;
    }

    const userMessage: Message = { role: "user", text: userInput || input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const apiMessages = messages.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.text,
      }));
      const apiUserMessage = { role: userMessage.role, content: userMessage.text };

      const response = await fetch("http://localhost:8000", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are SkyHub Assistant, a helpful flight booking and activities assistant." },
            ...apiMessages,
            apiUserMessage,
          ],
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      console.log("Backend response:", JSON.stringify(data, null, 2));

      const botMessageData = data.choices?.[0]?.message;
      const botText = botMessageData?.content || "⚠️ Invalid response from server";
      const flightParams = botMessageData?.flight_params;
      const missingFields = botMessageData?.missing_fields || [];
      const activityParams = botMessageData?.activity_params;

      // 🧩 Handle missing flight fields - don't proceed with API calls
      // In your handleSend function, after receiving the response:
      if (missingFields && missingFields.length > 0) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: botText,
            flightParams: flightParams, // This now contains accumulated params
          },
        ]);
        setLoading(false);
        return;
      }

      let flights: Flight[] = [];
      let activities: Activity[] = [];
      let resolvedCoords: { latitude: number; longitude: number } | undefined;

      // 🛫 Only fetch flights if we have complete parameters
      if (flightParams && flightParams.origin && flightParams.destination && flightParams.date) {
        flights = await fetchFlights(flightParams);
      }

      // 🎯 Handle activities
      else if (activityParams) {
        const activityResult = await fetchActivities(activityParams);
        activities = activityResult.activities;
        resolvedCoords = activityResult.coords;
      }

      // 🗣️ Build and show bot response
      const botMessage: Message = {
        role: "assistant",
        text: botText,
        flightParams: flights.length > 0 ? flightParams : undefined,
        flights: flights.length > 0 ? flights : undefined,
        activityParams: resolvedCoords ? { coords: resolvedCoords } : undefined,
        activities: activities.length > 0 ? activities : undefined,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        role: "assistant",
        text: error instanceof Error ? `⚠️ Error: ${error.message}` : "⚠️ Oops! Something went wrong. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };



  const handleSeeMore = (flightParams?: FlightParams) => {
    if (!flightParams) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "⚠️ No flight details available. Please provide a flight query (e.g., 'flights from JFK to LAX on 2025-10-01').",
        },
      ]);
      return;
    }

    const { origin, destination, date, adults, returnDate, children } = flightParams;
    if (!origin || !destination || !date) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "⚠️ Sorry, I couldn't find complete flight details. Please provide origin, destination, and date.",
        },
      ]);
      return;
    }

    const navigationState = {
      from: origin.toUpperCase(),
      to: destination.toUpperCase(),
      departDate: date,
      returnDate: returnDate || undefined,
      adults: adults || 1,
      children: children || 0,
      tripType: returnDate ? "roundtrip" : "oneway",
    };
    navigate("/results", { state: navigationState });
  };

  const handleBookFlight = (flight: Flight, flightParams: FlightParams) => {
    if (!flightParams.origin || !flightParams.destination || !flightParams.date) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "⚠️ Incomplete flight details. Please provide origin, destination, and date.",
        },
      ]);
      return;
    }

    const passengers = (flightParams.adults || 0) + (flightParams.children || 0);
    navigate("/passenger-details", {
      state: {
        flight: {
          ...flight,
          trips: [flight.trips[0]], // One-way flight
        },
        passengers,
      },
    });
  };

  const handleBookActivity = (bookingLink: string) => {
    window.open(bookingLink, '_blank');
  };

  return (
    <div>
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          aria-label="Open chat"
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "#3b73df",
            color: "white",
            border: "none",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            cursor: "pointer",
            fontSize: "24px",
            zIndex: 1000,
          }}
        >
          💬
        </button>
      )}

      {chatOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "min(90vw, 400px)",
            height: "100vh",
            background: "#fff",
            display: "flex",
            flexDirection: "column",
            zIndex: 2000,
            boxShadow: "-3px 0 10px rgba(0,0,0,0.2)",
          }}
        >
          <div
            style={{
              background: "#3b73df",
              color: "#fff",
              padding: "1rem",
              fontWeight: "bold",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            SkyHub Assistant
            <button
              onClick={() => setChatOpen(false)}
              aria-label="Close chat"
              style={{
                background: "transparent",
                color: "#fff",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
              }}
            >
              ✖
            </button>
          </div>

          <div
            style={{
              flex: 1,
              padding: "1rem",
              overflowY: "auto",
              fontSize: "0.95rem",
              background: "#f9f9f9",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Button onClick={() => handleSend("show me activities near me")}>Activities near me</Button>

            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "assistant" ? "flex-start" : "flex-end",
                  marginBottom: "0.5rem",
                }}
              >
                {msg.flights && msg.flightParams ? (
                  <FlightCardsContainerChatBot
                    flights={msg.flights}
                    flightParams={msg.flightParams}
                    onBookFlight={handleBookFlight}
                    onSeeMore={handleSeeMore}
                  />
                ) : msg.activities && msg.activityParams ? (
                  <Box sx={{ width: "100%" }}>
                    <Typography variant="body1" sx={{ mb: 1 }} dangerouslySetInnerHTML={{ __html: parseBoldText(msg.text) }} />
                    {msg.activities.length > 0 ? (
                      <>
                        {msg.activities.map((activity, actIdx) => (
                          <ActivityCardChatBot
                            key={actIdx}
                            activity={activity}
                            index={actIdx}
                            onBookActivity={handleBookActivity}
                          />
                        ))}
                        <ActivitiesMap activities={msg.activities} coordinates={msg.activityParams.coords} />
                      </>
                    ) : (
                      <Paper
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "divider",
                          textAlign: "center",
                        }}
                      >
                        <Typography variant="body1">No activities found. Try a different location.</Typography>
                      </Paper>
                    )}
                  </Box>
                ) : (
                  <div
                    style={{
                      background: msg.role === "assistant" ? "#e6e6e6" : "#3b73df",
                      color: msg.role === "assistant" ? "#000" : "#fff",
                      padding: "0.8rem 1rem",
                      borderRadius: "10px",
                      maxWidth: "70%",
                      overflowWrap: "break-word",
                    }}
                    dangerouslySetInnerHTML={{ __html: parseBoldText(msg.text) }}
                  />
                )}
              </div>
            ))}

            {loading && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  marginBottom: "0.5rem",
                }}
              >
                <Box
                  sx={{
                    background: "#e6e6e6",
                    padding: "0.8rem 1rem",
                    borderRadius: "10px",
                    fontStyle: "italic",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <CircularProgress size={20} />
                  <Typography>Typing...</Typography>
                </Box>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div
            style={{
              display: "flex",
              borderTop: "1px solid #ddd",
              padding: "0.5rem",
            }}
          >
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              aria-label="Chat input"
              style={{
                flex: 1,
                border: "1px solid #ccc",
                borderRadius: "6px",
                padding: "0.7rem",
                fontSize: "0.9rem",
                outline: "none",
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading}
              aria-label="Send message"
              style={{
                background: "#3b73df",
                color: "#fff",
                border: "none",
                marginLeft: "0.5rem",
                padding: "0 1.2rem",
                borderRadius: "6px",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "16px",
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;