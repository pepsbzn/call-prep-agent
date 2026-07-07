"use client";

import { useEffect, useState } from "react";

const DAY_MS = 24 * 60 * 60 * 1000;
const KEY = "gallery-countdown-start";

// Purely cosmetic urgency timer: 24h from the first gallery visit in this
// browser session (sessionStorage), so it resets every session. Nothing
// happens when it hits zero.
export default function Countdown() {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    let start = Number(sessionStorage.getItem(KEY));
    if (!start) {
      start = Date.now();
      sessionStorage.setItem(KEY, String(start));
    }
    const tick = () => {
      const left = start + DAY_MS - Date.now();
      setRemaining(left > 0 ? left : DAY_MS); // loop instead of expiring
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  if (remaining === null) {
    return <div className="countdown">Access expires in 24:00:00</div>;
  }

  const totalSeconds = Math.floor(remaining / 1000);
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");

  return (
    <div className="countdown">
      Access expires in {h}:{m}:{s}
    </div>
  );
}
