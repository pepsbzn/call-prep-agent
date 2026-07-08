"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DriveSyncButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function handleClick() {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/drive/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setIsError(false);
        setMessage(
          data.imported.length > 0
            ? `Imported ${data.imported.length}: ${data.imported.join(", ")}`
            : "No new files found in the Drive folder."
        );
        router.refresh();
      } else {
        setIsError(true);
        setMessage(data.error ?? "Sync failed.");
      }
    } catch {
      setIsError(true);
      setMessage("Sync failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 560 }}>
      <p className="muted" style={{ marginBottom: "0.75rem" }}>
        Photos dropped in the connected Google Drive folder are pulled in automatically on a
        schedule. Click below to sync right now instead of waiting.
      </p>
      <button type="button" onClick={handleClick} disabled={busy}>
        {busy ? "Syncing…" : "Sync Google Drive now"}
      </button>
      {message && <p className={isError ? "error" : "success"}>{message}</p>}
    </div>
  );
}
