"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GuestbookForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message }),
      });
      if (res.ok) {
        setName("");
        setMessage("");
        router.refresh();
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Couldn't post that. Try again.");
      }
    } catch {
      setError("Couldn't post that. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="gb-name">Name</label>
        <input
          id="gb-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="gb-message">Message</label>
        <textarea
          id="gb-message"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={1000}
          required
        />
      </div>
      <button type="submit" disabled={busy}>
        {busy ? "Posting…" : "Sign it"}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
