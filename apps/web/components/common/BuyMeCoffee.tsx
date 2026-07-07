"use client";

import { motion } from "framer-motion";
import {
  Code2,
  ShoppingBag,
  Check,
  Trophy,
  BookOpen,
  ArrowLeft,
  Github,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { BackgroundRippleEffect } from "../ui/background-ripple";

interface BuyMeCoffeeProps {
  turboLink?: string;
  normalLink?: string;
  githubLink?: string;
}

export default function BuyMeCoffee({
  turboLink = process.env.NEXT_PUBLIC_PURCHASE_LINK ||
    "https://buymeacoffee.com/reactbd/extras",
  githubLink = process.env.NEXT_PUBLIC_GITHUB_LINK ||
    "https://buymeacoffee.com/reactbd/extras",
}: BuyMeCoffeeProps) {
  // Feature data for each option
  const purchaseOptions = [
    {
      id: "pro",
      title: "Full Production Code",
      price: `$${process.env.NEXT_PUBLIC_PRICE || "49.99"}`,
      description:
        "The complete production-ready e-commerce solution with advanced features.",
      icon: Trophy,
      color: "text-primary",
      bgColor: "bg-primary/10",
      badge: "Best Value",
      badgeColor: "bg-accent text-accent-foreground",
      link: turboLink,
      features: [
        "🎁 1 Year FREE Future Updates",
        "Next.js Web Application",
        "React Native Mobile App (iOS & Android)",
        "Mobile App OAuth Integration",
        "Complete Seller/Admin System",
        "Advanced Admin Dashboard",
        "Shopping Cart & Checkout",
        "Stripe Payment Integration",
        "Optimized Build System",
        "Deployment Guides",
        "Priority Support",
      ],
    },
    {
      id: "free",
      title: "GitHub Repo",
      price: "Free",
      description: "Open source version for learning and personal projects.",
      icon: Github,
      color: "text-foreground",
      bgColor: "bg-secondary/10",
      badge: null,
      badgeColor: "",
      link: githubLink,
      features: [
        "Basic E-commerce Structure",
        "Frontend UI Code",
        "Admin Panel Setup",
        "REST API Integration",
        "MongoDB Schema Examples",
        "MIT License",
        "Community Support",
        "Great for Learning",
      ],
    },
  ];

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Find the currently selected option data
  const activeOption = purchaseOptions.find((opt) => opt.id === selectedOption);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) setSelectedOption(null); // Reset layout on close
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <motion.button
            className="flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95 border border-primary/20 group ring-2 ring-primary/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            whileHover={{ scale: 1.05 }}
          >
            <Code2 className="h-5 w-5 text-accent group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">Source Code</span>
          </motion.button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-2xl overflow-hidden p-2 border-primary-foreground/20 [&>button:last-child]:bg-destructive [&>button:last-child]:text-destructive-foreground [&>button:last-child]:opacity-100 [&>button:last-child]:hover:bg-destructive/90 [&>button:last-child]:top-2 [&>button:last-child]:right-2 sm:[&>button:last-child]:top-4 sm:[&>button:last-child]:right-4 [&>button:last-child]:z-50 [&>button:last-child]:pointer-events-auto bg-primary">
          {/* Ripple Effect Background */}
          <BackgroundRippleEffect />

          {/* Main Content - Relative positioned with higher z-index to sit on top */}
          <div className="p-6 relative z-20 w-full max-h-[85vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-6 pr-6">
              <DialogTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-primary-foreground max-w-[90%]">
                {selectedOption ? (
                  <button
                    onClick={() => setSelectedOption(null)}
                    className="mr-2 shrink-0 bg-accent text-accent-foreground hover:bg-accent/90 p-1.5 rounded-full transition-colors flex items-center justify-center shadow-sm"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                ) : (
                  <Code2 className="h-5 w-5 sm:h-6 sm:w-6 text-accent shrink-0" />
                )}
                <span className="truncate">
                  {selectedOption ? activeOption?.title : "Choose Your Version"}
                </span>
              </DialogTitle>
            </div>

            {!selectedOption ? (
              // Main Selection View
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto pb-4">
                {purchaseOptions.map((option) => (
                  <Card
                    key={option.id}
                    className="relative overflow-hidden border-border hover:border-primary/50 transition-colors group flex flex-col bg-background/95 backdrop-blur-sm z-10"
                  >
                    {option.badge && (
                      <div className="absolute top-0 right-0">
                        <Badge
                          className={`rounded-tl-none rounded-br-none rounded-tr-none px-3 py-1 font-semibold ${option.badgeColor}`}
                        >
                          {option.badge}
                        </Badge>
                      </div>
                    )}

                    <div className="p-6 flex flex-col h-full">
                      <div
                        className={`w-12 h-12 rounded-lg ${option.bgColor} flex items-center justify-center mb-4`}
                      >
                        <option.icon className={`h-6 w-6 ${option.color}`} />
                      </div>

                      <h3 className="text-lg font-bold mb-1">{option.title}</h3>
                      <p className={`text-2xl font-bold mb-2 ${option.color}`}>
                        {option.price}
                      </p>
                      <p className="text-sm text-muted-foreground mb-6 grow">
                        {option.description}
                      </p>

                      <div className="space-y-3 mt-auto">
                        <Button
                          className={`w-full gap-2 font-semibold ${option.id === "pro" ? "bg-primary hover:bg-primary/90 text-primary-foreground" : ""}`}
                          variant={option.id === "free" ? "outline" : "default"}
                          asChild
                        >
                          <Link
                            href={option.link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {option.id === "free"
                              ? "View Code"
                              : "Purchase Now"}
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full text-muted-foreground hover:text-foreground"
                          onClick={() => setSelectedOption(option.id)}
                        >
                          Learn More
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              // Detailed View
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <div
                      className={`aspect-video rounded-xl ${activeOption?.bgColor} flex items-center justify-center mb-6`}
                    >
                      {activeOption?.icon && (
                        <activeOption.icon
                          className={`h-20 w-20 ${activeOption.color}`}
                        />
                      )}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-primary-foreground/70 mb-1">
                          Price
                        </h4>
                        <p
                          className={`text-3xl font-bold ${activeOption?.id === "pro" ? "text-accent" : "text-primary-foreground"}`}
                        >
                          {activeOption?.price}
                        </p>
                      </div>
                      <p className="text-lg text-primary-foreground/90">
                        {activeOption?.description}
                      </p>
                      <div className="pt-4">
                        <Button
                          size="lg"
                          className={`w-full gap-2 text-lg font-semibold ${activeOption?.id === "pro" ? "bg-accent hover:bg-accent/90 text-accent-foreground" : "bg-secondary hover:bg-secondary/90 text-secondary-foreground"}`}
                          variant={
                            activeOption?.id === "free" ? "outline" : "default"
                          }
                          asChild
                        >
                          <a
                            href={activeOption?.link || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {activeOption?.id === "free" ? (
                              <>
                                <Github className="h-5 w-5" />
                                View on GitHub
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="h-5 w-5" />
                                Purchase Now
                              </>
                            )}
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-background rounded-xl p-6 shadow-inner border border-primary-foreground/10">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
                      <BookOpen className="h-5 w-5 text-primary" />
                      What's Included
                    </h4>

                    <div className="space-y-3">
                      {activeOption?.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div
                            className={`mt-1 p-1 rounded-full ${activeOption.bgColor}`}
                          >
                            <Check
                              className={`h-3 w-3 ${activeOption.color}`}
                            />
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-6" />

                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                      <p className="text-sm text-primary font-medium">
                        Instant access immediately after purchase. Includes
                        future updates and bug fixes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
