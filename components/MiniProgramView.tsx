import React, { useState, useEffect, useRef } from 'react';
import { Home, User, Ticket, Calendar, ChevronRight, MapPin, ScanLine, Gift, Clock, Star, X, Music, ArrowLeft, Users, CheckCircle, CreditCard, ChevronLeft, CalendarDays, Settings, PieChart, BarChart, QrCode, LogOut, RefreshCw, Copy, Filter, Command, PlayCircle, Share, ChevronDown, Edit, Bell, AlertCircle, Share2, ArrowRightLeft, CalendarClock, UserPlus, ShoppingBag, BookOpen, Info, ShoppingCart, PackageCheck, TrendingUp, Activity, Plus, Minus, Store, Sparkles, Wand2, Percent, Save, Image as ImageIcon, PlusCircle, Upload, Box, TicketCheck, History, Wallet, Trophy, ShieldCheck, Search, FileText, Phone, CheckSquare, Square, Ticket as TicketIcon } from 'lucide-react';
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

interface MyTicket {
  id: string;
  code: string;
  name: string;
  date: string;
  store: string;
  status: 'PENDING' | 'USED' | 'EXPIRED';
  tags?: string[];
  expiryText?: string;
}

interface UserSession {
  id: string;
  dateStr: string;
  fullDate: string; // YYYY-MM-DD
  time: string;
  guests: number;
  store: string;
  qrCode: string;
  totalPrice: number;
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED' | 'CHECKED_IN';
  ticketCount: number;
}

interface GlobalBooking {
    id: string;
    time: string;
    dateStr: string;
    guests: number;
    checkInCount: number;
    status: 'BOOKED' | 'CHECKED_IN' | 'TRANSFERRED';
    store: string;
    userName: string;
}

