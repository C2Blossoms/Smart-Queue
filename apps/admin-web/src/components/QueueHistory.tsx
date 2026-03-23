"use client";
import { useEffect, useState } from "react";
import { API_URL, WS_URL } from "@/lib/config";

interface Ticket {
  id: number;
  queue_number: number;
  pax: number;
  status: "COMPLETED" | "SKIPPED";
  created_at: string;
}

export default function QueueHistory() {
  const [history, setHistory] = useState<Ticket[]>([]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tickets/history`);
      if (!res.ok) throw new Error("History API returned " + res.status);
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();

    if (!WS_URL) return;

    const ws = new WebSocket(WS_URL);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "TICKET_COMPLETED" || data.type === "TICKET_SKIPPED") {
          fetchHistory();
        }
      } catch (e) {
        console.debug("WS Ignore:", e);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm w-full border border-slate-200 mt-6 max-w-2xl">
      <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
        Queue History
      </h2>

      {history.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-4">No recent history.</p>
      ) : (
        <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-2">
          {history.map((ticket) => (
            <div key={ticket.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-4">
                <span className={`font-black tracking-tight text-xl ${ticket.status === 'COMPLETED' ? 'text-teal-600' : 'text-rose-500'}`}>
                  A{ticket.queue_number}
                </span>
                <span className="text-xs font-semibold text-slate-400 bg-white px-2 py-1 rounded shadow-sm border border-slate-200">
                  {ticket.pax} Pax
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-xs font-bold uppercase tracking-wider ${ticket.status === 'COMPLETED' ? 'text-teal-500' : 'text-rose-500'}`}>
                  {ticket.status}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {new Date(ticket.created_at).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
