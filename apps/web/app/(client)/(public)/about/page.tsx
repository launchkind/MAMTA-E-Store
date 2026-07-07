import React from "react";
import Container from "@/components/common/Container";
import { Title } from "@/components/common/text";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="pt-6">
        <PageBreadcrumb currentPage="About Us" items={[]} />
      </Container>

      <Container className="py-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <Title className="text-4xl font-bold mb-4">About Entry</Title>
            <p className="text-gray-600 text-lg">
              Your trusted partner for premium products and a seamless online
              shopping experience
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Our Story
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Founded with a vision to redefine online retail, Entry Ecommerce
                has been dedicated to connecting customers with high-quality,
                authentic, and diverse products. We understand that modern
                shoppers want reliability, speed, and variety, and we&apos;re
                here to make that possible with our carefully curated selection
                and powerful multi-vendor platform.
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
          </div>
        </div>
      </Container>
    </div>
  );
};

export default AboutPage;
