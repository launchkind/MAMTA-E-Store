import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/useAuthStore";
import { registerSchema } from "@/lib/validation";
import { Button } from "@/components/ui/button";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import {
  GoogleSignInButton,
  GitHubSignInButton,
} from "@/components/auth/OAuthButtons";

type FormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register } = useAuthStore();

  const form = useForm<FormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
    },
  });

  async function onSubmit(data: FormData) {
    try {
      setIsLoading(true);
      setErrorMessage("");
      await register(data);
      toast({
        title: "Registration successful",
        description: "Your account has been created",
      });
      navigate("/login");
    } catch (error: unknown) {
      const errorMsg =
        (
          error as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to register. Please try again.";
      setErrorMessage(errorMsg);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-20">
        <div className="text-left mb-8 md:mb-12">
          <h1 className="text-3xl font-bold text-gray-900">
            Request Admin Access
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column: Admin Registration */}
          <div className="bg-gray-50/50 p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              New Administrator Setup
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Create your account to request access. Your account will need to
              be approved by a Super Admin.
            </p>

            <Form {...form}>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  const isValid = await form.trigger();
                  if (!isValid) return false;

                  await onSubmit(form.getValues());
                  return false;
                }}
                className="space-y-4"
              >
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#d52245] text-white text-sm p-3 rounded-lg flex items-center gap-2 shadow-sm"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0 text-white" />
                    <p className="font-medium">{errorMessage}</p>
                  </motion.div>
                )}

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-gray-900 after:content-['*'] after:ml-0.5 after:text-red-500">
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          disabled={isLoading}
                          className="h-11 border-gray-200 bg-white focus:ring-2 focus:ring-[#1a1a2c] focus:border-[#1a1a2c] transition-all duration-200 rounded-lg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs mt-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-gray-900 after:content-['*'] after:ml-0.5 after:text-red-500">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="admin@example.com"
                          type="email"
                          disabled={isLoading}
                          className="h-11 border-gray-200 bg-white focus:ring-2 focus:ring-[#1a1a2c] focus:border-[#1a1a2c] transition-all duration-200 rounded-lg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs mt-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-gray-900 after:content-['*'] after:ml-0.5 after:text-red-500">
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Create a strong password"
                            type={showPassword ? "text" : "password"}
                            disabled={isLoading}
                            className="h-11 border-gray-200 bg-white focus:ring-2 focus:ring-[#1a1a2c] focus:border-[#1a1a2c] transition-all duration-200 rounded-lg pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs mt-1" />
                    </FormItem>
                  )}
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full h-11 bg-[#1a1a2c] hover:bg-[#1a1a2c]/90 text-white font-bold tracking-wide uppercase rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </svg>
                        Creating account...
                      </span>
                    ) : (
                      "Request Access"
                    )}
                  </Button>
                </div>

                {/* OAuth Signup Section */}
                <div className="space-y-4 pt-6 mt-6 border-t border-gray-200">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-gray-50 px-2 text-gray-500 font-medium">
                        Or setup with
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <GoogleSignInButton
                      disabled={isLoading}
                      className="h-11 rounded-lg border-gray-200 bg-white"
                      onSuccess={() => {
                        toast({
                          title: "Registration successful",
                          description:
                            "Your account has been created with Google",
                        });
                        navigate("/dashboard");
                      }}
                    />
                    <GitHubSignInButton
                      disabled={isLoading}
                      className="h-11 rounded-lg border-gray-200 bg-white"
                      onSuccess={() => {
                        toast({
                          title: "Registration successful",
                          description:
                            "Your account has been created with GitHub",
                        });
                        navigate("/dashboard");
                      }}
                    />
                  </div>
                </div>
              </form>
            </Form>
          </div>

          {/* Right Column: Existing Admins */}
          <div className="bg-gray-50/50 p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm h-fit">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              Existing Administrators
            </h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              If you already have an approved administrator account, you can
              sign in using your email and password or your connected OAuth
              provider.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-3 bg-[#1a1a2c] text-white border border-[#1a1a2c] font-bold text-sm uppercase tracking-wider hover:bg-white hover:text-[#1a1a2c] transition-colors rounded-lg shadow-sm"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
