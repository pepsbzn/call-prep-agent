import Link from "next/link";
import { isAdminAuthed } from "@/lib/auth";
import AdminPasswordForm from "@/components/AdminPasswordForm";
import UploadForm from "@/components/UploadForm";

export const dynamic = "force-dynamic";

export default function UploadPage() {
  const authed = isAdminAuthed();

  return (
    <main>
      <div className="topbar">
        <nav className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/gallery">Gallery</Link>
        </nav>
      </div>

      <h1 className="headline">
        Up<span className="accent">load</span>
      </h1>

      {authed ? (
        <UploadForm />
      ) : (
        <>
          <p className="muted">Admin only. This is not the door you&apos;re looking for.</p>
          <AdminPasswordForm />
        </>
      )}
    </main>
  );
}
