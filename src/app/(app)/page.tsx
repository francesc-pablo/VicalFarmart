
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Leaf, ShoppingBasket, Tractor } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center text-center">
      <header className="py-12 md:py-20">
        <Leaf className="w-24 h-24 text-primary mx-auto mb-6" />
        <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight mb-6">
          Welcome to <span className="text-primary">AgriShop</span>
        </h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto mb-10">
          Your one-stop platform for fresh agricultural produce directly from local sellers. Discover quality, support farmers, and eat healthy.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild className="shadow-lg">
            <Link href="/market">
              <ShoppingBasket className="mr-2 h-5 w-5" /> Explore Market
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="shadow-lg">
            <Link href="/register?role=seller">
              <Tractor className="mr-2 h-5 w-5" /> Become a Seller
            </Link>
          </Button>
        </div>
      </header>

      <section className="py-12 md:py-20 w-full bg-secondary/30 rounded-lg shadow-inner">
        <h2 className="font-headline text-3xl md:text-4xl font-semibold mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4">
          <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
            <div className="p-4 bg-primary/20 rounded-full mb-4">
              <ShoppingBasket className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">1. Browse & Discover</h3>
            <p className="text-foreground/70">Explore a wide variety of fresh produce listed by local farmers.</p>
          </div>
          <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
            <div className="p-4 bg-primary/20 rounded-full mb-4">
              <Tractor className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">2. Sellers Post Produce</h3>
            <p className="text-foreground/70">Farmers can easily list their products, set prices, and manage inventory.</p>
          </div>
          <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
            <div className="p-4 bg-primary/20 rounded-full mb-4">
              <Leaf className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">3. Secure & Fresh Delivery</h3>
            <p className="text-foreground/70">Get your order delivered fresh, with options for mobile payment or pay on delivery.</p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 w-full">
         <h2 className="font-headline text-3xl md:text-4xl font-semibold mb-12">Featured Produce</h2>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto px-4">
            {[
              { name: "Fresh Apples", image: "https://placehold.co/300x200.png", hint: "apples fruit" },
              { name: "Organic Carrots", image: "https://placehold.co/300x200.png", hint: "carrots vegetable" },
              { name: "Ripe Tomatoes", image: "https://placehold.co/300x200.png", hint: "tomatoes vegetable" },
              { name: "Green Lettuce", image: "https://placehold.co/300x200.png", hint: "lettuce greens" },
            ].map(item => (
                <div key={item.name} className="bg-card rounded-lg shadow-md overflow-hidden group">
                    <Image src={item.image} alt={item.name} width={300} height={200} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" data-ai-hint={item.hint}/>
                    <div className="p-4">
                        <h3 className="text-lg font-semibold mb-1">{item.name}</h3>
                        <Button variant="link" asChild className="p-0 h-auto">
                            <Link href="/market">View Details</Link>
                        </Button>
                    </div>
                </div>
            ))}
         </div>
      </section>
    </div>
  );
}
