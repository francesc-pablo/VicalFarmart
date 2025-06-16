
"use client";
import React, { useState, useEffect } from 'react';
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

// Mock data for initial products and sellers
const mockSellers: User[] = [
  { id: "seller1", name: "Green Valley Orchards", email: "gvo@example.com", role: "seller", isActive: true, avatarUrl: "https://placehold.co/40x40.png" },
  { id: "seller2", name: "Sunshine Farms", email: "sunshine@example.com", role: "seller", isActive: true, avatarUrl: "https://placehold.co/40x40.png" },
  { id: "seller3", name: "The Local Bakery", email: "bakery@example.com", role: "seller", isActive: true, avatarUrl: "https://placehold.co/40x40.png" },
  { id: "seller4", name: "Pasture Perfect Meats", email: "meats@example.com", role: "seller", isActive: true, avatarUrl: "https://placehold.co/40x40.png" },
];

const mockInitialProducts: Product[] = [
  { id: "prod_admin_1", name: "Organic Fuji Apples (Admin)", description: "Crisp and sweet organic Fuji apples.", price: 3.99, category: "Fruits", imageUrl: "https://placehold.co/400x300.png", stock: 120, sellerId: "seller1", sellerName: "Green Valley Orchards", region: "Ashanti", town: "Kumasi", currency: "USD" },
  { id: "prod_admin_2", name: "Vine-Ripened Tomatoes (Admin)", description: "Juicy vine-ripened tomatoes.", price: 25.50, category: "Vegetables", imageUrl: "https://placehold.co/400x300.png", stock: 80, sellerId: "seller2", sellerName: "Sunshine Farms", region: "Volta", town: "Ho", currency: "GHS" },
  { id: "prod_admin_3", name: "Sourdough Bread (Admin)", description: "Artisanal sourdough bread.", price: 60.00, category: "Grains", imageUrl: "https://placehold.co/400x300.png", stock: 25, sellerId: "seller3", sellerName: "The Local Bakery", region: "Greater Accra", town: "Accra", currency: "GHS" },
];


export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(mockInitialProducts);
  const [sellers, setSellers] = useState<User[]>(mockSellers);
  const [searchTerm, setSearchTerm] = useState("");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();


  const handleAddNewProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
    toast({ title: "Product Deleted", description: "The product has been removed by admin.", variant: "destructive" });
  };

  const handleProductFormSubmit = (productData: Product) => {
    if (editingProduct) {
      setProducts(products.map(p => p.id === productData.id ? productData : p));
      toast({ title: "Product Updated", description: `Product "${productData.name}" details saved by admin.` });
    } else {
      const newProductWithId = { ...productData, id: productData.id || `prod_admin_${Date.now()}` };
      setProducts([newProductWithId, ...products]);
      toast({ title: "Product Added", description: `New product "${newProductWithId.name}" listed by admin.` });
    }
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.sellerName && product.sellerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.region && product.region.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.town && product.town.toLowerCase().includes(searchTerm.toLowerCase()))
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
              <Button onClick={handleAddNewProduct}>
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

      <div className="mb-6">
        <Input
          placeholder="Search by product, seller, category, region, town..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
          icon={<Search className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-0">
          <AdminProductTable
            products={filteredProducts}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        </CardContent>
      </Card>
    </div>
  );
}
