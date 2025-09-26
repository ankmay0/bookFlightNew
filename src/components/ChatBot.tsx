import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Paper, Button, CircularProgress } from "@mui/material";
import { AirplanemodeActive as AirplaneIcon } from "@mui/icons-material";
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import Style from 'ol/style/Style';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import ActivitiesMap from "./ActivitiesMap";

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
    }[];
    stops: number;
  }[];
}

interface ActivityParams {
  coords: { latitude: number; longitude: number };
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
  activityParams?: ActivityParams;
  activities?: Activity[];
}

const parseBoldText = (text: unknown): string => {
  if (typeof text !== "string") {
    console.warn("parseBoldText received non-string input:", text);
    return String(text ?? "⚠️ Invalid message content");
  }
  return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
};

const airlinesData: { [key: string]: { name: string; icon: string } } = {
  DL: { name: "Delta Air Lines", icon: "https://content.airhex.com/content/logos/airlines_DL_75_75_s.png" },
  AA: { name: "American Airlines", icon: "https://content.airhex.com/content/logos/airlines_AA_75_75_s.png" },
  UA: { name: "United Airlines", icon: "https://content.airhex.com/content/logos/airlines_UA_75_75_s.png" },
  WN: { name: "Southwest Airlines", icon: "https://content.airhex.com/content/logos/airlines_WN_75_75_s.png" },
  B6: { name: "JetBlue Airways", icon: "https://content.airhex.com/content/logos/airlines_B6_75_75_s.png" },
  NK: { name: "Spirit Airlines", icon: "https://content.airhex.com/content/logos/airlines_NK_75_75_s.png" },
  F9: { name: "Frontier Airlines", icon: "https://content.airhex.com/content/logos/airlines_F9_75_75_s.png" },
  AI: { name: "Air India", icon: "https://content.airhex.com/content/logos/airlines_AI_75_75_s.png" },
  "6E": { name: "IndiGo", icon: "https://content.airhex.com/content/logos/airlines_6E_75_75_s.png" },
  SG: { name: "SpiceJet", icon: "https://content.airhex.com/content/logos/airlines_SG_75_75_s.png" },
  UK: { name: "Vistara", icon: "https://content.airhex.com/content/logos/airlines_UK_75_75_s.png" },
  TK: { name: "Turkish Airlines", icon: "https://content.airhex.com/content/logos/airlines_TK_75_75_s.png" },
};

const getAirlineName = (code: string) => airlinesData[code]?.name || code;
const getAirlineIconURL = (code: string) =>
  airlinesData[code]?.icon || `https://content.airhex.com/content/logos/airlines_${code.toUpperCase()}_75_75_s.png`;

const formatPrice = (price: string | number) => {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num || 0);
};

const mapStopsToLabel = (stops: number | undefined) => {
  if (stops === undefined || stops === null) return "Unknown";
  if (stops === 0) return "Non-stop";
  if (stops === 1) return "1 stop";
  return `${stops} stops`;
};

const calculateFlightDuration = (flight: Flight): number => {
  if (!flight.trips?.[0]?.legs) return 0;
  const legs = flight.trips[0].legs;
  const first = legs[0],
    last = legs[legs.length - 1];
  if (!first?.departureDateTime || !last?.arrivalDateTime) return 0;
  return Math.floor((new Date(last.arrivalDateTime).getTime() - new Date(first.departureDateTime).getTime()) / 60000);
};

const stripHtmlTags = (html?: string) => {
  return html ? html.replace(/<[^>]*>/g, '') : 'No description available';
};

