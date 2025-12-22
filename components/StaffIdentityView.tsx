import React from 'react';
import { ChevronRight } from 'lucide-react';

const StaffIdentityView: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 text-center animate-in fade-in">
        <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 border-4 border-white shadow-lg flex items-center justify-center text-4xl">👩‍💼</div>
        <h2 className="text-xl font-bold text-gray-800">店长 · 李晓明</h2>
        <p className="text-xs text-gray-400 mt-1">ID: STAFF_88291</p>
        <div className="mt-8 space-y-3 text-left">
            <button className="w-full bg-white p-4 rounded-xl flex items-center justify-between font-bold text-sm border border-gray-100 shadow-sm">
                <span>系统设置</span>
                <ChevronRight size={16} className="text-gray-300"/>
            </button>
            <button className="w-full bg-white p-4 rounded-xl flex items-center justify-between font-bold text-sm border border-gray-100 shadow-sm">
                <span>权限管理</span>
                <ChevronRight size={16} className="text-gray-300"/>
            </button>
            <button className="w-full bg-red-50 text-red-600 p-4 rounded-xl font-bold mt-10 text-sm">退出工作台</button>
        </div>
    </div>
  );
};

export default StaffIdentityView;