import { useGetMyBookings, useGetMe, getGetMeQueryKey, getGetMyBookingsQueryKey } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { format, parseISO, differenceInSeconds, isPast } from "date-fns";
import { Calendar, Clock, MapPin, ArrowRight, Timer } from "lucide-react";
import { useEffect, useState } from "react";

function useCountdown(targetDateStr: string, targetTimeStr: string) {
  const [remaining, setRemaining] = useState<string | null>(null);

  useEffect(() => {
    const target = parseISO(`${targetDateStr}T${targetTimeStr}`);
    if (isPast(target)) {
      setRemaining(null);
      return;
    }

    const tick = () => {
      const secs = differenceInSeconds(target, new Date());
      if (secs <= 0) {
        setRemaining(null);
        return;
      }
      const h = Math.floor(secs / 3600);
      const m = Math.floor((secs % 3600) / 60);
      const s = secs % 60;
      if (h > 0) {
        setRemaining(`${h}h ${m}m ${s}s`);
      } else if (m > 0) {
        setRemaining(`${m}m ${s}s`);
      } else {
        setRemaining(`${s}s`);
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDateStr, targetTimeStr]);

  return remaining;
}

function CountdownBanner({ date, time, pitchName }: { date: string; time: string; pitchName: string }) {
  const remaining = useCountdown(date, time);

  if (!remaining) return null;

  return (
    <div className="bg-primary/10 border border-primary/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
        <Timer className="w-6 h-6 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground font-medium mb-0.5">Next match countdown</p>
        <p className="font-bold text-lg leading-tight truncate">{pitchName}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs text-muted-foreground mb-0.5 uppercase tracking-wider font-semibold">Starts in</p>
        <p className="text-2xl font-mono font-bold text-primary tabular-nums">{remaining}</p>
      </div>
    </div>
  );
}

export default function MyBookings() {
  const { data: user, isLoading: isUserLoading } = useGetMe({ query: { queryKey: getGetMeQueryKey(), retry: false } });
  const [, setLocation] = useLocation();
  const { data: bookings, isLoading: isBookingsLoading } = useGetMyBookings({ 
    query: { queryKey: getGetMyBookingsQueryKey(), enabled: !!user } 
  });

  if (isUserLoading) return null;
  if (!user) {
    setLocation("/auth");
    return null;
  }

  const now = new Date();
  const upcomingBookings = (bookings ?? [])
    .filter(b => parseISO(`${b.date}T${b.timeSlot}`) >= now)
    .sort((a, b) => parseISO(`${a.date}T${a.timeSlot}`).getTime() - parseISO(`${b.date}T${b.timeSlot}`).getTime());
  const pastBookings = (bookings ?? []).filter(b => parseISO(`${b.date}T${b.timeSlot}`) < now);

  // The soonest upcoming booking for the countdown
  const nextMatch = upcomingBookings[0];

  const BookingCard = ({ booking }: { booking: (typeof upcomingBookings)[number] }) => (
    <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 text-xs font-bold rounded uppercase tracking-wider ${
              booking.status === 'confirmed' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
            }`}>
              {booking.status}
            </span>
            <span className="text-xs text-muted-foreground font-mono">{booking.referenceNumber}</span>
          </div>
          <h3 className="text-xl font-bold">{booking.pitch.name}</h3>
        </div>
        <div className="text-left md:text-right">
          <p className="text-xl font-bold text-primary">₦{booking.totalPrice.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span>{format(parseISO(booking.date), 'EEEE, MMM d, yyyy')}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span>{booking.timeSlot}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span>{booking.pitch.location}</span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
        <span className="text-sm capitalize">{booking.matchType} Match</span>
        <Link href={`/booking/confirm/${booking.referenceNumber}`}>
          <Button variant="secondary" size="sm">View Details</Button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-12 pb-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
        <p className="text-muted-foreground mb-8">Manage your upcoming matches and view past history.</p>

        {isBookingsLoading ? (
          <div className="space-y-4">
            <div className="h-24 bg-card border border-border rounded-2xl animate-pulse" />
            {[1, 2].map(i => (
              <div key={i} className="h-48 bg-card border border-border rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : bookings?.length === 0 ? (
          <div className="bg-card border border-border rounded-3xl p-12 text-center">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-bold mb-2">No bookings yet</h2>
            <p className="text-muted-foreground mb-8">You haven't booked any pitches yet. Ready to play?</p>
            <Link href="/pitches">
              <Button className="h-12 px-8 font-bold glow-effect text-primary-foreground">
                Find a Pitch <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Countdown banner for next match */}
            {nextMatch && (
              <CountdownBanner
                date={nextMatch.date}
                time={nextMatch.timeSlot}
                pitchName={nextMatch.pitch.name}
              />
            )}

            {upcomingBookings.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Upcoming Matches
                </h2>
                <div className="space-y-4">
                  {upcomingBookings.map(b => <BookingCard key={b.id} booking={b} />)}
                </div>
              </div>
            )}

            {pastBookings.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-muted-foreground">Past Matches</h2>
                <div className="space-y-4 opacity-80">
                  {pastBookings.map(b => <BookingCard key={b.id} booking={b} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
