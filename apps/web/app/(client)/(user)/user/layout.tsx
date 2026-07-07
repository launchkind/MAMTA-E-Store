import { redirect } from "next/navigation";
import { getAuthToken, verifyToken } from "@/lib/serverAuth";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authToken = await getAuthToken();

  // If no token or invalid token, redirect to signin
  if (!authToken) {
    redirect("/auth/signin");
  }

  const isValid = await verifyToken(authToken);
  if (!isValid) {
    redirect("/auth/signin");
  }

  return <>{children}</>;
}
