import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Container from "@/components/common/Container";
import ComingSoonCountdown from "@/components/common/ComingSoonCountdown";
import React from "react";

interface ComingSoonPageProps {
  title: React.ReactNode;
  subtitle: string;
  targetDate: Date;
  illustration?: React.ReactNode;
  backLinkText?: string;
  backLinkHref?: string;
}

const ComingSoonPage = ({
  title,
  subtitle,
  targetDate,
  illustration,
  backLinkText = "Back to Home",
  backLinkHref = "/",
}: ComingSoonPageProps) => {
  return (
    <Container>
      <div className="min-h-[75vh] flex flex-col md:flex-row items-center justify-between py-16 gap-10">
        {/* Left Content Column */}
        <div className="w-full md:w-1/2 space-y-4 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            {title}
          </h1>

          <p className="text-muted-foreground text-lg max-w-lg mx-auto md:mx-0">
            {subtitle}
          </p>

          <div className="pt-4 md:w-fit flex justify-center md:justify-start">
            <ComingSoonCountdown targetDate={targetDate} />
          </div>

          {/* Primary Action Button */}
          <div className="pt-6 flex justify-center md:justify-start">
            <Link href={backLinkHref}>
              <Button
                size="lg"
                className="gap-2 shadow-md h-12 px-8 rounded-full text-base font-medium"
              >
                {backLinkText}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Illustration Column */}
        <div className="w-full md:w-1/2 relative h-[400px] md:h-[600px] flex justify-center items-center">
          {illustration}
        </div>
      </div>
    </Container>
  );
};

export default ComingSoonPage;
