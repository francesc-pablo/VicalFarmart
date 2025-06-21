
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { useToast } from '@/hooks/use-toast';

export default function ContactUsPage() {
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // In a real app, you would handle form submission here (e.g., send data to an API)
    toast({
      title: "Message Sent!",
      description: "Thank you for contacting us. We will get back to you shortly.",
    });
    // Optionally reset the form
    (event.target as HTMLFormElement).reset();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Contact Us"
        description="We'd love to hear from you. Reach out with any questions or feedback."
        actions={
          <Button variant="outline" asChild>
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
          </Button>
        }
      />
      <div className="grid md:grid-cols-2 gap-10">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Get in Touch</CardTitle>
            <CardDescription>Fill out the form below and we&apos;ll get back to you as soon as possible.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" placeholder="John Doe" required />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" required />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" name="subject" placeholder="Question about an order" required />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" name="message" placeholder="Your message..." rows={5} required />
              </div>
              <Button type="submit" className="w-full shadow-md">Send Message</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Our Contact Information</CardTitle>
            <CardDescription>You can also reach us through the following channels:</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 pt-1">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-muted-foreground">support@vicalfarmart.com</p>
                <p className="text-muted-foreground">info@vicalfarmart.com</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 pt-1">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Phone</h3>
                <p className="text-muted-foreground">+233302958685</p>
                {/* <p className="text-muted-foreground">(+254) 711 111 111</p> */}
              </div>
            </div>
            <div className="flex items-start space-x-3">
               <div className="flex-shrink-0 pt-1">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Office Address</h3>
                <p className="text-muted-foreground">Lakeside Estate</p>
                {/* <p className="text-muted-foreground">Nairobi, Kenya</p> */}
              </div>
            </div>
            {/* You can add a map embed here if needed */}
            {/* <div className="aspect-video w-full">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d..."
                width="100%"
                height="100%"
                style={{ border:0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Vical Farmart Location"
                className="rounded-md"
              ></iframe>
            </div> */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
