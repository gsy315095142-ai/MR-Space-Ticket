import React, { useState, useEffect } from 'react';
import { Home, User, Ticket, Calendar, ChevronRight, MapPin, ScanLine, Gift, Clock, Star, X, Music, ArrowLeft, Users, CheckCircle, CreditCard, ChevronLeft, CalendarDays, Settings, PieChart, BarChart, QrCode, LogOut, RefreshCw, Copy, Filter, Command, PlayCircle, Share, ChevronDown, Edit, Bell, AlertCircle, Share2, ArrowRightLeft, CalendarClock, UserPlus } from 'lucide-react';

interface MiniProgramViewProps {
  userType: 'STAFF' | 'GUEST';
  resetTrigger?: number;
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

const MiniProgramView: React.FC<MiniProgramViewProps> = ({ userType, resetTrigger }) => {
  const [activeTab, setActiveTab] = useState<'HOME' | 'MINE'>('HOME');
  
  // Admin Mode States
  const [isAdminView, setIsAdminView] = useState(userType === 'STAFF');
  const [adminTab, setAdminTab] = useState<AdminTab>('TICKETS');
  const [ticketSubTab, setTicketSubTab] = useState<TicketSubTab>('GENERATE');
  
  const [generatedTickets, setGeneratedTickets] = useState<GeneratedTicketItem[]>([
      { id: 'g1', code: '18392011', type: '单人体验券', peopleCount: 1, createdAt: '2024-10-24 10:00', status: 'ACTIVE' },
      { id: 'g2', code: '29102399', type: '双人体验券', peopleCount: 2, createdAt: '2024-10-23 15:30', status: 'REDEEMED' }
  ]);
  const [genSelectedType, setGenSelectedType] = useState(1); // 1, 2, 3, 4 people
  const [adminControlDate, setAdminControlDate] = useState(''); // Init in useEffect

  // Data Statistics States
  const [dataStartDate, setDataStartDate] = useState('');
  const [dataEndDate, setDataEndDate] = useState('');
  const [dataActiveFilter, setDataActiveFilter] = useState('今天');
  const [dataSelectedStore, setDataSelectedStore] = useState('全部');
  const [showStoreOptions, setShowStoreOptions] = useState(false);

  // Modal States
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [showBookingNotice, setShowBookingNotice] = useState(false);
  const [noticeAgreed, setNoticeAgreed] = useState(false);
  
  // Modification Modals
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showAddPeopleModal, setShowAddPeopleModal] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [addPeopleCount, setAddPeopleCount] = useState(1);
  
  // Navigation States
  const [mineView, setMineView] = useState<'MENU' | 'TICKETS' | 'SESSIONS'>('MENU');
  const [bookingStep, setBookingStep] = useState<BookingStep>('NONE');

  // Data States
  const [myTickets, setMyTickets] = useState<TicketItem[]>([]);
  const [mySessions, setMySessions] = useState<SessionItem[]>([]);

  // Helper to get formatted date string: "10月25日"
  const formatDate = (date: Date) => `${date.getMonth() + 1}月${date.getDate()}日`;
  
  // Helper for YYYY-MM-DD
  const formatYMD = (date: Date) => {
      const y = date.getFullYear();
      const m = (date.getMonth() + 1).toString().padStart(2, '0');
      const d = date.getDate().toString().padStart(2, '0');
      return `${y}-${m}-${d}`;
  };

  // Reset to Home when resetTrigger changes
  useEffect(() => {
    if (resetTrigger !== undefined) {
        setActiveTab('HOME');
        setMineView('MENU');
        setBookingStep('NONE');
        
        // Close Modals
        setShowRedeemModal(false);
        setShowBookingNotice(false);
        setShowRescheduleModal(false);
        setShowAddPeopleModal(false);

        // If Guest, ensure not in admin view
        if (userType === 'GUEST') {
            setIsAdminView(false);
        }
    }
  }, [resetTrigger, userType]);

