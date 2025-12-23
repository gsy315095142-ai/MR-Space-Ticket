import React, { useState, useEffect } from 'react';
import { Ticket, Edit, PlusCircle, X, Image as ImageIcon, Upload, Store, ChevronDown, Calendar, ScanLine, RotateCcw, Search, CheckCircle2, AlertCircle, Filter, Package, ShoppingBag, Receipt, CreditCard } from 'lucide-react';
import { MerchItem, UserMerchTicket } from '../types';

interface StaffMerchViewProps {
  onShowToast: (message: string) => void;
}

const DEFAULT_PRODUCTS: MerchItem[] = [
  { id: 'p1', name: 'LUMI魔法师徽章', image: 'https://images.unsplash.com/photo-1590543789988-66236b2f689e?w=400&h=400&fit=crop', points: 100, price: 29, stock: 50, isOnShelf: true, category: '礼品' },
  { id: 'p2', name: '定制版发光法杖', image: 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=600&h=800&fit=crop', points: 500, price: 128, stock: 20, isOnShelf: true, category: '礼品' },
  { id: 'p3', name: '魔法学院主题斗篷', image: 'https://images.unsplash.com/photo-1517462964-21fdcec3f25b?w=600&h=800&fit=crop', points: 800, price: 299, stock: 15, isOnShelf: true, category: '服饰' },
];

const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_WIDTH = 500;
                const MAX_HEIGHT = 500;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                } else {
                    resolve(e.target?.result as string);
                }
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    });
};

const getTodayStr = () => new Date().toISOString().split('T')[0];
const getYesterdayStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
};

const getWeekRange = (offset = 0) => {
    const now = new Date();
    const dayOfWeek = now.getDay() || 7; // Sunday is 0, make it 7 for calculation
    const currentMonday = new Date(now);
    currentMonday.setDate(now.getDate() - dayOfWeek + 1 + (offset * 7));
    
    const currentSunday = new Date(currentMonday);
    currentSunday.setDate(currentMonday.getDate() + 6);
    
    return {
        start: currentMonday.toISOString().split('T')[0],
        end: currentSunday.toISOString().split('T')[0]
    };
};

