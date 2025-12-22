import React, { useState, useEffect } from 'react';
import { Clock, ArrowRightLeft, AlertCircle } from 'lucide-react';
import { GlobalBooking } from '../types';

interface StaffControlViewProps {
  onShowToast: (message: string) => void;
}

const StaffControlView: React.FC<StaffControlViewProps> = ({ onShowToast }) => {
  const [globalBookings, setGlobalBookings] = useState<GlobalBooking[]>([]);
  const [showTransferConfirmModal, setShowTransferConfirmModal] = useState(false);
  const [sessionToTransfer, setSessionToTransfer] = useState<GlobalBooking | null>(null);

  const loadData = () => {
    const storedGlobal = localStorage.getItem('vr_global_bookings');
    if (storedGlobal) {
        setGlobalBookings(JSON.parse(storedGlobal));
    } else {
        setGlobalBookings([]);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage_update', loadData);
    return () => window.removeEventListener('storage_update', loadData);
  }, []);

  const executeTransfer = (booking: GlobalBooking) => {
    // Update local global bookings status
    const updatedBookings = globalBookings.map(b => 
        b.id === booking.id 
        ? { ...b, status: 'TRANSFERRED' as const } 
        : b
    );
    setGlobalBookings(updatedBookings);
    localStorage.setItem('vr_global_bookings', JSON.stringify(updatedBookings));

    // Update user session status as well (if on same device/simulated)
    const storedSessions = localStorage.getItem('vr_user_sessions');
    if (storedSessions) {
        const sessions = JSON.parse(storedSessions);
        // Force update status to checked in if transferred manually
        const updatedSessions = sessions.map((s: any) => s.id === booking.id ? { ...s, status: 'CHECKED_IN' } : s); 
        localStorage.setItem('vr_user_sessions', JSON.stringify(updatedSessions));
    }

    // Add to backstage data
    const storedBackstage = localStorage.getItem('vr_backstage_data');
    const currentBackstage = storedBackstage ? JSON.parse(storedBackstage) : [];
    
    const newItem = {
        id: booking.id, // KEEP ORIGINAL ID to allow syncing status back to UserSession
        timeStr: booking.time,
        location: booking.store,
        peopleCount: booking.guests,
        status: 'UPCOMING',
        userName: booking.userName
    };
    
    localStorage.setItem('vr_backstage_data', JSON.stringify([...currentBackstage, newItem]));
    window.dispatchEvent(new Event('storage_update'));
    window.dispatchEvent(new Event('session_transferred_to_backstage'));
    
    setShowTransferConfirmModal(false);
    setSessionToTransfer(null);
    onShowToast(`场次 [${booking.time}] 已转入后厅系统`);
  };

  const handleTransferToBackstage = (booking: GlobalBooking) => {
    if (booking.status === 'CHECKED_IN') {
        executeTransfer(booking);
    } else {
        setSessionToTransfer(booking);
        setShowTransferConfirmModal(true);
    }
  };

  return (
    <>
        <div className="flex flex-col h-full bg-slate-50 p-4 overflow-y-auto space-y-3 no-scrollbar animate-in fade-in">
            <div className="px-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">待转场场次</div>
            
            {globalBookings.filter(b => b.status !== 'TRANSFERRED').length === 0 && (
                <div className="text-center py-10 opacity-30">
                    <Clock size={32} className="mx-auto mb-2" />
                    <div className="text-xs font-bold">暂无待处理场次</div>
                </div>
            )}

            {globalBookings.filter(b => b.status !== 'TRANSFERRED').map(session => (
            <div key={session.id} className="bg-white p-3 rounded-lg border flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded flex items-center justify-center font-bold text-[10px] text-white ${session.status === 'CHECKED_IN' ? 'bg-emerald-500' : 'bg-blue-500'}`}>
                    {session.status === 'CHECKED_IN' ? '已签' : '预约'}
                </div>
                <div>
                    <div className="text-xs font-bold text-gray-700">{session.time} 场</div>
                    <div className="text-[10px] text-gray-400">
                        {session.dateStr} · {session.checkInCount}/{session.guests}人
                    </div>
                </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                    onClick={() => handleTransferToBackstage(session)}
                    className="text-[10px] px-3 py-1.5 rounded font-bold flex items-center gap-1 active:scale-95 transition-all bg-purple-100 text-purple-700"
                    >
                    <ArrowRightLeft size={12}/> 转入后厅
                    </button>
                </div>
            </div>
            ))}
        </div>

        {showTransferConfirmModal && sessionToTransfer && (
            <div className="absolute inset-0 z-[250] flex items-center justify-center p-6 animate-in fade-in">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowTransferConfirmModal(false)}></div>
            <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 relative z-10">
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 mb-4 border-4 border-orange-100">
                        <AlertCircle size={32} />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 mb-2 px-4">
                        当前场次尚未签到，是否确认转入后厅？
                    </h3>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => { setShowTransferConfirmModal(false); setSessionToTransfer(null); }}
                        className="flex-1 py-3.5 rounded-xl bg-slate-100 font-bold text-slate-600 text-sm hover:bg-slate-200 transition-colors"
                    >
                        取消
                    </button>
                    <button 
                        onClick={() => executeTransfer(sessionToTransfer)}
                        className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold text-white text-sm shadow-lg shadow-purple-200 active:scale-95 transition-all"
                    >
                        确定
                    </button>
                </div>
            </div>
            </div>
        )}
    </>
  );
};

export default StaffControlView;