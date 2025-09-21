import ListingList from "@/components/listings/ListingList";
import { Button } from "@/components/ui/button";
const Listings = () => {
  return (
    <div className="container mx-auto my-8 px-10">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Listings</h1>
          <Button asChild variant="secondary" className="cursor-pointer">
            <a href="/listings/create">Add Listing</a>
          </Button>
        </div>
        <div>
          <ListingList />
        </div>
      </div>
    </div>
  );
};

export default Listings;
