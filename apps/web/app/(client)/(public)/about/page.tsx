import React from "react";
import Container from "@/components/common/Container";
import { Title } from "@/components/common/text";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import { Phone, MapPin, Store } from "lucide-react";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="pt-6">
        <PageBreadcrumb currentPage="About Us" items={[]} />
      </Container>

      <Container className="py-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <Title className="text-4xl font-bold mb-4">About Mamta E-Store</Title>
            <p className="text-gray-600 text-lg">
              Your trusted partner for premium electronics and a seamless online
              shopping experience
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Our Story
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Founded with a vision to redefine online electronics retail,
                Mamta E-Store has been dedicated to connecting customers with
                high-quality, authentic, and diverse products — from
                smartphones and laptops to home appliances and audio gear. We
                understand that modern shoppers want reliability, speed, and
                variety, and we&apos;re here to make that possible with our
                carefully curated selection.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Our Mission
              </h2>
              <p className="text-gray-700 leading-relaxed">
                To provide our customers with complete peace of mind by offering
                only the highest quality products, secure transactions, and
                innovative shopping features. We believe everyone deserves a
                premium marketplace experience, and we&apos;re committed to
                supporting buyers and sellers alike on their ecommerce journey.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Why Choose Us?
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <h3 className="font-semibold">Quality Assured</h3>
                      <p className="text-gray-600 text-sm">
                        Every seller and product undergoes rigorous verification
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <h3 className="font-semibold">Curated Selection</h3>
                      <p className="text-gray-600 text-sm">
                        A massive catalog of carefully selected global brands
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <h3 className="font-semibold">Fast Delivery</h3>
                      <p className="text-gray-600 text-sm">
                        Quick, traceable, and secure delivery to your doorstep
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <h3 className="font-semibold">24/7 Support</h3>
                      <p className="text-gray-600 text-sm">
                        Dedicated customer success team ready to help anytime
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Our Commitment
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We&apos;re committed to sustainability, secure data practices,
                and continuous innovation. We continuously evolve our platform
                to meet modern security standards, and we proudly work with
                merchants who share our core values of customer transparency and
                ethical business practices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Visit Our Store
              </h2>
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <Store className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Store Name</h3>
                    <p className="text-gray-600 text-sm">Mamta E-Store</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Phone</h3>
                    <a
                      href="tel:+917001346162"
                      className="text-gray-600 text-sm hover:text-primary transition-colors"
                    >
                      +91 70013 46162
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Location</h3>
                    <p className="text-gray-600 text-sm">
                      Mamta Complex, Churipatty Road, Islampur, West Bengal
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default AboutPage;
