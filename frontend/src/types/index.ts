export type Product = {
	id: number;
	productName: string;
	price: number;
	quantitySold: number;
	stockQuantity: number;
	image: string;
	status: string;
	description: string;
  categoryId: number;
  categoryName: string;
};

export type Category = {
  categoryId: number;
  categoryName: string;
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
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  image?: string;
};

export type Order = {
  id: number;
  userId?: number;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  subtotal: number;
  shippingFee: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  orderNumber: string;
};