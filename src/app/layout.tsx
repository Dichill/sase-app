import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import { DatabaseInitializer } from "@/components/DatabaseInitializer";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <DatabaseInitializer>
                    <SidebarProvider>
                        <AppSidebar />
                        <main className="w-full">{children}</main>
                    </SidebarProvider>
                </DatabaseInitializer>
            </body>
        </html>
    );
}
