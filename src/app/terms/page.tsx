import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto min-h-screen max-w-4xl bg-background px-6 py-12 text-foreground">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to ClipFlow
      </Link>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText className="size-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
            <p className="text-sm text-muted-foreground">Last updated: October 2026</p>
          </div>
        </div>

        <section className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-lg font-semibold text-foreground">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using ClipFlow, you agree to comply with and be bound by these
            Terms of Service and all applicable laws and regulations governing video
            content creation and distribution.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-lg font-semibold text-foreground">
            2. Description of Service
          </h2>
          <p>
            ClipFlow provides multi-platform video management tools enabling users to
            upload, format, schedule, and publish digital video assets to authorized
            third-party platforms including YouTube, TikTok, Instagram, Facebook, and
            LinkedIn.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-lg font-semibold text-foreground">
            3. User Content & Platform Compliance
          </h2>
          <p>
            You are solely responsible for all video content and metadata published
            through your connected accounts. You agree to adhere to the community
            guidelines and terms of service of each target platform (e.g., YouTube
            Community Guidelines, TikTok Community Guidelines).
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-lg font-semibold text-foreground">4. Termination</h2>
          <p>
            You may terminate your use of ClipFlow at any time by disconnecting your
            social accounts and ceasing to use the application.
          </p>
        </section>
      </div>
    </div>
  );
}
