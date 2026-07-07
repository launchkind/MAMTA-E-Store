import { redirect } from "next/navigation";

const ProductPage = () => {
  // Redirect to shop page since product page requires an ID
  redirect("/shop");
};

export default ProductPage;
