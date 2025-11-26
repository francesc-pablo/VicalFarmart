"use client";

import type { User, UserRole } from "@/types";
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
import { Trash2, ToggleLeft, ToggleRight, Edit, FileDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

interface UserTableProps {
  users: User[];
  onDeleteUser: (userId: string) => void;
  onToggleUserStatus?: (userId: string, currentStatus: boolean) => void;
  onEditUser?: (user: User) => void;
}

const getRoleBadgeVariant = (role: UserRole): "default" | "secondary" | "outline" => {
  switch (role) {
    case "admin":
      return "default"; // Primary color for admin
    case "seller":
      return "secondary";
    case "courier":
      return "default";
    case "customer":
      return "outline";
    default:
      return "outline";
  }
};

const getAttachmentUrl = (url: string) => {
  if (!url) return "#";
  // Transforms the Cloudinary URL to force a download with the original filename.
  // Example: .../upload/v123/folder/file.pdf -> .../upload/fl_attachment:file/v123/folder/file.pdf
  const parts = url.split('/upload/');
  if (parts.length < 2) return url; // Not a standard Cloudinary URL

  const filename = url.substring(url.lastIndexOf('/') + 1).split('.')[0];
  return `${parts[0]}/upload/fl_attachment:${filename}/${parts[1]}`;
};

export function UserTable({ users, onDeleteUser, onToggleUserStatus, onEditUser }: UserTableProps) {
  
  const courierDocLinks: { key: keyof User; label: string }[] = [
    { key: "tradeLicenseUrl", label: "Trade License" },
    { key: "nationalIdUrl", label: "National ID / Passport" },
    { key: "policeClearanceUrl", label: "Police Clearance" },
    { key: "driverLicenseUrl", label: "Driver's License" },
    { key: "vehicleInsuranceUrl", label: "Vehicle Insurance" },
    { key: "roadworthinessUrl", label: "Roadworthiness Cert" },
  ];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px] hidden sm:table-cell">Avatar</TableHead>
          <TableHead>User</TableHead>
          <TableHead className="hidden md:table-cell">Role</TableHead>
          <TableHead className="hidden sm:table-cell">Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length > 0 ? (
          users.map((user) => {
            const uploadedDocs = courierDocLinks.filter(doc => user[doc.key]);

            return (
              <TableRow key={user.id}>
                <TableCell className="hidden sm:table-cell">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatarUrl || `https://placehold.co/40x40.png`} alt={user.name} data-ai-hint="person face" />
                    <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-muted-foreground hidden md:inline">{user.email}</div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant={getRoleBadgeVariant(user.role)}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant={user.isActive ? "default" : "destructive"} className={user.isActive ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300'}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {user.role === 'courier' && uploadedDocs.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" title="Download Courier Documents">
                          <FileDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Courier Documents</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {uploadedDocs.map(doc => (
                          <DropdownMenuItem key={doc.key} asChild>
                            <a href={getAttachmentUrl(user[doc.key] as string)} target="_blank" rel="noopener noreferrer">
                              {doc.label}
                            </a>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  {onEditUser && (
                    <Button variant="ghost" size="icon" onClick={() => onEditUser(user)} title="Edit User">
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {onToggleUserStatus && (
                    <Button variant="ghost" size="icon" onClick={() => onToggleUserStatus(user.id, user.isActive)} title={user.isActive ? "Deactivate User" : "Activate User"}>
                      {user.isActive ? <ToggleRight className="h-5 w-5 text-green-500" /> : <ToggleLeft className="h-5 w-5 text-red-500" />}
                    </Button>
                  )}
                  {onDeleteUser && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Delete User">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user's
                            data from the database, but it will NOT delete their authentication account.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDeleteUser(user.id)}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </TableCell>
              </TableRow>
            )
          })
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="text-center h-24">
              No users found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
