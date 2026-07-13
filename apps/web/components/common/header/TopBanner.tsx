import React from "react";
import Container from "../Container";
// import { topHelpCenter } from "@/constants/data";
// import Link from "next/link";
import TopSocialLinksClient from "./TopSocialLinksClient";
// import SelectCurrency from "./SelectCurrency";
import SelectLanguage from "./SelectLanguage";

const TopBanner = () => {
  return (
    <div className="w-full bg-gradient-to-b from-neutral-800 to-black text-primary-foreground py-2 text-sm font-medium border-b border-b-border/20">
      <Container className="flex items-center justify-between">
        <p className="text-center">
          Black Friday Shopping{" "}
          <span className="hidden md:inline-flex">
            and Small Business Saturday Deals!!!
          </span>
        </p>
        <div className="flex items-center justify-end">
          <SelectLanguage />
          {/* <SelectCurrency /> */}
          <TopSocialLinksClient />
        </div>
      </Container>
    </div>
  );
};

export default TopBanner;