const ActivityMap: React.FC<{ activities: Activity[]; coords: { latitude: number; longitude: number } }> = ({ activities, coords }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const olMapRef = useRef<Map | null>(null);

  useEffect(() => {
    if (mapRef.current && !olMapRef.current) {
      const baseLayer = new TileLayer({
        source: new OSM()
      });

      const activitySource = new VectorSource();
      const activityLayer = new VectorLayer({
        source: activitySource
      });

      const userSource = new VectorSource();
      const userLayer = new VectorLayer({
        source: userSource
      });

      olMapRef.current = new Map({
        target: mapRef.current,
        layers: [baseLayer, activityLayer, userLayer],
        view: new View({
          center: fromLonLat([coords.longitude, coords.latitude]),
          zoom: 13
        })
      });

      // Add user marker
      const userFeature = new Feature({
        geometry: new Point(fromLonLat([coords.longitude, coords.latitude])),
      });
      userFeature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 7,
            fill: new Fill({ color: 'rgba(37, 99, 235, 0.9)' }),
            stroke: new Stroke({ color: '#ffffff', width: 2 })
          })
        })
      );
      userSource.addFeature(userFeature);

      // Add activity markers
      activities.forEach((act) => {
        const lat = parseFloat(act.geoCode.latitude);
        const lon = parseFloat(act.geoCode.longitude);
        if (!isNaN(lat) && !isNaN(lon)) {
          const feature = new Feature({
            geometry: new Point(fromLonLat([lon, lat])),
            name: act.name
          });
          feature.setStyle(
            new Style({
              image: new CircleStyle({
                radius: 6,
                fill: new Fill({ color: 'rgba(255, 140, 0, 0.9)' }),
                stroke: new Stroke({ color: '#ffffff', width: 2 })
              })
            })
          );
          activitySource.addFeature(feature);
        }
      });

      // Fit to extent if activities present
      if (activitySource.getFeatures().length > 0) {
        const extent = activitySource.getExtent();
        olMapRef.current.getView().fit(extent, { padding: [50, 50, 50, 50], maxZoom: 15 });
      }
    }

    return () => {
      if (olMapRef.current) {
        olMapRef.current.setTarget(undefined);
        olMapRef.current = null;
      }
    };
  }, [activities, coords]);

  return <div ref={mapRef} style={{ width: '100%', height: '300px' }} />;
};

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

  const parseFlightsFromHTML = (html: string, flightParams: FlightParams): Flight[] => {
    console.log("Parsing HTML:", html);
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const flightElements = doc.querySelectorAll("div[style*='background: #fff; border: 1px solid #ddd;']");

    const flights: Flight[] = [];
    flightElements.forEach((elem) => {
      const priceText = elem.querySelector("p:nth-of-type(2)")?.textContent || "";
      const price = priceText.match(/₹[\d,]+(\.\d+)?/)?.[0]?.replace("₹", "") || "0";
      const airline = elem.querySelector("p:nth-of-type(1)")?.textContent?.replace("Airline: ", "") || "Unknown";
      const carrierCode = Object.keys(airlinesData).find(
        (code) => airlinesData[code].name === airline || code === airline
      ) || "Unknown";
      const departureText = elem.querySelector("p:nth-of-type(3)")?.textContent?.replace("Departure: ", "") || "";
      const arrivalText = elem.querySelector("p:nth-of-type(4)")?.textContent?.replace("Arrival: ", "") || "";
      const departureDateTime = departureText.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/)?.[1] || `${flightParams.date}T08:00:00`;
      const arrivalDateTime = arrivalText.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/)?.[1] || `${flightParams.date}T18:00:00`;
      const stopsText = elem.querySelector("p:nth-of-type(5)")?.textContent?.replace("Stops: ", "") || "0";
      const stops = stopsText.includes("Non-stop") ? 0 : parseInt(stopsText) || 0;

      flights.push({
        totalPrice: price,
        currencyCode: "INR",
        seatsAvailable: 10,
        trips: [
          {
            from: flightParams.origin,
            to: flightParams.destination,
            legs: [
              {
                operatingCarrierCode: carrierCode,
                departureDateTime,
                arrivalDateTime,
              },
            ],
            stops,
          },
        ],
      });
    });

    console.log("Parsed flights:", flights);
    return flights;
  };

  const parseActivitiesFromHTML = (html: string): Activity[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const activityElements = doc.querySelectorAll("div[style*='background: #fff; border: 1px solid #ddd;']");

    const activities: Activity[] = [];
    activityElements.forEach((elem) => {
      const name = elem.querySelector("h3")?.textContent || "Unknown Activity";
      const priceText = elem.querySelector("p:nth-of-type(1)")?.textContent?.replace("Price: ", "") || "0 INR";
      const [amount, currencyCode] = priceText.split(" ");
      const description = elem.querySelector("p:nth-of-type(2)")?.textContent || "No description";

      activities.push({
        id: "",
        name,
        description,
        price: { amount, currencyCode },
        bookingLink: "",
        pictures: [],
        geoCode: { latitude: "0", longitude: "0" }
      });
    });

    return activities;
  };

  const handleSend = async () => {
    if (input.trim() === "") {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Please enter a message to continue." },
      ]);
      return;
    }

    const userMessage: Message = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const apiMessages = messages.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.text,
      }));
      const apiUserMessage = { role: userMessage.role, content: userMessage.text };

      const response = await fetch("https://ea00aa54820c.ngrok-free.app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are SkyHub Assistant, a helpful flight booking and activities assistant." },
            ...apiMessages,
            apiUserMessage,
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Backend response:", JSON.stringify(data, null, 2));
      const botTextRaw = data.choices?.[0]?.message?.content;
      const botText = typeof botTextRaw === "string" ? botTextRaw : "⚠️ Invalid response from server";
      const flightParams = data.choices?.[0]?.message?.flight_params;
      const activityParams = data.choices?.[0]?.message?.activity_params;
      let flights: Flight[] = [];
      let activities: Activity[] = [];

      if (data.choices?.[0]?.message?.flights) {
        flights = data.choices[0].message.flights.filter((flight: any) =>
          flight &&
          typeof flight.totalPrice === "string" &&
          flight.trips &&
          Array.isArray(flight.trips) &&
          flight.trips.length > 0 &&
          flight.trips[0].legs &&
          Array.isArray(flight.trips[0].legs) &&
          flight.trips[0].legs.length > 0 &&
          typeof flight.trips[0].legs[0].operatingCarrierCode === "string" &&
          typeof flight.trips[0].legs[0].departureDateTime === "string" &&
          typeof flight.trips[0].legs[0].arrivalDateTime === "string" &&
          typeof flight.trips[0].from === "string" &&
          typeof flight.trips[0].to === "string" &&
          typeof flight.trips[0].stops === "number"
        );
      } else if (flightParams && typeof botText === "string" && botText.includes("font-family: Arial, sans-serif")) {
        console.warn("Falling back to HTML parsing for flights");
        flights = parseFlightsFromHTML(botText, flightParams);
      }

      if (data.choices?.[0]?.message?.activities) {
        activities = data.choices[0].message.activities;
      } else if (activityParams && typeof botText === "string" && botText.includes("font-family: Arial, sans-serif")) {
        console.warn("Falling back to HTML parsing for activities");
        activities = parseActivitiesFromHTML(botText);
      }

      const botMessage: Message = {
        role: "assistant",
        text: flights.length > 0 ? "Here are the available flights:" : activities.length > 0 ? "Here are the available activities:" : botText,
        flightParams,
        flights: flights.length > 0 ? flights : undefined,
        activityParams,
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

  const handleSeeMore = (e: React.MouseEvent<HTMLAnchorElement>, flightParams?: FlightParams) => {
    e.preventDefault();
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

  const renderFlightCard = (flight: Flight, index: number, flightParams?: FlightParams) => {
    if (!flightParams || !flight.trips?.[0]?.legs?.[0]) {
      console.warn("Invalid flight data:", flight);
      return null;
    }
    const trip = flight.trips[0];
    const firstLeg = trip.legs[0];
    const lastLeg = trip.legs[trip.legs.length - 1];
    const airlineCode = firstLeg.operatingCarrierCode;
    const duration = calculateFlightDuration(flight);
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    return (
      <Paper
        key={index}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
        aria-label={`Flight from ${trip.from} to ${trip.to} with ${getAirlineName(airlineCode)}`}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <img
              src={getAirlineIconURL(airlineCode)}
              alt={getAirlineName(airlineCode)}
              style={{ width: 40, height: 40 }}
            />
            <Box>
              <Typography variant="body1" fontWeight={600}>
                {getAirlineName(airlineCode)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {mapStopsToLabel(trip.stops)}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="h6" fontWeight={700}>
              {formatPrice(flight.totalPrice)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {hours}h {minutes}m
            </Typography>
          </Box>
        </Box>
        <Box sx={{ mt: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="body2">
            {new Date(firstLeg.departureDateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
            {new Date(lastLeg.arrivalDateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {trip.from} → {trip.to}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleBookFlight(flight, flightParams)}
          sx={{ mt: 1, width: "100%" }}
          aria-label={`Book flight from ${trip.from} to ${trip.to} with ${getAirlineName(airlineCode)}`}
        >
          Book
        </Button>
      </Paper>
    );
  };

  const renderActivityCard = (activity: Activity, index: number) => (
    <Paper
      key={index}
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      {activity.pictures && activity.pictures.length > 0 && (
        <img
          src={activity.pictures[0]}
          alt={activity.name}
          style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }}
        />
      )}
      <Typography variant="h6" fontWeight={600}>
        {activity.name}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {activity.shortDescription || stripHtmlTags(activity.description)}
      </Typography>
      <Typography variant="body1" fontWeight={600} sx={{ mt: 1 }}>
        {activity.price.amount} {activity.price.currencyCode}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleBookActivity(activity.bookingLink)}
        sx={{ mt: 1, width: "100%" }}
      >
        Book Now
      </Button>
    </Paper>
  );

  // ============ for testing
  const activitiesMap = [
    {
      "id": "65709974",
      "type": "activity",
      "title": "Four Centuries of Entertainment on London's South Bank: A Self-Guided Audio Tour",
      "subtitle": "None",
      "description": "<div><p>Walk from London Bridge to the Tate Modern while you explore the South Bank of the River Thames at your own pace on this affordable self-guided tour...</p></div>",
      "geoCode": {
        "latitude": 51.5099787,
        "longitude": -0.0859812
      },
      "images": [
        "https://images.holibob.tech/eyJrZXkiOiJ...",
        "https://images.holibob.tech/eyJrZXkiOiJ..."
      ],
      "bookingLink": "https://amadeus.booking.holibob.tech/product/e3a959a2-4ea7-4f2c-a72f-369ede3b6376",
      "price": {
        "currency": "GBP",
        "amount": "6.0"
      },
      "duration": "45 minutes",
      "additionalInfo": "None"
    },
    {
      "id": "137341038",
      "type": "activity",
      "title": "Build Your Own 7-hour Private London Tour in a Black Cab",
      "subtitle": "None",
      "description": "<div><p>At <strong>Black Cab Heritage Tours</strong>, we have a wide range of private tours...</p></div>",
      "geoCode": {
        "latitude": 51.5069873,
        "longitude": -0.123196
      },
      "images": [
        "https://images.holibob.tech/eyJrZXkiOiJ...",
        "https://images.holibob.tech/eyJrZXkiOiJ..."
      ],
      "bookingLink": "https://amadeus.booking.holibob.tech/product/7cc5ca39-9bde-43d4-90c5-222469997f12",
      "price": {
        "currency": "GBP",
        "amount": "770.0"
      },
      "duration": "7 hours",
      "additionalInfo": "None"
    },
    {
      "id": "137341038",
      "type": "activity",
      "title": "Build Your Own 7-hour Private London Tour in a Black Cab",
      "subtitle": "None",
      "description": "<div><p>At <strong>Black Cab Heritage Tours</strong>, we have a wide range of private tours...</p></div>",
      "geoCode": {
        "latitude": 51.2039873,
        "longitude": -0.097196
      },
      "images": [
        "https://images.holibob.tech/eyJrZXkiOiJ...",
        "https://images.holibob.tech/eyJrZXkiOiJ..."
      ],
      "bookingLink": "https://amadeus.booking.holibob.tech/product/7cc5ca39-9bde-43d4-90c5-222469997f12",
      "price": {
        "currency": "GBP",
        "amount": "770.0"
      },
      "duration": "7 hours",
      "additionalInfo": "None"
    },
  ]

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
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (target.tagName === "A" && target.textContent === "See More") {
                const lastFlightMessage = messages
                  .slice()
                  .reverse()
                  .find((msg) => msg.role === "assistant" && msg.flightParams);
                handleSeeMore(e as any, lastFlightMessage?.flightParams);
              }
            }}
          >
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
                  <Box sx={{ width: "100%" }}>
                    <Typography variant="body1" sx={{ mb: 1 }} dangerouslySetInnerHTML={{ __html: parseBoldText(msg.text) }} />
                    {msg.flights.length > 0 ? (
                      <>
                        {msg.flights.map((flight, flightIdx) => renderFlightCard(flight, flightIdx, msg.flightParams))}
                        <Typography
                          component="a"
                          href="#"
                          sx={{ color: "#3b73df", textDecoration: "underline", cursor: "pointer", display: "block", mt: 1 }}
                          onClick={(e) => handleSeeMore(e, msg.flightParams)}
                        >
                          See More
                        </Typography>
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
                        <AirplaneIcon sx={{ fontSize: 40, color: "grey.400", mb: 1 }} />
                        <Typography variant="body1">No flights found. Try adjusting your query.</Typography>
                      </Paper>
                    )}
                  </Box>
                ) : msg.activities && msg.activityParams ? (
                  <Box sx={{ width: "100%" }}>
                    <Typography variant="body1" sx={{ mb: 1 }} dangerouslySetInnerHTML={{ __html: parseBoldText(msg.text) }} />
                    {msg.activities.length > 0 ? (
                      <>
                        {/* {msg.activities.map((activity, actIdx) => renderActivityCard(activity, actIdx))} */}
                        {/* <ActivityMap activities={msg.activities} coords={msg.activityParams.coords} /> */}
                        <ActivitiesMap activities={msg.activities} coordinates={msg.activityParams.coords} />
                        {/* <ActivitiesMap activities={activitiesMap} coordinates={{
                          latitude: 28.6139,
                          longitude: 77.209
                        }} /> */}
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
              onClick={handleSend}
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