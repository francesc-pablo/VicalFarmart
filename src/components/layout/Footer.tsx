export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/95 py-6 mt-auto">
      <div className="container mx-auto text-center text-sm text-foreground/60">
        <p>&copy; {new Date().getFullYear()} Vical Farmart. All rights reserved.</p>
        <p className="mt-1">Fresh Produce, Directly From Farm to You.</p>
      </div>
    </footer>
  );
}
