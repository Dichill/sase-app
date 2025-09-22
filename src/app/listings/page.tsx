"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import ListingDetails from "@/components/listings/ListingDetails";
import ListingEdit from "@/components/listings/ListingEdit";
import ListingsList from "@/components/listings/ListingsList";

// Main component that handles routing based on search params
const ListingsPageContent = () => {
    const searchParams = useSearchParams();
    const listingId = searchParams.get("id");
    const isEdit = searchParams.get("edit") === "true";

    if (listingId) {
        const id = parseInt(listingId, 10);
        if (!Number.isNaN(id)) {
            if (isEdit) {
                return <ListingEdit listingId={id} />;
            }
            return <ListingDetails listingId={id} />;
        }
    }

    return <ListingsList />;
};

const Listings = () => {
    return (
        <Suspense
            fallback={
                <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">Loading...</h1>
                    </div>
                </div>
            }
        >
            <ListingsPageContent />
        </Suspense>
    );
};

export default Listings;
