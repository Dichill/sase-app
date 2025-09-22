/* eslint-disable @typescript-eslint/no-misused-promises */
// DICHILL HELLPPPPPPPPPPp
"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { addListing, getDocuments, type Document } from "@/utils/database";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

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
    favorite: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

const CreateListing = () => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
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
            favorite: false,
            reference_document_ids: [],
        },
    });

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const fetchedDocuments = await getDocuments();
                setDocuments(fetchedDocuments);
            } catch (error) {
                console.error("Failed to fetch documents:", error);
            }
        };

        void fetchDocuments();
    }, []);

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
        setIsSubmitting(true);

        try {
            const listingData = {
                address: values.address,
                source_link: values.source_link,
                price_rent: values.price_rent,
                contact_email: values.contact_email ?? undefined,
                contact_phone: values.contact_phone ?? undefined,
                contact_other: values.contact_other ?? undefined,
                housing_type: values.housing_type ?? undefined,
                lease_type: values.lease_type as
                    | "month-to-month"
                    | "annual"
                    | undefined,
                upfront_fees: values.upfront_fees
                    ? parseFloat(values.upfront_fees)
                    : undefined,
                utilities: values.utilities ?? undefined,
                credit_score_min: values.credit_score_min ?? undefined,
                minimum_income: values.minimum_income ?? undefined,
                references_required: values.references_required ?? undefined,
                bedrooms: values.bedrooms,
                bathrooms: values.bathrooms,
                square_footage: values.square_footage,
                layout_description: values.layout_description,
                amenities: values.amenities ?? undefined,
                pet_policy: values.pet_policy ?? undefined,
                furnishing: values.furnishing as
                    | "furnished"
                    | "unfurnished"
                    | "semi-furnished"
                    | undefined,
                notes: values.notes ?? undefined,
                favorite: values.favorite ?? false,
                reference_document_ids: values.reference_document_ids ?? [],
            };

            const listingId = await addListing(listingData);
            console.log("Listing created successfully with ID:", listingId);
            router.push("/listings");
        } catch (error) {
            console.error("Failed to create listing:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full h-full">
            <div
                className="container mx-auto w-full px-10"
                style={{ marginTop: "48px", marginBottom: "64px" }}
            >
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Bookmark a Listing
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Fill out the form to bookmark a listing
                    </p>
                </div>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
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
                                        <FormField
                                            control={form.control}
                                            name="favorite"
                                            render={({ field }) => (
                                                <FormItem className="flex gap-4 items-center">
                                                    <FormLabel>
                                                        Mark as Favorite
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
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                        <Button
                            type="submit"
                            className="w-full mt-10"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Creating Listing..." : "Submit"}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
};

export default CreateListing;
