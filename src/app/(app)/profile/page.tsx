
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import type { User, UserRole } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, User as UserIcon, Shield, Briefcase, ArrowLeft, Loader2 } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { updateUser } from '@/services/userService';
import { uploadFile } from '@/services/storageService';

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserProfile({ id: docSnap.id, ...docSnap.data() } as User);
        } else {
          console.log("No such document!");
          setUserProfile({
            id: user.uid,
            name: user.displayName || 'User',
            email: user.email || 'No email',
            role: 'customer', 
            isActive: true,
          });
        }
      } else {
        setUserProfile(null);
        router.push('/login');
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && userProfile) {
      setIsUploading(true);
      try {
        const avatarUrl = await uploadFile(file, `avatars/${userProfile.id}`);
        await updateUser(userProfile.id, { avatarUrl });
        
        setUserProfile(prev => prev ? { ...prev, avatarUrl } : null);
        
        toast({ title: "Success", description: "Profile picture updated." });
      } catch (error) {
        console.error(error);
        toast({ title: "Upload Failed", description: "Could not upload your profile picture.", variant: "destructive" });
      } finally {
        setIsUploading(false);
        if(fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const handleAvatarClick = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const getUserInitials = (name?: string | null) => {
    if (!name) return "P";
    const parts = name.split(" ");
    if (parts.length > 1) {
      return parts[0][0] + parts[parts.length - 1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getRoleIcon = (role?: UserRole | null) => {
    if (role === 'admin') return <Shield className="h-5 w-5 text-primary" />;
    if (role === 'seller') return <Briefcase className="h-5 w-5 text-primary" />;
    return <UserIcon className="h-5 w-5 text-primary" />;
  }
  
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
        title="My Profile"
        description="View and manage your account details."
        actions={
          <Button variant="outline" asChild>
            <Link href="/market"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Market</Link>
          </Button>
        }
      />

      <Card className="shadow-lg">
        <CardHeader className="items-center text-center">
           <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            hidden
            accept="image/png, image/jpeg"
          />
          <div className="relative">
            <Avatar className="h-24 w-24 mb-4 cursor-pointer" onClick={handleAvatarClick} title="Click to upload new picture">
              <AvatarImage src={userProfile.avatarUrl || `https://placehold.co/100x100.png?text=${getUserInitials(userProfile.name)}`} alt={userProfile.name || "User"}/>
              <AvatarFallback>{getUserInitials(userProfile.name)}</AvatarFallback>
            </Avatar>
            {isUploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full mb-4"><Loader2 className="h-8 w-8 animate-spin text-white" /></div>}
          </div>
          <CardTitle className="text-2xl">{userProfile.name || "User Name"}</CardTitle>
          <CardDescription>{userProfile.role ? userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1) : "Role not found"}</CardDescription>
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
            {getRoleIcon(userProfile.role)}
            <div>
              <p className="text-sm text-muted-foreground">Account Type</p>
              <p className="font-medium">{userProfile.role ? userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1) : "N/A"}</p>
            </div>
          </div>

          <div className="pt-4 text-center">
            <Button variant="outline" disabled>Edit Profile (Coming Soon)</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
