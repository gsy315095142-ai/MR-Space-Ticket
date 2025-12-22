import React, { useState, useEffect, useRef } from 'react';
import { Home, User, Ticket, Calendar, ChevronRight, MapPin, ScanLine, Gift, Clock, Star, X, Music, ArrowLeft, Users, CheckCircle, CreditCard, ChevronLeft, CalendarDays, Settings, PieChart, BarChart, QrCode, LogOut, RefreshCw, Copy, Filter, Command, PlayCircle, Share, ChevronDown, Edit, Bell, AlertCircle, Share2, ArrowRightLeft, CalendarClock, UserPlus, ShoppingBag, BookOpen, Info, ShoppingCart, PackageCheck, TrendingUp, Activity, Plus, Minus, Store, Sparkles, Wand2, Percent, Save, Image as ImageIcon, PlusCircle, Upload, Box, TicketCheck, History, Wallet, Trophy, ShieldCheck, Search, FileText, Phone, CheckSquare, Square, Ticket as TicketIcon } from 'lucide-react';
import { MerchItem, UserMerchTicket, GlobalBooking } from '../types';
import StaffTicketView from './StaffTicketView';
import StaffDataView from './StaffDataView';

interface StaffFrontStoreViewProps {
  initialAdminTab?: 'TICKETS' | 'DATA' | 'IDENTITY' | 'CONTROL' | 'MERCH';
}

