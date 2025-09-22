/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-confusing-void-expression */
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    getListing,
    updateListing,
    getDocuments,
    type Document,
    type Listing,
} from "@/utils/database";
import { ArrowLeft, Save } from "lucide-react";
import { useDatabaseContextSafe } from "@/components/DatabaseInitializer";

interface ListingEditProps {
    listingId: number;
}

const ListingEdit: React.FC<ListingEditProps> = ({ listingId }) => {
    const { isDatabaseInitialized } = useDatabaseContextSafe();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);

    // Form state
    const [formData, setFormData] = useState({
        address: "",
        bedrooms: 0,
        bathrooms: 0,
        source_link: "",
        price_rent: 0,
        contact_email: "",
        contact_phone: "",
        contact_other: "",
        housing_type: "",
        lease_type: "",
        square_footage: 0,
        upfront_fees: "",
        layout_description: "",
        utilities: "",
        credit_score_min: 0,
        minimum_income: 0,
        references_required: false,
        amenities: "",
        pet_policy: "",
        furnishing: "",
        notes: "",
        favorite: false,
    });

    useEffect(() => {
        const fetchListing = async () => {
            if (!isDatabaseInitialized) {
                console.log(
                    "Database not yet initialized, skipping listing fetch"
                );
                return;
            }

            try {
                const listing = await getListing(listingId);

                // Populate form with existing data
                setFormData({
                    address: listing.address,
                    bedrooms: listing.bedrooms ?? 0,
                    bathrooms: listing.bathrooms ?? 0,
                    source_link: listing.source_link,
                    price_rent: listing.price_rent,
                    contact_email: listing.contact_email ?? "",
                    contact_phone: listing.contact_phone ?? "",
                    contact_other: listing.contact_other ?? "",
                    housing_type: listing.housing_type ?? "",
                    lease_type: listing.lease_type ?? "",
                    square_footage: listing.square_footage ?? 0,
                    upfront_fees: listing.upfront_fees?.toString() ?? "",
                    layout_description: listing.layout_description ?? "",
                    utilities: listing.utilities ?? "",
                    credit_score_min: listing.credit_score_min ?? 0,
                    minimum_income: listing.minimum_income ?? 0,
                    references_required: listing.references_required ?? false,
                    amenities: listing.amenities ?? "",
                    pet_policy: listing.pet_policy ?? "",
                    furnishing: listing.furnishing ?? "",
                    notes: listing.notes ?? "",
                    favorite: listing.favorite ?? false,
                });

                setSelectedDocuments(listing.reference_document_ids ?? []);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch listing:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load listing"
                );
            } finally {
                setIsLoading(false);
            }
        };

        const fetchDocuments = async () => {
            if (!isDatabaseInitialized) {
                console.log(
                    "Database not yet initialized, skipping documents fetch"
                );
                return;
            }

            try {
                const fetchedDocuments = await getDocuments();
                setDocuments(fetchedDocuments);
            } catch (error) {
                console.error("Failed to fetch documents:", error);
            }
        };

        void fetchListing();
        void fetchDocuments();
    }, [listingId, isDatabaseInitialized]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await updateListing(
                listingId,
                formData.address,
                formData.contact_email || undefined,
                formData.contact_phone || undefined,
                formData.contact_other || undefined,
                formData.source_link,
                formData.price_rent,
                formData.housing_type || undefined,
                formData.lease_type as "month-to-month" | "annual" | undefined,
                formData.upfront_fees
                    ? parseFloat(formData.upfront_fees)
                    : undefined,
                formData.utilities || undefined,
                formData.credit_score_min || undefined,
                formData.minimum_income || undefined,
                formData.references_required || undefined,
                formData.bedrooms,
                formData.bathrooms,
                formData.square_footage || undefined,
                formData.layout_description || undefined,
                formData.amenities || undefined,
                formData.pet_policy || undefined,
                formData.furnishing as
                    | "furnished"
                    | "unfurnished"
                    | "semi-furnished"
                    | undefined,
                formData.notes || undefined,
                formData.favorite || undefined,
                selectedDocuments.length > 0 ? selectedDocuments : undefined
            );

            console.log("Listing updated successfully!");
            router.push(`/listings?id=${listingId}`);
        } catch (error) {
            console.error("Failed to update listing:", error);
            alert(
                `Failed to update listing: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (
        field: string,
        value: string | number | boolean
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleDocumentToggle = (documentId: number) => {
        setSelectedDocuments((prev) => {
            return prev.includes(documentId)
                ? prev.filter((id) => id !== documentId)
                : [...prev, documentId];
        });
    };

    if (isLoading || !isDatabaseInitialized) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">
                        {!isDatabaseInitialized
                            ? "Initializing database..."
                            : "Loading listing..."}
                    </h1>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Error</h1>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button
                        onClick={() => router.push("/listings")}
                        variant="outline"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to listings
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto">
            <div className="container mx-auto p-12">
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        onClick={() => router.push(`/listings?id=${listingId}`)}
                        variant="outline"
                        size="icon"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <h1 className="text-3xl font-bold">Edit Listing</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">
                            Basic Information
                        </h2>

                        <div>
                            <Label htmlFor="address">Address *</Label>
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) =>
                                    handleInputChange("address", e.target.value)
                                }
                                placeholder="123 Main St, San Francisco, CA, 94103"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="bedrooms">Bedrooms *</Label>
                                <Input
                                    id="bedrooms"
                                    type="number"
                                    min="0"
                                    value={formData.bedrooms}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "bedrooms",
                                            parseInt(e.target.value) || 0
                                        )
                                    }
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="bathrooms">Bathrooms *</Label>
                                <Input
                                    id="bathrooms"
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={formData.bathrooms}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "bathrooms",
                                            parseFloat(e.target.value) || 0
                                        )
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="price_rent">
                                    Monthly Rent ($) *
                                </Label>
                                <Input
                                    id="price_rent"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.price_rent}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "price_rent",
                                            parseFloat(e.target.value) || 0
                                        )
                                    }
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="square_footage">
                                    Square Footage
                                </Label>
                                <Input
                                    id="square_footage"
                                    type="number"
                                    min="0"
                                    value={formData.square_footage || ""}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "square_footage",
                                            parseInt(e.target.value) || 0
                                        )
                                    }
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="source_link">Source Link *</Label>
                            <Input
                                id="source_link"
                                value={formData.source_link}
                                onChange={(e) =>
                                    handleInputChange(
                                        "source_link",
                                        e.target.value
                                    )
                                }
                                placeholder="https://example.com/listing"
                                required
                            />
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">
                            Contact Information
                        </h2>

                        <div>
                            <Label htmlFor="contact_email">Contact Email</Label>
                            <Input
                                id="contact_email"
                                type="email"
                                value={formData.contact_email}
                                onChange={(e) =>
                                    handleInputChange(
                                        "contact_email",
                                        e.target.value
                                    )
                                }
                                placeholder="landlord@example.com"
                            />
                        </div>

                        <div>
                            <Label htmlFor="contact_phone">Contact Phone</Label>
                            <Input
                                id="contact_phone"
                                type="tel"
                                value={formData.contact_phone}
                                onChange={(e) =>
                                    handleInputChange(
                                        "contact_phone",
                                        e.target.value
                                    )
                                }
                                placeholder="(555) 123-4567"
                            />
                        </div>

                        <div>
                            <Label htmlFor="contact_other">
                                Other Contact Info
                            </Label>
                            <Input
                                id="contact_other"
                                value={formData.contact_other}
                                onChange={(e) =>
                                    handleInputChange(
                                        "contact_other",
                                        e.target.value
                                    )
                                }
                                placeholder="Text preferred, WhatsApp, etc."
                            />
                        </div>
                    </div>

                    {/* Property Details */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">
                            Property Details
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="housing_type">
                                    Housing Type
                                </Label>
                                <Select
                                    value={formData.housing_type}
                                    onValueChange={(value) =>
                                        handleInputChange("housing_type", value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select housing type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="apartment">
                                            Apartment
                                        </SelectItem>
                                        <SelectItem value="house">
                                            House
                                        </SelectItem>
                                        <SelectItem value="condo">
                                            Condo
                                        </SelectItem>
                                        <SelectItem value="townhouse">
                                            Townhouse
                                        </SelectItem>
                                        <SelectItem value="studio">
                                            Studio
                                        </SelectItem>
                                        <SelectItem value="other">
                                            Other
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="lease_type">Lease Type</Label>
                                <Select
                                    value={formData.lease_type}
                                    onValueChange={(value) =>
                                        handleInputChange("lease_type", value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select lease type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="month-to-month">
                                            Month-to-Month
                                        </SelectItem>
                                        <SelectItem value="annual">
                                            Annual
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="layout_description">
                                Layout Description
                            </Label>
                            <Textarea
                                id="layout_description"
                                value={formData.layout_description}
                                onChange={(e) =>
                                    handleInputChange(
                                        "layout_description",
                                        e.target.value
                                    )
                                }
                                placeholder="Describe the layout, features, and amenities of the property..."
                                className="min-h-[100px]"
                            />
                        </div>

                        <div>
                            <Label htmlFor="amenities">Amenities</Label>
                            <Textarea
                                id="amenities"
                                value={formData.amenities}
                                onChange={(e) =>
                                    handleInputChange(
                                        "amenities",
                                        e.target.value
                                    )
                                }
                                placeholder="In-unit laundry, Dishwasher, Parking, Gym, etc."
                            />
                        </div>

                        <div>
                            <Label htmlFor="pet_policy">Pet Policy</Label>
                            <Textarea
                                id="pet_policy"
                                value={formData.pet_policy}
                                onChange={(e) =>
                                    handleInputChange(
                                        "pet_policy",
                                        e.target.value
                                    )
                                }
                                placeholder="Cats allowed with deposit, No pets, etc."
                            />
                        </div>
                    </div>

                    {/* Requirements */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Requirements</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="credit_score_min">
                                    Minimum Credit Score
                                </Label>
                                <Input
                                    id="credit_score_min"
                                    type="number"
                                    min="300"
                                    max="850"
                                    value={formData.credit_score_min || ""}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "credit_score_min",
                                            parseInt(e.target.value) || 0
                                        )
                                    }
                                />
                            </div>

                            <div>
                                <Label htmlFor="minimum_income">
                                    Minimum Monthly Income ($)
                                </Label>
                                <Input
                                    id="minimum_income"
                                    type="number"
                                    min="0"
                                    value={formData.minimum_income || ""}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "minimum_income",
                                            parseInt(e.target.value) || 0
                                        )
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="references_required"
                                checked={formData.references_required}
                                onCheckedChange={(checked) =>
                                    handleInputChange(
                                        "references_required",
                                        checked
                                    )
                                }
                            />
                            <Label htmlFor="references_required">
                                References Required
                            </Label>
                        </div>

                        {formData.references_required && (
                            <div className="space-y-4">
                                <Label>Reference Documents</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {documents.map((document) => (
                                        <div
                                            key={document.id}
                                            className="flex items-center space-x-2"
                                        >
                                            <Checkbox
                                                id={`doc-${document.id}`}
                                                checked={selectedDocuments.includes(
                                                    document.id!
                                                )}
                                                onCheckedChange={() =>
                                                    handleDocumentToggle(
                                                        document.id!
                                                    )
                                                }
                                            />
                                            <Label
                                                htmlFor={`doc-${document.id}`}
                                                className="text-sm font-medium leading-none"
                                            >
                                                {document.name}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                                {documents.length === 0 && (
                                    <p className="text-sm text-muted-foreground">
                                        No documents available. Add documents in
                                        the Documents section first.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Additional Notes */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">
                            Additional Notes
                        </h2>

                        <div>
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) =>
                                    handleInputChange("notes", e.target.value)
                                }
                                placeholder="Any additional notes or comments about this listing..."
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="favorite"
                                checked={formData.favorite}
                                onCheckedChange={(checked) =>
                                    handleInputChange("favorite", checked)
                                }
                            />
                            <Label htmlFor="favorite">Mark as Favorite</Label>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Update Listing
                                </>
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                router.push(`/listings?id=${listingId}`)
                            }
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ListingEdit;
