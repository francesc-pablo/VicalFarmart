
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import type { Product, User } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AdminProductForm } from '@/components/admin/AdminProductForm';
import { AdminProductTable } from '@/components/admin/AdminProductTable';
import { useToast } from '@/hooks/use-toast';
import { getProducts, addProduct, updateProduct, deleteProduct } from '@/services/productService';
import { getUsers } from '@/services/userService';
import { Skeleton } from '@/components/ui/skeleton';


export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const [productsFromDb, usersFromDb] = await Promise.all([
      getProducts(),
      getUsers()
    ]);
    setProducts(productsFromDb);
    setSellers(usersFromDb.filter(u => u.role === 'seller'));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddNewProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    await deleteProduct(productId);
    toast({ title: "Product Deleted", description: "The product has been removed by admin.", variant: "destructive" });
    fetchData();
  };

  const handleProductFormSubmit = async (productData: Product) => {
    if (editingProduct) {
      await updateProduct(productData.id, productData);
      toast({ title: "Product Updated", description: `Product "${productData.name}" details saved by admin.` });
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...newProductData } = productData;
      await addProduct(newProductData);
      toast({ title: "Product Added", description: `New product "${productData.name}" listed by admin.` });
    }
    setShowProductForm(false);
    setEditingProduct(null);
    fetchData();
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.sellerName && product.sellerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.region && product.region.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.town && product.town.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const ProductTableSkeleton = () => (
     <div className="space-y-2 p-4">
       {[...Array(5)].map((_, i) => (
         <div key={i} className="flex items-center space-x-4">
           <Skeleton className="h-10 w-10" />
           <div className="space-y-2 flex-grow">
             <Skeleton className="h-4 w-3/5" />
           </div>
            <Skeleton className="h-4 w-1/5" />
            <Skeleton className="h-8 w-1/6" />
         </div>
       ))}
     </div>
   );

  return (
    <div>
      <PageHeader
        title="Manage All Products"
        description="Oversee and manage product listings across the platform."
        actions={
          <Dialog open={showProductForm} onOpenChange={(isOpen) => {
            setShowProductForm(isOpen);
            if (!isOpen) setEditingProduct(null);
          }}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNewProduct} disabled={isLoading}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product (as Admin)"}</DialogTitle>
                <DialogDescription>
                  {editingProduct ? "Update the product details." : "Fill in the details to list a new product for a seller."}
                </DialogDescription>
              </DialogHeader>
              <AdminProductForm
                product={editingProduct}
                sellers={sellers}
                onSubmit={handleProductFormSubmit}
                onCancel={() => { setShowProductForm(false); setEditingProduct(null);}}
              />
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by product, seller, category, region, town..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md pl-10"
        />
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-0">
          {isLoading ? (
            <ProductTableSkeleton />
          ) : (
            <AdminProductTable
              products={filteredProducts}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
