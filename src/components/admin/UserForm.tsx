
"use client";

import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { auth } from "@/lib/firebase";

interface UserFormProps {
  user?: User | null;
  onSubmit: (data: Partial<User> & { idToken?: string }) => void;
  onCancel: () => void;
}

const userFormSchemaBase = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().optional(),
  address: z.string().optional(),
  region: z.string().optional(),
  town: z.string().optional(),
  role: z.enum(["customer", "seller", "admin"], { required_error: "Please select a role." }),
  businessName: z.string().optional(),
  businessOwnerName: z.string().optional(),
  businessAddress: z.string().optional(),
  contactNumber: z.string().optional(),
  businessLocationRegion: z.string().optional(),
  businessLocationTown: z.string().optional(),
  geoCoordinatesLat: z.string().optional(),
  geoCoordinatesLng: z.string().optional(),
  businessType: z.string().optional(),
});

const userFormSchemaCreate = userFormSchemaBase.extend({
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const userFormSchemaUpdate = userFormSchemaBase.extend({
  password: z.string().min(6, { message: "Password must be at least 6 characters." }).optional().or(z.literal('')),
});


type UserFormValuesCreate = z.infer<typeof userFormSchemaCreate>;
type UserFormValuesUpdate = z.infer<typeof userFormSchemaUpdate>;
type UserFormValues = UserFormValuesCreate | UserFormValuesUpdate;

const NO_REGION_VALUE = "--NONE--";
const NO_TOWN_VALUE = "--NONE--";

export function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
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
      businessName: user?.businessName || "",
      businessOwnerName: user?.businessOwnerName || "",
      businessAddress: user?.businessAddress || "",
      contactNumber: user?.contactNumber || "",
      businessLocationRegion: user?.businessLocationRegion || undefined,
      businessLocationTown: user?.businessLocationTown || undefined,
      geoCoordinatesLat: user?.geoCoordinatesLat || "",
      geoCoordinatesLng: user?.geoCoordinatesLng || "",
      businessType: user?.businessType || "",
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

  useEffect(() => {
    if (watchedRole === 'seller' && watchedBusinessRegion && watchedBusinessRegion !== NO_REGION_VALUE) {
      setAvailableBusinessTowns(GHANA_REGIONS_AND_TOWNS[watchedBusinessRegion] || []);
      if(user?.businessLocationRegion !== watchedBusinessRegion) {
        form.setValue("businessLocationTown", undefined);
      }
    } else {
      setAvailableBusinessTowns([]);
      form.setValue("businessLocationTown", undefined);
    }
  }, [watchedBusinessRegion, watchedRole, form, user?.businessLocationRegion]);

  const handleSubmit = async (values: UserFormValues) => {
    let dataToSubmit: Partial<User> & { idToken?: string } = {
        ...values,
        region: values.region === NO_REGION_VALUE ? undefined : values.region,
        town: values.town === NO_TOWN_VALUE || !values.town ? undefined : values.town,
        businessLocationRegion: values.businessLocationRegion === NO_REGION_VALUE ? undefined : values.businessLocationRegion,
        businessLocationTown: values.businessLocationTown === NO_TOWN_VALUE || !values.town ? undefined : values.businessLocationTown,
    };
    
    if (isEditing) {
      dataToSubmit.id = user.id;
      if (!values.password) {
        delete dataToSubmit.password;
      }
    } else {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const idToken = await currentUser.getIdToken(true);
        dataToSubmit.idToken = idToken;
      } else {
        // Handle case where admin is not logged in on the client, though this is unlikely
        // in the admin dashboard. The service will throw the final error.
      }
    }
    
    onSubmit(dataToSubmit);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name (Contact Person)</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
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
                <FormControl>
                  <Input type="email" placeholder="user@example.com" {...field} />
                </FormControl>
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
                <FormControl>
                  <Input type="tel" placeholder="(123) 456-7890" {...field} />
                </FormControl>
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
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(["customer", "seller", "admin"] as UserRole[]).map((roleOption) => (
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
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
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
              <FormControl>
                <Input placeholder="e.g. 123 Flower Pot Lane" {...field} />
              </FormControl>
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
                    <SelectItem value={NO_REGION_VALUE}>No Region</SelectItem>
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
          <FormField
            control={form.control}
            name="town"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Town</FormLabel>
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
                    <SelectItem value={NO_TOWN_VALUE}>No Town</SelectItem>
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
        </div>

        {watchedRole === 'seller' && (
          <>
            <Separator className="my-6" />
            <h3 className="text-lg font-medium mb-3">Business Information</h3>
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Green Valley Farms" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="businessOwnerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name of Business Owner (if different)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Jane Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="businessAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Address</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 123 Farm Road, Agri-Town" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Contact Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., +233 XXX XXXXXX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="businessType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Sole Proprietorship, Cooperative" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator className="my-6" />
            <h3 className="text-lg font-medium mb-3">Business Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="businessLocationRegion"
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
                        <SelectItem value={NO_REGION_VALUE}>Select a region</SelectItem>
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
              <FormField
                control={form.control}
                name="businessLocationTown"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Town (Optional)</FormLabel>
                     <Select
                        onValueChange={(value) => {
                          field.onChange(value === NO_TOWN_VALUE ? undefined : value);
                        }}
                        value={field.value ?? NO_TOWN_VALUE}
                        disabled={!watchedBusinessRegion || watchedBusinessRegion === NO_REGION_VALUE || availableBusinessTowns.length === 0}
                      >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a town" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NO_TOWN_VALUE}>Select a town (Optional)</SelectItem>
                        {availableBusinessTowns.map((town) => (
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
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="geoCoordinatesLat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 5.5560" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="geoCoordinatesLng"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., -0.1969" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
