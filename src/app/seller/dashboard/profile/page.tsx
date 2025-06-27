
"use client";

import React, { useState, useEffect } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, User as UserIcon, Briefcase, Building, Phone, MapPin, Globe, KeyRound } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChangePasswordForm } from '@/components/seller/ChangePasswordForm';

export default function SellerProfilePage() {
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().role === 'seller') {
          setUserProfile({ id: docSnap.id, ...docSnap.data() } as User);
        } else {
          // Not a seller or no profile, redirect
          router.push('/login');
        }
      } else {
        // Not logged in
        router.push('/login');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router]);


  const getUserInitials = (name?: string | null) => {
    if (!name) return "S";
    const parts = name.split(" ");
    if (parts.length > 1) {
      return parts[0][0] + parts[parts.length - 1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
        <div className="max-w-4xl mx-auto text-center">
            <p>Loading your profile...</p>
        </div>
    )
  }

  if (!userProfile) {
     return (
        <div className="max-w-4xl mx-auto text-center">
            <p>Could not load profile. Please try logging in again.</p>
        </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="My Seller Profile"
        description="View your account and business details."
        actions={
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
        }
      />

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
            <Card className="shadow-lg">
                <CardHeader className="items-center text-center">
                    <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src={userProfile.avatarUrl || `https://placehold.co/100x100.png?text=${getUserInitials(userProfile.name)}`} alt={userProfile.name || "User"} data-ai-hint="person face neutral"/>
                        <AvatarFallback>{getUserInitials(userProfile.name)}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-2xl">{userProfile.name || "User Name"}</CardTitle>
                    <CardDescription>Seller</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-md">
                        <UserIcon className="h-5 w-5 text-primary mt-1" />
                        <div>
                        <p className="text-sm text-muted-foreground">Contact Person</p>
                        <p className="font-medium">{userProfile.name}</p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-md">
                        <Mail className="h-5 w-5 text-primary mt-1" />
                        <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium break-all">{userProfile.email}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-2">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-6 w-6" />
                        Business Information
                    </CardTitle>
                    <CardDescription>Details about your business registered on Vical Farmart.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoItem icon={Building} label="Business Name" value={userProfile.businessName} />
                        <InfoItem icon={UserIcon} label="Business Owner" value={userProfile.businessOwnerName} />
                        <InfoItem icon={Phone} label="Contact Number" value={userProfile.contactNumber} />
                        <InfoItem icon={Briefcase} label="Business Type" value={userProfile.businessType} />
                    </div>
                    <Separator />
                    <InfoItem icon={MapPin} label="Business Address" value={userProfile.businessAddress} fullWidth />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoItem icon={MapPin} label="Region" value={userProfile.businessLocationRegion} />
                        <InfoItem icon={MapPin} label="Town" value={userProfile.businessLocationTown} />
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoItem icon={Globe} label="Latitude" value={userProfile.geoCoordinatesLat} />
                        <InfoItem icon={Globe} label="Longitude" value={userProfile.geoCoordinatesLng} />
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

const InfoItem = ({ icon: Icon, label, value, fullWidth = false }: { icon: React.ElementType, label: string, value?: string, fullWidth?: boolean }) => {
    if (!value) return null;
    return (
        <div className={`flex items-start space-x-3 p-3 bg-muted/50 rounded-md ${fullWidth ? 'col-span-full' : ''}`}>
            <Icon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-medium break-words">{value}</p>
            </div>
        </div>
    );
};
