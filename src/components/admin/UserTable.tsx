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
import { Edit, Trash2, ShieldCheck, ShieldAlert, ToggleLeft, ToggleRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserTableProps {
  users: User[];
  onEditUser?: (userId: string) => void;
  onDeleteUser?: (userId: string) => void;
  onToggleUserStatus?: (userId: string, currentStatus: boolean) => void;
}

const getRoleBadgeVariant = (role: UserRole): "default" | "secondary" | "outline" => {
  switch (role) {
    case "admin":
      return "default"; // Primary color for admin
    case "seller":
      return "secondary";
    case "customer":
      return "outline";
    default:
      return "outline";
  }
};

export function UserTable({ users, onEditUser, onDeleteUser, onToggleUserStatus }: UserTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">Avatar</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length > 0 ? (
          users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatarUrl || `https://placehold.co/40x40.png`} alt={user.name} data-ai-hint="person face" />
                  <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={getRoleBadgeVariant(user.role)}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={user.isActive ? "default" : "destructive"} className={user.isActive ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300'}>
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {onToggleUserStatus && (
                  <Button variant="ghost" size="icon" onClick={() => onToggleUserStatus(user.id, user.isActive)} title={user.isActive ? "Deactivate User" : "Activate User"}>
                    {user.isActive ? <ToggleRight className="h-5 w-5 text-green-500" /> : <ToggleLeft className="h-5 w-5 text-red-500" />}
                  </Button>
                )}
                {onEditUser && (
                  <Button variant="ghost" size="icon" onClick={() => onEditUser(user.id)} title="Edit User">
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {onDeleteUser && (
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => onDeleteUser(user.id)} title="Delete User">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="text-center h-24">
              No users found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
