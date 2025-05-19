// pages/index.js
import IdeaChat from "../IdeaChat";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-start p-4 bg-[#f7f9fc]">
      <div className="content-wrapper">
        <IdeaChat />

        <div className="cta-banner" style="text-align: center">
          ⚡ Want faster responses, saved projects, and exclusive features?  
          <a href="https://yourdomain.com/idea-pro" target="_blank">Get IDEA Pro</a>
        </div>
      </div>
    </main>
  );
}