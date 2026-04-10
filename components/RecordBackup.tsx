// --- components/RecordBackup.tsx ---
import { useRef } from 'react';

interface Props {
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function RecordBackup({ onExport, onImport }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-white p-4 rounded-3xl border border-slate-200 flex flex-wrap gap-4 items-center justify-between">
      <div>
        <h3 className="text-sm font-black text-slate-700">💾 資料備份管理</h3>
        <p className="text-[10px] text-slate-400 font-bold">
          定期匯出檔案以備份紀錄，或從舊備份還原資料。
        </p>
      </div>
      <div className="flex gap-2">
        <button 
          onClick={onExport} 
          className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-xs font-black hover:bg-slate-200 transition-all"
        >
          匯出檔案 (.json)
        </button>
        <button 
          onClick={() => fileInputRef.current?.click()} 
          className="bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-black transition-all"
        >
          匯入備份檔案
        </button>
        {/* 隱藏的檔案上傳輸入框 */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={onImport} 
          accept=".json" 
          className="hidden" 
        />
      </div>
    </div>
  );
}