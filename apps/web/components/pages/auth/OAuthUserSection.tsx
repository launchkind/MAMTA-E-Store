"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import { Shield, Key, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useUserStore } from "../../../lib/store";
import { oauthUserService } from "../../../lib/oauthUserService";
import { User } from "@entry/types";

const setPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SetPasswordFormData = z.infer<typeof setPasswordSchema>;

interface OAuthUserSectionProps {
  user: User;
}

export function OAuthUserSection({ user }: OAuthUserSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { auth_token, updateUser } = useUserStore();

  const form = useForm<SetPasswordFormData>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Don't render anything if not an OAuth user
  if (!oauthUserService.isOAuthUser(user)) {
    return null;
  }

  const providerDisplayName = oauthUserService.getProviderDisplayName(
    user.authProvider || ""
  );
  const hasSetPassword = oauthUserService.hasSetPassword(user);

  const onSubmit = async (data: SetPasswordFormData) => {
    if (!auth_token) {
      toast.error("Authentication required", {
        description: "Please log in again",
        className: "bg-red-50 text-red-800 border-red-200",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await oauthUserService.setPassword(
        data.password,
        auth_token
      );

      if (result.success) {
        // Update user state to reflect password has been set
        updateUser({
          ...user,
          hasSetPassword: true,
        });

        form.reset();
        toast.success("Password set successfully", {
          description: "You can now use your password to sign in",
          className: "bg-green-50 text-green-800 border-green-200",
        });
      } else {
        throw new Error(result.message || "Failed to set password");
      }
    } catch (error) {
      console.error("Set password error:", error);
      toast.error("Failed to set password", {
        description:
          error instanceof Error ? error.message : "Please try again",
        className: "bg-red-50 text-red-800 border-red-200",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-md border-l-4 border-l-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
          <Shield className="h-6 w-6 text-blue-600" />
          Account Security
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            OAuth Account
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Account Info */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              {providerDisplayName === "Google" ? (
                <svg
                  className="w-5 h-5 text-white"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-blue-900">
                Signed in with {providerDisplayName}
              </h4>
              <p className="text-sm text-blue-700">
                Your account is secured through {providerDisplayName} OAuth
              </p>
            </div>
          </div>
        </div>

        {/* Password Status */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Key className="h-5 w-5 text-gray-600" />
          <div className="flex-1">
            <p className="font-medium text-gray-900">Password Status</p>
            <p className="text-sm text-gray-600">
              {hasSetPassword
                ? "You have set a password for your account"
                : "No password set for your account"}
            </p>
          </div>
          <Badge variant={hasSetPassword ? "default" : "secondary"}>
            {hasSetPassword ? "Set" : "Not Set"}
          </Badge>
        </div>

        {/* Set Password Form */}
        {!hasSetPassword && (
          <div className="space-y-4">
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800">
                  Optional: Set a Password
                </p>
                <p className="text-amber-700">
                  You can optionally set a password to sign in with
                  email/password in addition to {providerDisplayName} OAuth.
                </p>
              </div>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        New Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            disabled={isLoading}
                            className="pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                            disabled={isLoading}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
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
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                            disabled={isLoading}
                            className="pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                            disabled={isLoading}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
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
                      Setting Password...
                    </span>
                  ) : (
                    <>
                      <Key className="h-4 w-4 mr-2" />
                      Set Password
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        )}

        {/* Password Set Success */}
        {hasSetPassword && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium text-green-900">Password Set</p>
                <p className="text-sm text-green-700">
                  You can now sign in using either {providerDisplayName} OAuth
                  or your email and password.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
