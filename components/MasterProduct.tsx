// --- components/MasterProduct.tsx ---
import { Product } from '../types';

interface Props {
  products: Product[];
  onAdd: () => void;
  onUpdate: (id: string) => void; // 新增：編輯功能
  onDelete: (id: string) => void;
}

export default function MasterProduct({ products, onAdd, onUpdate, onDelete }: Props) {
  return (
    <section className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm text-black">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">常用商品清單</h2>
        <button onClick={onAdd} className="text-blue-600 font-bold text-xs hover:underline">+ 新增商品售價</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {products.map(p => (
          <div key={p.id} className="flex items-center bg-slate-50 px-3 py-2 rounded-2xl border border-slate-100 group hover:border-blue-300 transition-all">
            <span className="text-sm font-bold text-slate-700">
              {p.name} <span className="..."> ${p.default_price} </span>
            </span>
            <div className="flex items-center ml-2 gap-1 opacity-0 group-hover:opacity-100 transition-all">
              {/* 編輯按鈕 */}
              <button onClick={() => onUpdate(p.id)} className="text-slate-400 hover:text-blue-500 text-xs">✏️</button>
              {/* 刪除按鈕 */}
              <button onClick={() => onDelete(p.id)} className="text-slate-300 hover:text-red-500 font-bold">✕</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}