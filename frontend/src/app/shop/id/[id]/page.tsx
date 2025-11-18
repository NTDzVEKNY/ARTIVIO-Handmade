'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";
import Header from "../../../../components/Header";
import Footer from "../../../../components/Footer";

// Mock product data - replace with API call later
const MOCK_PRODUCTS = [
  { 
    id: 1, 
    name: "Đồng hồ treo tường gỗ", 
    category: "Đồng hồ", 
    price: 450000, 
    description: "Đồng hồ treo tường làm từ gỗ tự nhiên, thiết kế cổ điển", 
    fullDescription: "Đồng hồ treo tường được chế tác từ gỗ tự nhiên cao cấp, mang phong cách cổ điển sang trọng. Mặt đồng hồ được thiết kế tinh xảo với các chi tiết chạm khắc thủ công. Phù hợp trang trí phòng khách, phòng làm việc. Sản phẩm đi kèm pin và hướng dẫn lắp đặt.",
    image: "/hero-handmade.jpg",
    images: ["/hero-handmade.jpg"],
    stock: 25,
    rating: 4.7,
    reviews: 32
  },
  { 
    id: 2, 
    name: "Hoa hồng vĩnh cửu", 
    category: "Hoa vĩnh cửu", 
    price: 280000, 
    description: "Hoa hồng vĩnh cửu được bảo quản đặc biệt, giữ được vẻ đẹp lâu dài", 
    fullDescription: "Hoa hồng vĩnh cửu được bảo quản bằng công nghệ đặc biệt, giữ nguyên vẻ đẹp tự nhiên trong nhiều năm. Mỗi bông hoa được chọn lọc kỹ càng, màu sắc tươi tắn và bền đẹp. Phù hợp làm quà tặng hoặc trang trí nội thất. Sản phẩm được đóng gói cẩn thận trong hộp sang trọng.",
    image: "/hero-handmade.jpg",
    images: ["/hero-handmade.jpg"],
    stock: 40,
    rating: 4.8,
    reviews: 28
  },
  { 
    id: 3, 
    name: "Bộ quà tặng handmade", 
    category: "Quà tặng", 
    price: 350000, 
    description: "Bộ quà tặng handmade đầy đủ, phù hợp cho mọi dịp", 
    fullDescription: "Bộ quà tặng handmade bao gồm nhiều sản phẩm được làm thủ công tinh xảo. Phù hợp cho các dịp sinh nhật, kỷ niệm, hoặc bày tỏ lòng biết ơn. Mỗi sản phẩm trong bộ đều được chọn lọc kỹ càng, đảm bảo chất lượng và tính thẩm mỹ cao. Đóng gói trong hộp quà sang trọng.",
    image: "/hero-handmade.jpg",
    images: ["/hero-handmade.jpg"],
    stock: 30,
    rating: 4.9,
    reviews: 45
  },
  { 
    id: 4, 
    name: "Thiệp chúc mừng sinh nhật", 
    category: "Thiệp handmade", 
    price: 50000, 
    description: "Thiệp chúc mừng sinh nhật được làm thủ công, độc đáo", 
    fullDescription: "Thiệp chúc mừng sinh nhật được làm hoàn toàn thủ công với các chi tiết trang trí tinh xảo. Mỗi thiệp đều độc đáo và mang thông điệp ý nghĩa. Phù hợp để gửi tặng người thân, bạn bè trong các dịp đặc biệt. Có thể tùy chỉnh nội dung theo yêu cầu.",
    image: "/hero-handmade.jpg",
    images: ["/hero-handmade.jpg"],
    stock: 100,
    rating: 4.6,
    reviews: 22
  },
  { 
    id: 5, 
    name: "Bộ phụ kiện trang trí", 
    category: "Phụ kiện & nguyên liệu", 
    price: 120000, 
    description: "Bộ phụ kiện trang trí đa dạng, chất lượng cao", 
    fullDescription: "Bộ phụ kiện trang trí bao gồm nhiều loại nguyên liệu và phụ kiện đa dạng. Phù hợp cho các dự án handmade, DIY, hoặc trang trí nội thất. Tất cả sản phẩm đều được chọn lọc kỹ càng, đảm bảo chất lượng và an toàn khi sử dụng. Đóng gói tiện lợi, dễ bảo quản.",
    image: "/hero-handmade.jpg",
    images: ["/hero-handmade.jpg"],
    stock: 80,
    rating: 4.5,
    reviews: 18
  },
  { 
    id: 6, 
    name: "Vải decor hoa văn", 
    category: "Vải decor", 
    price: 180000, 
    description: "Vải decor với hoa văn độc đáo, phù hợp trang trí nội thất", 
    fullDescription: "Vải decor với các hoa văn độc đáo, được thiết kế riêng biệt. Chất liệu vải cao cấp, mềm mại và bền đẹp. Phù hợp để may rèm cửa, bọc ghế, hoặc các dự án trang trí nội thất khác. Nhiều màu sắc và hoa văn để lựa chọn.",
    image: "/hero-handmade.jpg",
    images: ["/hero-handmade.jpg"],
    stock: 60,
    rating: 4.7,
    reviews: 35
  },
  { 
    id: 7, 
    name: "Ví da passport", 
    category: "Ví & passport", 
    price: 320000, 
    description: "Ví da passport thủ công, thiết kế sang trọng", 
    fullDescription: "Ví da passport được làm từ da bò thật, chế tác hoàn toàn thủ công bởi nghệ nhân giàu kinh nghiệm. Thiết kế sang trọng, có nhiều ngăn đựng passport, thẻ, tiền. Bền đẹp theo thời gian, phù hợp cho cả nam và nữ. Có thể khắc tên hoặc logo theo yêu cầu.",
    image: "/hero-handmade.jpg",
    images: ["/hero-handmade.jpg"],
    stock: 20,
    rating: 5.0,
    reviews: 48
  },
  { 
    id: 8, 
    name: "Bộ sưu tập Limited Edition", 
    category: "Limited", 
    price: 850000, 
    description: "Bộ sưu tập giới hạn, độc quyền và đặc biệt", 
    fullDescription: "Bộ sưu tập Limited Edition với số lượng giới hạn, được thiết kế độc quyền và đặc biệt. Mỗi sản phẩm trong bộ đều được chế tác tinh xảo, mang tính nghệ thuật cao. Phù hợp cho những người yêu thích sự độc đáo và sang trọng. Đi kèm giấy chứng nhận và hộp đựng cao cấp.",
    image: "/hero-handmade.jpg",
    images: ["/hero-handmade.jpg"],
    stock: 10,
    rating: 5.0,
    reviews: 15
  },
  { 
    id: 9, 
    name: "Đồng hồ để bàn vintage", 
    category: "Đồng hồ", 
    price: 380000, 
    description: "Đồng hồ để bàn phong cách vintage, sang trọng", 
    fullDescription: "Đồng hồ để bàn mang phong cách vintage cổ điển, được chế tác từ các vật liệu cao cấp. Thiết kế tinh xảo với các chi tiết mạ vàng, tạo nên vẻ đẹp sang trọng và quý phái. Phù hợp đặt trên bàn làm việc, kệ sách, hoặc phòng khách. Sản phẩm đi kèm pin và hướng dẫn sử dụng.",
    image: "/hero-handmade.jpg",
    images: ["/hero-handmade.jpg"],
    stock: 18,
    rating: 4.8,
    reviews: 26
  },
  { 
    id: 10, 
    name: "Hoa cẩm chướng vĩnh cửu", 
    category: "Hoa vĩnh cửu", 
    price: 250000, 
    description: "Hoa cẩm chướng vĩnh cửu nhiều màu sắc", 
    fullDescription: "Hoa cẩm chướng vĩnh cửu với nhiều màu sắc đa dạng, được bảo quản bằng công nghệ đặc biệt. Giữ nguyên vẻ đẹp tự nhiên và màu sắc tươi tắn trong nhiều năm. Phù hợp để trang trí hoặc làm quà tặng. Mỗi bông hoa được đóng gói cẩn thận trong hộp riêng.",
    image: "/hero-handmade.jpg",
    images: ["/hero-handmade.jpg"],
    stock: 35,
    rating: 4.7,
    reviews: 21
  },
  { 
    id: 11, 
    name: "Thiệp cảm ơn handmade", 
    category: "Thiệp handmade", 
    price: 40000, 
    description: "Thiệp cảm ơn được làm thủ công tinh xảo", 
    fullDescription: "Thiệp cảm ơn được làm hoàn toàn thủ công với các chi tiết trang trí tinh xảo. Mỗi thiệp đều độc đáo và mang thông điệp chân thành. Phù hợp để gửi tặng sau các dịp đặc biệt, bày tỏ lòng biết ơn. Có thể tùy chỉnh nội dung và thiết kế theo yêu cầu.",
    image: "/hero-handmade.jpg",
    images: ["/hero-handmade.jpg"],
    stock: 90,
    rating: 4.6,
    reviews: 19
  },
  { 
    id: 12, 
    name: "Ví da mini cao cấp", 
    category: "Ví & passport", 
    price: 290000, 
    description: "Ví da mini cao cấp, thiết kế gọn nhẹ", 
    fullDescription: "Ví da mini được làm từ da bò thật cao cấp, thiết kế gọn nhẹ và tiện lợi. Có nhiều ngăn đựng thẻ, tiền, và các vật dụng nhỏ. Chế tác hoàn toàn thủ công với từng đường khâu tỉ mỉ. Phù hợp cho cả nam và nữ, có thể khắc tên hoặc logo theo yêu cầu.",
    image: "/hero-handmade.jpg",
    images: ["/hero-handmade.jpg"],
    stock: 25,
    rating: 4.9,
    reviews: 38
  },
];

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = parseInt(params.id as string);
  const product = MOCK_PRODUCTS.find(p => p.id === productId);
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="min-h-screen font-sans text-gray-800 bg-white">
        <Header />
        <main className="container mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Sản phẩm không tồn tại</h1>
            <Link href="/shop/products" className="text-[#0f172a] hover:underline">
              ← Quay lại cửa hàng
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    // TODO: Implement add to cart functionality
    alert(`Đã thêm ${quantity} ${product.name} vào giỏ hàng!`);
  };

  const currentImage = product.images?.[selectedImageIndex] || product.image;

  return (
    <div className="min-h-screen font-sans text-gray-800 bg-white">
      <Header />
      <main className="container mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-[#0f172a]">Trang chủ</Link>
          <span className="mx-2">/</span>
          <Link href="/shop/products" className="hover:text-[#0f172a]">Cửa hàng</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Product Images */}
          <div>
            <div className="relative w-full h-96 md:h-[500px] bg-gray-100 rounded-lg overflow-hidden mb-4">
              <Image
                src={currentImage}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                      selectedImageIndex === index 
                        ? 'border-[#0f172a]' 
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="text-sm text-gray-500 mb-2">{product.category}</div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
            
            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">
                    {i < Math.floor(product.rating) ? '★' : '☆'}
                  </span>
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating} ({product.reviews} đánh giá)
              </span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="text-3xl font-bold text-[#0f172a]">
                ₫{product.price.toLocaleString("vi-VN")}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Mô tả sản phẩm</h2>
              <p className="text-gray-600 leading-relaxed">{product.fullDescription}</p>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <div className="text-sm text-green-600 font-medium">
                  ✓ Còn hàng ({product.stock} sản phẩm)
                </div>
              ) : (
                <div className="text-sm text-red-600 font-medium">
                  ✗ Hết hàng
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Số lượng</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                  className="w-20 h-10 border border-gray-300 rounded-lg text-center font-medium"
                  min="1"
                  max={product.stock}
                />
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-[#0f172a] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#1e293b] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Thêm vào giỏ hàng
              </button>
              <button
                className="px-6 py-3 border-2 border-[#0f172a] text-[#0f172a] rounded-lg font-medium hover:bg-[#0f172a] hover:text-white transition-colors"
              >
                Yêu cầu làm riêng
              </button>
            </div>

            {/* Additional Info */}
            <div className="border-t pt-6 space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <span className="font-medium">Danh mục:</span>
                <Link href={`/shop/products?category=${encodeURIComponent(product.category)}`} className="text-[#0f172a] hover:underline">
                  {product.category}
                </Link>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">Mã sản phẩm:</span>
                <span>SP-{product.id.toString().padStart(4, '0')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="border-t pt-12">
          <h2 className="text-2xl font-bold mb-6">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {MOCK_PRODUCTS
              .filter(p => p.category === product.category && p.id !== product.id)
              .slice(0, 4)
              .map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/shop/id/${relatedProduct.id}`}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 group"
                >
                  <div className="relative w-full h-48 bg-gray-100">
                    <Image
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium mb-1 line-clamp-2 group-hover:text-[#0f172a] transition-colors">
                      {relatedProduct.name}
                    </h3>
                    <div className="text-sm font-semibold text-[#0f172a] mt-2">
                      ₫{relatedProduct.price.toLocaleString("vi-VN")}
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

