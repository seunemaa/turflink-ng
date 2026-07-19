import { useGetPitch, getGetPitchQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { WeatherWidget } from "@/components/WeatherWidget";
import { MapPin, Info, Users, Box, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PitchDetail() {
  const params = useParams();
  const id = Number(params.id);

  const { data: pitch, isLoading } = useGetPitch(id, {
    query: { enabled: !!id, queryKey: getGetPitchQueryKey(id) }
  });

  if (isLoading || !pitch) {
    return (
      <div className="container mx-auto px-4 py-12 animate-pulse">
        <div className="h-8 w-32 bg-muted rounded mb-8" />
        <div className="h-[400px] bg-muted rounded-3xl mb-12" />
        <div className="grid md:grid-cols-3 gap-12">
          <div className="md:col-span-2 space-y-6">
            <div className="h-12 w-3/4 bg-muted rounded" />
            <div className="h-6 w-1/2 bg-muted rounded" />
          </div>
          <div className="h-[300px] bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  let imageUrl = pitch.imageUrl;
  if (pitch.name.includes("Lagos")) imageUrl = "/attached_assets/generated_images/lagos-legacy.jpg";
  if (pitch.name.includes("Abuja")) imageUrl = "/attached_assets/generated_images/abuja-national.jpg";
  if (pitch.name.includes("Port Harcourt")) imageUrl = "/attached_assets/generated_images/port-harcourt.jpg";
  if (pitch.name.includes("Enugu")) imageUrl = "/attached_assets/generated_images/enugu-coal.jpg";

  return (
    <div className="min-h-screen pb-24">
      {/* Header Image */}
      <div className="w-full h-[40vh] md:h-[60vh] relative">
        <img 
          src={imageUrl || "https://images.unsplash.com/photo-1518605368461-1ee123d57d54?q=80&w=1200"} 
          alt={pitch.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        
        <div className="absolute top-8 left-4 md:left-8">
          <Link href="/pitches">
            <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-md border-border/50 text-foreground hover:bg-background">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Pitches
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-primary text-primary-foreground text-sm font-bold rounded-md uppercase tracking-wider">
                  {pitch.format}
                </span>
                <span className="px-3 py-1 bg-card text-foreground border border-border text-sm font-medium rounded-md">
                  {pitch.surface}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">{pitch.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground text-lg">
                <MapPin className="w-5 h-5 text-primary" />
                <span>{pitch.location}</span>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Info className="w-6 h-6 text-primary" />
                About this Pitch
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {pitch.description || `Premium ${pitch.format} football pitch located in ${pitch.location}. Features professional-grade ${pitch.surface} surface ideal for both casual kickabouts and competitive leagues. State-of-the-art stadium floodlights make it perfect for night games.`}
              </p>

              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                {pitch.amenities?.map((amenity, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span className="font-medium">{amenity}</span>
                  </div>
                )) || (
                  <>
                    <div className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-primary" /> <span className="font-medium">LED Floodlights</span></div>
                    <div className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-primary" /> <span className="font-medium">Changing Rooms</span></div>
                    <div className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-primary" /> <span className="font-medium">Secure Parking</span></div>
                    <div className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-primary" /> <span className="font-medium">Spectator Stand</span></div>
                  </>
                )}
              </div>
            </div>
            
            <div className="mt-8">
              <WeatherWidget city={pitch.location.split(',')[0]} />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card border border-border rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col gap-2 pb-6 border-b border-border">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Hourly Rate</span>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold text-primary">₦{pitch.pricePerHour.toLocaleString()}</span>
                </div>
              </div>

              <div className="py-6 space-y-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Users className="w-5 h-5" />
                  <span>Ideal for {pitch.format} matches</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Box className="w-5 h-5" />
                  <span>{pitch.surface}</span>
                </div>
              </div>

              <Link href={`/book/${pitch.id}`}>
                <Button className="w-full h-14 text-lg font-bold glow-effect">
                  Reserve Pitch Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
