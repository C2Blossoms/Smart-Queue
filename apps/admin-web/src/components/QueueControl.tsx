import { useState, useEffect } from "react";
import { API_URL } from "@/lib/config";

export default function QueueControl() {
  const [currentTicket, setCurrentTicket] = useState<{ id: number; queue_number: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/queue/active`)
      .then(res => res.json())
      .then(data => {
        if (data.ticket) setCurrentTicket(data.ticket);
      })
      .catch(console.error);
  }, []);

  const callNext = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/queue/call-next`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setCurrentTicket(data.ticket);
      } else {
        alert("No waiting tickets");
      }
    } catch (err) {
      console.error(err);
      alert("Error calling next ticket");
    } finally {
      setIsLoading(false);
    }
  };

  const completeTicket = async () => {
    if (!currentTicket) return;
    setIsLoading(true);
    try {
      await fetch(`${API_URL}/api/queue/${currentTicket.id}/complete`, { method: "PUT" });
      setCurrentTicket(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const skipTicket = async () => {
    if (!currentTicket) return;
    setIsLoading(true);
    try {
      await fetch(`${API_URL}/api/queue/${currentTicket.id}/skip`, { method: "PUT" });
      setCurrentTicket(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm w-full border border-slate-200 flex flex-col gap-6">
      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
        Staff Controls
      </h2>
      
      {currentTicket ? (
        <div className="flex flex-col gap-4">
          <div className="bg-indigo-50 p-5 rounded-xl flex justify-between items-center border border-indigo-100">
            <span className="font-semibold text-indigo-900 tracking-wide uppercase text-sm">Assisting Now</span>
            <span className="text-4xl font-black text-indigo-700 tracking-tighter">A{currentTicket.queue_number}</span>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={completeTicket} 
              disabled={isLoading}
              className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
            >
              Complete
            </button>
            <button 
              onClick={skipTicket} 
              disabled={isLoading}
              className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
            >
              Skip (No Show)
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={callNext} 
          disabled={isLoading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 px-6 rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50 text-xl tracking-wide w-full"
        >
          {isLoading ? "Calling..." : "Call Next Ticket"}
        </button>
      )}
    </div>
  );
}
