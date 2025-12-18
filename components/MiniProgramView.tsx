import React, { useState, useEffect, useRef } from 'react';
import { Home, User, Ticket, Calendar, ChevronRight, MapPin, ScanLine, Gift, Clock, Star, X, Music, ArrowLeft, Users, CheckCircle, CreditCard, ChevronLeft, CalendarDays, Settings, PieChart, BarChart, QrCode, LogOut, RefreshCw, Copy, Filter, Command, PlayCircle, Share, ChevronDown, Edit, Bell, AlertCircle, Share2, ArrowRightLeft, CalendarClock, UserPlus, ShoppingBag, BookOpen, Info, ShoppingCart, PackageCheck, TrendingUp, Activity, Plus, Minus, Store, Sparkles, Wand2, Percent, Save, Image as ImageIcon, PlusCircle, Upload, Box, TicketCheck, History, Wallet, Trophy, ShieldCheck, Search, FileText, Phone } from 'lucide-react';
import { MerchItem, UserMerchTicket } from '../types';

interface MiniProgramViewProps {
  userType: 'STAFF' | 'GUEST';
  resetTrigger?: number;
  initialAdminTab?: 'TICKETS' | 'DATA' | 'IDENTITY' | 'CONTROL' | 'MERCH';
}

const DEFAULT_PRODUCTS: MerchItem[] = [
  { id: 'p1', name: 'LUMI魔法师徽章', image: 'https://images.unsplash.com/photo-1635273051937-20083c27da1d?w=400&h=400&fit=crop', points: 100, price: 29, stock: 50 },
  { id: 'p2', name: '定制版发光法杖', image: 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=600&h=800&fit=crop', points: 500, price: 128, stock: 20 },
  { id: 'p3', name: '魔法学院主题斗篷', image: 'https://images.unsplash.com/photo-1517462964-21fdcec3f25b?w=600&h=800&fit=crop', points: 800, price: 299, stock: 15 },
];

const MiniProgramView: React.FC<MiniProgramViewProps> = ({ userType, resetTrigger, initialAdminTab }) => {
  // --- 1. SHARED DATA STATE ---
  const [products, setProducts] = useState<MerchItem[]>(DEFAULT_PRODUCTS);
  const [userMerchTickets, setUserMerchTickets] = useState<UserMerchTicket[]>([]);
  const [offlineSales, setOfflineSales] = useState<any[]>([]);
  const [generatedTickets, setGeneratedTickets] = useState<any[]>([]);
  const [userPoints, setUserPoints] = useState(1200);

  // --- 2. STAFF STATE ---
  const [adminTab, setAdminTab] = useState<'TICKETS' | 'DATA' | 'IDENTITY' | 'CONTROL' | 'MERCH'>(initialAdminTab || 'TICKETS');
  const [ticketSubTab, setTicketSubTab] = useState<'GENERATE' | 'LIST'>('GENERATE');
  const [merchAdminSubTab, setMerchAdminSubTab] = useState<'MANAGE' | 'SALES' | 'STATS'>('SALES');
  const [editingProduct, setEditingProduct] = useState<MerchItem | null>(null);
  const [adminSessions, setAdminSessions] = useState([
    { id: 1, time: '14:00 - 14:30', count: 2, status: 'WAITING' },
    { id: 2, time: '14:30 - 15:00', count: 4, status: 'WAITING' },
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 3. GUEST STATE ---
  const [activeTab, setActiveTab] = useState<'HOME' | 'MINE'>('HOME');
  const [mineView, setMineView] = useState<'MENU' | 'TICKETS' | 'SESSIONS' | 'MERCH' | 'COUPONS'>('TICKETS');
  const [showIntro, setShowIntro] = useState(false);
  const [showStore, setShowStore] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MerchItem | null>(null);
  const [confirmMethod, setConfirmMethod] = useState<'PURCHASE' | 'POINTS'>('PURCHASE');
  const [confirmQuantity, setConfirmQuantity] = useState(1);
  const [homeStore] = useState('北京·ClubMedJoyview延庆度假村');

  // Flows
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [bookingDateIdx, setBookingDateIdx] = useState(0);
  const [bookingTime, setBookingTime] = useState<string | null>(null);
  const [bookingGuests, setBookingGuests] = useState(1);
  const [showRedeemFlow, setShowRedeemFlow] = useState(false);
  const [redeemCode, setRedeemCode] = useState('');

  // --- 4. DATA SYNC ---
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

  useEffect(() => {
      // If reset trigger happens, reset guest view
      if (resetTrigger) {
          setActiveTab('HOME');
          setMineView('TICKETS');
      }
  }, [resetTrigger]);

  const saveProducts = (newProducts: MerchItem[]) => {
    setProducts(newProducts);
    localStorage.setItem('vr_global_products', JSON.stringify(newProducts));
    window.dispatchEvent(new Event('storage_update'));
  };

  const handleTransferToBackstage = (session: { id: number; time: string; count: number; status: string }) => {
    setAdminSessions(prev => prev.map(s => s.id === session.id ? { ...s, status: 'TRANSFERRED' } : s));
    
    const storedBackstage = localStorage.getItem('vr_backstage_data');
    const currentBackstage = storedBackstage ? JSON.parse(storedBackstage) : [];
    
    const newItem = {
        id: `SESSION_${session.id}_${Date.now()}`,
        timeStr: session.time,
        location: homeStore,
        peopleCount: session.count,
        status: 'UPCOMING',
        userName: '现场团客'
    };
    
    localStorage.setItem('vr_backstage_data', JSON.stringify([...currentBackstage, newItem]));
    window.dispatchEvent(new Event('storage_update'));
    window.dispatchEvent(new Event('session_transferred_to_backstage'));
    
    alert(`场次 [${session.time}] 已转入后厅系统`);
  };

  // --- 5. GUEST RENDERERS ---
  const GuestHome = () => (
    <div className="flex flex-col bg-white pb-32">
      {/* Banner */}
      <div className="relative h-72 w-full shrink-0">
        <img src="https://images.unsplash.com/photo-1626379953822-baec19c3accd?q=80&w=1000" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
        <div className="absolute top-4 left-4 z-20"><div className="flex items-center gap-1 text-white bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20"><MapPin size={12} /><span className="text-xs font-bold max-w-[120px] truncate">{homeStore}</span></div></div>
        <div className="absolute bottom-6 left-6 text-white"><div className="text-[10px] font-bold bg-purple-500/90 backdrop-blur-sm px-2 py-0.5 rounded inline-block mb-2 shadow-lg shadow-purple-900/50">XR大空间旗舰店</div><h1 className="text-3xl font-black leading-tight drop-shadow-md">LUMI魔法学院<br />沉浸式奇幻之旅</h1></div>
      </div>
      
      {/* Quick Actions */}
      <div className="px-5 -mt-8 relative z-10 grid grid-cols-2 gap-4">
        <button 
          onClick={() => {
            setBookingDateIdx(0);
            setBookingTime(null);
            setBookingGuests(1);
            setShowBookingFlow(true);
          }}
          className="bg-white rounded-[2rem] p-5 shadow-xl shadow-slate-200 border border-slate-100 flex flex-col justify-between h-40 active:scale-95 transition-transform text-left group overflow-hidden relative"
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-110 transition-transform"></div>
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center relative z-10 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors"><CalendarDays size={24} /></div>
          <div className="relative z-10">
            <div className="font-black text-lg text-slate-800">预约购票</div>
            <div className="text-[10px] text-slate-400 mt-1">沉浸式奇幻体验</div>
          </div>
        </button>
        <button 
          onClick={() => {
            setRedeemCode('');
            setShowRedeemFlow(true);
          }}
          className="bg-white rounded-[2rem] p-5 shadow-xl shadow-slate-200 border border-slate-100 flex flex-col justify-between h-40 active:scale-95 transition-transform text-left group overflow-hidden relative"
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 rounded-full group-hover:scale-110 transition-transform"></div>
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center relative z-10 shadow-sm group-hover:bg-purple-600 group-hover:text-white transition-colors"><Gift size={24} /></div>
          <div className="relative z-10">
            <div className="font-black text-lg text-slate-800">兑换体验券</div>
            <div className="text-[10px] text-slate-400 mt-1">魔法验证码兑换</div>
          </div>
        </button>
      </div>

      {/* Main Content Sections */}
      <div className="px-5 mt-8 space-y-8">
        {/* Merch Store Module */}
        <section>
          <div className="flex items-center justify-between px-1 mb-4">
            <h3 className="font-black text-slate-800 flex items-center gap-2 text-lg"><ShoppingBag size={20} className="text-purple-600" /> 周边商城</h3>
            <button onClick={() => setShowStore(true)} className="text-xs font-bold text-slate-400 hover:text-purple-600">更多好物 ></button>
          </div>
          <button onClick={() => setShowStore(true)} className="relative w-full h-48 rounded-[2rem] overflow-hidden shadow-2xl active:scale-[0.98] transition-all group">
            <img src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/40 to-transparent"></div>
            <div className="absolute inset-0 p-8 flex flex-col justify-center text-white">
              <div className="text-xs text-purple-300 font-black mb-2 flex items-center gap-1 uppercase tracking-widest"><Sparkles size={12}/> Artisan Magic</div>
              <div className="text-3xl font-black mb-2">魔法学院<br/>周边上新</div>
              <div className="text-[10px] opacity-80 max-w-[150px] leading-relaxed">让魔法带回家，收藏属于你的回忆</div>
            </div>
          </button>
        </section>

        {/* Project Intro Module */}
        <section>
          <div className="flex items-center justify-between px-1 mb-4">
            <h3 className="font-black text-slate-800 flex items-center gap-2 text-lg"><BookOpen size={20} className="text-blue-600" /> 项目介绍</h3>
            <button onClick={() => setShowIntro(true)} className="text-xs font-bold text-slate-400 hover:text-blue-600">了解详情 ></button>
          </div>
          <button onClick={() => setShowIntro(true)} className="relative w-full h-40 rounded-[2rem] overflow-hidden shadow-xl group active:scale-[0.98] transition-all border border-slate-100">
            <img src="https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=600" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 text-left w-full">
              <div className="text-xl font-black text-white mb-1 flex items-center gap-2">探索魔法学院奥秘 <ChevronRight size={16} className="text-white/50"/></div>
              <div className="text-[10px] text-white/70 truncate">在300平米物理空间内，开启属于你的魔法传奇</div>
            </div>
          </button>
        </section>

        {/* Member Benefits */}
        <section className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
          <h3 className="font-black text-slate-800 flex items-center gap-2 mb-4"><Trophy size={18} className="text-amber-500" /> 会员尊享权益</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center mb-3 shadow-inner"><Percent size={20}/></div>
              <div className="text-sm font-bold text-slate-800">消费返利</div>
              <div className="text-[10px] text-slate-400 mt-1">每单最高返10%积分</div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center mb-3 shadow-inner"><ShieldCheck size={20}/></div>
              <div className="text-sm font-bold text-slate-800">优先预约</div>
              <div className="text-[10px] text-slate-400 mt-1">热门场次提前24小时</div>
            </div>
          </div>
        </section>

        {/* Hot Events */}
        <section>
          <div className="flex items-center justify-between px-1 mb-4">
            <h3 className="font-black text-slate-800 flex items-center gap-2 text-lg"><TrendingUp size={20} className="text-rose-500" /> 热门推荐</h3>
          </div>
          <div className="space-y-4">
            {[
              { title: '魔法觉醒：新手试炼', time: '15:30 可预约', price: '¥128', img: 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=600&h=400&fit=crop' },
              { title: '禁忌森林：深度冒险', time: '19:00 可预约', price: '¥258', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=400&fit=crop' }
            ].map((event, i) => (
              <div key={i} className="flex gap-4 bg-white p-3 rounded-[1.5rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer">
                <img src={event.img} className="w-24 h-24 rounded-2xl object-cover bg-slate-100" />
                <div className="flex-1 flex flex-col justify-between py-2 pr-2">
                  <div>
                    <div className="font-bold text-sm text-slate-800">{event.title}</div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1"><Clock size={10}/> {event.time}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-rose-600 font-black text-lg">{event.price}</span>
                    <button className="bg-slate-900 text-white text-[10px] px-3 py-1.5 rounded-full font-bold">预约</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );

  const GuestMine = () => {
    // Ensure default tab is valid if coming from a stale state
    useEffect(() => {
        if (mineView === 'MENU') setMineView('TICKETS');
    }, []);

    return (
        <div className="flex flex-col h-full bg-[#f6f7f9]">
            {/* Header Area with Gradient */}
            <div className="bg-gradient-to-b from-blue-100 to-white pt-12 pb-4 px-6 relative">
                 <div className="flex justify-between items-start mb-6">
                     <div className="flex items-center gap-4">
                         <img src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop" className="w-16 h-16 rounded-full border-2 border-white shadow-md object-cover" />
                         <div>
                             <div className="text-lg font-bold text-gray-800">微信名称</div>
                         </div>
                     </div>
                     <div className="flex gap-4">
                         <button className="flex flex-col items-center gap-1 text-gray-600">
                             <FileText size={20} />
                             <span className="text-[10px] scale-90">开发票</span>
                         </button>
                         <button className="flex flex-col items-center gap-1 text-gray-600">
                             <Phone size={20} />
                             <span className="text-[10px] scale-90">联系客服</span>
                         </button>
                         <button className="flex flex-col items-center gap-1 text-gray-600">
                             <Settings size={20} />
                             <span className="text-[10px] scale-90">设置</span>
                         </button>
                     </div>
                 </div>

                 {/* Tabs */}
                 <div className="flex justify-around items-center relative">
                     <button onClick={() => setMineView('SESSIONS')} className={`pb-2 text-sm font-bold relative transition-colors ${mineView === 'SESSIONS' ? 'text-gray-900' : 'text-gray-400'}`}>
                         我的场次
                         {mineView === 'SESSIONS' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-blue-500 rounded-full"></div>}
                     </button>
                     <button onClick={() => setMineView('TICKETS')} className={`pb-2 text-sm font-bold relative transition-colors ${mineView === 'TICKETS' ? 'text-gray-900' : 'text-gray-400'}`}>
                         我的票券
                         {mineView === 'TICKETS' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-blue-500 rounded-full"></div>}
                     </button>
                     <button onClick={() => setMineView('COUPONS')} className={`pb-2 text-sm font-bold relative transition-colors ${mineView === 'COUPONS' ? 'text-gray-900' : 'text-gray-400'}`}>
                         我的优惠券
                         {mineView === 'COUPONS' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-blue-500 rounded-full"></div>}
                     </button>
                     <button onClick={() => setMineView('MERCH')} className={`pb-2 text-sm font-bold relative transition-colors ${mineView === 'MERCH' ? 'text-gray-900' : 'text-gray-400'}`}>
                         我的周边
                         {mineView === 'MERCH' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-blue-500 rounded-full"></div>}
                     </button>
                 </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
                {mineView === 'TICKETS' && (
                    <>
                        {/* Card 1: Pending */}
                        <div className="bg-white rounded-xl overflow-hidden shadow-sm relative">
                            <div className="flex justify-between items-center p-3 pb-0">
                                <div className="flex items-center gap-2">
                                     <span className="bg-blue-500 text-white text-[10px] px-2 py-1 rounded-tr-lg rounded-bl-lg font-bold">待使用票券</span>
                                     <span className="text-[10px] text-gray-400 font-mono">123422343234</span>
                                </div>
                                <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full">有效期30天</span>
                            </div>
                            <div className="p-4 pt-3">
                                <div className="space-y-2 text-xs text-gray-500 mb-3">
                                    <div className="flex justify-between"><span>票券类型：</span><span className="text-gray-800 font-bold">【官方购买】单人票</span></div>
                                    <div className="flex justify-between"><span>兑换时间：</span><span className="text-gray-800">2025-6-17 13:22</span></div>
                                    <div className="flex justify-between"><span>所属门店：</span><span className="text-gray-800">北京·ClubMedJoyview延庆度假村</span></div>
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <button className="border border-gray-300 text-gray-400 text-xs px-3 py-1.5 rounded disabled:opacity-50">已赠送</button>
                                    <button className="bg-emerald-500 text-white text-xs px-4 py-1.5 rounded font-bold shadow-md shadow-emerald-200">去预约</button>
                                </div>
                            </div>
                        </div>

                         {/* Card 2: Pending with tags */}
                        <div className="bg-white rounded-xl overflow-hidden shadow-sm relative">
                            <div className="flex justify-between items-center p-3 pb-0">
                                <div className="flex items-center gap-2">
                                     <span className="bg-blue-400 text-white text-[10px] px-2 py-1 rounded-tr-lg rounded-bl-lg font-bold">待使用票券</span>
                                     <span className="text-[10px] text-gray-400 font-mono">123422343234</span>
                                </div>
                                <div className="flex gap-1">
                                    <span className="text-[9px] bg-yellow-100 text-orange-500 px-1.5 py-0.5 rounded">🎁 新人优惠活动</span>
                                    <span className="text-[9px] bg-orange-500 text-white px-2 py-0.5 rounded-full">有效期30天</span>
                                </div>
                            </div>
                            <div className="p-4 pt-3">
                                <div className="space-y-2 text-xs text-gray-500">
                                    <div className="flex justify-between"><span>票券类型：</span><span className="text-gray-800 font-bold">【美团】单人票</span></div>
                                    <div className="flex justify-between"><span>场次地点：</span><span className="text-gray-800">2025-6-17 13:22</span></div>
                                    <div className="flex justify-between"><span>所属门店：</span><span className="text-gray-800">北京·ClubMedJoyview延庆度假村</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Card 3: Redeemed */}
                        <div className="bg-white rounded-xl overflow-hidden shadow-sm relative opacity-80">
                             <div className="flex justify-between items-center p-3 pb-0">
                                <div className="flex items-center gap-2">
                                     <span className="bg-emerald-500 text-white text-[10px] px-2 py-1 rounded-tr-lg rounded-bl-lg font-bold">已核销</span>
                                </div>
                            </div>
                            <div className="p-4 pt-3 relative">
                                <div className="space-y-2 text-xs text-gray-500">
                                    <div className="flex justify-between"><span>票券类型：</span><span className="text-gray-800 font-bold">【美团】2人票</span></div>
                                    <div className="flex justify-between"><span>场次地点：</span><span className="text-gray-800">2025-6-17 13:22</span></div>
                                    <div className="flex justify-between"><span>所属门店：</span><span className="text-gray-800">北京·ClubMedJoyview延庆度假村</span></div>
                                </div>
                                {/* Watermark */}
                                <div className="absolute right-4 bottom-2 w-20 h-20 border-2 border-emerald-500 rounded-full flex items-center justify-center text-emerald-500 font-black opacity-20 -rotate-12 text-xl">
                                    已核销
                                </div>
                            </div>
                        </div>

                        {/* Card 4: Expired */}
                        <div className="bg-white rounded-xl overflow-hidden shadow-sm relative grayscale opacity-70">
                             <div className="flex justify-between items-center p-3 pb-0">
                                <div className="flex items-center gap-2">
                                     <span className="bg-gray-500 text-white text-[10px] px-2 py-1 rounded-tr-lg rounded-bl-lg font-bold">已失效</span>
                                </div>
                            </div>
                            <div className="p-4 pt-3 relative">
                                <div className="space-y-2 text-xs text-gray-500">
                                    <div className="flex justify-between"><span>场次时间：</span><span className="text-gray-800 font-bold">【官方购买】单人票</span></div>
                                    <div className="flex justify-between"><span>场次地点：</span><span className="text-gray-800">2025-6-17 13:22</span></div>
                                    <div className="flex justify-between"><span>所属门店：</span><span className="text-gray-800">北京·ClubMedJoyview延庆度假村</span></div>
                                </div>
                                {/* Watermark */}
                                <div className="absolute right-4 bottom-2 w-20 h-20 border-2 border-gray-500 rounded-full flex items-center justify-center text-gray-500 font-black opacity-20 -rotate-12 text-xl">
                                    已失效
                                </div>
                            </div>
                        </div>
                    </>
                )}
                
                {mineView === 'SESSIONS' && (
                    <div className="text-center py-10 opacity-20 flex flex-col items-center">
                        <History size={40} className="mb-2" />
                        <p className="text-xs font-bold uppercase tracking-widest">暂无历史记录</p>
                    </div>
                )}
                {mineView === 'COUPONS' && (
                     <div className="bg-white rounded-2xl shadow-sm border-l-8 border-orange-500 p-5 flex items-center justify-between">
                        <div>
                        <div className="text-2xl font-black text-orange-600">¥20</div>
                        <div className="font-bold text-gray-700 text-sm">满¥199可用 · 周边专享</div>
                        </div>
                        <button className="text-[10px] font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full">去使用</button>
                    </div>
                )}
                {mineView === 'MERCH' && (
                     userMerchTickets.map(ticket => (<div key={ticket.id} className="bg-white p-4 rounded-xl shadow-sm border"><div className="flex justify-between items-start mb-2"><span className="font-bold text-gray-800 text-sm">{ticket.productName}</span><span className={`text-[10px] px-2 py-0.5 rounded ${ticket.status === 'PENDING' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>{ticket.status === 'PENDING' ? '待核销' : '已核销'}</span></div><div className="text-[10px] text-gray-400">券码: {ticket.id}</div></div>))
                )}
            </div>
        </div>
    );
  };

  // --- 6. STAFF RENDERERS ---
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
                {[1,2,3,4].map(n => <button key={n} className="border-2 border-gray-100 p-4 rounded-xl text-center hover:border-purple-500 transition-all"><Users size={20} className="mx-auto mb-1 text-gray-400" /><div className="text-xs font-bold">{n}人票</div></button>)}
             </div>
             <button className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl shadow-lg">生成并发送</button>
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

  // --- 7. FINAL RETURN LOGIC ---
  if (userType === 'STAFF') {
    return (
      <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
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
              <div className="bg-purple-600 p-4 rounded-xl text-white flex justify-between items-center shadow-lg shadow-purple-200">
                <div><div className="text-xs opacity-80">当前正在进行</div><div className="text-lg font-bold">LUMI魔法学院·02场</div></div>
                <Activity size={24} className="animate-pulse" />
              </div>
              <div className="px-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">待转场场次</div>
              {adminSessions.map(session => (
                <div key={session.id} className="bg-white p-3 rounded-lg border flex justify-between items-center shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center font-bold text-gray-400">{session.id}</div>
                    <div><div className="text-xs font-bold text-gray-700">{session.time} 场</div><div className="text-[10px] text-gray-400">{session.count}人已签到</div></div>
                  </div>
                  {session.status === 'TRANSFERRED' ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-[10px] font-bold border border-green-100">
                      <CheckCircle size={12}/> 已转入
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleTransferToBackstage(session)}
                      className="bg-purple-100 text-purple-700 text-[10px] px-3 py-1.5 rounded font-bold flex items-center gap-1 active:scale-95 transition-all"
                    >
                      <ArrowRightLeft size={12}/> 转入后厅
                    </button>
                  )}
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
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        {activeTab === 'HOME' ? <GuestHome /> : <GuestMine />}
      </div>

      <div className="absolute bottom-0 w-full h-18 bg-white border-t flex justify-around items-center px-6 pb-2 shrink-0 z-40">
        <button onClick={() => {setActiveTab('HOME'); setMineView('TICKETS');}} className={`flex flex-col items-center gap-1.5 ${activeTab === 'HOME' ? 'text-blue-600' : 'text-gray-400'}`}><Home size={22} /><span className="text-[10px] font-bold">首页</span></button>
        <div className="relative -top-5"><button className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white active:scale-90 transition-transform"><ScanLine size={24} /></button></div>
        <button onClick={() => setActiveTab('MINE')} className={`flex flex-col items-center gap-1.5 ${activeTab === 'MINE' ? 'text-blue-600' : 'text-gray-400'}`}><User size={22} /><span className="text-[10px] font-bold">我的</span></button>
      </div>

      {showStore && (
        <div className="absolute inset-0 z-[120] bg-gray-50 animate-in slide-in-from-bottom flex flex-col">
          <div className="bg-white p-4 flex items-center border-b shadow-sm"><button onClick={() => setShowStore(false)} className="p-1 rounded-full"><ChevronLeft size={24} /></button><h2 className="flex-1 text-center font-bold">周边商城</h2><div className="w-8"></div></div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex gap-4">
                <div className="relative">
                  <img src={product.image} className="w-24 h-24 rounded-lg object-cover bg-gray-100" />
                  {(!product.stock || product.stock <= 0) && <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center text-white text-[10px] font-bold">已售罄</div>}
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">{product.name}</h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded">{product.points} 分</span>
                      <span className="text-[10px] text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded">¥{product.price}</span>
                      <span className={`text-[9px] flex items-center gap-1 px-1.5 py-0.5 rounded font-bold ${product.stock && product.stock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}><Box size={10} /> {product.stock || 0}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button disabled={!product.stock || product.stock <= 0} onClick={() => { setSelectedProduct(product); setConfirmMethod('POINTS'); setConfirmQuantity(1); setShowConfirmModal(true); }} className={`flex-1 text-[10px] font-bold py-2 rounded-lg border transition-colors ${!product.stock || product.stock <= 0 ? 'bg-gray-50 text-gray-300 border-gray-100' : 'bg-white text-purple-600 border-purple-200 active:bg-purple-50'}`}>积分兑换</button>
                    <button disabled={!product.stock || product.stock <= 0} onClick={() => { setSelectedProduct(product); setConfirmMethod('PURCHASE'); setConfirmQuantity(1); setShowConfirmModal(true); }} className={`flex-1 text-[10px] font-bold py-2 rounded-lg transition-colors ${!product.stock || product.stock <= 0 ? 'bg-gray-100 text-gray-400' : 'bg-purple-600 text-white active:bg-purple-700'}`}>付费购买</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showConfirmModal && selectedProduct && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)}></div>
          <div className="bg-white w-full rounded-2xl p-6 relative shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-lg mb-4 text-center">{confirmMethod === 'PURCHASE' ? '购买确认' : '兑换确认'}</h3>
            <div className="flex items-center gap-4 mb-6 bg-gray-50 p-3 rounded-xl">
               <img src={selectedProduct.image} className="w-16 h-16 rounded-lg object-cover bg-white" />
               <div><div className="text-sm font-bold text-gray-800">{selectedProduct.name}</div><div className="text-[10px] text-gray-400">单价: {confirmMethod === 'PURCHASE' ? `¥${selectedProduct.price}` : `${selectedProduct.points} pts`}</div><div className="text-[10px] text-emerald-600 font-bold mt-1">当前库存: {selectedProduct.stock || 0}</div></div>
            </div>
            <div className="flex items-center justify-between mb-8 px-1">
              <span className="text-sm font-bold text-gray-600">选择数量</span>
              <div className="flex items-center gap-4">
                <button onClick={() => setConfirmQuantity(Math.max(1, confirmQuantity - 1))} className={`w-8 h-8 rounded-full flex items-center justify-center border ${confirmQuantity <= 1 ? 'opacity-30' : ''}`}><Minus size={16}/></button>
                <span className="font-bold w-4 text-center">{confirmQuantity}</span>
                <button onClick={() => setConfirmQuantity(Math.min(selectedProduct.stock || 0, confirmQuantity + 1))} className={`w-8 h-8 rounded-full flex items-center justify-center border ${confirmQuantity >= (selectedProduct.stock || 0) ? 'opacity-30' : ''}`}><Plus size={16}/></button>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirmModal(false)} className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-xl text-sm">取消</button>
              <button onClick={() => {
                if (confirmQuantity > (selectedProduct.stock || 0)) { alert("数量超过库存配额"); return; }
                if (confirmMethod === 'POINTS' && userPoints < (selectedProduct.points * confirmQuantity)) { alert("积分不足"); return; }
                const method = confirmMethod;
                const qty = confirmQuantity;
                const newTickets: UserMerchTicket[] = Array.from({ length: qty }).map(() => ({
                  id: 'M' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                  productId: selectedProduct.id, productName: selectedProduct.name,
                  status: 'PENDING', redeemMethod: method, timestamp: new Date().toLocaleString()
                }));
                if (method === 'POINTS') setUserPoints(prev => prev - (selectedProduct.points * qty));
                const updatedProducts = products.map(p => p.id === selectedProduct.id ? { ...p, stock: (p.stock || 0) - qty } : p);
                saveProducts(updatedProducts);
                const storedMerch = localStorage.getItem('vr_user_merch');
                const existing = storedMerch ? JSON.parse(storedMerch) : [];
                localStorage.setItem('vr_user_merch', JSON.stringify([...newTickets, ...existing]));
                window.dispatchEvent(new Event('storage_update'));
                setShowConfirmModal(false);
                alert(`成功购买/兑换 ${qty} 份商品`);
              }} className="flex-1 bg-purple-600 text-white font-bold py-3 rounded-xl text-sm">确定</button>
            </div>
          </div>
        </div>
      )}
      
      {/* REVERTED REDEEM FLOW */}
      {showRedeemFlow && (
        <div className="absolute inset-0 z-[150] bg-gray-50 animate-in slide-in-from-bottom flex flex-col">
          <div className="p-4 flex items-center border-b bg-white z-20"><button onClick={() => setShowRedeemFlow(false)} className="p-1 rounded-full"><ChevronLeft size={24} /></button><h2 className="flex-1 text-center font-bold">兑换体验券</h2><div className="w-8"></div></div>
          <div className="p-8 text-center flex-1 flex flex-col justify-center gap-10">
             <div className="w-32 h-32 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto border-4 border-purple-100 relative overflow-hidden group">
                <QrCode size={64} className="text-purple-600 group-active:scale-110 transition-transform" />
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500 animate-pulse"></div>
             </div>
             <div>
                <h3 className="font-bold text-xl mb-2">输入或扫描兑换码</h3>
                <p className="text-xs text-gray-400">请核对纸质体验券上的8位魔法验证码</p>
             </div>
             <div className="bg-white p-6 rounded-3xl shadow-sm border border-purple-100">
                <input 
                  type="text" 
                  maxLength={8}
                  placeholder="请输入8位魔法码" 
                  value={redeemCode}
                  onChange={e => setRedeemCode(e.target.value.toUpperCase())}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-4 text-center font-mono text-2xl tracking-[0.3em] focus:ring-2 focus:ring-purple-200 outline-none" 
                />
             </div>
             <button 
                onClick={() => {
                   if(redeemCode.length < 4) { alert("请输入有效的兑换码"); return; }
                   alert('兑换成功！票券已放入[我的票券]'); 
                   setShowRedeemFlow(false);
                }}
                className="w-full bg-purple-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-purple-200 active:scale-95 transition-transform"
             >
                立即唤醒体验
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MiniProgramView;