
"use client";

import type { Courier } from "@/types";
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
import { Edit, Trash2, FileDown } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CourierTableProps {
  couriers: Courier[];
  onEdit: (courier: Courier) => void;
  onDelete: (courierId: string) => void;
}

export function CourierTable({ couriers, onEdit, onDelete }: CourierTableProps) {

  const documentLinks = (courier: Courier) => [
    { label: "Trade License", url: courier.tradeLicenseUrl },
    { label: "National ID / Passport", url: courier.nationalIdUrl },
    { label: "Police Clearance", url: courier.policeClearanceUrl },
    { label: "Driver's License", url: courier.driverLicenseUrl },
    { label: "Vehicle Insurance", url: courier.vehicleInsuranceUrl },
    { label: "Roadworthiness Certificate", url: courier.roadworthinessUrl },
  ].filter(doc => doc.url);


  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Business Name</TableHead>
          <TableHead className="hidden md:table-cell">Contact Person</TableHead>
          <TableHead className="hidden sm:table-cell">Phone</TableHead>
          <TableHead className="hidden lg:table-cell">Location</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {couriers.length > 0 ? (
          couriers.map((courier) => {
            const availableDocs = documentLinks(courier);
            return (
            <TableRow key={courier.id}>
              <TableCell>
                <div className="font-medium">{courier.businessName}</div>
                <div className="text-xs text-muted-foreground hidden md:inline">{courier.email}</div>
              </TableCell>
              <TableCell className="hidden md:table-cell">{courier.contactName}</TableCell>
              <TableCell className="hidden sm:table-cell">{courier.phone}</TableCell>
              <TableCell className="hidden lg:table-cell">{courier.businessLocation}</TableCell>
              <TableCell className="text-right">
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button variant="ghost" size="icon" title="Download Documents" disabled={availableDocs.length === 0}>
                        <FileDown className="h-4 w-4" />
                     </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Courier Documents</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {availableDocs.map((doc) => (
                       <DropdownMenuItem key={doc.label} asChild>
                         <a href={doc.url} target="_blank" rel="noopener noreferrer">
                           {doc.label}
                         </a>
                       </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="ghost" size="icon" onClick={() => onEdit(courier)} title="Edit Courier">
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Delete Courier">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the courier service &quot;{courier.businessName}&quot;.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(courier.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          )})
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="text-center h-24">
              No couriers found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
