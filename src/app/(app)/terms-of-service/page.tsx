
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Terms of Service"
        description="Please read our terms of service carefully."
        actions={
          <Button variant="outline" asChild>
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
          </Button>
        }
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Vical Farmart Terms of Service</CardTitle>
          <CardDescription>Last Updated: {new Date().toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 prose prose-sm sm:prose-base max-w-none">
          <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Vical Farmart website and services (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to all of these Terms, do not use the Service.
          </p>

          <h2 className="text-xl font-semibold">2. Description of Service</h2>
          <p>
            Vical Farmart is an online marketplace that connects sellers of agricultural products ("Sellers") with buyers ("Buyers"). We are a platform provider and are not directly involved in the transaction between Buyers and Sellers.
          </p>

          <h2 className="text-xl font-semibold">3. User Accounts</h2>
          <p>
            To use certain features of the Service, you must register for an account. You are responsible for maintaining the confidentiality of your account password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
          </p>

          <h2 className="text-xl font-semibold">4. Seller and Buyer Responsibilities</h2>
          <p>
            Sellers are responsible for accurately describing their products, setting prices, and fulfilling orders. Buyers are responsible for reading product descriptions and making timely payments. Vical Farmart is not responsible for the quality, safety, or legality of the items listed.
          </p>
          
          <h2 className="text-xl font-semibold">5. Prohibited Conduct</h2>
          <p>
            You agree not to use the Service to:
          </p>
          <ul className="list-disc pl-6">
              <li>Violate any local, state, national, or international law.</li>
              <li>Post false, inaccurate, misleading, defamatory, or libelous content.</li>
              <li>Infringe upon any third-party's copyright, patent, trademark, trade secret or other proprietary rights or rights of publicity or privacy.</li>
              <li>Distribute viruses or any other technologies that may harm Vical Farmart or the interests or property of users.</li>
          </ul>

          <h2 className="text-xl font-semibold">6. Disclaimers and Limitation of Liability</h2>
          <p>
            The Service is provided on an "as is" and "as available" basis. Vical Farmart makes no warranties, express or implied, and hereby disclaims all warranties. In no event shall Vical Farmart be liable for any indirect, incidental, special, consequential or punitive damages.
          </p>

          <h2 className="text-xl font-semibold">7. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page.
          </p>

          <h2 className="text-xl font-semibold">8. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at info@vicalfarms.com.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
