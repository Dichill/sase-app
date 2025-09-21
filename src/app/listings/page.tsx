import ListingList from "@/components/listings/ListingList";
import { Button } from "@/components/ui/button";
const Listings = () => {
    return (
        <div className="h-full overflow-y-auto">
            <div
                className="container mx-auto w-full px-10 justify-between"
                style={{ marginTop: "48px" }}
            >
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Listings
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Manage your listings and properties
                        </p>
                    </div>
                    <Button
                        asChild
                        variant="secondary"
                        className="cursor-pointer"
                    >
                        <a href="/listings/create">Add Listing</a>
                    </Button>
                </div>
            </div>
            <div>
                <ListingList />
            </div>
        </div>
    );
};

export default Listings;
