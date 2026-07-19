import { useEffect, useState } from "react";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { format, parseISO } from "date-fns";
import {
  BarChart3,
  Calendar,
  Clock,
  DollarSign,
  Loader2,
  MapPin,
  ShieldAlert,
  Users,
  Copy,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface UpcomingMatch {
  id: number;
  referenceNumber: string;
  date: string;
  timeSlot: string;
  matchType: string;
  status: string;
  totalPrice: number;
  userName: string | null;
  userEmail: string | null;
  addOns: string[];
  pitch: {
    id: number;
    name: string;
    location: string;
    format: string;
  } | null;
}

interface AdminStats {
  totalRevenue: number;
  totalBookingsToday: number;
  upcomingMatches: UpcomingMatch[];
}

export default function Admin() {
  const { data: user, isLoading: isUserLoading } = useGetMe({ query: { queryKey: getGetMeQueryKey(), retry: false } });
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [yourUserId, setYourUserId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isUserLoading) return;
    if (!user) {
      setLocation("/auth");
      return;
    }

    fetch("/api/admin/stats", { credentials: "include" })
      .then(async (res) => {
        if (res.status === 403) {
          const body = await res.json().catch(() => ({}));
          setYourUserId(body.yourUserId ?? user.id ?? null);
          setForbidden(true);
          setLoading(false);
          return;
        }
        if (!res.ok) throw new Error("Failed to load admin stats");
        const data = await res.json();
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, isUserLoading, setLocation]);

  const copyId = () => {
    if (yourUserId) {
      navigator.clipboard.writeText(yourUserId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isUserLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Admin Access Required</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              To unlock admin access, add your Replit User ID to the{" "}
              <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs font-mono">
                ADMIN_USER_IDS
              </code>{" "}
              secret in your Replit project.
            </p>
          </div>
          {yourUserId && (
            <div className="bg-background border border-border rounded-xl p-4 space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Your User ID</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-primary font-mono text-sm bg-primary/5 px-3 py-2 rounded-lg break-all text-left">
                  {yourUserId}
                </code>
                <Button size="sm" variant="outline" onClick={copyId} className="shrink-0 gap-1.5">
                  {copied ? <CheckCheck className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Go to your Replit Secrets → add key{" "}
                <code className="text-primary bg-primary/10 px-1 rounded font-mono">ADMIN_USER_IDS</code>{" "}
                with this value, then restart the API server.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const formatNaira = (n: number) =>
    `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 0 })}`;

  return (
    <div className="min-h-screen pt-12 pb-24 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold leading-none">TurfLink NG — Management Portal</h1>
            <p className="text-muted-foreground text-sm mt-1">Internal admin view</p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid sm:grid-cols-3 gap-5 mb-12">
          <StatCard
            icon={<DollarSign className="w-6 h-6 text-primary" />}
            label="Total Revenue"
            value={formatNaira(stats.totalRevenue)}
            sub="all confirmed bookings"
          />
          <StatCard
            icon={<Calendar className="w-6 h-6 text-primary" />}
            label="Bookings Today"
            value={String(stats.totalBookingsToday)}
            sub={`as of ${format(new Date(), "HH:mm")}`}
          />
          <StatCard
            icon={<Users className="w-6 h-6 text-primary" />}
            label="Upcoming Matches"
            value={String(stats.upcomingMatches.length)}
            sub="scheduled from today"
          />
        </div>

        {/* Upcoming matches table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 p-6 border-b border-border">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Upcoming Matches</h2>
          </div>

          {stats.upcomingMatches.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No upcoming matches scheduled.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {["Reference", "Pitch", "Date & Time", "Match", "Booker", "Add-ons", "Total", "Status"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.upcomingMatches.map((match, i) => (
                    <tr
                      key={match.id}
                      className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/5"}`}
                    >
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs text-primary font-bold">{match.referenceNumber}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium whitespace-nowrap">{match.pitch?.name ?? "—"}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />{match.pitch?.location ?? "—"}
                          {match.pitch && <span className="ml-1">· {match.pitch.format}</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                          {format(parseISO(match.date), "EEE, MMM d yyyy")}
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground mt-0.5">
                          <Clock className="w-3.5 h-3.5" />
                          {match.timeSlot}
                        </div>
                      </td>
                      <td className="px-5 py-4 capitalize whitespace-nowrap">{match.matchType}</td>
                      <td className="px-5 py-4">
                        {match.userName ? (
                          <div>
                            <div className="font-medium">{match.userName}</div>
                            {match.userEmail && (
                              <div className="text-xs text-muted-foreground">{match.userEmail}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic text-xs">Guest</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {match.addOns.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {match.addOns.map((a) => (
                              <span key={a} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-md font-medium capitalize">
                                {a}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 font-bold text-primary whitespace-nowrap">
                        {formatNaira(match.totalPrice)}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                          match.status === "confirmed"
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {match.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-semibold">{label}</p>
        <p className="text-3xl font-bold leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-2">{sub}</p>
      </div>
    </div>
  );
}
