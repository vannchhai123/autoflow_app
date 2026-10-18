import type { ReactNode } from "react";
import { Captions, Film, Share2, Wand2 } from "lucide-react";

const FEATURES = [
  { icon: Wand2, text: "Turn a topic into a script and voiceover with AI" },
  { icon: Captions, text: "Auto-captions and B-roll in a 9:16 live preview" },
  { icon: Share2, text: "Schedule to YouTube Shorts, Reels and TikTok" },
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 size-96 rounded-full bg-fuchsia-300/20 blur-3xl" />
        <div className="relative flex items-center gap-2 text-lg font-semibold">
          <span className="grid size-9 place-items-center rounded-lg bg-white/20 backdrop-blur">
            <Film className="size-5" />
          </span>
          AutoClip
        </div>
        <div className="relative">
          <h2 className="text-4xl leading-tight font-semibold">
            Create short videos.
            <br />
            Publish everywhere.
          </h2>
          <ul className="mt-8 space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-white/90">
                <span className="grid size-8 shrink-0 place-items-center rounded-md bg-white/15">
                  <Icon className="size-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-white/70">
          © 2026 AutoClip
        </p>
      </aside>
      <main className="flex items-center justify-center p-6">{children}</main>
    </div>
  );
}