const MiniProgramView: React.FC<MiniProgramViewProps> = ({ userType, resetTrigger, initialAdminTab }) => {
  // --- 1. SHARED DATA STATE ---
  const [products, setProducts] = useState<MerchItem[]>(DEFAULT_PRODUCTS);
  const [userMerchTickets, setUserMerchTickets] = useState<UserMerchTicket[]>([]);
  const [offlineSales, setOfflineSales] = useState<any[]>([]);
  const [generatedTickets, setGeneratedTickets] = useState<any[]>([]);
  const [userPoints, setUserPoints] = useState(1200);
  
  // Shared Bookings State (for Staff Control <-> Guest Booking Sync)
  const [globalBookings, setGlobalBookings] = useState<GlobalBooking[]>([]);

  // --- 2. STAFF STATE ---
  const [adminTab, setAdminTab] = useState<'TICKETS' | 'DATA' | 'IDENTITY' | 'CONTROL' | 'MERCH'>(initialAdminTab || 'TICKETS');
  const [ticketSubTab, setTicketSubTab] = useState<'GENERATE' | 'LIST'>('GENERATE');
  const [merchAdminSubTab, setMerchAdminSubTab] = useState<'MANAGE' | 'SALES' | 'STATS'>('SALES');
  const [editingProduct, setEditingProduct] = useState<MerchItem | null>(null);
  
  const [showTransferConfirmModal, setShowTransferConfirmModal] = useState(false);
  const [sessionToTransfer, setSessionToTransfer] = useState<GlobalBooking | null>(null);
  
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
  const [showMineRedDot, setShowMineRedDot] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  // Guest Data
  const [myTickets, setMyTickets] = useState<MyTicket[]>([]);
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);

  // Flows
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingDateIdx, setBookingDateIdx] = useState(0);
  const [bookingTime, setBookingTime] = useState<string | null>(null);
  const [bookingGuests, setBookingGuests] = useState(1);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  
  // Step 2 State
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);

  // Success Page State
  const [viewingSession, setViewingSession] = useState<UserSession | null>(null);

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
    const storedSessions = localStorage.getItem('vr_user_sessions');
    if (storedSessions) setUserSessions(JSON.parse(storedSessions));
    
    // Load Global Bookings for Staff Control
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

  useEffect(() => {
      // If reset trigger happens, reset guest view
      if (resetTrigger) {
          setActiveTab('HOME');
          setMineView('TICKETS');
      }
  }, [resetTrigger]);

  const generateTimeSlots = (dateIndex: number) => {
      const slots: string[] = [];
      const now = new Date();
      const targetDate = new Date();
      targetDate.setDate(now.getDate() + dateIndex);
      
      const startHour = 10;
      const endHour = 22;

      for (let h = startHour; h <= endHour; h++) {
          for (let m = 0; m < 60; m += 10) {
              if (h === endHour && m > 0) break; // Stop at 22:00

              const slotTime = new Date(targetDate);
              slotTime.setHours(h, m, 0, 0);

              // If it's today and slot is in the past, skip
              if (dateIndex === 0 && slotTime <= now) {
                  continue;
              }
              
              const hStr = h < 10 ? `0${h}` : `${h}`;
              const mStr = m < 10 ? `0${m}` : `${m}`;
              slots.push(`${hStr}:${mStr}`);
          }
      }
      return slots;
  };

  // Initialize booking flow
  useEffect(() => {
      if (showBookingFlow) {
          setBookingStep(1);
          setBookingTime(null);
          setSelectedTicketIds([]);
          const slots = generateTimeSlots(bookingDateIdx);
          // Only show the 4 closest time slots
          setTimeSlots(slots.slice(0, 4));
      }
  }, [showBookingFlow, bookingDateIdx]);

  const showToast = (message: string) => {
      setToast({ show: true, message });
      setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const saveProducts = (newProducts: MerchItem[]) => {
    setProducts(newProducts);
    localStorage.setItem('vr_global_products', JSON.stringify(newProducts));
    window.dispatchEvent(new Event('storage_update'));
  };

  // --- ACTIONS ---

  const handleGuestCheckIn = (session: UserSession) => {
      // 1. Update User Session Status
      const updatedUserSessions = userSessions.map(s => 
          s.id === session.id ? { ...s, status: 'CHECKED_IN' as const } : s
      );
      setUserSessions(updatedUserSessions);
      localStorage.setItem('vr_user_sessions', JSON.stringify(updatedUserSessions));

      // 2. Update Global Booking Status
      const updatedGlobalBookings = globalBookings.map(b => 
          b.id === session.id ? { ...b, status: 'CHECKED_IN' as const, checkInCount: b.guests } : b
      );
      setGlobalBookings(updatedGlobalBookings);
      localStorage.setItem('vr_global_bookings', JSON.stringify(updatedGlobalBookings));

      window.dispatchEvent(new Event('storage_update'));
      showToast('签到成功！请等待工作人员引导入场');
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
        const sessions: UserSession[] = JSON.parse(storedSessions);
        // Force update status to checked in if transferred manually
        const updatedSessions = sessions.map(s => s.id === booking.id ? { ...s, status: 'CHECKED_IN' as const } : s); 
        localStorage.setItem('vr_user_sessions', JSON.stringify(updatedSessions));
    }

    // Add to backstage data
    const storedBackstage = localStorage.getItem('vr_backstage_data');
    const currentBackstage = storedBackstage ? JSON.parse(storedBackstage) : [];
    
    const newItem = {
        id: `SESSION_${booking.id}_${Date.now()}`,
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

  const handleRedeemConfirm = () => {
    if (!redeemCode) return;
    
    // Logic: 1 -> Single, 2 -> Double, 3 -> Triple, Other -> Quad
    const firstDigit = redeemCode.charAt(0);
    let typeName = '四人票';
    if (firstDigit === '1') typeName = '单人票';
    else if (firstDigit === '2') typeName = '两人票';
    else if (firstDigit === '3') typeName = '三人票';
    
    const newTicket: MyTicket = {
        id: 't' + Date.now(),
        code: redeemCode,
        name: `【团购兑换】${typeName}`,
        date: new Date().toLocaleString().replace(/\//g, '-'),
        store: homeStore,
        status: 'PENDING' as const,
        expiryText: '有效期30天',
        tags: ['团购兑换']
    };
    
    setMyTickets(prev => [newTicket, ...prev]);
    setShowRedeemFlow(false);
    setRedeemCode('');
    
    showToast('恭喜获得票券，请在【我的票券】进行查看');
    setShowMineRedDot(true);
  };

  const handleConfirmBooking = () => {
      // 1. Process used tickets
      if (selectedTicketIds.length > 0) {
          setMyTickets(prev => prev.map(t => selectedTicketIds.includes(t.id) ? { ...t, status: 'USED' as const } : t));
      }

      // 2. Create User Session (Local)
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + bookingDateIdx);
      const dateStr = `${targetDate.getMonth()+1}/${targetDate.getDate()} 周${['日','一','二','三','四','五','六'][targetDate.getDay()]}`;

      const sessionId = 'S' + Date.now();
      const newSession: UserSession = {
          id: sessionId,
          dateStr: bookingDateIdx === 0 ? '今天' : bookingDateIdx === 1 ? '明天' : dateStr,
          fullDate: targetDate.toISOString().split('T')[0],
          time: bookingTime!,
          guests: bookingGuests,
          store: homeStore,
          qrCode: Math.random().toString(36).substring(7).toUpperCase(),
          totalPrice: (bookingGuests - selectedTicketIds.length) * 98,
          status: 'UPCOMING',
          ticketCount: selectedTicketIds.length
      };

      const newSessions = [newSession, ...userSessions];
      setUserSessions(newSessions);
      localStorage.setItem('vr_user_sessions', JSON.stringify(newSessions));

      // 3. Create Global Booking (Sync with Staff)
      const newGlobalBooking: GlobalBooking = {
          id: sessionId,
          time: bookingTime!,
          dateStr: newSession.dateStr,
          guests: bookingGuests,
          checkInCount: 0,
          status: 'BOOKED',
          store: homeStore,
          userName: '微信用户'
      };
      const updatedGlobal = [newGlobalBooking, ...globalBookings];
      setGlobalBookings(updatedGlobal);
      localStorage.setItem('vr_global_bookings', JSON.stringify(updatedGlobal));

      window.dispatchEvent(new Event('storage_update'));
      window.dispatchEvent(new Event('new_booking_created'));

      // 4. Close Flow & Show Success Page
      setShowBookingFlow(false);
      setViewingSession(newSession);
  };

  const isSessionStarted = (session: UserSession) => {
      const now = new Date();
      // Parse session start time
      let sessionDate = new Date();
      if (session.dateStr === '今天') {
         // keep today
      } else if (session.dateStr === '明天') {
         sessionDate.setDate(sessionDate.getDate() + 1);
      } else {
         sessionDate = new Date(session.fullDate);
      }
      
      const [hours, minutes] = session.time.split(':').map(Number);
      sessionDate.setHours(hours, minutes, 0, 0);

      return now >= sessionDate;
  };

  // --- 5. GUEST RENDERERS ---
  const GuestHome = () => {
    // Find nearest upcoming session
    const upcomingSession = userSessions
        .filter(s => !isSessionStarted(s) && s.status !== 'CANCELLED')
        .sort((a, b) => {
             const da = a.dateStr === '今天' ? 0 : a.dateStr === '明天' ? 1 : 2;
             const db = b.dateStr === '今天' ? 0 : b.dateStr === '明天' ? 1 : 2;
             if (da !== db) return da - db;
             return a.time.localeCompare(b.time);
        })[0];

    return (
    <div className="flex flex-col bg-white pb-32">
      {/* Banner */}
      <div className="relative h-80 w-full shrink-0">
        <img src="https://images.unsplash.com/photo-1626379953822-baec19c3accd?q=80&w=1000" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
        <div className="absolute top-4 left-4 z-20"><div className="flex items-center gap-1 text-white bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20"><MapPin size={12} /><span className="text-xs font-bold max-w-[120px] truncate">{homeStore}</span></div></div>
        <div className="absolute bottom-20 left-6 text-white"><div className="text-[10px] font-bold bg-purple-500/90 backdrop-blur-sm px-2 py-0.5 rounded inline-block mb-2 shadow-lg shadow-purple-900/50">XR大空间旗舰店</div><h1 className="text-3xl font-black leading-tight drop-shadow-md">LUMI魔法学院<br />沉浸式奇幻之旅</h1></div>
      </div>
      
      {/* Quick Actions */}
      <div className="px-5 -mt-12 relative z-10 grid grid-cols-2 gap-4">
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
      <div className="px-5 mt-8 space-y-6">

        {/* Upcoming Session Card */}
        {upcomingSession && (
             <div onClick={() => setViewingSession(upcomingSession)} className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-[2rem] p-5 shadow-xl shadow-slate-300 border border-slate-700 relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all">
                <div className="absolute top-0 right-0 p-3 opacity-10"><QrCode size={100} className="text-white"/></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse ${upcomingSession.status === 'CHECKED_IN' ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-white'}`}>
                            {upcomingSession.status === 'CHECKED_IN' ? '已签到' : '即将开始'}
                        </span>
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Upcoming Session</span>
                    </div>
                    <div className="flex items-end gap-3 mb-2">
                        <div className="text-3xl font-black text-white leading-none">{upcomingSession.time}</div>
                        <div className="text-sm font-bold text-slate-300 mb-1">{upcomingSession.dateStr}</div>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <MapPin size={10} /> {upcomingSession.store}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center">
                        <div className="flex -space-x-2">
                            {Array.from({length: Math.min(3, upcomingSession.guests)}).map((_,i) => (
                                <div key={i} className="w-6 h-6 rounded-full bg-slate-600 border-2 border-slate-800 flex items-center justify-center text-[8px] text-white">
                                    <User size={10} />
                                </div>
                            ))}
                            {upcomingSession.guests > 3 && <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-[8px] text-white font-bold">+{upcomingSession.guests-3}</div>}
                        </div>
                        <button className="bg-white text-slate-900 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 group-hover:bg-purple-400 group-hover:text-white transition-colors">
                            查看凭证 <ChevronRight size={10} />
                        </button>
                    </div>
                </div>
             </div>
        )}

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
      </div>
    </div>
    );
  };

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
                         {myTickets.length === 0 && (
                             <div className="text-center py-10 opacity-20 flex flex-col items-center">
                                <Ticket size={40} className="mb-2" />
                                <p className="text-xs font-bold uppercase tracking-widest">暂无票券</p>
                            </div>
                         )}
                        {myTickets.map(ticket => (
                            <div key={ticket.id} className={`bg-white rounded-xl overflow-hidden shadow-sm relative ${ticket.status === 'PENDING' ? '' : ticket.status === 'USED' ? 'opacity-80' : 'grayscale opacity-70'}`}>
                                {/* Header */}
                                <div className="flex justify-between items-center p-3 pb-0">
                                    <div className="flex items-center gap-2">
                                        <span className={`${ticket.status === 'PENDING' ? 'bg-blue-500' : ticket.status === 'USED' ? 'bg-emerald-500' : 'bg-gray-500'} text-white text-[10px] px-2 py-1 rounded-tr-lg rounded-bl-lg font-bold`}>
                                            {ticket.status === 'PENDING' ? '待使用票券' : ticket.status === 'USED' ? '已核销' : '已失效'}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-mono">{ticket.code}</span>
                                    </div>
                                    {ticket.status === 'PENDING' && (
                                        <div className="flex gap-1">
                                            {ticket.tags?.map((tag, idx) => (
                                                <span key={idx} className="text-[9px] bg-yellow-100 text-orange-500 px-1.5 py-0.5 rounded">{tag}</span>
                                            ))}
                                            {ticket.expiryText && <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full">{ticket.expiryText}</span>}
                                        </div>
                                    )}
                                </div>
                                {/* Content */}
                                <div className="p-4 pt-3 relative">
                                    <div className="space-y-2 text-xs text-gray-500 mb-3">
                                        <div className="flex justify-between"><span>票券类型：</span><span className="text-gray-800 font-bold">{ticket.name}</span></div>
                                        <div className="flex justify-between"><span>{ticket.status === 'PENDING' ? '兑换时间' : '场次地点'}：</span><span className="text-gray-800">{ticket.date}</span></div>
                                        <div className="flex justify-between"><span>所属门店：</span><span className="text-gray-800">{ticket.store}</span></div>
                                    </div>
                                    {/* Action Buttons for Pending */}
                                    {ticket.status === 'PENDING' && (
                                        <div className="flex justify-between items-center mt-4">
                                            <button className="border border-gray-300 text-gray-400 text-xs px-3 py-1.5 rounded disabled:opacity-50">已赠送</button>
                                            <button 
                                                onClick={() => {
                                                    setActiveTab('HOME');
                                                    setBookingDateIdx(0);
                                                    setBookingTime(null);
                                                    setBookingGuests(1);
                                                    setShowBookingFlow(true);
                                                }}
                                                className="bg-emerald-500 text-white text-xs px-4 py-1.5 rounded font-bold shadow-md shadow-emerald-200 active:scale-95 transition-transform"
                                            >
                                                去预约
                                            </button>
                                        </div>
                                    )}
                                    {/* Watermarks */}
                                    {ticket.status === 'USED' && (
                                        <div className="absolute right-4 bottom-2 w-20 h-20 border-2 border-emerald-500 rounded-full flex items-center justify-center text-emerald-500 font-black opacity-20 -rotate-12 text-xl">
                                            已核销
                                        </div>
                                    )}
                                    {ticket.status === 'EXPIRED' && (
                                        <div className="absolute right-4 bottom-2 w-20 h-20 border-2 border-gray-500 rounded-full flex items-center justify-center text-gray-500 font-black opacity-20 -rotate-12 text-xl">
                                            已失效
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </>
                )}
                
                {mineView === 'SESSIONS' && (
                    <div className="space-y-4">
                        {userSessions.length === 0 ? (
                            <div className="text-center py-10 opacity-20 flex flex-col items-center">
                                <History size={40} className="mb-2" />
                                <p className="text-xs font-bold uppercase tracking-widest">暂无历史记录</p>
                            </div>
                        ) : (
                            userSessions.map(session => {
                                const isStarted = isSessionStarted(session);
                                const isCheckedIn = session.status === 'CHECKED_IN';
                                return (
                                <div key={session.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                                    <div className={`p-4 ${isStarted || isCheckedIn ? 'bg-gray-50' : 'bg-white'}`}>
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isCheckedIn ? 'bg-blue-100 text-blue-600' : isStarted ? 'bg-gray-200 text-gray-500' : 'bg-emerald-100 text-emerald-600'}`}>
                                                        {isCheckedIn ? '已签到' : isStarted ? '已结束/进行中' : '待参加'}
                                                    </span>
                                                    <span className="text-xs font-bold text-gray-800">{session.dateStr} {session.time}</span>
                                                </div>
                                                <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                                    <MapPin size={10} /> {session.store}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-black text-gray-800">{session.guests}人</div>
                                                <div className="text-xs font-bold text-blue-600 mt-1">
                                                    {globalBookings.find(b => b.id === session.id)?.status === 'CHECKED_IN' ? '已签到' : globalBookings.find(b => b.id === session.id)?.status === 'TRANSFERRED' ? '已入场' : '未签到'}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="border-t border-dashed border-gray-200 my-3"></div>
                                        
                                        <div className="flex justify-between items-center gap-2">
                                            <div className="text-[10px] text-gray-400 flex-1">订单号: {session.id}</div>
                                            
                                            {!isCheckedIn && !isStarted && (
                                                <button 
                                                    onClick={() => handleGuestCheckIn(session)}
                                                    className="bg-blue-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-lg active:scale-95 transition-all shadow-md shadow-blue-200"
                                                >
                                                    签到
                                                </button>
                                            )}

                                            <button 
                                                onClick={() => setViewingSession(session)}
                                                className="bg-white border border-gray-200 text-gray-600 text-[10px] font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-all shadow-sm hover:border-purple-300 hover:text-purple-600"
                                            >
                                                查看详情
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                )
                            })
                        )}
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
        <button onClick={() => { setActiveTab('MINE'); setMineView('TICKETS'); setShowMineRedDot(false); }} className={`flex flex-col items-center gap-1.5 relative ${activeTab === 'MINE' ? 'text-blue-600' : 'text-gray-400'}`}>
            <User size={22} />
            <span className="text-[10px] font-bold">我的</span>
            {showMineRedDot && <div className="absolute top-0 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></div>}
        </button>
      </div>
      
      {/* GLOBAL TOAST NOTIFICATION */}
      {toast.show && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white px-6 py-3 rounded-xl shadow-2xl z-[300] flex items-center gap-3 animate-in fade-in slide-in-from-top-4 backdrop-blur-md max-w-[90%]">
              <CheckCircle size={20} className="text-green-400 shrink-0" />
              <span className="text-xs font-bold text-center leading-relaxed">{toast.message}</span>
          </div>
      )}

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

      {/* REDEEM FLOW MODAL */}
      {showRedeemFlow && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-gradient-to-b from-[#FFF5E6] to-white rounded-3xl overflow-hidden shadow-2xl relative">
                {/* Close Button */}
                <button onClick={() => setShowRedeemFlow(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-50">
                   <X size={24} />
                </button>
                
                <div className="pt-10 pb-8 px-6 flex flex-col items-center">
                    {/* Header */}
                    <div className="text-center mb-6 relative">
                       <h2 className="text-2xl font-black text-slate-800 italic transform -skew-x-6 relative z-10">兑换卡券</h2>
                       <p className="text-amber-500/40 font-bold text-3xl uppercase tracking-widest absolute top-1 left-1/2 -translate-x-1/2 -z-0 opacity-50">COUPON</p>
                    </div>
                    
                    {/* Logos */}
                    <div className="flex items-center justify-center mb-2 pl-3">
                       {/* Simulate logos with circles */}
                       <div className="w-12 h-12 rounded-full bg-yellow-400 border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-md z-30">美团</div>
                       <div className="w-12 h-12 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-md z-20 -ml-3">点评</div>
                       <div className="w-12 h-12 rounded-full bg-black border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-md z-10 -ml-3">抖音</div>
                    </div>
                    <p className="text-xs text-gray-500 mb-8">团购自动验券</p>

                    {/* Input */}
                    <div className="w-full bg-gray-100 rounded-xl flex items-center px-4 py-3 mb-6 border border-gray-200 focus-within:ring-2 focus-within:ring-orange-200 transition-all">
                       <input 
                          type="text" 
                          placeholder="请输入优惠券兑换码" 
                          className="flex-1 bg-transparent border-none outline-none text-sm text-center font-bold tracking-widest"
                          value={redeemCode}
                          onChange={(e) => setRedeemCode(e.target.value)}
                       />
                       <ScanLine size={20} className="text-gray-400" />
                    </div>

                    {/* Button */}
                    <button 
                      onClick={handleRedeemConfirm}
                      className="w-full bg-gradient-to-r from-orange-400 to-red-500 text-white font-bold py-3 rounded-full shadow-lg shadow-orange-200 active:scale-95 transition-transform"
                    >
                      兑换
                    </button>
                </div>
                
                {/* Footer Warning */}
                <div className="bg-black/80 p-4 text-center">
                   <p className="text-[10px] text-white/80 leading-relaxed">
                      票券使用期限为30天，请尽快使用奥~
                   </p>
                </div>
            </div>
        </div>
      )}

      {/* VIEWING SESSION / SUCCESS PAGE */}
      {viewingSession && (
          <div className="absolute inset-0 z-[200] bg-white animate-in slide-in-from-bottom flex flex-col">
              <div className="bg-gradient-to-b from-purple-500 to-purple-600 pt-12 pb-20 px-6 relative rounded-b-[3rem] shadow-xl">
                  <div className="absolute top-4 left-4 z-10">
                      <button onClick={() => setViewingSession(null)} className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors">
                          <X size={20} />
                      </button>
                  </div>
                  <div className="text-center text-white">
                      <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                          <CheckCircle size={32} className="text-emerald-500" />
                      </div>
                      <h2 className="text-2xl font-black mb-1">预约成功</h2>
                      <p className="text-white/80 text-sm font-medium">请凭二维码或面部识别入场</p>
                  </div>
              </div>

              <div className="px-6 -mt-16 relative z-20 flex-1 overflow-y-auto pb-8">
                  <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200 p-6 mb-6">
                      <div className="flex flex-col items-center mb-6 border-b border-dashed border-gray-200 pb-6">
                          <div className="w-48 h-48 bg-slate-900 rounded-2xl p-4 mb-4 shadow-inner flex items-center justify-center">
                              <QrCode size={120} className="text-white" />
                          </div>
                          <div className="text-sm font-bold text-slate-800 tracking-widest">{viewingSession.qrCode}</div>
                          <div className="text-[10px] text-slate-400 mt-1">请向工作人员出示此码</div>
                      </div>

                      <div className="space-y-4">
                          <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500 font-bold">场次时间</span>
                              <span className="text-sm font-black text-slate-800">{viewingSession.dateStr} {viewingSession.time}</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500 font-bold">体验地点</span>
                              <span className="text-xs font-bold text-slate-800 text-right max-w-[60%]">{viewingSession.store}</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500 font-bold">入场人数</span>
                              <span className="text-sm font-bold text-slate-800">{viewingSession.guests} 人</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500 font-bold">使用票券</span>
                              <span className="text-sm font-bold text-slate-800">{viewingSession.ticketCount} 张</span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                              <span className="text-xs text-gray-500 font-bold">实付金额</span>
                              <span className="text-lg font-black text-slate-900">¥{viewingSession.totalPrice}</span>
                          </div>
                      </div>
                  </div>

                  <div className="text-center text-[10px] text-gray-400 leading-relaxed px-4">
                      <p>温馨提示：请提前10分钟到达现场签到。</p>
                      <p>如需退改，请至少提前2小时联系客服。</p>
                  </div>
              </div>

              <div className="p-6 bg-white border-t border-gray-100 safe-bottom">
                  <button 
                      onClick={() => {
                          setViewingSession(null);
                          if(activeTab === 'HOME') {
                              setActiveTab('MINE');
                              setMineView('SESSIONS');
                          }
                      }}
                      className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-300 active:scale-[0.98] transition-all"
                  >
                      {activeTab === 'HOME' ? '查看我的场次' : '返回列表'}
                  </button>
              </div>
          </div>
      )}

      {/* BOOKING FLOW PAGE - Full Screen Overlay */}
      {showBookingFlow && (
        <div className="absolute inset-0 z-[200] bg-white animate-in slide-in-from-bottom flex flex-col">
            {/* Header */}
            <div className="p-4 flex items-center border-b border-gray-100 shadow-sm shrink-0">
               <button onClick={() => { if(bookingStep === 2) setBookingStep(1); else setShowBookingFlow(false); }} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <ChevronLeft size={24} className="text-gray-600" />
               </button>
               <h2 className="flex-1 text-center font-bold text-lg text-gray-800">{bookingStep === 1 ? '预约场次' : '确认订单'}</h2>
               <div className="w-10"></div>
            </div>

            {bookingStep === 1 ? (
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Date Selection */}
                <div>
                    <label className="text-sm font-black text-gray-800 mb-4 block flex items-center gap-2"><Calendar size={18} className="text-blue-500" /> 选择日期</label>
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                        {[0,1,2].map(idx => {
                            const date = new Date();
                            date.setDate(date.getDate() + idx);
                            const isSelected = bookingDateIdx === idx;
                            return (
                            <button key={idx} onClick={() => setBookingDateIdx(idx)} className={`flex-shrink-0 w-[4.5rem] h-20 rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${isSelected ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-105' : 'border-gray-100 text-gray-400 bg-white'}`}>
                                <span className="text-[10px] font-bold mb-1">{idx === 0 ? '今天' : idx === 1 ? '明天' : `${date.getMonth()+1}/${date.getDate()}`}</span>
                                <span className="text-lg font-black">周{['日','一','二','三','四','五','六'][date.getDay()]}</span>
                            </button>
                            );
                        })}
                    </div>
                </div>

                {/* Guest Count Selection - Max 4 */}
                <div>
                    <label className="text-sm font-black text-gray-800 mb-4 block flex items-center gap-2"><Users size={18} className="text-purple-500" /> 预约人数</label>
                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <span className="text-xs text-gray-500 font-bold">入场人数 <span className="text-[10px] text-gray-400 font-normal ml-1">(上限4人)</span></span>
                        <div className="flex items-center gap-6">
                            <button onClick={() => setBookingGuests(Math.max(1, bookingGuests - 1))} className={`w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm border border-gray-200 text-gray-600 active:scale-95 transition-all ${bookingGuests <= 1 ? 'opacity-50' : ''}`}>
                                <Minus size={18} />
                            </button>
                            <span className="text-2xl font-black text-gray-800 w-8 text-center">{bookingGuests}</span>
                            <button onClick={() => setBookingGuests(Math.min(4, bookingGuests + 1))} className={`w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm border border-gray-200 text-gray-600 active:scale-95 transition-all ${bookingGuests >= 4 ? 'opacity-50' : ''}`}>
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Time Selection - Recommended 4 slots */}
                <div>
                    <label className="text-sm font-black text-gray-800 mb-4 block flex items-center gap-2">
                        <Clock size={18} className="text-orange-500" /> 
                        推荐场次 
                        <span className="text-[10px] font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">离您最近的时段</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {timeSlots.map(t => (
                            <button key={t} onClick={() => setBookingTime(t)} className={`py-4 rounded-xl text-sm font-black border-2 transition-all relative overflow-hidden ${bookingTime === t ? 'bg-orange-50 text-orange-600 border-orange-400 shadow-md' : 'border-gray-100 text-gray-600 bg-white hover:border-gray-200'}`}>
                                {t}
                                {bookingTime === t && <div className="absolute top-0 right-0 bg-orange-400 text-white p-1 rounded-bl-lg"><CheckCircle size={10} /></div>}
                            </button>
                        ))}
                    </div>
                    {timeSlots.length === 0 && <div className="text-center text-xs text-gray-400 py-4">今日暂无可预约时段</div>}
                </div>
                </div>
            ) : (
                // Step 2: Payment / Ticket Selection
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-2 text-sm">预约信息</h3>
                        <div className="space-y-1 text-xs text-gray-500">
                             <div className="flex justify-between"><span>日期</span><span className="font-bold text-gray-800">{bookingDateIdx === 0 ? '今天' : bookingDateIdx === 1 ? '明天' : '后天'}</span></div>
                             <div className="flex justify-between"><span>时间</span><span className="font-bold text-gray-800">{bookingTime}</span></div>
                             <div className="flex justify-between"><span>人数</span><span className="font-bold text-gray-800">{bookingGuests}人</span></div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-gray-800 mb-4 text-sm flex items-center justify-between">
                            <span>使用票券</span>
                            <span className="text-[10px] text-gray-400 font-normal">可选 {Math.min(myTickets.filter(t => t.status === 'PENDING').length, bookingGuests)} 张</span>
                        </h3>
                        <div className="space-y-2">
                             {myTickets.filter(t => t.status === 'PENDING').length === 0 && <div className="text-center py-4 text-xs text-gray-400 bg-gray-50 rounded-xl border border-dashed">暂无可用票券</div>}
                             {myTickets.filter(t => t.status === 'PENDING').map(ticket => {
                                 const isSelected = selectedTicketIds.includes(ticket.id);
                                 return (
                                     <div key={ticket.id} 
                                        onClick={() => {
                                            if (isSelected) {
                                                setSelectedTicketIds(prev => prev.filter(id => id !== ticket.id));
                                            } else {
                                                if (selectedTicketIds.length < bookingGuests) {
                                                    setSelectedTicketIds(prev => [...prev, ticket.id]);
                                                }
                                            }
                                        }}
                                        className={`p-3 rounded-xl border flex justify-between items-center cursor-pointer transition-all ${isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-100 bg-white'}`}
                                     >
                                         <div>
                                             <div className="text-xs font-bold text-gray-800">{ticket.name}</div>
                                             <div className="text-[10px] text-gray-400">{ticket.code}</div>
                                         </div>
                                         {isSelected ? <CheckSquare size={18} className="text-purple-600" /> : <Square size={18} className="text-gray-300" />}
                                     </div>
                                 )
                             })}
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Action */}
            <div className="p-6 border-t border-gray-100 bg-white safe-bottom">
               {bookingStep === 1 ? (
                   <button 
                        disabled={!bookingTime}
                        onClick={() => setBookingStep(2)}
                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-300 disabled:opacity-50 disabled:shadow-none active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        下一步
                    </button>
               ) : (
                   <div className="space-y-3">
                       <div className="flex justify-between items-end px-2">
                           <div className="text-xs text-gray-500">
                               已选票券: <span className="font-bold text-gray-800">{selectedTicketIds.length}</span> 张
                               {(bookingGuests - selectedTicketIds.length) > 0 && <span className="ml-2 text-orange-600">需支付: {bookingGuests - selectedTicketIds.length} 人</span>}
                           </div>
                           <div className="text-xl font-black text-slate-900">
                               <span className="text-xs font-normal text-gray-400 mr-1">合计</span>
                               ¥{(bookingGuests - selectedTicketIds.length) * 98}
                           </div>
                       </div>
                       <button 
                            onClick={handleConfirmBooking}
                            className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            {(bookingGuests - selectedTicketIds.length) > 0 ? '确认支付并预约' : '确认预约'}
                        </button>
                   </div>
               )}
            </div>
        </div>
      )}
    </div>
  );
};

export default MiniProgramView;