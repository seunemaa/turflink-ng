import { useGetBookingsSummary, getGetBookingsSummaryQueryKey } from "@workspace/api-client-react";
import { useEffect, useRef, useState } from "react";
import { Zap } from "lucide-react";

const POLL_INTERVAL = 30_000; // 30 s

function buildActivity(pitch: { name: string; format: string }, matchType: string): string {
  const actions = [
    `🔥 Someone just booked a ${pitch.format} match at ${pitch.name}!`,
    `⚡ New ${matchType} match booked at ${pitch.name}!`,
    `🏟️ ${pitch.name} just got a fresh ${pitch.format} booking!`,
    `⚽ A ${matchType} squad locked in ${pitch.name} — pitch secured!`,
  ];
  // deterministic but looks varied across pitches
  return actions[Math.abs(pitch.name.charCodeAt(0) + matchType.charCodeAt(0)) % actions.length]!;
}

export function ActivityTicker() {
  const { data: summary } = useGetBookingsSummary({ 
    query: { 
      queryKey: getGetBookingsSummaryQueryKey(),
      refetchInterval: POLL_INTERVAL,
      staleTime: POLL_INTERVAL,
    } 
  });

  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const items: string[] = (summary?.recentBookings ?? []).map((b) =>
    buildActivity(b.pitch, b.matchType)
  );

  // Rotate through items every 4 s
  useEffect(() => {
    if (items.length === 0) return;
    intervalRef.current = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % items.length);
        setFade(true);
      }, 300);
    }, 4000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div className="flex items-center gap-3 mt-8 px-4 py-3 rounded-full bg-primary/5 border border-primary/15 w-fit max-w-full overflow-hidden">
      <span className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
        <Zap className="w-3.5 h-3.5" />
        Live
      </span>
      <div className="w-px h-4 bg-primary/30 shrink-0" />
      <p
        className="text-sm text-muted-foreground truncate transition-opacity duration-300"
        style={{ opacity: fade ? 1 : 0 }}
      >
        {items[index]}
      </p>
    </div>
  );
}
