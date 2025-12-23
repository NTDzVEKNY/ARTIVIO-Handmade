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