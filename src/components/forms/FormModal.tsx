"use client";

import { ReactNode, useState } from "react";

interface FormModalProps {
  buttonLabel: string;
  title: string;
  children: (close: () => void) => ReactNode;
  buttonClassName?: string;
}

export default function FormModal({
  buttonLabel,
  title,
  children,
  buttonClassName,
}: FormModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          buttonClassName ??
          "text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
        }
      >
        {buttonLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close modal"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">{title}</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                ×
              </button>
            </div>
            {children(() => setOpen(false))}
          </div>
        </div>
      )}
    </>
  );
}
