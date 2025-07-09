
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
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { useRouter } from 'next/navigation';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, values.email);
      toast({
        title: "Check Your Email",
        description: "If an account with that email exists, we've sent a password reset link.",
      });
      router.push('/login');
    } catch (error) {
      console.error("Forgot password error: ", error);
      // Still show a generic success message to prevent user enumeration
      toast({
        title: "Check Your Email",
        description: "If an account with that email exists, we've sent a password reset link.",
      });
      router.push('/login');
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">
            Forgot Your Password?
          </CardTitle>
          <CardDescription>
            No problem. Enter your email below and we'll send you a link to reset it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              <Button type="submit" className="w-full text-lg py-6 shadow-md" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            <p>
              Remembered your password?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Back to Login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
