import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const BackToHome = () => {
  return (
    <Link href={"/"}>
      <Button>Back to Home</Button>
    </Link>
  );
};

export default BackToHome;
