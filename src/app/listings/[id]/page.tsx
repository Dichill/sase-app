"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Listing,
    getListing,
    getDocuments,
    type Document,
    fetchPdfFromApi,
    buildCombinedPdfWithSaseApi,
    downloadPdf,
} from "@/utils/database";
import { createClient } from "@/utils/supabase/client";
import { useDatabaseContextSafe } from "@/components/DatabaseInitializer";
import {
    Bed,
    Bath,
    Phone,
    Mail,
    LandPlot,
    MapPin,
    ArrowRight,
    BookUser,
    Save,
    X,
    SquareArrowOutUpRightIcon,
    MoreVertical,
    CheckCircle2Icon,
    FileText,
    Download,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { invoke } from "@tauri-apps/api/core";

const ListingPage = () => {
    const { isDatabaseInitialized } = useDatabaseContextSafe();
    const params = useParams();
    const router = useRouter();
    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notes, setNotes] = useState("");
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [referencedDocuments, setReferencedDocuments] = useState<Document[]>(
        []
    );
    const [isPdfGenerating, setIsPdfGenerating] = useState(false);

    useEffect(() => {
        const fetchListing = async () => {
            if (!isDatabaseInitialized) {
                console.log(
                    "Database not yet initialized, skipping listing fetch"
                );
                return;
            }

            try {
                const listingId = Number(params.id);
                if (isNaN(listingId)) {
                    setError("Invalid listing ID");
                    setLoading(false);
                    return;
                }

                const fetchedListing = await getListing(listingId);
                setListing(fetchedListing);
                setNotes(fetchedListing.notes ?? "");
                setError(null);
            } catch (err) {
                console.error("Failed to fetch listing:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load listing"
                );
            } finally {
                setLoading(false);
            }
        };

        const fetchDocuments = async () => {
            if (!isDatabaseInitialized) {
                console.log(
                    "Database not yet initialized, skipping documents fetch"
                );
                return;
            }

            try {
                const fetchedDocuments = await getDocuments();
                setDocuments(fetchedDocuments);
            } catch (error) {
                console.error("Failed to fetch documents:", error);
            }
        };

        void fetchListing();
        void fetchDocuments();
    }, [params.id, isDatabaseInitialized]);

    // Filter referenced documents when listing or documents change
    useEffect(() => {
        if (listing?.reference_document_ids && documents.length > 0) {
            const referenced = documents.filter((doc) =>
                listing.reference_document_ids?.includes(doc.id!)
            );
            setReferencedDocuments(referenced);
        } else {
            setReferencedDocuments([]);
        }
    }, [listing, documents]);

    const handleGenerateAndDownloadPdf = useCallback(async () => {
        if (!listing) {
            console.error("No listing data available");
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

            // Parse address for better formatting
            const parsedAddress = parseAddress(listing.address);
            const addressFormatted = parsedAddress
                ? `${parsedAddress.street}, ${parsedAddress.city}, ${parsedAddress.state} ${parsedAddress.zip}`
                : listing.address;

            // Mock personal data with listing information
            const pdfData = {
                full_name: "John Doe",
                date_of_birth: "1990-05-15",
                gender: "Male",
                phone: "+1 (555) 123-4567",
                email: "john.doe@example.com",
                profile_address: "123 Main St, Los Angeles, CA 90012",
                profile_created_at: "2025-01-10T14:32:00Z",
                profile_updated_at: "2025-09-15T09:18:00Z",
                listing_id: `LST-${listing.id?.toString().padStart(8, "0")}`,
                listing_address: addressFormatted,
                contact_email: listing.contact_email ?? "N/A",
                contact_phone: listing.contact_phone ?? "N/A",
                contact_other: listing.contact_other ?? "N/A",
                source_link: listing.source_link,
                price_rent: `$${formatRent(listing.price_rent)} / month`,
                housing_type: listing.housing_type ?? "N/A",
                lease_type: listing.lease_type ?? "N/A",
                upfront_fees: listing.upfront_fees?.toString() ?? "N/A",
                utilities: listing.utilities ?? "N/A",
                credit_score_min: listing.credit_score_min?.toString() ?? "N/A",
                minimum_income: listing.minimum_income
                    ? `$${listing.minimum_income.toLocaleString()} / month`
                    : "N/A",
                references_required: listing.references_required ? "Yes" : "No",
                bedrooms: listing.bedrooms?.toString() ?? "N/A",
                bathrooms: listing.bathrooms?.toString() ?? "N/A",
                square_footage: listing.square_footage?.toString() ?? "N/A",
                layout_description: listing.layout_description ?? "N/A",
                amenities: listing.amenities ?? "N/A",
                pet_policy: listing.pet_policy ?? "N/A",
                furnishing: listing.furnishing ?? "N/A",
                listing_notes: listing.notes ?? "N/A",
                listing_created_at:
                    listing.created_at ?? new Date().toISOString(),
                listing_updated_at:
                    listing.updated_at ?? new Date().toISOString(),
            };

            console.log("Fetching PDF from external API...");
            const apiPdfData = await fetchPdfFromApi(
                pdfData,
                session.access_token
            );

            console.log("Combining with documents...");
            // Use referenced document IDs, or fallback to empty array
            const documentIds = listing.reference_document_ids ?? [];
            const combinedPdfData = await buildCombinedPdfWithSaseApi(
                apiPdfData,
                documentIds,
                session.access_token
            );

            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const filename = `listing-${listing.id}-application-${timestamp}.pdf`;
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
    }, [listing]);

    if (loading || !isDatabaseInitialized) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">
                        {!isDatabaseInitialized
                            ? "Initializing database..."
                            : "Loading..."}
                    </h1>
                </div>
            </div>
        );
    }

    if (error || !listing) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">
                        {error ?? "Listing not found"}
                    </h1>
                    <button
                        onClick={() => {
                            router.push("/listings");
                        }}
                        className="text-blue-600 hover:underline"
                    >
                        Back to listings
                    </button>
                </div>
            </div>
        );
    }

    const formatRent = (price: number) => {
        const cents = Math.round((price % 1) * 100);
        const hasCents = cents !== 0;

        const newPrice = new Intl.NumberFormat(undefined, {
            minimumFractionDigits: hasCents ? 2 : 0,
            maximumFractionDigits: hasCents ? 2 : 0,
        });

        return newPrice.format(price);
    };

    const parseAddress = (address: string | undefined) => {
        if (!address) return null;
        const parts = address.split(",").map((part) => part.trim());
        if (parts.length >= 4) {
            return {
                street: parts[0],
                city: parts[1],
                state: parts[2],
                zip: parts[3],
            };
        } else if (parts.length === 3) {
            const stateZip = parts[2].split(" ");
            return {
                street: parts[0],
                city: parts[1],
                state: stateZip[0],
                zip: stateZip.slice(1).join(" "),
            };
        }
        return null;
    };

    // Notes are now set when listing is fetched

    // TEST: ALL YOU!!! reading
    const getNotes = async () => {
        try {
            const dbNotes: string = await invoke("get_listing_notes", {
                listingId: Number(params.id),
            });
            setNotes(dbNotes);
        } catch (error) {
            console.error("Failed to load notes", error);
        }
    };

    const handleNotesChange = (value: string) => {
        setNotes(value);
        setHasUnsavedChanges(value !== (listing.notes ?? ""));
    };

    // TEST: ALL YOU!!! update to db
    const handleSaveNotes = async () => {
        // console.log("Saving notes:", notes);
        await invoke("set_listing_notes", {
            listingId: Number(params.id),
            notes,
        });
        setHasUnsavedChanges(false);
    };

    const handleDiscardNotes = () => {
        setNotes(listing.notes ?? "");
        setHasUnsavedChanges(false);
    };

    const handleEdit = () => {
        router.push(`/listings/${params.id as string}/edit`);
    };

    const handleDelete = async () => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this listing? This action cannot be undone."
        );

        if (confirmDelete) {
            // TEST: Implement actual delete logic here; delete listing from db
            console.log("Deleting listing:", params.id);
            await invoke("delete_listing", { id: Number(params.id) });
            <Alert>
                <CheckCircle2Icon />
                <AlertTitle>Listing deleted successfully!</AlertTitle>
            </Alert>;
            router.push("/listings"); // Navigate back to listings page
        }
    };

    return (
        <div className="h-full overflow-y-auto">
            <div className="container mx-auto p-12">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <h1 className="text-4xl font-bold">
                            {parseAddress(listing.address)?.street ??
                                "Property Listing"}
                        </h1>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="cursor-pointer"
                                    aria-label="More actions"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => {
                                        handleEdit();
                                    }}
                                    className="cursor-pointer"
                                >
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        void handleDelete();
                                    }}
                                    className="text-red-600 focus:text-red-600 cursor-pointer"
                                >
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="text-2xl font-bold">
                        ${formatRent(listing.price_rent)}
                        <span className="text-lg text-gray-700">/month</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 my-2">
                    <MapPin className="w-5 h-5 text-gray-600" />
                    <h3>
                        {(() => {
                            const parsed = parseAddress(listing.address);
                            return parsed
                                ? `${parsed.city}, ${parsed.state}`
                                : listing.address || "Location not specified";
                        })()}
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
                    {/* Left Column */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Bed className="w-5 h-5 text-gray-600" />
                                <span>{listing.bedrooms} beds</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Bath className="w-5 h-5 text-gray-600" />
                                <span>{listing.bathrooms} baths</span>
                            </div>
                            {listing.square_footage && (
                                <div className="flex items-center gap-2">
                                    <LandPlot className="w-5 h-5 text-gray-600" />
                                    <span>{listing.square_footage} sq. ft</span>
                                </div>
                            )}
                        </div>

                        {listing.layout_description && (
                            <div className="mt-8 space-y-2">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold mb-2 text-lg">
                                        Description
                                    </h3>
                                    <div>
                                        <a
                                            href={listing.source_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:underline "
                                        >
                                            <SquareArrowOutUpRightIcon className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>
                                <p className="text-gray-700">
                                    {listing.layout_description}
                                </p>
                            </div>
                        )}

                        <div className="py-6 border-t border-b ">
                            <h3 className="font-semibold mb-2 text-lg">
                                Contact Information
                            </h3>
                            <div className="space-y-2 mx-4">
                                {listing.contact_phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        <span>{listing.contact_phone}</span>
                                    </div>
                                )}
                                {listing.contact_email && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        <span>{listing.contact_email}</span>
                                    </div>
                                )}
                                {listing.contact_other && (
                                    <div className="flex items-center gap-2">
                                        <BookUser className="w-4 h-4" />
                                        <span>{listing.contact_other}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="py-4">
                            <h3 className="font-semibold text-lg">
                                Additional Notes
                            </h3>
                            <Textarea
                                value={notes}
                                onChange={(e) => {
                                    handleNotesChange(e.target.value);
                                }}
                                placeholder="Add your notes about this listing..."
                                className="min-h-[120px] my-2"
                            />
                            {hasUnsavedChanges && (
                                <div className="flex items-center gap-2 justify-self-end">
                                    <Button
                                        onClick={() => {
                                            void handleSaveNotes();
                                        }}
                                        size="sm"
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <Save className="w-4 h-4" />
                                        Save
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleDiscardNotes}
                                        size="sm"
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <X className="w-4 h-4" />
                                        Discard
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Referenced Documents Section */}
                        {listing.references_required &&
                            referencedDocuments.length > 0 && (
                                <div className="py-4 border-t">
                                    <h3 className="font-semibold text-lg mb-3">
                                        Reference Documents
                                    </h3>
                                    <div className="space-y-2">
                                        {referencedDocuments.map((document) => (
                                            <div
                                                key={document.id}
                                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                                            >
                                                <FileText className="w-5 h-5 text-blue-600" />
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">
                                                        {document.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {document.document_type}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        {/* PDF Generation Section */}
                        <div className="py-4 border-t">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-lg">
                                    Generate Application
                                </h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                                Generate a complete application PDF with your
                                information and selected reference documents.
                            </p>
                            <Button
                                onClick={() => {
                                    void handleGenerateAndDownloadPdf();
                                }}
                                disabled={isPdfGenerating}
                                className="w-full flex items-center gap-2"
                            >
                                {isPdfGenerating ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Generating PDF...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4" />
                                        Generate & Download PDF
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="font-semibold text-lg mb-2">
                                Leasing Information
                            </h3>

                            <div className="space-y-1">
                                {listing.housing_type && (
                                    <div className="px-4 flex">
                                        <h3 className="font-medium text-gray-600 mb-2 flex-1 text-sm">
                                            Housing Type:
                                        </h3>
                                        <p className="flex-1 text-sm">
                                            {listing.housing_type}
                                        </p>
                                    </div>
                                )}

                                {listing.lease_type && (
                                    <div className="px-4 flex">
                                        <h3 className="font-medium text-gray-600 mb-2 flex-1 text-sm">
                                            Lease Type:
                                        </h3>
                                        <p className="flex-1 text-sm">
                                            {listing.lease_type}
                                        </p>
                                    </div>
                                )}

                                {listing.credit_score_min && (
                                    <div className="px-4 flex">
                                        <h3 className="font-medium text-gray-600 mb-2 flex-1 text-sm">
                                            Minimum Credit Score:
                                        </h3>
                                        <p className="flex-1 text-sm">
                                            {listing.credit_score_min}+
                                        </p>
                                    </div>
                                )}

                                {listing.minimum_income && (
                                    <div className="px-4 flex">
                                        <h3 className="font-medium text-gray-600 mb-2 flex-1 text-sm    ">
                                            Minimum Income:
                                        </h3>
                                        <p className="flex-1 text-sm">
                                            $
                                            {listing.minimum_income.toLocaleString()}
                                            /month
                                        </p>
                                    </div>
                                )}

                                {listing.pet_policy && (
                                    <div className="px-4 flex">
                                        <h3 className="font-medium text-gray-600 mb-2 flex-1 text-sm">
                                            Pet Policy:
                                        </h3>
                                        <p className="flex-1 text-sm">
                                            {listing.pet_policy}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h4 className="font-semibold text-lg mb-2">
                                Features
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-4">
                                {listing.amenities && (
                                    <div>
                                        <h3 className="font-medium text-gray-600 mb-2">
                                            Amenities
                                        </h3>
                                        <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
                                            {listing.amenities
                                                .split(", ")
                                                .map((amenity, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <ArrowRight className="w-4 h-4 flex-shrink-0 text-gray-600" />
                                                        <span className="py-1 text-sm">
                                                            {amenity}
                                                        </span>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}

                                {listing.utilities && (
                                    <div>
                                        <h3 className="font-medium text-gray-600 mb-2">
                                            Utilities
                                        </h3>
                                        <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
                                            {listing.utilities
                                                .split(", ")
                                                .map((utility, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <ArrowRight className="w-4 h-4 flex-shrink-0 text-gray-600" />
                                                        <span className="py-1 text-sm">
                                                            {utility}
                                                        </span>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingPage;
