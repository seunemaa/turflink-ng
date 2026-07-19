import { Link, useLocation } from "wouter";
import { User, LogIn, Menu, X, Star } from "lucide-react";
import { useState } from "react";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: user } = useGetMe({ query: { queryKey: getGetMeQueryKey(), retry: false, refetchOnWindowFocus: false } });

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/pitches", label: "Pitches" },
    { href: "/membership", label: "Membership", highlight: true },
  ];

  if (user) {
    navLinks.splice(2, 0, { href: "/my-bookings", label: "My Bookings" });
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">TurfLink</span>
            <span className="text-xl font-bold text-foreground">NG</span>
          </Link>
          
          <div className="hidden md:flex gap-1 ml-6">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  location === link.href 
                    ? "bg-primary/10 text-primary" 
                    : link.highlight 
                      ? "text-primary hover:bg-primary/10" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {link.highlight && <Star className="inline w-3 h-3 mr-1 -mt-1" />}
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {user.isMember && (
                <span className="px-2 py-0.5 text-xs font-bold bg-primary text-primary-foreground rounded-full">PRO</span>
              )}
              <span className="text-sm font-medium">{user.name || user.email}</span>
              <a href="/api/auth/logout">
                <Button variant="ghost" size="sm">Logout</Button>
              </a>
            </div>
          ) : (
            <a href="/api/auth/login?returnTo=/my-bookings">
              <Button className="glow-effect font-bold text-primary-foreground">
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </a>
          )}
        </div>

        <button 
          className="md:hidden text-foreground p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 py-4 space-y-4">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-3 text-sm font-medium rounded-md ${
                  location === link.href 
                    ? "bg-primary/10 text-primary" 
                    : link.highlight 
                      ? "text-primary" 
                      : "text-foreground"
                }`}
              >
                {link.highlight && <Star className="inline w-3 h-3 mr-1 -mt-1" />}
                {link.label}
              </Link>
            ))}
          </div>
          <div className="pt-4 border-t border-border">
            {user ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 px-4">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">{user.name || user.email}</span>
                  {user.isMember && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-primary text-primary-foreground rounded-full">PRO</span>
                  )}
                </div>
                <a href="/api/auth/logout" className="px-4 py-2 text-sm font-medium text-destructive">
                  Logout
                </a>
              </div>
            ) : (
              <a href="/api/auth/login?returnTo=/my-bookings" className="block">
                <Button className="w-full justify-center">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In with Replit
                </Button>
              </a>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
