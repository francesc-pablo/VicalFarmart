"use client";
import React, { useState } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, Search } from "lucide-react";
import type { Product } from "@/types";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { ProductForm } from '@/components/seller/ProductForm';


const mockProducts: Product[] = [
  { id: "1", name: "Organic Apples", description: "Freshly picked organic apples.", price: 2.99, category: "Fruits", imageUrl: "https://placehold.co/100x100.png", stock: 100, sellerId: "seller1" , sellerName: "FarmFresh"},
  { id: "2", name: "Heirloom Tomatoes", description: "Sweet and juicy heirloom tomatoes.", price: 4.50, category: "Vegetables", imageUrl: "https://placehold.co/100x100.png", stock: 50, sellerId: "seller1" , sellerName: "FarmFresh"},
  { id: "3", name: "Whole Wheat Bread", description: "Homemade whole wheat bread.", price: 5.00, category: "Grains", imageUrl: "https://placehold.co/100x100.png", stock: 30, sellerId: "seller1" , sellerName: "FarmFresh"},
];

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleAddNewProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = (productId: string) => {
    // Implement actual deletion logic here
    setProducts(products.filter(p => p.id !== productId));
    // toast({ title: "Product Deleted", description: "The product has been removed." });
  };
  
  const handleProductFormSubmit = (productData: Product) => {
    if (editingProduct) {
      setProducts(products.map(p => p.id === productData.id ? productData : p));
      // toast({ title: "Product Updated", description: "Product details saved." });
    } else {
      setProducts([...products, { ...productData, id: String(Date.now()) }]); // Mock ID
      // toast({ title: "Product Added", description: "New product listed." });
    }
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Manage Products"
        description="Add, edit, or remove your product listings."
        actions={
          <Dialog open={showProductForm} onOpenChange={setShowProductForm}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNewProduct}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                <DialogDescription>
                  {editingProduct ? "Update the details of your product." : "Fill in the details to list a new product."}
                </DialogDescription>
              </DialogHeader>
              <ProductForm 
                product={editingProduct} 
                onSubmit={handleProductFormSubmit} 
                onCancel={() => { setShowProductForm(false); setEditingProduct(null);}}
              />
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-6">
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
          icon={<Search className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={50}
                        height={50}
                        className="rounded-md object-cover"
                        data-ai-hint={`${product.category} produce`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell><Badge variant="outline">{product.category}</Badge></TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                           <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                         <DialogContent className="sm:max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit Product</DialogTitle>
                            <DialogDescription>Update the details of your product.</DialogDescription>
                          </DialogHeader>
                          <ProductForm product={product} onSubmit={handleProductFormSubmit} onCancel={() => {}} />
                        </DialogContent>
                      </Dialog>
                     
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirm Deletion</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete the product &quot;{product.name}&quot;? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button variant="destructive" onClick={() => handleDeleteProduct(product.id)}>
                              Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
