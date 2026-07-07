import { cn } from "../../lib/utils";
import React from "react";

const HrLine = ({ className }: { className?: string }) => {
  return (
    <div className={cn("w-full h-[1px] bg-foreground/20", className)} />
  );
};

export default HrLine;
