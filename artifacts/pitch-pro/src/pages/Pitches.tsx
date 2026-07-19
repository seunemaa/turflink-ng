import { useListPitches, getListPitchesQueryKey } from "@workspace/api-client-react";
import { PitchCard } from "@/components/PitchCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function Pitches() {
  const { data: pitches, isLoading } = useListPitches({ query: { queryKey: getListPitchesQueryKey(), enabled: true } });
  
  const [formatFilter, setFormatFilter] = useState<string>("all");
  const [surfaceFilter, setSurfaceFilter] = useState<string>("all");

  const formats = Array.from(new Set(pitches?.map(p => p.format) || []));
  const surfaces = Array.from(new Set(pitches?.map(p => p.surface) || []));

  const filteredPitches = pitches?.filter(pitch => {
    if (formatFilter !== "all" && pitch.format !== formatFilter) return false;
    if (surfaceFilter !== "all" && pitch.surface !== surfaceFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen pt-12 pb-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Explore Pitches</h1>
            <p className="text-muted-foreground text-lg">Find the perfect ground for your next match.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Select value={formatFilter} onValueChange={setFormatFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-card border-border">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Formats</SelectItem>
                {formats.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={surfaceFilter} onValueChange={setSurfaceFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-card border-border">
                <SelectValue placeholder="Surface" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Surfaces</SelectItem>
                {surfaces.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden h-[380px] animate-pulse">
                <div className="h-48 bg-muted w-full" />
                <div className="p-5 space-y-4">
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))
          ) : filteredPitches?.length === 0 ? (
            <div className="col-span-full py-24 text-center">
              <p className="text-muted-foreground text-lg">No pitches match your selected filters.</p>
              <button 
                onClick={() => { setFormatFilter("all"); setSurfaceFilter("all"); }}
                className="mt-4 text-primary font-medium hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            filteredPitches?.map((pitch) => (
              <PitchCard key={pitch.id} pitch={pitch} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
