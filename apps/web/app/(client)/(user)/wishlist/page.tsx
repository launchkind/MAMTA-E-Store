"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const WishlistRedirectPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the proper user wishlist page
    router.replace("/user/wishlist");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Redirecting to your wishlist...</p>
      </div>
    </div>
  );
};

export default WishlistRedirectPage;
