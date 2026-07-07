import { footerFour, footerOne, footerThree, footerTwo } from "@/assets/image";

const topHelpCenter = [
  { title: "Help Center", href: "/help" },
  { title: "Wishlist", href: "/user/wishlist" },
  { title: "Order Tracking", href: "/user/orders" },
  { title: "Shop Now", href: "/shop" },
];

export const bottomHeaderNavList = [
  { title: "Home", href: "/" },
  { title: "Shop", href: "/shop" },
  { title: "Features", href: "/features" },
  { title: "New Arrivals", href: "/new-arrivals" },
  { title: "Blogs", href: "/blogs" },
  { title: "About Us", href: "/about" },
  { title: "Contact Us", href: "/contact" },
];

const footerTopData = [
  {
    title: "Free Shipping",
    subTitle: "Free Shipping for orders over $99",
    image: footerOne,
  },
  {
    title: "Money Guarantee",
    subTitle: "Within 30 days for an exchange",
    image: footerTwo,
  },
  {
    title: "Online Support",
    subTitle: "24 hours a day, 7 days a week",
    image: footerThree,
  },
  {
    title: "Flexible Payment",
    subTitle: "Pay with Multiple Credit Cards",
    image: footerFour,
  },
];

export { topHelpCenter, footerTopData };
