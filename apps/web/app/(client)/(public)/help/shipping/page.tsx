import React from "react";
import Link from "next/link";
import Container from "@/components/common/Container";
import { Title } from "@/components/common/text";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import { Truck, Clock, MapPin, Package, Globe } from "lucide-react";

const ShippingPage = () => {
  const shippingOptions = [
    {
      title: "Standard Shipping",
      price: "Free on orders $50+",
      time: "3-5 business days",
      description: "Our most popular shipping option with reliable delivery",
      icon: <Truck size={24} />,
    },
    {
      title: "Express Shipping",
      price: "$9.99",
      time: "1-2 business days",
      description: "Fast delivery for when you need items quickly",
      icon: <Clock size={24} />,
    },
    {
      title: "Overnight Shipping",
      price: "$19.99",
      time: "Next business day",
      description: "Next-day delivery available in select areas",
      icon: <Package size={24} />,
    },
  ];

  const internationalZones = [
    { zone: "Canada", time: "5-7 business days", price: "Starting at $12.99" },
    { zone: "Europe", time: "7-10 business days", price: "Starting at $19.99" },
    {
      zone: "Australia",
      time: "10-14 business days",
      price: "Starting at $24.99",
    },
    { zone: "Asia", time: "10-14 business days", price: "Starting at $22.99" },
    {
      zone: "Rest of World",
      time: "14-21 business days",
      price: "Starting at $29.99",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="pt-6">
        <PageBreadcrumb
          currentPage="Shipping Information"
          items={[{ label: "Help Center", href: "/help" }]}
        />
      </Container>

      <Container className="py-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Title className="text-4xl font-bold mb-4">
              Shipping Information
            </Title>
            <p className="text-gray-600 text-lg">
              Fast, reliable shipping options to get your baby essentials
              delivered safely
            </p>
          </div>

          {/* Domestic Shipping Options */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <MapPin className="text-primary" size={24} />
              Domestic Shipping (United States)
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {shippingOptions.map((option, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-6"
                >
                  <div className="text-primary mb-4">{option.icon}</div>
                  <h3 className="font-semibold text-lg mb-2">{option.title}</h3>
                  <div className="text-primary font-semibold mb-1">
                    {option.price}
                  </div>
                  <div className="text-gray-600 mb-3">{option.time}</div>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold mb-2">Free Shipping Details:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Free standard shipping on orders $50 or more</li>
                <li>
                  • Applies to standard shipping within the continental US
                </li>
                <li>• Alaska and Hawaii may have additional charges</li>
                <li>• Excludes oversized items (cribs, high chairs, etc.)</li>
              </ul>
            </div>
          </div>

          {/* International Shipping */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Globe className="text-primary" size={24} />
              International Shipping
            </h2>

            <p className="text-gray-600 mb-6">
              We ship to over 50 countries worldwide. International shipping
              rates and delivery times vary by destination.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold">
                      Shipping Zone
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Delivery Time
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Shipping Cost
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {internationalZones.map((zone, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4">{zone.zone}</td>
                      <td className="py-3 px-4 text-gray-600">{zone.time}</td>
                      <td className="py-3 px-4 text-gray-600">{zone.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold mb-2">
                International Shipping Notes:
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>
                  • Customs duties and taxes may apply and are customer&apos;s
                  responsibility
                </li>
                <li>
                  • Delivery times are estimates and may vary due to customs
                  processing
                </li>
                <li>
                  • Some items may have shipping restrictions to certain
                  countries
                </li>
                <li>• Orders may require signature confirmation</li>
              </ul>
            </div>
          </div>

          {/* Processing & Tracking */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6">
              Order Processing & Tracking
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-lg mb-3">Processing Times</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Standard items: 1-2 business days</li>
                  <li>• Custom/personalized items: 3-5 business days</li>
                  <li>• Large furniture items: 2-3 business days</li>
                  <li>• Gift items during holidays: 2-4 business days</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Order Tracking</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Tracking number sent via email when shipped</li>
                  <li>• Track orders in your account dashboard</li>
                  <li>• Real-time updates on delivery status</li>
                  <li>• SMS notifications available</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Special Circumstances */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold mb-6">
              Special Shipping Circumstances
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Oversized Items</h3>
                <p className="text-gray-700">
                  Large items like cribs, changing tables, and strollers may
                  require special shipping arrangements. Additional fees may
                  apply for white-glove delivery service.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Hazardous Materials
                </h3>
                <p className="text-gray-700">
                  Some items (like certain baby care products) may have shipping
                  restrictions due to regulations. These items may only be
                  available for ground shipping.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Holiday Shipping</h3>
                <p className="text-gray-700">
                  During peak holiday seasons, processing and shipping times may
                  be extended. We recommend ordering early to ensure timely
                  delivery.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-primary/10 rounded-lg p-8 mt-8 text-center">
            <h3 className="text-2xl font-bold mb-4">
              Questions About Shipping?
            </h3>
            <p className="text-gray-600 mb-6">
              Our customer service team is here to help with any shipping
              questions or concerns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/help/contact"
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Contact Support
              </a>
              <Link
                href="/user/orders"
                className="border border-primary text-primary px-6 py-3 rounded-lg hover:bg-primary hover:text-white transition-colors"
              >
                Track Your Order
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ShippingPage;
