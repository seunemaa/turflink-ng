import { useGetMe, useGetMembership, useSignUpMembership, getGetMeQueryKey, getGetMembershipQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Star, Shield, Zap, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Membership() {
  const { data: user } = useGetMe({ query: { queryKey: getGetMeQueryKey(), retry: false } });
  const { data: membership, refetch } = useGetMembership({ query: { queryKey: getGetMembershipQueryKey(), enabled: !!user } });
  const signup = useSignUpMembership();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  const isMember = user?.isMember || membership?.isMember;

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    signup.mutate(
      { data: { name, email } },
      {
        onSuccess: () => {
          toast({ title: "Welcome to TurfLink Pro!", description: "Your 10% discount is now active." });
          refetch();
        },
        onError: (err) => {
          toast({ title: "Error", description: (err as any).error || "Could not process membership.", variant: "destructive" });
        }
      }
    );
  };

  const benefits = [
    { icon: Zap, title: "10% Off Every Booking", desc: "Automatic discount applied at checkout for all pitch reservations." },
    { icon: Star, title: "Priority Booking", desc: "Get access to prime time slots before they open to the public." },
    { icon: Shield, title: "Exclusive Leagues", desc: "Invitations to TurfLink NG competitive tournaments and events." },
  ];

  if (isMember) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <div className="max-w-xl w-full bg-card border border-primary/30 rounded-3xl p-8 md:p-12 text-center shadow-[0_0_50px_rgba(191,255,0,0.1)]">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Star className="w-10 h-10 text-primary fill-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">You are a Pro Member</h1>
          <p className="text-muted-foreground mb-8">Your 10% discount is automatically applied to all bookings.</p>
          
          <div className="bg-background rounded-2xl p-6 border border-border mb-8 text-left">
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-4">Active Benefits</h3>
            <div className="space-y-3">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span className="font-medium">{b.title}</span>
                </div>
              ))}
            </div>
          </div>

          <Link href="/pitches">
            <Button className="w-full h-14 text-lg font-bold glow-effect">
              Book a Pitch Now <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-12 pb-24">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-8">
            <div>
              <span className="text-primary font-bold tracking-wider uppercase text-sm">Elevate Your Game</span>
              <h1 className="text-4xl md:text-6xl font-bold mt-2 mb-4 leading-tight">
                Join <span className="text-primary">TurfLink</span> Pro
              </h1>
              <p className="text-xl text-muted-foreground">
                The exclusive membership for serious players. Save on every match and get VIP access.
              </p>
            </div>

            <div className="space-y-6">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center shrink-0">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-6">Become a Member Today</h2>
              
              {!user ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-6">Please sign in to register for Pro membership.</p>
                  <a href="/api/auth/login">
                    <Button className="w-full h-14 text-lg font-bold glow-effect">Sign in with Replit</Button>
                  </a>
                </div>
              ) : (
                <form onSubmit={handleJoin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      required 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      className="bg-background h-12"
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      required 
                      value={email} 
                      onChange={e => setEmail(e.target.value)}
                      className="bg-background h-12"
                      placeholder="you@example.com"
                    />
                  </div>
                  
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm text-primary">
                    <span className="font-bold">Early Adopter Offer:</span> Membership is currently free for the first year. Join now to lock in your benefits.
                  </div>

                  <Button 
                    type="submit" 
                    disabled={signup.isPending}
                    className="w-full h-14 text-lg font-bold glow-effect mt-4"
                  >
                    {signup.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Activate Pro Membership"}
                  </Button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
