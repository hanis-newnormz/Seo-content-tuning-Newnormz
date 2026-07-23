import Link from "next/link";
import { CheckCircle2, LineChart, MessageSquareText, MousePointerClick } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";

const HIGHLIGHTS = [
  {
    icon: MousePointerClick,
    title: "Pin recommendations directly on screenshots",
    body: "Click any section of a page screenshot to attach an SEO recommendation — no more PowerPoint callouts.",
  },
  {
    icon: MessageSquareText,
    title: "Built for client conversations",
    body: "A clean, presentation-ready view clients can approve, comment on, or request changes to.",
  },
  {
    icon: LineChart,
    title: "Track approval progress",
    body: "See how many recommendations are approved per page and per project at a glance.",
  },
];

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 0, transparent 35%), radial-gradient(circle at 80% 70%, hsl(172 66% 60%) 0, transparent 40%)",
          }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            SEO Content Review Board
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <h1 className="text-3xl font-semibold leading-tight text-balance">
            Present SEO recommendations like a premium agency — not a slide deck.
          </h1>
          <div className="space-y-6">
            {HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="text-sm text-primary-foreground/75">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-primary-foreground/60">
          Review, present, and approve — this platform never edits or deploys your website.
        </p>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-1 lg:hidden">
            <div className="flex items-center gap-2 text-lg font-semibold text-primary">
              <CheckCircle2 className="h-5 w-5" />
              SEO Content Review Board
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
            <p className="text-sm text-muted-foreground">
              Sign in to manage your clients&apos; SEO review projects.
            </p>
          </div>
          <LoginForm />
          <p className="text-center text-xs text-muted-foreground">
            Reviewing recommendations from a link your agency sent you? You don&apos;t need an
            account — just{" "}
            <Link href="/" className="underline underline-offset-2">
              open the link they shared
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
