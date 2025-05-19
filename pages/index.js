// pages/index.js
import IdeaChat from "../IdeaChat";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-start p-4 bg-[#f7f9fc]">
      <div className="content-wrapper">
        <IdeaChat />

 <div
  className="cta-banner"
  style={{ textAlign: "center" }}
>
  ⚡ Want faster responses, saved projects, and exclusive features?  
  <a
    href="https://yourdomain.com/idea-pro"
    target="_blank"
    rel="noopener noreferrer"
    style={{ marginLeft: "0.5rem", textDecoration: "underline", color: "#1d4ed8" }}
  >
    Get IDEA Pro
  </a>
</div>
      </div>
    </main>
  );
}