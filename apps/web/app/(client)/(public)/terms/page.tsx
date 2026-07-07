import React from "react";
import Container from "@/components/common/Container";
import { Title } from "@/components/common/text";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="pt-6">
        <PageBreadcrumb currentPage="Terms & Conditions" items={[]} />
      </Container>

      <Container className="py-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Title className="text-4xl font-bold mb-4">
              Terms & Conditions
            </Title>
            <p className="text-gray-600">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Acceptance of Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using the Babyshop website, you accept and
                agree to be bound by the terms and provision of this agreement.
                If you do not agree to abide by the above, please do not use
                this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Use License
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Permission is granted to temporarily download one copy of the
                materials on Babyshop&apos;s website for personal,
                non-commercial transitory viewing only. This is the grant of a
                license, not a transfer of title, and under this license you may
                not:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Modify or copy the materials</li>
                <li>
                  Use the materials for any commercial purpose or for any public
                  display
                </li>
                <li>
                  Attempt to reverse engineer any software contained on the
                  website
                </li>
                <li>
                  Remove any copyright or other proprietary notations from the
                  materials
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Product Information
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We strive to provide accurate product information, including
                descriptions, images, and prices. However, we do not warrant
                that product descriptions or other content is accurate,
                complete, reliable, current, or error-free. Colors and details
                may vary from what appears on your screen.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Pricing and Payment
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  All prices are listed in USD and are subject to change without
                  notice. We reserve the right to refuse or cancel orders for
                  any reason, including:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Product availability</li>
                  <li>Errors in product or pricing information</li>
                  <li>Problems identified by our fraud detection systems</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Shipping and Delivery
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We aim to process and ship orders within 1-2 business days.
                Delivery times may vary based on location and shipping method
                selected. We are not responsible for delays caused by customs,
                weather, or other factors beyond our control.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Returns and Exchanges
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  We want you to be completely satisfied with your purchase. Our
                  return policy includes:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>30-day return window from date of delivery</li>
                  <li>Items must be unused and in original packaging</li>
                  <li>Original receipt or proof of purchase required</li>
                  <li>
                    Customer responsible for return shipping costs unless item
                    is defective
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Account Registration
              </h2>
              <p className="text-gray-700 leading-relaxed">
                When you create an account, you are responsible for maintaining
                the confidentiality of your login credentials and for all
                activities that occur under your account. You agree to notify us
                immediately of any unauthorized use of your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Limitation of Liability
              </h2>
              <p className="text-gray-700 leading-relaxed">
                In no event shall Babyshop or its suppliers be liable for any
                damages (including, without limitation, damages for loss of data
                or profit, or due to business interruption) arising out of the
                use or inability to use the materials on this website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Privacy Policy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Your privacy is important to us. Please review our Privacy
                Policy, which also governs your use of the website, to
                understand our practices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Governing Law
              </h2>
              <p className="text-gray-700 leading-relaxed">
                These terms and conditions are governed by and construed in
                accordance with the laws of [Your Jurisdiction] and you
                irrevocably submit to the exclusive jurisdiction of the courts
                in that state or location.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Contact Information
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Questions about the Terms & Conditions should be sent to us at:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@babyshop.com
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

export default TermsPage;
