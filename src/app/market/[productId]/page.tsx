
import { getProducts } from '@/services/productService';
import ProductClientPage from '@/components/products/ProductClientPage';

// This function tells Next.js which product pages to build statically
export async function generateStaticParams() {
  const products = await getProducts();
 
  return products.map((product) => ({
    productId: product.id,
  }));
}

// This is the Server Component for the page.
// It pre-renders the route and then hands off to the client component.
export default function ProductPage() {
  return <ProductClientPage />;
}
    