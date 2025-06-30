
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { UserTable } from "@/components/admin/UserTable";
import type { User } from "@/types";
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
  DialogTrigger
} from "@/components/ui/dialog";
import { UserForm } from '@/components/admin/UserForm';
import { useToast } from '@/hooks/use-toast';
import { getUsers, updateUser, deleteUser, addUser } from '@/services/userService'; // Import new services
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showUserForm, setShowUserForm] = useState(false);
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

  const handleUserFormSubmit = async (userData: Partial<User>) => {
    if (editingUser && userData.id) { // Editing existing user
      await updateUser(userData.id, userData);
      toast({ title: "User Updated", description: `User ${userData.name || editingUser.name} details saved.` });
    } else { // Adding new user
      const newUser = await addUser(userData);
      if (newUser) {
        toast({ title: "User Added", description: `New user ${newUser.name} created as ${newUser.role}.` });
      } else {
        toast({ title: "Error", description: `Failed to create new user. Email might already exist.`, variant: "destructive" });
      }
    }
    setShowUserForm(false);
    setEditingUser(null);
    fetchUsers(); // Refresh data
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.businessName && user.businessName.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const UserTableSkeleton = () => (
    <div className="space-y-2 p-4">
       <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-grow">
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
       <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-grow">
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-grow">
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Manage Users"
        description="View, edit, and manage user accounts on the platform."
        actions={
           <Dialog open={showUserForm} onOpenChange={(isOpen) => {
            setShowUserForm(isOpen);
            if (!isOpen) setEditingUser(null);
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
    </div>
  );
}
