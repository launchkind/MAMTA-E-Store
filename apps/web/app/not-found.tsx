import Link from "next/link";
import {
  Home,
  ShoppingBag,
  Search,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Container from "@/components/common/Container";

export default function NotFound() {
  return (
    <Container>
      <div className="min-h-[75vh] flex flex-col items-center justify-center py-16">
        <div className="text-center space-y-6 max-w-3xl mx-auto w-full">
          {/* Icon Header */}
          <div className="flex justify-center mb-8">
            <div className="bg-primary/10 p-6 rounded-3xl">
              <ShieldAlert
                className="w-20 h-20 text-primary"
                strokeWidth={1.5}
              />
            </div>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-foreground mb-4">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight mb-4">
            Oops! Page Not Found
          </h2>

          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
            The page you are looking for doesn't exist, has been moved, or is
            temporarily unavailable. Let's get you back on track.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 mb-16">
            <Link href="/">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                <Home className="w-4 h-4" />
                Return to Home
              </Button>
            </Link>
            <Link href="/shop">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto gap-2 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40"
              >
                <ShoppingBag className="w-4 h-4" />
                Continue Shopping
              </Button>
            </Link>
          </div>

          {/* Quick Links Section */}
          <div className="pt-12 mt-12 border-t border-border w-full text-left">
            <h3 className="text-xl font-medium mb-6 text-center">
              Popular Destinations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "All Products", href: "/shop", icon: Search },
                {
                  label: "New Arrivals",
                  href: "/new-arrivals",
                  icon: ArrowRight,
                },
                {
                  label: "Featured Styles",
                  href: "/features",
                  icon: ArrowRight,
                },
                { label: "Help & Support", href: "/help", icon: ArrowRight },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <link.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-sm font-medium">{link.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
