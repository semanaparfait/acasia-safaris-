"use client";

import { useEffect, useRef } from "react";

// Six boxes, one digit each. Typing moves to the next box, Backspace goes back,
// and pasting (or the phone's "code from SMS/email" suggestion) fills every box at once.
// The digits always fill from the left, so clicking any box goes to the next empty one.
export default function CodeInput({
  value,
  onChange,
  disabled,
  invalid,
}: {
  value: string;
  onChange: (code: string) => void;
  disabled: boolean;
  invalid: boolean;
}) {
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const next = Math.min(value.length, 5); // the box being typed in

  // Keep the cursor in the right box (also after a wrong code empties them)
  useEffect(() => {
    if (!disabled) boxes.current[next]?.focus();
  }, [next, disabled]);

  const type = (text: string) => {
    const digits = text.replace(/\D/g, "");
    if (digits) onChange((value + digits).slice(0, 6));
  };

  return (
    <div className="flex justify-between gap-2" onPaste={(e) => {
      e.preventDefault();
      onChange(e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6));
    }}>
      {Array.from({ length: 6 }, (_, i) => {
        const digit = value[i] ?? "";
        return (
          <input
            key={i}
            ref={(el) => { boxes.current[i] = el; }}
            value={digit}
            disabled={disabled}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            aria-label={`Digit ${i + 1} of 6`}
            onFocus={() => i !== next && boxes.current[next]?.focus()}
            onChange={(e) => type(e.target.value.slice(digit ? 1 : 0))}
            onKeyDown={(e) => {
              if (e.key === "Backspace") {
                e.preventDefault();
                onChange(value.slice(0, -1));
              }
            }}
            className={`size-12 sm:size-14 rounded-xl border bg-white text-center text-xl sm:text-2xl font-semibold text-[#0a120b] outline-none transition-all caret-[#c5a86d] disabled:opacity-60 ${
              invalid
                ? "border-red-400 ring-4 ring-red-100"
                : digit
                  ? "border-[#12231a]/40"
                  : "border-[#0a120b]/15"
            } focus:border-[#c5a86d] focus:ring-4 focus:ring-[#c5a86d]/20`}
          />
        );
      })}
    </div>
  );
}
