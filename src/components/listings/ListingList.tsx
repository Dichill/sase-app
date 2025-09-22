"use client";
import ListingCard from "./ListingCard";
import { listingData } from "@/data/listingData";
import FavoriteListingCarousel from "../dashboard/ListingCarousel";
import { Listing } from "@/utils/database";
import { invoke } from "@tauri-apps/api/core";

const listings = listingData;

const ListingList = () => {
  //TEST: GET /listings (PLS JUSTIN U GOT ME RIGHT?!) get listings from db, return array of listings

  const fetchListings = async () => {
    try {
      const allListings: Listing[] = await invoke("get_listings");
    } catch (error) {
      console.error("Failed to fetch listings:", error);
    }
  };

  return (
    <div className="w-full max-w-full space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-6">
        {listings.map((listing, index) => (
          <ListingCard
            key={index}
            id={listing.id}
            address={listing.address}
            phoneNumber={listing.contact_phone}
            email={listing.contact_email}
            bedrooms={listing.bedrooms}
            bathrooms={listing.bathrooms}
            cost={listing.price_rent}
          />
        ))}
      </div>
    </div>
  );
};

export default ListingList;
