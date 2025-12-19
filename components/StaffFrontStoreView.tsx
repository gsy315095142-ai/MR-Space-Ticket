import React, { useState, useEffect, useRef } from 'react';
import { Home, User, Ticket, Calendar, ChevronRight, MapPin, ScanLine, Gift, Clock, Star, X, Music, ArrowLeft, Users, CheckCircle, CreditCard, ChevronLeft, CalendarDays, Settings, PieChart, BarChart, QrCode, LogOut, RefreshCw, Copy, Filter, Command, PlayCircle, Share, ChevronDown, Edit, Bell, AlertCircle, Share2, ArrowRightLeft, CalendarClock, UserPlus, ShoppingBag, BookOpen, Info, ShoppingCart, PackageCheck, TrendingUp, Activity, Plus, Minus, Store, Sparkles, Wand2, Percent, Save, Image as ImageIcon, PlusCircle, Upload, Box, TicketCheck, History, Wallet, Trophy, ShieldCheck, Search, FileText, Phone, CheckSquare, Square, Ticket as TicketIcon } from 'lucide-react';
import { MerchItem, UserMerchTicket, GlobalBooking } from '../types';

interface StaffFrontStoreViewProps {
  initialAdminTab?: 'TICKETS' | 'DATA' | 'IDENTITY' | 'CONTROL' | 'MERCH';
}

