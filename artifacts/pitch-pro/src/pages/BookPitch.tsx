import { 
  useGetPitch, 
  useCheckAvailability, 
  useGetMe,
  useGetMembership,
  getGetPitchQueryKey,
  getCheckAvailabilityQueryKey,
  getGetMeQueryKey,
  getGetMembershipQueryKey,
} from "@workspace/api-client-react";
import { useParams, useLocation, Link } from "wouter";
import { useState } from "react";
import { format, addDays, formatISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { BookingInputMatchType, BookingInputAddOnsItem } from "@workspace/api-client-react";
import { Loader2, ArrowLeft, Shield, Clock, Calendar as CalIcon, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Extend window for Paystack inline SDK
declare global {
  interface Window {
    PaystackPop: {
      setup: (opts: {
        key: string;
        email: string;
        amount: number;
        ref: string;
        currency: string;
        label?: string;
        onClose: () => void;
        callback: (response: { reference: string }) => void;
      }) => { openIframe: () => void };
    };
  }
}

const ADD_ONS = [
  { id: BookingInputAddOnsItem.referee, label: "Professional Referee", price: 5000 },
  { id: BookingInputAddOnsItem.bibs,    label: "Team Bibs (2 colors)", price: 2000 },
  { id: BookingInputAddOnsItem.water,   label: "Cold Water Crate",      price: 3000 },
];

export default function BookPitch() {
  const params = useParams();
  const pitchId = Number(params.pitchId);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [date, setDate]                   = useState<Date>(new Date());
  const [timeSlot, setTimeSlot]           = useState<string>("");
  const [matchType, setMatchType]         = useState<BookingInputMatchType>(BookingInputMatchType.friendly);
  const [selectedAddOns, setSelectedAddOns] = useState<BookingInputAddOnsItem[]>([]);
  const [guestName, setGuestName]         = useState("");
  const [guestEmail, setGuestEmail]       = useState("");
  const [isInitializing, setIsInitializing] = useState(false);
  const [isVerifying, setIsVerifying]     = useState(false);

  const { data: user }       = useGetMe({ query: { queryKey: getGetMeQueryKey(), retry: false } });
  const { data: membership } = useGetMembership({ query: { queryKey: getGetMembershipQueryKey(), enabled: !!user } });
  const { data: pitch, isLoading: isPitchLoading } = useGetPitch(pitchId, {
    query: { enabled: !!pitchId, queryKey: getGetPitchQueryKey(pitchId) }
  });

  const dateStr = formatISO(date, { representation: "date" });
  const { data: availability, isLoading: isAvailabilityLoading } = useCheckAvailability(pitchId, dateStr, {
    query: { enabled: !!pitchId && !!dateStr, queryKey: getCheckAvailabilityQueryKey(pitchId, dateStr) }
  });

  const basePrice  = pitch?.pricePerHour || 0;
  const addOnsTotal = selectedAddOns.reduce((t, id) => t + (ADD_ONS.find(a => a.id === id)?.price || 0), 0);
  const subtotal   = basePrice + addOnsTotal;
  const isMember   = user?.isMember || membership?.isMember;
  const discount   = isMember ? Math.round(subtotal * 0.1) : 0;
  const total      = subtotal - discount;

  const handleAddOnToggle = (id: BookingInputAddOnsItem, checked: boolean) => {
    setSelectedAddOns(prev => checked ? [...prev, id] : prev.filter(a => a !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!timeSlot) {
      toast({ title: "Please select a time slot", variant: "destructive" });
      return;
    }
    if (!user && (!guestName || !guestEmail)) {
      toast({ title: "Please provide your contact details", variant: "destructive" });
      return;
    }

    setIsInitializing(true);

    try {
      // Step 1 — initialise Paystack transaction (server calculates price)
      const initRes = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          pitchId,
          date: dateStr,
          timeSlot,
          matchType,
          addOns: selectedAddOns,
          guestName:  user ? undefined : guestName,
          guestEmail: user ? undefined : guestEmail,
        }),
      });

      if (!initRes.ok) {
        const err = await initRes.json() as { error: string };
        toast({ title: "Payment error", description: err.error, variant: "destructive" });
        setIsInitializing(false);
        return;
      }

      const { reference, amount, publicKey, email, pitchName } =
        await initRes.json() as { reference: string; amount: number; publicKey: string; email: string; pitchName: string };

      // Step 2 — open Paystack inline popup
      const handler = window.PaystackPop.setup({
        key: publicKey,
        email,
        amount,           // kobo
        ref: reference,
        currency: "NGN",
        label: `TurfLink NG — ${pitchName}`,

        onClose: () => {
          toast({ title: "Payment cancelled", description: "Your booking was not completed.", variant: "destructive" });
          setIsInitializing(false);
        },

        callback: async (response) => {
          setIsInitializing(false);
          setIsVerifying(true);

          try {
            // Step 3 — verify with server; server saves booking only after confirming with Paystack
            const verRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                reference: response.reference,
                bookingData: {
                  pitchId,
                  date: dateStr,
                  timeSlot,
                  matchType,
                  addOns: selectedAddOns,
                  guestName:  user ? undefined : guestName,
                  guestEmail: user ? undefined : guestEmail,
                },
              }),
            });

            if (!verRes.ok) {
              const err = await verRes.json() as { error: string };
              toast({ title: "Verification failed", description: err.error, variant: "destructive" });
              return;
            }

            const booking = await verRes.json() as { referenceNumber: string };
            setLocation(`/booking/confirm/${booking.referenceNumber}`);
          } finally {
            setIsVerifying(false);
          }
        },
      });

      handler.openIframe();
    } catch {
      toast({ title: "Payment error", description: "Could not connect to payment service. Please try again.", variant: "destructive" });
      setIsInitializing(false);
    }
  };

  const isPaying = isInitializing || isVerifying;

  if (isPitchLoading || !pitch) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen pt-8 pb-24 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <Button variant="ghost" onClick={() => window.history.back()} className="mb-6 -ml-4 hover:bg-transparent hover:text-primary">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Book {pitch.name}</h1>
              <p className="text-muted-foreground">{pitch.location} • {pitch.format} • {pitch.surface}</p>
            </div>

            <form id="booking-form" onSubmit={handleSubmit} className="space-y-8">
              {/* Date & Time */}
              <div className="bg-card border border-border p-6 md:p-8 rounded-2xl space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <CalIcon className="w-5 h-5 text-primary" /> Select Date & Time
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <Label className="mb-4 block text-muted-foreground">Match Date</Label>
                    <div className="bg-background rounded-xl p-2 border border-border inline-block">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(d) => d && setDate(d)}
                        disabled={(d) => d < new Date(new Date().setHours(0,0,0,0)) || d > addDays(new Date(), 30)}
                        className="bg-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="mb-4 block text-muted-foreground">Available Time Slots</Label>
                    {isAvailabilityLoading ? (
                      <div className="flex items-center text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin mr-2"/> Loading slots...</div>
                    ) : availability?.availableSlots.length === 0 ? (
                      <div className="p-4 bg-muted/50 rounded-xl border border-border text-center text-muted-foreground">
                        No slots available on this date.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {availability?.availableSlots.map(slot => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setTimeSlot(slot)}
                            className={`py-3 px-4 rounded-xl border transition-all text-sm font-medium flex items-center justify-center gap-2
                              ${timeSlot === slot 
                                ? "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(191,255,0,0.3)]" 
                                : "bg-background border-border hover:border-primary/50 hover:bg-accent text-foreground"}`}
                          >
                            <Clock className="w-4 h-4 opacity-70" />
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Match Details */}
              <div className="bg-card border border-border p-6 md:p-8 rounded-2xl space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" /> Match Details
                </h2>
                <div className="space-y-4">
                  <Label className="text-muted-foreground">Match Type</Label>
                  <RadioGroup
                    value={matchType}
                    onValueChange={(v) => setMatchType(v as BookingInputMatchType)}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    {(["friendly", "competitive"] as const).map(type => (
                      <Label key={type} className={`flex-1 flex items-center p-4 border rounded-xl cursor-pointer transition-all ${matchType === type ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-accent"}`}>
                        <RadioGroupItem value={type} id={type} className="text-primary mr-3" />
                        <div className="flex flex-col">
                          <span className="font-bold capitalize">{type === "friendly" ? "Friendly Match" : "Competitive League"}</span>
                          <span className="text-xs text-muted-foreground">{type === "friendly" ? "Casual kickabout" : "Official league game"}</span>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <Label className="text-muted-foreground">Add-on Services</Label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {ADD_ONS.map(addon => (
                      <Label key={addon.id} className="flex items-center justify-between p-4 border border-border bg-background rounded-xl cursor-pointer hover:bg-accent transition-colors">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id={addon.id}
                            checked={selectedAddOns.includes(addon.id)}
                            onCheckedChange={(checked) => handleAddOnToggle(addon.id, checked as boolean)}
                          />
                          <span className="font-medium">{addon.label}</span>
                        </div>
                        <span className="text-primary text-sm font-bold">+₦{addon.price.toLocaleString()}</span>
                      </Label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Guest Details (if not logged in) */}
              {!user && (
                <div className="bg-card border border-border p-6 md:p-8 rounded-2xl space-y-4">
                  <h2 className="text-xl font-bold mb-4">Contact Details</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" required value={guestName} onChange={e => setGuestName(e.target.value)} className="bg-background border-border" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" required value={guestEmail} onChange={e => setGuestEmail(e.target.value)} className="bg-background border-border" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    <a href="/api/auth/login?returnTo=/my-bookings" className="text-primary hover:underline font-medium">Log in</a> to skip this step and track your bookings.
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card border border-border rounded-2xl p-6 shadow-xl flex flex-col gap-6">
              <h3 className="text-xl font-bold pb-4 border-b border-border">Booking Summary</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pitch</span>
                  <span className="font-medium text-right">{pitch.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{format(date, "MMM d, yyyy")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium text-primary">{timeSlot || "Select a time"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Match Type</span>
                  <span className="font-medium capitalize">{matchType}</span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-border text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pitch Fee (1hr)</span>
                  <span className="font-medium">₦{basePrice.toLocaleString()}</span>
                </div>
                {selectedAddOns.map(id => {
                  const addon = ADD_ONS.find(a => a.id === id);
                  return addon ? (
                    <div key={id} className="flex justify-between text-muted-foreground">
                      <span>{addon.label}</span>
                      <span>₦{addon.price.toLocaleString()}</span>
                    </div>
                  ) : null;
                })}
                {isMember && (
                  <div className="flex justify-between text-primary pt-2">
                    <span className="font-bold">Pro Discount (10%)</span>
                    <span>-₦{discount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border flex justify-between items-end">
                <span className="text-base font-medium">Total Price</span>
                <span className="text-3xl font-bold text-primary">₦{total.toLocaleString()}</span>
              </div>

              {!isMember && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                  <p className="text-sm">
                    <span className="font-bold text-primary">TurfLink Pro</span> members save ₦{Math.round(subtotal * 0.1).toLocaleString()} on this booking.
                  </p>
                  <Link href="/membership" className="text-primary text-xs font-bold hover:underline mt-1 inline-block">
                    Learn more &rarr;
                  </Link>
                </div>
              )}

              <Button
                type="submit"
                form="booking-form"
                disabled={isPaying || !timeSlot}
                className="w-full h-14 text-lg font-bold glow-effect mt-4"
              >
                {isVerifying ? (
                  <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Confirming Payment…</>
                ) : isInitializing ? (
                  <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Opening Payment…</>
                ) : (
                  <><CreditCard className="w-5 h-5 mr-2" /> Pay ₦{total.toLocaleString()}</>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center -mt-2">
                Secured by Paystack · Your booking is saved only after payment
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
