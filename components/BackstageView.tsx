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

  // Helper to sync status changes to the User's "My Sessions" data (vr_sessions)
  const syncUserSessionStatus = (sessionId: string, newStatus: 'RUNNING' | 'COMPLETED') => {
      const userSessionsStr = localStorage.getItem('vr_sessions');
      if (userSessionsStr) {
          const userSessions = JSON.parse(userSessionsStr);
          const updatedUserSessions = userSessions.map((s: any) => 
              s.id === sessionId ? { ...s, status: newStatus } : s
          );
          localStorage.setItem('vr_sessions', JSON.stringify(updatedUserSessions));
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

      setActiveTab('MONITOR');
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

  const upcomingBookings = bookings.filter(b => b.status === 'UPCOMING');
  const runningSessions = bookings.filter(b => b.status === 'RUNNING');

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
                <span>共 {upcomingBookings.length} 场待接待</span>
             </div>
             
             {upcomingBookings.length === 0 ? (
                 <div className="text-center py-10 text-gray-400 text-sm">暂无接待场次</div>
             ) : (
                upcomingBookings.map((booking) => {
                    const timeOnly = booking.timeStr.split(' ')[1] || booking.timeStr;
                    return (
                        <div key={booking.id} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500 animate-in slide-in-from-bottom-2">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-bold">{timeOnly}</span>
                                    <h3 className="font-bold text-slate-800 mt-2">VR沉浸体验 ({booking.peopleCount}人)</h3>
                                </div>
                                <span className="text-orange-500 text-xs font-semibold bg-orange-50 px-2 py-1 rounded-full">待接待</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 text-xs border-t pt-3 mt-1 mb-3">
                                <User size={14} />
                                <span>预约人：{booking.userName || '体验用户'}</span>
                            </div>
                            
                            {/* Start Game Button */}
                            <button 
                                onClick={() => handleStartGame(booking.id)}
                                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold text-sm shadow-sm hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <Play size={16} fill="currentColor" />
                                启动游戏
                            </button>
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
                 <div className="text-2xl font-bold text-green-600">{runningSessions.length}</div>
                 <div className="text-xs text-gray-500">正在运行</div>
               </div>
               <div className="bg-white p-3 rounded-lg shadow-sm text-center">
                 <div className="text-2xl font-bold text-blue-600">{bookings.length}</div>
                 <div className="text-xs text-gray-500">今日总场次</div>
               </div>
             </div>

             {/* Running Sessions List */}
             {runningSessions.length === 0 ? (
                 <div className="text-center py-10 text-gray-400 text-sm flex flex-col items-center">
                     <Activity size={48} className="opacity-20 mb-2" />
                     暂无正在进行的游戏
                     <p className="text-xs mt-1 text-gray-300">请在预约列表启动场次</p>
                 </div>
             ) : (
                 runningSessions.map((session) => (
                    <div key={session.id} className="bg-white rounded-xl shadow-sm overflow-hidden animate-in fade-in zoom-in-95">
                        <div className="bg-green-50 px-4 py-2 border-b border-green-100 flex justify-between items-center">
                            <span className="font-bold text-sm text-green-800 flex items-center gap-2">
                                <Activity size={14} className="animate-pulse" />
                                运行中 - {session.timeStr.split(' ')[1]}
                            </span>
                            <span className="text-xs text-green-600 font-mono">
                                {session.userName} ({session.peopleCount}人)
                            </span>
                        </div>
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-xs text-gray-500">当前进度</div>
                                <div className="text-xs font-bold text-blue-600">进行中</div>
                            </div>
                            {/* Fake Progress Bar Animation */}
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-6 overflow-hidden">
                                <div className="bg-blue-600 h-2 rounded-full animate-[width_10s_linear_infinite]" style={{ width: '60%' }}></div>
                            </div>
                            
                            <button 
                                onClick={() => handleEndGame(session.id)}
                                className="w-full bg-red-50 text-red-600 border border-red-100 py-2.5 rounded-lg font-bold text-sm hover:bg-red-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <Square size={16} fill="currentColor" />
                                结束体验
                            </button>
                        </div>
                    </div>
                 ))
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