"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();

  const noSidebarRoutes = ["/login", "/auth", "/error"];
  const shouldShowSidebar = !noSidebarRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (shouldShowSidebar) {
    return (
      <SidebarProvider>
        <div className="flex h-full min-h-0 w-screen">
          <AppSidebar />
          <main className="flex-1 min-w-0 overflow-auto w-full">
            <div className="w-full h-full p-4">{children}</div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return <main className="w-full h-full">{children}</main>;
}
