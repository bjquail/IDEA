import { useState } from "react";

export default function IdeaChat() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I’m IDEA — your learning design assistant. What are you working on today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages })
      });
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setMessages([...newMessages, { role: "assistant", content: "Sorry, something went wrong." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      maxWidth: "720px",
      margin: "2rem auto",
      padding: "1.5rem",
      fontFamily: "system-ui, sans-serif",
      color: "#1e293b"
    }}>
      <h1 style={{ fontSize: "1.75rem", fontWeight: "600", marginBottom: "1.25rem" }}>
        IDEA: <span style={{ fontWeight: "400" }}>Instructional Design Experience Assistant</span>
      </h1>

      <div style={{
        border: "1px solid #e2e8f0",
        borderRadius: "0.5rem",
        padding: "1rem",
        minHeight: "300px",
        backgroundColor: "#f8fafc",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)"
      }}>
        {messages.map((msg, i) => (
          <p key={i} style={{ marginBottom: "0.75rem", lineHeight: "1.5" }}>
            <strong>{msg.role === "assistant" ? "IDEA" : "You"}:</strong> {msg.content}
          </p>
        ))}
      </div>

      <div style={{ display: "flex", marginTop: "1rem", gap: "0.5rem" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask me anything..."
          disabled={loading}
          style={{
            flex: 1,
            padding: "0.75rem 1rem",
            borderRadius: "0.5rem",
            border: "1px solid #cbd5e1",
            fontSize: "1rem"
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{
            backgroundColor: "#2563eb",
            color: "#fff",
            border: "none",
            padding: "0.75rem 1.25rem",
            borderRadius: "0.5rem",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "500"
          }}
        >
          {loading ? "Thinking..." : "Send"}
        </button>
      </div>
    </main>
  );
}
