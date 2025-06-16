
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Privacy Policy"
        description="Our commitment to your privacy."
        actions={
          <Button variant="outline" asChild>
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
          </Button>
        }
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Vical Farmart Privacy Policy</CardTitle>
          <CardDescription>Last Updated: {new Date().toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 prose prose-sm sm:prose-base max-w-none">
          <p>
            Welcome to Vical Farmart. We are committed to protecting your personal information and your right to privacy.
            If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information,
            please contact us.
          </p>

          <h2 className="text-xl font-semibold">1. Information We Collect</h2>
          <p>
            We collect personal information that you voluntarily provide to us when you register on the Vical Farmart,
            express an interest in obtaining information about us or our products and Services, when you participate in activities
            on the Vical Farmart or otherwise when you contact us.
          </p>
          <p>
            The personal information that we collect depends on the context of your interactions with us and the Vical Farmart,
            the choices you make and the products and features you use. The personal information we collect may include the following:
            Name, Phone Number, Email Address, Mailing Address, Usernames, Passwords, Contact Preferences, etc.
          </p>

          <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
          <p>
            We use personal information collected via our Vical Farmart for a variety of business purposes described below.
            We process your personal information for these purposes in reliance on our legitimate business interests, in order to
            enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>To facilitate account creation and logon process.</li>
            <li>To post testimonials.</li>
            <li>Request feedback.</li>
            <li>To enable user-to-user communications.</li>
            <li>To manage user accounts.</li>
            <li>To send administrative information to you.</li>
            <li>To protect our Services.</li>
            <li>To respond to legal requests and prevent harm.</li>
          </ul>

          <h2 className="text-xl font-semibold">3. Will Your Information Be Shared With Anyone?</h2>
          <p>
            We only share information with your consent, to comply with laws, to provide you with services, to protect your rights,
            or to fulfill business obligations.
          </p>

          <h2 className="text-xl font-semibold">4. How Long Do We Keep Your Information?</h2>
          <p>
            We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice,
            unless a longer retention period is required or permitted by law (such as tax, accounting or other legal requirements).
          </p>

          <h2 className="text-xl font-semibold">5. How Do We Keep Your Information Safe?</h2>
          <p>
            We aim to protect your personal information through a system of organizational and technical security measures.
            However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet
            or information storage technology can be guaranteed to be 100% secure.
          </p>

          <h2 className="text-xl font-semibold">6. What Are Your Privacy Rights?</h2>
          <p>
            In some regions (like the European Economic Area), you have rights that allow you greater access to and control
            over your personal information. You may review, change, or terminate your account at any time.
          </p>

          <h2 className="text-xl font-semibold">7. Updates To This Notice</h2>
          <p>
            We may update this privacy notice from time to time. The updated version will be indicated by an updated
            &quot;Revised&quot; date and the updated version will be effective as soon as it is accessible.
          </p>

          <h2 className="text-xl font-semibold">8. How Can You Contact Us About This Notice?</h2>
          <p>
            If you have questions or comments about this notice, you may email us at privacy@vicalfarmart.com or by post to:
            [Your Company Address Here]
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
