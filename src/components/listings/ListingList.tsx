"use client";
import { useEffect, useState } from "react";
import ListingCard from "./ListingCard";
import {
    Listing,
    getListings,
    sortListingsByFavorite,
    getFavoriteCount,
} from "@/utils/database";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw, Heart, List } from "lucide-react";
import { useDatabaseContextSafe } from "@/components/DatabaseInitializer";

interface ListingListProps {
    showFavoritesOnly?: boolean;
    sortByFavorites?: boolean;
}

const ListingList: React.FC<ListingListProps> = ({
    showFavoritesOnly = false,
    sortByFavorites = true,
}) => {
    const { isDatabaseInitialized } = useDatabaseContextSafe();
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchListings = async () => {
        if (!isDatabaseInitialized) {
            console.log(
                "Database not yet initialized, skipping listings fetch"
            );
            return;
        }

        try {
            setError(null);
            const allListings = await getListings();

            let filteredListings = allListings;

            if (showFavoritesOnly) {
                filteredListings = allListings.filter(
                    (listing) => listing.favorite === true
                );
            }

            if (sortByFavorites) {
                filteredListings = sortListingsByFavorite(filteredListings);
            }

            setListings(filteredListings);
        } catch (error) {
            console.error("Failed to fetch listings:", error);
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to fetch listings"
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchListings();
    };

    const handleListingUpdate = () => {
        // Refresh listings when a listing is updated (e.g., favorite toggled)
        void fetchListings();
    };

    useEffect(() => {
        void fetchListings();
    }, [isDatabaseInitialized, showFavoritesOnly, sortByFavorites]);

    if (loading || !isDatabaseInitialized) {
        return (
            <div className="w-full max-w-full space-y-6">
                <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-2 text-gray-600">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>
                            {!isDatabaseInitialized
                                ? "Initializing database..."
                                : "Loading listings..."}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full max-w-full space-y-6">
                <Alert variant="destructive">
                    <AlertDescription>
                        {error}
                        <Button
                            variant="outline"
                            size="sm"
                            className="ml-2"
                            onClick={() => void handleRefresh()}
                            disabled={refreshing}
                        >
                            {refreshing ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                "Retry"
                            )}
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (listings.length === 0) {
        return (
            <div className="w-full max-w-full space-y-6">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    {showFavoritesOnly ? (
                        <>
                            <Heart className="w-12 h-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No favorite listings yet
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Start favoriting listings to see them here
                            </p>
                        </>
                    ) : (
                        <>
                            <List className="w-12 h-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No listings found
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Add some listings to get started
                            </p>
                        </>
                    )}
                    <Button
                        variant="outline"
                        onClick={() => void handleRefresh()}
                        disabled={refreshing}
                    >
                        {refreshing ? (
                            <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <RefreshCw className="w-4 h-4 mr-2" />
                        )}
                        Refresh
                    </Button>
                </div>
            </div>
        );
    }

    const favoriteCount = getFavoriteCount(listings);

    return (
        <div className="w-full max-w-full space-y-6">
            {/* Header with stats and refresh */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold">
                        {showFavoritesOnly
                            ? "Favorite Listings"
                            : "All Listings"}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{listings.length} listings</span>
                        {!showFavoritesOnly && favoriteCount > 0 && (
                            <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Heart className="w-3 h-3" />
                                    {favoriteCount} favorites
                                </span>
                            </>
                        )}
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void handleRefresh()}
                    disabled={refreshing}
                >
                    {refreshing ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                        <RefreshCw className="w-4 h-4" />
                    )}
                </Button>
            </div>

            {/* Listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listings.map((listing) => (
                    <ListingCard
                        key={listing.id ?? `listing-${Math.random()}`}
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
                ))}
            </div>
        </div>
    );
};

export default ListingList;
