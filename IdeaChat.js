import { useState } from "react";
import styles from "./index.module.css";

export default function IdeaChat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I’m IDEA — your learning design assistant. What are you working on today?",
    },
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
    // Step 1: Start thread/run
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages }),
    });

    const { threadId, runId } = await res.json();

    // Step 2: Poll for response
    for (let i = 0; i < 20; i++) {
      const pollRes = await fetch("/api/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId, runId }),
      });

      const result = await pollRes.json();

      if (result.status === "completed") {
        setMessages([
          ...newMessages,
          { role: "assistant", content: result.reply || "No reply." },
        ]);
        setLoading(false);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000)); // wait 1s
    }

    // If we reach here, it timed out
    setMessages([
      ...newMessages,
      { role: "assistant", content: "Sorry, response timed out." },
    ]);
  } catch (err) {
    setMessages([
      ...newMessages,
      { role: "assistant", content: "Sorry, something went wrong." },
    ]);
  } finally {
    setLoading(false);
  }
};


  return (
    <main className={styles.container}>
      <h1 className={styles.title}>
        IDEA:{" "}
        <span style={{ fontWeight: 400 }}>
          Instructional Design Experience Assistant
        </span>
      </h1>

      <div className={styles.chatBox}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`${styles.messageBubble} ${
              msg.role === "user" ? styles.userMessage : styles.assistantMessage
            }`}
          >
            <span className={styles.label}>
              {msg.role === "user" ? "You" : "IDEA"}:
            </span>
            <span
              dangerouslySetInnerHTML={{
                __html: msg.content.replace(/\n/g, "<br />"),
              }}
            />
          </div>
        ))}

        {loading && (
          <div className={styles.assistantMessage}>
            <span className={styles.label}>IDEA:</span>
            <span className={styles.thinking}>
              Thinking
              <span className={styles.dots}>
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            </span>
          </div>
        )}
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
        <button
          onClick={sendMessage}
          disabled={loading}
          className={styles.button}
        >
          <svg
            className={styles.icon}
            fill="white"
            stroke="white"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="20"
            height="20"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </main>
  );
}
