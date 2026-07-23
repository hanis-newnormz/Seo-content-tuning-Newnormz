import Link from "next/link";
import { CheckCircle2, LayoutDashboard } from "lucide-react";

import { UserMenu } from "@/components/layout/user-menu";

export function AppShell({
  children,
  profile,
}: {
  children: React.ReactNode;
  profile: { full_name: string | null; email: string };
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-primary">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
            <span className="hidden sm:inline">SEO Content Review Board</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          </nav>

          <UserMenu name={profile.full_name} email={profile.email} />
        </div>
      </header>
      <main className="container py-8">{children}</main>
    </div>
  );
}
