import React, { useState, useEffect, useRef } from 'react';
import { Home, User, Ticket, Calendar, ChevronRight, MapPin, ScanLine, Gift, Clock, Star, X, Music, ArrowLeft, Users, CheckCircle, CreditCard, ChevronLeft, CalendarDays, Settings, PieChart, BarChart, QrCode, LogOut, RefreshCw, Copy, Filter, Command, PlayCircle, Share, ChevronDown, Edit, Bell, AlertCircle, Share2, ArrowRightLeft, CalendarClock, UserPlus, ShoppingBag, BookOpen, Info, ShoppingCart, PackageCheck, TrendingUp, Activity, Plus, Minus, Store, Sparkles, Wand2, Percent, Save, Image as ImageIcon, PlusCircle, Upload, Box, TicketCheck, History, Wallet, Trophy, ShieldCheck, Search, FileText, Phone, CheckSquare, Square, Ticket as TicketIcon } from 'lucide-react';
import { MerchItem, UserMerchTicket, GlobalBooking, MyTicket, UserSession } from '../types';
import MiniProgramHome from './MiniProgramHome';

interface MiniProgramViewProps {
  resetTrigger?: number;
}

const DEFAULT_PRODUCTS: MerchItem[] = [
  { id: 'p1', name: 'LUMI魔法师徽章', image: 'https://images.unsplash.com/photo-1590543789988-66236b2f689e?w=400&h=400&fit=crop', points: 100, price: 29, stock: 50, isOnShelf: true, category: '礼品' },
  { id: 'p2', name: '定制版发光法杖', image: 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=600&h=800&fit=crop', points: 500, price: 128, stock: 20, isOnShelf: true, category: '礼品' },
  { id: 'p3', name: '魔法学院主题斗篷', image: 'https://images.unsplash.com/photo-1517462964-21fdcec3f25b?w=600&h=800&fit=crop', points: 800, price: 299, stock: 15, isOnShelf: true, category: '服饰' },
];

const MiniProgramView: React.FC<MiniProgramViewProps> = ({ resetTrigger }) => {
  // --- 1. SHARED DATA STATE ---
  const [products, setProducts] = useState<MerchItem[]>(DEFAULT_PRODUCTS);
  const [userMerchTickets, setUserMerchTickets] = useState<UserMerchTicket[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [globalBookings, setGlobalBookings] = useState<GlobalBooking[]>([]);

  // --- 3. GUEST STATE ---
  const [activeTab, setActiveTab] = useState<'HOME' | 'MINE'>('HOME');
  const [mineView, setMineView] = useState<'MENU' | 'TICKETS' | 'SESSIONS' | 'MERCH' | 'COUPONS'>('TICKETS');
  const [showIntro, setShowIntro] = useState(false);
  const [showStore, setShowStore] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRedeemPage, setShowRedeemPage] = useState(false); // New state for Redeem Page
  const [selectedProduct, setSelectedProduct] = useState<MerchItem | null>(null);
  const [confirmMethod, setConfirmMethod] = useState<'PURCHASE' | 'POINTS'>('PURCHASE');
  const [confirmQuantity, setConfirmQuantity] = useState(1);
  const [homeStore] = useState('北京·ClubMedJoyview延庆度假村');
  const [showMineRedDot, setShowMineRedDot] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const [showTicketQRCode, setShowTicketQRCode] = useState<UserMerchTicket | null>(null);
  const [storeCategory, setStoreCategory] = useState('全部');

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

    const storedProducts = localStorage.getItem('vr_global_products');
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      localStorage.setItem('vr_global_products', JSON.stringify(DEFAULT_PRODUCTS));
    }
    const storedSessions = localStorage.getItem('vr_user_sessions');
    if (storedSessions) setUserSessions(JSON.parse(storedSessions));
    const storedGuestTickets = localStorage.getItem('vr_guest_tickets');
    if (storedGuestTickets) setMyTickets(JSON.parse(storedGuestTickets));
    
    const storedPoints = localStorage.getItem('vr_user_points');
    if (storedPoints) setUserPoints(parseInt(storedPoints));

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

  const handleClaimPoints = (session: UserSession) => {
      const pointsToAdd = session.guests * 500;
      const newPoints = userPoints + pointsToAdd;
      setUserPoints(newPoints);
      localStorage.setItem('vr_user_points', newPoints.toString());

      const updatedSessions = userSessions.map(s => 
          s.id === session.id ? { ...s, pointsClaimed: true } : s
      );
      setUserSessions(updatedSessions);
      localStorage.setItem('vr_user_sessions', JSON.stringify(updatedSessions));
      
      showToast(`已领取 ${pointsToAdd} 积分！`);
  };

  const handleRedeemConfirm = () => {
    if (!redeemCode) return;
    
    // Logic: 1 -> Single, 2 -> Double, 3 -> Triple, Other -> Quad
    const firstDigit = redeemCode.charAt(0);
    let typeName = '四人票';
    let pCount = 4;
    if (firstDigit === '1') { typeName = '单人票'; pCount = 1; }
    else if (firstDigit === '2') { typeName = '两人票'; pCount = 2; }
    else if (firstDigit === '3') { typeName = '三人票'; pCount = 3; }
    
    const newTicket: MyTicket = {
        id: 't' + Date.now(),
        code: redeemCode,
        name: `【团购兑换】${typeName}`,
        peopleCount: pCount,
        date: new Date().toLocaleString().replace(/\//g, '-'),
        store: homeStore,
        status: 'PENDING' as const,
        expiryText: '有效期30天',
        tags: ['团购兑换']
    };
    
    const updatedTickets = [newTicket, ...myTickets];
    setMyTickets(updatedTickets);
    localStorage.setItem('vr_guest_tickets', JSON.stringify(updatedTickets));

    setShowRedeemFlow(false);
    setRedeemCode('');
    
    showToast('恭喜获得票券，请在【我的票券】进行查看');
    setShowMineRedDot(true);
  };

  const handleConfirmBooking = () => {
      // 1. Process used tickets (from selection)
      let updatedTickets = [...myTickets];
      if (selectedTicketIds.length > 0) {
          updatedTickets = updatedTickets.map(t => selectedTicketIds.includes(t.id) ? { ...t, status: 'USED' as const } : t);
      }

      // Calculate coverage
      const selectedTickets = myTickets.filter(t => selectedTicketIds.includes(t.id));
      const totalCovered = selectedTickets.reduce((sum, t) => sum + (t.peopleCount || 1), 0);
      const payCount = Math.max(0, bookingGuests - totalCovered);

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
          totalPrice: payCount * 98,
          status: 'UPCOMING',
          ticketCount: selectedTicketIds.length
      };

      // 3. GENERATE PAID TICKETS (If payment involved)
      if (payCount > 0) {
          const newPaidTicket: MyTicket = {
              id: 'T_PAID_' + Date.now(),
              code: Math.random().toString(36).substr(2, 9).toUpperCase(),
              name: '预约支付票(自动核销)',
              peopleCount: payCount,
              date: newSession.dateStr,
              store: homeStore,
              status: 'USED', // Immediately used
              expiryText: '已使用',
              tags: ['在线支付']
          };
          updatedTickets = [newPaidTicket, ...updatedTickets];
      }

      // Save tickets
      setMyTickets(updatedTickets);
      localStorage.setItem('vr_guest_tickets', JSON.stringify(updatedTickets));

      // Save sessions
      const newSessions = [newSession, ...userSessions];
      setUserSessions(newSessions);
      localStorage.setItem('vr_user_sessions', JSON.stringify(newSessions));

      // 4. Create Global Booking (Sync with Staff)
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
      if (payCount > 0) {
          window.dispatchEvent(new Event('new_user_ticket')); // Notify badge
      }

      // 5. Close Flow & Show Success Page
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
                             <div className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mt-1 inline-flex items-center gap-1">
                                 <Gift size={10} /> 积分: {userPoints}
                             </div>
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
                                        <div className="flex justify-between">
                                            <span>票券类型：</span>
                                            <span className="text-gray-800 font-bold">
                                                {ticket.name} 
                                                <span className="ml-1 text-[9px] bg-gray-100 text-gray-500 px-1 rounded font-normal">{(ticket.peopleCount || 1)}人权益</span>
                                            </span>
                                        </div>
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
                                
                                let statusText = '待参加';
                                let statusClass = 'bg-emerald-100 text-emerald-600';

                                if (session.status === 'COMPLETED') {
                                    statusText = '已结束';
                                    statusClass = 'bg-gray-200 text-gray-500';
                                } else if (session.status === 'RUNNING') {
                                    statusText = '体验中';
                                    statusClass = 'bg-purple-100 text-purple-600 animate-pulse';
                                } else if (session.status === 'CHECKED_IN') {
                                    statusText = '已签到';
                                    statusClass = 'bg-blue-100 text-blue-600';
                                } else if (session.status === 'CANCELLED') {
                                    statusText = '已取消';
                                    statusClass = 'bg-red-100 text-red-600';
                                } else if (isStarted) {
                                    statusText = '已过期';
                                    statusClass = 'bg-gray-200 text-gray-500';
                                }

                                const isBgGray = ['COMPLETED', 'CANCELLED'].includes(session.status) || (isStarted && !['CHECKED_IN', 'RUNNING'].includes(session.status));

                                return (
                                <div key={session.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                                    <div className={`p-4 ${isBgGray ? 'bg-gray-50' : 'bg-white'}`}>
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${statusClass}`}>
                                                        {statusText}
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
                                            
                                            {!['CHECKED_IN', 'RUNNING', 'COMPLETED', 'CANCELLED'].includes(session.status) && !isSessionStarted(session) && (
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

                                        {session.status === 'COMPLETED' && (
                                            <div className="mt-3 pt-3 border-t border-dashed border-gray-200">
                                                {session.pointsClaimed ? (
                                                    <button disabled className="w-full bg-gray-100 text-gray-400 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 cursor-not-allowed">
                                                        <CheckCircle size={14} /> 已领取 {session.guests * 500} 积分
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleClaimPoints(session)}
                                                        className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold py-2 rounded-lg shadow-md shadow-orange-100 active:scale-95 transition-all flex items-center justify-center gap-1"
                                                    >
                                                        <Gift size={14} /> 领取 {session.guests * 500} 积分
                                                    </button>
                                                )}
                                            </div>
                                        )}
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
                     userMerchTickets.map(ticket => (
                        <div key={ticket.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex gap-3">
                            <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-50 relative">
                                {ticket.productImage ? (
                                    <img src={ticket.productImage} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <ImageIcon size={24} />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <span className="font-bold text-gray-800 text-sm line-clamp-1">{ticket.productName}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded shrink-0 ${ticket.status === 'PENDING' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>{ticket.status === 'PENDING' ? '待核销' : '已核销'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                         {(ticket.quantity || 1) > 1 && <span className="text-xs font-bold text-purple-600 bg-purple-50 px-1.5 rounded">x{ticket.quantity}</span>}
                                         <div className="text-[10px] text-gray-400 truncate max-w-[120px]">券码: {ticket.id}</div>
                                    </div>
                                </div>
                                
                                {ticket.status === 'PENDING' && (
                                    <button 
                                        onClick={() => setShowTicketQRCode(ticket)}
                                        className="w-full border border-purple-200 text-purple-600 bg-purple-50 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-all mt-1"
                                    >
                                        <QrCode size={12} /> 查看核销码
                                    </button>
                                )}
                            </div>
                        </div>
                     ))
                )}
            </div>
        </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        {activeTab === 'HOME' ? (
          <MiniProgramHome 
            userSessions={userSessions}
            globalBookings={globalBookings}
            homeStore={homeStore}
            onStartBooking={() => {
              setBookingDateIdx(0);
              setBookingTime(null);
              setBookingGuests(1);
              setShowBookingFlow(true);
            }}
            onStartRedeem={() => {
              setRedeemCode('');
              setShowRedeemFlow(true);
            }}
            onViewSession={(session) => setViewingSession(session)}
            onShowStore={() => setShowStore(true)}
            onShowIntro={() => setShowIntro(true)}
          />
        ) : (
          <GuestMine />
        )}
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
        <div className="absolute inset-0 z-[120] bg-[#f4f4f4] animate-in slide-in-from-bottom flex flex-col">
          {/* Poizon-like Header: Simple, White, Centered Title */}
          <div className="bg-white px-4 py-3 flex items-center border-b border-gray-100 shadow-sm shrink-0 sticky top-0 z-30">
              <button onClick={() => setShowStore(false)} className="p-1 -ml-1 rounded-full hover:bg-gray-50 text-gray-800"><ChevronLeft size={26} /></button>
              <h2 className="flex-1 text-center font-bold text-base text-gray-900 mr-8">周边商城</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 pb-20 no-scrollbar">
            {/* Dark Card for Points (Contrast) */}
            <div className="bg-[#1a1a1a] rounded-xl p-5 mb-4 shadow-lg flex justify-between items-center text-white mx-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/20 rounded-full blur-2xl -mr-4 -mt-4"></div>
                <div className="relative z-10">
                    <div className="text-xs font-bold text-gray-400 mb-1 flex items-center gap-1"><Sparkles size={12} className="text-yellow-400"/> 当前积分</div>
                    <div className="text-3xl font-black tracking-tight font-sans">{userPoints}</div>
                </div>
                <button 
                    onClick={() => {
                        setShowStore(false);
                        setBookingDateIdx(0);
                        setBookingTime(null);
                        setBookingGuests(1);
                        setShowBookingFlow(true);
                    }}
                    className="relative z-10 bg-white/10 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md active:scale-95 transition-all"
                >
                   <div className="text-[10px] font-bold">游玩魔法学院赚积分 {'>'}</div>
                </button>
            </div>
            
            {/* Category Filter */}
            <div className="flex items-center gap-2 mb-4 mx-1 overflow-x-auto no-scrollbar">
               {['全部', '服饰', '抱枕', '礼品'].map(cat => (
                   <button 
                     key={cat}
                     onClick={() => setStoreCategory(cat)}
                     className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${storeCategory === cat ? 'bg-black text-white' : 'bg-white text-gray-500'}`}
                   >
                       {cat}
                   </button>
               ))}
            </div>

            {/* Grid Layout - Poizon Style */}
            <div className="grid grid-cols-2 gap-3 mx-1">
            {products
              .filter(p => p.isOnShelf !== false)
              .filter(p => storeCategory === '全部' || p.category === storeCategory)
              .map(product => (
              <div key={product.id} className="bg-white rounded-lg overflow-hidden flex flex-col">
                <div className="relative aspect-square bg-gray-50">
                  <img src={product.image} className="w-full h-full object-cover" />
                  {(!product.stock || product.stock <= 0) && (
                       <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                           <span className="bg-black/60 text-white text-xs px-2 py-1 rounded font-bold backdrop-blur-sm">已售罄</span>
                       </div>
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col">
                  <h4 className="font-bold text-gray-900 text-xs leading-5 line-clamp-2 mb-3 h-10">{product.name}</h4>
                  
                  <div className="mt-auto">
                      {/* Price & Points Row */}
                      <div className="flex items-baseline gap-1 mb-1">
                          <span className="text-sm font-bold text-purple-600">{product.points}</span>
                          <span className="text-[10px] font-bold text-purple-600">积分</span>
                          <span className="text-[10px] text-gray-300 mx-1">|</span>
                          <span className="text-xs font-bold text-gray-900">¥{product.price}</span>
                      </div>
                      
                      {/* Popularity Tag */}
                      <div className="text-[9px] text-gray-400 mb-2">10万+人关注</div>

                      <div className="text-[9px] text-gray-400 mb-3 flex items-center">
                          {product.stock && product.stock > 0 ? `库存: ${product.stock}` : '暂时缺货'}
                      </div>

                      <div className="flex gap-2">
                        <button 
                            disabled={!product.stock || product.stock <= 0} 
                            onClick={() => { setSelectedProduct(product); setConfirmMethod('POINTS'); setConfirmQuantity(1); setShowRedeemPage(true); }} 
                            className={`flex-1 text-[10px] font-bold py-2 rounded transition-colors border ${!product.stock || product.stock <= 0 ? 'border-gray-100 text-gray-300' : 'border-purple-100 text-purple-600 bg-purple-50/50'}`}
                        >
                            积分兑换
                        </button>
                        <button 
                            disabled={!product.stock || product.stock <= 0} 
                            onClick={() => { setSelectedProduct(product); setConfirmMethod('PURCHASE'); setConfirmQuantity(1); setShowConfirmModal(true); }} 
                            className={`flex-1 text-[10px] font-bold py-2 rounded transition-colors ${!product.stock || product.stock <= 0 ? 'bg-gray-100 text-gray-300' : 'bg-black text-white'}`}
                        >
                            购买
                        </button>
                      </div>
                  </div>
                </div>
              </div>
            ))}
            </div>
            
             <div className="text-center py-6 text-[10px] text-gray-300 font-mono tracking-widest uppercase">
                End of Collection
             </div>
          </div>
        </div>
      )}

      {showConfirmModal && selectedProduct && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)}></div>
          <div className="bg-white w-full rounded-2xl p-6 relative shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-lg mb-4 text-center">购买确认</h3>
            <div className="flex items-center gap-4 mb-6 bg-gray-50 p-3 rounded-xl">
               <img src={selectedProduct.image} className="w-16 h-16 rounded-lg object-cover bg-white" />
               <div><div className="text-sm font-bold text-gray-800">{selectedProduct.name}</div><div className="text-[10px] text-gray-400">单价: ¥{selectedProduct.price}</div><div className="text-[10px] text-emerald-600 font-bold mt-1">当前库存: {selectedProduct.stock || 0}</div></div>
            </div>
            <div className="flex items-center justify-between mb-4 px-1">
              <span className="text-sm font-bold text-gray-600">选择数量</span>
              <div className="flex items-center gap-4">
                <button onClick={() => setConfirmQuantity(Math.max(1, confirmQuantity - 1))} className={`w-8 h-8 rounded-full flex items-center justify-center border ${confirmQuantity <= 1 ? 'opacity-30' : ''}`}><Minus size={16}/></button>
                <span className="font-bold w-4 text-center">{confirmQuantity}</span>
                <button onClick={() => setConfirmQuantity(Math.min(selectedProduct.stock || 0, confirmQuantity + 1))} className={`w-8 h-8 rounded-full flex items-center justify-center border ${confirmQuantity >= (selectedProduct.stock || 0) ? 'opacity-30' : ''}`}><Plus size={16}/></button>
              </div>
            </div>

            <div className="flex justify-end items-center gap-2 mb-8 px-1">
                <span className="text-xs font-bold text-gray-500">所需总金额</span>
                <span className="text-lg font-black text-gray-800">
                    ¥{selectedProduct.price * confirmQuantity}
                </span>
            </div>
            
            <div className="flex gap-3">
              <button onClick={() => setShowConfirmModal(false)} className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-xl text-sm">取消</button>
              <button 
                onClick={() => {
                  if (confirmQuantity > (selectedProduct.stock || 0)) { alert("数量超过库存配额"); return; }
                  const qty = confirmQuantity;
                  
                  // Create ONE ticket with quantity
                  const newTicket: UserMerchTicket = {
                    id: 'M' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                    productId: selectedProduct.id, 
                    productName: selectedProduct.name,
                    productImage: selectedProduct.image,
                    status: 'PENDING', 
                    redeemMethod: 'PURCHASE', 
                    timestamp: new Date().toLocaleString(),
                    quantity: qty
                  };
                  
                  showToast(`成功购买 ${qty} 份商品`);
                  
                  const updatedProducts = products.map(p => p.id === selectedProduct.id ? { ...p, stock: (p.stock || 0) - qty } : p);
                  saveProducts(updatedProducts);
                  
                  const storedMerch = localStorage.getItem('vr_user_merch');
                  const existing = storedMerch ? JSON.parse(storedMerch) : [];
                  localStorage.setItem('vr_user_merch', JSON.stringify([newTicket, ...existing]));
                  window.dispatchEvent(new Event('storage_update'));
                  
                  // Immediately show modal
                  setShowConfirmModal(false);
                  setShowTicketQRCode(newTicket);

              }} className="flex-1 bg-black text-white font-bold py-3 rounded-xl text-sm">
                  确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REDEEM PAGE (NEW) */}
      {showRedeemPage && selectedProduct && (
        <div className="absolute inset-0 z-[200] bg-white animate-in slide-in-from-bottom flex flex-col">
            {/* Header */}
            <div className="p-4 flex items-center border-b border-gray-100 shadow-sm shrink-0">
               <button onClick={() => setShowRedeemPage(false)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <ChevronLeft size={24} className="text-gray-600" />
               </button>
               <h2 className="flex-1 text-center font-bold text-lg text-gray-800 mr-8">积分兑换</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
               {/* Product Card */}
               <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                   <div className="aspect-video bg-gray-50 relative">
                       <img src={selectedProduct.image} className="w-full h-full object-contain p-4" />
                   </div>
                   <div className="p-4">
                       <h3 className="text-lg font-black text-gray-800 mb-2">{selectedProduct.name}</h3>
                       <div className="flex items-center justify-between">
                           <div className="flex items-baseline gap-1">
                               <span className="text-xl font-black text-purple-600">{selectedProduct.points}</span>
                               <span className="text-xs font-bold text-purple-600">积分</span>
                           </div>
                           <span className="text-xs text-gray-400 font-bold bg-gray-100 px-2 py-1 rounded">库存: {selectedProduct.stock}</span>
                       </div>
                   </div>
               </div>

               {/* Quantity Selector */}
               <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between border border-gray-100">
                   <span className="text-sm font-bold text-gray-600">兑换数量</span>
                   <div className="flex items-center gap-4 bg-white p-1 rounded-xl shadow-sm border border-gray-200">
                        <button onClick={() => setConfirmQuantity(Math.max(1, confirmQuantity - 1))} className={`w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-50 ${confirmQuantity <= 1 ? 'opacity-30' : ''}`}><Minus size={16}/></button>
                        <span className="font-bold w-6 text-center">{confirmQuantity}</span>
                        <button onClick={() => setConfirmQuantity(Math.min(selectedProduct.stock || 0, confirmQuantity + 1))} className={`w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-50 ${confirmQuantity >= (selectedProduct.stock || 0) ? 'opacity-30' : ''}`}><Plus size={16}/></button>
                   </div>
               </div>

               {/* Summary */}
               <div className="flex flex-col gap-2 p-2">
                   <div className="flex justify-between items-center text-xs text-gray-500">
                       <span>现有积分</span>
                       <span className="font-bold">{userPoints} pts</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                       <span className="font-bold text-gray-800">所需积分</span>
                       <span className={`font-black text-lg ${userPoints < (selectedProduct.points * confirmQuantity) ? 'text-red-500' : 'text-purple-600'}`}>
                           {selectedProduct.points * confirmQuantity} <span className="text-xs font-bold text-gray-400">pts</span>
                       </span>
                   </div>
               </div>
            </div>

            {/* Bottom Bar */}
            <div className="p-6 border-t border-gray-100 bg-white safe-bottom shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
               <button 
                    disabled={userPoints < (selectedProduct.points * confirmQuantity)}
                    onClick={() => {
                        if (confirmQuantity > (selectedProduct.stock || 0)) { alert("数量超过库存配额"); return; }
                        if (userPoints < (selectedProduct.points * confirmQuantity)) { return; }
                        
                        const qty = confirmQuantity;
                        const newTicket: UserMerchTicket = {
                            id: 'M' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                            productId: selectedProduct.id, 
                            productName: selectedProduct.name,
                            productImage: selectedProduct.image,
                            status: 'PENDING', 
                            redeemMethod: 'POINTS', 
                            timestamp: new Date().toLocaleString(),
                            quantity: qty
                        };

                        const newPoints = userPoints - (selectedProduct.points * qty);
                        setUserPoints(newPoints);
                        localStorage.setItem('vr_user_points', newPoints.toString());
                        showToast('兑换成功，请在【我的周边】查看核销码');

                        const updatedProducts = products.map(p => p.id === selectedProduct.id ? { ...p, stock: (p.stock || 0) - qty } : p);
                        saveProducts(updatedProducts);
                        
                        const storedMerch = localStorage.getItem('vr_user_merch');
                        const existing = storedMerch ? JSON.parse(storedMerch) : [];
                        localStorage.setItem('vr_user_merch', JSON.stringify([newTicket, ...existing]));
                        window.dispatchEvent(new Event('storage_update'));
                        
                        // Close Page and Show QR
                        setShowRedeemPage(false);
                        setShowTicketQRCode(newTicket);
                    }}
                    className={`w-full font-bold py-4 rounded-2xl text-base shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${userPoints < (selectedProduct.points * confirmQuantity) ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-purple-600 text-white shadow-purple-200'}`}
                >
                    {userPoints < (selectedProduct.points * confirmQuantity) ? '积分不足' : '立即兑换'}
                </button>
            </div>
        </div>
      )}

      {/* REDEEM FLOW MODAL (Existing Coupon Redeem) */}
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
                                                const currentCovered = selectedTicketIds.reduce((sum, id) => {
                                                    const t = myTickets.find(mt => mt.id === id);
                                                    return sum + (t?.peopleCount || 1);
                                                }, 0);
                                                
                                                if (currentCovered < bookingGuests) {
                                                    setSelectedTicketIds(prev => [...prev, ticket.id]);
                                                }
                                            }
                                        }}
                                        className={`p-3 rounded-xl border flex justify-between items-center cursor-pointer transition-all ${isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-100 bg-white'}`}
                                     >
                                         <div>
                                             <div className="text-xs font-bold text-gray-800">
                                                {ticket.name} 
                                                <span className="ml-1 text-[9px] bg-gray-100 text-gray-500 px-1 rounded font-normal">
                                                    {(ticket.peopleCount || 1)}人权益
                                                </span>
                                             </div>
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
                       {(() => {
                           const selectedTicketsList = myTickets.filter(t => selectedTicketIds.includes(t.id));
                           const totalCovered = selectedTicketsList.reduce((acc, t) => acc + (t.peopleCount || 1), 0);
                           const payCount = Math.max(0, bookingGuests - totalCovered);
                           
                           return (
                           <>
                           <div className="flex justify-between items-end px-2">
                               <div className="text-xs text-gray-500">
                                   已选票券抵扣: <span className="font-bold text-gray-800">{totalCovered}</span> 人
                                   {payCount > 0 && <span className="ml-2 text-orange-600">需支付: {payCount} 人</span>}
                               </div>
                               <div className="text-xl font-black text-slate-900">
                                   <span className="text-xs font-normal text-gray-400 mr-1">合计</span>
                                   ¥{payCount * 98}
                               </div>
                           </div>
                           <button 
                                onClick={handleConfirmBooking}
                                className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                {payCount > 0 ? '确认支付并预约' : '确认预约'}
                            </button>
                           </>
                           );
                       })()}
                   </div>
               )}
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

      {showTicketQRCode && (
        <div className="absolute inset-0 z-[250] flex items-center justify-center p-6 animate-in fade-in bg-black/80 backdrop-blur-sm" onClick={() => setShowTicketQRCode(null)}>
            <div className="bg-white w-full max-w-[300px] rounded-2xl p-6 relative shadow-2xl animate-in zoom-in-95 text-center" onClick={e => e.stopPropagation()}>
                <button onClick={() => setShowTicketQRCode(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                   <X size={20} />
                </button>
                <div className="text-sm font-bold text-gray-500 mb-1">周边核销码</div>
                
                {/* Product Info in Modal */}
                {showTicketQRCode.productImage && (
                    <div className="w-24 h-24 mx-auto mb-3 bg-gray-50 rounded-xl overflow-hidden shadow-sm">
                        <img src={showTicketQRCode.productImage} className="w-full h-full object-cover" />
                    </div>
                )}
                
                <h3 className="font-black text-lg text-slate-800 mb-1 leading-tight">{showTicketQRCode.productName}</h3>
                {(showTicketQRCode.quantity || 1) > 1 && (
                     <div className="text-sm font-bold text-purple-600 mb-4 bg-purple-50 inline-block px-3 py-1 rounded-full">
                        x {showTicketQRCode.quantity}
                     </div>
                )}
                
                <div className="bg-slate-900 p-4 rounded-xl inline-block mb-4 shadow-lg mx-auto mt-2">
                    <QrCode size={140} className="text-white" />
                </div>
                
                <div className="text-xs text-gray-400 mb-2">请出示二维码给工作人员</div>
                <div className="text-lg font-mono font-black text-slate-800 tracking-widest bg-gray-100 py-3 rounded-xl border border-gray-200 mb-4">{showTicketQRCode.id}</div>
                
                <div className="text-[10px] text-gray-400 bg-gray-50 p-2 rounded-lg border border-dashed border-gray-200">
                    可在【我的周边】重新查看商品核销码
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default MiniProgramView;