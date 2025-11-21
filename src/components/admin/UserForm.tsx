
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User, UserRole } from "@/types";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { PRODUCT_REGIONS, GHANA_REGIONS_AND_TOWNS } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface UserFormProps {
  user?: User | null;
  onSubmit: (data: Partial<User>) => void;
  onCancel: () => void;
}

const fileSchema = z.custom<File>((v) => v instanceof File, "Please upload a file").optional().nullable();

const userFormSchemaBase = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().optional(),
  address: z.string().optional(),
  region: z.string().optional(),
  town: z.string().optional(),
  role: z.enum(["customer", "seller", "admin", "courier"], { required_error: "Please select a role." }),
  // Seller fields
  businessName: z.string().optional(),
  businessOwnerName: z.string().optional(),
  businessAddress: z.string().optional(),
  contactNumber: z.string().optional(),
  businessLocationRegion: z.string().optional(),
  businessLocationTown: z.string().optional(),
  geoCoordinatesLat: z.string().optional(),
  geoCoordinatesLng: z.string().optional(),
  businessType: z.string().optional(),
  // Courier fields
  businessRegistrationNumber: z.string().optional(),
  businessLocation: z.string().optional(),
  tradeLicenseFile: fileSchema,
  tinNumber: z.string().optional(),
  nationalIdFile: fileSchema,
  residentialAddress: z.string().optional(),
  policeClearanceFile: fileSchema,
  driverLicenseFile: fileSchema,
  licenseCategory: z.string().optional(),
  vehicleType: z.string().optional(),
  vehicleRegistrationNumber: z.string().optional(),
  vehicleInsuranceFile: fileSchema,
  roadworthinessFile: fileSchema,
});

