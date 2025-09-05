import React, { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  text: string;
}

// Helper function to parse **text** into bold HTML
const parseBoldText = (text: string): string => {
  // Replace **text** with <strong>text</strong>
  return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
};

const ChatBot: React.FC = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Hi 👋, how can I help you with your **flight booking**?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === "") return;

    const userMessage: Message = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Map messages to OpenAI-compatible format (text -> content)
      const apiMessages = messages.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.text,
      }));
      const apiUserMessage = { role: userMessage.role, content: userMessage.text };

      const response = await fetch("https://f37a2d9b2288.ngrok-free.app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are SkyHub Assistant, a helpful flight booking assistant." },
            ...apiMessages,
            apiUserMessage,
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const botText = data.choices?.[0]?.message?.content || "⚠️ No reply from server";

      const botMessage: Message = { role: "assistant", text: botText };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        role: "assistant",
        text:
          error instanceof Error
            ? `⚠️ Error: ${error.message}`
            : "⚠️ Oops! Something went wrong. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Floating Button */}
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
            width: "min(90vw, 400px)", // Responsive width
            height: "100vh",
            background: "#fff",
            display: "flex",
            flexDirection: "column",
            zIndex: 2000,
            boxShadow: "-3px 0 10px rgba(0,0,0,0.2)",
          }}
        >
          {/* Header */}
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

          {/* Messages */}
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
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "assistant" ? "flex-start" : "flex-end",
                  marginBottom: "0.5rem",
                }}
              >
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
                <div
                  style={{
                    background: "#e6e6e6",
                    padding: "0.8rem 1rem",
                    borderRadius: "10px",
                    fontStyle: "italic",
                  }}
                >
                  Typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
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