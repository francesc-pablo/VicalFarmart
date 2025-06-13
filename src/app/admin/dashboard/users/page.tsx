
"use client";
import React, { useState } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { UserTable } from "@/components/admin/UserTable";
import type { User, UserRole } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { UserForm } from '@/components/admin/UserForm'; // Import UserForm
import { useToast } from '@/hooks/use-toast';


// Mock data - replace with actual data fetching
const mockUsers: User[] = [
  { id: "user001", name: "Alice Wonderland", email: "alice@example.com", role: "customer", isActive: true, avatarUrl: "https://placehold.co/40x40.png" },
  { id: "user002", name: "Bob The Farmer", email: "seller@farmfresh.com", role: "seller", isActive: true, avatarUrl: "https://placehold.co/40x40.png" },
  { id: "user003", name: "Charlie Admin", email: "admin@agrishop.com", role: "admin", isActive: true, avatarUrl: "https://placehold.co/40x40.png" },
  { id: "user004", name: "Diana Deactivated", email: "diana@inactive.com", role: "customer", isActive: false, avatarUrl: "https://placehold.co/40x40.png" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();

  const handleToggleUserStatus = (userId: string, currentStatus: boolean) => {
    setUsers(prevUsers => prevUsers.map(user => user.id === userId ? { ...user, isActive: !currentStatus } : user));
    toast({ title: "User Status Updated", description: `User ${userId} status changed to ${!currentStatus ? 'Active' : 'Inactive'}.` });
  };
  
  const handleDeleteUser = (userId: string) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    toast({ title: "User Deleted", description: `User ${userId} has been removed.`, variant: "destructive" });
  };

  const handleAddNewUser = () => {
    setEditingUser(null);
    setShowUserForm(true);
  };

  const handleEditUser = (userId: string) => {
    const userToEdit = users.find(user => user.id === userId);
    if (userToEdit) {
      setEditingUser(userToEdit);
      setShowUserForm(true);
    }
  };
  
  const handleUserFormSubmit = (userData: Partial<User>) => {
    if (editingUser && userData.id) { // Editing existing user
      setUsers(users.map(u => u.id === userData.id ? { ...u, ...userData } as User : u));
      toast({ title: "User Updated", description: `User ${userData.name || editingUser.name} details saved.` });
    } else { // Adding new user
      const newUser: User = {
        id: String(Date.now()), // Mock ID
        name: userData.name!,
        email: userData.email!,
        role: userData.role!,
        isActive: userData.isActive !== undefined ? userData.isActive : true, // Default to active
        avatarUrl: "https://placehold.co/40x40.png", // Default avatar
        // Password is not stored in state, assumed handled by backend/auth service
      };
      setUsers([...users, newUser]);
      toast({ title: "User Added", description: `New user ${newUser.name} created as ${newUser.role}.` });
    }
    setShowUserForm(false);
    setEditingUser(null);
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
           <Dialog open={showUserForm} onOpenChange={(isOpen) => {
            setShowUserForm(isOpen);
            if (!isOpen) setEditingUser(null); // Reset editing user when dialog closes
          }}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNewUser}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
                <DialogDescription>
                  {editingUser ? "Update the user's details." : "Fill in the details to create a new user account."}
                </DialogDescription>
              </DialogHeader>
              <UserForm 
                user={editingUser} 
                onSubmit={handleUserFormSubmit} 
                onCancel={() => { setShowUserForm(false); setEditingUser(null);}}
              />
            </DialogContent>
          </Dialog>
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
            onEditUser={handleEditUser} // Pass the handler to UserTable
          />
        </CardContent>
      </Card>
    </div>
  );
}
