"use client";
import ListingCard from "./ListingCard";

const listings = [
    {
        id: 1,
        address: "444 Broke Blvd",
        city: "Broke City",
        phoneNumber: "123-456-7890",
        email: "prince@charming.com",
        bedrooms: "2",
        bathrooms: "2",
        cost: 1000,
    },
    {
        id: 2,
        address: "444 Rich Blvd",
        city: "Rich City",
        phoneNumber: "123-456-7890",
        email: "prince@charming.com",
        bedrooms: "3",
        bathrooms: "0",
        cost: 2000,
    },
];

const ListingList = () => {
    //GET /listings (PLS JUSTIN U GOT ME RIGHT?!)

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-10">
            {listings.map((listing, index) => (
                <ListingCard key={index} {...listing} />
            ))}
        </div>
    );
};

export default ListingList;
