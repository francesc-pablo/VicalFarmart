
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
  FirebaseError
} from "firebase/auth";
import { collection, doc, getDoc, getDocs, limit, query, setDoc, updateDoc, where } from "firebase/firestore";

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
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;


export function AuthForm({ type }: AuthFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const isLogin = type === "login";
  const formSchema = isLogin ? loginSchema : registerSchema;

  const form = useForm<LoginFormValues | RegisterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: isLogin
      ? { email: "", password: "" }
      : { name: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: LoginFormValues | RegisterFormValues) {
    if (isLogin) {
      // Handle Login
      const { email, password } = values as LoginFormValues;
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          toast({ title: "Login Failed", description: "invalid account", variant: "destructive" });
          return;
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data() as User;
        const userDocRef = userDoc.ref;

        if (userData.lockoutUntil && userData.lockoutUntil > Date.now()) {
          const remainingMinutes = Math.ceil((userData.lockoutUntil - Date.now()) / 60000);
          toast({
            title: "Account Locked",
            description: `Too many failed login attempts. Please try again in ${remainingMinutes} minutes.`,
            variant: "destructive",
          });
          return;
        }

        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          if (userData.failedLoginAttempts && userData.failedLoginAttempts > 0) {
            await updateDoc(userDocRef, { failedLoginAttempts: 0, lockoutUntil: null });
          }
          
          toast({ title: "Login Successful", description: "Welcome back!" });
          if (userData.role === "admin") {
              router.push("/admin/dashboard");
          } else {
              router.push("/market");
          }
        } catch (authError) {
          const failedAttempts = (userData.failedLoginAttempts || 0) + 1;
          let newLockoutUntil: number | null = userData.lockoutUntil || null;
          let lockoutMessage = "";

          if (failedAttempts >= 12) {
            newLockoutUntil = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
            lockoutMessage = "Your account has been locked for 2 hours due to too many failed login attempts.";
          } else if (failedAttempts >= 6) {
            newLockoutUntil = Date.now() + 30 * 60 * 1000; // 30 minutes
            lockoutMessage = "Your account has been locked for 30 minutes due to too many failed login attempts.";
          }
          
          await updateDoc(userDocRef, { failedLoginAttempts, lockoutUntil: newLockoutUntil });

          if (lockoutMessage) {
            toast({ title: "Account Locked", description: lockoutMessage, variant: "destructive" });
          } else {
            toast({ title: "Login Failed", description: "The password you entered is incorrect. Please try again.", variant: "destructive" });
          }
        }
      } catch (error) {
        console.error("Login process error: ", error);
        toast({ title: "Login Failed", description: "An unexpected error occurred.", variant: "destructive" });
      }

    } else { 
      // Handle Registration
      const { name, email, password } = values as RegisterFormValues;
      const role: UserRole = "customer"; // All self-registrations are customers

      try {
        // Check if user already exists
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            toast({ title: "Registration Failed", description: "This email address is already registered.", variant: "destructive" });
            return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await updateProfile(user, { displayName: name });
        
        await setDoc(doc(db, "users", user.uid), {
            id: user.uid,
            name: name,
            email: email,
            role: role,
            isActive: true,
            failedLoginAttempts: 0,
            lockoutUntil: null,
            businessName: "",
            businessOwnerName: "",
            businessAddress: "",
            contactNumber: "",
            businessLocationRegion: "",
            businessLocationTown: "",
            geoCoordinatesLat: "",
            geoCoordinatesLng: "",
            businessType: "",
        });

        toast({
          title: "Registration Successful",
          description: "Your customer account has been created.",
        });

        router.push("/market");

      } catch (error) {
        console.error("Registration error: ", error);
        const errorCode = (error as FirebaseError).code;
        let errorMessage = "An unknown error occurred during registration.";
        if (errorCode === 'auth/email-already-in-use') {
            errorMessage = "This email address is already registered.";
        }
        toast({ title: "Registration Failed", description: errorMessage, variant: "destructive" });
      }
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">
            {isLogin ? "Welcome Back!" : "Create Customer Account"}
          </CardTitle>
          <CardDescription>
            {isLogin ? "Login to access your Vical Farmart account." : "Join Vical Farmart to start shopping."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              <Button type="submit" className="w-full text-lg py-6 shadow-md" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Processing..." : (isLogin ? "Login" : "Register as Customer")}
              </Button>
            </form>
          </Form>
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
