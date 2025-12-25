'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Product } from '@/types';
import { axiosClient } from '@/lib/axios';
import useAxiosAuth from '@/hooks/useAxiosAuth';
import { RawProductResponse } from '@/types/apiTypes';
import { mapToProduct } from '@/utils/ProductMapper';
import {useSession} from "next-auth/react";

interface FormData {
    title: string;
    description: string;
    expected_price: string;
    reference_images: string[];
}

interface FormErrors {
    title?: string;
    description?: string;
}

export default function CustomRequestPage() {
    const { data: session } = useSession();
    const axiosAuth = useAxiosAuth();
    const params = useParams();
    const router = useRouter();
    const productId = Array.isArray(params.productId) ? Number(params.productId[0]) : Number(params.productId);

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Đã xóa các trường không cần thiết khỏi state
    const [formData, setFormData] = useState<FormData>({
        title: '',
        description: '',
        expected_price: '',
        reference_images: [],
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    useEffect(() => {
        if (!productId || Number.isNaN(productId)) {
            toast.error('ID sản phẩm không hợp lệ');
            setLoading(false);
            return;
        }

        const fetchProduct = async () => {
            try {
                const productData = await axiosClient.get<RawProductResponse>(`/products/${productId}`);
                const product = mapToProduct(productData.data);
                setProduct(product);
            } catch (err) {
                toast.error('Không tải được thông tin sản phẩm');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newPreviews: string[] = [];
        Array.from(files).forEach((file) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const result = reader.result as string;
                    newPreviews.push(result);
                    if (newPreviews.length === Array.from(files).length) {
                        setImagePreviews((prev) => [...prev, ...newPreviews]);
                        setFormData((prev) => ({
                            ...prev,
                            reference_images: [...prev.reference_images, ...newPreviews],
                        }));
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    };

    const removeImage = (index: number) => {
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
        setFormData((prev) => ({
            ...prev,
            reference_images: prev.reference_images.filter((_, i) => i !== index),
        }));
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Vui lòng nhập tiêu đề yêu cầu';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Vui lòng nhập mô tả chi tiết';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        setSubmitting(true);

        try {
            const response = await axiosAuth.post('/chat/initiate', {
                artisanId: 1,
                productId: productId,
                title: formData.title.trim(),
                description: formData.description.trim(),
                budget: formData.expected_price ? Number(formData.expected_price) : undefined,
                reference_images: formData.reference_images,
            });

            console.log(response);
            toast.success('Yêu cầu đã được gửi thành công!');
            router.push(`/chat/${response.data.chatId}`);
        } catch (error) {
            toast.error('Có lỗi xảy ra khi gửi yêu cầu');
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen font-sans text-gray-800 bg-white">
                <Header />
                <main className="container mx-auto px-6 py-12">
                    <div className="text-center py-24">Đang tải...</div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen font-sans text-gray-800 bg-white">
                <Header />
                <main className="container mx-auto px-6 py-12">
                    <div className="text-center py-24">
                        <h2 className="text-2xl font-semibold mb-4">Không tìm thấy sản phẩm</h2>
                        <Link href="/shop/products" className="text-[#0f172a] hover:underline">
                            ← Quay lại cửa hàng
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen font-sans text-gray-800 bg-white">
            <Header />

            <main className="container mx-auto px-6 py-12 max-w-4xl">
                <Link
                    href={`/shop/id/${productId}`}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-[#0f172a] mb-6"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                            clipRule="evenodd"
                        />
                    </svg>
                    Quay lại sản phẩm
                </Link>

                <h1 className="text-3xl font-bold mb-8">Yêu cầu sản phẩm tùy chỉnh</h1>

                {/* Product Information Section */}
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Thông tin sản phẩm</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100">
                            <Image
                                src={product.image ? (product.image.startsWith('//') ? `https:${product.image}` : product.image) : product.image || '/hero-handmade.jpg'}
                                alt={product.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold">{product.name}</h3>
                            <p className="text-gray-600 text-sm">{product.description || 'Không có mô tả'}</p>
                            <p className="text-lg font-bold text-[#0f172a]">
                                ₫{(product.price || 0).toLocaleString('vi-VN')}
                            </p>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                                <p className="text-sm text-blue-800">
                                    <strong>Lưu ý:</strong> Sản phẩm này có thể được tùy chỉnh theo yêu cầu
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Custom Request Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <Label htmlFor="title" className="text-base font-semibold">
                            Tiêu đề yêu cầu <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="title"
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            placeholder="Ví dụ: Đặt làm bình gốm màu xanh dương"
                            className="mt-2"
                            disabled={submitting}
                        />
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <Label htmlFor="description" className="text-base font-semibold">
                            Mô tả chi tiết <span className="text-red-500">*</span>
                        </Label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Mô tả chi tiết về sản phẩm bạn muốn đặt làm..."
                            rows={5}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                            disabled={submitting}
                        />
                        {errors.description && (
                            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                        )}
                    </div>

                    {/* Expected Price (Đã bỏ Grid và Deadline) */}
                    <div>
                        <Label htmlFor="expected_price">Giá mong muốn (₫)</Label>
                        <Input
                            id="expected_price"
                            type="number"
                            value={formData.expected_price}
                            onChange={(e) => handleInputChange('expected_price', e.target.value)}
                            placeholder="Ví dụ: 500000"
                            className="mt-2"
                            disabled={submitting}
                            min="0"
                        />
                    </div>

                    {/* Reference Images */}
                    <div>
                        <Label htmlFor="reference_images">Hình ảnh tham khảo</Label>
                        <Input
                            id="reference_images"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="mt-2"
                            disabled={submitting}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Có thể tải lên nhiều hình ảnh (chỉ xem trước, chưa lưu vào server)
                        </p>
                        {imagePreviews.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative group">
                                        <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100">
                                            <Image src={preview} alt={`Preview ${index + 1}`} fill className="object-cover" />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            disabled={submitting}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4 pt-4">
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 bg-[#0f172a] text-white hover:bg-gray-800"
                        >
                            {submitting ? (
                                <span className="flex items-center gap-2">
                                  <svg
                                      className="animate-spin h-5 w-5"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                  >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                  </svg>
                                  Đang gửi...
                                </span>
                            ) : (
                                'Gửi yêu cầu'
                            )}
                        </Button>
                        <Link href={`/shop/id/${productId}`}>
                            <Button type="button" variant="outline" disabled={submitting}>
                                Hủy
                            </Button>
                        </Link>
                    </div>
                </form>
            </main>

            <Footer />
        </div>
    );
}