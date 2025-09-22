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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
            <Card className="w-full">
                <CardHeader>
                    <h2 className="text-lg font-medium">Favorite Listings</h2>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="text-muted-foreground">
                            {!isDatabaseInitialized
                                ? "Initializing database..."
                                : "Loading favorite listings..."}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <h2 className="text-lg font-medium">Favorite Listings</h2>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    if (favoriteListings.length === 0) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <h2 className="text-lg font-medium">Favorite Listings</h2>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <div className="mb-2">No favorite listings yet</div>
                        <div className="text-sm">
                            Star some listings to see them here!
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <h2 className="text-lg font-medium">Favorite Listings</h2>
            </CardHeader>
            <CardContent>
                <Carousel className="w-full">
                    <CarouselContent className="-ml-2 md:-ml-4">
                        {favoriteListings.map((listing) => (
                            <CarouselItem
                                key={listing.id}
                                className="pl-2 md:pl-4 basis-full flex justify-center"
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

                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                </Carousel>
            </CardContent>
        </Card>
    );
};

export default FavoriteListingCarousel;
