import Link from "next/link";
import { cookies } from "next/headers";
import { isSiteAuthed } from "@/lib/auth";
import { listImages, isRecent, recordView, viewCount } from "@/lib/images";
import Countdown from "@/components/Countdown";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const authed = isSiteAuthed();
  const images = await listImages();
  const sessionId = cookies().get("session_id")?.value ?? "anonymous";

  // Unique-session view tracking, entirely server-side.
  await Promise.all(images.map((img) => recordView(img.id, sessionId)));
  const counts = await Promise.all(images.map((img) => viewCount(img.id)));

  return (
    <main>
      <div className="topbar">
        <nav className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/guestbook">Guestbook</Link>
        </nav>
        <Countdown />
      </div>

      <h1 className="headline">
        The <span className="accent">Gallery</span>
      </h1>

      {!authed && (
        <div className="locked-banner">
          Locked. You&apos;re seeing the blurred versions &mdash;{" "}
          <Link href="/">enter the password</Link> to see everything.
        </div>
      )}

      {images.length === 0 ? (
        <p className="muted">Nothing here yet. Check back soon.</p>
      ) : (
        <div className="grid">
          {images.map((img, i) => (
            <figure className="tile" key={img.id}>
              {isRecent(img) && <span className="badge">Recently added</span>}
              {/* Served by /api/image/[id], which blurs server-side unless
                  the request carries a valid auth cookie. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/image/${img.id}`} alt={img.caption} loading="lazy" />
              <figcaption className="tile-body">
                <div className="caption">{img.caption}</div>
                <div className="views">
                  {counts[i]} {counts[i] === 1 ? "person has" : "people have"} seen this
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </main>
  );
}
