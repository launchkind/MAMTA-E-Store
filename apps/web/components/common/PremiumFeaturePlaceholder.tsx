import React from "react";
import Link from "next/link";
import { Lock, Sparkles, ChevronRight, Zap, CheckCircle2 } from "lucide-react";

interface PremiumFeaturePlaceholderProps {
  title: string;
  description: string;
  premiumLink?: string;
  features?: string[];
}

export default function PremiumFeaturePlaceholder({
  title,
  description,
  premiumLink = process.env.NEXT_PUBLIC_PURCHASE_LINK || "https://reactbd.com/products/entry", // Default fallback
  features = [
    "Unlimited product comparisons",
    "Detailed side-by-side feature matrix",
    "Advanced filtering inside comparisons",
    "Save and share your comparisons",
  ],
}: PremiumFeaturePlaceholderProps) {
  return (
    <div className="container mx-auto px-4 py-4 lg:py-8 flex flex-col items-center justify-center min-h-[40vh]">
      <div className="max-w-2xl w-full">
        {/* Animated Icon Header */}
        <div className="flex justify-center mb-8 relative">
          <div className="absolute inset-0 bg-accent/20 rounded-full blur-3xl scale-150 pointer-events-none" />
          <div className="relative bg-background border border-border shadow-xl rounded-3xl p-6 flex items-center justify-center">
            <Lock className="w-12 h-12 text-accent" />
            <div className="absolute -top-3 -right-3 bg-linear-to-tr from-accent to-accent/70 p-2 rounded-xl shadow-lg rotate-12">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center mb-10 space-y-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground/90 max-w-xl mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        {/* Premium Value Prop Card */}
        <div className="bg-card border border-border/80 shadow-2xl rounded-3xl overflow-hidden mb-10 relative group">
          <div className="absolute inset-0 bg-linear-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <div className="p-8 md:p-10 relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-6 h-6 text-accent" />
              <h3 className="text-2xl font-bold text-foreground">
                Available in <span className="text-accent">Premium</span>
              </h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-muted-foreground font-medium">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Footer inside the card */}
          <div className="bg-muted/50 border-t border-border p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div className="text-sm md:text-base font-medium text-muted-foreground text-center sm:text-left flex-1">
              Get the full source code to unlock this and all other advanced features.
            </div>
            <Link
              href={premiumLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-linear-to-r from-accent to-purple-600 text-white px-8 py-3.5 rounded-full font-bold shadow-md hover:shadow-xl hover:shadow-accent/20 hover:-translate-y-0.5 focus:ring-4 focus:ring-accent/30 transition-all duration-300 active:scale-95 shrink-0"
            >
              Get Premium Source <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
