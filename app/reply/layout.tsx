import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";

// Quick reply (from an alert email / WhatsApp): never indexed, and the secret link in the
// address is not sent to other websites when a link on the page is clicked
export const metadata: Metadata = {
  title: "Quick reply · Acacia Safaris",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function ReplyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-dvh bg-[#f7f5f0] text-[#0a120b]">
      {children}
      <Toaster
        position="bottom-center"
        toastOptions={{ style: { background: "#0a120b", color: "#fff", fontSize: 14, borderRadius: 12 } }}
      />
    </div>
  );
}
