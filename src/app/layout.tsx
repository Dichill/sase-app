import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import { DatabaseInitializer } from "@/components/DatabaseInitializer";
import { ConditionalLayout } from "../components/ConditionalLayout";

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
                    <ConditionalLayout>{children}</ConditionalLayout>
                </DatabaseInitializer>
            </body>
        </html>
    );
}
