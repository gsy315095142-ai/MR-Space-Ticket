import React, { useState, useEffect } from 'react';
import { Home, User, Ticket, Calendar, ChevronRight, MapPin, ScanLine, Gift, Clock, Star, X, Music, ArrowLeft, Users, CheckCircle, CreditCard, ChevronLeft, CalendarDays, Settings, PieChart, BarChart, QrCode, LogOut, RefreshCw, Copy, Filter, Command, PlayCircle } from 'lucide-react';

interface MiniProgramViewProps {
  userType: 'STAFF' | 'GUEST';
}

interface TicketItem {
  id: string;
  name: string;
  peopleCount: number;
  storeName: string;
  validUntil: string;
  status: 'UNUSED' | 'USED' | 'EXPIRED';
}

interface SessionItem {
    id: string;
    timeStr: string;
    location: string;
    peopleCount: number;
    status: 'UPCOMING' | 'RUNNING' | 'COMPLETED';
    image?: string;
    transferredToBackstage?: boolean;
    userName?: string;
}

interface GeneratedTicketItem {
    id: string;
    code: string;
    type: string; // e.g., "单人票", "双人票"
    peopleCount: number;
    createdAt: string;
    status: 'ACTIVE' | 'REDEEMED';
}

type BookingStep = 'NONE' | 'BASIC' | 'TICKETS' | 'SUCCESS';
type AdminTab = 'TICKETS' | 'DATA' | 'IDENTITY' | 'CONTROL';
type TicketSubTab = 'GENERATE' | 'LIST';

