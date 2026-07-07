import Container from "@/components/common/Container";
import Link from "next/link";
import {
  TrendingUp,
  Shield,
  Headphones,
  DollarSign,
  Users,
  Package,
  BarChart3,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
export default async function SellerGuidePage() {

  // Reusable Apply Button Component - always redirects to /become-seller
  // The become-seller page will handle showing login message for non-authenticated users
  const ApplyButton = ({ className = "" }: { className?: string }) => {
    return (
      <Link
        href="/become-seller"
        className={
          className ||
          "inline-flex items-center gap-2 bg-primary hover:bg-opacity-90 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 text-lg"
        }
      >
        Apply Now <ArrowRight className="w-5 h-5" />
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-muted">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-linear-to-br from-[#1e1e2e] via-[#2d2b55] to-[#432c7a] text-background py-24 md:py-32">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center mask-[linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20"></div>
        <div className="absolute -top-40 -right-40 w-120 h-120 bg-primary/30 blur-3xl rounded-full"></div>
        <div className="absolute -bottom-40 -left-40 w-120 h-120 bg-accent/20 blur-3xl rounded-full"></div>

        <Container className="relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 text-sm font-medium text-blue-100 shadow-lg shadow-black/10">
              <TrendingUp className="w-4 h-4" />
              <span>Seller Program</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight text-white">
              Launch Your Store on{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-300 to-primary">
                Entry
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-10 font-light leading-relaxed max-w-3xl mx-auto">
              Join thousands of successful sellers delivering premium baby
              products to parents worldwide. Accelerate your growth with our
              powerful platform.
            </p>
            <ApplyButton className="inline-flex items-center justify-center gap-2 bg-white text-[#2d2b55] hover:bg-white/90 font-bold py-4 px-10 rounded-full transition-all duration-300 text-lg hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)]" />
          </div>
        </Container>
      </div>

      {/* Benefits Section */}
      <Container className="py-20 mt-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4">
            Why Sell on Entry?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
            Discover the advantages of partnering with Entry and take your baby
            products business to the next level.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Benefit 1 */}
          <div className="bg-card p-8 rounded-2xl shadow-md border border-border/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">
              Massive Customer Base
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Access thousands of active parents and caregivers looking for
              quality baby products every day.
            </p>
          </div>

          {/* Benefit 2 */}
          <div className="bg-card p-8 rounded-2xl shadow-md border border-border/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">
              Grow Your Sales
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Increase your revenue with our marketing tools, promotions, and
              featured product placements.
            </p>
          </div>

          {/* Benefit 3 */}
          <div className="bg-card p-8 rounded-2xl shadow-md border border-border/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">
              Secure & Trusted
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Benefit from our secure payment processing and buyer protection
              that builds customer trust.
            </p>
          </div>

          {/* Benefit 4 */}
          <div className="bg-card p-8 rounded-2xl shadow-md border border-border/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Package className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">
              Easy Product Management
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Simple dashboard to add products, manage inventory, and track
              orders in real-time.
            </p>
          </div>

          {/* Benefit 5 */}
          <div className="bg-card p-8 rounded-2xl shadow-md border border-border/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">
              Analytics & Insights
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Get detailed sales reports, customer insights, and performance
              metrics to optimize your business.
            </p>
          </div>

          {/* Benefit 6 */}
          <div className="bg-card p-8 rounded-2xl shadow-md border border-border/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Headphones className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">
              Dedicated Support
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Our seller support team is here to help you succeed with
              onboarding, training, and ongoing assistance.
            </p>
          </div>
        </div>
      </Container>

      {/* How It Works Section */}
      <div className="bg-muted py-20">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
              Getting started as a seller is simple. Follow these easy steps to
              begin selling.
            </p>
          </div>

          <div className="max-w-4xl mx-auto relative">
            {/* Connecting Line */}
            <div className="absolute left-8 md:left-24 top-10 bottom-10 w-0.5 bg-linear-to-b from-primary via-accent to-blue-500 hidden sm:block opacity-20"></div>

            <div className="space-y-12">
              {/* Step 1 */}
              <div className="flex gap-6 md:gap-10 items-start relative">
                <div className="shrink-0 w-16 h-16 bg-primary text-background rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-primary/30 z-10">
                  1
                </div>
                <div className="bg-card p-6 md:p-8 rounded-2xl shadow-sm border border-border/50 flex-1 hover:shadow-md transition-shadow">
                  <h3 className="text-2xl font-bold text-foreground mb-3">
                    Submit Your Application
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Fill out our simple seller application form with your
                    business details, contact information, and store
                    description. The process takes less than 5 minutes.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-6 md:gap-10 items-start relative">
                <div className="shrink-0 w-16 h-16 bg-accent text-background rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-accent/30 z-10">
                  2
                </div>
                <div className="bg-card p-6 md:p-8 rounded-2xl shadow-sm border border-border/50 flex-1 hover:shadow-md transition-shadow">
                  <h3 className="text-2xl font-bold text-foreground mb-3">
                    Get Approved
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Our team will review your application within 24-48 hours.
                    We'll verify your business information and ensure you meet
                    our quality standards.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-6 md:gap-10 items-start relative">
                <div className="shrink-0 w-16 h-16 bg-blue-500 text-background rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-500/30 z-10">
                  3
                </div>
                <div className="bg-card p-6 md:p-8 rounded-2xl shadow-sm border border-border/50 flex-1 hover:shadow-md transition-shadow">
                  <h3 className="text-2xl font-bold text-foreground mb-3">
                    Set Up Your Store
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Once approved, access your seller dashboard to add products,
                    set prices, upload images, and customize your store profile.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-6 md:gap-10 items-start relative">
                <div className="shrink-0 w-16 h-16 bg-green-500 text-background rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-green-500/30 z-10">
                  4
                </div>
                <div className="bg-card p-6 md:p-8 rounded-2xl shadow-sm border border-border/50 flex-1 hover:shadow-md transition-shadow">
                  <h3 className="text-2xl font-bold text-foreground mb-3">
                    Start Selling
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Your products will be live on Entry! Manage orders, track
                    sales, and grow your business with our powerful seller
                    tools.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <ApplyButton />
          </div>
        </Container>
      </div>

      {/* Features Section */}
      <Container className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4">
            Seller Dashboard Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
            Everything you need to manage and grow your online baby products
            business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <div className="flex gap-5 items-start bg-card p-6 md:p-8 rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-all">
            <div className="bg-green-500/10 p-2 rounded-lg shrink-0">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-foreground mb-2">
                Product Management
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                Add unlimited products with multiple images, descriptions, and
                variants
              </p>
            </div>
          </div>

          <div className="flex gap-5 items-start bg-card p-6 md:p-8 rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-all">
            <div className="bg-green-500/10 p-2 rounded-lg shrink-0">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-foreground mb-2">
                Inventory Tracking
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                Real-time stock management with low inventory alerts
              </p>
            </div>
          </div>

          <div className="flex gap-5 items-start bg-card p-6 md:p-8 rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-all">
            <div className="bg-green-500/10 p-2 rounded-lg shrink-0">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-foreground mb-2">
                Order Management
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                Process orders, update shipping status, and communicate with
                customers
              </p>
            </div>
          </div>

          <div className="flex gap-5 items-start bg-card p-6 md:p-8 rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-all">
            <div className="bg-green-500/10 p-2 rounded-lg shrink-0">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-foreground mb-2">
                Sales Analytics
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                Detailed reports on sales, revenue, and customer behavior
              </p>
            </div>
          </div>

          <div className="flex gap-5 items-start bg-card p-6 md:p-8 rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-all">
            <div className="bg-green-500/10 p-2 rounded-lg shrink-0">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-foreground mb-2">
                Marketing Tools
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                Create promotions, discounts, and featured product listings
              </p>
            </div>
          </div>

          <div className="flex gap-5 items-start bg-card p-6 md:p-8 rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-all">
            <div className="bg-green-500/10 p-2 rounded-lg shrink-0">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-foreground mb-2">
                Customer Reviews
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                Manage and respond to customer reviews to build trust
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* Pricing Section */}
      <div className="bg-linear-to-br from-primary via-primary/95 to-[#2d2b55] text-background py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center mask-[linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10"></div>
        <Container className="relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto font-light">
              No hidden fees. Only pay when you make a sale.
            </p>
          </div>

          <div className="max-w-xl mx-auto bg-card rounded-3xl shadow-2xl p-8 md:p-14 border border-border/20 transform hover:-translate-y-2 transition-transform duration-500 relative">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-accent rounded-full blur-3xl opacity-30"></div>

            <div className="text-center mb-10 relative z-10">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-5 py-2.5 rounded-full font-bold mb-6 text-sm">
                <DollarSign className="w-5 h-5" />
                Commission-Based
              </div>
              <h3 className="text-5xl md:text-6xl font-extrabold text-foreground mb-4">
                5%{" "}
                <span className="text-2xl text-muted-foreground font-semibold">
                  / sale
                </span>
              </h3>
              <p className="text-muted-foreground text-lg">
                Only calculated on successful conversions
              </p>
            </div>

            <div className="space-y-5 mb-12 relative z-10">
              <div className="flex items-center gap-4">
                <div className="bg-green-500/10 p-1 rounded-full">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                </div>
                <span className="text-foreground font-medium">
                  No monthly fees or subscription costs
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-green-500/10 p-1 rounded-full">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                </div>
                <span className="text-foreground font-medium">
                  No setup or listing charges
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-green-500/10 p-1 rounded-full">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                </div>
                <span className="text-foreground font-medium">
                  Secure payment processing included
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-green-500/10 p-1 rounded-full">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                </div>
                <span className="text-foreground font-medium">
                  Fast payouts every week
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-green-500/10 p-1 rounded-full">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                </div>
                <span className="text-foreground font-medium">
                  Full access to 100% of seller features
                </span>
              </div>
            </div>

            <div className="text-center relative z-10">
              <ApplyButton className="inline-flex items-center justify-center w-full gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-4 px-10 rounded-full transition-all duration-300 text-lg hover:shadow-[0_0_20px_rgba(26,26,44,0.3)]" />
            </div>
          </div>
        </Container>
      </div>

      {/* FAQ Section */}
      <Container className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-card p-8 rounded-2xl shadow-sm border border-border/50">
            <h3 className="text-xl font-bold text-foreground mb-3">
              What products can I sell on Entry?
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              You can sell any baby-related products including clothing, toys,
              feeding supplies, nursery items, strollers, car seats, and more.
              All products must be safe, high-quality, and comply with safety
              regulations.
            </p>
          </div>

          <div className="bg-card p-8 rounded-2xl shadow-sm border border-border/50">
            <h3 className="text-xl font-bold text-foreground mb-3">
              How long does the approval process take?
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Most seller applications are reviewed within 24-48 hours. You'll
              receive an email notification once your application has been
              approved or if we need additional information.
            </p>
          </div>

          <div className="bg-card p-8 rounded-2xl shadow-sm border border-border/50">
            <h3 className="text-xl font-bold text-foreground mb-3">
              When and how do I get paid?
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Payments are processed weekly via bank transfer. You'll receive
              your earnings minus the 5% commission fee. Detailed payment
              reports are available in your seller dashboard.
            </p>
          </div>

          <div className="bg-card p-8 rounded-2xl shadow-sm border border-border/50">
            <h3 className="text-xl font-bold text-foreground mb-3">
              Can I manage my own shipping?
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Yes! You have full control over your shipping methods and rates.
              You can set your own shipping policies, offer free shipping, or
              integrate with shipping carriers.
            </p>
          </div>

          <div className="bg-card p-8 rounded-2xl shadow-sm border border-border/50">
            <h3 className="text-xl font-bold text-foreground mb-3">
              Is there a limit on how many products I can list?
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              No, there's no limit! You can list as many products as you want.
              Our platform is designed to scale with your business.
            </p>
          </div>

          <div className="bg-card p-8 rounded-2xl shadow-sm border border-border/50">
            <h3 className="text-xl font-bold text-foreground mb-3">
              What support do you provide to sellers?
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              We offer comprehensive support including onboarding assistance,
              training materials, a dedicated seller support team, and regular
              updates on best practices to help you succeed.
            </p>
          </div>
        </div>
      </Container>

      {/* CTA Section */}
      <div className="bg-linear-to-r from-accent to-[#b51031] text-background py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center mask-[linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20"></div>
        <Container className="relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-white">
              Ready to Start Selling?
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-10 font-light max-w-2xl mx-auto">
              Join Entry today and reach thousands of parents looking for
              quality baby products. Start growing your business with us!
            </p>
            <ApplyButton className="inline-flex items-center gap-2 bg-white text-accent hover:bg-gray-100 font-bold py-5 px-10 rounded-full transition-all duration-300 text-xl hover:scale-105 shadow-xl" />
          </div>
        </Container>
      </div>
    </div>
  );
}