const DEFAULT_PRODUCTS: MerchItem[] = [
  { id: 'p1', name: 'LUMI魔法师徽章', image: 'https://images.unsplash.com/photo-1635273051937-20083c27da1d?w=400&h=400&fit=crop', points: 100, price: 29, stock: 50 },
  { id: 'p2', name: '定制版发光法杖', image: 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=600&h=800&fit=crop', points: 500, price: 128, stock: 20 },
  { id: 'p3', name: '魔法学院主题斗篷', image: 'https://images.unsplash.com/photo-1517462964-21fdcec3f25b?w=600&h=800&fit=crop', points: 800, price: 299, stock: 15 },
];

const StaffFrontStoreView: React.FC<StaffFrontStoreViewProps> = ({ initialAdminTab }) => {
  // --- STATE ---
  const [products, setProducts] = useState<MerchItem[]>(DEFAULT_PRODUCTS);
  const [userMerchTickets, setUserMerchTickets] = useState<UserMerchTicket[]>([]);
  const [offlineSales, setOfflineSales] = useState<any[]>([]);
  const [generatedTickets, setGeneratedTickets] = useState<any[]>([]);
  const [globalBookings, setGlobalBookings] = useState<GlobalBooking[]>([]);
  
  const [adminTab, setAdminTab] = useState<'TICKETS' | 'DATA' | 'IDENTITY' | 'CONTROL' | 'MERCH'>(initialAdminTab || 'TICKETS');
  const [ticketSubTab, setTicketSubTab] = useState<'GENERATE' | 'LIST'>('GENERATE');
  const [merchAdminSubTab, setMerchAdminSubTab] = useState<'MANAGE' | 'SALES' | 'STATS'>('SALES');
  const [editingProduct, setEditingProduct] = useState<MerchItem | null>(null);
  const [genTicketCount, setGenTicketCount] = useState(1);
  
  const [showTransferConfirmModal, setShowTransferConfirmModal] = useState(false);
  const [sessionToTransfer, setSessionToTransfer] = useState<GlobalBooking | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  // --- DATA SYNC ---
  const loadData = () => {
    const storedMerch = localStorage.getItem('vr_user_merch');
    if (storedMerch) setUserMerchTickets(JSON.parse(storedMerch));
    
    const storedOffline = localStorage.getItem('vr_offline_sales');
    if (storedOffline) setOfflineSales(JSON.parse(storedOffline));
    
    const storedGen = localStorage.getItem('vr_generated_tickets');
    if (storedGen) setGeneratedTickets(JSON.parse(storedGen));
    
    const storedProducts = localStorage.getItem('vr_global_products');
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      localStorage.setItem('vr_global_products', JSON.stringify(DEFAULT_PRODUCTS));
    }
    
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

  useEffect(() => {
    if (initialAdminTab) setAdminTab(initialAdminTab);
  }, [initialAdminTab]);

  const showToast = (message: string) => {
      setToast({ show: true, message });
      setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const handleGenerateAndSend = () => {
    const storedMessages = localStorage.getItem('vr_chat_messages');
    const messages = storedMessages ? JSON.parse(storedMessages) : [];
    
    // Create chat message
    const newMessage = {
        id: Date.now(),
        sender: 'STAFF', // Not 'ME'
        type: 'TICKET_LINK',
        text: `[系统] 您收到一张${genTicketCount}人票`,
        ticketData: {
            count: genTicketCount,
            name: `${genTicketCount}人VR体验票`
        },
        timestamp: new Date().toISOString()
    };

    localStorage.setItem('vr_chat_messages', JSON.stringify([...messages, newMessage]));
    
    // Create Staff Record
    const newGenTicket = {
        id: 'T' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        type: `${genTicketCount}人票`,
        code: Math.random().toString(36).substr(2, 8).toUpperCase(),
        status: 'ACTIVE'
    };
    
    const updatedGenTickets = [newGenTicket, ...generatedTickets];
    setGeneratedTickets(updatedGenTickets);
    localStorage.setItem('vr_generated_tickets', JSON.stringify(updatedGenTickets));
    
    window.dispatchEvent(new Event('storage_update'));
    window.dispatchEvent(new Event('new_chat_message')); 
    
    showToast('票券已发送给用户');
  };

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
    showToast(`场次 [${booking.time}] 已转入后厅系统`);
  };

  const handleTransferToBackstage = (booking: GlobalBooking) => {
    if (booking.status === 'CHECKED_IN') {
        executeTransfer(booking);
    } else {
        setSessionToTransfer(booking);
        setShowTransferConfirmModal(true);
    }
  };

  // --- RENDERERS ---
  const renderAdminTickets = () => (
    <div className="flex flex-col h-full bg-[#f5f7fa] animate-in fade-in font-sans">
       {/* Tabs Header */}
       <div className="bg-gradient-to-r from-indigo-50/50 via-white to-blue-50/50 shrink-0 border-b border-gray-100">
         <div className="flex items-center justify-around">
            <button 
              onClick={() => setTicketSubTab('GENERATE')} 
              className={`flex-1 py-3 text-sm font-medium relative transition-colors ${ticketSubTab === 'GENERATE' ? 'text-blue-600 font-bold' : 'text-gray-500'}`}
            >
              生成票券
              {ticketSubTab === 'GENERATE' && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full"></div>
              )}
            </button>
            <button 
              onClick={() => setTicketSubTab('LIST')} 
              className={`flex-1 py-3 text-sm font-medium relative transition-colors ${ticketSubTab === 'LIST' ? 'text-blue-600 font-bold' : 'text-gray-500'}`}
            >
              票券列表
              {ticketSubTab === 'LIST' && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full"></div>
              )}
            </button>
         </div>
       </div>

       <div className="flex-1 overflow-y-auto no-scrollbar p-3">
         {ticketSubTab === 'GENERATE' ? (
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-2">
             <h3 className="font-bold mb-4 flex items-center gap-2 text-sm text-purple-600"><Ticket size={18} /> 配置新票券</h3>
             <div className="grid grid-cols-2 gap-3 mb-6">
                {[1,2,3,4].map(n => (
                    <button 
                        key={n} 
                        onClick={() => setGenTicketCount(n)}
                        className={`border-2 p-4 rounded-xl text-center transition-all ${genTicketCount === n ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-100 hover:border-purple-300'}`}
                    >
                        <Users size={20} className={`mx-auto mb-1 ${genTicketCount === n ? 'text-purple-600' : 'text-gray-400'}`} />
                        <div className="text-xs font-bold">{n}人票</div>
                    </button>
                ))}
             </div>
             <button onClick={handleGenerateAndSend} className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-all">生成并发送</button>
           </div>
         ) : (
           <div className="space-y-3">
             {/* Filter Section */}
             <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
                {/* Date Row */}
                <div>
                  <div className="text-sm font-bold text-gray-800 mb-2">查询日期：</div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-9 bg-[#f5f7fa] rounded-lg px-3 flex items-center justify-between text-xs text-gray-400">
                      <span>请选择日期</span>
                      <Calendar size={14} className="text-blue-300" />
                    </div>
                    <span className="text-gray-800 font-bold text-sm">至</span>
                    <div className="flex-1 h-9 bg-[#f5f7fa] rounded-lg px-3 flex items-center justify-between text-xs text-gray-400">
                      <span>请选择日期</span>
                      <Calendar size={14} className="text-blue-300" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {['昨天', '今天', '上个月', '本月'].map((label) => (
                      <button 
                        key={label}
                        className={`flex-1 py-1.5 text-xs rounded-full border transition-all ${
                          label === '今天' 
                          ? 'bg-blue-400 text-white border-blue-400 shadow-md shadow-blue-100' 
                          : 'bg-white text-blue-400 border-blue-200'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hotel Row */}
                <div>
                  <div className="text-sm font-bold text-gray-800 mb-2">查询酒店：</div>
                  <div className="h-10 bg-[#f5f7fa] rounded-lg px-3 flex items-center justify-between text-xs text-gray-500 font-medium">
                    <span>全部</span>
                    <ChevronDown size={14} className="text-blue-400" />
                  </div>
                </div>
             </div>

             {/* Stats Section */}
             <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-2">
                   <div className="flex items-center gap-2">
                      <div className="w-1 h-3.5 bg-blue-600 rounded-full"></div>
                      <span className="font-bold text-gray-800 text-base">票券统计</span>
                   </div>
                   <ChevronDown size={16} className="text-gray-400" />
                </div>

                <div className="space-y-3">
                   {/* Card 1 */}
                   <div className="bg-[#e6f2ff]/50 rounded-lg p-4">
                      <div className="text-center text-sm font-bold text-gray-700 mb-3">二维码生成票券</div>
                      <div className="flex justify-between px-6 items-center">
                         <div className="text-center">
                            <div className="text-[10px] text-gray-400 mb-1">数量:</div>
                            <div className="text-xl font-black text-[#2B7FF2] font-sans tracking-tight">5973 <span className="text-[10px] text-gray-400 font-normal ml-0.5">张</span></div>
                         </div>
                         <div className="text-center">
                            <div className="text-[10px] text-gray-400 mb-1">人数:</div>
                            <div className="text-xl font-black text-[#2B7FF2] font-sans tracking-tight">118102 <span className="text-[10px] text-gray-400 font-normal ml-0.5">人</span></div>
                         </div>
                      </div>
                   </div>

                   {/* Card 2 */}
                   <div className="bg-[#e6f2ff]/50 rounded-lg p-4">
                      <div className="text-center text-sm font-bold text-gray-700 mb-3">领取票券</div>
                      <div className="flex justify-between px-6 items-center">
                         <div className="text-center">
                            <div className="text-[10px] text-gray-400 mb-1">数量:</div>
                            <div className="text-xl font-black text-[#2B7FF2] font-sans tracking-tight">301271 <span className="text-[10px] text-gray-400 font-normal ml-0.5">张</span></div>
                         </div>
                         <div className="text-center">
                            <div className="text-[10px] text-gray-400 mb-1">人数:</div>
                            <div className="text-xl font-black text-[#2B7FF2] font-sans tracking-tight">912 <span className="text-[10px] text-gray-400 font-normal ml-0.5">人</span></div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
             
             {/* List of generated tickets */}
             <div className="space-y-2 mt-4">
                 {generatedTickets.length > 0 ? generatedTickets.map(t => (
                   <div key={t.id} className="bg-white p-3 rounded-lg border border-gray-100 flex justify-between items-center shadow-sm">
                     <div><div className="font-bold text-sm text-gray-700">{t.type}</div><div className="text-[10px] text-gray-400">{t.code}</div></div>
                     <div className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">{t.status === 'ACTIVE' ? '有效' : '已用'}</div>
                   </div>
                 )) : null} 
             </div>
           </div>
         )}
       </div>
    </div>
  );

  const renderAdminMerch = () => (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in">
      <div className="bg-white p-2 mx-4 mt-4 mb-2 rounded-lg flex shadow-sm border border-gray-100 shrink-0">
        <button onClick={() => setMerchAdminSubTab('MANAGE')} className={`flex-1 py-2 text-xs font-bold rounded-md ${merchAdminSubTab === 'MANAGE' ? 'bg-purple-100 text-purple-700' : 'text-gray-500'}`}>商品管理</button>
        <button onClick={() => setMerchAdminSubTab('SALES')} className={`flex-1 py-2 text-xs font-bold rounded-md ${merchAdminSubTab === 'SALES' ? 'bg-purple-100 text-purple-700' : 'text-gray-500'}`}>订单处理</button>
        <button onClick={() => setMerchAdminSubTab('STATS')} className={`flex-1 py-2 text-xs font-bold rounded-md ${merchAdminSubTab === 'STATS' ? 'bg-purple-100 text-purple-700' : 'text-gray-500'}`}>统计看板</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 pb-20 no-scrollbar">
        {merchAdminSubTab === 'MANAGE' && (
           <div className="space-y-3">
              {products.map(p => (
                <div key={p.id} className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-3 shadow-sm">
                   <img src={p.image} className="w-12 h-12 rounded object-cover shadow-sm bg-gray-50" />
                   <div className="flex-1">
                     <div className="text-sm font-bold">{p.name}</div>
                     <div className="text-[10px] text-gray-400">¥{p.price} / {p.points}pts / 库存:{p.stock || 0}</div>
                   </div>
                   <button onClick={() => setEditingProduct(p)} className="text-purple-600 text-xs font-bold flex items-center gap-1 bg-purple-50 px-2 py-1.5 rounded">
                     <Edit size={14} /> 编辑
                   </button>
                </div>
              ))}
              <button onClick={() => setEditingProduct({ id: 'p' + Date.now(), name: '', image: '', points: 0, price: 0, stock: 0 })} className="w-full border-2 border-dashed border-gray-200 py-3 rounded-xl text-gray-400 text-xs font-bold flex items-center justify-center gap-2 hover:bg-white hover:border-purple-300 hover:text-purple-500 transition-all"><PlusCircle size={16} /> 上架新商品</button>
           </div>
        )}
        {merchAdminSubTab === 'SALES' && (
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2 px-1"><Ticket size={12}/> 待处理核销</h4>
            <div className="space-y-3">
              {userMerchTickets.filter(t => t.status === 'PENDING').map(ticket => (
                <div key={ticket.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-1"><span className="font-bold text-gray-800 text-sm">{ticket.productName}</span><span className="text-[10px] px-2 py-0.5 rounded bg-orange-100 text-orange-600">待核销</span></div>
                  <div className="text-[10px] text-gray-400 mb-4">券码: {ticket.id}</div>
                  <button 
                    onClick={() => {
                        const updated = userMerchTickets.map(t => t.id === ticket.id ? { ...t, status: 'REDEEMED' as const } : t);
                        setUserMerchTickets(updated);
                        localStorage.setItem('vr_user_merch', JSON.stringify(updated));
                        window.dispatchEvent(new Event('storage_update'));
                        alert('已核销成功！');
                    }}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg text-xs font-bold shadow-md shadow-blue-100 active:scale-[0.98] transition-all"
                  >
                    确认核销并交付
                  </button>
                </div>
              ))}
              {userMerchTickets.filter(t => t.status === 'PENDING').length === 0 && <div className="text-center py-10 text-gray-300 text-xs">暂无待处理订单</div>}
            </div>
          </div>
        )}
        {merchAdminSubTab === 'STATS' && (
          <div className="grid grid-cols-2 gap-3">
             <div className="bg-white p-4 rounded-xl shadow-sm text-center border">
                <div className="text-2xl font-bold text-purple-600">{userMerchTickets.filter(t => t.status === 'PENDING').length}</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase">待核销券</div>
             </div>
             <div className="bg-white p-4 rounded-xl shadow-sm text-center border">
                <div className="text-2xl font-bold text-blue-600">{offlineSales.length}</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase">线下已售</div>
             </div>
          </div>
        )}
      </div>
    </div>
  );

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
        {adminTab === 'TICKETS' && renderAdminTickets()}
        {adminTab === 'CONTROL' && (
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
        )}
        {adminTab === 'IDENTITY' && (
            <div className="flex flex-col h-full bg-slate-50 p-6 text-center animate-in fade-in">
            <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 border-4 border-white shadow-lg flex items-center justify-center text-4xl">👩‍💼</div>
            <h2 className="text-xl font-bold text-gray-800">店长 · 李晓明</h2>
            <p className="text-xs text-gray-400 mt-1">ID: STAFF_88291</p>
            <div className="mt-8 space-y-3 text-left">
            <button className="w-full bg-white p-4 rounded-xl flex items-center justify-between font-bold text-sm border border-gray-100 shadow-sm"><span>系统设置</span><ChevronRight size={16} className="text-gray-300"/></button>
            <button className="w-full bg-white p-4 rounded-xl flex items-center justify-between font-bold text-sm border border-gray-100 shadow-sm"><span>权限管理</span><ChevronRight size={16} className="text-gray-300"/></button>
            <button className="w-full bg-red-50 text-red-600 p-4 rounded-xl font-bold mt-10 text-sm">退出工作台</button>
            </div>
        </div>
        )}
        {adminTab === 'MERCH' && renderAdminMerch()}
        {adminTab === 'DATA' && (
        <div className="flex flex-col h-full bg-slate-50 p-4 space-y-4 animate-in fade-in">
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
        </div>
        )}
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
