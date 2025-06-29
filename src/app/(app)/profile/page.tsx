
"use client";

import React, { useState, useEffect } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import type { User, UserRole } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, User, Shield, Briefcase, ArrowLeft } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserProfile({ id: docSnap.id, ...docSnap.data() } as User);
        } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
          // Handle case where user exists in Auth but not in Firestore
          setUserProfile({
            id: user.uid,
            name: user.displayName || 'User',
            email: user.email || 'No email',
            role: 'customer', // default role
            isActive: true,
          });
        }
      } else {
        // User is signed out
        setUserProfile(null);
        router.push('/login');
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]);


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
    return <User className="h-5 w-5 text-primary" />;
  }
  
  if (isLoading) {
    return (
        <div className="max-w-2xl mx-auto text-center">
            <p>Loading profile...</p>
        </div>
    )
  }

  if (!userProfile) {
    // This case is handled by the redirect in onAuthStateChanged, but as a fallback
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
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={`https://placehold.co/100x100.png?text=${getUserInitials(userProfile.name)}`} alt={userProfile.name || "User"} data-ai-hint="person face neutral"/>
            <AvatarFallback>{getUserInitials(userProfile.name)}</AvatarFallback>
          </Avatar>
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

          {/* Placeholder for more profile actions */}
          <div className="pt-4 text-center">
            <Button variant="outline" disabled>Edit Profile (Coming Soon)</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
