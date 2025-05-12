"use client";
import { useEffect, useState } from "react";

export default function StratumPage() {
  const [status, setStatus] = useState("Connecting...");
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const ws = new WebSocket("ws://your-vps-ip:3333");

    ws.onopen = () => {
      setStatus("Connected");
      ws.send(JSON.stringify({
        id: 1,
        method: "render.subscribe",
        params: ["web-dashboard", "browser"]
      }));
    };

    ws.onmessage = (msg) => setMessages((prev) => [...prev, msg.data]);
    ws.onerror = () => setStatus("Error");
    ws.onclose = () => setStatus("Disconnected");

    return () => ws.close();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl mb-2">Stratum Status: {status}</h2>
      <div className="bg-gray-100 p-2 rounded max-h-96 overflow-auto">
        {messages.map((m, i) => (
          <pre key={i} className="text-sm">{m}</pre>
        ))}
      </div>
    </div>
  );
}
