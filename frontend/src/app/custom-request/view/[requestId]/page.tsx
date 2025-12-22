'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { Button } from '@/components/ui/button';
import { getCustomRequestById } from '@/services/customRequestApi';
import { getProductById } from '@/services/api';
import type { CustomRequest, Product } from '@/types';

export default function CustomRequestViewPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = Array.isArray(params.requestId)
    ? Number(params.requestId[0])
    : Number(params.requestId);

  const [customRequest, setCustomRequest] = useState<CustomRequest | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!requestId || Number.isNaN(requestId)) {
      toast.error('ID yêu cầu không hợp lệ');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const requestData = await getCustomRequestById(requestId);
        if (!requestData) {
          toast.error('Không tìm thấy yêu cầu');
          setLoading(false);
          return;
        }

        setCustomRequest(requestData);

        // Fetch product
        const productData = await getProductById(String(requestData.product_id));
        setProduct(productData);
      } catch (error) {
        toast.error('Có lỗi xảy ra khi tải dữ liệu');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [requestId]);

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

  if (!customRequest) {
    return (
      <div className="min-h-screen font-sans text-gray-800 bg-white">
        <Header />
        <main className="container mx-auto px-6 py-12">
          <div className="text-center py-24">
            <h2 className="text-2xl font-semibold mb-4">Không tìm thấy yêu cầu</h2>
            <Link href="/shop/products" className="text-[#0f172a] hover:underline">
              ← Quay lại cửa hàng
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const statusLabels: Record<CustomRequest['status'], string> = {
    PENDING: 'Đang chờ',
    IN_PROGRESS: 'Đang thực hiện',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
  };

  const statusColors: Record<CustomRequest['status'], string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen font-sans text-gray-800 bg-white">
      <Header />

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Link
            href={`/chat/${customRequest.chat_id}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#0f172a]"
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
            Quay lại cuộc trò chuyện
          </Link>
          <div className={`px-4 py-2 rounded-full text-sm font-semibold ${statusColors[customRequest.status]}`}>
            {statusLabels[customRequest.status]}
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-8">Chi tiết yêu cầu tùy chỉnh</h1>

        {/* Product Information */}
        {product && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Sản phẩm tham khảo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={product.image || '/hero-handmade.jpg'}
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
              </div>
            </div>
          </div>
        )}

        {/* Request Details */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Thông tin yêu cầu</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Tiêu đề</h3>
                <p className="text-gray-900">{customRequest.title}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Mô tả</h3>
                <p className="text-gray-900 whitespace-pre-wrap">{customRequest.description}</p>
              </div>
            </div>
          </div>

          {/* Custom Options */}
          {(customRequest.custom_options.color ||
            customRequest.custom_options.size ||
            customRequest.custom_options.material) && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Tùy chọn tùy chỉnh</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {customRequest.custom_options.color && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">Màu sắc</h3>
                    <p className="text-gray-900">{customRequest.custom_options.color}</p>
                  </div>
                )}
                {customRequest.custom_options.size && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">Kích thước</h3>
                    <p className="text-gray-900">{customRequest.custom_options.size}</p>
                  </div>
                )}
                {customRequest.custom_options.material && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">Chất liệu</h3>
                    <p className="text-gray-900">{customRequest.custom_options.material}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Thông tin bổ sung</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customRequest.expected_price && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Giá mong muốn</h3>
                  <p className="text-gray-900">
                    ₫{customRequest.expected_price.toLocaleString('vi-VN')}
                  </p>
                </div>
              )}
              {customRequest.deadline && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Ngày hoàn thành mong muốn</h3>
                  <p className="text-gray-900">
                    {new Date(customRequest.deadline).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              )}
            </div>
            {customRequest.note && (
              <div className="mt-4">
                <h3 className="font-semibold text-gray-700 mb-1">Ghi chú</h3>
                <p className="text-gray-900 whitespace-pre-wrap">{customRequest.note}</p>
              </div>
            )}
          </div>

          {/* Reference Images */}
          {customRequest.reference_images.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Hình ảnh tham khảo</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {customRequest.reference_images.map((image, index) => (
                  <div key={index} className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100">
                    <Image src={image} alt={`Reference ${index + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Link href={`/chat/${customRequest.chat_id}`} className="flex-1">
              <Button className="w-full bg-[#0f172a] text-white hover:bg-gray-800">
                Mở cuộc trò chuyện
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

