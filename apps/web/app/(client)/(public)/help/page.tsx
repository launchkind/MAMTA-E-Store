import React from "react";
import Container from "@/components/common/Container";
import { Title } from "@/components/common/text";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import { HelpCircle, Phone, Mail, MessageCircle, Clock } from "lucide-react";
import Link from "next/link";

const HelpPage = () => {
  const helpCategories = [
    {
      title: "Orders & Shipping",
      icon: <Clock size={24} />,
      description: "Track orders, shipping info, and delivery questions",
      links: [
        { title: "Track Your Order", href: "/user/orders" },
        { title: "Shipping Information", href: "/help/shipping" },
        { title: "Delivery Options", href: "/help/shipping" },
        { title: "International Shipping", href: "/help/shipping" },
      ],
    },
    {
      title: "Returns & Exchanges",
      icon: <MessageCircle size={24} />,
      description: "Return policy, exchanges, and refund information",
      links: [
        { title: "Return Policy", href: "/returns" },
        { title: "Start a Return", href: "/returns" },
        { title: "Exchange Items", href: "/returns" },
        { title: "Refund Status", href: "/returns" },
      ],
    },
    {
      title: "Account & Payment",
      icon: <HelpCircle size={24} />,
      description: "Account management, payment, and billing questions",
      links: [
        { title: "Manage Account", href: "/user/profile" },
        { title: "Payment Methods", href: "/user/profile" },
        { title: "Billing Questions", href: "/help/contact" },
        { title: "Password Reset", href: "/auth/signin" },
      ],
    },
    {
      title: "Product Information",
      icon: <MessageCircle size={24} />,
      description: "Product details, safety, and recommendations",
      links: [
        { title: "Product Safety", href: "/help/safety" },
        { title: "Age Recommendations", href: "/help/safety" },
        { title: "Care Instructions", href: "/help/care" },
        { title: "Product Reviews", href: "/shop" },
      ],
    },
  ];

  const contactMethods = [
    {
      title: "Live Chat",
      description: "Chat with our support team",
      availability: "24/7 Available",
      icon: <MessageCircle size={24} />,
      action: "Start Chat",
      primary: true,
    },
    {
      title: "Phone Support",
      description: "1-800-BABYSHOP",
      availability: "Mon-Fri 9AM-6PM EST",
      icon: <Phone size={24} />,
      action: "Call Now",
    },
    {
      title: "Email Support",
      description: "support@babyshop.com",
      availability: "Response within 24 hours",
      icon: <Mail size={24} />,
      action: "Send Email",
    },
  ];

  const faqItems = [
    {
      question: "How long does shipping take?",
      answer:
        "Standard shipping takes 3-5 business days, while express shipping takes 1-2 business days.",
    },
    {
      question: "What is your return policy?",
      answer:
        "We offer 30-day returns on all items in original condition with tags attached.",
    },
    {
      question: "Are your products safety tested?",
      answer:
        "Yes, all our products meet or exceed safety standards and are regularly tested by certified laboratories.",
    },
    {
      question: "Do you offer international shipping?",
      answer:
        "Yes, we ship to over 50 countries worldwide. Shipping costs and times vary by destination.",
    },
    {
      question: "How can I track my order?",
      answer:
        "You can track your order using the tracking number sent to your email or by logging into your account.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="pt-6">
        <PageBreadcrumb currentPage="Help Center" items={[]} />
      </Container>

      <Container className="py-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Title className="text-4xl font-bold mb-4">Help Center</Title>
            <p className="text-gray-600 text-lg">
              We&apos;re here to help! Find answers to common questions or
              contact our support team.
            </p>
          </div>

          {/* Search Help */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="relative max-w-2xl mx-auto">
              <HelpCircle
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search for help articles..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Contact Methods */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className={`bg-white rounded-lg shadow-sm p-6 text-center ${
                  method.primary ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="text-primary mb-4 flex justify-center">
                  {method.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{method.title}</h3>
                <p className="text-gray-700 mb-2">{method.description}</p>
                <p className="text-sm text-gray-500 mb-4">
                  {method.availability}
                </p>
                <button
                  className={`w-full py-2 px-4 rounded-lg transition-colors ${
                    method.primary
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "border border-primary text-primary hover:bg-primary hover:text-white"
                  }`}
                >
                  {method.action}
                </button>
              </div>
            ))}
          </div>

          {/* Help Categories */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Browse Help Topics
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {helpCategories.map((category, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-primary">{category.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">
                        {category.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {category.description}
                      </p>
                      <div className="space-y-2">
                        {category.links.map((link, linkIndex) => (
                          <Link
                            key={linkIndex}
                            href={link.href}
                            className="block text-sm text-primary hover:underline"
                          >
                            {link.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqItems.map((item, index) => (
                <div
                  key={index}
                  className="border-b border-gray-200 pb-6 last:border-b-0"
                >
                  <h3 className="font-semibold text-lg mb-2">
                    {item.question}
                  </h3>
                  <p className="text-gray-700">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Footer */}
          <div className="bg-primary/10 rounded-lg p-8 mt-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Still Need Help?</h3>
            <p className="text-gray-600 mb-6">
              Can&apos;t find what you&apos;re looking for? Our customer support
              team is ready to help.
            </p>
            <Link
              href="/help/contact"
              className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default HelpPage;
