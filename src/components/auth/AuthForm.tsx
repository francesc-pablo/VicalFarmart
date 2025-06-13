
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AuthFormProps {
  type: "login" | "register";
  defaultRole?: "customer" | "seller"; // seller role here is for admin creation context, not self-reg
}

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

// Registration schema now only allows self-registration as 'customer'
const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
  // Role is fixed to customer for self-registration
  // role: z.literal("customer", { required_error: "Role is required." })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
// Updated RegisterFormValues to reflect that role is implicitly 'customer' for self-registration
type RegisterFormValues = Omit<z.infer<typeof registerSchema>, 'role'> & { role?: "customer" };


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

  function onSubmit(values: LoginFormValues | RegisterFormValues) {
    console.log(values);
    
    if (isLogin) {
      const { email } = values as LoginFormValues;
      let userRole: UserRole = "customer"; // Default to customer
      let userName = email.split('@')[0];

      // Mocking admin login
      if (email.toLowerCase().includes("admin@")) {
        userRole = "admin";
        userName = "Admin User";
      } else if (email.toLowerCase().startsWith("seller")) { 
        // This case is for sellers created by admin. They might still login if admin sets a password.
        // But they won't have a dedicated dashboard from here.
        userRole = "seller";
        userName = "Seller User"; // This would typically come from DB
      } else {
        userName = email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);
      }
      
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userName", userName);
      localStorage.setItem("userRole", userRole);
      
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });

      window.dispatchEvent(new Event("authChange"));

      if (userRole === "admin") {
        router.push("/admin/dashboard");
      } else if (userRole === "seller") {
        // Sellers created by admin will login like customers and go to market.
        // They don't have their own dashboard anymore.
        router.push("/market"); 
      } else { // Customer
        router.push("/market");
      }

    } else { // Registration - always as 'customer'
      const { name, email } = values as RegisterFormValues;
      const role: UserRole = "customer"; // Hardcoded for self-registration

      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userName", name);
      localStorage.setItem("userRole", role);

      toast({
        title: "Registration Successful",
        description: "Your account has been created as a customer.",
      });
      
      window.dispatchEvent(new Event("authChange"));
      router.push("/market"); // Redirect customers to market after registration
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
                  {/* Role selection removed for self-registration */}
                </>
              )}
              <Button type="submit" className="w-full text-lg py-6 shadow-md">
                {isLogin ? "Login" : "Register as Customer"}
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
