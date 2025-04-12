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
    <main style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>IDEA: Instructional Design Experience Assistant</h1>
      <div style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "1rem", minHeight: "300px" }}>
        {messages.map((msg, i) => (
          <p key={i} style={{ marginBottom: "0.75rem" }}>
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
          style={{ flex: 1, padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <button onClick={sendMessage} disabled={loading} style={{ padding: "0.5rem 1rem" }}>
          Send
        </button>
      </div>
    </main>
  );
}