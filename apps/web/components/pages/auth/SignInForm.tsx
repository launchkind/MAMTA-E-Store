"use client";

import { LogIn, Eye, EyeOff, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserStore } from "../../../lib/store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { User } from "@entry/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
} from "../../../components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form";
import { Input } from "../../../components/ui/input";
import { Checkbox } from "../../../components/ui/checkbox";
import { Button } from "../../../components/ui/button";
import { createClient } from "@/lib/supabase/client";
// import { GoogleSignInButton, GitHubSignInButton } from "./OAuthButtons"; // disabled for now

// Define the schema for the login form
const loginSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    termsAccepted: z.boolean(),
  })
  .refine((data) => data.termsAccepted === true, {
    message: "You must accept the terms and privacy policy",
    path: ["termsAccepted"],
  });

type LoginFormData = z.infer<typeof loginSchema>;

const SignInForm = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuthToken, updateUser } = useUserStore();

  // Get redirect parameter from URL
  const redirectTo = searchParams.get("redirect") || "/user/profile";

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      termsAccepted: true,
    },
  });

  const login = async (data: LoginFormData): Promise<boolean> => {
    setError(null);
    try {
      const supabase = createClient();
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        const errorMessage = error.message || "Invalid email or password";
        setError(errorMessage);
        toast.error("Login failed", {
          description: errorMessage,
          className: "bg-red-50 text-gray-800 border-red-200",
          duration: 7000,
        });
        return false;
      }

      if (authData.session) {
        const { data: userRow } = await supabase
          .from("users")
          .select("id, name, email, role, avatar, addresses, email_verified")
          .eq("id", authData.user.id)
          .single();

        setAuthToken(authData.session.access_token, authData.session.refresh_token);
        updateUser({
          _id: authData.user.id,
          name: userRow?.name || authData.user.user_metadata?.name || "",
          email: authData.user.email || "",
          role: userRow?.role || "customer",
          avatar: userRow?.avatar,
          addresses: userRow?.addresses || [],
          emailVerified: userRow?.email_verified || !!authData.user.email_confirmed_at,
          isOAuthUser: authData.user.app_metadata?.provider !== "email",
          authProvider: authData.user.app_metadata?.provider || "email",
          hasSetPassword: true,
        } as User);
        return true;
      }
      return false;
    } catch {
      const errorMessage = "An unexpected error occurred. Please try again later.";
      setError(errorMessage);
      toast.error("Login failed", {
        description: errorMessage,
        className: "bg-red-50 text-gray-800 border-red-200",
        duration: 7000,
      });
      return false;
    }
  };

  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);

  const onSubmit: (data: LoginFormData) => Promise<void> = async (data) => {
    setIsLoading(true);
    const success = await login(data);
    if (success) {
      setIsRedirecting(true); // Trigger loader
      toast.success("Login successful", {
        description: "You have been signed in",
        className: "bg-green-50 text-gray-800 border-green-200",
        duration: 5000,
      });
      // Delay push slightly to let loader appear smoothly or just push immediately
      router.push(redirectTo);
    } else {
      setIsLoading(false);
    }
  };

  if (isRedirecting) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Welcome Back!
          </h2>
          <p className="text-muted-foreground">
            Redirecting you to the dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full px-4"
    >
      <Card className="w-full shadow-none border-0 bg-transparent p-0">
        <CardContent className="p-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-center gap-2 border border-destructive/20"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-bold text-foreground after:content-['*'] after:ml-0.5 after:text-destructive">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Email Address"
                        type="email"
                        disabled={isLoading}
                        className="rounded-sm border-border focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary h-10 bg-background"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-bold text-gray-700 after:content-['*'] after:ml-0.5 after:text-red-500">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Password"
                          type={showPassword ? "text" : "password"}
                          disabled={isLoading}
                          className="rounded-sm border-border focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary h-10 bg-background pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-primary transition-colors duration-200"
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="termsAccepted"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                        className="border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    </FormControl>
                    <FormLabel className="text-sm text-muted-foreground font-normal">
                      I agree with the{" "}
                      <Link
                        href="/privacy"
                        className="text-primary hover:text-primary hover:underline"
                      >
                        Privacy Policy
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/terms"
                        className="text-primary hover:text-primary hover:underline"
                      >
                        Terms of Use
                      </Link>
                    </FormLabel>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-between pt-2">
                <Button
                  type="submit"
                  className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold uppercase rounded-sm px-8"
                  disabled={isLoading || !form.watch("termsAccepted")}
                >
                  Login
                </Button>

                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  Forgot Your Password?
                </Link>
              </div>

              {/* OAuth Login Section — disabled for now, Google/GitHub not needed for ordering
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <GoogleSignInButton
                    disabled={isLoading}
                    redirectTo={redirectTo}
                  />
                  <GitHubSignInButton
                    disabled={isLoading}
                    redirectTo={redirectTo}
                  />
                </div>
              </div>
              */}
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SignInForm;