  // Init Data
  useEffect(() => {
    setAdminControlDate(formatDate(new Date()));
    const todayStr = formatYMD(new Date());
    setDataStartDate(todayStr);
    setDataEndDate(todayStr);

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

  // Auto-scroll to current time when entering Control tab
  useEffect(() => {
    if (adminTab === 'CONTROL') {
        const now = new Date();
        const h = now.getHours();
        const m = Math.floor(now.getMinutes() / 10) * 10;
        const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        
        // Short delay to ensure DOM is rendered
        setTimeout(() => {
            const element = document.getElementById(`slot-${timeStr}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 300);
    }
  }, [adminTab]);


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
        const [datePart, timeRange] = timeStr.split(' ');
        if (!datePart || !timeRange) return 'UPCOMING';
        
        const normalizedDate = datePart.replace(/\./g, '-'); 
        const endTimeStr = timeRange.split('-')[1]; 
        
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
    
    let ticketConfig = { name: '单人体验券', count: 1 };
    if (code.startsWith('2')) ticketConfig = { name: '双人体验券', count: 2 };
    else if (code.startsWith('3')) ticketConfig = { name: '三人体验券', count: 3 };
    else if (code.startsWith('4')) ticketConfig = { name: '四人体验券', count: 4 };
    else if (code.startsWith('1')) ticketConfig = { name: '单人体验券', count: 1 };
    
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
    
    setTimeout(() => {
        setMyTickets([newTicket, ...myTickets]);
        setShowRedeemModal(false);
        setCouponCode('');
        setActiveTab('MINE');
        setMineView('TICKETS');
    }, 500);
  };

  const handleStartBooking = () => {
      setBookingStep('BASIC');
      setBookingData({ 
        ...bookingData, 
        date: formatDate(new Date()), 
        timeSlot: '', 
        peopleCount: 1 
      });
      setSelectedTicketIds([]);
  };

  const handleUseTicket = () => {
      setActiveTab('HOME');
      setMineView('MENU');
      handleStartBooking();
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
          setSelectedTicketIds([...selectedTicketIds, ticketId]);
      }
  };

  const handlePreBookingCheck = () => {
      setNoticeAgreed(false);
      setShowBookingNotice(true);
  };

  const executeBooking = () => {
      const updatedTickets = myTickets.map(t => 
          selectedTicketIds.includes(t.id) ? { ...t, status: 'USED' as const } : t
      );
      setMyTickets(updatedTickets);

      const [sh, sm] = bookingData.timeSlot.split(':').map(Number);
      const endDate = new Date();
      endDate.setHours(sh, sm + 30);
      const endTimeStr = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
      const fullTimeStr = `${bookingData.timeSlot}-${endTimeStr}`;

      const year = new Date().getFullYear();
      
      const newSession: SessionItem = {
          id: Date.now().toString(),
          timeStr: `${year}.${bookingData.date.replace('月','.').replace('日','')} ${fullTimeStr}`, 
          location: '北京·ClubMedJoyview延庆度假村',
          peopleCount: bookingData.peopleCount,
          status: 'UPCOMING',
          userName: '体验用户',
          transferredToBackstage: false
      };
      setMySessions([newSession, ...mySessions]);

      setShowBookingNotice(false);
      setBookingStep('SUCCESS');
      
      setTimeout(() => {
          window.dispatchEvent(new Event('storage_update'));
          window.dispatchEvent(new Event('new_booking_created'));
      }, 100);
  };

  const handleGenerateTicket = () => {
      const prefix = genSelectedType;
      const randomPart = Math.floor(1000000 + Math.random() * 9000000); 
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

      const storageKey = 'vr_chat_messages';
      const storedMsgs = localStorage.getItem(storageKey);
      let chatHistory = storedMsgs ? JSON.parse(storedMsgs) : [];
      
      const nowTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      
      const newMessage = {
          id: Date.now(),
          text: '送您一张体验券', 
          sender: 'OTHER', 
          time: nowTime,
          type: 'TICKET_LINK',
          ticketData: userTicketPayload,
          isRedeemed: false
      };

      chatHistory.push(newMessage);
      localStorage.setItem(storageKey, JSON.stringify(chatHistory));

      window.dispatchEvent(new Event('storage_update'));
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

      const sessionWithFlag = { ...session, transferredToBackstage: true };
      const updatedData = [sessionWithFlag, ...backstageData];
      localStorage.setItem(key, JSON.stringify(updatedData));
      
      // Update User Sessions as well to mark as transferred
      const updatedUserSessions = mySessions.map(s => 
          s.id === session.id ? { ...s, transferredToBackstage: true } : s
      );
      setMySessions(updatedUserSessions);
      
      alert('已转入后厅');
      window.dispatchEvent(new Event('storage_update'));
      window.dispatchEvent(new Event('session_transferred_to_backstage'));
  };

  const handleDateFilterClick = (filter: string) => {
      setDataActiveFilter(filter);
      const today = new Date();
      let start = new Date();
      let end = new Date();

      if (filter === '今天') {
      } else if (filter === '昨天') {
          start.setDate(today.getDate() - 1);
          end.setDate(today.getDate() - 1);
      } else if (filter === '本月') {
          start.setDate(1); 
          // end is today
      } else if (filter === '上个月') {
          start.setMonth(start.getMonth() - 1);
          start.setDate(1);
          end.setDate(0); 
      }

      setDataStartDate(formatYMD(start));
      setDataEndDate(formatYMD(end));
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
          startH = now.getHours();
          startM = Math.ceil(now.getMinutes() / 10) * 10;
          if (startM === 60) {
              startH += 1;
              startM = 0;
          }
      }

      let currentH = startH;
      let currentM = startM;

      const maxSlots = fullDay ? 100 : 4; 

      while (slots.length < maxSlots) {
          if (currentH > 22 || (currentH === 22 && currentM > 0)) break; 

          const timeStr = `${currentH.toString().padStart(2, '0')}:${currentM.toString().padStart(2, '0')}`;
          slots.push(timeStr);

          currentM += 10;
          if (currentM === 60) {
              currentH += 1;
              currentM = 0;
          }
      }

      return slots;
  };

  // --- Modification Handlers ---

  const getLatestSession = () => mySessions[0];

  const handleOpenReschedule = () => {
      const session = getLatestSession();
      if (!session) return;
      if (session.transferredToBackstage || session.status !== 'UPCOMING') {
          alert("该场次已开启");
          return;
      }
      setRescheduleDate(bookingData.date);
      setRescheduleTime('');
      setShowRescheduleModal(true);
  };

  const handleConfirmReschedule = () => {
      if(!rescheduleTime) {
          alert('请选择时间');
          return;
      }
      
      const session = getLatestSession();
      const [sh, sm] = rescheduleTime.split(':').map(Number);
      const endDate = new Date();
      endDate.setHours(sh, sm + 30);
      const endTimeStr = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
      const fullTimeStr = `${rescheduleTime}-${endTimeStr}`;
      const year = new Date().getFullYear();
      const newTimeStr = `${year}.${rescheduleDate.replace('月','.').replace('日','')} ${fullTimeStr}`;

      const updatedSessions = mySessions.map(s => s.id === session.id ? {...s, timeStr: newTimeStr} : s);
      setMySessions(updatedSessions);
      
      setBookingData({...bookingData, date: rescheduleDate, timeSlot: rescheduleTime});

      setShowRescheduleModal(false);
      alert('改签成功');
  };

  const handleOpenAddPeople = () => {
      const session = getLatestSession();
      if (!session) return;
      if (session.transferredToBackstage || session.status !== 'UPCOMING') {
          alert("该场次已开启");
          return;
      }
      setAddPeopleCount(1);
      setShowAddPeopleModal(true);
  };

  const handleConfirmAddPeople = () => {
      const session = getLatestSession();
      const newTotal = session.peopleCount + addPeopleCount;
      if (newTotal > 4) {
          alert('单场次预约最多4人');
          return;
      }

      const updatedSessions = mySessions.map(s => s.id === session.id ? {...s, peopleCount: newTotal} : s);
      setMySessions(updatedSessions);
      
      setBookingData({...bookingData, peopleCount: newTotal});

      setShowAddPeopleModal(false);
      alert('人数增加成功');
  };

  // --- Render Helpers ---

  const renderBookingBasic = () => {
      const dates = getNextThreeDays();
      const timeSlots = generateTimeSlots(bookingData.date);

      return (
          <div className="flex flex-col h-full bg-white animate-in slide-in-from-right duration-300">
              <div className="px-4 py-4 flex items-center border-b border-gray-100">
                  <button onClick={() => setBookingStep('NONE')} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
                      <X size={24} />
                  </button>
                  <h2 className="font-bold text-lg text-gray-800 flex-1 text-center pr-8">预约体验</h2>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  <div>
                      <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">体验地点</h3>
                      <div className="flex items-center gap-2 text-gray-800 font-medium bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <MapPin size={18} className="text-blue-500" />
                          北京·ClubMedJoyview延庆度假村
                      </div>
                  </div>

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

                  <div>
                      <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">选择日期</h3>
                      <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
                          {dates.map(date => {
                              const isToday = date === formatDate(new Date());
                              const dayIndex = (new Date().getDay() + dates.indexOf(date)) % 7;
                              const weekDays = ['日','一','二','三','四','五','六'];

                              return (
                                <button
                                    key={date}
                                    onClick={() => setBookingData({...bookingData, date: date, timeSlot: ''})} 
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
      
      const selectedTickets = availableTickets.filter(t => selectedTicketIds.includes(t.id));
      const totalCapacity = selectedTickets.reduce((sum, t) => sum + t.peopleCount, 0);
      const missingPeople = Math.max(0, bookingData.peopleCount - totalCapacity);
      const amountToPay = missingPeople * 98;
      
      const year = new Date().getFullYear();

      return (
          <div className="flex flex-col h-full bg-gray-50 animate-in slide-in-from-right duration-300">
               <div className="bg-white px-4 py-4 flex items-center shadow-sm z-10">
                  <button onClick={() => setBookingStep('BASIC')} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
                      <ChevronLeft size={24} />
                  </button>
                  <h2 className="font-bold text-lg text-gray-800 ml-2">确认票券信息</h2>
              </div>

              <div className="flex-1 overflow-y-auto p-4 pb-24">
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
                      onClick={handlePreBookingCheck}
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
      const dateStr = `${year}-${bookingData.date.replace('月','-').replace('日','')}`;
      const code = "335577"; 

      return (
          <div className="absolute inset-0 z-50 flex flex-col items-center overflow-hidden animate-in fade-in duration-300">
              <div className="absolute inset-0">
                  <img src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover" alt="Background" />
                  <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[2px]"></div>
              </div>

              <div className="relative w-full px-4 pt-10 pb-4 flex items-center text-white/90 z-10">
                  <button 
                      onClick={() => {
                          setBookingStep('NONE');
                          setActiveTab('HOME');
                      }}
                      className="flex items-center gap-1 text-sm font-medium hover:text-white transition-colors"
                  >
                      <ChevronLeft size={20} />
                      返回首页
                  </button>
              </div>

              <div className="relative z-10 w-full flex-1 flex flex-col items-center px-6 overflow-y-auto no-scrollbar">
                  
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 mb-4 mt-2">
                      <CheckCircle size={32} className="text-white" strokeWidth={3} />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-6 tracking-wide">场次预定成功</h2>

                  <div className="text-white/90 text-sm font-medium mb-4 text-center">
                      LUMI魔法学院·XR沉浸式大空间体验
                  </div>

                  <div className="w-full bg-[#FCFBF7] rounded-xl shadow-2xl overflow-hidden mb-6 relative">
                      <div className="p-5 relative">
                          <div className="flex justify-between items-start mb-6">
                              <div>
                                  <div className="text-gray-900 font-bold text-sm">北京·ClubMedJoyview延庆度假村</div>
                                  <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                                      <MapPin size={12} />
                                      <span>3L梦幻厅</span>
                                  </div>
                              </div>
                              <button className="flex flex-col items-center text-gray-400 gap-1">
                                  <Share2 size={16} />
                                  <span className="text-[10px]">分享场次</span>
                              </button>
                          </div>

                          <div className="space-y-4 text-sm">
                              <div className="flex justify-between items-center border-b border-dashed border-gray-200 pb-3">
                                  <span className="text-gray-500">预约日期:</span>
                                  <span className="font-bold text-gray-800 font-mono">{dateStr}</span>
                              </div>
                              <div className="flex justify-between items-center border-b border-dashed border-gray-200 pb-3">
                                  <span className="text-gray-500">时段场次:</span>
                                  <div className="flex items-center gap-3">
                                      <span className="font-bold text-gray-800 font-mono">{bookingData.timeSlot}</span>
                                      <button 
                                          onClick={handleOpenReschedule}
                                          className="bg-[#BFA07A] text-white text-[10px] px-2 py-1 rounded hover:bg-[#A88C68] transition-colors"
                                      >
                                          改签
                                      </button>
                                  </div>
                              </div>
                              <div className="flex justify-between items-center border-b border-dashed border-gray-200 pb-3">
                                  <span className="text-gray-500">预约人数:</span>
                                  <div className="flex items-center gap-3">
                                      <span className="font-bold text-gray-800">{bookingData.peopleCount}人</span>
                                      <button 
                                          onClick={handleOpenAddPeople}
                                          className="bg-[#BFA07A] text-white text-[10px] px-2 py-1 rounded hover:bg-[#A88C68] transition-colors"
                                      >
                                          增加
                                      </button>
                                  </div>
                              </div>
                              <div className="flex justify-between items-center pb-2">
                                  <span className="text-gray-500">联系人电话:</span>
                                  <div className="flex items-center gap-2">
                                      <span className="font-bold text-gray-800 font-mono">13959213445</span>
                                      <Edit size={14} className="text-gray-400" />
                                  </div>
                              </div>
                          </div>

                          <div className="bg-[#F5F2EA] rounded-lg p-3 mt-4 flex items-start gap-2">
                              <AlertCircle size={14} className="text-gray-500 mt-0.5 shrink-0" />
                              <p className="text-[10px] text-gray-500 leading-tight">
                                  请确保您的手机畅通，方便服务人员和您联系
                              </p>
                          </div>
                      </div>

                      <div className="bg-[#2C2C2C] px-5 py-3 flex items-center gap-2">
                          <Bell size={14} className="text-[#D4B68B]" />
                          <span className="text-[#D4B68B] text-[10px]">
                              温馨提示:请提前15分钟到场，预留创建角色的时间
                          </span>
                      </div>
                  </div>

                  <div className="w-full flex flex-col items-center mb-10">
                      <div className="text-white/80 text-sm mb-2 flex items-center gap-1 cursor-pointer">
                          查看角色激活码 <ChevronDown size={14} />
                      </div>
                      
                      <div className="w-full bg-white rounded-xl p-5 shadow-lg">
                          <div className="flex justify-between items-center mb-2">
                              <div className="flex flex-col items-center flex-1 border-r border-gray-100 pr-4">
                                  <button className="flex flex-col items-center gap-1 text-gray-500">
                                      <ArrowRightLeft size={18} />
                                      <span className="text-[10px]">转让激活码</span>
                                  </button>
                              </div>
                              
                              <div className="flex flex-col items-center flex-[2]">
                                  <div className="text-xs text-gray-500 mb-1">您的角色激活码</div>
                                  <div className="text-3xl font-bold text-[#A67C52] tracking-widest font-mono">
                                      {code}
                                  </div>
                              </div>

                              <div className="flex flex-col items-center flex-1 border-l border-gray-100 pl-4">
                                  <button className="flex flex-col items-center gap-1 text-gray-500">
                                      <ScanLine size={18} />
                                      <span className="text-[10px]">扫码激活</span>
                                  </button>
                              </div>
                          </div>
                          
                          <div className="text-center text-[10px] text-gray-400 mt-4">
                              请前往现场扫描体验指南二维码，即可激活角色
                          </div>
                      </div>
                  </div>
              </div>

              {/* Reschedule Modal */}
              {showRescheduleModal && (
                  <div className="absolute inset-0 z-[60] flex items-end sm:items-center justify-center">
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRescheduleModal(false)}></div>
                      <div className="relative w-full bg-white rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
                          <div className="flex justify-between items-center mb-6">
                              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                  <CalendarClock size={20} className="text-blue-500"/> 改签场次
                              </h3>
                              <button onClick={() => setShowRescheduleModal(false)}><X size={20} className="text-gray-400"/></button>
                          </div>
                          
                          <div className="space-y-4 mb-6">
                              <div>
                                  <label className="text-xs font-bold text-gray-500 mb-2 block">选择日期</label>
                                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                      {getNextThreeDays().map(date => (
                                          <button 
                                              key={date}
                                              onClick={() => { setRescheduleDate(date); setRescheduleTime(''); }}
                                              className={`px-3 py-2 rounded-lg border text-sm whitespace-nowrap ${rescheduleDate === date ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-200 text-gray-600'}`}
                                          >
                                              {date}
                                          </button>
                                      ))}
                                  </div>
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-gray-500 mb-2 block">选择时间</label>
                                  <div className="grid grid-cols-4 gap-2 h-32 overflow-y-auto">
                                      {generateTimeSlots(rescheduleDate).map(time => (
                                          <button 
                                              key={time}
                                              onClick={() => setRescheduleTime(time)}
                                              className={`py-1.5 rounded text-xs font-medium border ${rescheduleTime === time ? 'bg-blue-50 text-blue-600 border-blue-500' : 'border-gray-200 text-gray-600'}`}
                                          >
                                              {time}
                                          </button>
                                      ))}
                                  </div>
                              </div>
                          </div>
                          
                          <button 
                              onClick={handleConfirmReschedule}
                              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200"
                          >
                              确认改签
                          </button>
                      </div>
                  </div>
              )}

              {/* Add People Modal */}
              {showAddPeopleModal && (
                  <div className="absolute inset-0 z-[60] flex items-end sm:items-center justify-center">
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddPeopleModal(false)}></div>
                      <div className="relative w-full bg-white rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
                          <div className="flex justify-between items-center mb-6">
                              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                  <UserPlus size={20} className="text-blue-500"/> 增加人数
                              </h3>
                              <button onClick={() => setShowAddPeopleModal(false)}><X size={20} className="text-gray-400"/></button>
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-xl mb-6">
                              <div className="flex justify-between items-center mb-4">
                                  <span className="text-gray-600 font-medium">当前人数</span>
                                  <span className="text-gray-900 font-bold text-lg">{bookingData.peopleCount}人</span>
                              </div>
                              <div className="flex justify-between items-center border-t border-gray-200 pt-4">
                                  <span className="text-gray-600 font-medium">新增人数</span>
                                  <div className="flex items-center gap-3">
                                      <button 
                                          onClick={() => setAddPeopleCount(Math.max(1, addPeopleCount - 1))}
                                          className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500"
                                      >
                                          -
                                      </button>
                                      <span className="font-bold text-xl w-6 text-center">{addPeopleCount}</span>
                                      <button 
                                          onClick={() => setAddPeopleCount(Math.min(3, addPeopleCount + 1))} // Cap at a reasonable +3
                                          className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500"
                                      >
                                          +
                                      </button>
                                  </div>
                              </div>
                              <div className="flex justify-between items-center border-t border-gray-200 pt-4 mt-4 text-sm">
                                  <span className="text-gray-500">需补差价 (¥98/人)</span>
                                  <span className="text-red-500 font-bold text-lg">¥{addPeopleCount * 98}</span>
                              </div>
                          </div>
                          
                          <button 
                              onClick={handleConfirmAddPeople}
                              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200"
                          >
                              支付并增加
                          </button>
                      </div>
                  </div>
              )}
          </div>
      );
  };

  const renderAdminTickets = () => {
      return (
          <div className="flex flex-col h-full bg-gray-50">
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
                    <div className="space-y-4">
                        {/* Filter Card */}
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="mb-4">
                                <div className="font-bold text-gray-800 mb-2 text-sm">查询日期:</div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="bg-gray-50 flex-1 py-2 px-3 rounded-lg flex justify-between items-center text-sm text-gray-500">
                                        <span>{dataStartDate || '请选择日期'}</span>
                                        <Calendar size={14} className="text-gray-400" />
                                    </div>
                                    <span className="text-gray-800 font-bold">至</span>
                                    <div className="bg-gray-50 flex-1 py-2 px-3 rounded-lg flex justify-between items-center text-sm text-gray-500">
                                        <span>{dataEndDate || '请选择日期'}</span>
                                        <Calendar size={14} className="text-gray-400" />
                                    </div>
                                </div>
                                <div className="flex justify-between gap-2">
                                    {['昨天', '今天', '上个月', '本月'].map((label) => (
                                        <button 
                                                key={label} 
                                                onClick={() => handleDateFilterClick(label)}
                                                className={`flex-1 py-1.5 rounded-full text-xs transition-colors border ${dataActiveFilter === label ? 'bg-blue-500 text-white border-blue-500 shadow-sm shadow-blue-200' : 'bg-white text-blue-400 border-blue-200 hover:bg-blue-50'}`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <div className="font-bold text-gray-800 mb-2 text-sm">查询酒店:</div>
                                <div className="relative">
                                    <button 
                                        onClick={() => setShowStoreOptions(!showStoreOptions)}
                                        className="bg-gray-50 w-full py-2 px-3 rounded-lg text-sm text-gray-500 flex justify-between items-center"
                                    >
                                        <span>{dataSelectedStore}</span> 
                                        <ChevronDown size={16} className={`text-blue-400 transition-transform ${showStoreOptions ? 'rotate-180' : ''}`}/>
                                    </button>
                                    
                                    {showStoreOptions && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95">
                                            {['全部', '北京·ClubMedJoyview延庆度假村', '秦皇岛·阿那亚店', '成都·太古里店'].map(store => (
                                                <div 
                                                    key={store}
                                                    onClick={() => {
                                                        setDataSelectedStore(store);
                                                        setShowStoreOptions(false);
                                                    }}
                                                    className={`px-4 py-3 text-sm border-b border-gray-50 hover:bg-blue-50 cursor-pointer flex justify-between items-center
                                                        ${dataSelectedStore === store ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-gray-600'}
                                                    `}
                                                >
                                                    {store}
                                                    {dataSelectedStore === store && <CheckCircle size={14} />}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Stats Card */}
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                                    <h3 className="font-bold text-gray-800">票券统计</h3>
                                </div>
                                <ChevronDown size={16} className="text-gray-400" />
                            </div>
                            
                            <div className="space-y-3">
                                    <div className="bg-gradient-to-b from-blue-100/50 to-blue-50/20 p-4 rounded-xl text-center border border-blue-50">
                                        <div className="text-gray-600 font-bold text-sm mb-2">二维码生成票券</div>
                                        <div className="flex justify-center gap-6 items-baseline">
                                            <span className="text-xs text-gray-500">数量: <span className="text-2xl font-bold text-blue-600 font-mono">5973</span> 张</span>
                                            <span className="text-xs text-gray-500">人数: <span className="text-2xl font-bold text-blue-600 font-mono">118102</span> 人</span>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-b from-blue-100/50 to-blue-50/20 p-4 rounded-xl text-center border border-blue-50">
                                        <div className="text-gray-600 font-bold text-sm mb-2">领取票券</div>
                                        <div className="flex justify-center gap-6 items-baseline">
                                            <span className="text-xs text-gray-500">数量: <span className="text-2xl font-bold text-blue-600 font-mono">301271</span> 张</span>
                                            <span className="text-xs text-gray-500">人数: <span className="text-2xl font-bold text-blue-600 font-mono">912</span> 人</span>
                                        </div>
                                    </div>
                            </div>
                        </div>
                        
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
                             <div className="text-center text-gray-400 py-4 text-xs">暂无生成记录</div>
                         )}
                     </div>
                    </div>
                 )}
             </div>
          </div>
      );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative overflow-hidden">
        {/* If booking success, full screen overlay */}
        {bookingStep === 'SUCCESS' && renderBookingSuccess()}

        {/* If booking flow active (basic or tickets), show modal/overlay style */}
        {bookingStep !== 'NONE' && bookingStep !== 'SUCCESS' && (
            <div className="absolute inset-0 z-50 bg-white">
                {bookingStep === 'BASIC' && renderBookingBasic()}
                {bookingStep === 'TICKETS' && renderBookingTickets()}
            </div>
        )}

        {/* Main Content */}
        {isAdminView ? (
            /* Admin View Structure */
            <div className="flex flex-col h-full">
                {/* Header */}
                 <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between shadow-md shrink-0">
                     <div className="font-bold text-lg">工作人员端</div>
                     <div className="text-xs bg-slate-800 px-2 py-1 rounded border border-slate-700">
                        {adminTab === 'TICKETS' && '票券管理'}
                        {adminTab === 'DATA' && '数据看板'}
                        {adminTab === 'IDENTITY' && '核销验证'}
                        {adminTab === 'CONTROL' && '中控管理'}
                     </div>
                 </div>
                 
                 {/* Content */}
                 <div className="flex-1 overflow-hidden">
                     {adminTab === 'TICKETS' && renderAdminTickets()}
                     {adminTab === 'DATA' && (
                         <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                             <BarChart size={40} className="opacity-20"/>
                             <span className="text-sm">数据看板功能开发中</span>
                         </div>
                     )}
                     {adminTab === 'IDENTITY' && (
                         <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                             <ScanLine size={40} className="opacity-20"/>
                             <span className="text-sm">核销功能开发中</span>
                         </div>
                     )}
                     {adminTab === 'CONTROL' && (
                         <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                             <Settings size={40} className="opacity-20"/>
                             <span className="text-sm">中控系统开发中</span>
                         </div>
                     )}
                 </div>

                 {/* Tab Bar */}
                 <div className="h-14 bg-white border-t border-gray-200 flex items-center justify-around text-[10px] text-gray-500 shrink-0">
                    <button onClick={() => setAdminTab('TICKETS')} className={`flex flex-col items-center gap-1 ${adminTab === 'TICKETS' ? 'text-blue-600' : ''}`}>
                        <Ticket size={20} />
                        票券
                    </button>
                    <button onClick={() => setAdminTab('DATA')} className={`flex flex-col items-center gap-1 ${adminTab === 'DATA' ? 'text-blue-600' : ''}`}>
                        <PieChart size={20} />
                        数据
                    </button>
                     <button onClick={() => setAdminTab('IDENTITY')} className={`flex flex-col items-center gap-1 ${adminTab === 'IDENTITY' ? 'text-blue-600' : ''}`}>
                        <ScanLine size={20} />
                        核销
                    </button>
                    <button onClick={() => setAdminTab('CONTROL')} className={`flex flex-col items-center gap-1 ${adminTab === 'CONTROL' ? 'text-blue-600' : ''}`}>
                        <Settings size={20} />
                        中控
                    </button>
                 </div>
            </div>
        ) : (
            /* Guest View Structure */
            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto no-scrollbar relative">
                    {/* HOME TAB */}
                    {activeTab === 'HOME' && (
                        <div className="min-h-full bg-[#F5F5F5]">
                            {/* Banner */}
                            <div className="relative h-64 w-full bg-slate-800">
                                <img src="https://images.unsplash.com/photo-1626387346567-38778f0e8169?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover opacity-80" alt="Banner" />
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                    <h1 className="text-white text-xl font-bold mb-1">LUMI魔法学院</h1>
                                    <p className="text-white/80 text-xs flex items-center gap-1"><MapPin size={12}/> 北京·ClubMedJoyview延庆度假村</p>
                                </div>
                            </div>
    
                            {/* Quick Actions */}
                            <div className="p-4 -mt-6 relative z-10">
                                <div className="bg-white rounded-xl shadow-lg p-4 flex justify-between items-center mb-4">
                                    <button onClick={handleStartBooking} className="flex-1 flex flex-col items-center gap-2 border-r border-gray-100">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                            <CalendarClock size={20} />
                                        </div>
                                        <span className="text-xs font-bold text-gray-700">预约体验</span>
                                    </button>
                                    <button onClick={() => { setActiveTab('MINE'); setMineView('TICKETS'); }} className="flex-1 flex flex-col items-center gap-2">
                                        <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                            <Ticket size={20} />
                                        </div>
                                        <span className="text-xs font-bold text-gray-700">我的票券</span>
                                    </button>
                                </div>
    
                                {/* Info Cards */}
                                 <div className="space-y-3">
                                     <div className="bg-white p-4 rounded-xl shadow-sm">
                                         <div className="flex justify-between items-center mb-3">
                                             <h3 className="font-bold text-gray-800 text-sm">今日场次</h3>
                                             <span className="text-xs text-gray-400">10:00 - 22:00</span>
                                         </div>
                                         <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                             {['14:00', '14:10', '14:20', '14:30', '14:40'].map(t => (
                                                 <span key={t} className="px-2 py-1 bg-gray-50 rounded text-xs text-gray-600 border border-gray-100 whitespace-nowrap">{t}</span>
                                             ))}
                                         </div>
                                     </div>
                                     
                                     <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3">
                                         <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                            <img src="https://images.unsplash.com/photo-1622979135225-d2ba269fb1bd?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover" />
                                         </div>
                                         <div className="flex-1">
                                             <h4 className="font-bold text-gray-800 text-sm mb-1">新手指南</h4>
                                             <p className="text-xs text-gray-500 line-clamp-2">第一次来玩？查看这里快速了解游戏规则和注意事项。</p>
                                         </div>
                                         <ChevronRight size={16} className="text-gray-300" />
                                     </div>
                                 </div>
                            </div>
                         </div>
                    )}

                    {/* MINE TAB */}
                    {activeTab === 'MINE' && (
                        <div className="min-h-full bg-gray-50">
                        {/* Header */}
                        <div className="bg-slate-900 text-white pt-12 pb-20 px-6 relative overflow-hidden">
                             <div className="relative z-10 flex items-center gap-4">
                                 <div className="w-16 h-16 rounded-full border-2 border-white/30 overflow-hidden">
                                     <img src="https://picsum.photos/200?random=88" className="w-full h-full object-cover" />
                                 </div>
                                 <div>
                                     <div className="text-lg font-bold">微信用户</div>
                                     <div className="text-xs text-white/60 bg-white/10 px-2 py-0.5 rounded-full inline-block mt-1">ID: 8839201</div>
                                 </div>
                             </div>
                             {/* Decorative Circles */}
                             <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                        </div>

                        {/* Content Card */}
                        <div className="-mt-10 mx-4 bg-white rounded-xl shadow-sm min-h-[400px] overflow-hidden flex flex-col">
                            {/* Tabs within Mine */}
                            <div className="flex border-b border-gray-100">
                                <button 
                                    onClick={() => setMineView('MENU')}
                                    className={`flex-1 py-3 text-sm font-bold text-center ${mineView === 'MENU' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-gray-400'}`}
                                >
                                    个人中心
                                </button>
                                <button 
                                    onClick={() => setMineView('TICKETS')}
                                    className={`flex-1 py-3 text-sm font-bold text-center ${mineView === 'TICKETS' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-gray-400'}`}
                                >
                                    我的票券
                                </button>
                                <button 
                                    onClick={() => setMineView('SESSIONS')}
                                    className={`flex-1 py-3 text-sm font-bold text-center ${mineView === 'SESSIONS' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-gray-400'}`}
                                >
                                    我的场次
                                </button>
                            </div>

                            <div className="p-4 flex-1">
                                {mineView === 'MENU' && (
                                    <div className="space-y-4">
                                        <div 
                                            onClick={() => setShowRedeemModal(true)}
                                            className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-lg border border-orange-100 cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                                                    <Gift size={16} />
                                                </div>
                                                <span className="font-bold text-gray-800 text-sm">兑换优惠券/体验券</span>
                                            </div>
                                            <ChevronRight size={16} className="text-gray-400" />
                                        </div>

                                        <div className="space-y-1">
                                            {[
                                                { icon: Copy, label: '服务协议', color: 'text-gray-600' },
                                                { icon: CheckCircle, label: '隐私政策', color: 'text-gray-600' },
                                                { icon: User, label: '联系客服', color: 'text-gray-600' },
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                                                     <div className="flex items-center gap-3">
                                                         <item.icon size={18} className="text-gray-400" />
                                                         <span className="text-sm font-medium text-gray-700">{item.label}</span>
                                                     </div>
                                                     <ChevronRight size={16} className="text-gray-300" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {mineView === 'TICKETS' && (
                                    <div className="space-y-3">
                                        {myTickets.length === 0 ? (
                                            <div className="text-center py-10 text-gray-400 text-sm">暂无票券</div>
                                        ) : (
                                            myTickets.map(ticket => (
                                                <div key={ticket.id} className={`relative overflow-hidden rounded-xl border ${ticket.status === 'UNUSED' ? 'border-orange-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
                                                    <div className="p-4 flex justify-between items-center relative z-10">
                                                        <div>
                                                            <div className={`font-bold text-lg ${ticket.status === 'UNUSED' ? 'text-orange-500' : 'text-gray-500'}`}>{ticket.name}</div>
                                                            <div className="text-xs text-gray-400 mt-1">有效期至: {ticket.validUntil}</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-sm font-bold text-gray-700">{ticket.peopleCount}人票</div>
                                                            <div className={`text-xs px-2 py-0.5 rounded mt-1 inline-block ${ticket.status === 'UNUSED' ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-gray-500'}`}>
                                                                {ticket.status === 'UNUSED' ? '未使用' : ticket.status === 'USED' ? '已使用' : '已过期'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {ticket.status === 'UNUSED' && (
                                                        <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-orange-100/50 rounded-full blur-xl"></div>
                                                    )}
                                                    {ticket.status === 'UNUSED' && (
                                                        <div className="px-4 pb-3 pt-0">
                                                            <button 
                                                                onClick={handleUseTicket}
                                                                className="w-full py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-xs font-bold rounded-lg shadow-sm active:scale-95 transition-transform"
                                                            >
                                                                立即使用
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                                {mineView === 'SESSIONS' && (
                                    <div className="space-y-3">
                                         {mySessions.length === 0 ? (
                                            <div className="text-center py-10 text-gray-400 text-sm">暂无预约场次</div>
                                        ) : (
                                            mySessions.map(session => (
                                                <div key={session.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="font-bold text-gray-800 text-sm">{session.timeStr}</div>
                                                        <span className={`text-xs px-2 py-0.5 rounded font-medium
                                                            ${session.status === 'UPCOMING' ? 'bg-blue-50 text-blue-600' : 
                                                              session.status === 'RUNNING' ? 'bg-green-50 text-green-600' :
                                                              'bg-gray-100 text-gray-500'}
                                                        `}>
                                                            {session.status === 'UPCOMING' ? '待开始' : 
                                                             session.status === 'RUNNING' ? '进行中' : '已结束'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                                                        <MapPin size={12} />
                                                        {session.location}
                                                    </div>
                                                    <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                                                        <div className="text-xs text-gray-500">人数: <span className="text-gray-800 font-bold">{session.peopleCount}人</span></div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                     </div>
                    )}
                </div>

                {/* Tab Bar */}
                <div className="h-16 bg-white border-t border-gray-200 flex items-center justify-around z-20 shrink-0">
                    <button onClick={() => setActiveTab('HOME')} className={`flex flex-col items-center gap-1 w-full h-full justify-center ${activeTab === 'HOME' ? 'text-blue-600' : 'text-gray-400'}`}>
                        <Home size={24} strokeWidth={activeTab === 'HOME' ? 2.5 : 2} />
                        <span className="text-[10px] font-medium">首页</span>
                    </button>
                    <button onClick={() => setActiveTab('MINE')} className={`flex flex-col items-center gap-1 w-full h-full justify-center ${activeTab === 'MINE' ? 'text-blue-600' : 'text-gray-400'}`}>
                        <User size={24} strokeWidth={activeTab === 'MINE' ? 2.5 : 2} />
                        <span className="text-[10px] font-medium">我的</span>
                    </button>
                </div>
            </div>
        )}

      {/* Global Modals */}
      {/* Redeem Modal */}
      {showRedeemModal && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRedeemModal(false)}></div>
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm relative z-10 animate-in fade-in zoom-in-95">
                <button onClick={() => setShowRedeemModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
                <h3 className="text-lg font-bold text-gray-800 mb-6 text-center">兑换票券</h3>
                <input 
                    type="text" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="请输入兑换码 / 优惠券码"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:border-blue-500 text-center font-mono tracking-widest text-lg"
                />
                <button 
                    onClick={handleRedeem}
                    disabled={!couponCode}
                    className="w-full bg-gradient-to-r from-orange-400 to-orange-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-200 disabled:opacity-50 disabled:shadow-none transition-all"
                >
                    立即兑换
                </button>
            </div>
        </div>
      )}

      {/* Booking Notice Modal */}
      {showBookingNotice && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
            <div className="bg-white rounded-2xl w-full max-w-sm relative z-10 overflow-hidden flex flex-col max-h-[80%] animate-in slide-in-from-bottom duration-300">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">预订须知</h3>
                    <button onClick={() => setShowBookingNotice(false)}><X size={20} className="text-gray-400"/></button>
                </div>
                <div className="p-5 overflow-y-auto text-sm text-gray-600 space-y-3 leading-relaxed">
                    <p className="font-bold text-gray-800">1. 到场时间</p>
                    <p>请务必提前15分钟到达现场，进行检票、穿戴设备及新手引导。迟到可能导致体验时间缩短。</p>
                    <p className="font-bold text-gray-800 mt-2">2. 着装建议</p>
                    <p>建议穿着轻便舒适的衣物和鞋子，避免穿着高跟鞋或裙子，以免影响体验动作。</p>
                    <p className="font-bold text-gray-800 mt-2">3. 健康状况</p>
                    <p>患有心脏病、高血压、严重眩晕症、癫痫及孕妇不建议参与体验。酒后严禁参与。</p>
                    <p className="font-bold text-gray-800 mt-2">4. 退改规则</p>
                    <p>开场前2小时可免费改签一次。开场前2小时内不可退改。</p>
                </div>
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-2 mb-4" onClick={() => setNoticeAgreed(!noticeAgreed)}>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${noticeAgreed ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                            {noticeAgreed && <CheckCircle size={14} className="text-white" />}
                        </div>
                        <span className="text-xs text-gray-600">我已阅读并同意以上须知</span>
                    </div>
                    <button 
                        onClick={executeBooking}
                        disabled={!noticeAgreed}
                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        确认并支付
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default MiniProgramView;