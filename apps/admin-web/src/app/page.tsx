import CurrentStatus from "@/components/CurrentStatus";
import QueueControl from "@/components/QueueControl";
import QueueHistory from "@/components/QueueHistory";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="w-full max-w-2xl flex flex-col items-center">
        <div className="mt-8 mb-4 text-center">
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-slate-500 font-medium mt-2">Smart Queue Staff Control Panel</p>
        </div>
        
        <CurrentStatus />
        <QueueControl />
        <QueueHistory />
      </div>
    </main>
  );
}
