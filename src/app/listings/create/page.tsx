// DICHILL HELLPPPPPPPPPPp
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
  amenities: z.string().optional(),
  pet_policy: z.string().optional(),
  furnishing: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const CreateListing = () => {
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

  const onSubmit: SubmitHandler<FormData> = (values) => {
    // Do something with the form values.
    // This will be type-safe and validated.
    console.log(values);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div
        className="container mx-auto w-full px-10 justify-between"
        style={{ marginTop: "48px" }}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bookmark a listing
          </h1>
          <p className="text-muted-foreground mt-2">
            Like this place? Add it to your list to come back to later.
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
                    <h3 className="text-lg font-semibold">Basic Information</h3>
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
                          <FormLabel>Source Link *</FormLabel>
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
                          <FormLabel>Address *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="123 Main St, San Francisco, CA, 94103"
                              {...field}
                              required
                            />
                          </FormControl>
                          <FormDescription>
                            Format: Street, City, State, Zip Code
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
                            <FormLabel>Bedrooms *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                inputMode="numeric"
                                placeholder="0"
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
                        name="bathrooms"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Bathrooms *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                inputMode="numeric"
                                placeholder="0"
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
                        name="price_rent"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Price *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                inputMode="numeric"
                                placeholder="0"
                                {...field}
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
                            <FormLabel>Email</FormLabel>
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
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="123-456-7890" {...field} />
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
                          <FormLabel>Other Contact Methods</FormLabel>
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
                    <h3 className="text-lg font-semibold">Listing Details</h3>
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
                            <FormLabel>Housing Type</FormLabel>
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
                            <FormLabel>Lease Type</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Month-to-month, Annual"
                                {...field}
                              />
                            </FormControl>
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
                            <FormLabel>Upfront Fees</FormLabel>
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
                            <FormLabel>Square Footage</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                inputMode="numeric"
                                placeholder="0"
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
                      name="layout_description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Layout Description</FormLabel>
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
                          <FormLabel>Utilities</FormLabel>
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
                    <h3 className="text-lg font-semibold">Requirements</h3>
                    <p className="text-sm text-muted-foreground">
                      Tenant requirements and qualifications
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
                            <FormLabel>Credit Score Minimum</FormLabel>
                            <FormControl>
                              <Input placeholder="670" {...field} />
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
                            <FormLabel>Minimum Monthly Income</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                inputMode="numeric"
                                placeholder="1000"
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
                      name="references_required"
                      render={({ field }) => (
                        <FormItem className="flex gap-4">
                          <FormLabel>References Required</FormLabel>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                      Extra information about amenities, policies, and notes
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
                          <FormLabel>Amenities</FormLabel>
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
                          <FormLabel>Pet Policy</FormLabel>
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
                          <FormLabel>Furnishing</FormLabel>
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
                          <FormLabel>Additional Notes</FormLabel>
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
              Submit
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateListing;
