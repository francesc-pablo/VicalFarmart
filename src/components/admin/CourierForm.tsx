
"use client";

import React, { useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Courier } from "@/types";
import { DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface CourierFormProps {
  courier?: Courier | null;
  onSubmit: (data: Omit<Courier, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const fileSchema = z.custom<File>((v) => v instanceof File, "Please upload a file").optional().nullable();

const courierFormSchema = z.object({
  // Company Info
  businessName: z.string().min(2, "Business name is required."),
  businessType: z.enum(["sole proprietorship", "partnership", "LLC", "corporation"], { required_error: "Business type is required." }),
  businessRegistrationNumber: z.string().optional(),
  businessLocation: z.string().min(3, "Business location is required."),
  tradeLicenseUrl: z.string().optional(),
  tradeLicenseFile: fileSchema,
  tinNumber: z.string().optional(),

  // Personal Info
  contactName: z.string().min(2, "Full name is required."),
  nationalIdUrl: z.string().optional(),
  nationalIdFile: fileSchema,
  phone: z.string().min(10, "A valid phone number is required."),
  email: z.string().email("Please enter a valid email."),
  residentialAddress: z.string().min(5, "Residential address is required."),
  policeClearanceUrl: z.string().optional(),
  policeClearanceFile: fileSchema,
  driverLicenseUrl: z.string().optional(),
  driverLicenseFile: fileSchema,
  licenseCategory: z.string().min(1, "License category is required."),

  // Vehicle Info
  vehicleType: z.string().min(2, "Vehicle type is required (e.g., Motorcycle, Van)."),
  vehicleRegistrationNumber: z.string().min(3, "Vehicle registration number is required."),
  vehicleInsuranceUrl: z.string().optional(),
  vehicleInsuranceFile: fileSchema,
  roadworthinessUrl: z.string().optional(),
  roadworthinessFile: fileSchema,
});

type CourierFormValues = z.infer<typeof courierFormSchema>;

export function CourierForm({ courier, onSubmit, onCancel }: CourierFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<CourierFormValues>({
    resolver: zodResolver(courierFormSchema),
    defaultValues: {
      businessName: courier?.businessName || "",
      businessType: courier?.businessType || undefined,
      businessRegistrationNumber: courier?.businessRegistrationNumber || "",
      businessLocation: courier?.businessLocation || "",
      tinNumber: courier?.tinNumber || "",
      contactName: courier?.contactName || "",
      phone: courier?.phone || "",
      email: courier?.email || "",
      residentialAddress: courier?.residentialAddress || "",
      licenseCategory: courier?.licenseCategory || "",
      vehicleType: courier?.vehicleType || "",
      vehicleRegistrationNumber: courier?.vehicleRegistrationNumber || "",
      tradeLicenseUrl: courier?.tradeLicenseUrl || "",
      nationalIdUrl: courier?.nationalIdUrl || "",
      policeClearanceUrl: courier?.policeClearanceUrl || "",
      driverLicenseUrl: courier?.driverLicenseUrl || "",
      vehicleInsuranceUrl: courier?.vehicleInsuranceUrl || "",
      roadworthinessUrl: courier?.roadworthinessUrl || "",
    },
  });

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
        throw new Error(result.message || `Failed to upload ${file.name}`);
    }
    return result.url;
  };


  const handleSubmit = async (values: CourierFormValues) => {
    setIsSubmitting(true);
    
    const dataToSubmit: Omit<Courier, 'id' | 'createdAt'> = {
        businessName: values.businessName,
        businessType: values.businessType,
        businessRegistrationNumber: values.businessRegistrationNumber,
        businessLocation: values.businessLocation,
        tinNumber: values.tinNumber,
        contactName: values.contactName,
        phone: values.phone,
        email: values.email,
        residentialAddress: values.residentialAddress,
        licenseCategory: values.licenseCategory,
        vehicleType: values.vehicleType,
        vehicleRegistrationNumber: values.vehicleRegistrationNumber,
        tradeLicenseUrl: courier?.tradeLicenseUrl,
        nationalIdUrl: courier?.nationalIdUrl,
        policeClearanceUrl: courier?.policeClearanceUrl,
        driverLicenseUrl: courier?.driverLicenseUrl,
        vehicleInsuranceUrl: courier?.vehicleInsuranceUrl,
        roadworthinessUrl: courier?.roadworthinessUrl,
    };
    
    const fileFields: (keyof CourierFormValues)[] = [
      'tradeLicenseFile', 'nationalIdFile', 'policeClearanceFile', 
      'driverLicenseFile', 'vehicleInsuranceFile', 'roadworthinessFile'
    ];
    const urlFields: (keyof typeof dataToSubmit)[] = [
      'tradeLicenseUrl', 'nationalIdUrl', 'policeClearanceUrl', 
      'driverLicenseUrl', 'vehicleInsuranceUrl', 'roadworthinessUrl'
    ];

    try {
      for (let i = 0; i < fileFields.length; i++) {
        const fileField = fileFields[i];
        const urlField = urlFields[i];
        const file = values[fileField as keyof typeof values] as File | undefined;
        if (file) {
          toast({ title: `Uploading ${file.name}...` });
          const url = await uploadFile(file);
          (dataToSubmit as any)[urlField] = url;
          toast({ title: `Successfully uploaded ${file.name}` });
        }
      }

      onSubmit(dataToSubmit);

    } catch (error) {
         toast({
            title: "Upload Failed",
            description: error instanceof Error ? error.message : "Could not upload one or more files.",
            variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
        
        <h3 className="text-lg font-semibold text-primary">Company Information</h3>
        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="businessName" render={({ field }) => (
                <FormItem><FormLabel>Business Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="businessType" render={({ field }) => (
                <FormItem><FormLabel>Business Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="sole proprietorship">Sole Proprietorship</SelectItem><SelectItem value="partnership">Partnership</SelectItem><SelectItem value="LLC">LLC</SelectItem><SelectItem value="corporation">Corporation</SelectItem></SelectContent></Select><FormMessage /></FormItem>
            )}/>
        </div>
        <FormField control={form.control} name="businessLocation" render={({ field }) => (
            <FormItem><FormLabel>Business Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="businessRegistrationNumber" render={({ field }) => (
                <FormItem><FormLabel>Business Registration No.</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="tinNumber" render={({ field }) => (
                <FormItem><FormLabel>Tax Identification Number (TIN)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>

        <FormField
          control={form.control}
          name="tradeLicenseFile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trade License</FormLabel>
              <FormControl>
                <Input 
                  type="file" 
                  className="h-auto p-2"
                  onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)}
                />
              </FormControl>
              {courier?.tradeLicenseUrl && (
                <FormDescription>
                  Current file: <a href={courier.tradeLicenseUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">View</a>. Upload a new file to replace it.
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />


        <h3 className="text-lg font-semibold text-primary pt-4">Personal Information</h3>
        <Separator />
        
        <FormField control={form.control} name="contactName" render={({ field }) => (
            <FormItem><FormLabel>Full Name (Contact Person)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
        <FormField control={form.control} name="residentialAddress" render={({ field }) => (
            <FormItem><FormLabel>Residential Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="nationalIdFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>National ID / Passport</FormLabel>
                  <FormControl>
                    <Input type="file" className="h-auto p-2" onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)} />
                  </FormControl>
                  {courier?.nationalIdUrl && ( <FormDescription> Current file: <a href={courier.nationalIdUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">View</a>. </FormDescription> )}
                  <FormMessage />
                </FormItem>
              )}
            />
           <FormField
              control={form.control}
              name="policeClearanceFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Police Clearance Certificate</FormLabel>
                  <FormControl>
                    <Input type="file" className="h-auto p-2" onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)} />
                  </FormControl>
                  {courier?.policeClearanceUrl && ( <FormDescription> Current file: <a href={courier.policeClearanceUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">View</a>. </FormDescription> )}
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <FormField
              control={form.control}
              name="driverLicenseFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Driver&apos;s / Riding License</FormLabel>
                  <FormControl>
                    <Input type="file" className="h-auto p-2" onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)} />
                  </FormControl>
                  {courier?.driverLicenseUrl && ( <FormDescription> Current file: <a href={courier.driverLicenseUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">View</a>. </FormDescription> )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="licenseCategory" render={({ field }) => (
                <FormItem><FormLabel>License Category/Type</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>

        <h3 className="text-lg font-semibold text-primary pt-4">Vehicle Information</h3>
        <Separator />

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="vehicleType" render={({ field }) => (
                <FormItem><FormLabel>Vehicle Type</FormLabel><FormControl><Input placeholder="e.g. Motorcycle, Van" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="vehicleRegistrationNumber" render={({ field }) => (
                <FormItem><FormLabel>Vehicle Registration No.</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="vehicleInsuranceFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Insurance Certificate</FormLabel>
                  <FormControl>
                    <Input type="file" className="h-auto p-2" onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)} />
                  </FormControl>
                  {courier?.vehicleInsuranceUrl && ( <FormDescription> Current file: <a href={courier.vehicleInsuranceUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">View</a>. </FormDescription> )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roadworthinessFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Roadworthiness Certificate</FormLabel>
                  <FormControl>
                    <Input type="file" className="h-auto p-2" onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)} />
                  </FormControl>
                  {courier?.roadworthinessUrl && ( <FormDescription> Current file: <a href={courier.roadworthinessUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">View</a>. </FormDescription> )}
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>


        <DialogFooter className="pt-6 sticky bottom-0 bg-background py-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : (courier ? "Save Changes" : "Add Courier")}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

    