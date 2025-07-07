
"use client";

import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Product, User } from "@/types";
import { PRODUCT_CATEGORIES, PRODUCT_REGIONS, GHANA_REGIONS_AND_TOWNS } from "@/lib/constants";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { CldUploadButton } from "next-cloudinary";
import { UploadCloud } from "lucide-react";


interface AdminProductFormProps {
  product?: Product | null;
  sellers: User[];
  onSubmit: (data: Product) => void;
  onCancel: () => void;
}

const CURRENCY_OPTIONS = [
  { value: "GHS", label: "GHS (₵)" },
  { value: "USD", label: "USD ($)" },
  { value: "NGN", label: "NGN (₦)" },
  { value: "XOF", label: "XOF (CFA)" },
  { value: "SLL", label: "SLL (Le)" },
  { value: "LRD", label: "LRD (L$)" },
  { value: "GMD", label: "GMD (D)" },
  { value: "GNF", label: "GNF (FG)" },
  { value: "CVE", label: "CVE (Esc)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
];

const productFormSchema = z.object({
  name: z.string().min(3, { message: "Product name must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  price: z.coerce.number().positive({ message: "Price must be a positive number." }),
  currency: z.string().default("GHS"),
  category: z.string().min(1, { message: "Please select a category." }),
  stock: z.coerce.number().int().min(0, { message: "Stock cannot be negative." }),
  imageUrl: z.string().url({ message: "Please enter a valid image URL." }).optional().or(z.literal('')),
  sellerId: z.string().min(1, { message: "Please select a seller." }),
  region: z.string().optional(),
  town: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

const NO_REGION_VALUE = "--NONE--";
const NO_TOWN_VALUE = "--NONE--";

export function AdminProductForm({ product, sellers, onSubmit, onCancel }: AdminProductFormProps) {
  const { toast } = useToast();
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price || 0,
      currency: product?.currency || "GHS",
      category: product?.category || "",
      stock: product?.stock || 0,
      imageUrl: product?.imageUrl || "",
      sellerId: product?.sellerId || "",
      region: product?.region || undefined,
      town: product?.town || undefined,
    },
  });
  
  const [availableTowns, setAvailableTowns] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || "");
  
  const watchedCurrency = form.watch("currency");
  const watchedRegion = form.watch("region");
  
  useEffect(() => {
    if (product?.imageUrl) {
      setImageUrl(product.imageUrl);
      form.setValue('imageUrl', product.imageUrl);
    }
  }, [product, form]);

  useEffect(() => {
    if (watchedRegion && watchedRegion !== NO_REGION_VALUE) {
      setAvailableTowns(GHANA_REGIONS_AND_TOWNS[watchedRegion] || []);
      if(product?.region !== watchedRegion) {
         form.setValue("town", undefined);
      }
    } else {
      setAvailableTowns([]);
      form.setValue("town", undefined);
    }
  }, [watchedRegion, form, product?.region]);


  const getCurrencySymbol = (currencyCode?: string) => {
    const option = CURRENCY_OPTIONS.find(opt => opt.value === currencyCode);
    if (option && option.label) {
        const symbolMatch = option.label.match(/\(([^)]+)\)/);
        if (symbolMatch && symbolMatch[1]) {
            return symbolMatch[1];
        }
    }
    return "$";
  };

  const handleSubmit = (values: ProductFormValues) => {
    const selectedSeller = sellers.find(s => s.id === values.sellerId);
    const completeProductData: Product = {
      id: product?.id || String(Date.now()),
      ...values,
      sellerName: selectedSeller?.name || "Unknown Seller",
      imageUrl: values.imageUrl || "https://placehold.co/400x300.png",
      region: values.region === NO_REGION_VALUE ? undefined : values.region,
      town: values.town === NO_TOWN_VALUE || !values.town ? undefined : values.town,
      currency: values.currency,
    };
    onSubmit(completeProductData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        <FormField
          control={form.control}
          name="sellerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Seller</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a seller" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sellers.map((seller) => (
                    <SelectItem key={seller.id} value={seller.id}>
                      {seller.name} ({seller.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Fresh Strawberries" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Product Image</FormLabel>
          <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-md border flex items-center justify-center bg-muted flex-shrink-0">
                  {imageUrl ? (
                      <Image src={imageUrl} alt="Product preview" width={96} height={96} className="rounded-md object-cover w-full h-full" />
                  ) : (
                      <span className="text-xs text-muted-foreground text-center p-2">Image Preview</span>
                  )}
              </div>
              <CldUploadButton
                  options={{ sources: ['local', 'url', 'camera'], multiple: false }}
                  signatureEndpoint="/api/upload"
                  onSuccess={(result: any) => {
                      const url = result?.info?.secure_url;
                      if (url) {
                          setImageUrl(url);
                          form.setValue('imageUrl', url, { shouldValidate: true });
                          toast({
                              title: "Image Uploaded",
                              description: "The image is ready to be saved.",
                          });
                      }
                  }}
                  onError={(error) => {
                      console.error("Cloudinary upload error:", error);
                      toast({
                          title: "Upload Failed",
                          description: "Could not upload the image. Please check credentials and console.",
                          variant: "destructive"
                      });
                  }}
              >
                  <Button type="button" variant="outline">
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Upload Image
                  </Button>
              </CldUploadButton>
          </div>
          <FormDescription>
            Upload an image for your product. Click save when finished.
          </FormDescription>
          <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                  <FormItem className="hidden">
                  <FormControl>
                      <Input {...field} />
                  </FormControl>
                  <FormMessage />
                  </FormItem>
              )}
          />
        </FormItem>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe the product..." {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Price ({getCurrencySymbol(watchedCurrency)})</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Quantity</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
            control={form.control}
            name="region"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Region</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value === NO_REGION_VALUE ? undefined : value);
                  }}
                  value={field.value ?? NO_REGION_VALUE}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a region" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NO_REGION_VALUE}>No Specific Region</SelectItem>
                    {PRODUCT_REGIONS.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

        {watchedRegion && watchedRegion !== NO_REGION_VALUE && availableTowns.length > 0 && (
          <FormField
            control={form.control}
            name="town"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Town (Optional)</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value === NO_TOWN_VALUE ? undefined : value);
                  }}
                  value={field.value ?? NO_TOWN_VALUE}
                  disabled={!watchedRegion || watchedRegion === NO_REGION_VALUE || availableTowns.length === 0}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a town" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NO_TOWN_VALUE}>Select a town (Optional)</SelectItem>
                    {availableTowns.map((town) => (
                      <SelectItem key={town} value={town}>
                        {town}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <DialogFooter className="pt-6 sticky bottom-0 bg-background py-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
            </Button>
          </DialogClose>
          <Button type="submit">{product ? "Save Changes" : "Add Product"}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
