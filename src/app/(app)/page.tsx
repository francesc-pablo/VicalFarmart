
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Leaf, ShoppingBasket } from 'lucide-react';

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
            <Link href="/register">
              Create Account
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
            {/* Adjusted middle item as seller posting is now admin-driven */}
            <div className="p-4 bg-primary/20 rounded-full mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-cog w-10 h-10 text-primary"><path d="M10.74 10.74C12.53 9.49 13.23 7.18 12.35 5.3c-.47-.99-1.35-1.74-2.35-2.07s-2.13-.13-2.91.56c-.98.86-1.53 2.2-1.31 3.58.22 1.38 1.15 2.6 2.41 3.22"/><path d="M12.26 12.26C10.51 13.51 9.8 15.82 10.68 17.7c.47.99 1.35 1.74 2.35 2.07s2.13.13 2.91-.56c.98-.86 1.53-2.2 1.31-3.58-.22-1.38-1.15-2.6-2.41-3.22"/><circle cx="12" cy="12" r="10"/><path d="M18.73 18.73a9 9 0 0 0-13.45 0"/><path d="m19.07 20.3-1.41-1.41M19.07 3.71l-1.41 1.41M4.93 20.3l1.41-1.41M4.93 3.71l1.41 1.41"/><path d="M12 21a9 9 0 0 0 6.73-3.27"/><path d="M3.27 15.73A9 9 0 0 0 12 21"/></svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">2. Admins Curate Sellers</h3>
            <p className="text-foreground/70">Our admins onboard trusted local sellers and list their produce.</p>
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
