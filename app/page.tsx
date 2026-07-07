import Link from "next/link";
import { isSiteAuthed } from "@/lib/auth";
import PasswordForm from "@/components/PasswordForm";

export const dynamic = "force-dynamic";

// Verbatim bio copy — rendered as-is, paragraph by paragraph.
const BIO = `Six-one. Team USA figure skater. Ivy League brain, degenerate habits.

I used to glide across ice in front of judges who scored my every landing. Now I want you to judge something else.

Years of quad attempts wrecked my sesamoids — every ache down there has a story, and I'll tell you all of them if you ask nicely. Hobbit-hairy, hard-arched, worked over by a decade of blades and bruises. Not pretty in the pedicure-ad way. Pretty in the "this foot has been through some things" way.

I eat spinach out of the bag over the sink like a raccoon. I'm at Barry's by 6am punishing myself for reasons I don't examine too closely. My shoulder hair has its own fan club.

You've read this far. You know what you came for.`;

export default function HomePage() {
  const authed = isSiteAuthed();
  // Cache-buster so the teaser rotates on every page load.
  const teaserSrc = `/api/teaser?r=${Date.now()}`;

  return (
    <main>
      <h1 className="headline">
        Judge <span className="accent">something else.</span>
      </h1>

      <div className="bio">
        {BIO.split("\n\n").map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      <div className="teaser">
        {/* Always served blurred by the server — a preview, never the goods. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={teaserSrc} alt="Blurred preview from the gallery" />
        <p className="teaser-label">A taste. The rest is behind the door.</p>
      </div>

      {authed ? (
        <div className="card">
          <p>
            You&apos;re in. <Link href="/gallery">Enter the gallery &rarr;</Link>
          </p>
        </div>
      ) : (
        <PasswordForm />
      )}
    </main>
  );
}
