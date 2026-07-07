"use client";

import React, { useState } from "react";
import { Mail, MapPin, Phone, Clock, Send, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Container from "@/components/common/Container";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import { Title } from "@/components/common/text";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contactInfo = [
    {
      icon: <MapPin className="h-6 w-6 text-primary" />,
      title: "Our Location",
      details: ["123 Commerce Avenue", "Suite 400", "New York, NY 10001"],
    },
    {
      icon: <Phone className="h-6 w-6 text-primary" />,
      title: "Phone Number",
      details: ["+1 (555) 123-4567", "+1 (555) 987-6543 (Support)"],
    },
    {
      icon: <Mail className="h-6 w-6 text-primary" />,
      title: "Email Address",
      details: ["support@entry-ecommerce.com", "info@entry-ecommerce.com"],
    },
    {
      icon: <Clock className="h-6 w-6 text-primary" />,
      title: "Operating Hours",
      details: ["Monday - Friday: 9AM - 6PM", "Saturday - Sunday: Closed"],
    },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.error("Contact Form functionality is exclusive to the Premium setup.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Header section matching other pages */}
      <div className="bg-white border-b border-border shadow-xs">
        <Container className="pt-6 pb-12">
          <PageBreadcrumb currentPage="Contact Us" items={[]} />
          <div className="text-center max-w-2xl mx-auto mt-8">
            <Title className="text-3xl md:text-4xl font-bold mb-4">
              Get in Touch
            </Title>
            <p className="text-muted-foreground text-lg">
              Have a question, feedback, or need support? We&apos;d love to hear
              from you. Fill out the form below and our team will get back to
              you as soon as possible.
            </p>
          </div>
        </Container>
      </div>

      <Container className="py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Contact Information Cards */}
          <div className="lg:col-span-1 space-y-6">
            {contactInfo.map((info, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl shadow-sm border border-border/60 hover:shadow-md hover:border-primary/20 transition-all flex items-start gap-4"
              >
                <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                  {info.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">
                    {info.title}
                  </h3>
                  <div className="space-y-1">
                    {info.details.map((detail, i) => (
                      <p key={i} className="text-muted-foreground text-sm">
                        {detail}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-border/60 p-6 sm:p-10 h-full">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground">
                  Send us a Message
                </h2>
                <p className="text-muted-foreground mt-1">
                  We usually reply within 24 hours.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="text-sm font-medium text-foreground"
                    >
                      Full Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className="bg-gray-50/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-foreground"
                    >
                      Email Address <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className="bg-gray-50/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="subject"
                    className="text-sm font-medium text-foreground"
                  >
                    Subject <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="How can we help you?"
                    value={formData.subject}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="bg-gray-50/50"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="message"
                    className="text-sm font-medium text-foreground"
                  >
                    Your Message <span className="text-destructive">*</span>
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Write your message here..."
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="resize-none bg-gray-50/50"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto min-w-[200px] gap-2"
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Google Maps placeholder - Full Width */}
        <div className="mt-12 bg-gray-200 w-full h-[400px] rounded-xl overflow-hidden relative group shadow-sm border border-border/60">
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <Button
              variant="secondary"
              size="lg"
              className="gap-2 shadow-lg hover:scale-105 transition-transform"
            >
              <MapPin className="w-5 h-5" /> Open in Google Maps
            </Button>
          </div>
          <img
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1600&auto=format&fit=crop"
            alt="Entry Ecommerce HQ Map Location"
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 grayscale opacity-80"
          />
        </div>
      </Container>
    </div>
  );
};

export default ContactPage;
