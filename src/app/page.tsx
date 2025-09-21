"use client";
import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useDatabaseContextSafe } from "@/components/DatabaseInitializer";

interface StoredSession {
    access_token: string;
    refresh_token: string;
    expires_at?: number;
    stored_at?: number;
    user?: {
        email?: string;
    };
}

// async function sendPost() {
//     const supabase = createClient();
//     try {
//         const response = await fetch(
//             "https://drakoindustries.com/api/sase/listing/scrape",
//             {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                     Authorization: `Bearer ${
//                         (
//                             await supabase.auth.getSession()
//                         ).data.session?.access_token
//                     }`,
//                 },
//                 body: JSON.stringify({
//                     url: "https://www.apartments.com/mixc-at-1333-los-angeles-ca/yggyfxr/",
//                 }),
//             }
//         );

//         const data = await response.json();
//         console.log("Response:", data);
//     } catch (err) {
//         console.error("Error:", err);
//     }
// }

export default function Home() {
    const [greeted, setGreeted] = useState<string | null>(null);
    const [user, setUser] = useState<{ email: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const { isDatabaseInitialized } = useDatabaseContextSafe();

    // Check if user is authenticated
    const checkAuth = useCallback(
        async (retryCount = 0) => {
            console.log(
                `Main page: Checking authentication (attempt ${
                    retryCount + 1
                })...`
            );
            const supabase = createClient();
            let session = null;

            const {
                data: { session: supabaseSession },
            } = await supabase.auth.getSession();

            session = supabaseSession;

            if (!session) {
                console.log(
                    "Main page: No Supabase session, checking localStorage for persistent session..."
                );
                const storedSession = localStorage.getItem("supabase_session");
                if (storedSession) {
                    try {
                        const parsedSession = JSON.parse(
                            storedSession
                        ) as StoredSession;
                        console.log(
                            "Main page: Found session in localStorage, checking validity..."
                        );

                        const now = Date.now();
                        const maxAge = 7 * 24 * 60 * 60 * 1000;
                        const isExpired =
                            parsedSession.stored_at &&
                            now - parsedSession.stored_at > maxAge;

                        if (isExpired) {
                            console.log(
                                "Main page: Stored session is too old, removing..."
                            );
                            localStorage.removeItem("supabase_session");
                            return;
                        }

                        console.log(
                            "Main page: Session is valid, attempting to restore..."
                        );

                        if (
                            parsedSession.access_token &&
                            parsedSession.refresh_token
                        ) {
                            await supabase.auth.setSession({
                                access_token: parsedSession.access_token,
                                refresh_token: parsedSession.refresh_token,
                            });

                            const {
                                data: { session: restoredSession },
                            } = await supabase.auth.getSession();
                            session = restoredSession ?? parsedSession;
                        }
                        console.log(
                            "Main page: Session restoration result:",
                            session ? "Success" : "Failed"
                        );
                    } catch (error) {
                        console.error(
                            "Main page: Error parsing/restoring session from localStorage:",
                            error
                        );
                    }
                }
            }

            console.log(
                "Main page: Final session check result:",
                session ? "Found session" : "No session"
            );
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const userEmail = session?.user
                ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                  (session.user as any).email
                : "No email";
            console.log("Main page: User email:", userEmail);

            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (session?.user && (session.user as any).email) {
                console.log(
                    "Main page: User authenticated, setting user state"
                );
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
                const userEmail = (session.user as any).email;

                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                setUser({ email: userEmail });

                setIsLoading(false);
            } else if (retryCount < 2) {
                console.log(
                    "Main page: No session found, retrying in 200ms..."
                );
                setTimeout(() => {
                    void checkAuth(retryCount + 1);
                }, 200);
            } else {
                console.log(
                    "Main page: No authenticated user after retries, redirecting to login"
                );
                localStorage.removeItem("supabase_session");
                router.push("/login");
                setIsLoading(false);
            }
        },
        [router]
    );

    useEffect(() => {
        void checkAuth();
    }, [checkAuth]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="h-full overflow-y-auto">
            <div
                className="container mx-auto w-full px-10"
                style={{ marginTop: "48px", marginBottom: "64px" }}
            >
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Good day, {user.email}!
                    </p>
                </div>
            </div>
        </div>
    );
}
