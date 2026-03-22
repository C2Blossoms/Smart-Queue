"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [pax, setPax] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleJoin = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/tickets/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pax })
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/ticket/${data.ticket.id}`);
      } else {
        alert("Failed to join queue");
      }
    } catch (e) {
      console.error("Failed to join queue", e);
      alert("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-8 text-center border border-slate-100 flex flex-col items-center">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Smart Queue</h1>
        <p className="text-slate-500 mb-8 font-medium text-sm">Select party size and get your ticket</p>

        <div className="mb-10 w-full">
          <div className="block text-slate-400 font-bold mb-4 uppercase tracking-widest text-xs">Party Size (Pax)</div>
          <div className="flex items-center justify-between w-full bg-slate-50 p-2 rounded-2xl border border-slate-100">
            <button 
              onClick={() => setPax(p => p > 1 ? p - 1 : 1)}
              className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center text-3xl font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 active:scale-95 transition-all outline-none"
            >-</button>
            <span className="text-6xl font-black text-indigo-600">{pax}</span>
            <button 
              onClick={() => setPax(p => p + 1)}
              className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center text-3xl font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 active:scale-95 transition-all outline-none"
            >+</button>
          </div>
        </div>

        <button 
          onClick={handleJoin} 
          disabled={isLoading}
          className="w-full bg-indigo-600 text-white font-bold py-5 rounded-2xl shadow-lg shadow-indigo-200 uppercase tracking-widest text-sm disabled:opacity-50 hover:bg-indigo-700 active:bg-indigo-800 active:scale-[0.98] transition-all"
        >
          {isLoading ? "Getting Ticket..." : "Get Ticket Now"}
        </button>
      </div>
    </main>
  );
}
