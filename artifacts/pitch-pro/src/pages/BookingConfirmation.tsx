import { useGetBookingByReference, getGetBookingByReferenceQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Calendar, MapPin, Clock, Download, ShieldCheck } from "lucide-react";
import { format, parseISO } from "date-fns";

// WhatsApp icon as inline SVG
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

export default function BookingConfirmation() {
  const params = useParams();
  const reference = params.reference;

  const { data: booking, isLoading } = useGetBookingByReference(reference as string, {
    query: { enabled: !!reference, queryKey: getGetBookingByReferenceQueryKey(reference as string) }
  });

  if (isLoading || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-muted rounded-full" />
          <div className="w-48 h-6 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const pitch = booking.pitch;

  // Google Calendar link
  const startTime = parseISO(`${booking.date}T${booking.timeSlot}`);
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
  const formatDateForGCal = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`TurfLink NG: ${pitch.name}`)}&dates=${formatDateForGCal(startTime)}/${formatDateForGCal(endTime)}&details=${encodeURIComponent(`Booking Ref: ${booking.referenceNumber}\nPitch: ${pitch.name}\nFormat: ${pitch.format}\nMatch: ${booking.matchType}`)}&location=${encodeURIComponent(pitch.location)}`;

  // WhatsApp share
  const matchDateFormatted = format(parseISO(booking.date), "EEEE, MMMM d yyyy");
  const whatsappMessage = `Oya! I just booked *${pitch.name}* for our match on *${matchDateFormatted}* at *${booking.timeSlot}*.\n\nUse this reference to join: *+2349121032311*.\n\nBooking Ref: *${booking.referenceNumber}*\n\n_Powered by TurfLink NG_`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="min-h-screen pt-12 pb-24 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Booking Confirmed!</h1>
          <p className="text-muted-foreground text-lg">Your pitch is secured. We've sent a confirmation to your email.</p>
        </div>

        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl">
          {/* Invoice Header */}
          <div className="bg-muted/30 p-8 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Reference Number</p>
              <p className="text-2xl font-mono font-bold text-foreground tracking-widest">{booking.referenceNumber}</p>
            </div>
            <div className="text-left md:text-right">
              <span className="text-2xl font-bold text-primary">TurfLink NG</span>
              <p className="text-sm text-muted-foreground mt-1">Premium Pitch Pass</p>
            </div>
          </div>

          {/* Details */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="flex gap-4 items-start">
                <MapPin className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <h3 className="font-bold text-lg mb-1">{pitch.name}</h3>
                  <p className="text-muted-foreground">{pitch.location}</p>
                  <p className="text-sm text-muted-foreground mt-1">{pitch.format} • {pitch.surface}</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <Calendar className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <h3 className="font-bold text-lg mb-1">{format(parseISO(booking.date), 'EEEE, MMMM d, yyyy')}</h3>
                  <p className="flex items-center gap-2 text-muted-foreground mt-1">
                    <Clock className="w-4 h-4" /> {booking.timeSlot} (1 hour)
                  </p>
                  <p className="text-sm capitalize mt-1 px-2 py-0.5 bg-accent text-foreground rounded inline-block">
                    {booking.matchType} Match
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-background rounded-2xl p-6 border border-border mb-8">
              <h4 className="font-bold mb-4 uppercase tracking-wider text-sm text-muted-foreground">Booking Summary</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Pitch Rental</span>
                  <span className="font-medium">₦{booking.basePrice.toLocaleString()}</span>
                </div>
                
                {booking.addOns.map((addon, i) => (
                  <div key={i} className="flex justify-between text-muted-foreground">
                    <span className="capitalize">{addon.replace('-', ' ')}</span>
                  </div>
                ))}
                
                {booking.addOnsTotal > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Add-ons Total</span>
                    <span>₦{booking.addOnsTotal.toLocaleString()}</span>
                  </div>
                )}

                {booking.discountApplied > 0 && (
                  <div className="flex justify-between text-primary">
                    <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4"/> Pro Discount</span>
                    <span>-₦{booking.discountApplied.toLocaleString()}</span>
                  </div>
                )}

                <div className="pt-4 mt-4 border-t border-border flex justify-between items-center">
                  <span className="text-lg font-bold">Total Paid</span>
                  <span className="text-2xl font-bold text-primary">₦{booking.totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a href={gcalUrl} target="_blank" rel="noreferrer" className="flex-1">
                <Button className="w-full h-12 gap-2 text-primary-foreground font-bold glow-effect">
                  <Calendar className="w-5 h-5" />
                  Add to Calendar
                </Button>
              </a>
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full h-12 gap-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10 font-bold"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                  Share on WhatsApp
                </Button>
              </a>
              <Button variant="outline" className="flex-1 h-12 gap-2 border-border hover:bg-accent">
                <Download className="w-5 h-5" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Link href="/pitches">
            <Button variant="link" className="text-muted-foreground hover:text-foreground">
              Book another pitch
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
