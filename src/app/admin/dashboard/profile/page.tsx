
"use client";

import React, { useState, useEffect } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import type { User, UserRole } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, User as UserIcon, Shield, ArrowLeft, KeyRound } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { updateUser } from '@/services/userService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { ProfileForm } from '@/components/profile/ProfileForm';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';

export default function AdminProfilePage() {
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().role === 'admin') {
          setUserProfile({ id: docSnap.id, ...docSnap.data() } as User);
        } else {
          // Not an admin or no user doc, redirect
          toast({ title: "Access Denied", description: "You do not have permission to view this page.", variant: "destructive" });
          router.push("/login");
        }
      } else {
        setUserProfile(null);
        router.push('/login');
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [router, toast]);

  const handleProfileUpdate = async (data: Partial<User>) => {
    if (!userProfile) return;
    try {
      await updateUser(userProfile.id, data);
      setUserProfile(prev => prev ? { ...prev, ...data } : null);
      toast({
        title: "Profile Updated",
        description: "Your details have been successfully saved.",
      });
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Update Failed",
        description: "Could not update your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getUserInitials = (name?: string | null) => {
    if (!name) return "A";
    const parts = name.split(" ");
    if (parts.length > 1) {
      return parts[0][0] + parts[parts.length - 1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  if (isLoading) {
    return (
        <div className="max-w-2xl mx-auto text-center">
            <p>Loading profile...</p>
        </div>
    )
  }

  if (!userProfile) {
     return (
        <div className="max-w-2xl mx-auto text-center">
            <p>Please log in to view your profile.</p>
            <Button asChild className="mt-4"><Link href="/login">Login</Link></Button>
        </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Admin Profile"
        description="View and manage your account details."
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
          </Button>
        }
      />

      <Card className="shadow-lg">
        <CardHeader className="items-center text-center">
           <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={userProfile.avatarUrl || `https://placehold.co/100x100.png?text=${getUserInitials(userProfile.name)}`} alt={userProfile.name || "User"}/>
              <AvatarFallback>{getUserInitials(userProfile.name)}</AvatarFallback>
            </Avatar>
          <CardTitle className="text-2xl">{userProfile.name || "User Name"}</CardTitle>
          <CardDescription>{userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-md">
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{userProfile.email || "Email not found"}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-md">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Account Type</p>
              <p className="font-medium">{userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}</p>
            </div>
          </div>

          <div className="pt-4 text-center flex justify-center gap-4">
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Edit Profile</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Your Profile</DialogTitle>
                  <DialogDescription>
                    Make changes to your personal details here. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <ProfileForm 
                  user={userProfile} 
                  onSubmit={handleProfileUpdate} 
                  onCancel={() => setIsEditDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>

            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <KeyRound className="mr-2 h-4 w-4" />
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Change Your Password</DialogTitle>
                  <DialogDescription>
                    Enter your current password and a new password. After a successful change, you will be logged out.
                  </DialogDescription>
                </DialogHeader>
                <ChangePasswordForm onFinished={() => setIsPasswordDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
