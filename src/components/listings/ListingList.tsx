"use client";
import ListingCard from "./ListingCard";
import { listingData } from "@/data/listingData";
import FavoriteListingCarousel from "../dashboard/ListingCarousel";

const listings = listingData;

const ListingList = () => {
  //GET /listings (PLS JUSTIN U GOT ME RIGHT?!) get listings from db, return array of listings

  return (
    <div className="w-full max-w-full space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
