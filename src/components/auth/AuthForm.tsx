
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
  defaultRole?: "customer" | "seller";
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
  role: z.enum(["customer", "seller"], { required_error: "Please select a role." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export function AuthForm({ type, defaultRole }: AuthFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const isLogin = type === "login";
  const formSchema = isLogin ? loginSchema : registerSchema;

  const form = useForm<LoginFormValues | RegisterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: isLogin
      ? { email: "", password: "" }
      : { name: "", email: "", password: "", confirmPassword: "", role: defaultRole || "customer" },
  });

  function onSubmit(values: LoginFormValues | RegisterFormValues) {
    console.log(values);
    
    if (isLogin) {
      const { email } = values as LoginFormValues;
      let userRole: UserRole = "customer";
      let userName = email.split('@')[0]; // Mock user name

      if (email.toLowerCase().includes("admin@")) {
        userRole = "admin";
        userName = "Admin User";
      } else if (email.toLowerCase().includes("seller@")) {
        userRole = "seller";
        userName = "Seller User"; // Default name for sellers
      } else {
        // For other emails, assume customer. userName can be improved.
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

      window.dispatchEvent(new Event("authChange")); // Notify header to update

      if (userRole === "admin") {
        router.push("/admin/dashboard");
      } else if (userRole === "seller") {
        router.push("/seller/dashboard");
      } else {
        router.push("/market");
      }

    } else { // Registration
      const { name, email, role } = values as RegisterFormValues;
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userName", name);
      localStorage.setItem("userRole", role);

      toast({
        title: "Registration Successful",
        description: "Your account has been created.",
      });
      
      window.dispatchEvent(new Event("authChange")); // Notify header to update

      if (role === "seller") {
        router.push("/seller/dashboard");
      } else { // customer
        router.push("/market"); // Redirect customers to market after registration
      }
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">
            {isLogin ? "Welcome Back!" : "Create an Account"}
          </CardTitle>
          <CardDescription>
            {isLogin ? "Login to access your AgriShop dashboard." : "Join AgriShop as a customer or seller."}
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
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Register as a...</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="customer" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Customer
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="seller" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Seller
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              <Button type="submit" className="w-full text-lg py-6 shadow-md">
                {isLogin ? "Login" : "Register"}
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
