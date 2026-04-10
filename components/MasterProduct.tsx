// --- components/MasterProduct.tsx ---
import { Product } from '../types';

interface Props {
  products: Product[];
  onAdd: () => void;
  onDelete: (id: string) => void;
}

export default function MasterProduct({ products, onAdd, onDelete }: Props) {
  return (
    <section className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">
          常用商品清單
        </h2>
        <button 
          onClick={onAdd} 
          className="text-blue-600 font-bold text-xs hover:underline"
        >
          + 新增商品售價
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {products.map(p => (
          <div 
            key={p.id} 
            className="flex items-center bg-slate-50 px-3 py-2 rounded-2xl border border-slate-100 group hover:border-blue-300 transition-all"
          >
            <span className="text-sm font-bold text-slate-700">
              {p.name} <span className="text-blue-500 font-black ml-1">${p.defaultPrice}</span>
            </span>
            <button 
              onClick={() => onDelete(p.id)} 
              className="ml-2 text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all font-bold"
            >
              ✕
            </button>
          </div>
        ))}
        {products.length === 0 && (
          <p className="text-slate-300 text-xs italic">尚未設定任何常用商品</p>
        )}
      </div>
    </section>
  );
}