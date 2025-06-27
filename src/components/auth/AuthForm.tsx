
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
import type { UserRole } from "@/types";
import { auth, db } from "@/lib/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  FirebaseError
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

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
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Fetch user role from Firestore
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const userRole = docSnap.data().role as UserRole;
            toast({ title: "Login Successful", description: "Welcome back!" });
            
            if (userRole === "admin") {
                router.push("/admin/dashboard");
            } else { // 'customer' or 'seller'
                router.push("/market");
            }
        } else {
             toast({ title: "Login Error", description: "User data not found. Please contact support.", variant: "destructive" });
             auth.signOut();
        }
      } catch (error) {
        console.error("Login error: ", error);
        const errorCode = (error as FirebaseError).code;
        let errorMessage = "An unknown error occurred.";
        if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-credential') {
            errorMessage = "invalid account";
        }
        toast({ title: "Login Failed", description: errorMessage, variant: "destructive" });
      }

    } else { 
      // Handle Registration
      const { name, email, password } = values as RegisterFormValues;
      const role: UserRole = "customer"; // All self-registrations are customers

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update Firebase Auth profile
        await updateProfile(user, { displayName: name });
        
        // Create user document in Firestore
        await setDoc(doc(db, "users", user.uid), {
            id: user.uid,
            name: name,
            email: email,
            role: role,
            isActive: true,
            // Initialize seller fields as empty
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

        router.push("/market"); // Redirect customers to market after registration

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
