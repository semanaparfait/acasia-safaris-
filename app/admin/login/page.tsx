"use client";

// Admin login, in two steps:
//   1. company email + password
//   2. a 6 digit code emailed to the personal email (checked as soon as it is typed).
//      "Trust this device" skips step 2 on this browser for 30 days.
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore, type LoginChallenge } from "@/store/authStore";
import logo from "@/public/logo2.png";
import { inputClass, labelClass } from "../components/ui";
import CodeInput from "../components/CodeInput";

export default function LoginPage() {
  const router = useRouter();
  const { login, verifyLogin, resendLoginCode } = useAuthStore();

  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [challenge, setChallenge] = useState<LoginChallenge | null>(null); // set = step 2
  const [code, setCode] = useState("");
  const [remember, setRemember] = useState(false);

  // Step 1. Only workers with "Admin access" can log in (see Admin > Workers)
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const next = await login(email, password);
      if (next) {
        setChallenge(next);
        setCode("");
        setLoading(false);
      } else {
        router.replace("/admin"); // a trusted browser: no code needed
      }
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  // Step 2: checked as soon as the 6th digit is typed or pasted
  const changeCode = async (next: string) => {
    setCode(next);
    setError("");
    if (next.length !== 6 || !challenge) return;
    setLoading(true);
    try {
      await verifyLogin(challenge.challenge, next, remember);
      router.replace("/admin");
    } catch (err) {
      setCode(""); // empty the boxes so it can be typed again
      setError((err as Error).message);
      setLoading(false);
    }
  };

  const resend = async () => {
    if (!challenge) return;
    try {
      await resendLoginCode(challenge.challenge);
      toast.success("A new code is on its way");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const backToPassword = () => {
    setChallenge(null);
    setCode("");
    setError("");
    setPassword("");
  };

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
        {!challenge ? (
          <form onSubmit={submit} className="w-full max-w-sm">
            <Image src={logo} alt="Acacia Safaris" className="h-12 w-auto mb-8" />
            <h2 className="text-2xl font-semibold text-[#0a120b]">Welcome back</h2>
            <p className="text-sm text-[#0a120b]/55 mt-1 mb-8">Sign in to the admin panel.</p>

            <div className="space-y-4">
              <div>
                <label className={labelClass} htmlFor="email">Company email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#0a120b]/35" />
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="firstname@acaciasafaris.com"
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className={labelClass} htmlFor="password">Password</label>
                  <Link href="/admin/forgot-password" className="text-xs text-[#2E7D5B] hover:underline mb-1.5">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#0a120b]/35" />
                  <input
                    id="password"
                    type={show ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputClass} pl-9 pr-10`}
                  />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0a120b]/40" aria-label="Show or hide password">
                    {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#12231a] text-white py-3 text-sm font-medium hover:bg-[#1F5A42] transition-colors disabled:opacity-70 cursor-pointer"
              >
                {loading ? "Signing in…" : <>Continue <ArrowRight className="size-4" /></>}
              </button>
            </div>
          </form>
        ) : (
          <div className="w-full max-w-sm">
            <Image src={logo} alt="Acacia Safaris" className="h-12 w-auto mb-8" />
            <span className="w-11 h-11 rounded-xl bg-[#12231a] text-[#c5a86d] flex items-center justify-center mb-4">
              <ShieldCheck className="size-5" />
            </span>
            <h2 className="text-2xl font-semibold text-[#0a120b]">Check your email</h2>
            <p className="text-sm text-[#0a120b]/55 mt-1">For your security, enter the 6 digit code we just sent.</p>

            <div className="mt-5 mb-6 flex items-center gap-3 rounded-xl border border-[#0a120b]/10 bg-white px-4 py-3">
              <Mail className="size-4 shrink-0 text-[#2E7D5B]" />
              <p className="text-sm text-[#0a120b]/60 min-w-0">
                Sent to <span className="font-semibold text-[#0a120b] break-all">{challenge.sentTo}</span>
              </p>
            </div>

            <CodeInput value={code} onChange={changeCode} disabled={loading} invalid={Boolean(error)} />

            <label className="mt-5 flex items-center gap-2.5 text-sm text-[#0a120b]/70 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="size-4 rounded accent-[#12231a]"
              />
              Trust this device for 30 days
            </label>

            <div className="min-h-6 mt-4 text-sm">
              {loading ? (
                <span className="inline-flex items-center gap-2 text-[#0a120b]/60">
                  <Loader2 className="size-4 animate-spin" /> Checking code…
                </span>
              ) : (
                error && <span className="text-red-600">{error}</span>
              )}
            </div>

            <p className="mt-2 text-xs text-[#0a120b]/55">
              No email? Check your spam folder, or{" "}
              <button type="button" onClick={resend} disabled={loading} className="text-[#2E7D5B] hover:underline cursor-pointer">
                send a new code
              </button>
              .
            </p>

            <button type="button" onClick={backToPassword} className="mt-6 inline-flex items-center gap-1.5 text-sm text-[#0a120b]/55 hover:text-[#0a120b] cursor-pointer">
              <ArrowLeft className="size-4" /> Use another account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
