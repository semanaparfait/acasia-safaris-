"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";
import logo from "@/public/logo2.png";
import { inputClass, labelClass } from "../components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  // No auth yet – any credentials take you to the dashboard
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/admin"), 600);
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
        <form onSubmit={submit} className="w-full max-w-sm">
          <Image src={logo} alt="Acacia Safaris" className="h-12 w-auto mb-8" />
          <h2 className="text-2xl font-semibold text-[#0a120b]">Welcome back</h2>
          <p className="text-sm text-[#0a120b]/55 mt-1 mb-8">Sign in to the admin panel.</p>

          <div className="space-y-4">
            <div>
              <label className={labelClass} htmlFor="email">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#0a120b]/35" />
                <input id="email" type="email" required defaultValue="admin@acaciasafaris.com" className={`${inputClass} pl-9`} />
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="password">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#0a120b]/35" />
                <input id="password" type={show ? "text" : "password"} required defaultValue="password" className={`${inputClass} pl-9 pr-10`} />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0a120b]/40" aria-label="Toggle password">
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-[#0a120b]/65">
                <input type="checkbox" defaultChecked className="accent-[#2E7D5B]" /> Remember me
              </label>
              <a href="#" className="text-[#2E7D5B] hover:underline">Forgot password?</a>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#12231a] text-white py-3 text-sm font-medium hover:bg-[#1F5A42] transition-colors disabled:opacity-70 cursor-pointer"
            >
              {loading ? "Signing in…" : <>Sign in <ArrowRight className="size-4" /></>}
            </button>
          </div>
          <p className="text-xs text-[#0a120b]/40 mt-8 text-center">Demo mode: any email and password will work.</p>
        </form>
      </div>
    </div>
  );
}
