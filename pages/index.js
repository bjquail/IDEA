// pages/index.js
import IdeaChat from "../IdeaChat";

export default function Home() {
  return (
<main className="min-h-screen flex flex-col items-center justify-start p-4 bg-[#f7f9fc]">
  //<h1 className="text-xl font-bold mb-4">IDEA: Instructional Design Experience Assistant</h1>//

  <IdeaChat />

  <div className="cta-banner">
    ⚡ Want faster responses, saved projects, and exclusive features?  
    <a href="https://yourdomain.com/idea-pro" target="_blank">Join IDEA Pro</a>
  </div>
</main>

  );
}