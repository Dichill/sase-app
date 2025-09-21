/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { invoke } from "@tauri-apps/api/core";
import router from "next/router";
import { createClient } from "./supabase/client";

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
    bedrooms?: number;
    bathrooms?: number;
    square_footage?: number;
    layout_description?: string;
    amenities?: string; // JSON string
    pet_policy?: string;
    furnishing?: "furnished" | "unfurnished" | "semi-furnished";
    notes?: string;
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
        const result = await invoke<number>("add_listing", { listing });
        return result;
    } catch (error) {
        console.error("Failed to add listing:", error);
        throw new Error(`Failed to add listing: ${error}`);
    }
}

export async function getListings(): Promise<Listing[]> {
    try {
        const result = await invoke<Listing[]>("get_listings");
        return result;
    } catch (error) {
        console.error("Failed to get listings:", error);
        throw new Error(`Failed to get listings: ${error}`);
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
