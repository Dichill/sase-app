"use client";
import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useDatabaseContextSafe } from "@/components/DatabaseInitializer";
import { Button } from "@/components/ui/button";
import {
    fetchPdfFromApi,
    downloadPdf,
    buildCombinedPdfWithSaseApi,
} from "@/utils/database";

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
    const [isPdfGenerating, setIsPdfGenerating] = useState(false);
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

    const handleGenerateAndDownloadPdf = useCallback(async () => {
        if (!user) {
            console.error("No user logged in");
            return;
        }

        setIsPdfGenerating(true);

        try {
            const supabase = createClient();
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session?.access_token) {
                throw new Error("No access token available");
            }

            console.log("Starting PDF generation process...");

            // Sample data for PDF generation (you can modify this as needed)
            const pdfData = {
                full_name: "John Doe",
                date_of_birth: "1990-05-15",
                gender: "Male",
                phone: "+1 (555) 123-4567",
                email: user.email,
                profile_address: "123 Main St, Los Angeles, CA 90012",
                profile_created_at: "2025-01-10T14:32:00Z",
                profile_updated_at: "2025-09-15T09:18:00Z",
                listing_id: "LST-20250921-001",
                listing_address: "456 Elm St, Los Angeles, CA 90013",
                contact_email: "contact@listing.com",
                contact_phone: "+1 (555) 987-6543",
                contact_other: "Available via WhatsApp",
                source_link: "https://apartments.com/listing/456-elm-st",
                price_rent: "$2,450 / month",
                housing_type: "Apartment",
                lease_type: "12-Month Lease",
                upfront_fees: "$500 security deposit, $150 application fee",
                utilities: "Water, Trash included; Electricity separate",
                credit_score_min: "650",
                minimum_income: "$6,000 / month",
                references_required: "Yes",
                bedrooms: "2",
                bathrooms: "2",
                square_footage: "1,050",
                layout_description: "Open floor plan with modern kitchen",
                amenities: "Gym, Pool, Parking, In-unit Laundry",
                pet_policy: "Pets allowed (max 2, $300 pet deposit)",
                furnishing: "Unfurnished",
                listing_notes: "Close to public transport and shopping centers",
                listing_created_at: "2025-09-01T08:00:00Z",
                listing_updated_at: "2025-09-18T11:45:00Z",
            };

            console.log("Fetching PDF from external API...");
            const apiPdfData = await fetchPdfFromApi(
                pdfData,
                session.access_token
            );

            console.log("Combining with documents...");
            const documentIds = [1, 2];
            const combinedPdfData = await buildCombinedPdfWithSaseApi(
                apiPdfData,
                documentIds,
                session.access_token
            );

            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const filename = `combined-document-${timestamp}.pdf`;
            downloadPdf(combinedPdfData, filename);

            console.log("PDF generation and download completed successfully!");
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert(
                `Error generating PDF: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        } finally {
            setIsPdfGenerating(false);
        }
    }, [user]);

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

                {/* PDF Generation Section */}
                <div className="bg-card rounded-lg border p-6 shadow-sm">
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-xl font-semibold">
                                PDF TESTTTT
                            </h2>
                            <p className="text-muted-foreground text-sm mt-1">
                                Test the PDF generation process
                            </p>
                        </div>

                        <Button
                            onClick={() => void handleGenerateAndDownloadPdf()}
                            disabled={isPdfGenerating}
                            className="w-full sm:w-auto"
                        >
                            {isPdfGenerating ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                    Generating PDF...
                                </>
                            ) : (
                                "Generate & Download Combined PDF"
                            )}
                        </Button>

                        {isPdfGenerating && (
                            <div className="text-sm text-muted-foreground">
                                <p>
                                    Generating PDF based on data from personal
                                    info and documents (dummy data for now)
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
