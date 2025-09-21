/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { invoke } from "@tauri-apps/api/core";

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
    document_type: "ID Card" | "Drivers License" | "Passport" | "Other";
    reminder_date?: string;
    document_references?: string;
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