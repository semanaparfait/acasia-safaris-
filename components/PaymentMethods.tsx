import { Landmark, Banknote, ShieldCheck } from "lucide-react";
import { SiVisa, SiPaypal, SiAirtel } from "react-icons/si";

// The payment methods we accept (see PAYMENT_METHODS in lib/types.ts).
// "Card" is shown as Visa + Mastercard, "Mobile Money" as MTN MoMo + Airtel Money.
// Brand marks come from Simple Icons (react-icons/si); the MTN mark is the
// official logo from Wikimedia Commons (MTN_Logo.svg).

const Visa = () => (
  <SiVisa className="h-6 w-auto" color="#1A1F71" aria-hidden="true" />
);

// Official Mastercard mark (Simple Icons only has a one-colour version)
const Mastercard = () => (
  <svg viewBox="0 0 152 94" className="h-5 w-auto" aria-hidden="true">
    <circle cx="47" cy="47" r="47" fill="#EB001B" />
    <circle cx="105" cy="47" r="47" fill="#F79E1B" />
    <path d="M76 10a47 47 0 0 1 0 74a47 47 0 0 1 0-74z" fill="#FF5F00" />
  </svg>
);

const PayPal = () => (
  <>
    <SiPaypal className="h-4 w-auto" color="#003087" aria-hidden="true" />
    <span className="text-[13px] font-bold italic leading-none" aria-hidden="true">
      <span className="text-[#003087]">Pay</span>
      <span className="text-[#009CDE]">Pal</span>
    </span>
  </>
);

// Official MTN mark (blue oval + "MTN"), cropped to the oval
const MtnLogo = () => (
  <svg viewBox="14 63 172 73" className="h-5 w-auto" aria-hidden="true">
    <path
      fill="#00678F"
      d="M184.62,99.47c0,19.27-37.88,34.89-84.6,34.89c-46.73,0-84.61-15.62-84.61-34.89s37.88-34.88,84.61-34.88C146.74,64.59,184.62,80.2,184.62,99.47"
    />
    <polygon fill="#FFFFFF" points="45.81,116.69 54.56,81.8 68.54,81.8 68.54,102.12 77.73,81.8 92.16,81.8 83.42,116.69 74.23,116.69 79.47,94.17 68.54,116.69 61.12,116.69 61.12,94.17 55.42,116.69" />
    <polygon fill="#ED1D24" points="94.99,117.13 96.3,112.27 106.36,112.27 105.04,117.13" />
    <polygon fill="#FFFFFF" points="117.5,116.69 126.24,81.8 136.3,81.8 140.68,100.36 145.48,81.8 154.66,81.8 145.92,116.69 136.3,116.69 131.49,97.7 126.68,116.69" />
    <polygon fill="#FFCB05" points="94.99,81.8 92.8,90.64 101.99,90.64 97.04,109.81 107.09,109.81 112.05,90.64 121.23,90.64 123.41,81.8" />
  </svg>
);

const MtnMomo = () => (
  <>
    <MtnLogo />
    <span className="text-[12px] font-extrabold text-[#00678F] leading-none" aria-hidden="true">
      MoMo
    </span>
  </>
);

const AirtelMoney = () => (
  <>
    <SiAirtel className="h-5 w-auto" color="#FFFFFF" aria-hidden="true" />
    <span className="flex flex-col leading-none text-white" aria-hidden="true">
      <span className="text-[11px] font-bold">airtel</span>
      <span className="text-[7px] font-semibold tracking-[0.15em] uppercase">money</span>
    </span>
  </>
);

type Props = {
  title: string;
  secureNote: string;
  bankTransferLabel: string;
  cashLabel: string;
};

const badge =
  "h-9 min-w-[62px] px-2.5 rounded-md flex items-center justify-center gap-1.5 shadow-sm ring-1 ring-black/5 transition-transform duration-300 hover:-translate-y-0.5";

export default function PaymentMethods({
  title,
  secureNote,
  bankTransferLabel,
  cashLabel,
}: Props) {
  const methods = [
    { name: "Visa", className: "bg-white", logo: <Visa /> },
    { name: "Mastercard", className: "bg-white", logo: <Mastercard /> },
    { name: "PayPal", className: "bg-white", logo: <PayPal /> },
    { name: "MTN Mobile Money", className: "bg-[#FFCB05]", logo: <MtnMomo /> },
    { name: "Airtel Money", className: "bg-[#E40000]", logo: <AirtelMoney /> },
    {
      name: bankTransferLabel,
      className: "bg-white text-[#0e1d16]",
      hasText: true,
      logo: (
        <>
          <Landmark size={15} className="text-[#0e1d16]" aria-hidden="true" />
          <span className="text-[11px] font-semibold whitespace-nowrap">{bankTransferLabel}</span>
        </>
      ),
    },
    {
      name: cashLabel,
      className: "bg-white text-[#0e1d16]",
      hasText: true,
      logo: (
        <>
          <Banknote size={15} className="text-[#2f7d4f]" aria-hidden="true" />
          <span className="text-[11px] font-semibold whitespace-nowrap">{cashLabel}</span>
        </>
      ),
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
      <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-500 shrink-0">
        {title}
      </span>
      <ul className="flex flex-wrap items-center gap-2.5" aria-label={title}>
        {methods.map((m) => (
          <li key={m.name} title={m.name} className={`${badge} ${m.className}`}>
            {m.logo}
            {!m.hasText && <span className="sr-only">{m.name}</span>}
          </li>
        ))}
      </ul>
      <span className="flex items-center gap-2 text-xs text-zinc-400 lg:ml-auto">
        <ShieldCheck size={16} className="text-[#c5a86d] shrink-0" aria-hidden="true" />
        {secureNote}
      </span>
    </div>
  );
}
