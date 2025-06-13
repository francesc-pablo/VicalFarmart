
"use client";
import { AuthForm } from "@/components/auth/AuthForm";
import { useSearchParams } from 'next/navigation';
import type { Suspense } from "react"; // For type only

// It's good practice to wrap components that use useSearchParams in Suspense
// but for this simple case, we'll directly use it.
// For more complex scenarios, consider a wrapper component.

function RegisterPageContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role');

  let defaultRole: "customer" | "seller" | undefined = undefined;
  if (role === 'seller') {
    defaultRole = 'seller';
  } else if (role === 'customer') {
    defaultRole = 'customer';
  }

  return <AuthForm type="register" defaultRole={defaultRole} />;
}

export default function RegisterPage() {
  // If you were to use Suspense, it would look something like this:
  // return (
  //   <React.Suspense fallback={<div>Loading...</div>}>
  //     <RegisterPageContent />
  //   </React.Suspense>
  // );
  // For now, directly rendering:
  return <RegisterPageContent />;
}
