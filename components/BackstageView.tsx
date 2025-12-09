import React, { useState } from 'react';
import { List, Activity, User, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

const BackstageView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'BOOKINGS' | 'MONITOR'>('BOOKINGS');

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 pt-6 pb-4 shadow-md sticky top-0 z-10">
          <h2 className="text-lg font-bold text-center">
            {activeTab === 'BOOKINGS' ? '预约管理' : '现场监控中心'}
          </h2>
        </div>

        {activeTab === 'BOOKINGS' ? (
          <div className="p-4 space-y-3">
             <div className="flex justify-between items-center text-sm text-slate-500 mb-2">
                <span>今日 10月24日</span>
                <span>共 8 场待接待</span>
             </div>
             
             {/* Booking Card 1 */}
             <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500">
               <div className="flex justify-between items-start mb-3">
                 <div>
                   <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-bold">14:00 - 15:00</span>
                   <h3 className="font-bold text-slate-800 mt-2">火星救援行动 (6人)</h3>
                 </div>
                 <span className="text-orange-500 text-xs font-semibold bg-orange-50 px-2 py-1 rounded-full">待核销</span>
               </div>
               <div className="flex items-center gap-2 text-slate-500 text-xs border-t pt-3 mt-1">
                 <User size={14} />
                 <span>预约人：张先生 (138****8888)</span>
               </div>
             </div>

             {/* Booking Card 2 */}
             <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500">
               <div className="flex justify-between items-start mb-3">
                 <div>
                   <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-bold">13:00 - 14:00</span>
                   <h3 className="font-bold text-slate-800 mt-2">侏罗纪生存 (4人)</h3>
                 </div>
                 <span className="text-green-600 text-xs font-semibold bg-green-50 px-2 py-1 rounded-full">进行中</span>
               </div>
               <div className="flex items-center gap-2 text-slate-500 text-xs border-t pt-3 mt-1">
                 <User size={14} />
                 <span>预约人：李女士 (139****1234)</span>
               </div>
             </div>

             {/* Booking Card 3 */}
             <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-gray-300">
               <div className="flex justify-between items-start mb-3">
                 <div>
                   <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-bold">11:00 - 12:00</span>
                   <h3 className="font-bold text-slate-800 mt-2">深海奇遇 (2人)</h3>
                 </div>
                 <span className="text-gray-400 text-xs font-semibold bg-gray-50 px-2 py-1 rounded-full">已完成</span>
               </div>
               <div className="flex items-center gap-2 text-slate-500 text-xs border-t pt-3 mt-1">
                 <User size={14} />
                 <span>预约人：王同学 (150****9999)</span>
               </div>
             </div>

          </div>
        ) : (
          <div className="p-4 space-y-4">
             {/* Status Grid */}
             <div className="grid grid-cols-2 gap-3 mb-4">
               <div className="bg-white p-3 rounded-lg shadow-sm text-center">
                 <div className="text-2xl font-bold text-green-600">6/8</div>
                 <div className="text-xs text-gray-500">设备在线</div>
               </div>
               <div className="bg-white p-3 rounded-lg shadow-sm text-center">
                 <div className="text-2xl font-bold text-blue-600">2</div>
                 <div className="text-xs text-gray-500">正在运行场次</div>
               </div>
             </div>

             {/* Monitor Item 1 */}
             <div className="bg-white rounded-xl shadow-sm overflow-hidden">
               <div className="bg-slate-100 px-4 py-2 border-b flex justify-between items-center">
                 <span className="font-bold text-sm text-slate-700">A区 - 火星基地</span>
                 <span className="text-xs text-green-600 flex items-center gap-1">
                   <Activity size={12} /> 运行良好
                 </span>
               </div>
               <div className="p-4">
                 <div className="flex items-center justify-between mb-4">
                    <div className="text-xs text-gray-500">游戏进度</div>
                    <div className="text-xs font-bold text-blue-600">85%</div>
                 </div>
                 <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                   <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                 </div>
                 <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className={`h-8 rounded flex items-center justify-center text-xs font-medium text-white ${i < 5 ? 'bg-green-500' : 'bg-gray-300'}`}>
                        P{i}
                      </div>
                    ))}
                 </div>
               </div>
             </div>

             {/* Monitor Item 2 */}
             <div className="bg-white rounded-xl shadow-sm overflow-hidden">
               <div className="bg-slate-100 px-4 py-2 border-b flex justify-between items-center">
                 <span className="font-bold text-sm text-slate-700">B区 - 恐龙岛</span>
                 <span className="text-xs text-orange-500 flex items-center gap-1">
                   <AlertCircle size={12} /> 准备中
                 </span>
               </div>
               <div className="p-4 flex flex-col items-center justify-center h-32 text-gray-400 text-sm">
                 <Clock size={24} className="mb-2 opacity-50" />
                 等待下一场次开始...
                 <div className="mt-2 text-xs bg-gray-100 px-2 py-1 rounded">预计 14:00 开始</div>
               </div>
             </div>
          </div>
        )}
      </div>

      {/* Tab Bar */}
      <div className="absolute bottom-0 w-full h-16 bg-white border-t border-slate-200 flex justify-around items-center px-6 pb-2">
        <button 
          onClick={() => setActiveTab('BOOKINGS')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'BOOKINGS' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <List size={24} strokeWidth={activeTab === 'BOOKINGS' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">预约列表</span>
        </button>
        <button 
          onClick={() => setActiveTab('MONITOR')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'MONITOR' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <Activity size={24} strokeWidth={activeTab === 'MONITOR' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">现场监控</span>
        </button>
      </div>
    </div>
  );
};

export default BackstageView;