import { redirect } from "next/navigation";
import { getAuthToken, verifyToken } from "@/lib/serverAuth";
import AuthHeader from "./auth/_componnets/AuthHeader";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authToken = await getAuthToken();

  // If user has a valid token, redirect to profile
  if (authToken) {
    const isValid = await verifyToken(authToken);
    if (isValid) {
      redirect("/user/profile");
    }
  }

  return (
    <>
      <AuthHeader />
      {children}
    </>
  );
}
