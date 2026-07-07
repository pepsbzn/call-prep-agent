import Link from "next/link";
import { redirect } from "next/navigation";
import { isSiteAuthed } from "@/lib/auth";
import { listEntries } from "@/lib/guestbook";
import GuestbookForm from "@/components/GuestbookForm";

export const dynamic = "force-dynamic";

export default async function GuestbookPage() {
  // Guestbook only exists behind the gallery unlock.
  if (!isSiteAuthed()) {
    redirect("/");
  }

  const entries = await listEntries();

  return (
    <main>
      <div className="topbar">
        <nav className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/gallery">Gallery</Link>
        </nav>
      </div>

      <h1 className="headline">
        Guest<span className="accent">book</span>
      </h1>
      <p className="muted">Say something. No takebacks.</p>

      <GuestbookForm />

      <section style={{ marginTop: "2.5rem" }}>
        {entries.length === 0 ? (
          <p className="muted">No entries yet. Be the first.</p>
        ) : (
          entries.map((entry, i) => (
            <article className="entry" key={`${entry.timestamp}-${i}`}>
              <div className="entry-meta">
                <strong>{entry.name}</strong>
                {new Date(entry.timestamp).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </div>
              <p>{entry.message}</p>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
