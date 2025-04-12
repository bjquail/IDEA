// pages/index.js
import { useState } from 'react';
import styles from './index.module.css';

export default function Home() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I’m IDEA — your learning design assistant. What are you working on today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages })
      });
      const data = await res.json();
      if (data.reply) {
        setMessages([...updatedMessages, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages([...updatedMessages, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
      }
    } catch (err) {
      setMessages([...updatedMessages, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1><strong>IDEA:</strong> Instructional Design Experience Assistant</h1>

      <div className={styles.chatBox}>
        {messages.map((msg, index) => (
          <div key={index} className={msg.role === 'user' ? styles.userMessage : styles.assistantMessage}>
            <span className={styles.label}>{msg.role === 'user' ? 'You' : 'IDEA'}:</span>
            <span className={styles.message} dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br />') }} />
          </div>
        ))}
        {loading && (
          <div className={styles.assistantMessage}>
            <span className={styles.label}>IDEA:</span>
            <span className={styles.thinking}>
              Thinking<span className={styles.dots}><span>.</span><span>.</span><span>.</span></span>
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <input
          type="text"
          placeholder="Ask me anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">➤</button>
      </form>
    </div>
  );
}
