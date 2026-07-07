import React from "react";
import Container from "@/components/common/Container";
import { Title } from "@/components/common/text";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import { Building2, Users, Globe, Mail } from "lucide-react";
import Link from "next/link";

const OthersPage = () => {
  const otherServices = [
    {
      title: "Custom Products",
      icon: <Building2 size={32} />,
      description:
        "Need custom baby products for your business or event? We offer custom manufacturing services.",
      features: [
        "Custom design and branding",
        "Minimum order quantities available",
        "Quality assurance testing",
        "Flexible delivery schedules",
      ],
      contact: "custom@babyshop.com",
    },
    {
      title: "Corporate Gifts",
      icon: <Globe size={32} />,
      description:
        "Perfect baby gift solutions for corporate events, employee benefits, and client appreciation.",
      features: [
        "Bulk order discounts",
        "Custom packaging options",
        "Corporate billing available",
        "Dedicated account management",
      ],
      contact: "corporate@babyshop.com",
    },
    {
      title: "Educational Partnerships",
      icon: <Users size={32} />,
      description:
        "Partner with schools, daycares, and educational institutions for special programs and discounts.",
      features: [
        "Educational institution discounts",
        "Safety training materials",
        "Bulk purchasing programs",
        "Product donations for events",
      ],
      contact: "education@babyshop.com",
    },
  ];

  const resourceLinks = [
    {
      title: "Press Kit",
      description: "Media resources and company information",
      href: "/press",
    },
    {
      title: "Careers",
      description: "Join our growing team",
      href: "/careers",
    },
    {
      title: "Investor Relations",
      description: "Information for investors",
      href: "/investors",
    },
    {
      title: "Sustainability",
      description: "Our environmental commitments",
      href: "/sustainability",
    },
    {
      title: "Community",
      description: "Our community initiatives",
      href: "/community",
    },
    {
      title: "Blog",
      description: "Parenting tips and product updates",
      href: "/blog",
    },
  ];

  const supportResources = [
    {
      title: "API Documentation",
      description: "Technical documentation for developers",
      href: "/api-docs",
    },
    {
      title: "Size Guides",
      description: "Comprehensive sizing information",
      href: "/size-guide",
    },
    {
      title: "Care Instructions",
      description: "How to care for our products",
      href: "/care-guide",
    },
    {
      title: "Safety Standards",
      description: "Our safety testing and certifications",
      href: "/safety",
    },
    {
      title: "Warranty Information",
      description: "Product warranties and guarantees",
      href: "/warranty",
    },
    {
      title: "International Shipping",
      description: "Global shipping information",
      href: "/international",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="pt-6">
        <div className="max-w-6xl mx-auto">
          <PageBreadcrumb currentPage="Other Services" items={[]} />
        </div>
      </Container>

      <Container className="py-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Title className="text-4xl font-bold mb-4">
              Other Services & Resources
            </Title>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Explore additional services, resources, and partnership
              opportunities available through Babyshop.
            </p>
          </div>

          {/* Special Services */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold mb-8 text-center">
              Special Services
            </h2>
            <div className="grid lg:grid-cols-3 gap-8">
              {otherServices.map((service, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-8">
                  <div className="text-primary mb-6">{service.icon}</div>

                  <h3 className="text-xl font-semibold mb-4">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-6">{service.description}</p>

                  <div className="mb-6">
                    <h4 className="font-semibold mb-3">Features:</h4>
                    <ul className="space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-start gap-2"
                        >
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                          <span className="text-gray-700 text-sm">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Mail size={16} />
                    <span>{service.contact}</span>
                  </div>

                  <button className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors">
                    Learn More
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Resources & Links */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold mb-8 text-center">
              Company Resources
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resourceLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-lg mb-2">{link.title}</h3>
                  <p className="text-gray-600 text-sm">{link.description}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Support Resources */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold mb-8 text-center">
              Support Resources
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {supportResources.map((resource, index) => (
                <Link
                  key={index}
                  href={resource.href}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-primary"
                >
                  <h3 className="font-semibold text-lg mb-2">
                    {resource.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {resource.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
            <h2 className="text-2xl font-semibold mb-8 text-center">
              By the Numbers
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">
                  10,000+
                </div>
                <div className="text-gray-600 text-sm">Products Available</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">
                  50+
                </div>
                <div className="text-gray-600 text-sm">Countries Served</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">
                  24/7
                </div>
                <div className="text-gray-600 text-sm">Customer Support</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">
                  99.9%
                </div>
                <div className="text-gray-600 text-sm">Uptime Guarantee</div>
              </div>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-semibold mb-4">Stay Updated</h2>
              <p className="text-gray-600 mb-6">
                Subscribe to our newsletter for the latest updates on new
                services, partnerships, and company news.
              </p>

              <div className="flex gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-linear-to-r from-primary to-blue-600 rounded-lg p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              Need Something Specific?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Can&apos;t find what you&apos;re looking for? Our team is here to
              help with custom solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/help/contact"
                className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Contact Us
              </Link>
              <Link
                href="/help"
                className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors"
              >
                Help Center
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default OthersPage;
