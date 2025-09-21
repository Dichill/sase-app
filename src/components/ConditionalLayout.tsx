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
            <SidebarProvider className="flex-1">
                <AppSidebar />
                <main className="flex-1 overflow-auto">{children}</main>
            </SidebarProvider>
        );
    }

    return <main className="flex-1 overflow-auto">{children}</main>;
}
