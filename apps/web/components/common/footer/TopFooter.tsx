import { footerTopData } from "@/constants/data";
import Image from "next/image";
import Container from "../Container";

const TopFooter = () => {
  return (
    <div className="bg-primary/90">
      <Container className="py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {footerTopData?.map((item) => (
          <div
            key={item?.title}
            className="flex items-center gap-5 lg:border-r border-white/10 last:border-r-0"
          >
            <Image
              src={item?.image}
              alt="footerOneImage"
              className="opacity-90"
            />
            <div>
              <h3 className="text-lg font-semibold capitalize mb-1.5 text-white">
                {item?.title}
              </h3>
              <p className="font-medium text-white/60 leading-5 text-sm">
                {item?.subTitle}
              </p>
            </div>
          </div>
        ))}
      </Container>
    </div>
  );
};

export default TopFooter;
