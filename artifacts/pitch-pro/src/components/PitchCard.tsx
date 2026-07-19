import { Link } from "wouter";
import { MapPin, ArrowRight } from "lucide-react";
import { Pitch } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";

export function PitchCard({ pitch }: { pitch: Pitch }) {
  // Use generated images based on pitch ID or name
  let imageUrl = pitch.imageUrl;
  if (pitch.name.includes("Lagos")) imageUrl = "/attached_assets/generated_images/lagos-legacy.jpg";
  if (pitch.name.includes("Abuja")) imageUrl = "/attached_assets/generated_images/abuja-national.jpg";
  if (pitch.name.includes("Port Harcourt")) imageUrl = "/attached_assets/generated_images/port-harcourt.jpg";
  if (pitch.name.includes("Enugu")) imageUrl = "/attached_assets/generated_images/enugu-coal.jpg";

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-card border border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10">
      <div className="aspect-[4/3] overflow-hidden relative">
        <img 
          src={imageUrl || "https://images.unsplash.com/photo-1518605368461-1ee123d57d54?q=80&w=800"} 
          alt={pitch.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <span className="px-3 py-1 bg-primary/90 text-primary-foreground text-xs font-bold rounded-md backdrop-blur-sm shadow-sm">
            {pitch.format}
          </span>
          <span className="px-3 py-1 bg-background/80 text-foreground text-xs font-medium rounded-md backdrop-blur-sm border border-border/50 shadow-sm">
            {pitch.surface}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-4">
        <div>
          <h3 className="text-xl font-bold text-foreground line-clamp-1">{pitch.name}</h3>
          <div className="flex items-center gap-1.5 mt-1 text-muted-foreground text-sm">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{pitch.location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 pt-4 border-t border-border/50">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Price</span>
            <span className="text-lg font-bold text-primary">₦{pitch.pricePerHour.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/hr</span></span>
          </div>
          <Link href={`/pitches/${pitch.id}`}>
            <Button variant="secondary" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors glow-effect">
              Book Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
