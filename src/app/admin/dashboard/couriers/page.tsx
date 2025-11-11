
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import type { Courier } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CourierForm } from '@/components/admin/CourierForm';
import { CourierTable } from '@/components/admin/CourierTable';
import { useToast } from '@/hooks/use-toast';
import { getCouriers, addCourier, updateCourier, deleteCourier } from '@/services/courierService';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminCouriersPage() {
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourier, setEditingCourier] = useState<Courier | null>(null);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const couriersFromDb = await getCouriers();
    setCouriers(couriersFromDb);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddNewCourier = () => {
    setEditingCourier(null);
    setIsFormOpen(true);
  };

  const handleEditCourier = (courier: Courier) => {
    setEditingCourier(courier);
    setIsFormOpen(true);
  };

  const handleDeleteCourier = async (courierId: string) => {
    await deleteCourier(courierId);
    toast({ title: "Courier Deleted", description: "The courier service has been removed.", variant: "destructive" });
    fetchData();
  };

  const handleCourierFormSubmit = async (courierData: Omit<Courier, 'id' | 'createdAt'>) => {
    try {
      if (editingCourier) {
        await updateCourier(editingCourier.id, courierData);
        toast({ title: "Courier Updated", description: "Courier details have been saved." });
      } else {
        await addCourier(courierData);
        toast({ title: "Courier Added", description: "New courier service has been registered." });
      }
      setIsFormOpen(false);
      setEditingCourier(null);
      fetchData();
    } catch (error) {
      console.error("Form submission error:", error);
      toast({ title: "Submission Failed", description: error instanceof Error ? error.message : "An unknown error occurred.", variant: "destructive" });
    }
  };

  const filteredCouriers = couriers.filter(courier =>
    courier.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    courier.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    courier.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const CourierTableSkeleton = () => (
     <div className="space-y-2 p-4">
       {[...Array(5)].map((_, i) => (
         <div key={i} className="flex items-center space-x-4">
           <div className="space-y-2 flex-grow">
             <Skeleton className="h-4 w-3/5" />
             <Skeleton className="h-4 w-4/5" />
           </div>
           <Skeleton className="h-8 w-1/6" />
         </div>
       ))}
     </div>
   );

  return (
    <div>
      <PageHeader
        title="Manage Couriers"
        description="Oversee and manage courier services for order delivery."
        actions={
          <Button onClick={handleAddNewCourier} disabled={isLoading}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Courier
          </Button>
        }
      />

       <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
          if (!isOpen) setEditingCourier(null);
          setIsFormOpen(isOpen);
        }}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingCourier ? "Edit Courier Service" : "Add New Courier Service"}</DialogTitle>
            <DialogDescription>
              {editingCourier ? "Update the courier's details." : "Fill in the form to register a new courier service."}
            </DialogDescription>
          </DialogHeader>
          <CourierForm
            courier={editingCourier}
            onSubmit={handleCourierFormSubmit}
            onCancel={() => { setIsFormOpen(false); setEditingCourier(null);}}
          />
        </DialogContent>
      </Dialog>


      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by business name, contact, email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md pl-10"
        />
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-0">
          {isLoading ? (
            <CourierTableSkeleton />
          ) : (
            <CourierTable
              couriers={filteredCouriers}
              onEdit={handleEditCourier}
              onDelete={handleDeleteCourier}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    