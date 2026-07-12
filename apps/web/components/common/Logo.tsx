import { logo } from "../../assets/image";
import { cn } from "../../lib/utils";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Logo = ({
  className,
  logoUrl,
}: {
  className?: string;
  logoUrl?: string | null;
}) => {
  return (
    <Link href={"/"}>
      <Image
        src={logoUrl || logo}
        alt="logo"
        className={cn("w-48 lg:w-64 h-auto", className)}
        width={256}
        height={58}
        priority
      />
    </Link>
  );
};

export default Logo;
