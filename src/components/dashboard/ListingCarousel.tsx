/* eslint-disable @typescript-eslint/restrict-template-expressions */
"use client";
import { useState, useEffect } from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import ListingCard from "../listings/ListingCard";
import {
    getListings,
    getFavoriteListings,
    type Listing,
} from "@/utils/database";
import { useDatabaseContextSafe } from "@/components/DatabaseInitializer";

const FavoriteListingCarousel = () => {
    const { isDatabaseInitialized } = useDatabaseContextSafe();
    const [favoriteListings, setFavoriteListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadFavoriteListings = async () => {
        if (!isDatabaseInitialized) {
            console.log(
                "Database not yet initialized, skipping favorite listings load"
            );
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const allListings = await getListings();
            const favorites = getFavoriteListings(allListings);
            setFavoriteListings(favorites);
        } catch (err) {
            setError(`Failed to load favorite listings: ${err}`);
            console.error("Failed to load favorite listings:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadFavoriteListings();
    }, [isDatabaseInitialized]);

    const handleListingUpdate = () => {
        void loadFavoriteListings();
    };

    if (loading || !isDatabaseInitialized) {
        return (
            <div className="w-full px-18">
                <div className="w-full rounded-lg px-4 py-6">
                    <h2 className="text-lg font-medium my-4">
                        Favorite Listings
                    </h2>
                    <div className="flex items-center justify-center py-8">
                        <div className="text-gray-500">
                            {!isDatabaseInitialized
                                ? "Initializing database..."
                                : "Loading favorite listings..."}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full px-18">
                <div className="w-full rounded-lg px-4 py-6">
                    <h2 className="text-lg font-medium my-4">
                        Favorite Listings
                    </h2>
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="text-red-800 text-sm">{error}</div>
                    </div>
                </div>
            </div>
        );
    }

    if (favoriteListings.length === 0) {
        return (
            <div className="w-full px-18">
                <div className="w-full rounded-lg px-4 py-6">
                    <h2 className="text-lg font-medium my-4">
                        Favorite Listings
                    </h2>
                    <div className="text-center py-8 text-gray-500">
                        <div className="mb-2">No favorite listings yet</div>
                        <div className="text-sm">
                            Star some listings to see them here!
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full px-18">
            <div className="w-full rounded-lg px-4 py-6">
                <h2 className="text-lg font-medium my-4">Favorite Listings</h2>

                <Carousel>
                    <CarouselContent>
                        {favoriteListings.map((listing) => (
                            <CarouselItem
                                key={listing.id}
                                className="px-4 lg:basis-1/3"
                            >
                                <ListingCard
                                    id={listing.id?.toString() ?? ""}
                                    address={listing.address}
                                    phoneNumber={listing.contact_phone ?? ""}
                                    email={listing.contact_email ?? ""}
                                    bedrooms={listing.bedrooms ?? 0}
                                    bathrooms={listing.bathrooms ?? 0}
                                    cost={listing.price_rent}
                                    favorite={listing.favorite ?? false}
                                    onUpdate={handleListingUpdate}
                                />
                            </CarouselItem>
                        ))}
                    </CarouselContent>

                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </div>
        </div>
    );
};

export default FavoriteListingCarousel;
