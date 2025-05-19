// pages/index.js
import IdeaChat from "../IdeaChat";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4">
      <h1 className="text-xl font-bold mb-4">IDEA: Instructional Design Experience Assistant</h1>

      <IdeaChat />

      <div className="cta-banner">
        ⚡ Want faster responses, saved projects, and exclusive features?  
        <a href="https://yourdomain.com/idea-pro" target="_blank">Join IDEA Pro</a>
      </div>
    </main>
  );
}