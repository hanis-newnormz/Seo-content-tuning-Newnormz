import { Suspense } from "react";

import { LoginForm } from "@/app/login/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between bg-gradient-to-br from-primary to-indigo-950 p-12 text-primary-foreground lg:flex">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
            <span className="text-base">SR</span>
          </div>
          SEO Review Board
        </div>
        <div className="max-w-md space-y-4">
          <p className="text-3xl font-semibold leading-tight text-balance">
            Replace PowerPoint decks with a client-ready review workspace.
          </p>
          <p className="text-primary-foreground/80">
            Present screenshots, annotated recommendations, and before/after content
            comparisons in one polished, shareable link — and track client approvals
            without a single slide.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/60">
          © {new Date().getFullYear()} SEO Content Review Board
        </p>
      </div>
      <div className="flex w-full flex-1 items-center justify-center bg-background p-8 lg:w-1/2">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
