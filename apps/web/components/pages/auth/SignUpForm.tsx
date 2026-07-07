"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardFooter } from "../../../components/ui/card";
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
import { UserPlus, Eye, EyeOff, Check, X } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useUserStore } from "../../../lib/store";
import { GoogleSignInButton, GitHubSignInButton } from "./OAuthButtons";
import { User, Lock } from "lucide-react";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Define the schema for the form, including terms acceptance
const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
    role: z.literal("user"),
    termsAccepted: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.termsAccepted === true, {
    message: "You must agree to the Privacy Policy and Terms of Use",
    path: ["termsAccepted"],
  });

type FormData = z.infer<typeof registerSchema>;

export default function SignUpForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const router = useRouter();
  const { register } = useUserStore();

  const form = useForm<FormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "user",
      termsAccepted: true,
    },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    try {
      // Combine firstName and lastName into a single name field for registration
      const registerData = {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        password: data.password,
        role: data.role,
      };
      await register(registerData);
      toast.success("Registration successful", {
        description: "Your account has been created",
        className: "bg-green-50 text-green-800 border-green-200",
      });
      router.push("/auth/signin");
    } catch (error: unknown) {
      console.error("Failed to register:", error);
      let message = "Failed to register new user. Please try again.";
      if (error instanceof Error) {
        message = error.message;
      }
      toast.error("Registration failed", {
        description: message,
        className: "bg-red-50 text-red-800 border-red-200",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(form.watch("password") || "");
  const getStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };
  const getStrengthText = () => {
    if (passwordStrength <= 1) return "Weak";
    if (passwordStrength <= 3) return "Medium";
    return "Strong";
  };

  return (
    <div className="w-full">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full"
      >
        <Card className="w-full shadow-lg border border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="p-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                {/* Personal Information Section */}
                <motion.div variants={itemVariants} className="space-y-6">
                  <div className="flex items-center gap-2 mb-4 border-b border-border pb-2">
                    <UserPlus className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-lg text-foreground">
                      Personal Details
                    </h3>
                  </div>
                  <div className="flex flex-col md:flex-row gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="text-sm font-bold text-foreground after:content-['*'] after:ml-0.5 after:text-destructive">
                            First Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder=""
                              disabled={isLoading}
                              className="rounded-sm border-border focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary h-10 bg-background"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-destructive text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="text-sm font-bold text-foreground after:content-['*'] after:ml-0.5 after:text-destructive">
                            Last Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder=""
                              disabled={isLoading}
                              className="rounded-sm border-border focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary h-10 bg-background"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-destructive text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="termsAccepted" // Reusing this for "Newsletter" concept or just adding a dummy newsletter box if needed by design, but keeping logic effectively minimal.
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            // Logic for newsletter usually separate, but for now just showing visual checkbox
                            checked={false}
                            onCheckedChange={() => {}}
                            disabled={isLoading}
                            className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                        </FormControl>
                        <FormLabel className="text-sm text-muted-foreground font-normal">
                          Sign Up for Newsletter
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </motion.div>

                {/* Sign-in Information Section */}
                <motion.div variants={itemVariants}>
                  <div className="flex items-center gap-2 mb-4 border-b border-border pb-2 mt-8">
                    <Lock className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-lg text-foreground">
                      Security
                    </h3>
                  </div>
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold text-gray-700 after:content-['*'] after:ml-0.5 after:text-red-500">
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Email Address"
                              type="email"
                              disabled={isLoading}
                              className="rounded-sm border-border focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary h-10 bg-background md:w-1/2"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-destructive text-xs" />
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
                            <div className="relative md:w-1/2">
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
                          {field.value && (
                            <div className="mt-2 md:w-1/2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-muted-foreground">
                                  Password strength:
                                </span>
                                <span
                                  className={`text-xs font-semibold ${
                                    passwordStrength <= 1
                                      ? "text-destructive"
                                      : passwordStrength <= 3
                                        ? "text-yellow-500"
                                        : "text-green-500"
                                  }`}
                                >
                                  {getStrengthText()}
                                </span>
                              </div>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((level) => (
                                  <div
                                    key={level}
                                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                      level <= passwordStrength
                                        ? getStrengthColor()
                                        : "bg-muted"
                                    }`}
                                  />
                                ))}
                              </div>
                              <div className="mt-2 space-y-1">
                                <PasswordRequirement
                                  met={field.value.length >= 8}
                                  text="At least 8 characters"
                                />
                                <PasswordRequirement
                                  met={
                                    /[a-z]/.test(field.value) &&
                                    /[A-Z]/.test(field.value)
                                  }
                                  text="Upper & lowercase letters"
                                />
                                <PasswordRequirement
                                  met={/\d/.test(field.value)}
                                  text="Contains a number"
                                />
                                <PasswordRequirement
                                  met={/[^a-zA-Z\d]/.test(field.value)}
                                  text="Special character"
                                />
                              </div>
                            </div>
                          )}
                          <FormMessage className="text-destructive text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold text-gray-700 after:content-['*'] after:ml-0.5 after:text-red-500">
                            Confirm Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative md:w-1/2">
                              <Input
                                placeholder="Confirm Password"
                                type={showConfirmPassword ? "text" : "password"}
                                disabled={isLoading}
                                className="rounded-sm border-border focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary h-10 bg-background pr-10"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-primary transition-colors duration-200"
                                disabled={isLoading}
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-destructive text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="flex justify-end pt-4"
                >
                  <Button
                    type="submit"
                    className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold uppercase rounded-sm px-8 h-10 shadow-none hover:shadow-none"
                    disabled={isLoading || !form.watch("termsAccepted")}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5 text-white"
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
                      <span className="flex items-center gap-2">
                        Create an Account
                      </span>
                    )}
                  </Button>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-4">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <GoogleSignInButton
                      disabled={isLoading}
                      onSuccess={() => {
                        toast.success("Registration successful", {
                          description:
                            "Your account has been created with OAuth",
                          className:
                            "bg-green-50 text-green-800 border-green-200",
                        });
                      }}
                    />
                    <GitHubSignInButton
                      disabled={isLoading}
                      onSuccess={() => {
                        toast.success("Registration successful", {
                          description:
                            "Your account has been created with OAuth",
                          className:
                            "bg-green-50 text-green-800 border-green-200",
                        });
                      }}
                    />
                  </div>
                </motion.div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// Helper component for password requirements
function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {met ? (
        <Check className="w-3 h-3 text-green-500" />
      ) : (
        <X className="w-3 h-3 text-muted-foreground" />
      )}
      <span className={met ? "text-green-600" : "text-muted-foreground"}>
        {text}
      </span>
    </div>
  );
}
