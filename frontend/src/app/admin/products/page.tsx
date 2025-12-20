import { ProductsClient } from '@/components/admin/products/ProductsClient';
import { getProducts } from '@/services/api';

const ProductsPage = async () => {
  const productsResponse = await getProducts({});
  const products = productsResponse.content;

  return <ProductsClient data={products} />;
};

export default ProductsPage;