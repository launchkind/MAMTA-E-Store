import React from "react";
import Container from "@/components/common/Container";
import { Title } from "@/components/common/text";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import { Handshake, Users, DollarSign, Star, Gift } from "lucide-react";
import Link from "next/link";

const ProgramsPage = () => {
  const programs = [
    {
      title: "Partnership Program",
      icon: <Handshake size={48} />,
      description:
        "Join our exclusive partnership program for retailers and distributors",
      benefits: [
        "Competitive wholesale pricing",
        "Dedicated account management",
        "Marketing support and materials",
        "Priority access to new products",
      ],
      requirements: [
        "Valid business license",
        "Minimum order quantities",
        "Retail or distribution experience",
      ],
      cta: "Apply for Partnership",
    },
    {
      title: "Associate Program",
      icon: <Users size={48} />,
      description:
        "Earn commissions by promoting our products through your platform",
      benefits: [
        "Up to 8% commission on sales",
        "Real-time tracking and reporting",
        "Exclusive promotional materials",
        "Monthly bonus opportunities",
      ],
      requirements: [
        "Active website or social media presence",
        "Family/parenting related content",
        "Agreement to our terms",
      ],
      cta: "Become an Associate",
    },
    {
      title: "Wholesale Socks",
      icon: <DollarSign size={48} />,
      description:
        "Bulk purchasing program for our premium baby and children's socks",
      benefits: [
        "Volume discounts up to 40%",
        "Mix and match styles",
        "Flexible order quantities",
        "Fast turnaround times",
      ],
      requirements: [
        "Minimum order of 100 pairs",
        "Business verification",
        "Net 30 payment terms available",
      ],
      cta: "View Wholesale Catalog",
    },
    {
      title: "Wholesale Funny Socks",
      icon: <Gift size={48} />,
      description:
        "Specialty wholesale program for our fun and novelty sock collection",
      benefits: [
        "Exclusive novelty designs",
        "Seasonal collections",
        "Display materials included",
        "Marketing support",
      ],
      requirements: [
        "Minimum order of 50 pairs",
        "Gift shop or specialty retailer",
        "Agreement to brand guidelines",
      ],
      cta: "Explore Funny Socks",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Mitchell",
      business: "Little Ones Boutique",
      program: "Partnership Program",
      testimonial:
        "The partnership program has been incredible for our business. The support team is amazing and the products sell themselves.",
      rating: 5,
    },
    {
      name: "Mike Johnson",
      business: "Parenting Blog Network",
      program: "Associate Program",
      testimonial:
        "Easy to join and great commission rates. The tracking dashboard makes it simple to see my earnings.",
      rating: 5,
    },
    {
      name: "Lisa Chen",
      business: "Sunshine Children's Store",
      program: "Wholesale Socks",
      testimonial:
        "Quality products at great wholesale prices. Our customers love the sock selection and they're fast movers.",
      rating: 5,
    },
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: rating }).map((_, index) => (
      <Star key={index} size={16} className="text-yellow-400 fill-current" />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="pt-6">
        <div className="max-w-6xl mx-auto">
          <PageBreadcrumb currentPage="Business Programs" items={[]} />
        </div>
      </Container>

      <Container className="py-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Title className="text-4xl font-bold mb-4">Business Programs</Title>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Partner with Babyshop to grow your business. We offer various
              programs designed to help retailers, distributors, and content
              creators succeed.
            </p>
          </div>

          {/* Programs Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {programs.map((program, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-8">
                <div className="text-primary mb-6">{program.icon}</div>

                <h3 className="text-2xl font-semibold mb-4">{program.title}</h3>
                <p className="text-gray-600 mb-6">{program.description}</p>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Benefits:</h4>
                    <ul className="space-y-2">
                      {program.benefits.map((benefit, benefitIndex) => (
                        <li
                          key={benefitIndex}
                          className="flex items-start gap-2"
                        >
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 shrink-0"></div>
                          <span className="text-gray-700 text-sm">
                            {benefit}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Requirements:</h4>
                    <ul className="space-y-2">
                      {program.requirements.map((requirement, reqIndex) => (
                        <li key={reqIndex} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                          <span className="text-gray-700 text-sm">
                            {requirement}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button className="w-full mt-6 bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors">
                  {program.cta}
                </button>
              </div>
            ))}
          </div>

          {/* Success Stories */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
            <h2 className="text-2xl font-semibold mb-8 text-center">
              Success Stories
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-6"
                >
                  <div className="flex gap-1 mb-4">
                    {renderStars(testimonial.rating)}
                  </div>

                  <p className="text-gray-700 mb-4 italic">
                    &quot;{testimonial.testimonial}&quot;
                  </p>

                  <div className="border-t pt-4">
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">
                      {testimonial.business}
                    </div>
                    <div className="text-sm text-primary">
                      {testimonial.program}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
            <h2 className="text-2xl font-semibold mb-8 text-center">
              Program Success
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">
                  500+
                </div>
                <div className="text-gray-600">Active Partners</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">
                  $2M+
                </div>
                <div className="text-gray-600">Commissions Paid</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">
                  50+
                </div>
                <div className="text-gray-600">Countries</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">
                  98%
                </div>
                <div className="text-gray-600">Satisfaction Rate</div>
              </div>
            </div>
          </div>

          {/* Application Process */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
            <h2 className="text-2xl font-semibold mb-6">How to Apply</h2>

            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h4 className="font-semibold mb-2">Choose Program</h4>
                <p className="text-sm text-gray-600">
                  Select the program that best fits your business
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h4 className="font-semibold mb-2">Submit Application</h4>
                <p className="text-sm text-gray-600">
                  Complete our online application form
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h4 className="font-semibold mb-2">Review Process</h4>
                <p className="text-sm text-gray-600">
                  We&apos;ll review your application within 5 business days
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  4
                </div>
                <h4 className="font-semibold mb-2">Get Started</h4>
                <p className="text-sm text-gray-600">
                  Once approved, you&apos;ll receive your welcome package
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-linear-to-r from-primary to-blue-600 rounded-lg p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Partner with Us?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Join hundreds of successful partners who are growing their
              business with Babyshop
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Apply Now
              </button>
              <Link
                href="/help/contact"
                className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ProgramsPage;
