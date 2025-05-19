// pages/index.js
import IdeaChat from "../IdeaChat";

export default function Home() {
  return (
<main className="min-h-screen flex flex-col items-center justify-start p-4 bg-[#f7f9fc]">
  
  <IdeaChat />

  <div className="cta-banner">
    ⚡ Want faster responses, saved projects, and exclusive features?  
    <a href="https://yourdomain.com/idea-pro" target="_blank">Join IDEA Pro</a>
  </div>
</main>

  );
}