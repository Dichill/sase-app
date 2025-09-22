"use client";

/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { invoke } from "@tauri-apps/api/core";
import { createClient } from "./supabase/client";
import { CheckedState } from "@radix-ui/react-checkbox";

export interface Listing {
    id?: number;
    address: string;
    contact_email?: string;
    contact_phone?: string;
    contact_other?: string;
    source_link: string;
    price_rent: number;
    housing_type?: string;
    lease_type?: "month-to-month" | "annual";
    upfront_fees?: number;
    utilities?: string; // JSON string
    credit_score_min?: number;
    minimum_income?: number;
    references_required?: boolean;
    reference_document_ids?: number[];
    bedrooms?: number;
    bathrooms?: number;
    square_footage?: number;
    layout_description?: string;
    amenities?: string; // JSON string
    pet_policy?: string;
    furnishing?: "furnished" | "unfurnished" | "semi-furnished";
    notes?: string;
    favorite?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Profile {
    id?: number;
    fullname?: string;
    date_of_birth?: string;
    gender?: string;
    phone?: string;
    email?: string;
    address?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Document {
    description: any;
    is_completed: CheckedState | undefined;
    id?: number;
    name: string;
    document_type: string;
    reminder_date?: string;
    mime_type?: string;
    data?: Uint8Array;
    updated_at?: string;
}

export interface Checklist {
    id?: number;
    is_checked: boolean;
    task_name: string;
    document_references?: string;
    reminder_date?: string;
    created_at?: string;
    updated_at?: string;
}

export async function initializeUserDatabase(
    password: string
): Promise<{ success: boolean; cipher_version?: string }> {
    try {
        const result = await invoke<{
            success: boolean;
            cipher_version?: string;
        }>("initialize_user_database", {
            password,
        });
        return result;
    } catch (error) {
        console.error("Failed to initialize database:", error);
        throw new Error(`Database initialization failed: ${error}`);
    }
}

export async function addListing(
    listing: Omit<Listing, "id" | "created_at" | "updated_at">
): Promise<number> {
    try {
        const listingWithJsonIds = {
            ...listing,
            reference_document_ids: listing.reference_document_ids
                ? JSON.stringify(listing.reference_document_ids)
                : undefined,
        };

        const result = await invoke<number>("add_listing", {
            listing: listingWithJsonIds,
        });
        return result;
    } catch (error) {
        console.error("Failed to add listing:", error);
        throw new Error(`Failed to add listing: ${error}`);
    }
}

export async function getListings(): Promise<Listing[]> {
    try {
        const result = await invoke<Listing[]>("get_listings");
        return result.map((listing) => ({
            ...listing,
            reference_document_ids:
                typeof listing.reference_document_ids === "string"
                    ? (JSON.parse(listing.reference_document_ids) as number[])
                    : listing.reference_document_ids,
        }));
    } catch (error) {
        console.error("Failed to get listings:", error);
        throw new Error(`Failed to get listings: ${error}`);
    }
}

export async function getListing(id: number): Promise<Listing> {
    try {
        const result = await invoke<Listing>("get_listing", { id });
        return {
            ...result,
            reference_document_ids:
                typeof result.reference_document_ids === "string"
                    ? (JSON.parse(result.reference_document_ids) as number[])
                    : result.reference_document_ids,
        };
    } catch (error) {
        console.error("Failed to get listing:", error);
        throw new Error(`Failed to get listing: ${error}`);
    }
}

export async function deleteListing(id: number): Promise<void> {
    try {
        await invoke("delete_listing", { id });
    } catch (error) {
        console.error("Failed to delete listing:", error);
        throw new Error(`Failed to delete listing: ${error}`);
    }
}

export async function updateListing(
    id: number,
    address: string,
    contactEmail?: string,
    contactPhone?: string,
    contactOther?: string,
    sourceLink?: string,
    priceRent?: number,
    housingType?: string,
    leaseType?: "month-to-month" | "annual",
    upfrontFees?: number,
    utilities?: string,
    creditScoreMin?: number,
    minimumIncome?: number,
    referencesRequired?: boolean,
    bedrooms?: number,
    bathrooms?: number,
    squareFootage?: number,
    layoutDescription?: string,
    amenities?: string,
    petPolicy?: string,
    furnishing?: "furnished" | "unfurnished" | "semi-furnished",
    notes?: string,
    favorite?: boolean,
    referenceDocumentIds?: number[]
): Promise<void> {
    try {
        await invoke("update_listing", {
            id,
            address,
            contactEmail,
            contactPhone,
            contactOther,
            sourceLink: sourceLink ?? "",
            priceRent: priceRent ?? 0,
            housingType,
            leaseType,
            upfrontFees,
            utilities,
            creditScoreMin,
            minimumIncome,
            referencesRequired,
            referenceDocumentIds: referenceDocumentIds
                ? JSON.stringify(referenceDocumentIds)
                : null,
            bedrooms,
            bathrooms,
            squareFootage,
            layoutDescription,
            amenities,
            petPolicy,
            furnishing,
            notes,
            favorite,
        });
    } catch (error) {
        console.error("Failed to update listing:", error);
        throw new Error(`Failed to update listing: ${error}`);
    }
}

export async function getListingNotes(listingId: number): Promise<string> {
    try {
        const result = await invoke<string>("get_listing_notes", {
            listingId,
        });
        return result;
    } catch (error) {
        console.error("Failed to get listing notes:", error);
        throw new Error(`Failed to get listing notes: ${error}`);
    }
}

export async function setListingNotes(
    listingId: number,
    notes: string
): Promise<void> {
    try {
        await invoke("set_listing_notes", { listingId, notes });
    } catch (error) {
        console.error("Failed to set listing notes:", error);
        throw new Error(`Failed to set listing notes: ${error}`);
    }
}

/**
 * Toggle the favorite status of a listing
 * @param listingId - The ID of the listing to toggle
 * @returns The new favorite status (true if now favorited, false if unfavorited)
 */
export async function toggleListingFavorite(
    listingId: number
): Promise<boolean> {
    try {
        const result = await invoke<boolean>("toggle_listing_favorite", {
            listingId,
        });
        return result;
    } catch (error) {
        console.error("Failed to toggle listing favorite:", error);
        throw new Error(`Failed to toggle listing favorite: ${error}`);
    }
}

/**
 * Set the favorite status of a listing
 * @param listingId - The ID of the listing to update
 * @param favorite - The favorite status to set (true for favorite, false for unfavorite)
 */
export async function setListingFavorite(
    listingId: number,
    favorite: boolean
): Promise<void> {
    try {
        await invoke("set_listing_favorite", { listingId, favorite });
    } catch (error) {
        console.error("Failed to set listing favorite:", error);
        throw new Error(`Failed to set listing favorite: ${error}`);
    }
}

export async function getDocuments(): Promise<Document[]> {
    try {
        const result = await invoke<Document[]>("get_documents");
        return result.map((doc) => ({
            ...doc,
            data: doc.data
                ? new Uint8Array(doc.data as unknown as number[])
                : undefined,
        }));
    } catch (error) {
        console.error("Failed to get documents:", error);
        throw new Error(`Failed to get documents: ${error}`);
    }
}

export async function deleteDocument(document_id: number): Promise<void> {
    try {
        await invoke("delete_document", { documentId: document_id });
    } catch (error) {
        console.error("Failed to delete document:", error);
        throw new Error(`Failed to delete document: ${error}`);
    }
}

export async function addDocument(
    document: Omit<Document, "id" | "created_at" | "updated_at">
): Promise<number> {
    try {
        console.log("Adding document to database:", {
            name: document.name,
            document_type: document.document_type,
            mime_type: document.mime_type,
            data_size: document.data?.length ?? 0,
            reminder_date: document.reminder_date,
        });
        const result = await invoke<number>("add_document", { document });
        console.log("Document added successfully with ID:", result);
        return result;
    } catch (error) {
        console.error("Failed to add document:", error);
        throw new Error(`Failed to add document: ${error}`);
    }
}

export async function readFileAsBlob(
    filePath: string
): Promise<{ data: Uint8Array; mimeType: string }> {
    try {
        console.log("Calling read_file_as_blob with path:", filePath);
        const result = await invoke<{ data: number[]; mime_type: string }>(
            "read_file_as_blob",
            { filePath }
        );
        console.log("Tauri command returned:", {
            dataLength: result.data.length,
            mimeType: result.mime_type,
        });
        return {
            data: new Uint8Array(result.data),
            mimeType: result.mime_type,
        };
    } catch (error) {
        console.error("Failed to read file as blob:", error);
        throw new Error(`Failed to read file as blob: ${error}`);
    }
}

export async function getDatabaseInfo(): Promise<{
    exists: boolean;
    path: string;
    size?: number;
    permissions?: string;
    readonly?: boolean;
    is_file?: boolean;
    error?: string;
}> {
    try {
        const result = await invoke<{
            exists: boolean;
            path: string;
            size?: number;
            permissions?: string;
            readonly?: boolean;
            is_file?: boolean;
            error?: string;
        }>("get_database_info");
        return result;
    } catch (error) {
        console.error("Failed to get database info:", error);
        throw new Error(`Failed to get database info: ${error}`);
    }
}

export async function deleteDatabase(): Promise<void> {
    try {
        const dbInfo = await getDatabaseInfo();
        console.log("Database info before deletion:", dbInfo);

        await invoke("delete_database");
        console.log("Database deleted successfully");

        localStorage.removeItem("database_initialized");

        await handleLogout();
    } catch (error) {
        console.error("Failed to delete database:", error);
        throw new Error(`Failed to delete database: ${error}`);
    }
}

export const handleLogout = async (): Promise<void> => {
    try {
        const supabase = createClient();
        await supabase.auth.signOut();

        localStorage.removeItem("supabase_session");
        console.log("Cleared persistent session storage on logout");
    } catch (error) {
        console.error("Error during logout:", error);
    }
};

export function createDocumentBlobUrl(document: Document): string | null {
    if (!document.data || !document.mime_type) {
        return null;
    }

    try {
        const blob = new Blob([Uint8Array.from(document.data)], {
            type: document.mime_type,
        });
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error("Failed to create blob URL:", error);
        return null;
    }
}

export function isImageDocument(document: Document): boolean {
    if (!document.mime_type) return false;
    return document.mime_type.startsWith("image/");
}

export function isPdfDocument(document: Document): boolean {
    return document.mime_type === "application/pdf";
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Fetches PDF data from an external API
 */
export async function fetchPdfFromApi(
    pdfData: Record<string, any>,
    accessToken: string
): Promise<Uint8Array> {
    try {
        console.log("Fetching PDF from API with data:", pdfData);

        const response = await fetch(
            "https://drakoindustries.com/api/sase/pdf/generate",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(pdfData),
            }
        );

        if (!response.ok) {
            throw new Error(
                `API request failed: ${response.status} ${response.statusText}`
            );
        }

        const arrayBuffer = await response.arrayBuffer();
        return new Uint8Array(arrayBuffer);
    } catch (error) {
        console.error("Failed to fetch PDF from API:", error);
        throw new Error(`Failed to fetch PDF from API: ${error}`);
    }
}

export async function buildCombinedPdfWithSaseApi(
    firstPdf: Uint8Array,
    documentIds: number[],
    jwtToken: string
): Promise<Uint8Array> {
    try {
        const result = await invoke("build_pdf_with_sase_api", {
            firstPdf: Array.from(firstPdf),
            idsInOrder: documentIds,
            jwtToken: jwtToken,
        });

        if (result instanceof Array) {
            return new Uint8Array(result);
        } else {
            throw new Error("Invalid response format from SASE API merge");
        }
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes("Authentication failed")) {
                throw new Error(
                    "Authentication failed: Please check your JWT token"
                );
            }
            if (error.message.includes("Access denied")) {
                throw new Error("Access denied: Insufficient permissions");
            }
            if (error.message.includes("Request too large")) {
                throw new Error(
                    "Files too large: Please reduce PDF file sizes"
                );
            }
        }

        throw error;
    }
}

