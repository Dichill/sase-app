import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import { DatabaseInitializer } from "@/components/DatabaseInitializer";
import { ConditionalLayout } from "../components/ConditionalLayout";
import { ThemeProvider } from "@/components/theme-provider";
import { Titlebar } from "@/components/titlebar";

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
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <div className="flex flex-col h-screen">
                        <Titlebar />
                        <div className="flex flex-1 overflow-hidden">
                            <DatabaseInitializer>
                                <ConditionalLayout>
                                    {children}
                                </ConditionalLayout>
                            </DatabaseInitializer>
                        </div>
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
