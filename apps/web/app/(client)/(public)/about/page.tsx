import React from "react";
import Container from "@/components/common/Container";
import { Title } from "@/components/common/text";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import { Phone, MapPin, Store } from "lucide-react";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.198.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.288.173-1.412-.074-.124-.272-.198-.57-.347z" />
    <path d="M12.001 2C6.478 2 2 6.478 2 12c0 1.99.582 3.845 1.588 5.407L2 22l4.71-1.556A9.953 9.953 0 0012.001 22C17.523 22 22 17.523 22 12S17.523 2 12.001 2zm0 18.2a8.16 8.16 0 01-4.166-1.14l-.299-.177-3.096 1.023 1.038-3.021-.194-.31A8.163 8.163 0 013.8 12c0-4.522 3.679-8.2 8.201-8.2 4.521 0 8.2 3.678 8.2 8.2 0 4.522-3.679 8.2-8.2 8.2z" />
  </svg>
);

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
                      <h3 className="font-semibold">Secure Payments</h3>
                      <p className="text-gray-600 text-sm">
                        Safe and encrypted checkout on every order
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
                  <div>
                    <h3 className="font-semibold">Phone</h3>
                    <a
                      href="tel:+917001346162"
                      className="text-gray-600 text-sm hover:text-primary transition-colors flex items-center gap-1.5"
                    >
                      <WhatsAppIcon className="w-4 h-4 text-black shrink-0" />
                      +91 70013 46162
                    </a>
                    <a
                      href="tel:+919563873135"
                      className="text-gray-600 text-sm hover:text-primary transition-colors flex items-center gap-1.5"
                    >
                      <Phone className="w-4 h-4 text-primary shrink-0" />
                      +91 95638 73135
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Location</h3>
                    <p className="text-gray-600 text-sm">
                      Mamta Complex, Churipatty Road, Islampur, West Bengal - 733202
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
