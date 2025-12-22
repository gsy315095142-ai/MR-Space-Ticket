import React, { useState, useEffect, useRef } from 'react';
import { Home, User, Ticket, Calendar, ChevronRight, MapPin, ScanLine, Gift, Clock, Star, X, Music, ArrowLeft, Users, CheckCircle, CreditCard, ChevronLeft, CalendarDays, Settings, PieChart, BarChart, QrCode, LogOut, RefreshCw, Copy, Filter, Command, PlayCircle, Share, ChevronDown, Edit, Bell, AlertCircle, Share2, ArrowRightLeft, CalendarClock, UserPlus, ShoppingBag, BookOpen, Info, ShoppingCart, PackageCheck, TrendingUp, Activity, Plus, Minus, Store, Sparkles, Wand2, Percent, Save, Image as ImageIcon, PlusCircle, Upload, Box, TicketCheck, History, Wallet, Trophy, ShieldCheck, Search, FileText, Phone, CheckSquare, Square, Ticket as TicketIcon } from 'lucide-react';
import { MerchItem, UserMerchTicket, GlobalBooking } from '../types';
import StaffTicketView from './StaffTicketView';
import StaffDataView from './StaffDataView';
import StaffIdentityView from './StaffIdentityView';
import StaffControlView from './StaffControlView';
import StaffMerchView from './StaffMerchView';

interface StaffFrontStoreViewProps {
  initialAdminTab?: 'TICKETS' | 'DATA' | 'IDENTITY' | 'CONTROL' | 'MERCH';
}

const StaffFrontStoreView: React.FC<StaffFrontStoreViewProps> = ({ initialAdminTab }) => {
  // --- STATE ---
  const [adminTab, setAdminTab] = useState<'TICKETS' | 'DATA' | 'IDENTITY' | 'CONTROL' | 'MERCH'>(initialAdminTab || 'TICKETS');
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  useEffect(() => {
    if (initialAdminTab) setAdminTab(initialAdminTab);
  }, [initialAdminTab]);

  const showToast = (message: string) => {
      setToast({ show: true, message });
      setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      {/* Header */}
      <div className="bg-white px-4 py-3 shrink-0 border-b border-gray-100 shadow-sm z-10">
        {adminTab === 'TICKETS' ? (
            <div className="relative flex items-center justify-center pt-2">
            <div className="font-bold text-xl text-gray-800">票券</div>
            <div className="absolute right-0 flex items-center gap-4">
                <button className="flex flex-col items-center justify-center text-gray-600 gap-0.5">
                    <Gift size={20} strokeWidth={1.5} />
                    <span className="text-[10px]">优惠</span>
                </button>
                <button className="flex flex-col items-center justify-center text-gray-600 gap-0.5">
                    <Search size={20} strokeWidth={1.5} />
                    <span className="text-[10px]">查询</span>
                </button>
            </div>
            </div>
        ) : (
        <div className="flex justify-between items-center">
            <div className="font-bold text-lg text-gray-800">前店管理工作台</div>
            <div className="text-[10px] px-2 py-1 bg-purple-100 text-purple-700 rounded-full border border-purple-200 font-black tracking-wider uppercase">Staff Mode</div>
        </div>
        )}
      </div>

      <div className="flex-1 relative overflow-hidden">
        {adminTab === 'TICKETS' && <StaffTicketView onShowToast={showToast} />}
        {adminTab === 'CONTROL' && <StaffControlView onShowToast={showToast} />}
        {adminTab === 'IDENTITY' && <StaffIdentityView />}
        {adminTab === 'MERCH' && <StaffMerchView onShowToast={showToast} />}
        {adminTab === 'DATA' && <StaffDataView />}
      </div>

      <div className="bg-white border-t border-gray-100 flex justify-around items-center h-20 shrink-0 pb-4 z-10 px-2">
        {[
        { id: 'TICKETS', label: '票务', icon: Ticket },
        { id: 'DATA', label: '数据', icon: BarChart },
        { id: 'IDENTITY', label: '身份', icon: User },
        { id: 'CONTROL', label: '中控', icon: Settings }, 
        { id: 'MERCH', label: '商品', icon: ShoppingBag },
        ].map((tab) => (
        <button key={tab.id} onClick={() => setAdminTab(tab.id as any)} className={`flex flex-col items-center gap-1.5 w-full transition-all ${adminTab === tab.id ? 'text-purple-600 scale-105' : 'text-gray-400 opacity-60'}`}>
            <tab.icon size={22} strokeWidth={adminTab === tab.id ? 2.5 : 2} />
            <span className="text-[10px] font-bold">{tab.label}</span>
        </button>
        ))}
      </div>

      {toast.show && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white px-6 py-3 rounded-xl shadow-2xl z-[300] flex items-center gap-3 animate-in fade-in slide-in-from-top-4 backdrop-blur-md max-w-[90%]">
              <CheckCircle size={20} className="text-green-400 shrink-0" />
              <span className="text-xs font-bold text-center leading-relaxed">{toast.message}</span>
          </div>
      )}
    </div>
  );
};

export default StaffFrontStoreView;