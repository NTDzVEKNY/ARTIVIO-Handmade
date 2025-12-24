export type RawCategoryResponse = {
    categoryId: number;
    categoryName: string;
    slug: string;
    parentId: number | null;
    createdAt: string;
    updatedAt: string;
    soldCount: number;
};
export interface PaginatedProductResponse {
    content: RawProductResponse[];
    size: number;
    totalElements: number;
    totalPages: number;
    currentPage: number;
}

export type RawProductResponse = {
    id: number;
    categoryId: number | null;
    categoryName: string | null;
    name: string;
    description: string | null;
    price: number;
    image: string | null;
    status: 'ACTIVE' | 'HIDDEN';
    quantitySold: number;
    stockQuantity: number;
    createdAt: string;
    updatedAt: string;
};

export interface RawOrderItem {
    productName: string;
    quantity: number;
    price: number;
    imageUrl: string | null;
}

export interface RawOrderResponse {
    id: number;
    status: string; // 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
    orderDate: string; // Backend trả về LocalDateTime, JSON sẽ là chuỗi ISO
    totalPrice: number;
    isCustomOrder: boolean;
    note: string | null ;
    items: RawOrderItem[];
}