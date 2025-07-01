
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { UserTable } from "@/components/admin/UserTable";
import type { User } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';
import { getUsers, updateUser, deleteUser, addUser } from '@/services/userService'; 
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { UserForm } from '@/components/admin/UserForm';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    const usersFromDb = await getUsers();
    setUsers(usersFromDb);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    await updateUser(userId, { isActive: !currentStatus });
    toast({ title: "User Status Updated", description: `User status changed to ${!currentStatus ? 'Active' : 'Inactive'}.` });
    fetchUsers(); // Refresh data
  };

  const handleDeleteUser = async (userId: string) => {
    await deleteUser(userId);
    toast({ title: "User Deleted", description: `User has been removed from Firestore.`, variant: "destructive" });
    fetchUsers(); // Refresh data
  };
  
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };
  
  const handleAddNewUser = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: Partial<User>) => {
    try {
        if (editingUser) {
          await updateUser(editingUser.id, data);
          toast({ title: "User Updated", description: "The user's details have been saved." });
        } else {
          const newUser = await addUser(data);
          if (newUser) {
            toast({ title: "User Created", description: `An account for ${newUser.name} has been created.` });
          } else {
            throw new Error("User creation failed. The email might already be in use.");
          }
        }
        setIsFormOpen(false);
        setEditingUser(null);
        fetchUsers();
    } catch (error: any) {
        toast({
            title: editingUser ? "Update Failed" : "Creation Failed",
            description: error.message || "An unexpected error occurred.",
            variant: "destructive",
        });
    }
  };

  const filteredUsers = users.filter(user =>
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.businessName && user.businessName.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const UserTableSkeleton = () => (
    <div className="space-y-2 p-4">
       {[...Array(5)].map((_, i) => (
         <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-grow">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
       ))}
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Manage Users"
        description="View, activate, deactivate, and manage user accounts on the platform."
        actions={
          <Button onClick={handleAddNewUser} disabled={isLoading}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add User
          </Button>
        }
      />

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or business name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-sm pl-10"
        />
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-0">
          {isLoading ? (
            <UserTableSkeleton />
          ) : (
            <UserTable
              users={filteredUsers}
              onToggleUserStatus={handleToggleUserStatus}
              onDeleteUser={handleDeleteUser}
              onEditUser={handleEditUser}
            />
          )}
        </CardContent>
      </Card>
      
       <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
          if (!isOpen) {
            setEditingUser(null);
          }
          setIsFormOpen(isOpen);
        }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Update the user's details. Leave password blank to keep it unchanged." : "Create a new user account with a specific role."}
            </DialogDescription>
          </DialogHeader>
          <UserForm
            user={editingUser}
            onSubmit={handleFormSubmit}
            onCancel={() => { setIsFormOpen(false); setEditingUser(null); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
