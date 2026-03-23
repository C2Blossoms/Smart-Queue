"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API_URL, WS_URL } from "@/lib/config";

interface Ticket {
  id: number;
  queue_number: number;
  pax: number;
  status: string;
  queues_ahead: string;
}

export default function TicketPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [currentCalled, setCurrentCalled] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchTicketAndStatus = async () => {
    try {
      const [ticketRes, statusRes] = await Promise.all([
        fetch(`${API_URL}/api/tickets/${id}`),
        fetch(`${API_URL}/api/tickets/status`)
      ]);
      
      if (!ticketRes.ok || !statusRes.ok) throw new Error("API failed");
      
      const ticketData = await ticketRes.json();
      const statusData = await statusRes.json();
      
      setTicket(ticketData);
      setCurrentCalled(statusData.current_called);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchTicketAndStatus();

    const ws = new WebSocket(WS_URL);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "QUEUE_STATUS_UPDATED" || data.type === "TICKET_CALLED" || data.type === "TICKET_COMPLETED" || data.type === "TICKET_SKIPPED") {
          fetchTicketAndStatus();
        }
      } catch (e) {
        console.error("Error parsing WebSocket message:", e);
      }
    };

    return () => ws.close();
  }, [id]);

  if (loading) return <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50"><div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>;
  if (error || !ticket) return <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50 text-rose-500 font-bold">Ticket not found or network error.</div>;

  const queuesAhead = Number.parseInt(ticket.queues_ahead || "0", 10);

  const isMyTurn = currentCalled && currentCalled >= ticket.queue_number && ticket.status !== 'COMPLETED' && ticket.status !== 'SKIPPED';
  const isDone = ticket.status === 'COMPLETED' || ticket.status === 'SKIPPED';

  let statusText = "Waiting";
  let statusColor = "text-amber-500";
  
  if (isDone) {
    statusText = ticket.status;
    statusColor = "text-slate-400";
  } else if (isMyTurn) {
    statusText = "It's Your Turn!";
    statusColor = "text-teal-500 animate-pulse";
  }

  return (
    <main className="min-h-[100dvh] bg-slate-50 flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-sm flex flex-col gap-6">
        
        {/* Ticket Card */}
        <div className="bg-white rounded-3xl shadow-xl w-full p-8 text-center border border-slate-100 flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-3 bg-indigo-500"></div>
          
          <p className="text-slate-400 uppercase tracking-widest text-xs font-bold mb-4 mt-2">Your Ticket</p>
          <h1 className="text-8xl font-black text-indigo-600 tracking-tighter mb-4">A{ticket.queue_number}</h1>
          <div className="bg-slate-50 px-4 py-2 rounded-lg text-slate-500 font-medium text-sm border border-slate-100 mb-6">
            {ticket.pax} Pax
          </div>
          
          <div className="w-full border-t border-dashed border-slate-200 my-2"></div>
          
          <p className={`font-bold uppercase tracking-widest text-sm mt-6 ${statusColor}`}>
            {statusText}
          </p>
        </div>

        {/* Status Card */}
        {!isDone && (
          <div className="bg-white rounded-3xl shadow-md w-full p-6 border border-slate-100 flex flex-col gap-4">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Live Status</h2>
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-slate-500 font-medium">Now Serving</span>
              <span className="text-3xl font-black text-slate-800">{currentCalled ? `A${currentCalled}` : "-"}</span>
            </div>
            {!isMyTurn && (
              <div className="flex justify-between items-center bg-amber-50 p-4 rounded-2xl border border-amber-100">
                <span className="text-amber-700 font-medium">Queues Ahead</span>
                <span className="text-3xl font-black text-amber-600">{queuesAhead}</span>
              </div>
            )}
            {isMyTurn && (
              <div className="bg-teal-50 p-4 rounded-2xl border border-teal-100 text-center mt-2 shadow-sm">
                <span className="text-teal-700 font-bold">Please proceed to the counter</span>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
