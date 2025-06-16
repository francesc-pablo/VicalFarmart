
"use client";

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
import { PRODUCT_REGIONS } from "@/lib/constants"; // Import regions
import { Separator } from "@/components/ui/separator";

interface UserFormProps {
  user?: User | null;
  onSubmit: (data: Partial<User>) => void; // Allow partial for updates
  onCancel: () => void;
}

const userFormSchemaBase = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  role: z.enum(["customer", "seller", "admin"], { required_error: "Please select a role." }),
  // Seller specific fields (optional at schema level, conditionally shown in UI)
  businessName: z.string().optional(),
  businessOwnerName: z.string().optional(),
  businessAddress: z.string().optional(),
  contactNumber: z.string().optional(), // Consider adding phone validation if needed
  businessLocationRegion: z.string().optional(),
  businessLocationTown: z.string().optional(),
  geoCoordinatesLat: z.string().optional(), // Consider regex for lat/lng format
  geoCoordinatesLng: z.string().optional(),
  businessType: z.string().optional(),
});

const userFormSchemaCreate = userFormSchemaBase.extend({
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const userFormSchemaUpdate = userFormSchemaBase.extend({
  password: z.string().min(6, { message: "Password must be at least 6 characters." }).optional().or(z.literal('')), // Optional for updates
});


type UserFormValuesCreate = z.infer<typeof userFormSchemaCreate>;
type UserFormValuesUpdate = z.infer<typeof userFormSchemaUpdate>;
type UserFormValues = UserFormValuesCreate | UserFormValuesUpdate;

export function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const isEditing = !!user;
  const formSchema = isEditing ? userFormSchemaUpdate : userFormSchemaCreate;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      role: user?.role || "customer",
      password: "", // Always empty for password field initially
      businessName: user?.businessName || "",
      businessOwnerName: user?.businessOwnerName || "",
      businessAddress: user?.businessAddress || "",
      contactNumber: user?.contactNumber || "",
      businessLocationRegion: user?.businessLocationRegion || "",
      businessLocationTown: user?.businessLocationTown || "",
      geoCoordinatesLat: user?.geoCoordinatesLat || "",
      geoCoordinatesLng: user?.geoCoordinatesLng || "",
      businessType: user?.businessType || "",
    },
  });

  const watchedRole = form.watch("role");

  const handleSubmit = (values: UserFormValues) => {
    const dataToSubmit: Partial<User> = { ...values };
    if (isEditing) {
      dataToSubmit.id = user.id;
      if (!values.password) { 
        delete dataToSubmit.password;
      }
    } else {
      dataToSubmit.isActive = true; 
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a region" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
                    <FormLabel>Town</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Kumasi, Accra" {...field} />
                    </FormControl>
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
            <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
            </Button>
          </DialogClose>
          <Button type="submit">{isEditing ? "Save Changes" : "Create User"}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

