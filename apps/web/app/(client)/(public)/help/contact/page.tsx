import React from "react";
import Link from "next/link";
import Container from "@/components/common/Container";
import { Title } from "@/components/common/text";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import { Phone, Mail, MessageCircle, Clock, MapPin, Send } from "lucide-react";

const ContactPage = () => {
  const contactMethods = [
    {
      title: "Phone Support",
      icon: <Phone size={32} />,
      primary: "1-800-BABYSHOP",
      secondary: "(1-800-222-9746)",
      hours: "Monday - Friday: 9:00 AM - 6:00 PM EST",
      weekend: "Saturday: 10:00 AM - 4:00 PM EST",
      description:
        "Speak directly with our customer service team for immediate assistance",
    },
    {
      title: "Email Support",
      icon: <Mail size={32} />,
      primary: "support@babyshop.com",
      secondary: "Response within 24 hours",
      hours: "24/7 - We'll get back to you soon",
      description:
        "Send us an email for detailed questions or non-urgent matters",
    },
    {
      title: "Live Chat",
      icon: <MessageCircle size={32} />,
      primary: "Available Now",
      secondary: "Average response time: 2 minutes",
      hours: "Monday - Sunday: 8:00 AM - 10:00 PM EST",
      description: "Chat with our support team in real-time for quick answers",
    },
  ];

  const departments = [
    { name: "General Support", email: "support@babyshop.com" },
    { name: "Orders & Shipping", email: "orders@babyshop.com" },
    { name: "Returns & Exchanges", email: "returns@babyshop.com" },
    { name: "Product Safety", email: "safety@babyshop.com" },
    { name: "Business Inquiries", email: "business@babyshop.com" },
    { name: "Media & Press", email: "press@babyshop.com" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="pt-6">
        <PageBreadcrumb
          currentPage="Contact Us"
          items={[{ label: "Help Center", href: "/help" }]}
        />
      </Container>

      <Container className="py-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Title className="text-4xl font-bold mb-4">Contact Us</Title>
            <p className="text-gray-600 text-lg">
              We&apos;re here to help! Reach out to us through any of the
              methods below
            </p>
          </div>

          {/* Contact Methods */}
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm p-8 text-center"
              >
                <div className="text-primary mb-4 flex justify-center">
                  {method.icon}
                </div>
                <h3 className="font-semibold text-xl mb-3">{method.title}</h3>
                <div className="space-y-2 mb-4">
                  <div className="font-semibold text-lg">{method.primary}</div>
                  <div className="text-gray-600">{method.secondary}</div>
                  <div className="text-sm text-gray-500">{method.hours}</div>
                  {method.weekend && (
                    <div className="text-sm text-gray-500">
                      {method.weekend}
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  {method.description}
                </p>
                <button className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors">
                  {method.title === "Live Chat"
                    ? "Start Chat"
                    : method.title === "Phone Support"
                    ? "Call Now"
                    : "Send Email"}
                </button>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Send className="text-primary" size={24} />
                Send Us a Message
              </h2>

              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select a subject</option>
                    <option value="order-inquiry">Order Inquiry</option>
                    <option value="product-question">Product Question</option>
                    <option value="shipping">Shipping & Delivery</option>
                    <option value="return">Returns & Exchanges</option>
                    <option value="technical">Technical Support</option>
                    <option value="feedback">Feedback & Suggestions</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Number (if applicable)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., BS-123456"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Please provide as much detail as possible..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Additional Information */}
            <div className="space-y-8">
              {/* Business Hours */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
                  <Clock className="text-primary" size={20} />
                  Business Hours
                </h3>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span>Monday - Friday:</span>
                    <span>9:00 AM - 6:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday:</span>
                    <span>10:00 AM - 4:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday:</span>
                    <span>Closed</span>
                  </div>
                  <div className="pt-2 text-sm text-gray-500">
                    Live chat available extended hours
                  </div>
                </div>
              </div>

              {/* Office Location */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
                  <MapPin className="text-primary" size={20} />
                  Our Location
                </h3>
                <div className="text-gray-700">
                  <p className="mb-2">
                    <strong>Babyshop Headquarters</strong>
                  </p>
                  <p>123 Baby Street</p>
                  <p>Child City, BC 12345</p>
                  <p>United States</p>
                </div>
              </div>

              {/* Department Contacts */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-xl mb-4">
                  Department Contacts
                </h3>
                <div className="space-y-3">
                  {departments.map((dept, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-gray-700">{dept.name}:</span>
                      <a
                        href={`mailto:${dept.email}`}
                        className="text-primary hover:underline"
                      >
                        {dept.email}
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-xl mb-4">Quick Links</h3>
                <div className="space-y-2">
                  <a
                    href="/help"
                    className="block text-primary hover:underline"
                  >
                    Help Center
                  </a>
                  <a
                    href="/help/shipping"
                    className="block text-primary hover:underline"
                  >
                    Shipping Information
                  </a>
                  <a
                    href="/returns"
                    className="block text-primary hover:underline"
                  >
                    Returns & Exchanges
                  </a>
                  <Link
                    href="/user/orders"
                    className="block text-primary hover:underline"
                  >
                    Track Your Order
                  </Link>
                  <a
                    href="/privacy"
                    className="block text-primary hover:underline"
                  >
                    Privacy Policy
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ContactPage;
