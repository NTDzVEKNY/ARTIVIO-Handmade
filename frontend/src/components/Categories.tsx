import Link from "next/link";

const categories = [
  { name: "Trang trí", icon: "🎨" },
  { name: "Đồ dùng", icon: "🧺" },
  { name: "Quà tặng", icon: "🎁" },
  { name: "Phụ kiện", icon: "✨" },
];

export default function Categories() {
  return (
    <section className="mt-16 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Danh mục nổi bật</h2>
        <div className="h-1 w-16 bg-gradient-to-r from-orange-400 to-yellow-300 rounded-full mt-2"></div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {categories.map((item, idx) => (
          <Link 
            key={item.name} 
            href="#" 
            className="group relative block"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-200/20 to-yellow-200/20 rounded-2xl transform group-hover:scale-105 transition-transform duration-300 -z-10"></div>
            
            <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2">
              {/* Icon background */}
              <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full mb-4 flex items-center justify-center text-4xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                {item.icon}
              </div>

              {/* Category name */}
              <h3 className="text-lg font-semibold text-gray-800 group-hover:text-orange-600 transition-colors duration-300">
                {item.name}
              </h3>

              {/* Hover effect - underline */}
              <div className="h-0.5 w-0 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full mt-3 group-hover:w-12 transition-all duration-300"></div>

              {/* Arrow indicator */}
              <div className="mt-3 text-gray-400 group-hover:text-orange-500 transition-colors duration-300 transform group-hover:translate-x-1 transition-transform duration-300">
                →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}