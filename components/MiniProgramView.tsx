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
  
  const [generatedTickets, setGeneratedTickets] = useState<GeneratedTicketItem[]>([]);
  // Stats State
  const [ticketStats, setTicketStats] = useState({ genCount: 0, genPeople: 0, claimCount: 0, claimPeople: 0 });

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

  // --- Helper: Calculate Stats ---
  const calculateStats = () => {
      const gen = JSON.parse(localStorage.getItem('vr_generated_tickets') || '[]');
      const claimed = JSON.parse(localStorage.getItem('vr_user_tickets') || '[]');
      
      setTicketStats({
          genCount: gen.length,
          genPeople: gen.reduce((sum: number, t: any) => sum + (t.peopleCount || 0), 0),
          claimCount: claimed.length,
          claimPeople: claimed.reduce((sum: number, t: any) => sum + (t.peopleCount || 0), 0)
      });
  };

  // Init Data
  useEffect(() => {
    setAdminControlDate(formatDate(new Date()));
    const todayStr = formatYMD(new Date());
    setDataStartDate(todayStr);
    setDataEndDate(todayStr);

    // Load Tickets (User)
    const storedTickets = localStorage.getItem('vr_user_tickets');
    if (storedTickets) {
        setMyTickets(JSON.parse(storedTickets));
    } else {
        const defaultUserTickets = [
        {
            id: 'init-1',
            name: '单人体验券',
            peopleCount: 1,
            storeName: '北京·ClubMedJoyview延庆度假村',
            validUntil: '2024-12-31',
            status: 'EXPIRED' as const
        }
        ];
        setMyTickets(defaultUserTickets);
    }

    // Load Generated Tickets (Staff)
    const storedGenTickets = localStorage.getItem('vr_generated_tickets');
    if (storedGenTickets) {
        setGeneratedTickets(JSON.parse(storedGenTickets));
    } else {
        const defaultGenTickets: GeneratedTicketItem[] = [
            { id: 'g1', code: '18392011', type: '单人体验券', peopleCount: 1, createdAt: '2024-10-24 10:00', status: 'ACTIVE' },
            { id: 'g2', code: '29102399', type: '双人体验券', peopleCount: 2, createdAt: '2024-10-23 15:30', status: 'REDEEMED' }
        ];
        setGeneratedTickets(defaultGenTickets);
        localStorage.setItem('vr_generated_tickets', JSON.stringify(defaultGenTickets));
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

    // Initial Calc
    calculateStats();

    // Listen for updates
    const handleStorageChange = () => {
        const updatedTickets = localStorage.getItem('vr_user_tickets');
        if (updatedTickets) setMyTickets(JSON.parse(updatedTickets));
        
        const updatedSessions = localStorage.getItem('vr_sessions');
        if (updatedSessions) setMySessions(JSON.parse(updatedSessions));

        const updatedGen = localStorage.getItem('vr_generated_tickets');
        if (updatedGen) setGeneratedTickets(JSON.parse(updatedGen));
        
        // Recalculate stats whenever storage updates
        calculateStats();
    };

    window.addEventListener('storage_update', handleStorageChange);
    return () => window.removeEventListener('storage_update', handleStorageChange);
  }, []);

  // Sync myTickets changes to localStorage
  useEffect(() => {
      if (myTickets.length > 0) {
        localStorage.setItem('vr_user_tickets', JSON.stringify(myTickets));
        calculateStats(); // Recalc when user tickets change
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
            const container = document.getElementById('admin-control-list');
            const element = document.getElementById(`slot-${timeStr}`);
            
            if (container && element) {
                // Manually calculate scroll position to avoid scrolling the entire page
                const top = element.offsetTop;
                const containerHeight = container.clientHeight;
                const elementHeight = element.clientHeight;
                
                container.scrollTo({
                    top: top - containerHeight / 2 + elementHeight / 2,
                    behavior: 'smooth'
                });
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

      // Save to state AND localStorage immediately
      const updatedGenList = [newGenTicket, ...generatedTickets];
      setGeneratedTickets(updatedGenList);
      localStorage.setItem('vr_generated_tickets', JSON.stringify(updatedGenList));
      calculateStats(); // Update stats immediately

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
                                            <span className="text-xs text-gray-500">数量: <span className="text-2xl font-bold text-blue-600 font-mono">{ticketStats.genCount}</span> 张</span>
                                            <span className="text-xs text-gray-500">人数: <span className="text-2xl font-bold text-blue-600 font-mono">{ticketStats.genPeople}</span> 人</span>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-b from-blue-100/50 to-blue-50/20 p-4 rounded-xl text-center border border-blue-50">
                                        <div className="text-gray-600 font-bold text-sm mb-2">领取票券</div>
                                        <div className="flex justify-center gap-6 items-baseline">
                                            <span className="text-xs text-gray-500">数量: <span className="text-2xl font-bold text-blue-600 font-mono">{ticketStats.claimCount}</span> 张</span>
                                            <span className="text-xs text-gray-500">人数: <span className="text-2xl font-bold text-blue-600 font-mono">{ticketStats.claimPeople}</span> 人</span>
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

  const renderAdminControl = () => {
    const slots = generateTimeSlots(adminControlDate, true); 
    const dates = getNextThreeDays(); 

    return (
        <div className="flex flex-col h-full bg-gray-50">
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

            <div id="admin-control-list" className="flex-1 overflow-y-auto p-4 space-y-3 pb-24 relative">
                {slots.map((time, index) => {
                    const formattedDate = adminControlDate.replace('月', '.').replace('日', '');
                    const fullTimeStr = `${new Date().getFullYear()}.${formattedDate} ${time}`;
                    
                    const bookedSessions = mySessions.filter(s => {
                         return s.timeStr.startsWith(fullTimeStr);
                    });

                    const isBooked = bookedSessions.length > 0;
                    const session = bookedSessions[0]; 

                    const backstageDataStr = localStorage.getItem('vr_backstage_data');
                    const isTransferred = session && backstageDataStr && backstageDataStr.includes(session.id);

                    return (
                        <div key={time} id={`slot-${time}`} className={`rounded-xl border flex overflow-hidden ${isBooked ? 'bg-white border-purple-200 shadow-sm' : 'bg-gray-50 border-transparent'}`}>
                            <div className={`w-20 flex items-center justify-center font-mono text-sm font-bold border-r border-dashed
                                ${isBooked ? 'text-purple-600 bg-purple-50 border-purple-100' : 'text-gray-400 border-gray-200'}
                            `}>
                                {time}
                            </div>
                            
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
    // Reuse admin data logic
    return (
      <div className="flex flex-col h-full bg-gray-100">
          <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-20">
              <div className="w-8"></div> 
              <h2 className="text-lg font-bold text-gray-800">数据统计</h2>
              <button className="flex flex-col items-center text-gray-500">
                  <Share size={18} />
                  <span className="text-[10px]">导出</span>
              </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
              <div className="bg-white rounded-xl p-4 shadow-sm relative z-10">
                  <div className="mb-4">
                      <label className="text-sm font-bold text-gray-700 block mb-2">查询日期:</label>
                      <div className="flex items-center gap-2 mb-3">
                          <div className="bg-gray-50 flex-1 py-1 px-2 rounded-lg text-sm text-gray-600 flex justify-between items-center border border-gray-100 relative">
                              <input 
                                type="date" 
                                value={dataStartDate}
                                onChange={(e) => {
                                    setDataStartDate(e.target.value);
                                    setDataActiveFilter('custom');
                                }}
                                className="bg-transparent w-full h-full outline-none text-xs text-gray-600"
                              />
                          </div>
                          <span className="text-gray-400 font-medium text-xs">至</span>
                          <div className="bg-gray-50 flex-1 py-1 px-2 rounded-lg text-sm text-gray-400 flex justify-between items-center border border-gray-100 relative">
                               <input 
                                type="date" 
                                value={dataEndDate}
                                onChange={(e) => {
                                    setDataEndDate(e.target.value);
                                    setDataActiveFilter('custom');
                                }}
                                className="bg-transparent w-full h-full outline-none text-xs text-gray-600"
                              />
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
                  <div className="relative">
                      <label className="text-sm font-bold text-gray-700 block mb-2">查询酒店:</label>
                      <button 
                         onClick={() => setShowStoreOptions(!showStoreOptions)}
                         className="bg-gray-50 w-full py-2 px-3 rounded-lg text-sm text-gray-600 flex justify-between items-center border border-gray-100"
                      >
                          <span className="truncate pr-2">{dataSelectedStore}</span> 
                          <ChevronDown size={16} className={`text-blue-400 transition-transform ${showStoreOptions ? 'rotate-180' : ''}`}/>
                      </button>
                      
                      {showStoreOptions && (
                          <div className="absolute top-full left-0 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95">
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

              <div className="bg-white rounded-xl p-4 shadow-sm">
                   <div className="flex items-center gap-2 mb-4">
                       <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                       <h3 className="font-bold text-gray-800 text-base">汇总统计</h3>
                   </div>
                   
                   <div className="bg-blue-50 rounded-lg p-4 mb-3 border border-blue-100">
                       <div className="text-center text-gray-500 text-xs mb-1 font-medium">总订场票券</div>
                       <div className="flex justify-center items-baseline gap-6 mt-1">
                           <div className="text-xs text-gray-500">数量: <span className="text-2xl font-bold text-blue-600 font-mono">123</span> 张</div>
                           <div className="text-xs text-gray-500">人数: <span className="text-2xl font-bold text-blue-600 font-mono">245</span> 人</div>
                       </div>
                   </div>

                   <div className="grid grid-cols-2 gap-3">
                       <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                           <div className="text-xl font-bold text-blue-600 mb-1 font-mono">12 <span className="text-xs text-gray-500 font-normal font-sans">张</span></div>
                           <div className="text-xs text-gray-400 font-medium">退票票券</div>
                       </div>
                       <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                           <div className="text-xl font-bold text-blue-600 mb-1 font-mono">13 <span className="text-xs text-gray-500 font-normal font-sans">张</span></div>
                           <div className="text-xs text-gray-400 font-medium">过期票券</div>
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

  const renderMineContent = () => {
    if (mineView === 'TICKETS') {
        return (
            <div className="flex flex-col h-full bg-gray-50">
                <div className="bg-white px-4 py-4 flex items-center gap-4 shadow-sm sticky top-0 z-20">
                    <button onClick={() => setMineView('MENU')} className="p-1 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="font-bold text-lg text-gray-800">我的票券</h2>
                </div>

                <div className="p-4 space-y-4 pb-24">
                    {myTickets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center pt-20 text-gray-400">
                            <Ticket size={48} className="mb-2 opacity-20" />
                            <p>暂无可用票券</p>
                        </div>
                    ) : (
                        myTickets.map(ticket => (
                            <div key={ticket.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 relative group">
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
                                    
                                    <div className="flex flex-col items-center justify-center border-l border-dashed border-gray-200 pl-4 ml-2 gap-2">
                                        {ticket.status === 'UNUSED' ? (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleUseTicket();
                                                }}
                                                className="flex flex-col items-center gap-2 group/btn"
                                            >
                                                <div className="w-12 h-12 bg-gray-900 text-white rounded-lg flex items-center justify-center shadow-md group-active/btn:scale-95 transition-all">
                                                    <ScanLine size={24} />
                                                </div>
                                                <span className="text-[10px] font-medium text-gray-500">去使用</span>
                                            </button>
                                        ) : (
                                            <div className="w-16 h-16 rounded-full border-2 border-gray-300 flex items-center justify-center transform -rotate-12 opacity-50">
                                                <span className="font-bold text-xs text-gray-400">
                                                    {ticket.status === 'USED' ? 'USED' : 'EXPIRED'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
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
        return (
            <div className="flex flex-col h-full bg-gray-50">
                <div className="bg-white px-4 py-4 flex items-center gap-4 shadow-sm sticky top-0 z-20">
                    <button onClick={() => setMineView('MENU')} className="p-1 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="font-bold text-lg text-gray-800">我的场次</h2>
                </div>

                <div className="p-4 space-y-4 pb-24">
                    {mySessions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center pt-20 text-gray-400">
                            <CalendarDays size={48} className="mb-2 opacity-20" />
                            <p>暂无预约场次</p>
                        </div>
                    ) : (
                        mySessions.map(session => {
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
    }

    // Default 'MENU' View - Restored Blue Header Layout
    return (
        <div className="flex flex-col bg-gray-50 min-h-full">
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
            </div>
        </div>
    );
  };

  if (isAdminView) {
    return (
      <div className="flex flex-col h-full bg-slate-50">
        <div className="bg-white px-4 py-3 flex justify-between items-center shadow-sm z-10">
          <div className="font-bold text-lg text-gray-800">前店工作台</div>
          <div className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded border border-purple-200">
            Staff
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative">
          {adminTab === 'TICKETS' && renderAdminTickets()}
          {adminTab === 'DATA' && renderAdminData()}
          {adminTab === 'IDENTITY' && renderAdminIdentity()}
          {adminTab === 'CONTROL' && renderAdminControl()}
        </div>

        <div className="bg-white border-t border-gray-200 flex justify-around items-center h-16 shrink-0">
          {[
            { id: 'TICKETS', label: '票务', icon: Ticket },
            { id: 'DATA', label: '数据', icon: PieChart },
            { id: 'IDENTITY', label: '身份', icon: ScanLine },
            { id: 'CONTROL', label: '中控', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id as AdminTab)}
              className={`flex flex-col items-center gap-1 w-full ${
                adminTab === tab.id ? 'text-purple-600' : 'text-gray-400'
              }`}
            >
              <tab.icon size={24} strokeWidth={adminTab === tab.id ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (bookingStep === 'BASIC') return renderBookingBasic();
  if (bookingStep === 'TICKETS') return renderBookingTickets();
  if (bookingStep === 'SUCCESS') return renderBookingSuccess();

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        {activeTab === 'HOME' ? (
          <div className="animate-in fade-in duration-500">
            <div className="relative h-64 w-full">
              <img
                src="https://images.unsplash.com/photo-1626379953822-baec19c3accd?q=80&w=1000&auto=format&fit=crop"
                className="w-full h-full object-cover"
                alt="Banner"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <div className="text-xs font-medium bg-orange-500/80 backdrop-blur-sm px-2 py-0.5 rounded inline-block mb-2">
                  沉浸式体验
                </div>
                <h1 className="text-2xl font-bold leading-tight">
                  LUMI魔法学院
                  <br />
                  XR大空间体验
                </h1>
              </div>
            </div>

            <div className="p-4 relative -mt-6">
              <div className="bg-white rounded-xl shadow-lg p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-800">北京·ClubMedJoyview...</h3>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Clock size={12} /> 营业中 10:00-22:00
                  </div>
                </div>
                <button className="bg-gray-100 p-2 rounded-full text-blue-600">
                  <MapPin size={20} />
                </button>
              </div>
            </div>

            <div className="px-4 grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={handleStartBooking}
                className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg shadow-blue-200 flex flex-col justify-between h-28 relative overflow-hidden group"
              >
                <div className="relative z-10">
                  <CalendarDays size={24} className="mb-2" />
                  <div className="font-bold text-lg">预约购票</div>
                  <div className="text-[10px] opacity-80">开启奇幻之旅</div>
                </div>
                <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/20 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              </button>

              <button
                onClick={() => setShowRedeemModal(true)}
                className="bg-white rounded-xl p-4 text-gray-800 shadow-sm border border-gray-100 flex flex-col justify-between h-28 relative overflow-hidden group"
              >
                <div className="relative z-10">
                  <Gift size={24} className="mb-2 text-purple-500" />
                  <div className="font-bold text-lg">兑换票券</div>
                  <div className="text-[10px] text-gray-500">使用兑换码</div>
                </div>
              </button>
            </div>

            <div className="px-4 mb-8">
              <h3 className="font-bold text-gray-800 mb-3 text-lg">热门活动</h3>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                <div className="shrink-0 w-64 h-32 bg-gray-100 rounded-xl overflow-hidden relative">
                  <img
                    src="https://images.unsplash.com/photo-1592478411213-61535fdd861d?q=80&w=400&auto=format&fit=crop"
                    className="w-full h-full object-cover"
                    alt="promo"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white">
                    <div className="font-bold text-sm">双人同行，一人免单</div>
                  </div>
                </div>
                <div className="shrink-0 w-64 h-32 bg-gray-100 rounded-xl overflow-hidden relative">
                  <img
                    src="https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=400&auto=format&fit=crop"
                    className="w-full h-full object-cover"
                    alt="promo"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white">
                    <div className="font-bold text-sm">周末特惠场次</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* MINE VIEW RESTORED */
          renderMineContent()
        )}
      </div>

      {/* Tab Bar for Guest */}
      <div className="absolute bottom-0 w-full h-16 bg-white border-t border-gray-200 flex justify-around items-center px-6 pb-2">
        <button
          onClick={() => {
            setActiveTab('HOME');
            setMineView('MENU');
          }}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'HOME' ? 'text-blue-600' : 'text-gray-400'
          }`}
        >
          <Home size={24} strokeWidth={activeTab === 'HOME' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">首页</span>
        </button>
        <div className="relative -top-5">
            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white">
                <ScanLine size={24} />
            </div>
        </div>
        <button
          onClick={() => setActiveTab('MINE')}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'MINE' ? 'text-blue-600' : 'text-gray-400'
          }`}
        >
          <User size={24} strokeWidth={activeTab === 'MINE' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">我的</span>
        </button>
      </div>
    </div>
  );
};

export default MiniProgramView;