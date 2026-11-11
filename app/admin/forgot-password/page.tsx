"use client";

// Forgot password, in 3 steps:
//   1. type the company email (the login)  -> a 6 digit code is emailed to the personal email
//   2. type the code                       -> checked by the server
//   3. type a new password                 -> saved, other devices are logged out, and you are logged in
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import logo from "@/public/logo2.png";
import { inputClass, labelClass } from "../components/ui";
import CodeInput from "../components/CodeInput";

type Step = "email" | "code" | "password";

const titles: Record<Step, [string, string]> = {
  email: ["Forgot your password?", "Type your company email. We will send a 6 digit code to your personal email."],
  code: ["Check your email", "Type the 6 digit code we sent you. It works for 15 minutes."],
  password: ["Choose a new password", "At least 8 characters. Other devices will be logged out."],
};

const buttonClass =
  "w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#12231a] text-white py-3 text-sm font-medium hover:bg-[#1F5A42] transition-colors disabled:opacity-70 cursor-pointer";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword, verifyResetCode, resetPassword } = useAuthStore();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState(""); // the personal email, partly hidden
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Runs one step, showing "loading" and any error from the server
  const run = async (action: () => Promise<void>) => {
    setLoading(true);
    setError("");
    try {
      await action();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const sendCode = (e?: React.FormEvent) => {
    e?.preventDefault();
    run(async () => {
      setSentTo(await forgotPassword(email.trim()));
      toast.success("Code sent");
      setCode("");
      setStep("code");
    });
  };

  // The code is checked as soon as the 6th digit is typed (or pasted): no button needed
  const changeCode = (next: string) => {
    setCode(next);
    setError("");
    if (next.length === 6) {
      run(async () => {
        try {
          await verifyResetCode(email.trim(), next);
          setStep("password");
        } catch (err) {
          setCode(""); // wrong code: empty the boxes so it can be typed again
          throw err;
        }
      });
    }
  };

  const savePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("The two passwords are not the same");
      return;
    }
    run(async () => {
      await resetPassword(email.trim(), code, password);
      toast.success("Password changed. You are logged in.");
      router.replace("/admin");
    });
  };

  const [title, subtitle] = titles[step];

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#f7f5f0]">
      <div className="relative hidden lg:block">
        <Image
          src="https://i.pinimg.com/1200x/e9/c3/52/e9c352c52a8ce750ec2aa30acecabb3c.jpg"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a120b] via-[#0a120b]/40 to-[#0a120b]/20" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#c5a86d] mb-3">Acacia Safaris</p>
          <h1 className="text-3xl font-semibold leading-tight max-w-md">Manage every journey, from first enquiry to the last sunset.</h1>
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Image src={logo} alt="Acacia Safaris" className="h-12 w-auto mb-8" />
          <h2 className="text-2xl font-semibold text-[#0a120b]">{title}</h2>
          <p className="text-sm text-[#0a120b]/55 mt-1 mb-8">{subtitle}</p>

          {step === "email" && (
            <form onSubmit={sendCode} className="space-y-4">
              <div>
                <label className={labelClass} htmlFor="email">Company email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#0a120b]/35" />
                  <input
                    id="email"
                    type="email"
                    required
                    autoFocus
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="firstname@acaciasafaris.com"
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button type="submit" disabled={loading} className={buttonClass}>
                {loading ? "Sending…" : <>Send code <ArrowRight className="size-4" /></>}
              </button>
            </form>
          )}

          {step === "code" && (
            <div className="space-y-5">
              <div className="-mt-3 flex items-center gap-3 rounded-xl border border-[#0a120b]/10 bg-white px-4 py-3">
                <Mail className="size-4 shrink-0 text-[#2E7D5B]" />
                <p className="text-sm text-[#0a120b]/60 min-w-0">
                  Sent to <span className="font-semibold text-[#0a120b] break-all">{sentTo}</span>
                </p>
              </div>
              <CodeInput value={code} onChange={changeCode} disabled={loading} invalid={Boolean(error)} />
              <div className="min-h-5 text-sm text-center">
                {loading ? (
                  <span className="inline-flex items-center gap-2 text-[#0a120b]/60">
                    <Loader2 className="size-4 animate-spin" /> Checking code…
                  </span>
                ) : (
                  error && <span className="text-red-600">{error}</span>
                )}
              </div>
              <p className="text-xs text-[#0a120b]/55 text-center">
                No email? Check your spam folder, or{" "}
                <button type="button" onClick={() => sendCode()} disabled={loading} className="text-[#2E7D5B] hover:underline cursor-pointer">
                  send a new code
                </button>
                .
              </p>
            </div>
          )}

          {step === "password" && (
            <form onSubmit={savePassword} className="space-y-4">
              <div>
                <label className={labelClass} htmlFor="password">New password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#0a120b]/35" />
                  <input
                    id="password"
                    type={show ? "text" : "password"}
                    required
                    autoFocus
                    minLength={8}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className={`${inputClass} pl-9 pr-10`}
                  />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0a120b]/40" aria-label="Show or hide password">
                    {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className={labelClass} htmlFor="confirm">Repeat new password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#0a120b]/35" />
                  <input
                    id="confirm"
                    type={show ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button type="submit" disabled={loading || password.length < 8 || !confirm} className={buttonClass}>
                {loading ? "Saving…" : <>Save new password <ArrowRight className="size-4" /></>}
              </button>
            </form>
          )}

          <Link href="/admin/login" className="mt-6 inline-flex items-center gap-1.5 text-sm text-[#0a120b]/55 hover:text-[#0a120b]">
            <ArrowLeft className="size-4" /> Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
