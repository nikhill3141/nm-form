"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Leaf, Loader2, Presentation } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { trpc } from "~/trpc/client";
import { GlassPanel } from "./ui-blocks";

const authToastClassName = "nm-toast";
const redirectToDashboard = () => {
  window.setTimeout(() => {
    window.location.href = "/dashboard";
  }, 650);
};

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const isSignup = mode === "signup";
  const utils = trpc.useUtils();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const signup = trpc.auth.createUserWithEmailAndPassword.useMutation({
    onSuccess: (data) => {
      setVerificationToken(data.verificationToken ?? "");
      toast.success("Account created.", {
        className: authToastClassName,
        description: "Verify your email to unlock the workspace.",
      });
    },
    onError: (error) => {
      toast.error("Could not create account.", {
        className: authToastClassName,
        description: error.message,
      });
    },
  });

  const signin = trpc.auth.signinUserWithEmailAndPassword.useMutation({
    onSuccess: async () => {
      toast.success("Signed in.", {
        className: authToastClassName,
        description: "Opening your dashboard...",
      });
      await utils.auth.getLogedInUser.invalidate();
      redirectToDashboard();
    },
    onError: (error) => {
      toast.error("Could not sign in.", {
        className: authToastClassName,
        description: error.message,
      });
    },
  });

  const guestLogin = trpc.auth.guestLogin.useMutation({
    onSuccess: async () => {
      toast.success("Guest demo loaded.", {
        className: authToastClassName,
        description: "Opening seeded dashboard...",
      });
      await utils.auth.getLogedInUser.invalidate();
      redirectToDashboard();
    },
    onError: (error) => {
      toast.error("Could not load guest demo.", {
        className: authToastClassName,
        description: error.message,
      });
    },
  });

  //verify email: adding the email in future
  const verifyEmail = trpc.auth.verifyEmail.useMutation({
    onSuccess: async () => {
      toast.success("Email verified.", {
        className: authToastClassName,
        description: "Opening your dashboard...",
      });
      await utils.auth.getLogedInUser.invalidate();
      redirectToDashboard();
    },
    onError: (error) => {
      toast.error("Could not verify email.", {
        className: authToastClassName,
        description: error.message,
      });
    },
  });

  //Reset password is change in email base verification in future 
  const requestPasswordReset = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: (data) => {
      setResetToken(data.resetToken ?? "");
      toast.info("Password reset link generated.", {
        className: authToastClassName,
        description: "Set your new password below.",
      });
    },
    onError: (error) => {
      toast.error("Could not generate reset link.", {
        className: authToastClassName,
        description: error.message,
      });
    },
  });

  const resetPassword = trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      setResetMode(false);
      setResetToken("");
      setNewPassword("");
      toast.success("Password updated.", {
        className: authToastClassName,
        description: "Sign in with your new password.",
      });
    },
    onError: (error) => {
      toast.error("Could not update password.", {
        className: authToastClassName,
        description: error.message,
      });
    },
  });

  const isPending =
    signup.isPending ||
    signin.isPending ||
    guestLogin.isPending ||
    verifyEmail.isPending ||
    requestPasswordReset.isPending ||
    resetPassword.isPending;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#06120d] px-6 py-24 text-white">
      <div className="forest-scene absolute inset-0 opacity-80" />
      <div className="absolute inset-0 bg-black/34" />
      <GlassPanel className="relative w-full max-w-md p-6">
        <Link className="mb-8 flex items-center gap-3" href="/">
          <span className="flex size-10 items-center justify-center rounded-lg bg-emerald-300 text-emerald-950">
            <Leaf className="size-5" />
          </span>
          <span className="font-semibold">NM Forms</span>
        </Link>
        <h1 className="text-3xl font-semibold">{isSignup ? "Create your workspace" : "Welcome back"}</h1>
        <p className="mt-3 text-sm leading-6 text-emerald-50/66">
          {isSignup ? "Start designing immersive forms with cinematic themes." : "Open your dashboard and continue building."}
        </p>
        {resetMode ? (
          <form
            className="mt-8 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!resetToken) {
                requestPasswordReset.mutate({ email });
                return;
              }
              resetPassword.mutate({ token: resetToken, password: newPassword });
            }}
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-emerald-50">Email</label>
              <input className="nm-input" onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required type="email" value={email} />
            </div>
            {resetToken && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium text-emerald-50">Reset token</label>
                  <input className="nm-input" onChange={(event) => setResetToken(event.target.value)} required value={resetToken} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-emerald-50">New password</label>
                  <input className="nm-input" onChange={(event) => setNewPassword(event.target.value)} placeholder="Enter a stronger password" required type="password" value={newPassword} />
                </div>
              </>
            )}
            <Button className="w-full bg-emerald-300 text-emerald-950 hover:bg-emerald-200" disabled={isPending} type="submit">
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {resetToken ? "Update password" : "Generate reset link"}
              <ArrowRight className="size-4" />
            </Button>
            <Button className="w-full border-white/12 bg-white/[0.07] text-emerald-50 hover:bg-white/[0.11]" onClick={() => setResetMode(false)} type="button" variant="outline">
              Back to sign in
            </Button>
          </form>
        ) : (
        <form
          className="mt-8 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (isSignup) {
              signup.mutate({ fullName, email, password });
              return;
            }
            signin.mutate({ email, password });
          }}
        >
          {isSignup && (
            <div>
              <label className="mb-2 block text-sm font-medium text-emerald-50">Full name</label>
              <input className="nm-input" onChange={(event) => setFullName(event.target.value)} placeholder="Nikhil Mehta" required value={fullName} />
            </div>
          )}
          <div>
            <label className="mb-2 block text-sm font-medium text-emerald-50">Email</label>
            <input className="nm-input" onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required type="email" value={email} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-emerald-50">Password</label>
            <input className="nm-input" onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required type="password" value={password} />
          </div>
          <Button className="w-full bg-emerald-300 text-emerald-950 hover:bg-emerald-200" disabled={isPending} type="submit">
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {isSignup ? "Create account" : "Sign in"}
            <ArrowRight className="size-4" />
          </Button>
          {verificationToken && (
            <Button
              className="w-full border-emerald-300/30 bg-emerald-300/12 text-emerald-50 hover:bg-emerald-300/18"
              disabled={isPending}
              onClick={() => {
                verifyEmail.mutate({ token: verificationToken });
              }}
              type="button"
              variant="outline"
            >
              {verifyEmail.isPending && <Loader2 className="size-4 animate-spin" />}
              Verify email and continue
            </Button>
          )}
        </form>
        )}
        {!isSignup && (
          <>
            {!resetMode && (
              <Button
                className="mt-3 w-full border-white/12 bg-white/[0.07] text-emerald-50 hover:bg-white/[0.11]"
                disabled={isPending}
                onClick={() => {
                  guestLogin.mutate();
                }}
                type="button"
                variant="outline"
              >
                {guestLogin.isPending ? <Loader2 className="size-4 animate-spin" /> : <Presentation className="size-4" />}
                Continue as guest
              </Button>
            )}
            {!resetMode && (
              <button
                className="mt-4 w-full text-center text-sm font-medium text-emerald-200 hover:text-emerald-100"
                onClick={() => {
                  setResetMode(true);
                }}
                type="button"
              >
                Forgot password?
              </button>
            )}
          </>
        )}
        <p className="mt-6 text-center text-sm text-emerald-50/62">
          {isSignup ? "Already have an account?" : "New to NM Forms?"}{" "}
          <Link className="font-medium text-emerald-200" href={isSignup ? "/login" : "/signup"}>
            {isSignup ? "Sign in" : "Create one"}
          </Link>
        </p>
      </GlassPanel>
    </main>
  );
}
