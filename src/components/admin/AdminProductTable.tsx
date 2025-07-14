
"use client";

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
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

interface AdminProductTableProps {
  products: Product[];
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

const getCurrencySymbol = (currencyCode?: string) => {
  if (currencyCode === "GHS") return "₵";
  if (currencyCode === "USD") return "$";
  return "$"; // Default symbol
};

export function AdminProductTable({ products, onEditProduct, onDeleteProduct }: AdminProductTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[60px] hidden sm:table-cell">Image</TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="hidden md:table-cell">Seller</TableHead>
          <TableHead className="hidden lg:table-cell">Category</TableHead>
          <TableHead>Price</TableHead>
          <TableHead className="hidden sm:table-cell">Stock</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.length > 0 ? (
          products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="hidden sm:table-cell">
                <Image
                  src={product.imageUrl || "https://placehold.co/100x100.png"}
                  alt={product.name}
                  width={40}
                  height={40}
                  className="rounded-md object-cover"
                  data-ai-hint={`${product.category} item`}
                />
              </TableCell>
              <TableCell>
                <div className="font-medium">{product.name}</div>
                <div className="text-xs text-muted-foreground font-mono">{product.id}</div>
              </TableCell>
              <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{product.sellerName || 'N/A'}</TableCell>
              <TableCell className="hidden lg:table-cell"><Badge variant="outline">{product.category}</Badge></TableCell>
              <TableCell>{getCurrencySymbol(product.currency)}{product.price.toFixed(2)} {product.currency}</TableCell>
              <TableCell className="hidden sm:table-cell">{product.stock}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => onEditProduct(product)} title="Edit Product">
                  <Edit className="h-4 w-4" />
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Delete Product">
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
                      <DialogClose asChild>
                        <Button variant="destructive" onClick={() => onDeleteProduct(product.id)}>
                          Delete
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={7} className="text-center h-24">
              No products found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
