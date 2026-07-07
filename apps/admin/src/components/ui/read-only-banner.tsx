import { AlertCircle } from "lucide-react";

export const ReadOnlyBanner = () => {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
      <span className="text-sm text-amber-700 dark:text-amber-400 font-medium">
        Read-only mode: You can view all data but cannot make changes
      </span>
    </div>
  );
};

export const ReadOnlyText = ({ className = "" }: { className?: string }) => {
  return (
    <span className={`text-xs text-muted-foreground px-2 ${className}`}>
      View only
    </span>
  );
};
