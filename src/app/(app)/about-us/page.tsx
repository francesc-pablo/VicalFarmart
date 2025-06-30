
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Target } from "lucide-react";
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
          <CardContent className="p-8 space-y-4">
            <h2 className="text-2xl font-bold font-headline mb-4">Our Background</h2>
            <p className="text-muted-foreground leading-relaxed">
              VICAL FARMARTS is an online farmer’s market platform developed by VICAL FARM in partnership 
              with the GHANA CO-OPERATIVE AGRICULTURAL PRODUCERS AND MARKETING ASSOCIATION to 
              facilitate the needed market linkages between producers, actors in the agriculture value chain and 
              consumer.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              VICAL FARMS is a business enterprise incorporated under the Laws of Ghana since 2014 as an out-grower, marketer and exporter of agricultural commodities both locally and internationally and was 
              later became the accredited center of FARMERS SUPPORT INITIATIVE U.K, responsible for promoting 
              agricultural development in Ghana.
            </p>
             <p className="text-muted-foreground leading-relaxed">
              VICAL FARMS is an official partner of the Ghana Co-operative Agricultural Producers and Marketing Association (AGRICCOPS GHANA) which is the apex body of all 
              agriculture co-operative in Ghana with its membership drawn from all the sectors of the agriculture 
              value chain in Ghana. It was founded in 1972 and registered as a co-operative association in 1974.
            </p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-1 gap-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Target className="h-8 w-8 text-primary" />
                <span className="text-2xl font-headline">Mission Statement</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-lg">
                To make food readily available and accessible to all through technology and innovation.
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
                <h3 className="font-semibold text-lg">Mr. Victor Alorbu</h3>
                <p className="text-primary">Founder & CEO</p>
             </div>
             <div className="text-center">
                <Image src="https://placehold.co/128x128.png" alt="Team Member 2" width={128} height={128} className="rounded-full mx-auto mb-4 shadow-md" data-ai-hint="person face portrait"/>
                <h3 className="font-semibold text-lg">Mr. William</h3>
                <p className="text-primary">Head of Technology</p>
             </div>
             <div className="text-center">
                <Image src="https://placehold.co/128x128.png" alt="Team Member 3" width={128} height={128} className="rounded-full mx-auto mb-4 shadow-md" data-ai-hint="person face portrait"/>
                <h3 className="font-semibold text-lg">Mr. Victor Alorbu</h3>
                <p className="text-primary">Farmer Relations</p>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
