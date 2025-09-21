"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { listingData } from "@/data/listingData";
import {
  Bed,
  Bath,
  Phone,
  Mail,
  LandPlot,
  MapPin,
  ArrowRight,
  BookUser,
  Save,
  X,
  SquareArrowOutUpRightIcon,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ListingPage = () => {
  const params = useParams();
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const listing = listingData.find((item) => item.id === params.id);

  if (!listing) {
    return <div>Listing not found</div>;
  }

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

  // JUSTIN ALL YOU!!!
  useEffect(() => {
    setNotes(listing.notes || "");
  }, [listing.notes]);

  const handleNotesChange = (value: string) => {
    setNotes(value);
    setHasUnsavedChanges(value !== (listing.notes || ""));
  };

  // JUSTIN ALL YOU!!!
  const handleSaveNotes = () => {
    console.log("Saving notes:", notes);
    setHasUnsavedChanges(false);
  };

  const handleDiscardNotes = () => {
    setNotes(listing.notes || "");
    setHasUnsavedChanges(false);
  };

  const handleEdit = () => {
    router.push(`/listings/${params.id as string}/edit`);
  };

  const handleDelete = () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this listing? This action cannot be undone."
    );

    if (confirmDelete) {
      // TODO: Implement actual delete logic here
      console.log("Deleting listing:", params.id);
      alert("Listing deleted successfully!");
      router.push("/listings"); // Navigate back to listings page
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="container mx-auto p-12">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-4xl font-bold">
              {parseAddress(listing.address)?.street}
            </h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="cursor-pointer"
                  aria-label="More actions"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleEdit}
                  className="cursor-pointer"
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="text-2xl font-bold">
            ${formatRent(listing.price_rent)}
            <span className="text-lg text-gray-700">/month</span>
          </div>
        </div>
        <div className="flex items-center gap-2 my-2">
          <MapPin className="w-5 h-5 text-gray-600" />
          <h3>
            {parseAddress(listing.address)?.city},{" "}
            {parseAddress(listing.address)?.state}
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Bed className="w-5 h-5 text-gray-600" />
                <span>{listing.bedrooms} beds</span>
              </div>
              <div className="flex items-center gap-2">
                <Bath className="w-5 h-5 text-gray-600" />
                <span>{listing.bathrooms} baths</span>
              </div>
              {listing.square_footage && (
                <div className="flex items-center gap-2">
                  <LandPlot className="w-5 h-5 text-gray-600" />
                  <span>{listing.square_footage} sq. ft</span>
                </div>
              )}
            </div>

            {listing.layout_description && (
              <div className="mt-8 space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold mb-2 text-lg">Description</h3>
                  <div>
                    <a
                      href={listing.source_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline "
                    >
                      <SquareArrowOutUpRightIcon className="w-4 h-4" />
                    </a>
                  </div>
                </div>
                <p className="text-gray-700">{listing.layout_description}</p>
              </div>
            )}

            <div className="py-6 border-t border-b ">
              <h3 className="font-semibold mb-2 text-lg">
                Contact Information
              </h3>
              <div className="space-y-2 mx-4">
                {listing.contact_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{listing.contact_phone}</span>
                  </div>
                )}
                {listing.contact_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{listing.contact_email}</span>
                  </div>
                )}
                {listing.contact_other && (
                  <div className="flex items-center gap-2">
                    <BookUser className="w-4 h-4" />
                    <span>{listing.contact_other}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="py-4">
              <h3 className="font-semibold text-lg">Additional Notes</h3>
              <Textarea
                value={notes}
                onChange={(e) => {
                  handleNotesChange(e.target.value);
                }}
                placeholder="Add your notes about this listing..."
                className="min-h-[120px] my-2"
              />
              {hasUnsavedChanges && (
                <div className="flex items-center gap-2 justify-self-end">
                  <Button
                    onClick={handleSaveNotes}
                    size="sm"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDiscardNotes}
                    size="sm"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    Discard
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">
                Leasing Information
              </h3>

              <div className="space-y-1">
                {listing.housing_type && (
                  <div className="px-4 flex">
                    <h3 className="font-medium text-gray-600 mb-2 flex-1 text-sm">
                      Housing Type:
                    </h3>
                    <p className="flex-1 text-sm">{listing.housing_type}</p>
                  </div>
                )}

                {listing.lease_type && (
                  <div className="px-4 flex">
                    <h3 className="font-medium text-gray-600 mb-2 flex-1 text-sm">
                      Lease Type:
                    </h3>
                    <p className="flex-1 text-sm">{listing.lease_type}</p>
                  </div>
                )}

                {listing.credit_score_min && (
                  <div className="px-4 flex">
                    <h3 className="font-medium text-gray-600 mb-2 flex-1 text-sm">
                      Minimum Credit Score:
                    </h3>
                    <p className="flex-1 text-sm">
                      {listing.credit_score_min}+
                    </p>
                  </div>
                )}

                {listing.minimum_income && (
                  <div className="px-4 flex">
                    <h3 className="font-medium text-gray-600 mb-2 flex-1 text-sm    ">
                      Minimum Income:
                    </h3>
                    <p className="flex-1 text-sm">
                      ${listing.minimum_income.toLocaleString()}/month
                    </p>
                  </div>
                )}

                {listing.pet_policy && (
                  <div className="px-4 flex">
                    <h3 className="font-medium text-gray-600 mb-2 flex-1 text-sm">
                      Pet Policy:
                    </h3>
                    <p className="flex-1 text-sm">{listing.pet_policy}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-lg mb-2">Features</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-4">
                {listing.amenities && (
                  <div>
                    <h3 className="font-medium text-gray-600 mb-2">
                      Amenities
                    </h3>
                    <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
                      {listing.amenities.split(", ").map((amenity, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 flex-shrink-0 text-gray-600" />
                          <span className="py-1 text-sm">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {listing.utilities && (
                  <div>
                    <h3 className="font-medium text-gray-600 mb-2">
                      Utilities
                    </h3>
                    <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
                      {listing.utilities.split(", ").map((utility, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 flex-shrink-0 text-gray-600" />
                          <span className="py-1 text-sm">{utility}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingPage;
