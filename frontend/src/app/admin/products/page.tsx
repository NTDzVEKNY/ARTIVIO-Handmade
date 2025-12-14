import { ProductsClient } from '@/components/admin/products/ProductsClient';
import { db } from '@/app/api/_lib/mockData';

const ProductsPage = async () => {
  // Trong thực tế, bạn sẽ fetch dữ liệu từ API của mình
  // ở đây chúng ta dùng mock data để minh họa
  const products = db.products;

  return <ProductsClient data={products} />;
};

export default ProductsPage;