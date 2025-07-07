
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
  sellerId: z.string().min(1, { message: "Please select a seller." }),
  region: z.string().optional(),
  town: z.string().optional(),
  imageFile: z.any().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export function AdminProductForm({ product, sellers, onSubmit, onCancel }: AdminProductFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price || 0,
      currency: product?.currency || "GHS",
      category: product?.category || "",
      stock: product?.stock || 0,
      sellerId: product?.sellerId || "",
      region: product?.region || "",
      town: product?.town || "",
      imageFile: undefined,
    },
  });
  
  const [availableTowns, setAvailableTowns] = useState<string[]>([]);
  
  const watchedCurrency = form.watch("currency");
  const watchedRegion = form.watch("region");
  
  useEffect(() => {
    if (watchedRegion) {
      setAvailableTowns(GHANA_REGIONS_AND_TOWNS[watchedRegion] || []);
      if(product?.region !== watchedRegion) {
         form.setValue("town", "");
      }
    } else {
      setAvailableTowns([]);
      form.setValue("town", "");
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

  const handleSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    let imageUrl = product?.imageUrl || "";

    if (values.imageFile) {
        const file = values.imageFile;
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || "Image upload failed");
            }
            imageUrl = result.url;
        } catch (error) {
            toast({
                title: "Upload Failed",
                description: error instanceof Error ? error.message : "Could not upload image.",
                variant: "destructive",
            });
            setIsSubmitting(false);
            return;
        }
    }

    const selectedSeller = sellers.find(s => s.id === values.sellerId);
    const completeProductData: Product = {
      id: product?.id || String(Date.now()),
      name: values.name,
      description: values.description,
      price: values.price,
      currency: values.currency,
      category: values.category,
      stock: values.stock,
      imageUrl: imageUrl || "https://placehold.co/400x300.png",
      sellerId: values.sellerId,
      sellerName: selectedSeller?.name || "Unknown Seller",
      region: values.region || undefined,
      town: values.town || undefined,
    };
    
    onSubmit(completeProductData);
    setIsSubmitting(false);
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

        {product?.imageUrl && (
            <FormItem>
                <FormLabel>Current Image</FormLabel>
                <div className="w-24 h-24 rounded-md border flex items-center justify-center bg-muted flex-shrink-0">
                    <Image src={product.imageUrl} alt="Current product image" width={96} height={96} className="rounded-md object-cover w-full h-full" />
                </div>
            </FormItem>
        )}

        <FormField
            control={form.control}
            name="imageFile"
            render={({ field: { onChange, ...fieldProps } }) => (
                <FormItem>
                    <FormLabel>Product Image</FormLabel>
                    <FormControl>
                        <Input 
                            {...fieldProps}
                            type="file" 
                            accept="image/*"
                            onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)}
                            className="h-auto p-2"
                        />
                    </FormControl>
                    <FormDescription>
                    {product?.imageUrl ? 'Upload a new image to replace the existing one.' : 'Upload an image for the product.'}
                    </FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />
        
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
                  onValueChange={field.onChange}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a region" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">No Specific Region</SelectItem>
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

        {watchedRegion && availableTowns.length > 0 && (
          <FormField
            control={form.control}
            name="town"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Town (Optional)</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                  disabled={!watchedRegion || availableTowns.length === 0}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a town" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Select a town (Optional)</SelectItem>
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
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : (product ? "Save Changes" : "Add Product")}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
