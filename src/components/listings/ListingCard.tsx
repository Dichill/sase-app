"use client";
import { Separator } from "@radix-ui/react-select";
import { Bed, Bath, MapPin, Star, Phone, Mail, Tag } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toggleListingFavorite } from "@/utils/database";

interface ListingCardProps {
    id: string;
    address: string;
    phoneNumber: string;
    email: string;
    bedrooms: number;
    bathrooms: number;
    cost: number;
    favorite?: boolean;
    onUpdate?: () => void;
}

const ListingCard: React.FC<ListingCardProps> = ({
    id,
    address,
    phoneNumber,
    email,
    bedrooms,
    bathrooms,
    cost,
    favorite = false,
    onUpdate,
}) => {
    const router = useRouter();
    const [isFavorited, setIsFavorited] = useState(favorite);
    const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false);

    // Sync local state with prop changes
    useEffect(() => {
        setIsFavorited(favorite);
    }, [favorite]);

    const formattedUSD = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(cost);

    const formatRent = (price: number) => {
        const cents = Math.round((price % 1) * 100);
        const hasCents = cents !== 0;

        const newPrice = new Intl.NumberFormat(undefined, {
            minimumFractionDigits: hasCents ? 2 : 0,
            maximumFractionDigits: hasCents ? 2 : 0,
        });

        return newPrice.format(price);
    };

    const parseAddress = (address: string) => {
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

    const handleClick = (e: React.MouseEvent) => {
        router.push(`/listings/${id}`);
    };

    const handleFavoriteClick = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (isUpdatingFavorite || !id) return;

        const listingId = parseInt(id);
        if (isNaN(listingId)) {
            console.error("Invalid listing ID:", id);
            return;
        }

        setIsUpdatingFavorite(true);

        try {
            const newFavoriteStatus = await toggleListingFavorite(listingId);
            setIsFavorited(newFavoriteStatus);

            if (onUpdate) {
                onUpdate();
            }

            console.log(
                `Listing ${id} ${
                    newFavoriteStatus ? "added to" : "removed from"
                } favorites`
            );
        } catch (error) {
            console.error("Failed to toggle favorite:", error);
            setIsFavorited(isFavorited);
        } finally {
            setIsUpdatingFavorite(false);
        }
    };

    return (
        <div
            className="w-full bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            onClick={handleClick}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-gray-900">
                            {parseAddress(address)?.street}
                        </h3>
                        <div className="flex justify-end mb-2">
                            <button
                                onClick={(e) => void handleFavoriteClick(e)}
                                disabled={isUpdatingFavorite}
                                className={`p-1 rounded-full cursor-pointer transition-colors duration-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${
                                    isFavorited
                                        ? "text-yellow-500"
                                        : "text-gray-400"
                                }`}
                                aria-label={
                                    isFavorited
                                        ? "Remove from favorites"
                                        : "Add to favorites"
                                }
                            >
                                <Star
                                    className={`w-5 h-5 ${
                                        isFavorited ? "fill-current" : ""
                                    } ${
                                        isUpdatingFavorite
                                            ? "animate-pulse"
                                            : ""
                                    }`}
                                />
                            </button>
                        </div>
                    </div>
                    {/* city  */}
                    <div className="flex items-center gap-2 my-1">
                        <MapPin className="w-4 h-4" />
                        <p className="text-gray-600 ">
                            {parseAddress(address)?.city},{" "}
                            {parseAddress(address)?.state}
                        </p>
                    </div>
                    {/* beds and bath */}
                    <div className="flex items-center justify-between my-4">
                        <div>
                            <h4 className="text-gray-600 text-sm">Details</h4>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 ">
                                    <p className="text-gray-900 font-semibold">
                                        {bedrooms}
                                    </p>
                                    <Bed className="w-4 h-4" />
                                </div>
                                <div className="flex items-center gap-1 ">
                                    <p className="text-gray-900 font-semibold">
                                        {bathrooms}
                                    </p>
                                    <Bath className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-gray-600 text-sm">Cost</h4>
                            <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4" />
                                <p className="text-gray-900 font-semibold">
                                    ${formatRent(cost)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <Separator className="border-b" />
                    {/* contact */}
                    <div className="my-2 pt-2">
                        <div className="flex items-center gap-2 my-1">
                            <Phone className="w-4 h-4" />
                            <p className="text-gray-900 font-medium">
                                {phoneNumber}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 my-1">
                            <Mail className="w-4 h-4" />
                            <p className="text-gray-900 font-medium">{email}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingCard;
