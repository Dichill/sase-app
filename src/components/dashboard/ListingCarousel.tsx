import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import ListingCard from "../listings/ListingCard";
import { listingData } from "@/data/listingData";

const listings = listingData;

const FavoriteListingCarousel = () => {
  return (
    <div className="w-full px-18">
      <div className="w-full rounded-lg px-4 py-6 ">
        <h2 className="text-lg font-medium my-4">Favorite Listings</h2>

        <Carousel>
          <CarouselContent>
            {listings.map((listing, i) => (
              <CarouselItem key={i} className="px-4 lg:basis-1/3">
                <ListingCard
                  id={listing.id}
                  address={listing.address}
                  phoneNumber={listing.contact_phone}
                  email={listing.contact_email}
                  bedrooms={listing.bedrooms}
                  bathrooms={listing.bathrooms}
                  cost={listing.price_rent}
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
