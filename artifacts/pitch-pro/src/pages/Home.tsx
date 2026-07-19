import { useListPitches, getListPitchesQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy, Zap, Shield } from "lucide-react";
import { PitchCard } from "@/components/PitchCard";
import { WeatherWidget } from "@/components/WeatherWidget";
import { ActivityTicker } from "@/components/ActivityTicker";

export default function Home() {
  const { data: pitches, isLoading } = useListPitches({ query: { queryKey: getListPitchesQueryKey(), enabled: true } });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden min-h-[80vh] flex flex-col justify-center">
        {/* Abstract background elements */}
        <div className="absolute inset-0 bg-background z-0" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 z-0 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 z-0 pointer-events-none" />
        
        <div className="container relative z-10 px-4 mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 w-fit">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-primary tracking-wider uppercase">Premium Nigerian Facilities</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight">
              Welcome to <span className="text-primary glow-effect-text">TurfLink NG</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
              Nigeria's #1 Pitch Booking Platform. Book professional-grade 7v7 to 11v11 pitches across Nigeria.
              Premium turf, stadium lighting, and match-ready facilities.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/pitches">
                <Button size="lg" className="h-14 px-8 text-lg font-bold glow-effect">
                  Find a Pitch
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/membership">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold border-primary text-primary hover:bg-primary/10">
                  Join TurfLink Pro
                </Button>
              </Link>
            </div>

            <div className="mt-8 space-y-4">
              <WeatherWidget city="Lagos" />
              <ActivityTicker />
            </div>
          </div>

          <div className="hidden lg:flex justify-end relative">
            <div className="w-full max-w-md aspect-[4/5] rounded-3xl overflow-hidden relative border border-border shadow-2xl">
              <img 
                src="/attached_assets/generated_images/lagos-legacy.jpg" 
                alt="Premium football pitch" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-background/90 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <div className="bg-card/80 backdrop-blur-md p-4 rounded-xl border border-border/50">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Lagos Legacy Pitch</p>
                      <p className="text-lg font-bold text-foreground">Available Tonight</p>
                    </div>
                    <Link href="/book/1">
                      <Button size="sm" className="bg-primary text-primary-foreground font-bold">
                        Book
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-card/50 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Trophy, title: "Premium Surfaces", desc: "Hybrid grass and advanced synthetic turfs mimicking professional stadiums." },
              { icon: Zap, title: "Stadium Lighting", desc: "High-intensity LED floodlights perfect for night matches." },
              { icon: Shield, title: "TurfLink Pro", desc: "Get 10% off all bookings, priority slots, and exclusive events." }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col gap-4 p-6 rounded-2xl bg-card border border-border">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Pitches */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Locations</h2>
              <p className="text-muted-foreground">Premium pitches available across Nigeria.</p>
            </div>
            <Link href="/pitches">
              <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10">
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden h-[380px] animate-pulse">
                  <div className="h-48 bg-muted w-full" />
                  <div className="p-5 space-y-4">
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="pt-4 mt-4 border-t border-border flex justify-between">
                      <div className="h-8 bg-muted rounded w-1/3" />
                      <div className="h-8 bg-muted rounded w-1/3" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              pitches?.slice(0, 4).map((pitch) => (
                <PitchCard key={pitch.id} pitch={pitch} />
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