const userFormSchemaCreate = userFormSchemaBase.extend({
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const userFormSchemaUpdate = userFormSchemaBase.extend({
  password: z.string().min(6, { message: "Password must be at least 6 characters." }).optional().or(z.literal('')),
});


type UserFormValues = z.infer<typeof userFormSchemaBase> & { password?: string };

const NO_REGION_VALUE = "--NONE--";
const NO_TOWN_VALUE = "--NONE--";

export function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const isEditing = !!user;
  const formSchema = isEditing ? userFormSchemaUpdate : userFormSchemaCreate;
  const [availableTowns, setAvailableTowns] = useState<string[]>([]);
  const [availableBusinessTowns, setAvailableBusinessTowns] = useState<string[]>([]);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      region: user?.region || undefined,
      town: user?.town || undefined,
      role: user?.role || "customer",
      password: "",
      // Seller
      businessName: user?.businessName || "",
      businessOwnerName: user?.businessOwnerName || "",
      businessAddress: user?.businessAddress || "",
      contactNumber: user?.contactNumber || "",
      businessLocationRegion: user?.businessLocationRegion || undefined,
      businessLocationTown: user?.businessLocationTown || undefined,
      geoCoordinatesLat: user?.geoCoordinatesLat || "",
      geoCoordinatesLng: user?.geoCoordinatesLng || "",
      businessType: user?.businessType || "",
      // Courier
      businessRegistrationNumber: user?.businessRegistrationNumber || "",
      businessLocation: user?.businessLocation || "",
      tinNumber: user?.tinNumber || "",
      residentialAddress: user?.residentialAddress || "",
      licenseCategory: user?.licenseCategory || "",
      vehicleType: user?.vehicleType || "",
      vehicleRegistrationNumber: user?.vehicleRegistrationNumber || "",
    },
  });

  const { formState: { isSubmitting } } = form;

  const watchedRole = form.watch("role");
  const watchedRegion = form.watch("region");
  const watchedBusinessRegion = form.watch("businessLocationRegion");

  useEffect(() => {
    if (watchedRegion && watchedRegion !== NO_REGION_VALUE) {
      setAvailableTowns(GHANA_REGIONS_AND_TOWNS[watchedRegion] || []);
      if(user?.region !== watchedRegion) {
        form.setValue("town", undefined);
      }
    } else {
      setAvailableTowns([]);
      form.setValue("town", undefined);
    }
  }, [watchedRegion, form, user?.region]);
  
  const courierRoleActive = watchedRole === 'courier';
  const courierBusinessType = form.watch('businessType' as any); // Using `any` for conditional field
  
  useEffect(() => {
    if (courierRoleActive && courierBusinessType && courierBusinessType !== 'sole proprietorship') {
       // logic for other business types
    }
  }, [courierRoleActive, courierBusinessType]);


  useEffect(() => {
    if ((watchedRole === 'seller' || watchedRole === 'courier') && watchedBusinessRegion && watchedBusinessRegion !== NO_REGION_VALUE) {
      setAvailableBusinessTowns(GHANA_REGIONS_AND_TOWNS[watchedBusinessRegion] || []);
      if(user?.businessLocationRegion !== watchedBusinessRegion) {
        form.setValue("businessLocationTown", undefined);
      }
    } else {
      setAvailableBusinessTowns([]);
      form.setValue("businessLocationTown", undefined);
    }
  }, [watchedBusinessRegion, watchedRole, form, user?.businessLocationRegion]);

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
    });
    
    if (!response.ok) {
        const errorResult = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
        throw new Error(errorResult.message || `Failed to upload ${file.name}. Status: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success || !result.url) {
        throw new Error(result.message || `API error when uploading ${file.name}.`);
    }
    
    return result.url;
  };

  const handleSubmit = async (values: UserFormValues) => {
    const dataToSubmit: Partial<User> = {
        ...values,
        region: values.region === NO_REGION_VALUE ? undefined : values.region,
        town: values.town === NO_TOWN_VALUE || !values.town ? undefined : values.town,
        businessLocationRegion: values.businessLocationRegion === NO_REGION_VALUE ? undefined : values.businessLocationRegion,
        businessLocationTown: values.businessLocationTown === NO_TOWN_VALUE || !values.town ? undefined : values.town,
    };

    const fileFields: (keyof User)[] = ['tradeLicenseUrl', 'nationalIdUrl', 'policeClearanceUrl', 'driverLicenseUrl', 'vehicleInsuranceUrl', 'roadworthinessUrl'];
    const fileInputs = form.getValues();

    try {
        toast({ title: `Processing user data...` });
        const uploadPromises = fileFields.map(async (field) => {
            const fileInputKey = `${field.replace('Url', '')}File` as keyof UserFormValues;
            const file = fileInputs[fileInputKey] as File | undefined;
            if (file) {
                const url = await uploadFile(file);
                dataToSubmit[field] = url;
            }
        });

        await Promise.all(uploadPromises);

        if (isEditing) {
            dataToSubmit.id = user.id;
            if (!values.password) {
                delete dataToSubmit.password;
            }
        }
        
        await onSubmit(dataToSubmit);

        if (!isEditing) {
          toast({
            title: "User Created",
            description: "Admin will be logged out. Please log back in."
          });
          router.push('/login');
        }

    } catch (error: any) {
        toast({
            title: isEditing ? "Update Failed" : "Creation Failed",
            description: error.message || "An unexpected error occurred.",
            variant: "destructive",
        });
        if (!isEditing) {
            router.push('/login');
        }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
        
        <h3 className="text-lg font-semibold text-primary">Account Information</h3>
        <Separator />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name (Contact Person)</FormLabel>
              <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl><Input type="email" placeholder="user@example.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl><Input type="tel" placeholder="(123) 456-7890" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl>
                <SelectContent>
                  {(["customer", "seller", "admin", "courier"] as UserRole[]).map((roleOption) => (
                    <SelectItem key={roleOption} value={roleOption}>
                      {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isEditing ? "New Password (optional)" : "Password"}</FormLabel>
              <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Separator className="my-6" />
        <h3 className="text-lg font-medium mb-3">Personal Address</h3>
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Home Address</FormLabel>
              <FormControl><Input placeholder="e.g. 123 Flower Pot Lane" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="region"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Region</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === NO_REGION_VALUE ? undefined : value)}
                  value={field.value ?? NO_REGION_VALUE}
                >
                  <FormControl><SelectTrigger><SelectValue placeholder="Select a region" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value={NO_REGION_VALUE}>No Region</SelectItem>
                    {PRODUCT_REGIONS.map((region) => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="town"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Town</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === NO_TOWN_VALUE ? undefined : value)}
                  value={field.value ?? NO_TOWN_VALUE}
                  disabled={!watchedRegion || watchedRegion === NO_REGION_VALUE || availableTowns.length === 0}
                >
                  <FormControl><SelectTrigger><SelectValue placeholder="Select a town" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value={NO_TOWN_VALUE}>No Town</SelectItem>
                    {availableTowns.map((town) => (
                      <SelectItem key={town} value={town}>{town}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {watchedRole === 'seller' && (
          <>
            <Separator className="my-6" />
            <h3 className="text-lg font-medium mb-3">Business Information (for Sellers)</h3>
            <FormField control={form.control} name="businessName" render={({ field }) => (
                <FormItem><FormLabel>Business Name</FormLabel><FormControl><Input placeholder="e.g., Green Valley Farms" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="businessOwnerName" render={({ field }) => (
                <FormItem><FormLabel>Name of Business Owner (if different)</FormLabel><FormControl><Input placeholder="e.g., Jane Smith" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="businessAddress" render={({ field }) => (
                <FormItem><FormLabel>Business Address</FormLabel><FormControl><Input placeholder="e.g., 123 Farm Road, Agri-Town" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="contactNumber" render={({ field }) => (
                <FormItem><FormLabel>Business Contact Number</FormLabel><FormControl><Input placeholder="e.g., +233 XXX XXXXXX" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="businessType" render={({ field }) => (
                <FormItem><FormLabel>Business Type</FormLabel><FormControl><Input placeholder="e.g., Sole Proprietorship, Cooperative" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <Separator className="my-6" />
            <h3 className="text-lg font-medium mb-3">Business Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="businessLocationRegion" render={({ field }) => (
                  <FormItem><FormLabel>Region</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value === NO_REGION_VALUE ? undefined : value)} value={field.value ?? NO_REGION_VALUE}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select a region" /></SelectTrigger></FormControl>
                      <SelectContent><SelectItem value={NO_REGION_VALUE}>Select a region</SelectItem>
                        {PRODUCT_REGIONS.map((region) => (<SelectItem key={region} value={region}>{region}</SelectItem>))}
                      </SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )}/>
              <FormField control={form.control} name="businessLocationTown" render={({ field }) => (
                  <FormItem><FormLabel>Town (Optional)</FormLabel>
                     <Select onValueChange={(value) => field.onChange(value === NO_TOWN_VALUE ? undefined : value)} value={field.value ?? NO_TOWN_VALUE} disabled={!watchedBusinessRegion || watchedBusinessRegion === NO_REGION_VALUE || availableBusinessTowns.length === 0}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select a town" /></SelectTrigger></FormControl>
                      <SelectContent><SelectItem value={NO_TOWN_VALUE}>Select a town (Optional)</SelectItem>
                        {availableBusinessTowns.map((town) => (<SelectItem key={town} value={town}>{town}</SelectItem>))}
                      </SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )}/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="geoCoordinatesLat" render={({ field }) => (
                  <FormItem><FormLabel>Latitude</FormLabel><FormControl><Input placeholder="e.g., 5.5560" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="geoCoordinatesLng" render={({ field }) => (
                  <FormItem><FormLabel>Longitude</FormLabel><FormControl><Input placeholder="e.g., -0.1969" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
            </div>
          </>
        )}

        {watchedRole === 'courier' && (
             <>
                <Separator className="my-6" />
                <h3 className="text-lg font-medium mb-3">Courier Information</h3>
                
                <FormField control={form.control} name="businessType" render={({ field }) => (
                    <FormItem><FormLabel>Business Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select business type..." /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="sole proprietorship">Sole Proprietorship</SelectItem>
                                <SelectItem value="partnership">Partnership</SelectItem>
                                <SelectItem value="LLC">LLC</SelectItem>
                                <SelectItem value="corporation">Corporation</SelectItem>
                             </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}/>

                {courierBusinessType !== 'sole proprietorship' && (
                    <>
                        <FormField control={form.control} name="businessName" render={({ field }) => (
                            <FormItem><FormLabel>Business Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="businessRegistrationNumber" render={({ field }) => (
                           <FormItem><FormLabel>Business Registration No.</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="tinNumber" render={({ field }) => (
                            <FormItem><FormLabel>Tax Identification Number (TIN)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="tradeLicenseFile" render={({ field }) => (
                            <FormItem><FormLabel>Trade License</FormLabel><FormControl><Input type="file" className="h-auto p-2" onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)} /></FormControl>{user?.tradeLicenseUrl && (<FormDescription>Current file: <a href={user.tradeLicenseUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">View</a></FormDescription>)}<FormMessage /></FormItem>
                        )}/>
                    </>
                )}

                <Separator className="my-4" />
                <h4 className="text-md font-medium">Personal & Vehicle Details</h4>

                <FormField control={form.control} name="residentialAddress" render={({ field }) => (
                    <FormItem><FormLabel>Residential Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="nationalIdFile" render={({ field }) => (
                        <FormItem><FormLabel>National ID / Passport</FormLabel><FormControl><Input type="file" className="h-auto p-2" onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)} /></FormControl>{user?.nationalIdUrl && ( <FormDescription> Current file: <a href={user.nationalIdUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">View</a>. </FormDescription> )}<FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="policeClearanceFile" render={({ field }) => (
                        <FormItem><FormLabel>Police Clearance Certificate</FormLabel><FormControl><Input type="file" className="h-auto p-2" onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)} /></FormControl>{user?.policeClearanceUrl && ( <FormDescription> Current file: <a href={user.policeClearanceUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">View</a>. </FormDescription> )}<FormMessage /></FormItem>
                    )}/>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="driverLicenseFile" render={({ field }) => (
                        <FormItem><FormLabel>Driver&apos;s / Riding License</FormLabel><FormControl><Input type="file" className="h-auto p-2" onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)} /></FormControl>{user?.driverLicenseUrl && ( <FormDescription> Current file: <a href={user.driverLicenseUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">View</a>. </FormDescription> )}<FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="licenseCategory" render={({ field }) => (
                        <FormItem><FormLabel>License Category/Type</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="vehicleType" render={({ field }) => (
                        <FormItem><FormLabel>Vehicle Type</FormLabel><FormControl><Input placeholder="e.g. Motorcycle, Van" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="vehicleRegistrationNumber" render={({ field }) => (
                        <FormItem><FormLabel>Vehicle Registration No.</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="vehicleInsuranceFile" render={({ field }) => (
                        <FormItem><FormLabel>Vehicle Insurance Certificate</FormLabel><FormControl><Input type="file" className="h-auto p-2" onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)} /></FormControl>{user?.vehicleInsuranceUrl && ( <FormDescription> Current file: <a href={user.vehicleInsuranceUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">View</a>. </FormDescription> )}<FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="roadworthinessFile" render={({ field }) => (
                        <FormItem><FormLabel>Roadworthiness Certificate</FormLabel><FormControl><Input type="file" className="h-auto p-2" onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)} /></FormControl>{user?.roadworthinessUrl && ( <FormDescription> Current file: <a href={user.roadworthinessUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">View</a>. </FormDescription> )}<FormMessage /></FormItem>
                    )}/>
                </div>
            </>
        )}

        <DialogFooter className="pt-6 sticky bottom-0 bg-background py-4 border-t">
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : (isEditing ? "Save Changes" : "Create User")}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