const DEFAULT_PRODUCTS: MerchItem[] = [
  { id: 'p1', name: 'LUMI魔法师徽章', image: 'https://images.unsplash.com/photo-1635273051937-20083c27da1d?w=400&h=400&fit=crop', points: 100, price: 29, stock: 50, isOnShelf: true },
  { id: 'p2', name: '定制版发光法杖', image: 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=600&h=800&fit=crop', points: 500, price: 128, stock: 20, isOnShelf: true },
  { id: 'p3', name: '魔法学院主题斗篷', image: 'https://images.unsplash.com/photo-1517462964-21fdcec3f25b?w=600&h=800&fit=crop', points: 800, price: 299, stock: 15, isOnShelf: true },
];

const StaffFrontStoreView: React.FC<StaffFrontStoreViewProps> = ({ initialAdminTab }) => {
  // --- STATE ---
  const [products, setProducts] = useState<MerchItem[]>(DEFAULT_PRODUCTS);
  const [userMerchTickets, setUserMerchTickets] = useState<UserMerchTicket[]>([]);
  const [offlineSales, setOfflineSales] = useState<any[]>([]);
  const [globalBookings, setGlobalBookings] = useState<GlobalBooking[]>([]);
  
  const [adminTab, setAdminTab] = useState<'TICKETS' | 'DATA' | 'IDENTITY' | 'CONTROL' | 'MERCH'>(initialAdminTab || 'TICKETS');
  const [merchAdminSubTab, setMerchAdminSubTab] = useState<'MANAGE' | 'SALES' | 'STATS'>('SALES');
  const [editingProduct, setEditingProduct] = useState<MerchItem | null>(null);
  
  const [showTransferConfirmModal, setShowTransferConfirmModal] = useState(false);
  const [sessionToTransfer, setSessionToTransfer] = useState<GlobalBooking | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  // --- DATA SYNC ---
  const loadData = () => {
    const storedMerch = localStorage.getItem('vr_user_merch');
    if (storedMerch) setUserMerchTickets(JSON.parse(storedMerch));
    
    const storedOffline = localStorage.getItem('vr_offline_sales');
    if (storedOffline) setOfflineSales(JSON.parse(storedOffline));
    
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

  const toggleProductShelf = (product: MerchItem) => {
    const updatedProducts = products.map(p => {
        if (p.id === product.id) {
            return { ...p, isOnShelf: p.isOnShelf === false ? true : false };
        }
        return p;
    });
    setProducts(updatedProducts);
    localStorage.setItem('vr_global_products', JSON.stringify(updatedProducts));
    window.dispatchEvent(new Event('storage_update'));
    showToast(product.isOnShelf === false ? '商品已上架' : '商品已下架');
  };

  // --- RENDERERS ---
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
                   <div className="flex flex-col gap-2 items-end">
                      <button onClick={() => setEditingProduct(p)} className="text-purple-600 text-xs font-bold flex items-center gap-1 bg-purple-50 px-2 py-1.5 rounded">
                        <Edit size={14} /> 编辑
                      </button>
                      
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold ${p.isOnShelf !== false ? 'text-green-600' : 'text-gray-400'}`}>
                           {p.isOnShelf !== false ? '上架中' : '已下架'}
                        </span>
                        <button 
                            onClick={() => toggleProductShelf(p)}
                            className={`w-8 h-4 rounded-full relative transition-colors duration-200 ${p.isOnShelf !== false ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                            <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all duration-200 ${p.isOnShelf !== false ? 'translate-x-[18px]' : 'translate-x-[2px]'}`}></div>
                        </button>
                      </div>
                   </div>
                </div>
              ))}
              <button onClick={() => setEditingProduct({ id: 'p' + Date.now(), name: '', image: '', points: 0, price: 0, stock: 0, isOnShelf: true })} className="w-full border-2 border-dashed border-gray-200 py-3 rounded-xl text-gray-400 text-xs font-bold flex items-center justify-center gap-2 hover:bg-white hover:border-purple-300 hover:text-purple-500 transition-all"><PlusCircle size={16} /> 上架新商品</button>
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
        {adminTab === 'TICKETS' && <StaffTicketView onShowToast={showToast} />}
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

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="absolute inset-0 z-[260] flex items-center justify-center p-6 animate-in fade-in">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingProduct(null)}></div>
           <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 relative z-10 flex flex-col max-h-[90%]">
               <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-lg text-slate-800">{editingProduct.id.startsWith('p') ? '编辑商品' : '上架商品'}</h3>
                   <button onClick={() => setEditingProduct(null)} className="p-1 rounded-full hover:bg-gray-100"><X size={20} className="text-gray-400"/></button>
               </div>
               
               <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar pb-4">
                   {/* Image Upload */}
                   <div className="flex flex-col items-center gap-3">
                       <div className="w-24 h-24 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group cursor-pointer">
                           {editingProduct.image ? (
                               <img src={editingProduct.image} className="w-full h-full object-cover" />
                           ) : (
                               <ImageIcon className="text-gray-300" />
                           )}
                           <input 
                               type="file" 
                               accept="image/*" 
                               className="absolute inset-0 opacity-0 cursor-pointer"
                               onChange={(e) => {
                                   const file = e.target.files?.[0];
                                   if(file) {
                                       const reader = new FileReader();
                                       reader.onloadend = () => {
                                           setEditingProduct({...editingProduct, image: reader.result as string});
                                       }
                                       reader.readAsDataURL(file);
                                   }
                               }} 
                           />
                           <div className="absolute inset-0 bg-black/50 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold">更换图片</div>
                       </div>
                       <span className="text-[10px] text-gray-400">点击图片上传</span>
                   </div>

                   {/* Name */}
                   <div>
                       <label className="text-xs font-bold text-gray-500 mb-1 block">商品名称</label>
                       <input 
                           type="text" 
                           value={editingProduct.name} 
                           onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                           className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-purple-500"
                           placeholder="请输入商品名称"
                       />
                   </div>

                   {/* Price & Points Row */}
                   <div className="flex gap-3">
                       <div className="flex-1">
                           <label className="text-xs font-bold text-gray-500 mb-1 block">售价 (¥)</label>
                           <input 
                               type="number" 
                               value={editingProduct.price} 
                               onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                               className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-purple-500"
                               placeholder="0.00"
                           />
                       </div>
                       <div className="flex-1">
                           <label className="text-xs font-bold text-gray-500 mb-1 block">兑换积分</label>
                           <input 
                               type="number" 
                               value={editingProduct.points} 
                               onChange={e => setEditingProduct({...editingProduct, points: Number(e.target.value)})}
                               className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-purple-500"
                               placeholder="0"
                           />
                       </div>
                   </div>

                   {/* Stock */}
                    <div>
                       <label className="text-xs font-bold text-gray-500 mb-1 block">库存数量</label>
                       <input 
                           type="number" 
                           value={editingProduct.stock || 0} 
                           onChange={e => setEditingProduct({...editingProduct, stock: Number(e.target.value)})}
                           className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-purple-500"
                           placeholder="0"
                       />
                   </div>
               </div>

               <button 
                   onClick={() => {
                       // Save Logic
                       if (!editingProduct.name) {
                           alert('请输入商品名称');
                           return;
                       }
                       let updatedProducts = [...products];
                       // Check if ID exists in original products list (meaning it's an edit)
                       const index = updatedProducts.findIndex(p => p.id === editingProduct.id);
                       if (index > -1) {
                           updatedProducts[index] = editingProduct;
                       } else {
                           // For new products, ensure ID is unique (it was set on creation but just to be safe)
                           updatedProducts.push(editingProduct); 
                       }
                       setProducts(updatedProducts);
                       localStorage.setItem('vr_global_products', JSON.stringify(updatedProducts));
                       window.dispatchEvent(new Event('storage_update'));
                       setEditingProduct(null);
                       showToast('商品信息已更新');
                   }}
                   className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-200 active:scale-95 transition-all mt-2"
               >
                   保存更改
               </button>
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