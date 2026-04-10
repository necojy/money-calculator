import { useRef } from 'react';

interface Props {
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function RecordBackup({ onExport, onImport }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="bg-white p-4 rounded-3xl border border-slate-200 flex flex-wrap gap-4 items-center justify-between">
      <div className="text-xs font-bold text-slate-500">💾 資料備份管理</div>
      <div className="flex gap-2">
        <button onClick={onExport} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-xs font-black">匯出檔案</button>
        <button onClick={() => fileInputRef.current?.click()} className="bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-black">匯入檔案</button>
        <input type="file" ref={fileInputRef} onChange={onImport} accept=".json" className="hidden" />
      </div>
    </div>
  );
}