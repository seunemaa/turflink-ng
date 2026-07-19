import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function AuthPage() {
  const { data: user, isLoading } = useGetMe({ query: { queryKey: getGetMeQueryKey(), retry: false, refetchOnWindowFocus: false } });
  const [, setLocation] = useLocation();

  if (!isLoading && user) {
    setLocation("/my-bookings");
    return null;
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-2xl text-center">
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-primary">TurfLink</span> NG
        </h1>
        <p className="text-muted-foreground mb-8">Sign in to manage your bookings and access Pro benefits.</p>

        <a href="/api/auth/login" className="block w-full">
          <Button className="w-full h-12 text-lg font-bold glow-effect">
            Sign in with Replit
          </Button>
        </a>
      </div>
    </div>
  );
}
