import ComingSoonPage from "@/components/pages/ComingSoonPage";
import BlogComingSoonIllustration from "@/components/common/BlogComingSoonIllustration";
import React from "react";

export default function BlogsComingSoon() {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 28);

  return (
    <ComingSoonPage
      title={
        <>
          Exciting things are <br /> <span>coming soon!</span>
        </>
      }
      subtitle="We are working hard to bring you an amazing new blog experience. Get ready for expert insights delivered right to your screen!"
      targetDate={targetDate}
      illustration={<BlogComingSoonIllustration />}
    />
  );
}
