import React, { useState, useEffect } from 'react';
import { Home, User, Ticket, Calendar, ChevronRight, MapPin, ScanLine, Gift, Clock, Star, X, Music, ArrowLeft, Users, CheckCircle, CreditCard, ChevronLeft, CalendarDays, Settings, PieChart, BarChart, QrCode, LogOut, RefreshCw, Copy, Filter, Command, PlayCircle, Share, ChevronDown, Edit, Bell, AlertCircle, Share2, ArrowRightLeft, CalendarClock, UserPlus, ShoppingBag, BookOpen, Info, ShoppingCart, PackageCheck, TrendingUp, Activity, Plus, Minus, Store, Sparkles, Wand2, Percent, Save } from 'lucide-react';
import { MerchItem, UserMerchTicket } from '../types';

interface MiniProgramViewProps {
  userType: 'STAFF' | 'GUEST';
  resetTrigger?: number;
  initialAdminTab?: 'TICKETS' | 'DATA' | 'IDENTITY' | 'CONTROL' | 'MERCH';
}

const DEFAULT_PRODUCTS: MerchItem[] = [
  { id: 'p1', name: 'LUMI魔法师徽章', image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop', points: 100, price: 29, stock: 50 },
  { id: 'p2', name: '定制版发光法杖', image: 'https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?w=600&h=800&fit=crop', points: 500, price: 128, stock: 20 },
  { id: 'p3', name: '魔法学院主题斗篷', image: 'https://images.unsplash.com/photo-1519074063912-cd2d042788f6?w=600&h=800&fit=crop', points: 800, price: 299, stock: 15 },
];

const MiniProgramView: React.FC<MiniProgramViewProps> = ({ userType, resetTrigger, initialAdminTab }) => {
  // --- 1. SHARED STATE ---
  const [products, setProducts] = useState<MerchItem[]>(DEFAULT_PRODUCTS);
  const [userMerchTickets, setUserMerchTickets] = useState<UserMerchTicket[]>([]);
  const [offlineSales, setOfflineSales] = useState<any[]>([]);
  const [generatedTickets, setGeneratedTickets] = useState<any[]>([]);
  const [userPoints, setUserPoints] = useState(1200);

  // --- 2. STAFF SPECIFIC STATE ---
  const [adminTab, setAdminTab] = useState<'TICKETS' | 'DATA' | 'IDENTITY' | 'CONTROL' | 'MERCH'>(initialAdminTab || 'TICKETS');
  const [ticketSubTab, setTicketSubTab] = useState<'GENERATE' | 'LIST'>('GENERATE');
  const [merchAdminSubTab, setMerchAdminSubTab] = useState<'MANAGE' | 'SALES' | 'STATS'>('SALES');
  const [editingProduct, setEditingProduct] = useState<MerchItem | null>(null);

  // --- 3. GUEST SPECIFIC STATE ---
  const [activeTab, setActiveTab] = useState<'HOME' | 'MINE'>('HOME');
  const [mineView, setMineView] = useState<'MENU' | 'TICKETS' | 'SESSIONS' | 'MERCH' | 'COUPONS'>('MENU');
  const [showIntro, setShowIntro] = useState(false);
  const [showStore, setShowStore] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MerchItem | null>(null);
  const [confirmMethod, setConfirmMethod] = useState<'PURCHASE' | 'POINTS'>('PURCHASE');
  const [confirmQuantity, setConfirmQuantity] = useState(1);
  const [mineBadge, setMineBadge] = useState(false);
  const [homeStore] = useState('北京·ClubMedJoyview延庆度假村');

  // --- 4. DATA SYNC LOGIC ---
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
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage_update', loadData);
    return () => window.removeEventListener('storage_update', loadData);
  }, []);

  useEffect(() => {
    if (initialAdminTab) setAdminTab(initialAdminTab);
  }, [initialAdminTab]);

  const saveProducts = (newProducts: MerchItem[]) => {
    setProducts(newProducts);
    localStorage.setItem('vr_global_products', JSON.stringify(newProducts));
    window.dispatchEvent(new Event('storage_update'));
  };

  // --- 5. STAFF VIEW RENDERERS ---
  const renderAdminTickets = () => (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in">
       <div className="bg-white p-2 mx-4 mt-4 mb-2 rounded-lg flex shadow-sm border border-gray-100 shrink-0">
         <button onClick={() => setTicketSubTab('GENERATE')} className={`flex-1 py-2 text-xs font-bold rounded-md ${ticketSubTab === 'GENERATE' ? 'bg-purple-100 text-purple-700' : 'text-gray-500'}`}>生成票券</button>
         <button onClick={() => setTicketSubTab('LIST')} className={`flex-1 py-2 text-xs font-bold rounded-md ${ticketSubTab === 'LIST' ? 'bg-purple-100 text-purple-700' : 'text-gray-500'}`}>票券列表</button>
       </div>
       <div className="flex-1 p-4 overflow-y-auto space-y-4 no-scrollbar">
         {ticketSubTab === 'GENERATE' ? (
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h3 className="font-bold mb-4 flex items-center gap-2 text-sm text-purple-600"><Ticket size={18} /> 配置新票券</h3>
             <div className="grid grid-cols-2 gap-3 mb-6">
                {[1,2,3,4].map(n => <button key={n} className="border-2 border-gray-100 p-4 rounded-xl text-center hover:border-purple-500 transition-all"><Users size={20} className="mx-auto mb-1 text-gray-400" /><div className="text-xs font-bold">{n}人票</div></button>)}
             </div>
             <button className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl shadow-lg">生成并发送</button>
           </div>
         ) : (
           <div className="space-y-2">
             {generatedTickets.length > 0 ? generatedTickets.map(t => (
               <div key={t.id} className="bg-white p-3 rounded-lg border flex justify-between items-center shadow-sm">
                 <div><div className="font-bold text-sm">{t.type}</div><div className="text-[10px] text-gray-400">{t.code}</div></div>
                 <div className="text-xs text-green-600 font-bold">{t.status === 'ACTIVE' ? '有效' : '已用'}</div>
               </div>
             )) : <div className="text-center py-20 text-gray-300 text-xs">暂无生成记录</div>}
           </div>
         )}
       </div>
    </div>
  );

  const renderAdminData = () => (
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
  );

  const renderAdminControl = () => (
    <div className="flex flex-col h-full bg-slate-50 p-4 overflow-y-auto space-y-3 no-scrollbar animate-in fade-in">
      <div className="bg-purple-600 p-4 rounded-xl text-white flex justify-between items-center shadow-lg shadow-purple-200">
        <div><div className="text-xs opacity-80">当前正在进行</div><div className="text-lg font-bold">LUMI魔法学院·02场</div></div>
        <Activity size={24} className="animate-pulse" />
      </div>
      {[1,2,3,4,5].map(n => (
        <div key={n} className="bg-white p-3 rounded-lg border flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center font-bold text-gray-400">{n}</div>
            <div><div className="text-xs font-bold text-gray-700">14:00 - 14:30 场</div><div className="text-[10px] text-gray-400">2/4人已签到</div></div>
          </div>
          <button className="bg-purple-100 text-purple-700 text-[10px] px-3 py-1.5 rounded font-bold">后台操作</button>
        </div>
      ))}
    </div>
  );

  const renderAdminIdentity = () => (
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
                   <img src={p.image} className="w-12 h-12 rounded object-cover shadow-sm" />
                   <div className="flex-1">
                     <div className="text-sm font-bold">{p.name}</div>
                     <div className="text-[10px] text-gray-400">¥{p.price} / {p.points}pts / 库存:{p.stock || 0}</div>
                   </div>
                   <button onClick={() => setEditingProduct(p)} className="text-purple-600 text-xs font-bold flex items-center gap-1 bg-purple-50 px-2 py-1.5 rounded">
                     <Edit size={14} /> 编辑
                   </button>
                </div>
              ))}
              <button className="w-full border-2 border-dashed border-gray-200 py-3 rounded-xl text-gray-400 text-xs font-bold">+ 上架新商品</button>
           </div>
        )}
        {merchAdminSubTab === 'SALES' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2 px-1"><Ticket size={12}/> 待处理核销</h4>
              <div className="space-y-3">
                {userMerchTickets.filter(t => t.status === 'PENDING').map(ticket => (
                  <div key={ticket.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-1"><span className="font-bold text-gray-800 text-sm">{ticket.productName}</span><span className="text-[10px] px-2 py-0.5 rounded bg-orange-100 text-orange-600">待核销</span></div>
                    <div className="text-[10px] text-gray-400 mb-4">券码: {ticket.id}</div>
                    <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-xs font-bold shadow-md shadow-blue-100">确认兑换</button>
                  </div>
                ))}
                {userMerchTickets.filter(t => t.status === 'PENDING').length === 0 && <div className="text-center py-10 text-gray-300 text-xs">暂无待处理订单</div>}
              </div>
            </div>
          </div>
        )}
        {merchAdminSubTab === 'STATS' && (
          <div className="space-y-4">
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
          </div>
        )}
      </div>

      {editingProduct && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingProduct(null)}></div>
          <div className="bg-white w-full rounded-2xl p-6 relative shadow-2xl animate-in zoom-in-95">
             <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-lg">编辑商品信息</h3><X size={20} className="text-gray-400 cursor-pointer" onClick={() => setEditingProduct(null)}/></div>
             <div className="space-y-4">
               <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400">商品名称</label><input type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
               <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400">价格 (¥)</label><input type="number" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                 <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400">库存</label><input type="number" value={editingProduct.stock || 0} onChange={e => setEditingProduct({...editingProduct, stock: Number(e.target.value)})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
               </div>
               <button onClick={() => {
                 const updated = products.map(p => p.id === editingProduct.id ? editingProduct : p);
                 saveProducts(updated);
                 setEditingProduct(null);
               }} className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl mt-4 flex items-center justify-center gap-2"><Save size={18}/> 保存同步</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );

  // --- 6. MAIN RENDER LOGIC ---
  if (userType === 'STAFF') {
    return (
      <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
        {/* Staff Header */}
        <div className="bg-white px-4 py-3 flex justify-between items-center shadow-sm z-10 shrink-0 border-b border-gray-100">
          <div className="font-bold text-lg text-gray-800">前店管理工作台</div>
          <div className="text-[10px] px-2 py-1 bg-purple-100 text-purple-700 rounded-full border border-purple-200 font-black tracking-wider uppercase">Staff Mode</div>
        </div>

        {/* Staff Content Area */}
        <div className="flex-1 relative overflow-hidden">
          {adminTab === 'TICKETS' && renderAdminTickets()}
          {adminTab === 'DATA' && renderAdminData()}
          {adminTab === 'CONTROL' && renderAdminControl()}
          {adminTab === 'IDENTITY' && renderAdminIdentity()}
          {adminTab === 'MERCH' && renderAdminMerch()}
        </div>

        {/* Staff Bottom Nav */}
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
      </div>
    );
  }

  // --- 7. GUEST VIEW LOGIC (UNTOUCHED BUT SEPARATED) ---
  const GuestHome = () => (
    <div className="flex flex-col h-full">
      <div className="relative h-64 w-full">
        <img src="https://images.unsplash.com/photo-1626379953822-baec19c3accd?q=80&w=1000" className="w-full h-full object-cover" alt="Banner" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
        <div className="absolute top-4 left-4 z-20">
            <div className="flex items-center gap-1 text-white bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
              <MapPin size={12} /><span className="text-xs font-bold max-w-[120px] truncate">{homeStore}</span>
            </div>
        </div>
        <div className="absolute bottom-4 left-4 text-white">
          <div className="text-[10px] font-bold bg-orange-500/90 backdrop-blur-sm px-2 py-0.5 rounded inline-block mb-2">XR大空间旗舰店</div>
          <h1 className="text-2xl font-bold leading-tight tracking-tight">LUMI魔法学院<br />沉浸式奇幻之旅</h1>
        </div>
      </div>

      <div className="px-4 mt-4 relative z-10 grid grid-cols-2 gap-3 mb-6">
        <button className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-xl h-28 flex flex-col justify-center relative overflow-hidden active:scale-95 transition-transform">
          <CalendarDays size={24} className="mb-2" />
          <div className="font-bold text-lg">预约购票</div>
          <div className="text-[10px] opacity-70">开启冒险</div>
        </button>
        <button className="bg-white rounded-2xl p-4 text-gray-800 shadow-lg border border-gray-50 h-28 flex flex-col justify-center active:scale-95 transition-transform">
          <Gift size={24} className="mb-2 text-purple-500" />
          <div className="font-bold text-lg">兑换体验券</div>
          <div className="text-[10px] text-gray-400">使用邀请码</div>
        </button>
      </div>

      <div className="px-4 space-y-6 mb-10">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1"><h3 className="font-bold text-gray-800 flex items-center gap-1.5"><ShoppingCart size={16} className="text-purple-500" /> 周边商城</h3><button onClick={() => setShowStore(true)} className="text-[10px] font-bold text-purple-500">更多好物</button></div>
          <button onClick={() => setShowStore(true)} className="relative w-full h-36 rounded-2xl overflow-hidden shadow-md group active:scale-[0.98] transition-all"><img src="https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&fit=crop" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-indigo-900/80 to-transparent"></div><div className="absolute inset-0 p-5 flex flex-col justify-center text-left"><div className="text-xs text-indigo-200 font-bold mb-1 flex items-center gap-1"><Sparkles size={12}/> 魔法匠心</div><div className="text-xl font-bold text-white mb-1">魔法学院周边上新</div><div className="text-[10px] text-white/70 line-clamp-2 max-w-[200px]">正版定制徽章、发光法杖、学院斗篷... 支持积分超值兑换。</div></div></button>
        </div>
        <div className="flex flex-col gap-3 opacity-90">
          <div className="flex items-center justify-between px-1"><h3 className="font-bold text-gray-800 flex items-center gap-1.5"><Sparkles size={16} className="text-blue-500" /> 项目介绍</h3><button onClick={() => setShowIntro(true)} className="text-[10px] font-bold text-blue-500">查看详情</button></div>
          <button onClick={() => setShowIntro(true)} className="relative w-full h-32 rounded-2xl overflow-hidden shadow-md group active:scale-[0.98] transition-all border border-blue-50"><img src="https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=600" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent"></div><div className="absolute inset-0 p-4 flex flex-col justify-center text-left"><div className="text-xs text-blue-200 font-bold mb-1 flex items-center gap-1"><BookOpen size={12}/> 魔法史诗</div><div className="text-lg font-bold text-white mb-1">探索魔法学院奥秘</div><div className="text-[10px] text-white/70 line-clamp-2 max-w-[180px]">在300平米物理空间内，开启属于你的魔法传奇...</div></div></button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        {activeTab === 'HOME' ? <GuestHome /> : (
          <div>
            {mineView === 'MENU' && (
              <div className="flex flex-col">
                <div className="bg-blue-600 pt-10 pb-16 px-6 text-white rounded-b-[3rem] relative overflow-hidden"><div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div><div className="relative z-10 flex items-center gap-5 mt-4"><div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl shadow-2xl border-4 border-blue-400">👨‍🚀</div><div><h2 className="text-2xl font-bold">天选体验官</h2><div className="flex items-center gap-2 mt-1"><span className="bg-blue-500/50 px-2 py-0.5 rounded-full text-[10px] border border-blue-300">钻石学徒</span><span className="text-blue-100 text-xs font-bold">积分: {userPoints}</span></div></div></div></div>
                <div className="px-5 -mt-8 relative z-10 space-y-4">
                  <div className="bg-white rounded-2xl shadow-xl border border-white overflow-hidden divide-y divide-gray-50">
                    <button className="w-full p-5 flex items-center justify-between hover:bg-gray-50"><div className="flex items-center gap-4"><Ticket size={20} className="text-blue-500"/> <span className="font-bold text-gray-700">我的票券</span></div><ChevronRight size={18} className="text-gray-300"/></button>
                    <button onClick={() => setMineView('COUPONS')} className="w-full p-5 flex items-center justify-between hover:bg-gray-50"><div className="flex items-center gap-4"><Percent size={20} className="text-orange-500"/> <span className="font-bold text-gray-700">我的优惠券</span></div><ChevronRight size={18} className="text-gray-300"/></button>
                    <button className="w-full p-5 flex items-center justify-between hover:bg-gray-50"><div className="flex items-center gap-4"><Calendar size={20} className="text-emerald-500"/> <span className="font-bold text-gray-700">我的场次</span></div><ChevronRight size={18} className="text-gray-300"/></button>
                    <button onClick={() => setMineView('MERCH')} className="w-full p-5 flex items-center justify-between hover:bg-gray-50"><div className="flex items-center gap-4"><ShoppingBag size={20} className="text-purple-500"/> <span className="font-bold text-gray-700">我的周边商品</span></div><div className="flex items-center gap-2">{userMerchTickets.filter(t => t.status === 'PENDING').length > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">{userMerchTickets.filter(t => t.status === 'PENDING').length}</span>}<ChevronRight size={18} className="text-gray-300"/></div></button>
                  </div>
                </div>
              </div>
            )}
            {mineView === 'MERCH' && (
              <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right">
                <div className="bg-white p-4 flex items-center border-b sticky top-0 z-10 shadow-sm"><button onClick={() => setMineView('MENU')} className="p-1 hover:bg-gray-100 rounded-full"><ChevronLeft size={24} /></button><h2 className="flex-1 text-center font-bold">我的周边商品</h2><div className="w-8"></div></div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20">{userMerchTickets.map(ticket => (<div key={ticket.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"><div className="flex justify-between items-start mb-2"><span className="font-bold text-gray-800 text-sm">{ticket.productName}</span><span className={`text-[10px] px-2 py-0.5 rounded ${ticket.status === 'PENDING' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>{ticket.status === 'PENDING' ? '待核销' : '已核销'}</span></div><div className="text-[10px] text-gray-400 mb-4">券码: {ticket.id}</div>{ticket.status === 'PENDING' && <button className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-xs font-bold shadow-md shadow-blue-100">出示核销码</button>}</div>))}</div>
              </div>
            )}
            {mineView === 'COUPONS' && (
              <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right">
                <div className="bg-white p-4 flex items-center border-b sticky top-0 z-10 shadow-sm"><button onClick={() => setMineView('MENU')} className="p-1 hover:bg-gray-100 rounded-full"><ChevronLeft size={24} /></button><h2 className="flex-1 text-center font-bold">我的优惠券</h2><div className="w-8"></div></div>
                <div className="p-4 space-y-4"><div className="bg-white border-l-8 border-orange-500 rounded-xl p-4 shadow-sm flex justify-between items-center"><div className="text-lg font-bold text-orange-600">￥50 满减券</div><button className="bg-orange-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full">去使用</button></div></div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="absolute bottom-0 w-full h-18 bg-white border-t flex justify-around items-center px-6 pb-2 shrink-0 z-40">
        <button onClick={() => setActiveTab('HOME')} className={`flex flex-col items-center gap-1.5 ${activeTab === 'HOME' ? 'text-blue-600' : 'text-gray-400'}`}><Home size={22} /><span className="text-[10px] font-bold">首页</span></button>
        <div className="relative -top-5"><button className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white active:scale-90 transition-transform"><ScanLine size={24} /></button></div>
        <button onClick={() => setActiveTab('MINE')} className={`flex flex-col items-center gap-1.5 ${activeTab === 'MINE' ? 'text-blue-600' : 'text-gray-400'}`}><User size={22} /><span className="text-[10px] font-bold">我的</span></button>
      </div>

      {showStore && (
        <div className="absolute inset-0 z-[120] bg-gray-50 animate-in slide-in-from-bottom flex flex-col">
          <div className="bg-white p-4 flex items-center border-b shadow-sm"><button onClick={() => setShowStore(false)} className="p-1 rounded-full"><ChevronLeft size={24} /></button><h2 className="flex-1 text-center font-bold">周边商城</h2><div className="w-8"></div></div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">{products.map(product => (<div key={product.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex gap-4"><img src={product.image} className="w-24 h-24 rounded-lg object-cover bg-gray-100" /><div className="flex-1 flex flex-col justify-between py-1"><div><h4 className="font-bold text-gray-800 text-sm">{product.name}</h4><div className="flex items-center gap-3 mt-1.5"><span className="text-xs text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded">{product.points} 分</span><span className="text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded">¥{product.price}</span></div></div><div className="flex gap-2 mt-3"><button className="flex-1 bg-white text-purple-600 text-[10px] font-bold py-2 rounded-lg border border-purple-200">积分兑换</button><button className="flex-1 bg-purple-600 text-white text-[10px] font-bold py-2 rounded-lg">付费购买</button></div></div></div>))}</div>
        </div>
      )}

      {showIntro && (
        <div className="absolute inset-0 z-[110] bg-white animate-in slide-in-from-bottom flex flex-col">
          <div className="p-4 flex items-center border-b"><button onClick={() => setShowIntro(false)} className="p-1 rounded-full"><ChevronLeft size={24} /></button><h2 className="flex-1 text-center font-bold">项目介绍</h2><div className="w-8"></div></div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6"><img src="https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=600" className="rounded-xl w-full h-48 object-cover shadow-lg" /><section><h3 className="font-bold text-lg mb-2 text-purple-600">剧情背景</h3><p className="text-sm text-gray-600 leading-relaxed italic border-l-4 border-purple-200 pl-4">"在星辉交织的深夜，古老的LUMI学院钟声敲响。当现实与幻象的边界模糊，你作为天选学徒，将穿梭于破碎的时空缝隙中..."</p></section></div>
        </div>
      )}
    </div>
  );
};

export default MiniProgramView;