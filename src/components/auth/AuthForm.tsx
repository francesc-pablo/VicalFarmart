"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import type { User, UserRole } from "@/types";
import { auth, db } from "@/lib/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  fetchSignInMethodsForEmail
} from "firebase/auth";
import { collection, doc, getDoc, getDocs, limit, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { sendWelcomeEmail } from "@/ai/flows/emailFlows";
import React, { useState, useEffect, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRODUCT_REGIONS, GHANA_REGIONS_AND_TOWNS } from '@/lib/constants';

interface AuthStatus {
  isAuthenticated: boolean;
  user?: User | null;
}

interface AuthFormProps {
  type: "login" | "register";
}

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(10, { message: "A valid phone number is required." }),
  address: z.string().min(5, { message: "Home address is required." }),
  region: z.string().min(1, { message: "Please select a region." }),
  town: z.string().min(1, { message: "Please select a town." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.9-4.82 1.9-5.78 0-10.47-4.88-10.47-10.9s4.7-10.9 10.47-10.9c3.28 0 5.48 1.34 6.73 2.54l2.25-2.25C19.5 1.05 16.48 0 12.48 0 5.6 0 0 5.6 0 12.5S5.6 25 12.48 25c7.04 0 11.52-4.92 11.52-11.72 0-.8-.08-1.52-.22-2.28H12.48z" fill="currentColor" />
  </svg>
);

export function AuthForm({ type }: AuthFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isProcessingGoogle, setIsProcessingGoogle] = useState(false);

  const isLogin = type === "login";
  const formSchema = isLogin ? loginSchema : registerSchema;

  const form = useForm<LoginFormValues | RegisterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: isLogin
      ? { email: "", password: "" }
      : { name: "", email: "", phone: "", address: "", region: "", town: "", password: "", confirmPassword: "" },
  });

  const [availableTowns, setAvailableTowns] = useState<string[]>([]);
  const watchedRegion = (form.watch as any)("region");

  useEffect(() => {
    if (watchedRegion) {
      const towns = GHANA_REGIONS_AND_TOWNS[watchedRegion] || [];
      setAvailableTowns(towns);
    } else {
      setAvailableTowns([]);
    }
  }, [watchedRegion]);

  const processUserSignIn = useCallback(async (user: any) => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      let userRole: UserRole = 'customer';

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data() as User;
        if (!userData.isActive) {
          toast({
            title: "Login Failed",
            description: "Your account has been deactivated.",
            variant: "destructive",
          });
          await signOut(auth);
          return;
        }
        userRole = userData.role;
        toast({ title: "Login Successful", description: "Welcome back!" });
      } else {
        await setDoc(userDocRef, {
          id: user.uid,
          name: user.displayName || 'User',
          email: user.email!,
          role: 'customer',
          isActive: true,
          createdAt: serverTimestamp(),
          failedLoginAttempts: 0,
          lockoutUntil: null,
        }, { merge: true });
        
        try {
          await sendWelcomeEmail({ name: user.displayName || 'User', email: user.email! });
        } catch (e) {
          console.warn("Welcome email failed", e);
        }

        toast({ title: "Registration Successful", description: "Your account has been created." });
      }
      
      const dashboardMap: Record<string, string> = {
        'admin': '/admin/dashboard',
        'seller': '/seller/dashboard',
        'courier': '/courier/dashboard',
        'supervisor': '/supervisor/dashboard',
        'customer': '/market'
      };
      router.push(dashboardMap[userRole] || '/market');
    } catch (error) {
      console.error("Error processing user sign in:", error);
      toast({
        title: "Sign-In Error",
        description: "Profile setup failed. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingGoogle(false);
    }
  }, [router, toast]);

  const handleGoogleSignIn = async () => {
    if (!auth || !auth.app) {
      toast({ title: "Auth Error", description: "Firebase Auth is not initialized. Please restart the app.", variant: "destructive" });
      return;
    }

    try {
      setIsProcessingGoogle(true);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      // Standard Web popup
      const result = await signInWithPopup(auth, provider);
      await processUserSignIn(result.user);
    } catch (error: any) {
      console.error("Google Sign-In Error: ", error);
      setIsProcessingGoogle(false);
      
      let message = error.message || "An unexpected error occurred.";
      if (error.code === 'auth/argument-error') {
        message = "Configuration error. Please check your Firebase settings.";
      } else if (error.code === 'auth/popup-closed-by-user') {
        message = "Sign-in cancelled.";
      }
      
      toast({
        title: "Google Sign-In Failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  async function onSubmit(values: LoginFormValues | RegisterFormValues) {
    if (isLogin) {
      const { email, password } = values as LoginFormValues;
      try {
        await signInWithEmailAndPassword(auth, email, password);
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const userData = userDoc.data() as User;
          
          if (userData && !userData.isActive) {
            toast({ title: "Login Failed", description: "Account deactivated.", variant: "destructive" });
            await signOut(auth);
            return;
          }

          toast({ title: "Login Successful", description: "Welcome back!" });
          const dashboardMap: Record<string, string> = {
            'admin': '/admin/dashboard', 'seller': '/seller/dashboard', 'courier': '/courier/dashboard', 'supervisor': '/supervisor/dashboard', 'customer': '/market'
          };
          router.push(dashboardMap[userData?.role || 'customer'] || '/market');
        }
      } catch (error: any) {
        toast({ title: "Login Failed", description: "Invalid email or password.", variant: "destructive" });
      }
    } else { 
      const { name, email, password, phone, address, region, town } = values as RegisterFormValues;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName: name });
        
        await setDoc(doc(db, "users", user.uid), {
            id: user.uid, name, email, phone, address, region, town,
            role: "customer", isActive: true, createdAt: serverTimestamp(),
            failedLoginAttempts: 0, lockoutUntil: null,
        });

        try { await sendWelcomeEmail({ name, email }); } catch (e) {}
        toast({ title: "Registration Successful", description: "Account created." });
        router.push("/market");
      } catch (error: any) {
        toast({ title: "Registration Failed", description: error.message, variant: "destructive" });
      }
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">
            {isLogin ? "Welcome Back!" : "Create Account"}
          </CardTitle>
          <CardDescription>
            {isLogin ? "Login to access your Vical Farmart account." : "Join Vical Farmart to start shopping."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {!isLogin && (
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!isLogin && (
                <>
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="(123) 456-7890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Home Address</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 123 Flower Pot Lane" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                      <FormField
                          control={form.control}
                          name="region"
                          render={({ field }) => (
                          <FormItem>
                              <FormLabel>Region</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                  <SelectTrigger>
                                      <SelectValue placeholder="Select region" />
                                  </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                  {PRODUCT_REGIONS.map((region) => (
                                      <SelectItem key={region} value={region}>
                                      {region}
                                      </SelectItem>
                                  ))}
                                  </SelectContent>
                              </Select>
                              <FormMessage />
                          </FormItem>
                          )}
                      />
                      <FormField
                          control={form.control}
                          name="town"
                          render={({ field }) => (
                          <FormItem>
                              <FormLabel>Town</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value} disabled={availableTowns.length === 0}>
                                  <FormControl>
                                  <SelectTrigger>
                                      <SelectValue placeholder="Select town" />
                                  </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                  {availableTowns.map((town) => (
                                      <SelectItem key={town} value={town}>
                                      {town}
                                      </SelectItem>
                                  ))}
                                  </SelectContent>
                              </Select>
                              <FormMessage />
                          </FormItem>
                          )}
                      />
                  </div>
                </>
              )}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               {isLogin && (
                <div className="text-right text-sm -mt-2">
                  <Link
                    href="/forgot-password"
                    className="font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}
              {!isLogin && (
                <>
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              <Button type="submit" className="w-full text-lg py-6 shadow-md" disabled={form.formState.isSubmitting || isProcessingGoogle}>
                {form.formState.isSubmitting ? "Processing..." : (isLogin ? "Login" : "Register")}
              </Button>
            </form>
          </Form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button variant="outline" className="w-full" type="button" onClick={handleGoogleSignIn} disabled={form.formState.isSubmitting || isProcessingGoogle}>
            <GoogleIcon className="mr-2 h-5 w-5" />
            {isProcessingGoogle ? "Processing..." : "Continue with Google"}
          </Button>
          
          <div className="mt-6 text-center text-sm">
            {isLogin ? (
              <p>
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-medium text-primary hover:underline">
                  Register here
                </Link>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-primary hover:underline">
                  Login here
                </Link>
              </p>
            )}
             <p className="mt-2">
                <Link href="/" className="font-medium text-accent hover:underline">
                  Back to Home
                </Link>
              </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
