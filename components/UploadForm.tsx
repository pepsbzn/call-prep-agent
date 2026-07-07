"use client";

import { useRef, useState } from "react";

export default function UploadForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function pick(selected: File | undefined | null) {
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      setError("That's not an image.");
      return;
    }
    setError("");
    setSuccess("");
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!file) {
      setError("Pick an image first.");
      return;
    }
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("caption", caption);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (res.ok) {
        setSuccess("Uploaded. It's live in the gallery.");
        setFile(null);
        setPreview(null);
        setCaption("");
        if (inputRef.current) inputRef.current.value = "";
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Upload failed.");
      }
    } catch {
      setError("Upload failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card" style={{ maxWidth: 560 }} onSubmit={handleSubmit}>
      <div
        className={`dropzone${dragging ? " dragging" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          pick(e.dataTransfer.files?.[0]);
        }}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Selected file preview" />
        ) : (
          <>
            <strong>Drop an image here</strong>
            <span>or click to choose a file</span>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => pick(e.target.files?.[0])}
        />
      </div>

      <div className="field" style={{ marginTop: "1rem" }}>
        <label htmlFor="caption">Caption</label>
        <input
          id="caption"
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={200}
          placeholder="Every ache down there has a story…"
          required
        />
      </div>

      <button type="submit" disabled={busy}>
        {busy ? "Uploading…" : "Publish to gallery"}
      </button>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </form>
  );
}
