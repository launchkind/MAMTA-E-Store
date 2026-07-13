import React from "react";
import Container from "@/components/common/Container";
import { Title } from "@/components/common/text";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import { Star, Quote } from "lucide-react";

const testimonialData = [
  {
    id: 1,
    name: "Ananya Sharma",
    location: "Kolkata, West Bengal",
    rating: 5,
    review:
      "Absolutely love shopping at Mamta E-Store! I bought a Samsung TV and the delivery was quick and the packaging was excellent. Genuine products at great prices.",
    date: "2024-01-15",
  },
  {
    id: 2,
    name: "Rohit Verma",
    location: "Siliguri, West Bengal",
    rating: 5,
    review:
      "Ordered a laptop for my work and it arrived exactly as described. Mamta E-Store made it easy with their detailed specs and excellent customer service. Highly recommended!",
    date: "2024-01-10",
  },
  {
    id: 3,
    name: "Priya Das",
    location: "Islampur, West Bengal",
    rating: 5,
    review:
      "The quality control at Mamta E-Store gives me peace of mind when buying electronics online. My new smartphone works perfectly and arrived well ahead of schedule.",
    date: "2024-01-08",
  },
  {
    id: 4,
    name: "Arjun Mehta",
    location: "Kolkata, West Bengal",
    rating: 5,
    review:
      "Fast shipping, great prices, and excellent customer support. Mamta E-Store has become my go-to store for all things electronics — phones, appliances, and audio gear.",
    date: "2024-01-05",
  },
  {
    id: 5,
    name: "Sneha Roy",
    location: "Malda, West Bengal",
    rating: 5,
    review:
      "The variety of products is amazing and the website is so easy to navigate. Their support team helped me pick the right AC for my home within minutes.",
    date: "2024-01-03",
  },
  {
    id: 6,
    name: "Vikram Singh",
    location: "Darjeeling, West Bengal",
    rating: 5,
    review:
      "Quality products at competitive prices. The customer service team went above and beyond to help me find the perfect headphones as a gift for my brother.",
    date: "2024-01-01",
  },
];

const TestimonialsPage = () => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        size={16}
        className={`${
          index < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="pt-6">
        <PageBreadcrumb currentPage="Testimonials" items={[]} />
      </Container>

      <Container className="py-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Title className="text-4xl font-bold mb-4">
              What Our Customers Say
            </Title>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Read reviews from thousands of happy customers who trust Mamta
              E-Store for their electronics needs
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                10,000+
              </div>
              <p className="text-gray-600">Happy Customers</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                4.9
              </div>
              <div className="flex justify-center gap-1 mb-2">
                {renderStars(5)}
              </div>
              <p className="text-gray-600">Average Rating</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                99%
              </div>
              <p className="text-gray-600">Customer Satisfaction</p>
            </div>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonialData.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <Quote className="text-primary opacity-50" size={24} />
                  <div className="flex gap-1">
                    {renderStars(testimonial.rating)}
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed mb-4">
                  &quot;{testimonial.review}&quot;
                </p>

                <div className="border-t pt-4">
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {testimonial.location}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(testimonial.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="bg-white rounded-lg shadow-sm p-8 mt-12 text-center">
            <Title className="text-2xl font-bold mb-4">
              Share Your Experience
            </Title>
            <p className="text-gray-600 mb-6">
              We&apos;d love to hear about your experience with Mamta E-Store.
              Your feedback helps us improve and helps other customers make
              informed decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
                Write a Review
              </button>
              <button className="border border-primary text-primary px-6 py-3 rounded-lg hover:bg-primary hover:text-white transition-colors">
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default TestimonialsPage;
