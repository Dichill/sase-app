"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    Listing,
    getListing,
    getDocuments,
    updateListing,
    type Document,
} from "@/utils/database";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { invoke } from "@tauri-apps/api/core";
import { CheckCircle2Icon } from "lucide-react";

const formSchema = z.object({
    address: z
        .string()
        .min(2, "Address must be at least 2 characters")
        .regex(
            /^.+,\s*.+,\s*[A-Za-z]{2},?\s*\d{5}(-\d{4})?$/,
            "Address must be in format: Street, City, State, Zip (e.g., 123 Main St, San Francisco, CA, 94103)"
        ),
    bedrooms: z.number().min(0, "Bedrooms must be 0 or greater"),
    bathrooms: z.number().min(0, "Bathrooms must be 0 or greater"),
    source_link: z.string().min(1, "Source link is required"),
    price_rent: z.number().min(0, "Price must be 0 or greater"),
    contact_email: z.string().optional(),
    contact_phone: z.string().optional(),
    contact_other: z.string().optional(),
    housing_type: z.string().optional(),
    lease_type: z.string().optional(),
    square_footage: z.number().min(0).optional(),
    upfront_fees: z.string().optional(),
    layout_description: z.string().optional(),
    utilities: z.string().optional(),
    credit_score_min: z.number().min(300).max(850).optional(),
    minimum_income: z.number().min(0).optional(),
    references_required: z.boolean().optional(),
    reference_document_ids: z.array(z.number()).optional(),
    amenities: z.string().optional(),
    pet_policy: z.string().optional(),
    furnishing: z.string().optional(),
    notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const EditListing = () => {
    const params = useParams();
    const router = useRouter();
    const listingId = params.id as string;
    const [existingListing, setExistingListing] = useState<Listing | null>(
        null
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            address: "",
            bedrooms: 0,
            bathrooms: 0,
            source_link: "",
            price_rent: 0,
        },
    });

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const listingIdNumber = Number(listingId);
                if (isNaN(listingIdNumber)) {
                    setError("Invalid listing ID");
                    setLoading(false);
                    return;
                }

                const fetchedListing = await getListing(listingIdNumber);
                setExistingListing(fetchedListing);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch listing:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load listing"
                );
            } finally {
                setLoading(false);
            }
        };

        const fetchDocuments = async () => {
            try {
                const fetchedDocuments = await getDocuments();
                setDocuments(fetchedDocuments);
            } catch (error) {
                console.error("Failed to fetch documents:", error);
            }
        };

        void fetchListing();
        void fetchDocuments();
    }, [listingId]);

    useEffect(() => {
        if (existingListing) {
            form.reset({
                address: existingListing.address,
                bedrooms: existingListing.bedrooms ?? 0,
                bathrooms: existingListing.bathrooms ?? 0,
                source_link: existingListing.source_link,
                price_rent: existingListing.price_rent,
                contact_email: existingListing.contact_email ?? "",
                contact_phone: existingListing.contact_phone ?? "",
                contact_other: existingListing.contact_other ?? "",
                housing_type: existingListing.housing_type ?? "",
                lease_type: existingListing.lease_type ?? "",
                square_footage: existingListing.square_footage,
                upfront_fees: existingListing.upfront_fees?.toString() ?? "",
                layout_description: existingListing.layout_description ?? "",
                utilities: existingListing.utilities ?? "",
                credit_score_min: existingListing.credit_score_min,
                minimum_income: existingListing.minimum_income,
                references_required:
                    existingListing.references_required ?? false,
                reference_document_ids:
                    existingListing.reference_document_ids ?? [],
                amenities: existingListing.amenities ?? "",
                pet_policy: existingListing.pet_policy ?? "",
                furnishing: existingListing.furnishing ?? "",
                notes: existingListing.notes ?? "",
            });
            setSelectedDocuments(existingListing.reference_document_ids ?? []);
        }
    }, [existingListing, form]);

    const handleDocumentSelection = (documentId: number, checked: boolean) => {
        setSelectedDocuments((prev) => {
            const newSelection = checked
                ? [...prev, documentId]
                : prev.filter((id) => id !== documentId);

            // Update form value
            form.setValue("reference_document_ids", newSelection);
            return newSelection;
        });
    };

    const onSubmit: SubmitHandler<FormData> = async (values) => {
        // Update the listing with the form values
        console.log("Updating listing:", listingId, values);

        try {
            await updateListing(
                Number(listingId),
                values.address,
                values.contact_email,
                values.contact_phone,
                values.contact_other,
                values.source_link,
                values.price_rent,
                values.housing_type,
                values.lease_type as "month-to-month" | "annual" | undefined,
                values.upfront_fees
                    ? parseFloat(values.upfront_fees)
                    : undefined,
                values.utilities,
                values.credit_score_min,
                values.minimum_income,
                values.references_required,
                values.bedrooms,
                values.bathrooms,
                values.square_footage,
                values.layout_description,
                values.amenities,
                values.pet_policy,
                values.furnishing as
                    | "furnished"
                    | "unfurnished"
                    | "semi-furnished"
                    | undefined,
                values.notes,
                undefined, // favorite - not in form
                values.reference_document_ids
            );

            console.log("Listing updated successfully!");
            router.push(`/listings/${listingId}`);
        } catch (error) {
            console.error("Failed to update listing:", error);
            alert(
                `Failed to update listing: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Loading...</h1>
                </div>
            </div>
        );
    }

    // Show error if listing not found
    if (error || !existingListing) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">
                        {error ?? "Listing Not Found"}
                    </h1>
                    <button
                        onClick={() => {
                            router.push("/listings");
                        }}
                        className="text-blue-600 hover:underline"
                    >
                        Back to listings
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto">
            <div className="container mx-auto max-w-4xl p-6">
                <h1 className="text-2xl font-bold mb-4">Edit Listing</h1>
                <Form {...form}>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            void form.handleSubmit(onSubmit)(e);
                        }}
                        className="space-y-6 pb-8"
                    >
                        <Accordion type="multiple">
                            <AccordionItem value="item-1" className="py-2">
                                <AccordionTrigger className="cursor-pointer">
                                    <div className="py-2">
                                        <h3 className="text-lg font-semibold">
                                            Basic Information
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Basic information of the listing
                                        </p>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-4 px-6 my-4">
                                        <FormField
                                            control={form.control}
                                            name="source_link"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Source Link *
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="https://example.com"
                                                            {...field}
                                                            required
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="address"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Address *
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="123 Main St, San Francisco, CA, 94103"
                                                            {...field}
                                                            required
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Format: Street, City,
                                                        State, Zip Code
                                                    </FormDescription>

                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="flex gap-4 w-full">
                                            <FormField
                                                control={form.control}
                                                name="bedrooms"
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormLabel>
                                                            Bedrooms *
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                inputMode="numeric"
                                                                placeholder="0"
                                                                {...field}
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    field.onChange(
                                                                        parseFloat(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        ) || 0
                                                                    );
                                                                }}
                                                                required
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="bathrooms"
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormLabel>
                                                            Bathrooms *
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                inputMode="numeric"
                                                                placeholder="0"
                                                                {...field}
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    field.onChange(
                                                                        parseFloat(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        ) || 0
                                                                    );
                                                                }}
                                                                required
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="price_rent"
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormLabel>
                                                            Price *
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                inputMode="numeric"
                                                                placeholder="0"
                                                                {...field}
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    field.onChange(
                                                                        parseFloat(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        ) || 0
                                                                    );
                                                                }}
                                                                required
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2" className="py-2">
                                <AccordionTrigger className="cursor-pointer">
                                    <div className="py-2">
                                        <h3 className="text-lg font-semibold">
                                            Contact Information
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            How to reach the landlord
                                        </p>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-4 px-6 my-4">
                                        <div className="flex gap-4">
                                            <FormField
                                                control={form.control}
                                                name="contact_email"
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormLabel>
                                                            Email
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="email@example.com"
                                                                {...field}
                                                            />
                                                        </FormControl>

                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="contact_phone"
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormLabel>
                                                            Phone
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="123-456-7890"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="contact_other"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Other Contact Methods
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Instagram, Facebook, etc."
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3" className="py-2">
                                <AccordionTrigger className="cursor-pointer">
                                    <div className="py-2">
                                        <h3 className="text-lg font-semibold">
                                            Listing Details
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Additional details about the listing
                                        </p>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-4 px-6 my-4">
                                        <div className="flex gap-4">
                                            <FormField
                                                control={form.control}
                                                name="housing_type"
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormLabel>
                                                            Housing Type
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Apartment, House, etc."
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="lease_type"
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormLabel>
                                                            Lease Type
                                                        </FormLabel>
                                                        <Select
                                                            onValueChange={
                                                                field.onChange
                                                            }
                                                            value={field.value}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select lease type" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="month-to-month">
                                                                    Month-to-month
                                                                </SelectItem>
                                                                <SelectItem value="annual">
                                                                    Annual
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="flex gap-4">
                                            <FormField
                                                control={form.control}
                                                name="upfront_fees"
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormLabel>
                                                            Upfront Fees
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Security Deposit, Application Fee, etc."
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="square_footage"
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormLabel>
                                                            Square Footage
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                inputMode="numeric"
                                                                placeholder="0"
                                                                {...field}
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    field.onChange(
                                                                        e.target
                                                                            .value
                                                                            ? parseFloat(
                                                                                  e
                                                                                      .target
                                                                                      .value
                                                                              ) ||
                                                                                  undefined
                                                                            : undefined
                                                                    );
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="layout_description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Layout Description
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Describe the layout, room arrangements, etc."
                                                            className="h-24"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="utilities"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Utilities
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Utilities included, etc."
                                                            className="h-24"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-4" className="py-2">
                                <AccordionTrigger className="cursor-pointer">
                                    <div className="py-2">
                                        <h3 className="text-lg font-semibold">
                                            Requirements
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Tenant requirements and
                                            qualifications
                                        </p>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-4 px-6 my-4">
                                        <div className="flex gap-4">
                                            <FormField
                                                control={form.control}
                                                name="credit_score_min"
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormLabel>
                                                            Credit Score Minimum
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                inputMode="numeric"
                                                                placeholder="670"
                                                                {...field}
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    field.onChange(
                                                                        e.target
                                                                            .value
                                                                            ? parseFloat(
                                                                                  e
                                                                                      .target
                                                                                      .value
                                                                              ) ||
                                                                                  undefined
                                                                            : undefined
                                                                    );
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="minimum_income"
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormLabel>
                                                            Minimum Monthly
                                                            Income
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                inputMode="numeric"
                                                                placeholder="1000"
                                                                {...field}
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    field.onChange(
                                                                        e.target
                                                                            .value
                                                                            ? parseFloat(
                                                                                  e
                                                                                      .target
                                                                                      .value
                                                                              ) ||
                                                                                  undefined
                                                                            : undefined
                                                                    );
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="references_required"
                                            render={({ field }) => (
                                                <FormItem className="flex gap-4">
                                                    <FormLabel>
                                                        References Required
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={
                                                                field.value
                                                            }
                                                            onCheckedChange={
                                                                field.onChange
                                                            }
                                                        />
                                                    </FormControl>

                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {form.watch("references_required") && (
                                            <div className="space-y-3">
                                                <FormLabel>
                                                    Select Reference Documents
                                                </FormLabel>
                                                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                                                    {documents.length === 0 ? (
                                                        <p className="text-sm text-muted-foreground">
                                                            No documents
                                                            available. Please
                                                            add documents first.
                                                        </p>
                                                    ) : (
                                                        documents.map(
                                                            (document) => (
                                                                <div
                                                                    key={
                                                                        document.id
                                                                    }
                                                                    className="flex items-center space-x-2"
                                                                >
                                                                    <Checkbox
                                                                        id={`doc-${document.id}`}
                                                                        checked={selectedDocuments.includes(
                                                                            document.id!
                                                                        )}
                                                                        onCheckedChange={(
                                                                            checked
                                                                        ) => {
                                                                            handleDocumentSelection(
                                                                                document.id!,
                                                                                checked as boolean
                                                                            );
                                                                        }}
                                                                    />
                                                                    <label
                                                                        htmlFor={`doc-${document.id}`}
                                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                                    >
                                                                        {
                                                                            document.name
                                                                        }
                                                                        <span className="text-muted-foreground ml-2">
                                                                            (
                                                                            {
                                                                                document.document_type
                                                                            }
                                                                            )
                                                                        </span>
                                                                    </label>
                                                                </div>
                                                            )
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-5" className="py-2">
                                <AccordionTrigger className="cursor-pointer">
                                    <div className="py-2">
                                        <h3 className="text-lg font-semibold">
                                            Additional Details
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Extra information about amenities,
                                            policies, and notes
                                        </p>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-4 px-6 my-4">
                                        <FormField
                                            control={form.control}
                                            name="amenities"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Amenities
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Pool, Gym, etc."
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="pet_policy"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Pet Policy
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Pets allowed? Any restrictions or fees?"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="furnishing"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Furnishing
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Furnished, Unfurnished, Semi-furnished"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="notes"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Additional Notes
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Additional notes"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                        <Button type="submit" className="w-full mt-10">
                            Update Listing
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
};

export default EditListing;
