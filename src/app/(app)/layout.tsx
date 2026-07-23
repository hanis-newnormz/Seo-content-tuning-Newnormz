import { redirect } from "next/navigation";

import { Sidebar } from "@/components/shared/sidebar";
import { UserMenu } from "@/components/shared/user-menu";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur">
          <div className="md:hidden flex items-center gap-2 font-semibold">SEO Review Board</div>
          <div />
          <UserMenu name={profile?.full_name ?? ""} email={user.email ?? ""} />
        </header>
        <main className="flex-1 bg-background">{children}</main>
      </div>
    </div>
  );
}
