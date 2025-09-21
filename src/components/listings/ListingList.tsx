"use client";
import ListingCard from "./ListingCard";
import { listingData } from "@/data/listingData";
import { Listing } from "@/utils/database";
import { invoke } from "@tauri-apps/api/core";

const listings = listingData;

const ListingList = () => {
  //GET /listings (PLS JUSTIN U GOT ME RIGHT?!) get listings from db, return array of listings

  let fetchListings = async () => {
    try {
      const allListings: Listing[] = await invoke("get_listings");
    } catch (error) {
      console.error("Failed to fetch listings:", error);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {listings.map((listing, index) => (
        <ListingCard
          key={index}
          id={listing.id}
          address={listing.address}
          city="city that gotta be damn PARSED!"
          phoneNumber={listing.contact_phone}
          email={listing.contact_email}
          bedrooms={listing.bedrooms}
          bathrooms={listing.bathrooms}
          cost={listing.price_rent}
        />
      ))}
    </div>
  );
};

export default ListingList;