const MiniProgramView: React.FC<MiniProgramViewProps> = ({ userType }) => {
  const [activeTab, setActiveTab] = useState<'HOME' | 'MINE'>('HOME');
  
  // Admin Mode States
  const [isAdminView, setIsAdminView] = useState(false);
  const [adminTab, setAdminTab] = useState<AdminTab>('TICKETS');
  const [ticketSubTab, setTicketSubTab] = useState<TicketSubTab>('GENERATE');
  
  const [generatedTickets, setGeneratedTickets] = useState<GeneratedTicketItem[]>([
      { id: 'g1', code: '18392011', type: '单人体验券', peopleCount: 1, createdAt: '2024-10-24 10:00', status: 'ACTIVE' },
      { id: 'g2', code: '29102399', type: '双人体验券', peopleCount: 2, createdAt: '2024-10-23 15:30', status: 'REDEEMED' }
  ]);
  const [genSelectedType, setGenSelectedType] = useState(1); // 1, 2, 3, 4 people
  const [adminDateFilter, setAdminDateFilter] = useState('今日');
  const [adminControlDate, setAdminControlDate] = useState(''); // Init in useEffect

  // Modal States
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  
  // Navigation States
  const [mineView, setMineView] = useState<'MENU' | 'TICKETS' | 'SESSIONS'>('MENU');
  const [bookingStep, setBookingStep] = useState<BookingStep>('NONE');

  // Data States
  const [myTickets, setMyTickets] = useState<TicketItem[]>([]);
  const [mySessions, setMySessions] = useState<SessionItem[]>([]);

  // Helper to get formatted date string: "10月25日"
  const formatDate = (date: Date) => `${date.getMonth() + 1}月${date.getDate()}日`;

  // Init Data
  useEffect(() => {
    setAdminControlDate(formatDate(new Date()));

    // Load Tickets
    const storedTickets = localStorage.getItem('vr_user_tickets');
    if (storedTickets) {
        setMyTickets(JSON.parse(storedTickets));
    } else {
        setMyTickets([
        {
            id: 'init-1',
            name: '单人体验券',
            peopleCount: 1,
            storeName: '北京·ClubMedJoyview延庆度假村',
            validUntil: '2024-12-31',
            status: 'EXPIRED'
        }
        ]);
    }

    // Load Sessions
    const storedSessions = localStorage.getItem('vr_sessions');
    if (storedSessions) {
        setMySessions(JSON.parse(storedSessions));
    } else {
        const initialSession: SessionItem = {
            id: 's-1',
            timeStr: '2025.06.17 15:00-15:30',
            location: '北京·ClubMedJoyview延庆度假村',
            peopleCount: 3,
            status: 'UPCOMING',
            userName: '初始用户'
        };
        setMySessions([initialSession]);
        // Don't save initial immediately to avoid overwriting if empty
    }

    // Listen for updates
    const handleStorageChange = () => {
        const updatedTickets = localStorage.getItem('vr_user_tickets');
        if (updatedTickets) setMyTickets(JSON.parse(updatedTickets));
        
        const updatedSessions = localStorage.getItem('vr_sessions');
        if (updatedSessions) setMySessions(JSON.parse(updatedSessions));
    };

    window.addEventListener('storage_update', handleStorageChange);
    return () => window.removeEventListener('storage_update', handleStorageChange);
  }, []);

  // Sync myTickets changes to localStorage
  useEffect(() => {
      if (myTickets.length > 0) {
        localStorage.setItem('vr_user_tickets', JSON.stringify(myTickets));
      }
  }, [myTickets]);

  // Sync mySessions changes to localStorage
  useEffect(() => {
    if (mySessions.length > 0) {
        localStorage.setItem('vr_sessions', JSON.stringify(mySessions));
    }
  }, [mySessions]);


  // Booking Flow State
  const [bookingData, setBookingData] = useState({
      peopleCount: 1,
      date: formatDate(new Date()), // Default to today
      timeSlot: '',
  });
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
  
  // Force re-render every minute to update status
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  // --- Helper: Check Session Status ---
  const getSessionStatus = (timeStr: string): 'UPCOMING' | 'COMPLETED' => {
    try {
        // Expected format: "YYYY.MM.DD HH:mm-HH:mm"
        // Example: "2025.06.17 15:00-15:30"
        const [datePart, timeRange] = timeStr.split(' ');
        if (!datePart || !timeRange) return 'UPCOMING';
        
        const normalizedDate = datePart.replace(/\./g, '-'); // 2025-06-17
        const endTimeStr = timeRange.split('-')[1]; // 15:30
        
        if (!endTimeStr) return 'UPCOMING';

        const endDateTimeStr = `${normalizedDate}T${endTimeStr}:00`;
        const endDate = new Date(endDateTimeStr);
        
        if (isNaN(endDate.getTime())) return 'UPCOMING';

        return new Date() > endDate ? 'COMPLETED' : 'UPCOMING';
    } catch (e) {
        return 'UPCOMING';
    }
  };

  // --- Handlers ---

  const handleRedeem = () => {
    const code = couponCode.trim();
    if (!code) return;
    
    // Determine ticket type based on first digit
    let ticketConfig = { name: '单人体验券', count: 1 };
    if (code.startsWith('2')) ticketConfig = { name: '双人体验券', count: 2 };
    else if (code.startsWith('3')) ticketConfig = { name: '三人体验券', count: 3 };
    else if (code.startsWith('4')) ticketConfig = { name: '四人体验券', count: 4 };
    else if (code.startsWith('1')) ticketConfig = { name: '单人体验券', count: 1 };
    
    // Calculate validity (30 days from now)
    const validDate = new Date();
    validDate.setDate(validDate.getDate() + 30);
    const validUntilStr = validDate.toLocaleDateString('zh-CN').replace(/\//g, '.');

    const newTicket: TicketItem = {
        id: Date.now().toString(),
        name: ticketConfig.name,
        peopleCount: ticketConfig.count,
        storeName: '北京·ClubMedJoyview延庆度假村',
        validUntil: validUntilStr,
        status: 'UNUSED'
    };
    
    // Simulate API call and success feedback
    setTimeout(() => {
        setMyTickets([newTicket, ...myTickets]);
        setShowRedeemModal(false);
        setCouponCode('');
        setActiveTab('MINE'); // Navigate to profile
        setMineView('TICKETS'); // Go directly to tickets list
    }, 500);
  };

  const handleStartBooking = () => {
      setBookingStep('BASIC');
      setBookingData({ 
        ...bookingData, 
        date: formatDate(new Date()), // Reset to today
        timeSlot: '', 
        peopleCount: 1 
      });
      setSelectedTicketIds([]);
  };

  const handleBasicInfoSubmit = () => {
      if (!bookingData.timeSlot) {
          alert("请选择场次时间");
          return;
      }
      setBookingStep('TICKETS');
  };

  const toggleTicketSelection = (ticketId: string) => {
      if (selectedTicketIds.includes(ticketId)) {
          setSelectedTicketIds(selectedTicketIds.filter(id => id !== ticketId));
      } else {
          // Optional: Add logic to prevent selecting more tickets than needed? 
          // For now, let user select freely.
          setSelectedTicketIds([...selectedTicketIds, ticketId]);
      }
  };

  const handleConfirmBooking = () => {
      // 1. Mark tickets as used
      const updatedTickets = myTickets.map(t => 
          selectedTicketIds.includes(t.id) ? { ...t, status: 'USED' as const } : t
      );
      setMyTickets(updatedTickets);

      // Calculate End Time (Start Time + 30 mins)
      const [sh, sm] = bookingData.timeSlot.split(':').map(Number);
      const endDate = new Date();
      endDate.setHours(sh, sm + 30);
      const endTimeStr = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
      const fullTimeStr = `${bookingData.timeSlot}-${endTimeStr}`;

      const year = new Date().getFullYear();
      
      // 2. Create Session
      const newSession: SessionItem = {
          id: Date.now().toString(),
          timeStr: `${year}.${bookingData.date.replace('月','.').replace('日','')} ${fullTimeStr}`, 
          location: '北京·ClubMedJoyview延庆度假村',
          peopleCount: bookingData.peopleCount,
          status: 'UPCOMING',
          userName: '体验用户'
      };
      // Note: mySessions will trigger useEffect to save to localStorage 'vr_sessions'
      setMySessions([newSession, ...mySessions]);

      // 3. Show Success
      setBookingStep('SUCCESS');
      
      // 4. Force Notify for other views (Backstage/Control)
      setTimeout(() => window.dispatchEvent(new Event('storage_update')), 100);
  };

  const handleGenerateTicket = () => {
      const prefix = genSelectedType;
      const randomPart = Math.floor(1000000 + Math.random() * 9000000); // 7 digit random
      const code = `${prefix}${randomPart}`;
      
      const names = {1: '单人体验券', 2: '双人体验券', 3: '三人体验券', 4: '四人体验券'};
      const ticketName = names[genSelectedType as keyof typeof names];
      
      const newGenTicket: GeneratedTicketItem = {
          id: Date.now().toString(),
          code: code,
          type: ticketName,
          peopleCount: genSelectedType,
          createdAt: new Date().toLocaleString('zh-CN', {month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'}),
          status: 'ACTIVE'
      };

      setGeneratedTickets([newGenTicket, ...generatedTickets]);
      setTicketSubTab('LIST');

      // --- NEW LOGIC: Send Ticket Link to Chat ---
      // 1. Construct the payload for the user ticket
      const validDate = new Date();
      validDate.setDate(validDate.getDate() + 30);
      const validUntilStr = validDate.toLocaleDateString('zh-CN').replace(/\//g, '.');

      const userTicketPayload: TicketItem = {
          id: `t-${code}`,
          name: ticketName,
          peopleCount: genSelectedType,
          storeName: '北京·ClubMedJoyview延庆度假村',
          validUntil: validUntilStr,
          status: 'UNUSED'
      };

      // 2. Load existing messages (or default)
      const storageKey = 'vr_chat_messages';
      const storedMsgs = localStorage.getItem(storageKey);
      let chatHistory = storedMsgs ? JSON.parse(storedMsgs) : [];
      
      const nowTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      
      const newMessage = {
          id: Date.now(),
          text: '送您一张体验券', // Fallback text
          sender: 'OTHER', // Staff is "OTHER" to the User
          time: nowTime,
          type: 'TICKET_LINK',
          ticketData: userTicketPayload,
          isRedeemed: false
      };

      chatHistory.push(newMessage);
      localStorage.setItem(storageKey, JSON.stringify(chatHistory));

      // 3. Notify Chat View to update
      window.dispatchEvent(new Event('storage_update'));
      
      // 4. Notify App for Badge
      window.dispatchEvent(new Event('new_chat_message'));
  };

  const handleTransferToBackstage = (session: SessionItem) => {
      const key = 'vr_backstage_data';
      const stored = localStorage.getItem(key);
      const backstageData: SessionItem[] = stored ? JSON.parse(stored) : [];

      if (backstageData.some(s => s.id === session.id)) {
          alert('该场次已转入后厅');
          return;
      }

      const updatedData = [session, ...backstageData];
      localStorage.setItem(key, JSON.stringify(updatedData));
      
      // Update local transferred state if we were tracking it properly, but here we can just alert
      alert('已转入后厅');
      window.dispatchEvent(new Event('storage_update'));
  };

  // --- Helper Generators ---
  
  const getNextThreeDays = () => {
      const dates = [];
      const today = new Date();
      for (let i = 0; i < 3; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() + i);
          dates.push(formatDate(d));
      }
      return dates;
  };

  const generateTimeSlots = (selectedDateStr: string, fullDay = false) => {
      const slots = [];
      const now = new Date();
      const isToday = selectedDateStr === formatDate(now);
      
      let startH = 10;
      let startM = 0;

      if (!fullDay && isToday) {
          // If today and for booking suggestion, start from current time
          startH = now.getHours();
          startM = Math.ceil(now.getMinutes() / 10) * 10;
          if (startM === 60) {
              startH += 1;
              startM = 0;
          }
      }

      let currentH = startH;
      let currentM = startM;

      // For Control View (fullDay=true), we want all slots 10:00-22:00
      // For Booking View (fullDay=false), we want next 4 slots
      const maxSlots = fullDay ? 100 : 4; 

      while (slots.length < maxSlots) {
          if (currentH > 22 || (currentH === 22 && currentM > 0)) break; // Cutoff at 22:00

          const timeStr = `${currentH.toString().padStart(2, '0')}:${currentM.toString().padStart(2, '0')}`;
          slots.push(timeStr);

          // Increment 10 mins
          currentM += 10;
          if (currentM === 60) {
              currentH += 1;
              currentM = 0;
          }
      }

      return slots;
  };

  // --- Render Helpers ---

  const renderBookingBasic = () => {
      const dates = getNextThreeDays();
      const timeSlots = generateTimeSlots(bookingData.date);

      return (
          <div className="flex flex-col h-full bg-white animate-in slide-in-from-right duration-300">
              {/* Header */}
              <div className="px-4 py-4 flex items-center border-b border-gray-100">
                  <button onClick={() => setBookingStep('NONE')} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
                      <X size={24} />
                  </button>
                  <h2 className="font-bold text-lg text-gray-800 flex-1 text-center pr-8">预约体验</h2>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  {/* Location (Fixed) */}
                  <div>
                      <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">体验地点</h3>
                      <div className="flex items-center gap-2 text-gray-800 font-medium bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <MapPin size={18} className="text-blue-500" />
                          北京·ClubMedJoyview延庆度假村
                      </div>
                  </div>

                  {/* People Count */}
                  <div>
                      <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">预约人数</h3>
                      <div className="flex items-center gap-4">
                          {[1, 2, 3, 4].map(num => (
                              <button
                                  key={num}
                                  onClick={() => setBookingData({...bookingData, peopleCount: num})}
                                  className={`flex-1 h-12 rounded-xl font-bold text-lg transition-all border-2
                                      ${bookingData.peopleCount === num 
                                          ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm' 
                                          : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                                      }`}
                              >
                                  {num}人
                              </button>
                          ))}
                      </div>
                  </div>

                  {/* Date Selection */}
                  <div>
                      <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">选择日期</h3>
                      <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
                          {dates.map(date => {
                              const isToday = date === formatDate(new Date());
                              // Simple week day calculation for demo
                              const dayIndex = (new Date().getDay() + dates.indexOf(date)) % 7;
                              const weekDays = ['日','一','二','三','四','五','六'];

                              return (
                                <button
                                    key={date}
                                    onClick={() => setBookingData({...bookingData, date: date, timeSlot: ''})} // Reset time slot on date change
                                    className={`flex-shrink-0 w-24 h-20 rounded-xl flex flex-col items-center justify-center gap-1 border-2 transition-all
                                        ${bookingData.date === date 
                                            ? 'border-blue-500 bg-blue-500 text-white shadow-md' 
                                            : 'border-gray-100 bg-white text-gray-600'
                                        }`}
                                >
                                    <span className={`text-xs ${bookingData.date === date ? 'text-blue-100' : 'text-gray-400'}`}>
                                        {isToday ? '今天' : '周' + weekDays[dayIndex]}
                                    </span>
                                    <span className="font-bold text-lg">{date}</span>
                                </button>
                              );
                          })}
                      </div>
                  </div>

                  {/* Time Slots */}
                  <div>
                      <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">选择场次</h3>
                      {timeSlots.length > 0 ? (
                          <div className="grid grid-cols-4 gap-3">
                              {timeSlots.map(time => (
                                  <button
                                      key={time}
                                      onClick={() => setBookingData({...bookingData, timeSlot: time})}
                                      className={`py-2 rounded-lg text-sm font-medium transition-all border
                                          ${bookingData.timeSlot === time 
                                              ? 'border-blue-500 bg-blue-50 text-blue-600' 
                                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                          }`}
                                  >
                                      {time}
                                  </button>
                              ))}
                          </div>
                      ) : (
                           <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-400 text-sm border border-dashed border-gray-200">
                               当前日期暂无可用场次
                           </div>
                      )}
                      <p className="text-[10px] text-gray-400 mt-2 ml-1">
                          * 场次每10分钟一场，最晚22:00
                      </p>
                  </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-100">
                  <button 
                      onClick={handleBasicInfoSubmit}
                      disabled={!bookingData.timeSlot}
                      className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-full shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
                  >
                      下一步
                  </button>
              </div>
          </div>
      );
  };

  const renderBookingTickets = () => {
      const availableTickets = myTickets.filter(t => t.status === 'UNUSED');
      
      // Calculations
      const selectedTickets = availableTickets.filter(t => selectedTicketIds.includes(t.id));
      const totalCapacity = selectedTickets.reduce((sum, t) => sum + t.peopleCount, 0);
      const missingPeople = Math.max(0, bookingData.peopleCount - totalCapacity);
      const amountToPay = missingPeople * 98;
      
      const year = new Date().getFullYear();

      return (
          <div className="flex flex-col h-full bg-gray-50 animate-in slide-in-from-right duration-300">
               {/* Header */}
               <div className="bg-white px-4 py-4 flex items-center shadow-sm z-10">
                  <button onClick={() => setBookingStep('BASIC')} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
                      <ChevronLeft size={24} />
                  </button>
                  <h2 className="font-bold text-lg text-gray-800 ml-2">确认票券信息</h2>
              </div>

              <div className="flex-1 overflow-y-auto p-4 pb-24">
                  {/* Summary Card */}
                  <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-blue-100">
                      <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-500 text-sm">预约时间</span>
                          <span className="font-bold text-gray-800">{year}.{bookingData.date.replace('月','.').replace('日','')} {bookingData.timeSlot}</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-gray-500 text-sm">预约人数</span>
                          <span className="font-bold text-gray-800">{bookingData.peopleCount}人</span>
                      </div>
                  </div>

                  <h3 className="text-sm font-bold text-gray-500 mb-3 px-1">选择可用票券</h3>
                  
                  <div className="space-y-3">
                      {availableTickets.length === 0 ? (
                          <div className="bg-white p-8 rounded-xl text-center text-gray-400 border border-dashed border-gray-300">
                              <Ticket size={32} className="mx-auto mb-2 opacity-30" />
                              <p className="text-sm">暂无可用票券</p>
                          </div>
                      ) : (
                          availableTickets.map(ticket => {
                             const isSelected = selectedTicketIds.includes(ticket.id);
                             return (
                                <div 
                                    key={ticket.id}
                                    onClick={() => toggleTicketSelection(ticket.id)}
                                    className={`bg-white p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between
                                        ${isSelected ? 'border-blue-500 bg-blue-50/50' : 'border-transparent shadow-sm hover:border-gray-200'}
                                    `}
                                >
                                    <div>
                                        <div className="font-bold text-gray-800">{ticket.name}</div>
                                        <div className="text-xs text-gray-500 mt-1">有效期至: {ticket.validUntil}</div>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                                        ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 bg-white'}
                                    `}>
                                        {isSelected && <CheckCircle size={14} />}
                                    </div>
                                </div>
                             )
                          })
                      )}
                  </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="bg-white border-t border-gray-100 p-4 pb-8 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                  <div className="flex justify-between items-end mb-4 text-sm">
                      <div className="text-gray-500">
                          已选抵扣: <span className="font-bold text-gray-800">{totalCapacity}人</span>
                      </div>
                      <div className="text-right">
                           {missingPeople > 0 ? (
                               <>
                                 <div className="text-gray-500">还需支付 (缺{missingPeople}人)</div>
                                 <div className="text-2xl font-bold text-red-500">¥{amountToPay}</div>
                               </>
                           ) : (
                               <div className="text-green-600 font-bold flex items-center gap-1">
                                   <CheckCircle size={16} /> 全额抵扣
                               </div>
                           )}
                      </div>
                  </div>
                  
                  <button 
                      onClick={handleConfirmBooking}
                      className={`w-full font-bold py-3.5 rounded-full shadow-lg transition-all flex items-center justify-center gap-2
                          ${missingPeople > 0 
                              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-orange-200' 
                              : 'bg-blue-600 text-white shadow-blue-200'}
                      `}
                  >
                      {missingPeople > 0 ? (
                          <>购买并预约 <span className="text-sm font-normal opacity-90">(¥{amountToPay})</span></>
                      ) : (
                          '立即预约'
                      )}
                  </button>
              </div>
          </div>
      );
  };

  const renderBookingSuccess = () => {
      const year = new Date().getFullYear();
      return (
          <div className="flex flex-col items-center justify-center h-full bg-white p-6 animate-in zoom-in-95 duration-300">
              <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <CheckCircle size={48} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">预约成功!</h2>
              <p className="text-gray-500 text-center mb-8">您已成功预约 VR 大空间体验<br/>请提前15分钟到达现场签到</p>
              
              <div className="w-full bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
                   <div className="space-y-4">
                       <div className="flex justify-between">
                           <span className="text-gray-400 text-sm">体验项目</span>
                           <span className="font-bold text-gray-800">VR大空间·沉浸展</span>
                       </div>
                       <div className="flex justify-between">
                           <span className="text-gray-400 text-sm">预约时间</span>
                           <span className="font-bold text-gray-800">{year}.{bookingData.date.replace('月','.').replace('日','')} {bookingData.timeSlot}</span>
                       </div>
                       <div className="flex justify-between">
                           <span className="text-gray-400 text-sm">预约人数</span>
                           <span className="font-bold text-gray-800">{bookingData.peopleCount}人</span>
                       </div>
                   </div>
              </div>

              <div className="flex flex-col w-full gap-3">
                  <button 
                      onClick={() => {
                          setBookingStep('NONE');
                          setActiveTab('MINE');
                          setMineView('SESSIONS');
                      }}
                      className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-full shadow-lg active:scale-95 transition-all"
                  >
                      查看我的场次
                  </button>
                  <button 
                      onClick={() => {
                          setBookingStep('NONE');
                          setActiveTab('HOME');
                      }}
                      className="w-full bg-gray-100 text-gray-600 font-bold py-3.5 rounded-full hover:bg-gray-200 transition-all"
                  >
                      返回首页
                  </button>
              </div>
          </div>
      );
  };

  const renderMySessions = () => {
    return (
        <div className="flex flex-col h-full bg-gray-50">
             {/* Navbar */}
             <div className="bg-white px-4 py-4 flex items-center gap-4 shadow-sm sticky top-0 z-20">
                <button onClick={() => setMineView('MENU')} className="p-1 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="font-bold text-lg text-gray-800">我的场次</h2>
            </div>

            {/* List */}
            <div className="p-4 space-y-4 pb-24">
                {mySessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center pt-20 text-gray-400">
                        <CalendarDays size={48} className="mb-2 opacity-20" />
                        <p>暂无预约场次</p>
                    </div>
                ) : (
                    mySessions.map(session => {
                        // Priority: Explicit Status (RUNNING/COMPLETED) > Time Calculation
                        let status = session.status;
                        if (status !== 'RUNNING' && status !== 'COMPLETED') {
                             status = getSessionStatus(session.timeStr);
                        }

                        let statusText = '待参加';
                        let statusClass = 'bg-blue-50 text-blue-600';
                        if (status === 'RUNNING') {
                            statusText = '已开始';
                            statusClass = 'bg-green-50 text-green-600 animate-pulse';
                        } else if (status === 'COMPLETED') {
                            statusText = '已结束';
                            statusClass = 'bg-gray-100 text-gray-500';
                        }

                        return (
                        <div key={session.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                            {/* Header Status */}
                            <div className={`px-4 py-2 flex justify-between items-center text-xs font-bold ${statusClass}`}>
                                <span>{statusText}</span>
                                {status === 'UPCOMING' && <span className="flex items-center gap-1"><Clock size={12}/> 请提前签到</span>}
                                {status === 'RUNNING' && <span className="flex items-center gap-1"><PlayCircle size={12}/> 进行中</span>}
                            </div>
                            
                            <div className="p-4 flex gap-4">
                                <div className="w-20 h-20 bg-gray-200 rounded-lg shrink-0 overflow-hidden relative">
                                     <img src="https://images.unsplash.com/photo-1622979135228-5b1ed30259a4?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover" alt="VR" />
                                     {status === 'RUNNING' && (
                                         <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                             <div className="w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                                         </div>
                                     )}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="font-bold text-gray-800 text-lg">VR大空间体验</div>
                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                        <Clock size={12} /> {session.timeStr}
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                        <MapPin size={12} /> {session.location}
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                        <Users size={12} /> {session.peopleCount}人
                                    </div>
                                </div>
                            </div>
                            
                            {status === 'UPCOMING' && (
                                <div className="px-4 pb-4 flex justify-end gap-2">
                                    <button className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50">
                                        取消预约
                                    </button>
                                    <button className="px-3 py-1.5 rounded-lg bg-blue-600 text-xs font-medium text-white hover:bg-blue-700 shadow-sm shadow-blue-200">
                                        查看详情
                                    </button>
                                </div>
                            )}
                        </div>
                    )})
                )}
            </div>
        </div>
    );
  };

  const renderMineContent = () => {
    if (mineView === 'TICKETS') {
        return (
            <div className="flex flex-col h-full bg-gray-50">
                {/* Navbar */}
                <div className="bg-white px-4 py-4 flex items-center gap-4 shadow-sm sticky top-0 z-20">
                    <button onClick={() => setMineView('MENU')} className="p-1 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="font-bold text-lg text-gray-800">我的票券</h2>
                </div>

                {/* Ticket List */}
                <div className="p-4 space-y-4 pb-24">
                    {myTickets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center pt-20 text-gray-400">
                            <Ticket size={48} className="mb-2 opacity-20" />
                            <p>暂无可用票券</p>
                        </div>
                    ) : (
                        myTickets.map(ticket => (
                            <div key={ticket.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 relative group">
                                {/* Left Color Bar */}
                                <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${ticket.status === 'UNUSED' ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                                
                                <div className="p-4 pl-6 flex justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className={`font-bold text-lg ${ticket.status === 'UNUSED' ? 'text-gray-800' : 'text-gray-400'}`}>
                                                {ticket.name}
                                            </h3>
                                            {ticket.status === 'UNUSED' && (
                                                <span className="bg-orange-100 text-orange-600 text-[10px] px-1.5 py-0.5 rounded border border-orange-200">
                                                    未使用
                                                </span>
                                            )}
                                            {ticket.status === 'USED' && (
                                                <span className="bg-blue-100 text-blue-500 text-[10px] px-1.5 py-0.5 rounded">
                                                    已使用
                                                </span>
                                            )}
                                            {ticket.status === 'EXPIRED' && (
                                                <span className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded">
                                                    已过期
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500 space-y-1 mt-2">
                                            <div className="flex items-center gap-1">
                                                <User size={12} />
                                                <span>适用人数：{ticket.peopleCount}人</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin size={12} />
                                                <span className="truncate max-w-[180px]">{ticket.storeName}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock size={12} />
                                                <span>有效期至：{ticket.validUntil}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Right Action Area */}
                                    <div className="flex flex-col items-center justify-center border-l border-dashed border-gray-200 pl-4 ml-2 gap-2">
                                        {ticket.status === 'UNUSED' ? (
                                            <>
                                                <div className="w-12 h-12 bg-gray-900 text-white rounded-lg flex items-center justify-center">
                                                    <ScanLine size={24} />
                                                </div>
                                                <span className="text-[10px] font-medium text-gray-500">去核销</span>
                                            </>
                                        ) : (
                                            <div className="w-16 h-16 rounded-full border-2 border-gray-300 flex items-center justify-center transform -rotate-12 opacity-50">
                                                <span className="font-bold text-xs text-gray-400">
                                                    {ticket.status === 'USED' ? 'USED' : 'EXPIRED'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* Decorative Circles for ticket cutout effect */}
                                <div className="absolute -top-2 right-[4.5rem] w-4 h-4 bg-gray-50 rounded-full shadow-inner"></div>
                                <div className="absolute -bottom-2 right-[4.5rem] w-4 h-4 bg-gray-50 rounded-full shadow-inner"></div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }
    
    if (mineView === 'SESSIONS') {
        return renderMySessions();
    }

    // Default Menu View
    return (
        <div className="flex flex-col bg-gray-50 min-h-full">
            {/* User Header */}
            <div className="bg-blue-600 pt-8 pb-16 px-6 text-white rounded-b-[2.5rem] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
              <div className="relative z-10 flex items-center gap-4 mt-4">
                <div className="w-16 h-16 bg-white rounded-full border-4 border-white/20 flex items-center justify-center text-3xl shadow-lg">
                   {userType === 'STAFF' ? '👩‍💼' : '👨‍🚀'}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{userType === 'STAFF' ? '工作人员' : '体验官 User'}</h2>
                  <p className="text-blue-100 text-xs mt-1 opacity-80">ID: 8839201</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="px-4 -mt-8 relative z-10">
              <div className="bg-white rounded-xl shadow-lg shadow-blue-900/5 overflow-hidden mb-4">
                <div 
                    onClick={() => setMineView('SESSIONS')}
                    className="p-5 flex items-center justify-between border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Calendar size={20} />
                    </div>
                    <span className="font-bold text-gray-800">我的场次</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-300" />
                </div>
                <div 
                    onClick={() => setMineView('TICKETS')}
                    className="p-5 flex items-center justify-between border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
                      <Ticket size={20} />
                    </div>
                    <span className="font-bold text-gray-800">我的票券</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {myTickets.filter(t => t.status === 'UNUSED').length > 0 && (
                        <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">
                            {myTickets.filter(t => t.status === 'UNUSED').length}
                        </span>
                    )}
                    <ChevronRight size={18} className="text-gray-300" />
                  </div>
                </div>
                <div className="p-5 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center group-hover:bg-pink-600 group-hover:text-white transition-colors">
                      <Gift size={20} />
                    </div>
                    <span className="font-bold text-gray-800">我的优惠券</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-300" />
                </div>
              </div>
              
              {userType === 'STAFF' && (
                  <div className="bg-white rounded-xl shadow-sm p-4 mt-4">
                      <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Staff Tools</h3>
                       <div className="grid grid-cols-4 gap-4">
                           <div className="flex flex-col items-center gap-1">
                               <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                   <ScanLine size={18} className="text-gray-600" />
                               </div>
                               <span className="text-[10px] text-gray-600">核销</span>
                           </div>
                       </div>
                  </div>
              )}
            </div>
        </div>
    );
  };

  // --- STAFF ADMIN VIEWS ---
  
  const renderAdminTickets = () => {
      return (
          <div className="flex flex-col h-full bg-gray-50">
             {/* Sub Nav */}
             <div className="bg-white p-2 mx-4 mt-4 mb-2 rounded-lg flex shadow-sm border border-gray-100">
                 <button 
                     onClick={() => setTicketSubTab('GENERATE')}
                     className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${ticketSubTab === 'GENERATE' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-50'}`}
                 >
                     生成票券
                 </button>
                 <button 
                     onClick={() => setTicketSubTab('LIST')}
                     className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${ticketSubTab === 'LIST' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-50'}`}
                 >
                     票券列表
                 </button>
             </div>

             {/* Content */}
             <div className="flex-1 overflow-y-auto p-4 pb-20">
                 {ticketSubTab === 'GENERATE' ? (
                     <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                         <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                             <Ticket className="text-purple-600" /> 
                             配置票券类型
                         </h3>
                         
                         <div className="grid grid-cols-2 gap-4 mb-8">
                             {[1, 2, 3, 4].map(num => (
                                 <button
                                     key={num}
                                     onClick={() => setGenSelectedType(num)}
                                     className={`h-24 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all
                                        ${genSelectedType === num 
                                            ? 'border-purple-500 bg-purple-50 text-purple-700' 
                                            : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200'}
                                     `}
                                 >
                                     <Users size={24} />
                                     <span className="font-bold">{num} 人票</span>
                                 </button>
                             ))}
                         </div>

                         <div className="border-t border-gray-100 pt-6">
                             <div className="flex justify-between text-sm text-gray-500 mb-4">
                                 <span>已选类型</span>
                                 <span className="font-bold text-gray-800">{genSelectedType}人体验券</span>
                             </div>
                             <button 
                                 onClick={handleGenerateTicket}
                                 className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                             >
                                 <QrCode size={18} />
                                 生成并发送
                             </button>
                         </div>
                     </div>
                 ) : (
                     <div className="space-y-3">
                         {generatedTickets.map(ticket => (
                             <div key={ticket.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                                 <div>
                                     <div className="flex items-center gap-2">
                                         <span className="font-mono font-bold text-lg text-gray-800 tracking-wider">{ticket.code}</span>
                                         <button className="text-gray-400 hover:text-purple-600"><Copy size={14}/></button>
                                     </div>
                                     <div className="text-xs text-gray-500 mt-1 flex gap-2">
                                         <span>{ticket.type}</span>
                                         <span>•</span>
                                         <span>{ticket.createdAt}</span>
                                     </div>
                                 </div>
                                 <div>
                                     <span className={`px-2 py-1 rounded text-xs font-medium
                                        ${ticket.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}
                                     `}>
                                         {ticket.status === 'ACTIVE' ? '未使用' : '已核销'}
                                     </span>
                                 </div>
                             </div>
                         ))}
                         {generatedTickets.length === 0 && (
                             <div className="text-center text-gray-400 py-10">暂无生成记录</div>
                         )}
                     </div>
                 )}
             </div>
          </div>
      );
  };

  const renderAdminControl = () => {
    // Generate all slots for the selected day
    const slots = generateTimeSlots(adminControlDate, true); // true for full day
    const dates = getNextThreeDays(); // Reuse date list for filter

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Header / Date Filter */}
            <div className="bg-white p-4 sticky top-0 z-10 shadow-sm border-b border-gray-100">
                <div className="flex overflow-x-auto gap-2 no-scrollbar">
                    {dates.map(date => (
                        <button
                            key={date}
                            onClick={() => setAdminControlDate(date)}
                            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border
                                ${adminControlDate === date 
                                    ? 'bg-purple-600 text-white border-purple-600' 
                                    : 'bg-white text-gray-500 border-gray-200'}
                            `}
                        >
                            {date}
                        </button>
                    ))}
                </div>
            </div>

            {/* Slots List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
                {slots.map((time, index) => {
                    // Find if any user has booked this slot
                    const formattedDate = adminControlDate.replace('月', '.').replace('日', '');
                    const fullTimeStr = `${new Date().getFullYear()}.${formattedDate} ${time}`;
                    // Simple matching: check if session.timeStr starts with our formatted string
                    // session.timeStr format: "YYYY.MM.DD HH:mm-HH:mm"
                    
                    const bookedSessions = mySessions.filter(s => {
                         return s.timeStr.startsWith(fullTimeStr);
                    });

                    const isBooked = bookedSessions.length > 0;
                    const session = bookedSessions[0]; // Assume 1 session per slot for simplicity here or list all

                    // Determine status for "Transfer" button
                    const isUpcoming = true; // Simplified. In real app check current time.
                    
                    // Check if transferred in vr_backstage_data (simplified check)
                    const backstageDataStr = localStorage.getItem('vr_backstage_data');
                    const isTransferred = session && backstageDataStr && backstageDataStr.includes(session.id);

                    return (
                        <div key={time} className={`rounded-xl border flex overflow-hidden ${isBooked ? 'bg-white border-purple-200 shadow-sm' : 'bg-gray-50 border-transparent'}`}>
                            {/* Time Column */}
                            <div className={`w-20 flex items-center justify-center font-mono text-sm font-bold border-r border-dashed
                                ${isBooked ? 'text-purple-600 bg-purple-50 border-purple-100' : 'text-gray-400 border-gray-200'}
                            `}>
                                {time}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 p-3 flex justify-between items-center">
                                {isBooked ? (
                                    <>
                                        <div>
                                            <div className="font-bold text-gray-800 text-sm">VR沉浸体验</div>
                                            <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                                <span className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">
                                                    <User size={10} /> {session.peopleCount}人
                                                </span>
                                                <span className="text-[10px]">{session.userName || '用户'}已预约</span>
                                            </div>
                                        </div>
                                        
                                        {/* Action */}
                                        {isTransferred ? (
                                             <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-1 rounded">已转入后厅</span>
                                        ) : (
                                            <button 
                                                onClick={() => handleTransferToBackstage(session)}
                                                className="bg-purple-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-sm active:scale-95 transition-all"
                                            >
                                                转入后厅
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <span className="text-xs text-gray-300">空闲场次</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
  };

  const renderAdminData = () => {
      return (
          <div className="flex flex-col h-full bg-gray-50 p-4 pb-20 overflow-y-auto">
              {/* Filter Bar */}
              <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex gap-3 mb-4 sticky top-0 z-10">
                  <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 flex items-center justify-between text-sm cursor-pointer">
                      <div className="flex items-center gap-2 text-gray-600">
                          <Calendar size={14} />
                          <span>{adminDateFilter}</span>
                      </div>
                      <ChevronRight size={14} className="rotate-90 text-gray-400" />
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 flex items-center justify-between text-sm cursor-pointer">
                      <div className="flex items-center gap-2 text-gray-600">
                           <MapPin size={14} />
                           <span className="truncate">延庆店</span>
                      </div>
                      <ChevronRight size={14} className="rotate-90 text-gray-400" />
                  </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg shadow-blue-200">
                      <div className="text-blue-100 text-xs mb-1">今日营收</div>
                      <div className="text-2xl font-bold">¥12,890</div>
                      <div className="text-blue-200 text-[10px] mt-1 flex items-center gap-1">
                          <span className="bg-white/20 px-1 rounded">+12%</span> 较昨日
                      </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                      <div className="text-gray-500 text-xs mb-1">接待人数</div>
                      <div className="text-2xl font-bold text-gray-800">128 <span className="text-sm font-normal text-gray-400">人</span></div>
                      <div className="text-green-500 text-[10px] mt-1">
                          满载率 85%
                      </div>
                  </div>
              </div>

              {/* Chart 1 */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2">
                          <BarChart size={16} className="text-purple-500" />
                          时段客流统计
                      </h3>
                  </div>
                  <div className="h-32 flex items-end justify-between px-2 gap-2">
                      {[30, 45, 70, 100, 60, 40, 20].map((h, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                              <div className="w-full bg-purple-100 rounded-t-sm relative h-full flex items-end overflow-hidden group-hover:bg-purple-200 transition-colors">
                                  <div className="w-full bg-purple-500 rounded-t-sm transition-all duration-500" style={{height: `${h}%`}}></div>
                              </div>
                              <span className="text-[9px] text-gray-400">{10+i}:00</span>
                          </div>
                      ))}
                  </div>
              </div>

               {/* Chart 2 */}
               <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2">
                          <PieChart size={16} className="text-orange-500" />
                          票券类型占比
                      </h3>
                  </div>
                  <div className="flex items-center gap-4">
                      <div className="w-24 h-24 rounded-full border-[12px] border-orange-500 border-r-blue-500 border-b-green-500 rotate-45"></div>
                      <div className="space-y-2 flex-1">
                          <div className="flex justify-between text-xs">
                              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span>双人票</span>
                              <span className="font-bold">45%</span>
                          </div>
                          <div className="flex justify-between text-xs">
                              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span>单人票</span>
                              <span className="font-bold">30%</span>
                          </div>
                          <div className="flex justify-between text-xs">
                              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span>家庭票</span>
                              <span className="font-bold">25%</span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  const renderAdminIdentity = () => {
      return (
          <div className="flex flex-col h-full bg-gray-50 p-6 pt-10">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center mb-6">
                  <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 border-4 border-purple-50 overflow-hidden">
                      <img src="https://ui-avatars.com/api/?name=Admin&background=random" alt="Avatar" className="w-full h-full" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">店长 · 李晓明</h2>
                  <p className="text-gray-500 text-sm mt-1">ID: STAFF_88291</p>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-50">
                      <div className="text-center">
                          <div className="text-gray-400 text-xs mb-1">所属门店</div>
                          <div className="font-bold text-gray-700">延庆度假村店</div>
                      </div>
                      <div className="text-center border-l border-gray-100">
                          <div className="text-gray-400 text-xs mb-1">管理权限</div>
                          <div className="font-bold text-purple-600">一级管理员</div>
                      </div>
                  </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                   <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 border-b border-gray-50 text-left">
                       <span className="flex items-center gap-3 font-medium text-gray-700">
                           <Settings size={18} /> 系统设置
                       </span>
                       <ChevronRight size={16} className="text-gray-400" />
                   </button>
                   <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 border-b border-gray-50 text-left">
                       <span className="flex items-center gap-3 font-medium text-gray-700">
                           <RefreshCw size={18} /> 检查更新
                       </span>
                       <span className="text-xs text-gray-400">v1.2.0</span>
                   </button>
              </div>

              <button 
                  onClick={() => setIsAdminView(false)}
                  className="mt-auto w-full bg-red-50 text-red-600 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
              >
                  <LogOut size={18} />
                  退出管理模式
              </button>
          </div>
      );
  };

  const renderAdminView = () => {
      return (
          <div className="flex flex-col h-full bg-white relative">
              {/* Top Bar for Admin */}
              <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm border-b border-gray-100 sticky top-0 z-20">
                  <div className="font-black text-lg text-purple-700 italic">ADMIN</div>
                  <div className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-500">
                      工作人员端
                  </div>
              </div>
              
              <div className="flex-1 overflow-hidden relative">
                  {adminTab === 'TICKETS' && renderAdminTickets()}
                  {adminTab === 'DATA' && renderAdminData()}
                  {adminTab === 'IDENTITY' && renderAdminIdentity()}
                  {adminTab === 'CONTROL' && renderAdminControl()}
              </div>

              {/* Admin Bottom Nav */}
              <div className="h-16 bg-white border-t border-gray-200 flex justify-around items-center px-2 shadow-[0_-5px_15px_rgba(0,0,0,0.02)] z-30">
                  <button 
                      onClick={() => setAdminTab('TICKETS')}
                      className={`flex flex-col items-center gap-1 min-w-[50px] ${adminTab === 'TICKETS' ? 'text-purple-600' : 'text-gray-400'}`}
                  >
                      <Ticket size={22} strokeWidth={adminTab === 'TICKETS' ? 2.5 : 2} />
                      <span className="text-[10px] font-bold">票券</span>
                  </button>
                   <button 
                      onClick={() => setAdminTab('CONTROL')}
                      className={`flex flex-col items-center gap-1 min-w-[50px] ${adminTab === 'CONTROL' ? 'text-purple-600' : 'text-gray-400'}`}
                  >
                      <Command size={22} strokeWidth={adminTab === 'CONTROL' ? 2.5 : 2} />
                      <span className="text-[10px] font-bold">中控</span>
                  </button>
                  <button 
                      onClick={() => setAdminTab('DATA')}
                      className={`flex flex-col items-center gap-1 min-w-[50px] ${adminTab === 'DATA' ? 'text-purple-600' : 'text-gray-400'}`}
                  >
                      <PieChart size={22} strokeWidth={adminTab === 'DATA' ? 2.5 : 2} />
                      <span className="text-[10px] font-bold">数据</span>
                  </button>
                  <button 
                      onClick={() => setAdminTab('IDENTITY')}
                      className={`flex flex-col items-center gap-1 min-w-[50px] ${adminTab === 'IDENTITY' ? 'text-purple-600' : 'text-gray-400'}`}
                  >
                      <User size={22} strokeWidth={adminTab === 'IDENTITY' ? 2.5 : 2} />
                      <span className="text-[10px] font-bold">身份</span>
                  </button>
              </div>
          </div>
      )
  };

  // Main Render Logic
  if (isAdminView) {
      return renderAdminView();
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      
      {/* View Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {bookingStep === 'BASIC' && renderBookingBasic()}
        {bookingStep === 'TICKETS' && renderBookingTickets()}
        {bookingStep === 'SUCCESS' && renderBookingSuccess()}
        
        {bookingStep === 'NONE' && (
            activeTab === 'HOME' ? (
            <div className="flex flex-col">
                {/* Header Image with Location Overlay */}
                <div className="relative h-64 w-full bg-gray-200">
                <img 
                    src="https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?q=80&w=800&auto=format&fit=crop" 
                    alt="VR Space Front Desk" 
                    className="w-full h-full object-cover"
                />
                
                {/* Manage Button (STAFF ONLY) */}
                {userType === 'STAFF' && (
                    <div className="absolute top-10 right-4 z-20">
                        <button 
                            onClick={() => setIsAdminView(true)}
                            className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-gray-800 shadow-sm border border-white/50 flex items-center gap-1 hover:bg-white transition-colors"
                        >
                            <Settings size={14} />
                            管理
                        </button>
                    </div>
                )}

                {/* Location Pill */}
                <div className="absolute top-10 left-4 z-10">
                    <div className="bg-white/95 backdrop-blur-sm pl-3 pr-4 py-2 rounded-full flex items-center gap-1 shadow-sm border border-gray-100">
                        <MapPin size={16} className="text-blue-500 fill-blue-500" />
                        <span className="text-sm font-bold text-gray-800 truncate max-w-[200px]">北京·ClubMedJoyview延庆度假村</span>
                        <span className="text-gray-400 text-[10px] ml-1">▼</span>
                    </div>
                </div>
                </div>

                {/* Main Action Cards (Overlapping) */}
                <div className="px-4 -mt-10 relative z-10">
                <div className="bg-white rounded-2xl shadow-xl p-4 border border-white">
                    <div className="grid grid-cols-2 gap-3">
                        {/* Booking Card */}
                        <div 
                            onClick={handleStartBooking}
                            className="bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl p-3 h-32 relative overflow-hidden text-white shadow-lg shadow-blue-200 cursor-pointer group hover:scale-[1.02] transition-transform"
                        >
                            <div className="relative z-10 flex flex-col h-full justify-between items-start">
                                <div className="font-bold text-lg leading-tight">预约体验</div>
                                <button className="bg-white/20 backdrop-blur-md border border-white/30 rounded-full py-1.5 px-4 text-xs font-medium flex items-center hover:bg-white/30 transition-colors">
                                    <Clock size={12} className="mr-1.5" /> 
                                    预定
                                </button>
                            </div>
                            {/* Decorative background element */}
                            <div className="absolute -bottom-2 -right-2 opacity-30 rotate-12">
                                <img src="https://cdn-icons-png.flaticon.com/512/2855/2855260.png" alt="VR" className="w-20 h-20 invert" />
                            </div>
                        </div>

                        {/* Redemption Card */}
                        <div className="bg-gradient-to-br from-orange-400 to-red-400 rounded-xl p-3 h-32 relative overflow-hidden text-white shadow-lg shadow-orange-200 group cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => setShowRedeemModal(true)}>
                            <div className="relative z-10 flex flex-col h-full justify-between items-start">
                                <div className="font-bold text-lg leading-tight">团购兑换</div>
                                <button className="bg-white/20 backdrop-blur-md border border-white/30 rounded-full py-1.5 px-4 text-xs font-medium flex items-center hover:bg-white/30 transition-colors">
                                    <Ticket size={12} className="mr-1.5" /> 
                                    兑换
                                </button>
                            </div>
                            {/* Decorative background element */}
                            <div className="absolute -bottom-2 -right-2 opacity-30 rotate-12 group-hover:scale-110 transition-transform duration-500">
                                <Gift size={64} />
                            </div>
                        </div>
                    </div>
                </div>
                </div>

                {/* Recent Reservation Section */}
                {(() => {
                    // Filter for upcoming sessions logic
                    const upcomingSessions = mySessions.filter(s => getSessionStatus(s.timeStr) === 'UPCOMING');
                    const latestSession = upcomingSessions[0]; // Assuming ordered by newest
                    
                    if (latestSession) {
                        return (
                        <div className="px-4 mt-6 animate-in slide-in-from-bottom duration-500">
                            <div className="flex items-center gap-2 mb-3">
                                <Clock className="text-blue-500" size={18} />
                                <h3 className="font-bold text-gray-800 text-lg">最近预约的场次</h3>
                            </div>

                            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 relative">
                                <div className="space-y-3 mb-4">
                                    <div className="flex text-sm">
                                        <span className="text-gray-400 w-20 shrink-0">场次时间:</span>
                                        <span className="font-medium text-gray-800">{latestSession.timeStr}</span>
                                    </div>
                                    <div className="flex text-sm">
                                        <span className="text-gray-400 w-20 shrink-0">场次地点:</span>
                                        <span className="font-medium text-gray-800">{latestSession.location}</span>
                                    </div>
                                    <div className="flex text-sm">
                                        <span className="text-gray-400 w-20 shrink-0">预约人数:</span>
                                        <span className="font-medium text-gray-800">{latestSession.peopleCount}人</span>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button 
                                        onClick={() => { setActiveTab('MINE'); setMineView('SESSIONS'); }}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-md shadow-blue-200 transition-colors"
                                    >
                                        查看详情
                                    </button>
                                </div>
                            </div>
                        </div>
                        );
                    }
                    return null;
                })()}

                {/* Extra Content */}
                <div className="px-4 mt-6 mb-4">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-gray-800 text-lg">热门活动</h3>
                        <span className="text-gray-400 text-xs">查看更多 &gt;</span>
                    </div>
                    <div className="bg-white border rounded-xl p-3 flex gap-3 shadow-sm">
                        <img src="https://picsum.photos/100/100?random=10" className="w-20 h-20 rounded-lg object-cover bg-gray-200" alt="Activity" />
                        <div className="flex-1 flex flex-col justify-between py-1">
                            <div className="font-bold text-gray-800 text-sm">周末特惠双人行</div>
                            <div className="text-xs text-gray-500">限时折扣，体验火星救援副本</div>
                            <div className="flex gap-2 mt-1">
                                <span className="px-2 py-0.5 bg-red-100 text-red-500 text-[10px] rounded">热门</span>
                                <span className="px-2 py-0.5 bg-orange-100 text-orange-500 text-[10px] rounded">特惠</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            ) : (
            renderMineContent()
            )
        )}
      </div>

      {/* Custom Bottom Tab Bar - Hide when in booking flow */}
      {bookingStep === 'NONE' && (
          <div className="absolute bottom-0 w-full h-20 bg-white border-t border-gray-100 flex justify-between items-end px-12 pb-2 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] z-50">
            <button 
            onClick={() => { setActiveTab('HOME'); setMineView('MENU'); }}
            className={`flex flex-col items-center gap-1 mb-2 ${activeTab === 'HOME' ? 'text-blue-500' : 'text-gray-400'}`}
            >
            <Home size={24} strokeWidth={activeTab === 'HOME' ? 2.5 : 2} className="transition-all" />
            <span className="text-[10px] font-bold">首页</span>
            </button>

            {/* Center Floating Button */}
            <div className="absolute left-1/2 transform -translate-x-1/2 -top-6 cursor-pointer group">
                <div className="w-16 h-16 rounded-full bg-gradient-to-b from-cyan-400 to-blue-500 shadow-lg shadow-blue-300 flex flex-col items-center justify-center text-white border-4 border-white group-hover:scale-105 transition-transform">
                    <ScanLine size={24} />
                    <span className="text-[9px] font-bold mt-0.5">现场签到</span>
                </div>
            </div>

            <button 
            onClick={() => setActiveTab('MINE')}
            className={`flex flex-col items-center gap-1 mb-2 ${activeTab === 'MINE' ? 'text-blue-500' : 'text-gray-400'}`}
            >
            <User size={24} strokeWidth={activeTab === 'MINE' ? 2.5 : 2} className="transition-all" />
            <span className="text-[10px] font-bold">我的</span>
            </button>
        </div>
      )}

      {/* Redemption Modal (Existing) */}
      {showRedeemModal && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={() => setShowRedeemModal(false)} />
          
          <div className="relative w-full bg-gradient-to-b from-[#FFF5E6] via-white to-white rounded-[2rem] p-6 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             
             {/* Close Button */}
             <button 
                onClick={() => setShowRedeemModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-20"
             >
                <X size={20} />
             </button>

             {/* Decorative Stars */}
             <Star className="absolute top-6 left-1/3 text-yellow-400 fill-yellow-400 animate-pulse" size={16} />
             <Star className="absolute top-4 right-1/3 text-yellow-400 fill-yellow-400 animate-bounce" style={{animationDuration: '3s'}} size={20} />

             {/* Title Section */}
             <div className="text-center mt-4 mb-8 relative">
                <h2 className="text-2xl font-black text-gray-900 italic transform -rotate-2 relative z-10" style={{ textShadow: '2px 2px 0px rgba(255,255,255,1)' }}>
                  兑换卡券
                </h2>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-black text-orange-500/10 tracking-widest pointer-events-none select-none">
                  COUPON
                </div>
             </div>

             {/* Platforms */}
             <div className="flex justify-center items-center gap-4 mb-2">
                {/* Meituan */}
                <div className="w-12 h-12 rounded-full bg-[#FFC300] border-2 border-white shadow-md flex items-center justify-center overflow-hidden">
                     <span className="font-bold text-xs text-black transform -rotate-12">美团</span>
                </div>
                {/* Dianping (simulated) */}
                <div className="w-12 h-12 rounded-full bg-[#FF6600] border-2 border-white shadow-md flex items-center justify-center text-white">
                     <User size={20} strokeWidth={2.5} />
                </div>
                {/* Tiktok (simulated) */}
                <div className="w-12 h-12 rounded-full bg-black border-2 border-white shadow-md flex items-center justify-center text-white relative overflow-hidden">
                    <Music size={20} className="relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/50 to-red-500/50 mix-blend-screen"></div>
                </div>
             </div>
             
             <p className="text-center text-xs text-gray-500 font-medium mb-8">团购自动验券</p>

             {/* Input */}
             <div className="bg-[#F5F5F5] rounded-xl flex items-center px-4 py-3 mb-8 border border-transparent focus-within:border-orange-200 transition-colors">
                <input 
                    type="text" 
                    placeholder="请输入优惠券兑换码" 
                    className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder:text-gray-400"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                />
                <ScanLine className="text-gray-400" size={20} />
             </div>

             {/* Button */}
             <button 
                onClick={handleRedeem}
                className="w-full bg-gradient-to-r from-[#FF8C69] to-[#FF4D4D] text-white font-bold text-lg py-3.5 rounded-full shadow-[0_8px_20px_-6px_rgba(255,87,87,0.5)] active:scale-95 transition-transform relative overflow-hidden group"
             >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-full"></div>
                兑换
             </button>

             {/* Bottom Text */}
             <div className="mt-8 text-center space-y-2">
                <p className="text-xs font-bold text-gray-700">票券使用期限为30天，请尽快使用奥~</p>
                <div className="text-[10px] text-gray-400 leading-tight px-2 scale-90">
                     本券仅限在有效期内使用，过期作废。请在核销前出示此券。最终解释权归主办方所有。
                </div>
             </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MiniProgramView;