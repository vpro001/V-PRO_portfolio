"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";

/** Live clock in Victor's timezone — a quiet way of saying when he's awake. */
export default function LocalTime({ className = "" }: { className?: string }) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const format = () =>
      new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: site.timeZone,
      }).format(new Date());
    setTime(format());
    const id = setInterval(() => setTime(format()), 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className={`tabular ${className}`} suppressHydrationWarning>
      {time || "--:--"} {site.timeZoneLabel}
    </span>
  );
}
