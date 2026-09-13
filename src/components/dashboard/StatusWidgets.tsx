import { useEffect, useState } from "react";
import { CloudSun } from "lucide-react";
import { weather } from "../../data/kpi";

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function formatTime(d: Date) {
  return d.toISOString().slice(11, 19) + " UTC";
}

export default function StatusWidgets() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="glass-panel animate-fade-in flex items-center gap-4 rounded-xl p-4">
      <div className="min-w-0 border-r border-border pr-4">
        <p className="text-[13px] font-semibold leading-tight text-text-primary">{formatDate(now)}</p>
        <p className="font-mono text-[11.5px] tabular-nums text-text-secondary">{formatTime(now)}</p>
      </div>
      <div className="flex items-center gap-2.5">
        <CloudSun size={22} className="text-text-primary" />
        <div>
          <p className="text-[15px] font-semibold leading-tight text-text-primary">{weather.temp}</p>
          <p className="text-[11px] text-text-secondary">{weather.condition}</p>
        </div>
      </div>
    </div>
  );
}
