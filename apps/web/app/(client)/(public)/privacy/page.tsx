import React from "react";
import Container from "@/components/common/Container";
import { Title } from "@/components/common/text";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="pt-6">
        <PageBreadcrumb currentPage="Privacy Policy" items={[]} />
      </Container>

      <Container className="py-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Title className="text-4xl font-bold mb-4">Privacy Policy</Title>
            <p className="text-gray-600">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed">
                At Babyshop, we respect your privacy and are committed to
                protecting your personal information. This Privacy Policy
                explains how we collect, use, and safeguard your information
                when you visit our website or make a purchase.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Information We Collect
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Personal Information
                  </h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Name, email address, and phone number</li>
                    <li>Billing and shipping addresses</li>
                    <li>
                      Payment information (processed securely through our
                      payment providers)
                    </li>
                    <li>Account credentials</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Usage Information
                  </h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Browser type and version</li>
                    <li>Pages visited and time spent on our site</li>
                    <li>Referring website addresses</li>
                    <li>IP address and device information</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                How We Use Your Information
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your purchases</li>
                <li>Provide customer support</li>
                <li>Send promotional emails (with your consent)</li>
                <li>Improve our website and services</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Information Sharing
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We do not sell, trade, or otherwise transfer your personal
                information to third parties, except in the following
                circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  Service providers who assist in operating our website and
                  conducting business
                </li>
                <li>Payment processors for secure transaction processing</li>
                <li>Shipping companies for order fulfillment</li>
                <li>Legal compliance when required by law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Data Security
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We implement appropriate security measures to protect your
                personal information against unauthorized access, alteration,
                disclosure, or destruction. This includes SSL encryption for
                data transmission and secure payment processing.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Your Rights
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your personal information</li>
                <li>Opt-out of marketing communications</li>
                <li>Object to certain data processing activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Cookies
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Our website uses cookies to enhance your browsing experience,
                analyze site traffic, and personalize content. You can control
                cookie preferences through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Contact Us
              </h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about this Privacy Policy or how we
                handle your personal information, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> privacy@babyshop.com
                  <br />
                  <strong>Phone:</strong> 1-800-BABYSHOP
                  <br />
                  <strong>Address:</strong> 123 Baby Street, Child City, BC
                  12345
                </p>
              </div>
            </section>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default PrivacyPolicyPage;
