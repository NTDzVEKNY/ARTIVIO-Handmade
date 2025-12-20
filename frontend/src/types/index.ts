export type Product = {
	id: number;
	productName: string;
	description: string | null;
	price: number;
	image: string | null;
	status: 'ACTIVE' | 'HIDDEN';
	quantitySold: number;
	stockQuantity: number;
	categoryId: number;
	categoryName: string;
};

export type Category = {
	categoryId: number;
	categoryName: string;
	slug: string;
	parentId: number | null;
	createdAt: string;
	updatedAt: string;
};

export type CartItem = {
  id: number;
  productName: string;
  price: string;
  image?: string;
  quantity: number;
  stockQuantity?: number;
};

export type ShippingAddress = {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  note?: string;
};

export type PaymentMethod = 'cod' | 'bank_transfer' | 'credit_card';

export type OrderItem = {
	id: number;
	order_id: number;
	product_id: number | null;
	quantity: number;
	price_order: number; // Giá tại thời điểm mua
};

export type Order = {
	id: number;
	customer_id: number;
	artisan_id: number;
	chat_id: number | null;
	total_price: number;
	status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
	created_at: string;
	updated_at: string;
};

export type ProductResponse = {
  content: Product[];
  totalPages: number;
  currentPage: number;
  size: number; // Backend đang trả về tổng số sản phẩm trong trường này
};

export type UserCredentials = {
  email?: string;
  password?: string;
};

export type AuthResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    // Thêm các trường user khác nếu có
  };
};