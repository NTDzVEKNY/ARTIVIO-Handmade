import { ProductForm } from '@/components/admin/products/ProductForm';

const NewProductPage = () => {
  return (
    <div className="rounded-xl shadow-sm p-6 sm:p-8" style={{ backgroundColor: '#F7F1E8', border: '1px solid #E8D5B5' }}>
      <div className="mb-4">
        <h1 className="text-2xl font-bold" style={{ color: '#3F2E23' }}>
          Create Product
        </h1>
        <p className="text-sm" style={{ color: '#6B4F3E' }}>
          Add a new product to your store
        </p>
      </div>
      <div>
        <ProductForm initialData={null} />
      </div>
    </div>
  );
};

export default NewProductPage;
