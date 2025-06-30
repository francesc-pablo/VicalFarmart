
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Target, Eye, BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AboutUsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="About Vical Farmart"
        description="Learn more about our mission to revolutionize the agricultural marketplace."
        actions={
          <Button variant="outline" asChild>
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
          </Button>
        }
      />
      
      <div className="space-y-12">
        <Card className="shadow-lg overflow-hidden">
            <div className="relative w-full h-64">
                <Image 
                    src="https://images.unsplash.com/photo-1560493676-04071c5f467b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxmYXJtaW5nfGVufDB8fHx8MTc1MTAyNjcwN3ww&ixlib=rb-4.1.0&q=80&w=1080" 
                    alt="Lush green farm" 
                    fill
                    className="object-cover"
                    data-ai-hint="farming lush"
                />
            </div>
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold font-headline mb-4">Our Story</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vical Farmart was born from a simple yet powerful idea: to bridge the gap between hardworking local farmers and consumers who seek fresh, high-quality produce. We saw the challenges farmers faced in reaching broader markets and the desire of buyers for a direct, transparent connection to their food sources. With a passion for both technology and agriculture, we set out to build a platform that empowers both sides of the agricultural equation. Our journey is one of community, innovation, and a deep-rooted belief in the power of local farming to nourish our communities and sustain our planet.
            </p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Target className="h-8 w-8 text-primary" />
                <span className="text-2xl font-headline">Our Mission</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To empower local farmers by providing them with a robust, accessible digital marketplace to sell their produce directly to consumers, ensuring fair prices and sustainable growth.
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Eye className="h-8 w-8 text-primary" />
                <span className="text-2xl font-headline">Our Vision</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To create a future where every consumer has access to fresh, locally-sourced food, and every farmer has the tools they need to thrive in a modern economy.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-center">Meet the Team</CardTitle>
            <p className="text-muted-foreground text-center">The passionate individuals behind Vical Farmart.</p>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
             <div className="text-center">
                <Image src="https://placehold.co/128x128.png" alt="Team Member 1" width={128} height={128} className="rounded-full mx-auto mb-4 shadow-md" data-ai-hint="person face portrait"/>
                <h3 className="font-semibold text-lg">Alex Doe</h3>
                <p className="text-primary">Founder & CEO</p>
             </div>
             <div className="text-center">
                <Image src="https://placehold.co/128x128.png" alt="Team Member 2" width={128} height={128} className="rounded-full mx-auto mb-4 shadow-md" data-ai-hint="person face portrait"/>
                <h3 className="font-semibold text-lg">Jane Smith</h3>
                <p className="text-primary">Head of Technology</p>
             </div>
             <div className="text-center">
                <Image src="https://placehold.co/128x128.png" alt="Team Member 3" width={128} height={128} className="rounded-full mx-auto mb-4 shadow-md" data-ai-hint="person face portrait"/>
                <h3 className="font-semibold text-lg">Samuel Green</h3>
                <p className="text-primary">Farmer Relations</p>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
