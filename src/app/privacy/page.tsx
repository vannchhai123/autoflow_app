import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-6 max-w-4xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
      >
        <ArrowLeft className="size-4" /> Back to ClipFlow
      </Link>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">Last updated: October 2026</p>
          </div>
        </div>

        <section className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <h2 className="text-lg font-semibold text-foreground">1. Overview</h2>
          <p>
            ClipFlow ("we", "our", or "us") provides a multi-platform video publishing, scheduling, and
            analytics platform. This Privacy Policy explains how we collect, store, protect, and use
            information when you connect social media accounts and use our services.
          </p>
        </section>

        <section className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <h2 className="text-lg font-semibold text-foreground">2. Social Media Account Permissions</h2>
          <p>
            When you connect a social media account (such as YouTube, TikTok, Instagram, Facebook, or
            LinkedIn), we use industry-standard OAuth 2.0 authorization. ClipFlow never receives or
            stores your social media account passwords.
          </p>
          <p>
            We only access the permissions necessary to provide our core publishing services:
            uploading video content on your behalf, scheduling publications, and displaying channel
            performance analytics (such as subscriber counts and video views).
          </p>
        </section>

        <section className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <h2 className="text-lg font-semibold text-foreground">3. Data Retention and Security</h2>
          <p>
            All OAuth tokens are securely encrypted. You may disconnect your social accounts at any
            time through the Settings &gt; Accounts page, which permanently revokes and deletes the
            associated authentication tokens.
          </p>
        </section>

        <section className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <h2 className="text-lg font-semibold text-foreground">4. Contact Information</h2>
          <p>
            If you have questions regarding this Privacy Policy or your data, please contact our
            developer team at support@clipflow.app.
          </p>
        </section>
      </div>
    </div>
  );
}
