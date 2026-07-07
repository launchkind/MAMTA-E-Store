import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm min-h-screen w-full">
      <div className="flex flex-col items-center p-6 rounded-2xl bg-background/50 border border-border/50 shadow-sm gap-4 transition-all duration-300 animate-in fade-in zoom-in-95">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-12 h-12 rounded-full border-4 border-primary/20 animate-pulse"></div>
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            Loading...
          </h3>
          <p className="text-sm text-muted-foreground animate-pulse">
            Getting things ready for you
          </p>
        </div>
      </div>
    </div>
  );
}
