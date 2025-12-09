export type Product = {
	id: number;
	productName: string;
	price: string;
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