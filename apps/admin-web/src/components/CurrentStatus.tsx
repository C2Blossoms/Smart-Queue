"use client";

import { useEffect, useState } from "react";

export default function CurrentStatus() {
  const [currentCalled, setCurrentCalled] = useState<number | null>(null);
  const [waitingCount, setWaitingCount] = useState<number>(0);

  const fetchStatus = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/tickets/status");
      if (!res.ok) throw new Error("Status API returned " + res.status);
      const data = await res.json();
      setCurrentCalled(data.current_called);
      setWaitingCount(data.waiting_count);
    } catch (err) {
      console.error("Failed to fetch status:", err);
    }
  };

  useEffect(() => {
    fetchStatus();

    const ws = new WebSocket("ws://localhost:3002");

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "QUEUE_STATUS_UPDATED" || data.type === "TICKET_CALLED" || data.type === "TICKET_JOINED") {
          fetchStatus();
        }
      } catch (e) {
        console.debug("Non-JSON or unrecognized message received from WS", e);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center justify-between my-6 border border-slate-200 w-full">
      <div className="text-center flex-1 border-r border-slate-100">
        <p className="text-slate-400 uppercase tracking-widest text-xs font-bold mb-2">Serving Ticket</p>
        <p className="text-6xl font-black text-indigo-600 tracking-tighter">
          {currentCalled ? `A${currentCalled}` : "-"}
        </p>
      </div>
      <div className="text-center flex-1">
        <p className="text-slate-400 uppercase tracking-widest text-xs font-bold mb-2">Waiting</p>
        <p className="text-6xl font-black text-slate-800 tracking-tighter">{waitingCount}</p>
      </div>
    </div>
  );
}
