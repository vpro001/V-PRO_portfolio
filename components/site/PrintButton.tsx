"use client";

import { Printer } from "lucide-react";

export default function PrintButton({ label = "Print / save as PDF" }: { label?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className="btn btn-primary">
      <Printer className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}
