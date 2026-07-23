import { redirect } from "next/navigation";

import { Sidebar } from "@/components/shared/sidebar";
import { UserMenu } from "@/components/shared/user-menu";
import { Badge } from "@/components/ui/badge";
import { DEMO_MODE, DEMO_USER } from "@/lib/demo/config";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let name = DEMO_USER.name;
  let email = DEMO_USER.email;

  if (!DEMO_MODE) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    name = profile?.full_name ?? "";
    email = user.email ?? "";
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur">
          <div className="md:hidden flex items-center gap-2 font-semibold">SEO Review Board</div>
          {DEMO_MODE ? (
            <Badge variant="warning" className="font-medium">
              Demo mode — sample data, no backend connected
            </Badge>
          ) : (
            <div />
          )}
          <UserMenu name={name} email={email} />
        </header>
        <main className="flex-1 bg-background">{children}</main>
      </div>
    </div>
  );
}
