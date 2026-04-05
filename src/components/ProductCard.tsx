import { Product } from "@/data/products";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 bg-gray-50 flex items-center justify-center text-6xl">
        {product.image}
      </div>
      <div className="p-5">
        <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
          {product.category}
        </p>
        <h3 className="font-semibold text-gray-900 mb-2 leading-snug">
          {product.name}
        </h3>
        <p className="text-lg font-bold text-gray-900">
          ${product.price.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
