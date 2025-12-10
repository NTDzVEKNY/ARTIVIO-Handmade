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