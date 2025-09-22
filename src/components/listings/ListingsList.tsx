"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Heart, List } from "lucide-react";
import ListingList from "@/components/listings/ListingList";

const ListingsList: React.FC = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("all");

    const handleAddListing = () => {
        router.push("/listings/create");
    };

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
                        onClick={handleAddListing}
                        variant="secondary"
                        className="cursor-pointer"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Listing
                    </Button>
                </div>

                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                >
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger
                            value="all"
                            className="flex items-center gap-2"
                        >
                            <List className="w-4 h-4" />
                            All Listings
                        </TabsTrigger>
                        <TabsTrigger
                            value="favorites"
                            className="flex items-center gap-2"
                        >
                            <Heart className="w-4 h-4" />
                            Favorites
                        </TabsTrigger>
                    </TabsList>

                    <div className="mt-6">
                        <TabsContent value="all" className="mt-0">
                            <ListingList
                                showFavoritesOnly={false}
                                sortByFavorites={true}
                            />
                        </TabsContent>
                        <TabsContent value="favorites" className="mt-0">
                            <ListingList
                                showFavoritesOnly={true}
                                sortByFavorites={false}
                            />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
};

export default ListingsList;
