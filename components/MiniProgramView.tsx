import React, { useState } from 'react';
import { Home, User, Ticket, Calendar, ChevronRight, MapPin, ScanLine, Gift, Clock, Star, X, Music, ArrowLeft, Users, CheckCircle, CreditCard, ChevronLeft, CalendarDays } from 'lucide-react';

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
    status: 'UPCOMING' | 'COMPLETED';
    image?: string;
}

type BookingStep = 'NONE' | 'BASIC' | 'TICKETS' | 'SUCCESS';

const MiniProgramView: React.FC<MiniProgramViewProps> = ({ userType }) => {
  const [activeTab, setActiveTab] = useState<'HOME' | 'MINE'>('HOME');
  
  // Modal States
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  
  // Navigation States
  const [mineView, setMineView] = useState<'MENU' | 'TICKETS' | 'SESSIONS'>('MENU');
  const [bookingStep, setBookingStep] = useState<BookingStep>('NONE');

  // Data States
  const [myTickets, setMyTickets] = useState<TicketItem[]>([
    {
      id: 'init-1',
      name: '单人体验券',
      peopleCount: 1,
      storeName: '北京·ClubMedJoyview延庆度假村',
      validUntil: '2024-12-31',
      status: 'EXPIRED'
    }
  ]);

  const [mySessions, setMySessions] = useState<SessionItem[]>([
      {
          id: 's-1',
          timeStr: '2025.06.17 15:00-15:30',
          location: '北京·ClubMedJoyview延庆度假村',
          peopleCount: 3,
          status: 'UPCOMING'
      }
  ]);

  // Booking Flow State
  const [bookingData, setBookingData] = useState({
      peopleCount: 1,
      date: '10月25日', // Default
      timeSlot: '',
  });
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);

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
      setBookingData({ ...bookingData, timeSlot: '', peopleCount: 1 });
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

      // 2. Create Session
      const newSession: SessionItem = {
          id: Date.now().toString(),
          timeStr: `2024.${bookingData.date.replace('月','.').replace('日','')} ${bookingData.timeSlot}`, // Simplified date parsing
          location: '北京·ClubMedJoyview延庆度假村',
          peopleCount: bookingData.peopleCount,
          status: 'UPCOMING'
      };
      setMySessions([newSession, ...mySessions]);

      // 3. Show Success
      setBookingStep('SUCCESS');
  };

  // --- Render Helpers ---

  const renderBookingBasic = () => {
      const timeSlots = ['10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
      const dates = ['10月25日', '10月26日', '10月27日', '10月28日', '10月29日'];

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
                          {dates.map(date => (
                              <button
                                  key={date}
                                  onClick={() => setBookingData({...bookingData, date: date})}
                                  className={`flex-shrink-0 w-24 h-20 rounded-xl flex flex-col items-center justify-center gap-1 border-2 transition-all
                                      ${bookingData.date === date 
                                          ? 'border-blue-500 bg-blue-500 text-white shadow-md' 
                                          : 'border-gray-100 bg-white text-gray-600'
                                      }`}
                              >
                                  <span className="text-xs opacity-80">{date === '10月25日' ? '今天' : '周' + '一二三四五六日'[Math.floor(Math.random()*7)]}</span>
                                  <span className="font-bold text-lg">{date.split('月')[1]}</span>
                              </button>
                          ))}
                      </div>
                  </div>

                  {/* Time Slots */}
                  <div>
                      <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">选择场次</h3>
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
                          <span className="font-bold text-gray-800">2024.{bookingData.date.replace(/[年月日]/g, '.')} {bookingData.timeSlot}</span>
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
                           <span className="font-bold text-gray-800">2024.{bookingData.date.replace(/[年月日]/g, '.')} {bookingData.timeSlot}</span>
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
                    mySessions.map(session => (
                        <div key={session.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                            {/* Header Status */}
                            <div className={`px-4 py-2 flex justify-between items-center text-xs font-bold
                                ${session.status === 'UPCOMING' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}
                            `}>
                                <span>{session.status === 'UPCOMING' ? '待参加' : '已结束'}</span>
                                {session.status === 'UPCOMING' && <span className="flex items-center gap-1"><Clock size={12}/> 请提前签到</span>}
                            </div>
                            
                            <div className="p-4 flex gap-4">
                                <div className="w-20 h-20 bg-gray-200 rounded-lg shrink-0 overflow-hidden">
                                     <img src="https://images.unsplash.com/photo-1622979135228-5b1ed30259a4?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover" alt="VR" />
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
                            
                            {session.status === 'UPCOMING' && (
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
                    ))
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

  // Main Render Logic
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
                <div className="px-4 mt-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Clock className="text-blue-500" size={18} />
                        <h3 className="font-bold text-gray-800 text-lg">最近预约的场次</h3>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 relative">
                        {mySessions.length > 0 ? (
                            <>
                                <div className="space-y-3 mb-4">
                                    <div className="flex text-sm">
                                        <span className="text-gray-400 w-20 shrink-0">场次时间:</span>
                                        <span className="font-medium text-gray-800">{mySessions[0].timeStr}</span>
                                    </div>
                                    <div className="flex text-sm">
                                        <span className="text-gray-400 w-20 shrink-0">场次地点:</span>
                                        <span className="font-medium text-gray-800">{mySessions[0].location}</span>
                                    </div>
                                    <div className="flex text-sm">
                                        <span className="text-gray-400 w-20 shrink-0">预约人数:</span>
                                        <span className="font-medium text-gray-800">{mySessions[0].peopleCount}人</span>
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
                            </>
                        ) : (
                             <div className="text-center py-6 text-gray-400 text-sm">
                                 暂无预约记录
                             </div>
                        )}
                        
                    </div>
                </div>

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