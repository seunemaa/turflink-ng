import { useGetWeather, getGetWeatherQueryKey } from "@workspace/api-client-react";
import { Cloud, Droplets, Sun, Wind } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function WeatherWidget({ city = "Lagos" }: { city?: string }) {
  const { data: weather, isLoading } = useGetWeather(
    { city },
    { query: { queryKey: getGetWeatherQueryKey({ city }), enabled: true, refetchInterval: 300000 } }
  );

  if (isLoading || !weather) {
    return (
      <div className="flex items-center space-x-4 bg-card/80 backdrop-blur-sm border border-border p-4 rounded-xl">
        <Skeleton className="h-10 w-10 rounded-full bg-muted" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-20 bg-muted" />
          <Skeleton className="h-3 w-16 bg-muted" />
        </div>
      </div>
    );
  }

  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes("rain") || c.includes("wet")) return <Droplets className="w-6 h-6 text-primary" />;
    if (c.includes("cloud")) return <Cloud className="w-6 h-6 text-primary" />;
    if (c.includes("wind")) return <Wind className="w-6 h-6 text-primary" />;
    return <Sun className="w-6 h-6 text-primary" />;
  };

  return (
    <div className="flex items-center gap-4 bg-card/80 backdrop-blur-sm border border-border p-4 rounded-xl shadow-lg">
      <div className="bg-primary/10 p-3 rounded-full">
        {getWeatherIcon(weather.condition)}
      </div>
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{weather.temperature}°C</span>
          <span className="text-sm text-muted-foreground">{weather.city}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">{weather.condition}</span>
          <span className="text-xs text-primary font-medium">{weather.pitchCondition}</span>
        </div>
      </div>
    </div>
  );
}
