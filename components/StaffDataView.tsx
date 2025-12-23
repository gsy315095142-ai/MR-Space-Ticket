import React from 'react';

const StaffDataView: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-slate-50 p-4 space-y-4 animate-in fade-in overflow-y-auto no-scrollbar">
        <div className="bg-white p-4 rounded-xl shadow-sm grid grid-cols-2 gap-4 border border-gray-100">
        <div className="text-center"><div className="text-2xl font-bold text-purple-600">88%</div><div className="text-[10px] text-gray-400 font-bold">场次占有率</div></div>
        <div className="text-center"><div className="text-2xl font-bold text-blue-600">¥12.4k</div><div className="text-[10px] text-gray-400 font-bold">今日总营收</div></div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h4 className="font-bold text-sm mb-4">客流实时趋势</h4>
        <div className="h-32 w-full bg-gray-50 rounded flex items-end justify-around p-2 gap-1">
            {[40,60,80,30,90,70,50].map((h, i) => <div key={i} style={{height: `${h}%`}} className="w-full bg-purple-200 rounded-t hover:bg-purple-500 transition-all"></div>)}
        </div>
        </div>
        
        {/* Additional dummy data to demonstrate scrolling capability */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h4 className="font-bold text-sm mb-2">热门商品排行</h4>
            <div className="space-y-2">
                {['魔法徽章', '发光法杖', '学院斗篷'].map((item, i) => (
                    <div key={i} className="flex justify-between text-xs">
                        <span className="text-gray-600">{i+1}. {item}</span>
                        <span className="font-bold text-gray-800">{100 - i*20} 售出</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default StaffDataView;