const StaffMerchView: React.FC<StaffMerchViewProps> = ({ onShowToast }) => {
  const [products, setProducts] = useState<MerchItem[]>(DEFAULT_PRODUCTS);
  const [userMerchTickets, setUserMerchTickets] = useState<UserMerchTicket[]>([]);
  const [offlineSales, setOfflineSales] = useState<any[]>([]);
  const [merchAdminSubTab, setMerchAdminSubTab] = useState<'MANAGE' | 'SALES' | 'STATS'>('SALES');
  const [editingProduct, setEditingProduct] = useState<MerchItem | null>(null);
  const [selectedStore, setSelectedStore] = useState('ALL');

  // Sales Tab State
  const [salesStartDate, setSalesStartDate] = useState<string>(getTodayStr());
  const [salesEndDate, setSalesEndDate] = useState<string>(getTodayStr());
  const [refundTicket, setRefundTicket] = useState<UserMerchTicket | null>(null);
  const [salesStatusFilter, setSalesStatusFilter] = useState<'ALL' | 'PENDING' | 'REDEEMED' | 'REFUNDED'>('ALL');

  // Stats Tab State
  const [statsStartDate, setStatsStartDate] = useState<string>(getTodayStr());
  const [statsEndDate, setStatsEndDate] = useState<string>(getTodayStr());

  const STORES = [
      { id: 'ALL', name: '全部门店' },
      { id: '北京·ClubMedJoyview延庆度假村', name: '北京·ClubMedJoyview延庆度假村' },
      { id: '上海·LUMI魔法学院旗舰店', name: '上海·LUMI魔法学院旗舰店' }
  ];

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
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage_update', loadData);
    return () => window.removeEventListener('storage_update', loadData);
  }, []);

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
    onShowToast(product.isOnShelf === false ? '商品已上架' : '商品已下架');
  };

  const handleRefundConfirm = () => {
      if (!refundTicket) return;

      const updated = userMerchTickets.map(t => 
          t.id === refundTicket.id ? { ...t, status: 'REFUNDED' as const } : t
      );
      setUserMerchTickets(updated);
      localStorage.setItem('vr_user_merch', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage_update'));
      
      onShowToast('订单已撤销');
      setRefundTicket(null);
  };

  const isInDateRange = (timestamp: string, start: string, end: string) => {
      const date = new Date(timestamp);
      const dateStr = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
      return dateStr >= start && dateStr <= end;
  };

  // Filter Logic for Sales Tab
  const filteredSalesTickets = userMerchTickets
    .filter(t => {
        const matchesDate = isInDateRange(t.timestamp, salesStartDate, salesEndDate);
        const matchesStore = selectedStore === 'ALL' || t.store === selectedStore || (!t.store && selectedStore === 'ALL');
        const matchesStatus = salesStatusFilter === 'ALL' || t.status === salesStatusFilter;
        return matchesDate && matchesStore && matchesStatus;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Filter Logic for Stats Tab
  const getStatsData = () => {
      const filterFn = (t: any) => 
        isInDateRange(t.timestamp, statsStartDate, statsEndDate) &&
        (selectedStore === 'ALL' || t.store === selectedStore || (!t.store && selectedStore === 'ALL'));

      const filteredTickets = userMerchTickets.filter(filterFn);
      const filteredOffline = offlineSales.filter(filterFn);

      const pendingTickets = filteredTickets.filter(t => t.status === 'PENDING');
      const redeemedTickets = filteredTickets.filter(t => t.status === 'REDEEMED');
      const refundedTickets = filteredTickets.filter(t => t.status === 'REFUNDED');

      return {
          pendingOrders: pendingTickets.length,
          pendingItems: pendingTickets.reduce((sum, t) => sum + (t.quantity || 1), 0),
          redeemedOrders: redeemedTickets.length,
          redeemedItems: redeemedTickets.reduce((sum, t) => sum + (t.quantity || 1), 0),
          refundedOrders: refundedTickets.length,
          refundedItems: refundedTickets.reduce((sum, t) => sum + (t.quantity || 1), 0),
          offlineItems: filteredOffline.length // Assuming offline sales are 1 item per entry
      };
  };

  const stats = getStatsData();

  const renderStoreFilter = () => (
    <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 z-10">
            <Store size={14} />
        </div>
        <select 
            value={selectedStore} 
            onChange={(e) => setSelectedStore(e.target.value)}
            className="w-full appearance-none bg-gray-50 border border-gray-200 text-slate-700 text-xs font-bold py-2.5 pl-9 pr-8 rounded-lg focus:outline-none focus:border-purple-400 cursor-pointer"
        >
            {STORES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
            <ChevronDown size={14} />
        </div>
    </div>
  );

  return (
    <>
      <div className="flex flex-col h-full bg-slate-50 animate-in fade-in">
        <div className="bg-white p-2 mx-4 mt-4 mb-2 rounded-lg flex shadow-sm border border-gray-100 shrink-0">
          <button onClick={() => setMerchAdminSubTab('MANAGE')} className={`flex-1 py-2 text-xs font-bold rounded-md ${merchAdminSubTab === 'MANAGE' ? 'bg-purple-100 text-purple-700' : 'text-gray-500'}`}>商品管理</button>
          <button onClick={() => setMerchAdminSubTab('SALES')} className={`flex-1 py-2 text-xs font-bold rounded-md ${merchAdminSubTab === 'SALES' ? 'bg-purple-100 text-purple-700' : 'text-gray-500'}`}>订单处理</button>
          <button onClick={() => setMerchAdminSubTab('STATS')} className={`flex-1 py-2 text-xs font-bold rounded-md ${merchAdminSubTab === 'STATS' ? 'bg-purple-100 text-purple-700' : 'text-gray-500'}`}>统计看板</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pb-20 no-scrollbar">
          {merchAdminSubTab === 'MANAGE' && (
             <div className="space-y-3">
                {/* Store Filter for Manage */}
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">当前管理门店</div>
                    {renderStoreFilter()}
                </div>

                {products.map(p => {
                  // Calculate pending redemptions for this product
                  const pendingCount = userMerchTickets
                    .filter(t => t.productId === p.id && t.status === 'PENDING')
                    .reduce((acc, t) => acc + (t.quantity || 1), 0);

                  return (
                  <div key={p.id} className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-3 shadow-sm">
                     <img src={p.image} className="w-12 h-12 rounded object-cover shadow-sm bg-gray-50" />
                     <div className="flex-1">
                       <div className="text-sm font-bold">{p.name}</div>
                       <div className="text-[10px] text-gray-400">¥{p.price} / {p.points}pts / 库存:{p.stock || 0}</div>
                       <div className="text-[10px] text-orange-500 font-bold mt-0.5">待核销: {pendingCount}</div>
                       {p.category && <div className="text-[9px] text-purple-500 bg-purple-50 inline-block px-1.5 py-0.5 rounded mt-1">{p.category}</div>}
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
                  );
                })}
                <button onClick={() => setEditingProduct({ id: 'p' + Date.now(), name: '', image: '', points: 0, price: 0, stock: 0, isOnShelf: true, category: '礼品' })} className="w-full border-2 border-dashed border-gray-200 py-3 rounded-xl text-gray-400 text-xs font-bold flex items-center justify-center gap-2 hover:bg-white hover:border-purple-300 hover:text-purple-500 transition-all"><PlusCircle size={16} /> 同步商品信息</button>
             </div>
          )}
          
          {merchAdminSubTab === 'SALES' && (
            <div className="space-y-4">
               {/* Filters */}
               <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 space-y-3">
                   {/* Store Filter */}
                   {renderStoreFilter()}

                   {/* Status Filter */}
                   <div className="relative">
                        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 z-10">
                            <Filter size={14} />
                        </div>
                        <select 
                            value={salesStatusFilter} 
                            onChange={(e) => setSalesStatusFilter(e.target.value as any)}
                            className="w-full appearance-none bg-gray-50 border border-gray-200 text-slate-700 text-xs font-bold py-2.5 pl-9 pr-8 rounded-lg focus:outline-none focus:border-purple-400 cursor-pointer"
                        >
                            <option value="ALL">全部状态</option>
                            <option value="PENDING">待核销</option>
                            <option value="REDEEMED">已核销</option>
                            <option value="REFUNDED">已撤销</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                            <ChevronDown size={14} />
                        </div>
                   </div>

                   {/* Date Filter */}
                   <div className="flex items-center gap-2">
                       <div className="flex-1 bg-gray-50 rounded-lg p-2 flex items-center gap-2 border border-gray-200">
                           <Calendar size={14} className="text-gray-400" />
                           <input 
                               type="date" 
                               value={salesStartDate}
                               onChange={(e) => setSalesStartDate(e.target.value)}
                               className="bg-transparent text-xs font-bold w-full outline-none text-gray-600"
                           />
                       </div>
                       <span className="text-gray-300">-</span>
                       <div className="flex-1 bg-gray-50 rounded-lg p-2 flex items-center gap-2 border border-gray-200">
                           <Calendar size={14} className="text-gray-400" />
                           <input 
                               type="date" 
                               value={salesEndDate}
                               onChange={(e) => setSalesEndDate(e.target.value)}
                               className="bg-transparent text-xs font-bold w-full outline-none text-gray-600"
                           />
                       </div>
                   </div>
                   
                   {/* Shortcuts */}
                   <div className="flex gap-2">
                       <button 
                         onClick={() => { setSalesStartDate(getYesterdayStr()); setSalesEndDate(getYesterdayStr()); }}
                         className="flex-1 bg-gray-50 text-gray-500 text-[10px] font-bold py-1.5 rounded hover:bg-purple-50 hover:text-purple-600 transition-colors"
                       >
                           昨日
                       </button>
                       <button 
                         onClick={() => { setSalesStartDate(getTodayStr()); setSalesEndDate(getTodayStr()); }}
                         className="flex-1 bg-gray-50 text-gray-500 text-[10px] font-bold py-1.5 rounded hover:bg-purple-50 hover:text-purple-600 transition-colors"
                       >
                           今日
                       </button>
                   </div>
                   
                   <div className="text-[10px] text-gray-400 text-right pt-1">
                       共找到 {filteredSalesTickets.length} 条记录
                   </div>
               </div>

               {/* Order List */}
               <div className="space-y-3">
                  {filteredSalesTickets.length === 0 ? (
                      <div className="text-center py-10 text-gray-300 text-xs flex flex-col items-center">
                          <Search size={32} className="mb-2 opacity-50"/>
                          暂无符合条件的订单
                      </div>
                  ) : (
                      filteredSalesTickets.map(ticket => {
                          const isPending = ticket.status === 'PENDING';
                          const isRedeemed = ticket.status === 'REDEEMED';
                          const isRefunded = ticket.status === 'REFUNDED';
                          const product = products.find(p => p.id === ticket.productId);
                          const totalCost = product ? (
                              ticket.redeemMethod === 'POINTS' 
                                  ? `${product.points * (ticket.quantity || 1)} 积分` 
                                  : `¥${product.price * (ticket.quantity || 1)}`
                          ) : '';

                          return (
                          <div key={ticket.id} className={`bg-white p-3 rounded-xl shadow-sm border flex flex-col gap-3 ${isRefunded ? 'border-gray-100 opacity-60' : 'border-gray-100'}`}>
                              <div className="flex gap-3">
                                  {/* Product Image */}
                                  <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                                      {ticket.productImage ? (
                                          <img src={ticket.productImage} className="w-full h-full object-cover" />
                                      ) : (
                                          <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={20}/></div>
                                      )}
                                  </div>
                                  
                                  {/* Info */}
                                  <div className="flex-1 min-w-0">
                                      <div className="flex justify-between items-start mb-1">
                                          <div className="font-bold text-gray-800 text-sm truncate pr-2">
                                              {ticket.productName}
                                              {(ticket.quantity || 1) > 1 && <span className="ml-1 text-purple-600 text-xs">x{ticket.quantity}</span>}
                                          </div>
                                          <span className={`text-[9px] px-2 py-0.5 rounded font-bold shrink-0 ${isPending ? 'bg-orange-100 text-orange-600' : isRedeemed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                              {isPending ? '待核销' : isRedeemed ? '已核销' : '已撤销'}
                                          </span>
                                      </div>
                                      {totalCost && (
                                         <div className={`text-[10px] font-bold mb-1 ${ticket.redeemMethod === 'POINTS' ? 'text-purple-600' : 'text-slate-900'}`}>
                                             {ticket.redeemMethod === 'POINTS' ? '消费' : '实付'}: {totalCost}
                                         </div>
                                      )}
                                      <div className="text-[10px] text-gray-400 font-mono mb-1">ID: {ticket.id}</div>
                                      <div className="text-[10px] text-gray-400 mb-1">{ticket.timestamp.split(' ')[0]} {ticket.timestamp.split(' ')[1]}</div>
                                      <div className="text-[9px] text-gray-400 truncate max-w-[150px] flex items-center gap-1">
                                          <Store size={10} />
                                          {ticket.store || '未知门店'}
                                      </div>
                                  </div>
                              </div>
                              
                              {/* Actions */}
                              <div className="flex gap-2">
                                  {isPending && (
                                      <>
                                      <button 
                                        onClick={() => setRefundTicket(ticket)}
                                        className="w-20 bg-white border border-gray-200 text-gray-600 py-2 rounded-lg text-xs font-bold hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                                      >
                                        撤销
                                      </button>
                                      <button 
                                        onClick={() => {
                                            const updated = userMerchTickets.map(t => t.id === ticket.id ? { ...t, status: 'REDEEMED' as const } : t);
                                            setUserMerchTickets(updated);
                                            localStorage.setItem('vr_user_merch', JSON.stringify(updated));
                                            window.dispatchEvent(new Event('storage_update'));
                                            onShowToast('扫码核销成功');
                                        }}
                                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-xs font-bold shadow-md shadow-blue-100 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                                      >
                                        <ScanLine size={14} /> 扫码核销
                                      </button>
                                      </>
                                  )}

                                  {isRedeemed && (
                                      <button 
                                        onClick={() => setRefundTicket(ticket)}
                                        className="flex-1 bg-white border border-gray-200 text-gray-600 py-2 rounded-lg text-xs font-bold hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                                      >
                                        <RotateCcw size={14} /> 撤销
                                      </button>
                                  )}

                                  {isRefunded && (
                                      <div className="flex-1 bg-gray-50 text-gray-400 border border-gray-100 py-2 rounded-lg text-xs font-bold text-center">
                                          已撤销
                                      </div>
                                  )}
                              </div>
                          </div>
                          );
                      })
                  )}
               </div>
            </div>
          )}

          {merchAdminSubTab === 'STATS' && (
            <div className="space-y-4">
               {/* Filters */}
               <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 space-y-3">
                   <div className="space-y-2">
                       <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">统计门店</div>
                       {renderStoreFilter()}
                   </div>

                   <div className="space-y-2">
                       <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">统计时间段</div>
                       <div className="flex items-center gap-2">
                           <div className="flex-1 bg-gray-50 rounded-lg p-2 flex items-center gap-2 border border-gray-200">
                               <Calendar size={14} className="text-gray-400" />
                               <input 
                                   type="date" 
                                   value={statsStartDate}
                                   onChange={(e) => setStatsStartDate(e.target.value)}
                                   className="bg-transparent text-xs font-bold w-full outline-none text-gray-600"
                               />
                           </div>
                           <span className="text-gray-300">-</span>
                           <div className="flex-1 bg-gray-50 rounded-lg p-2 flex items-center gap-2 border border-gray-200">
                               <Calendar size={14} className="text-gray-400" />
                               <input 
                                   type="date" 
                                   value={statsEndDate}
                                   onChange={(e) => setStatsEndDate(e.target.value)}
                                   className="bg-transparent text-xs font-bold w-full outline-none text-gray-600"
                               />
                           </div>
                       </div>
                       
                       {/* Date Shortcuts */}
                       <div className="flex gap-2 pt-1">
                          <button 
                             onClick={() => { setStatsStartDate(getYesterdayStr()); setStatsEndDate(getYesterdayStr()); }}
                             className="flex-1 bg-gray-50 border border-gray-200 text-gray-500 text-[10px] font-bold py-1.5 rounded hover:bg-purple-50 hover:border-purple-200 hover:text-purple-600 transition-colors"
                          >
                             昨日
                          </button>
                          <button 
                             onClick={() => { setStatsStartDate(getTodayStr()); setStatsEndDate(getTodayStr()); }}
                             className="flex-1 bg-gray-50 border border-gray-200 text-gray-500 text-[10px] font-bold py-1.5 rounded hover:bg-purple-50 hover:border-purple-200 hover:text-purple-600 transition-colors"
                          >
                             今日
                          </button>
                          <button 
                             onClick={() => { 
                                 const r = getWeekRange(-1);
                                 setStatsStartDate(r.start); 
                                 setStatsEndDate(r.end); 
                             }}
                             className="flex-1 bg-gray-50 border border-gray-200 text-gray-500 text-[10px] font-bold py-1.5 rounded hover:bg-purple-50 hover:border-purple-200 hover:text-purple-600 transition-colors"
                          >
                             上周
                          </button>
                          <button 
                             onClick={() => { 
                                 const r = getWeekRange(0);
                                 setStatsStartDate(r.start); 
                                 setStatsEndDate(r.end); 
                             }}
                             className="flex-1 bg-gray-50 border border-gray-200 text-gray-500 text-[10px] font-bold py-1.5 rounded hover:bg-purple-50 hover:border-purple-200 hover:text-purple-600 transition-colors"
                          >
                             本周
                          </button>
                       </div>
                   </div>
               </div>

               {/* Detailed Stats Cards */}
               <div className="space-y-3">
                   {/* Pending Stats */}
                   <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                       <div className="flex items-center gap-2 mb-3">
                           <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg"><Receipt size={16} /></div>
                           <span className="font-bold text-sm text-gray-800">待核销数据</span>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                           <div className="text-center p-2 bg-orange-50/50 rounded-lg">
                               <div className="text-2xl font-black text-orange-600">{stats.pendingOrders}</div>
                               <div className="text-[10px] text-gray-500 font-bold mt-1">订单数量</div>
                           </div>
                           <div className="text-center p-2 bg-orange-50/50 rounded-lg">
                               <div className="text-2xl font-black text-orange-600">{stats.pendingItems}</div>
                               <div className="text-[10px] text-gray-500 font-bold mt-1">商品件数</div>
                           </div>
                       </div>
                   </div>

                   {/* Redeemed Stats */}
                   <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                       <div className="flex items-center gap-2 mb-3">
                           <div className="p-1.5 bg-green-100 text-green-600 rounded-lg"><CheckCircle2 size={16} /></div>
                           <span className="font-bold text-sm text-gray-800">已核销数据</span>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                           <div className="text-center p-2 bg-green-50/50 rounded-lg">
                               <div className="text-2xl font-black text-green-600">{stats.redeemedOrders}</div>
                               <div className="text-[10px] text-gray-500 font-bold mt-1">订单数量</div>
                           </div>
                           <div className="text-center p-2 bg-green-50/50 rounded-lg">
                               <div className="text-2xl font-black text-green-600">{stats.redeemedItems}</div>
                               <div className="text-[10px] text-gray-500 font-bold mt-1">商品件数</div>
                           </div>
                       </div>
                   </div>

                   {/* Refunded Stats */}
                   <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                       <div className="flex items-center gap-2 mb-3">
                           <div className="p-1.5 bg-gray-100 text-gray-600 rounded-lg"><RotateCcw size={16} /></div>
                           <span className="font-bold text-sm text-gray-800">已撤销数据</span>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                           <div className="text-center p-2 bg-gray-50 rounded-lg">
                               <div className="text-2xl font-black text-gray-600">{stats.refundedOrders}</div>
                               <div className="text-[10px] text-gray-400 font-bold mt-1">订单数量</div>
                           </div>
                           <div className="text-center p-2 bg-gray-50 rounded-lg">
                               <div className="text-2xl font-black text-gray-600">{stats.refundedItems}</div>
                               <div className="text-[10px] text-gray-400 font-bold mt-1">商品件数</div>
                           </div>
                       </div>
                   </div>

                   {/* Offline Stats */}
                   <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                       <div className="flex items-center gap-2 mb-3">
                           <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><CreditCard size={16} /></div>
                           <span className="font-bold text-sm text-gray-800">线下销售数据</span>
                       </div>
                       <div className="text-center p-2 bg-blue-50/50 rounded-lg">
                           <div className="text-2xl font-black text-blue-600">{stats.offlineItems}</div>
                           <div className="text-[10px] text-gray-500 font-bold mt-1">出售商品数量</div>
                       </div>
                   </div>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="absolute inset-0 z-[260] flex items-center justify-center p-6 animate-in fade-in">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingProduct(null)}></div>
           <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 relative z-10 flex flex-col h-auto">
               <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-lg text-slate-800">{editingProduct.id.startsWith('p') ? '编辑商品' : '上架商品'}</h3>
                   <button onClick={() => setEditingProduct(null)} className="p-1 rounded-full hover:bg-gray-100"><X size={20} className="text-gray-400"/></button>
               </div>
               
               <div className="space-y-4">
                   <div className="flex flex-col items-center gap-3">
                       <div className="w-24 h-24 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative">
                           {editingProduct.image ? (
                               <img src={editingProduct.image} className="w-full h-full object-cover" />
                           ) : (
                               <ImageIcon className="text-gray-300" />
                           )}
                       </div>
                       
                       <label className="cursor-pointer bg-purple-50 hover:bg-purple-100 text-purple-600 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors">
                           <Upload size={14} />
                           上传图片
                           <input 
                               type="file" 
                               accept="image/*" 
                               className="hidden"
                               onChange={async (e) => {
                                   const file = e.target.files?.[0];
                                   if(file) {
                                       try {
                                           const resizedImage = await resizeImage(file);
                                           setEditingProduct({...editingProduct, image: resizedImage});
                                       } catch (error) {
                                           console.error("Error processing image", error);
                                           alert("图片处理失败");
                                       }
                                   }
                               }} 
                           />
                       </label>
                   </div>

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

                   <div>
                       <label className="text-xs font-bold text-gray-500 mb-1 block">商品分类</label>
                       <div className="flex gap-2">
                           {['服饰', '抱枕', '礼品'].map(cat => (
                               <button 
                                   key={cat}
                                   onClick={() => setEditingProduct({...editingProduct, category: cat})}
                                   className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${editingProduct.category === cat ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-500 border-gray-200'}`}
                               >
                                   {cat}
                               </button>
                           ))}
                       </div>
                   </div>

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
                       if (!editingProduct.name) {
                           alert('请输入商品名称');
                           return;
                       }
                       let updatedProducts = [...products];
                       const index = updatedProducts.findIndex(p => p.id === editingProduct.id);
                       if (index > -1) {
                           updatedProducts[index] = editingProduct;
                       } else {
                           updatedProducts.push(editingProduct); 
                       }
                       
                       try {
                           localStorage.setItem('vr_global_products', JSON.stringify(updatedProducts));
                           setProducts(updatedProducts);
                           window.dispatchEvent(new Event('storage_update'));
                           setEditingProduct(null);
                           onShowToast('商品信息已更新');
                       } catch (e) {
                           alert('存储空间不足，图片可能过大，请尝试上传更小的图片。');
                           console.error('LocalStorage quota exceeded', e);
                       }
                   }}
                   className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-200 active:scale-95 transition-all mt-4"
               >
                   保存更改
               </button>
           </div>
        </div>
      )}

      {/* Refund Confirmation Modal */}
      {refundTicket && (
        <div className="absolute inset-0 z-[270] flex items-center justify-center p-6 animate-in fade-in">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setRefundTicket(null)}></div>
           <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 relative z-10 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto mb-4 border-4 border-red-50/50">
                    <RotateCcw size={32} />
                </div>
                <h3 className="font-bold text-lg text-slate-800 mb-2">确认撤销</h3>
                <p className="text-sm text-gray-500 mb-6 px-4">
                    是否确认对订单 <span className="font-mono font-bold text-gray-800">{refundTicket.id}</span> 进行撤销操作？
                    <br/><span className="text-xs text-red-400 mt-1 block">此操作不可撤销</span>
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setRefundTicket(null)}
                        className="flex-1 py-3 rounded-xl bg-gray-100 font-bold text-gray-600 text-sm hover:bg-gray-200"
                    >
                        取消
                    </button>
                    <button 
                        onClick={handleRefundConfirm}
                        className="flex-1 py-3 rounded-xl bg-red-600 font-bold text-white text-sm shadow-lg shadow-red-200 active:scale-95 transition-all"
                    >
                        确认撤销
                    </button>
                </div>
           </div>
        </div>
      )}
    </>
  );
};

export default StaffMerchView;