export function downloadPdf(pdfData: Uint8Array, filename: string): void {
    try {
        console.log("Downloading PDF:", filename);

        const blob = new Blob([pdfData as BlobPart], {
            type: "application/pdf",
        });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
        console.log("PDF download initiated:", filename);
    } catch (error) {
        console.error("Failed to download PDF:", error);
        throw new Error(`Failed to download PDF: ${error}`);
    }
}

// Utility functions for working with listing favorites

export function getFavoriteListings(listings: Listing[]): Listing[] {
    return listings.filter((listing) => listing.favorite === true);
}

export function getNonFavoriteListings(listings: Listing[]): Listing[] {
    return listings.filter((listing) => listing.favorite !== true);
}

export function sortListingsByFavorite(listings: Listing[]): Listing[] {
    return [...listings].sort((a, b) => {
        // Favorites first
        if (a.favorite && !b.favorite) return -1;
        if (!a.favorite && b.favorite) return 1;
        return 0;
    });
}

export function isListingFavorite(listing: Listing): boolean {
    return listing.favorite === true;
}

export function getFavoriteCount(listings: Listing[]): number {
    return listings.filter((listing) => listing.favorite === true).length;
}

export async function getChecklists(): Promise<Checklist[]> {
    try {
        const result = await invoke<Checklist[]>("get_checklists");
        return result;
    } catch (error) {
        console.error("Failed to get checklists:", error);
        throw new Error(`Failed to get checklists: ${error}`);
    }
}

