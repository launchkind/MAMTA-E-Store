"use client";

import React from "react";
import { Lock, Sparkles, ChevronRight, CheckCircle2 } from "lucide-react";

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  onReviewSubmitted,
}) => {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-accent/5 border border-accent/20 rounded-2xl relative overflow-hidden mt-4">
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center w-full">
        <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center shadow-lg border border-border mb-5 relative">
          <Lock className="w-7 h-7 text-accent" />
          <div className="absolute -top-1 -right-1 bg-linear-to-tr from-accent to-purple-600 p-1.5 rounded-lg shadow-md rotate-12">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-3">
          Premium Feature
        </h3>
        
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Interactive product reviews, rich-text formatting, and the entire admin moderation workflow are available exclusively in the premium source code.
        </p>

        <div className="w-full space-y-3 mb-8 text-left bg-background/50 p-4 rounded-xl border border-border/50">
          {[
            "Interactive star ratings",
            "Rich text descriptions",
            "Admin moderation dashboard",
            "Verified buyer badges"
          ].map((feature, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <span className="text-sm font-medium text-foreground/80">{feature}</span>
            </div>
          ))}
        </div>

        <a
          href={process.env.NEXT_PUBLIC_PURCHASE_LINK || "https://buymeacoffee.com/reactbd/e/518205"}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-accent to-purple-600 text-white px-6 py-3.5 rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 active:scale-95 text-sm"
        >
          Unlock Premium <ChevronRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};

export default ReviewForm;
