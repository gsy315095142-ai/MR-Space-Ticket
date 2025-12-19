import React, { useState, useEffect } from 'react';
import { List, Activity, User, Clock, AlertCircle, Play, Square, CheckCircle2 } from 'lucide-react';

interface SessionItem {
    id: string;
    timeStr: string;
    location: string;
    peopleCount: number;
    status: 'UPCOMING' | 'RUNNING' | 'COMPLETED';
    userName?: string;
}

const BackstageView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'BOOKINGS' | 'MONITOR'>('BOOKINGS');
  const [bookings, setBookings] = useState<SessionItem[]>([]);

  const loadData = () => {
      const stored = localStorage.getItem('vr_backstage_data');
      if (stored) {
          // Ensure we handle potential old data format by defaulting status if missing
          const parsed = JSON.parse(stored).map((item: any) => ({
              ...item,
              status: item.status || 'UPCOMING'
          }));
          setBookings(parsed);
      }
  };

  useEffect(() => {
      loadData();
      window.addEventListener('storage_update', loadData);
      return () => window.removeEventListener('storage_update', loadData);
  }, []);

  const updateLocalStorage = (updatedBookings: SessionItem[]) => {
      setBookings(updatedBookings);
      localStorage.setItem('vr_backstage_data', JSON.stringify(updatedBookings));
      window.dispatchEvent(new Event('storage_update'));
  };

  // Helper to sync status changes to the User's "My Sessions" data (vr_user_sessions)
  const syncUserSessionStatus = (sessionId: string, newStatus: 'RUNNING' | 'COMPLETED') => {
      const userSessionsStr = localStorage.getItem('vr_user_sessions');
      if (userSessionsStr) {
          const userSessions = JSON.parse(userSessionsStr);
          const updatedUserSessions = userSessions.map((s: any) => 
              s.id === sessionId ? { ...s, status: newStatus } : s
          );
          localStorage.setItem('vr_user_sessions', JSON.stringify(updatedUserSessions));
          // Dispatch event to notify MiniProgramView to re-render
          window.dispatchEvent(new Event('storage_update'));
      }
  };

  const handleStartGame = (id: string) => {
      // 1. Update Backstage Data
      const updated = bookings.map(b => 
          b.id === id ? { ...b, status: 'RUNNING' as const } : b
      );
      updateLocalStorage(updated);
      
      // 2. Sync with User Sessions
      syncUserSessionStatus(id, 'RUNNING');

      // Note: We do NOT switch tabs automatically anymore, keeping the item in the list
  };

  const handleEndGame = (id: string) => {
      // 1. Update Backstage Data
      const updated = bookings.map(b => 
          b.id === id ? { ...b, status: 'COMPLETED' as const } : b
      );
      updateLocalStorage(updated);

      // 2. Sync with User Sessions
      syncUserSessionStatus(id, 'COMPLETED');
  };

  // Tab 1: Shows ALL sessions now (Upcoming, Running, Completed) so they don't disappear
  const allBookings = bookings; 
  
  // Tab 2: Shows Running and Completed sessions (Active monitoring + History)
  const monitorSessions = bookings.filter(b => b.status === 'RUNNING' || b.status === 'COMPLETED');

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
                <span>接待列表</span>
                <span>共 {allBookings.length} 场</span>
             </div>
             
             {allBookings.length === 0 ? (
                 <div className="text-center py-10 text-gray-400 text-sm">暂无接待场次</div>
             ) : (
                allBookings.map((booking) => {
                    const timeOnly = booking.timeStr.split(' ')[1] || booking.timeStr;
                    const isUpcoming = booking.status === 'UPCOMING';
                    const isRunning = booking.status === 'RUNNING';
                    const isCompleted = booking.status === 'COMPLETED';

                    return (
                        <div key={booking.id} className={`bg-white p-4 rounded-xl shadow-sm border-l-4 animate-in slide-in-from-bottom-2 ${isUpcoming ? 'border-blue-500' : isRunning ? 'border-green-500' : 'border-gray-300 opacity-80'}`}>
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <span className={`text-xs px-2 py-1 rounded font-bold ${isUpcoming ? 'bg-blue-100 text-blue-700' : isRunning ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {timeOnly}
                                    </span>
                                    <h3 className="font-bold text-slate-800 mt-2">VR沉浸体验 ({booking.peopleCount}人)</h3>
                                </div>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isUpcoming ? 'text-orange-500 bg-orange-50' : isRunning ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-100'}`}>
                                    {isUpcoming ? '待接待' : isRunning ? '已启动' : '已结束'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 text-xs border-t pt-3 mt-1 mb-3">
                                <User size={14} />
                                <span>预约人：{booking.userName || '体验用户'}</span>
                            </div>
                            
                            {/* Action Button */}
                            {isUpcoming ? (
                                <button 
                                    onClick={() => handleStartGame(booking.id)}
                                    className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold text-sm shadow-sm hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <Play size={16} fill="currentColor" />
                                    启动游戏
                                </button>
                            ) : (
                                <button 
                                    disabled
                                    className={`w-full py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed ${isRunning ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-gray-100 text-gray-400'}`}
                                >
                                    {isRunning ? <Activity size={16} /> : <CheckCircle2 size={16} />}
                                    {isRunning ? '游戏运行中...' : '场次已结束'}
                                </button>
                            )}
                        </div>
                    );
                })
             )}
          </div>
        ) : (
          <div className="p-4 space-y-4">
             {/* Status Grid */}
             <div className="grid grid-cols-2 gap-3 mb-4">
               <div className="bg-white p-3 rounded-lg shadow-sm text-center">
                 <div className="text-2xl font-bold text-green-600">{bookings.filter(b => b.status === 'RUNNING').length}</div>
                 <div className="text-xs text-gray-500">正在运行</div>
               </div>
               <div className="bg-white p-3 rounded-lg shadow-sm text-center">
                 <div className="text-2xl font-bold text-blue-600">{bookings.length}</div>
                 <div className="text-xs text-gray-500">今日总场次</div>
               </div>
             </div>

             {/* Running/Completed Sessions List */}
             {monitorSessions.length === 0 ? (
                 <div className="text-center py-10 text-gray-400 text-sm flex flex-col items-center">
                     <Activity size={48} className="opacity-20 mb-2" />
                     暂无监控数据
                     <p className="text-xs mt-1 text-gray-300">请在预约列表启动场次</p>
                 </div>
             ) : (
                 monitorSessions.map((session) => {
                    const isRunning = session.status === 'RUNNING';
                    return (
                    <div key={session.id} className={`bg-white rounded-xl shadow-sm overflow-hidden animate-in fade-in zoom-in-95 ${!isRunning ? 'opacity-80 grayscale-[0.5]' : ''}`}>
                        <div className={`${isRunning ? 'bg-green-50 border-green-100 text-green-800' : 'bg-gray-100 border-gray-200 text-gray-600'} px-4 py-2 border-b flex justify-between items-center`}>
                            <span className="font-bold text-sm flex items-center gap-2">
                                <Activity size={14} className={isRunning ? "animate-pulse" : ""} />
                                {isRunning ? `运行中 - ${session.timeStr.split(' ')[1]}` : `已结束 - ${session.timeStr.split(' ')[1]}`}
                            </span>
                            <span className={`text-xs font-mono ${isRunning ? 'text-green-600' : 'text-gray-500'}`}>
                                {session.userName} ({session.peopleCount}人)
                            </span>
                        </div>
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-xs text-gray-500">当前进度</div>
                                <div className={`text-xs font-bold ${isRunning ? 'text-blue-600' : 'text-gray-500'}`}>
                                    {isRunning ? '进行中' : '已完成'}
                                </div>
                            </div>
                            {/* Fake Progress Bar Animation */}
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-6 overflow-hidden">
                                <div 
                                    className={`h-2 rounded-full ${isRunning ? 'bg-blue-600 animate-[width_10s_linear_infinite]' : 'bg-gray-400'}`} 
                                    style={{ width: isRunning ? '60%' : '100%' }}
                                ></div>
                            </div>
                            
                            {isRunning ? (
                                <button 
                                    onClick={() => handleEndGame(session.id)}
                                    className="w-full bg-red-50 text-red-600 border border-red-100 py-2.5 rounded-lg font-bold text-sm hover:bg-red-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <Square size={16} fill="currentColor" />
                                    结束体验
                                </button>
                            ) : (
                                <div className="w-full bg-gray-50 text-gray-400 border border-gray-100 py-2.5 rounded-lg font-bold text-sm text-center flex items-center justify-center gap-2">
                                    <CheckCircle2 size={16} />
                                    体验已结束
                                </div>
                            )}
                        </div>
                    </div>
                    );
                 })
             )}
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