export async function addChecklist(
    checklist: Omit<Checklist, "id" | "created_at" | "updated_at">
): Promise<number> {
    try {
        const result = await invoke<number>("add_checklist", { checklist });
        return result;
    } catch (error) {
        console.error("Failed to add checklist:", error);
        throw new Error(`Failed to add checklist: ${error}`);
    }
}

export async function updateChecklist(
    id: number,
    taskName: string,
    isChecked: boolean,
    documentReferences?: string,
    reminderDate?: string
): Promise<void> {
    try {
        await invoke("update_checklist", {
            id,
            taskName,
            isChecked,
            documentReferences,
            reminderDate,
        });
    } catch (error) {
        console.error("Failed to update checklist:", error);
        throw new Error(`Failed to update checklist: ${error}`);
    }
}

export async function deleteChecklist(id: number): Promise<void> {
    try {
        await invoke("delete_checklist", { id });
    } catch (error) {
        console.error("Failed to delete checklist:", error);
        throw new Error(`Failed to delete checklist: ${error}`);
    }
}

export async function toggleChecklistCompletion(id: number): Promise<boolean> {
    try {
        const result = await invoke<boolean>("toggle_checklist_completion", {
            id,
        });
        return result;
    } catch (error) {
        console.error("Failed to toggle checklist completion:", error);
        throw new Error(`Failed to toggle checklist completion: ${error}`);
    }
}
