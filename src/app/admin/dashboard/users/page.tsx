"use client";
import React, { useState } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { UserTable } from "@/components/admin/UserTable";
import type { User } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
// Mock data - replace with actual data fetching
const mockUsers: User[] = [
  { id: "user001", name: "Alice Wonderland", email: "alice@example.com", role: "customer", isActive: true, avatarUrl: "https://placehold.co/40x40.png" },
  { id: "user002", name: "Bob The Farmer", email: "bob@farmfresh.com", role: "seller", isActive: true, avatarUrl: "https://placehold.co/40x40.png" },
  { id: "user003", name: "Charlie Admin", email: "charlie@agriconnect.com", role: "admin", isActive: true, avatarUrl: "https://placehold.co/40x40.png" },
  { id: "user004", name: "Diana Deactivated", email: "diana@inactive.com", role: "seller", isActive: false, avatarUrl: "https://placehold.co/40x40.png" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");

  const handleToggleUserStatus = (userId: string, currentStatus: boolean) => {
    setUsers(prevUsers => prevUsers.map(user => user.id === userId ? { ...user, isActive: !currentStatus } : user));
    // toast({ title: "User Status Updated", description: `User ${userId} status changed.` });
  };
  
  const handleDeleteUser = (userId: string) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    // toast({ title: "User Deleted", description: `User ${userId} has been removed.`});
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Manage Users"
        description="View, edit, and manage user accounts on the platform."
        actions={
          <Button disabled> {/* Add User functionality can be complex, disabled for now */}
            <PlusCircle className="mr-2 h-4 w-4" /> Add New User
          </Button>
        }
      />

      <div className="mb-6">
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
          icon={<Search className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-0">
          <UserTable 
            users={filteredUsers} 
            onToggleUserStatus={handleToggleUserStatus}
            onDeleteUser={handleDeleteUser}
            onEditUser={(id) => alert(`Edit user ${id}`)} // Placeholder for edit functionality
          />
        </CardContent>
      </Card>
    </div>
  );
}
