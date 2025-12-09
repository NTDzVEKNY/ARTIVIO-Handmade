import { fetchApi } from '@/services/api';
import { ProductForm } from '@/components/admin/products/ProductForm';
import { Product } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const EditProductPage = async ({ params }: { params: { id: string } }) => {
  let product: Product | null = null;
  try {
    // There is no direct /api/products/{id} GET endpoint in the backend
    // We fetch all and find the one, this is inefficient and should be fixed in a real app
    const productsData = await fetchApi<{content: Product[]}>('/products?size=1000'); // Assuming there are less than 1000 products
    product = productsData.content.find(p => String(p.id) === params.id) || null;
  } catch (error) {
    console.error("Failed to fetch product", error);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Product</CardTitle>
        <CardDescription>Edit an existing product</CardDescription>
      </CardHeader>
      <CardContent>
        <ProductForm initialData={product} />
      </CardContent>
    </Card>
  );
};

export default EditProductPage;
