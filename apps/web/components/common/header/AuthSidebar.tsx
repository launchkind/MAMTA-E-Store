"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { X, Eye, EyeOff, Loader2, Check, AlertCircle } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useUserStore } from "@/lib/store";
import { useAuthSidebarStore, AuthView } from "@/lib/useAuthSidebarStore";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";
import { User } from "@entry/types";
import { oauthService } from "@/lib/oauthService";

// ─────────────────────────────────────────────────────────────────────────────
// Premium animated OAuth button — standalone, no external OAuthButton dep
// ─────────────────────────────────────────────────────────────────────────────
type OAuthProvider = "google" | "github";

interface SidebarOAuthBtnProps {
  provider: OAuthProvider;
  disabled?: boolean;
}

function SidebarOAuthBtn({ provider, disabled }: SidebarOAuthBtnProps) {
  const [loading, setLoading] = useState(false);
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const config = {
    google: {
      label: "Continue with Google",
      bg: "bg-white border border-[#e5e7eb] hover:bg-[#f8fafc]",
      text: "text-[#3c4043]",
      shadow: "hover:shadow-[0_2px_12px_rgba(66,133,244,0.25)]",
      icon: (
        <svg viewBox="0 0 24 24" className="size-5 shrink-0">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      ),
    },
    github: {
      label: "Continue with GitHub",
      bg: "bg-[#24292e] hover:bg-[#1b1f23]",
      text: "text-white",
      shadow: "hover:shadow-[0_2px_12px_rgba(0,0,0,0.4)]",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-5 shrink-0 text-white"
        >
          <path
            fillRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  }[provider];

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setTimeout(() => setRipple(null), 600);

    setLoading(true);
    try {
      // Triggers a full-page redirect to the provider on success — this
      // promise only resolves/rejects before that navigation happens.
      if (provider === "google") {
        await oauthService.signInWithGoogle();
      } else {
        await oauthService.signInWithGitHub();
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : `Failed to sign in with ${provider}`;
      toast.error("Sign in failed", {
        description: msg,
        className: "bg-red-50 text-red-800 border-red-200",
        duration: 7000,
      });
      setLoading(false);
    }
  };

  return (
    <motion.button
      ref={btnRef}
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      className={`relative w-full h-12 flex items-center justify-center gap-3 rounded-xl font-semibold text-sm transition-all duration-200 overflow-hidden select-none
        ${config.bg} ${config.text} ${config.shadow}
        disabled:opacity-50 disabled:cursor-not-allowed`}
      whileHover={{ scale: disabled || loading ? 1 : 1.015 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.975 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Shimmer sweep on hover */}
      <motion.span
        className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent"
        initial={false}
        whileHover={{ translateX: "200%" }}
        transition={{ duration: 0.55, ease: "easeInOut" }}
      />
      {/* Click ripple */}
      <AnimatePresence>
        {ripple && (
          <motion.span
            key={`${ripple.x}-${ripple.y}`}
            className="pointer-events-none absolute rounded-full bg-white/30"
            style={{
              left: ripple.x - 40,
              top: ripple.y - 40,
              width: 80,
              height: 80,
            }}
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>
      {/* Content */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.span
            key="loading"
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            <Loader2 className="size-4 animate-spin" />
            <span>Connecting…</span>
          </motion.span>
        ) : (
          <motion.span
            key="idle"
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {config.icon}
            <span>{config.label}</span>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Animated OAuth section with staggered entry
// ─────────────────────────────────────────────────────────────────────────────
const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};
const itemSlide = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

// ── Floating-label input ───────────────────────────────────────────────────
const Field = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  disabled = false,
  rightSlot,
  required = true,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  rightSlot?: React.ReactNode;
  required?: boolean;
}) => (
  <div className="relative">
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      disabled={disabled}
      placeholder=" "
      className="peer w-full px-4 pt-5 pb-2 rounded-lg border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all text-sm text-foreground placeholder-transparent disabled:opacity-60"
    />
    <label
      htmlFor={id}
      className="absolute left-4 top-4 text-sm text-muted-foreground transition-all duration-200
        peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm
        peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-primary
        peer-not-placeholder-shown:top-1.5 peer-not-placeholder-shown:text-[10px]"
    >
      {label} {required && <span className="text-destructive">*</span>}
    </label>
    {rightSlot && (
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
        {rightSlot}
      </div>
    )}
  </div>
);

const EyeToggle = ({
  show,
  toggle,
}: {
  show: boolean;
  toggle: () => void;
}) => (
  <button
    type="button"
    onClick={toggle}
    className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
  >
    {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
  </button>
);

const Divider = ({ text = "OR" }: { text?: string }) => (
  <div className="flex items-center gap-3">
    <div className="flex-1 h-px bg-border" />
    <span className="text-xs text-muted-foreground font-medium">{text}</span>
    <div className="flex-1 h-px bg-border" />
  </div>
);

// ── View animation wrapper ─────────────────────────────────────────────────
const ViewWrap = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.2, ease: "easeOut" }}
    className="flex flex-col gap-5"
  >
    {children}
  </motion.div>
);

// ── Req indicator ──────────────────────────────────────────────────────────
const Req = ({ met, text }: { met: boolean; text: string }) => (
  <div className="flex items-center gap-1.5 text-xs">
    <Check
      className={`size-3 transition-colors ${met ? "text-green-500" : "text-muted-foreground/30"}`}
    />
    <span
      className={`transition-colors ${met ? "text-green-600" : "text-muted-foreground"}`}
    >
      {text}
    </span>
  </div>
);

// ── OAuth section with stagger — disabled for now, Google/GitHub not needed for ordering ──
const OAuthSection = (_props: { context: "login" | "register" }) => null;

// ─────────────────────────────────────────────────────────────────────────────
// Main AuthSidebar component
// ─────────────────────────────────────────────────────────────────────────────
const AuthSidebar = () => {
  const { isOpen, view, close } = useAuthSidebarStore();
  const { setAuthToken, updateUser } = useUserStore();

  const [currentView, setCurrentView] = useState<AuthView>(view);
  const [isLoading, setIsLoading] = useState(false);

  const [showLoginPw, setShowLoginPw] = useState(false);
  const [showRegPw, setShowRegPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [regData, setRegData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [forgotEmail, setForgotEmail] = useState("");

  const getStrength = (pw: string) => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (pw.length >= 12) s++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
    if (/\d/.test(pw)) s++;
    if (/[^a-zA-Z\d]/.test(pw)) s++;
    return s;
  };
  const strength = getStrength(regData.password);
  const strengthColor =
    strength <= 1
      ? "bg-destructive"
      : strength <= 3
        ? "bg-yellow-400"
        : "bg-green-500";
  const strengthText =
    strength <= 1 ? "Weak" : strength <= 3 ? "Medium" : "Strong";

  useEffect(() => {
    if (isOpen) {
      setCurrentView(view);
      setLoginData({ email: "", password: "" });
      setRegData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setForgotEmail("");
      setShowLoginPw(false);
      setShowRegPw(false);
      setShowConfirmPw(false);
      setLoginError(null);
      setRegisterError(null);
    }
  }, [isOpen, view]);

  /* const OAuthSectionOriginal = ({ context }: { context: "login" | "register" }) => (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-3"
    >
      <motion.div variants={itemSlide}>
        <SidebarOAuthBtn provider="google" disabled={isLoading} />
      </motion.div>
      <motion.div variants={itemSlide}>
        <SidebarOAuthBtn provider="github" disabled={isLoading} />
      </motion.div>
      <motion.div variants={itemSlide}>
        <Divider
          text={
            context === "login"
              ? "or sign in with email"
              : "or register with email"
          }
        />
      </motion.div>
    </motion.div>
  ); */

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });
      if (error) throw error;
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
        toast.success("Welcome back!", { description: "Signed in successfully." });
        setTimeout(() => { close(); setIsLoading(false); }, 400);
      }
    } catch (err: unknown) {
      toast.error((err instanceof Error ? err.message : null) || "Invalid email or password.");
      setIsLoading(false);
    }
  };

  const LoginView = () => (
    <ViewWrap>
      <OAuthSection context="login" />
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        {/* Inline error */}
        <AnimatePresence>
          {loginError && (
            <motion.div
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -6, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive"
            >
              <AlertCircle className="size-4 mt-0.5 shrink-0" />
              <span>{loginError}</span>
            </motion.div>
          )}
        </AnimatePresence>
        <Field
          id="l-email"
          label="Email address"
          type="email"
          value={loginData.email}
          onChange={(v) => {
            setLoginData((p) => ({ ...p, email: v }));
            setLoginError(null);
          }}
          disabled={isLoading}
        />
        <Field
          id="l-password"
          label="Password"
          type={showLoginPw ? "text" : "password"}
          value={loginData.password}
          onChange={(v) => {
            setLoginData((p) => ({ ...p, password: v }));
            setLoginError(null);
          }}
          disabled={isLoading}
          rightSlot={
            <EyeToggle
              show={showLoginPw}
              toggle={() => setShowLoginPw((p) => !p)}
            />
          }
        />
        <div className="flex justify-end -mt-2">
          <button
            type="button"
            onClick={() => setCurrentView("forgot-password")}
            disabled={isLoading}
            className="text-xs font-semibold text-accent hover:underline"
          >
            Forgot password?
          </button>
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 rounded-lg font-bold uppercase tracking-wide"
        >
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Sign In"}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <button
          onClick={() => setCurrentView("register")}
          disabled={isLoading}
          className="font-bold text-primary hover:underline"
        >
          Create an account
        </button>
      </p>
      <p className="text-center">
        <Link
          href="/auth/signin"
          onClick={close}
          className="text-xs text-muted-foreground hover:text-accent underline underline-offset-2"
        >
          Go to full sign-in page →
        </Link>
      </p>
    </ViewWrap>
  );

  // ── Register ───────────────────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regData.password !== regData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      const supabase = createClient();
      const name = `${regData.firstName} ${regData.lastName}`.trim();
      const { error } = await supabase.auth.signUp({
        email: regData.email,
        password: regData.password,
        options: { data: { name } },
      });
      if (error) throw error;
      toast.success("Account created!", { description: "Please check your email to verify your account." });
      setCurrentView("login");
    } catch (err: unknown) {
      toast.error((err instanceof Error ? err.message : null) || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const RegisterView = () => (
    <ViewWrap>
      <OAuthSection context="register" />
      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Field
            id="r-first"
            label="First name"
            value={regData.firstName}
            onChange={(v) => setRegData((p) => ({ ...p, firstName: v }))}
            disabled={isLoading}
          />
          <Field
            id="r-last"
            label="Last name"
            value={regData.lastName}
            onChange={(v) => setRegData((p) => ({ ...p, lastName: v }))}
            disabled={isLoading}
          />
        </div>
        <Field
          id="r-email"
          label="Email address"
          type="email"
          value={regData.email}
          onChange={(v) => setRegData((p) => ({ ...p, email: v }))}
          disabled={isLoading}
        />
        <div className="flex flex-col gap-1">
          <Field
            id="r-pw"
            label="Password"
            type={showRegPw ? "text" : "password"}
            value={regData.password}
            onChange={(v) => setRegData((p) => ({ ...p, password: v }))}
            disabled={isLoading}
            rightSlot={
              <EyeToggle
                show={showRegPw}
                toggle={() => setShowRegPw((p) => !p)}
              />
            }
          />
          {regData.password && (
            <div className="mt-1 space-y-1.5">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((l) => (
                  <motion.div
                    key={l}
                    className={`h-1 flex-1 rounded-full ${l <= strength ? strengthColor : "bg-muted"}`}
                    animate={{ scaleX: 1 }}
                    initial={{ scaleX: 0 }}
                    transition={{ duration: 0.25, delay: l * 0.04 }}
                  />
                ))}
              </div>
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-0.5">
                  <Req
                    met={regData.password.length >= 8}
                    text="8+ characters"
                  />
                  <Req
                    met={
                      /[A-Z]/.test(regData.password) &&
                      /[a-z]/.test(regData.password)
                    }
                    text="Upper & lowercase"
                  />
                  <Req
                    met={/\d/.test(regData.password)}
                    text="Contains number"
                  />
                </div>
                <span
                  className={`text-xs font-bold ${strength <= 1 ? "text-destructive" : strength <= 3 ? "text-yellow-500" : "text-green-500"}`}
                >
                  {strengthText}
                </span>
              </div>
            </div>
          )}
        </div>
        <Field
          id="r-confirm"
          label="Confirm password"
          type={showConfirmPw ? "text" : "password"}
          value={regData.confirmPassword}
          onChange={(v) => setRegData((p) => ({ ...p, confirmPassword: v }))}
          disabled={isLoading}
          rightSlot={
            <EyeToggle
              show={showConfirmPw}
              toggle={() => setShowConfirmPw((p) => !p)}
            />
          }
        />
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 rounded-lg font-bold uppercase tracking-wide mt-1"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Create Account"
          )}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button
          onClick={() => setCurrentView("login")}
          disabled={isLoading}
          className="font-bold text-primary hover:underline"
        >
          Sign In
        </button>
      </p>
      <p className="text-center">
        <Link
          href="/auth/signup"
          onClick={close}
          className="text-xs text-muted-foreground hover:text-accent underline underline-offset-2"
        >
          Go to full registration page →
        </Link>
      </p>
    </ViewWrap>
  );

  // ── Forgot password ────────────────────────────────────────────────────────
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      toast.success("Reset link sent!", { description: "Check your inbox." });
    } catch (err: unknown) {
      toast.error((err instanceof Error ? err.message : null) || "Could not send reset link.");
    } finally {
      setIsLoading(false);
    }
  };

  const ForgotView = () => (
    <ViewWrap>
      <p className="text-sm text-muted-foreground text-center">
        Enter your email and we&apos;ll send you a password reset link.
      </p>
      <form onSubmit={handleForgot} className="flex flex-col gap-4">
        <Field
          id="f-email"
          label="Email address"
          type="email"
          value={forgotEmail}
          onChange={setForgotEmail}
          disabled={isLoading}
        />
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 rounded-lg font-bold uppercase tracking-wide"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </form>
      <div className="text-center">
        <button
          type="button"
          onClick={() => setCurrentView("login")}
          disabled={isLoading}
          className="text-sm font-semibold text-primary hover:underline"
        >
          ← Back to Sign In
        </button>
      </div>
    </ViewWrap>
  );

  const titleMap: Record<AuthView, string> = {
    login: "Sign In",
    register: "Create Account",
    "forgot-password": "Reset Password",
  };

  const renderContent = () => {
    switch (currentView) {
      case "login":
        return LoginView();
      case "register":
        return RegisterView();
      case "forgot-password":
        return ForgotView();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={close}>
      <SheetContent
        side="right"
        className="flex flex-col w-full sm:max-w-[460px] p-0 border-none rounded-2xl overflow-hidden inset-y-2.5 right-2.5 h-[calc(100vh-20px)] shadow-2xl [&>button:last-child]:hidden"
      >
        {/* Header */}
        <SheetHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-border bg-background sticky top-0 z-10 space-y-0 shrink-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18 }}
            >
              <SheetTitle className="text-lg font-bold text-foreground">
                {titleMap[currentView]}
              </SheetTitle>
            </motion.div>
          </AnimatePresence>
          <motion.button
            onClick={close}
            className="inline-flex items-center justify-center size-9 rounded-full bg-muted hover:bg-muted/70 transition-colors"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <X className="size-4 text-foreground" />
          </motion.button>
        </SheetHeader>

        {/* Scrollable body — vertically centered */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col justify-center min-h-full px-6 py-8">
            <div className="w-full max-w-sm mx-auto">
              <AnimatePresence mode="wait">
                <div key={currentView}>{renderContent()}</div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AuthSidebar;
