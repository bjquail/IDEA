// IdeaChat.js
import { useState } from "react";
import styles from "./index.module.css";

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
    <main className={styles.container}>
      <h1 className={styles.title}>
        IDEA: <span style={{ fontWeight: 400 }}>Instructional Design Experience Assistant</span>
      </h1>

      <div className={styles.chatBox}>
        {messages.map((msg, i) => (
          <p key={i} className={styles.message}>
            <strong>{msg.role === "assistant" ? "IDEA" : "You"}:</strong> {msg.content}
          </p>
        ))}
      </div>

      <div className={styles.inputGroup}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask me anything..."
          disabled={loading}
          className={styles.input}
        />
        <button onClick={sendMessage} disabled={loading} className={styles.button}>
          <svg
            className={styles.icon}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </main>
  );
}
