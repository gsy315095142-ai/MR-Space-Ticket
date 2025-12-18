import React, { useState, useEffect } from 'react';
// Added Activity to the imports
import { Home, User, Ticket, Calendar, ChevronRight, MapPin, ScanLine, Gift, Clock, Star, X, Music, ArrowLeft, Users, CheckCircle, CreditCard, ChevronLeft, CalendarDays, Settings, PieChart, BarChart, QrCode, LogOut, RefreshCw, Copy, Filter, Command, PlayCircle, Share, ChevronDown, Edit, Bell, AlertCircle, Share2, ArrowRightLeft, CalendarClock, UserPlus, ShoppingBag, BookOpen, Info, ShoppingCart, PackageCheck, TrendingUp, Activity } from 'lucide-react';
import { MerchItem, UserMerchTicket } from '../types';

interface MiniProgramViewProps {
  userType: 'STAFF' | 'GUEST';
  resetTrigger?: number;
}

const MOCK_PRODUCTS: MerchItem[] = [
  { id: 'p1', name: 'LUMI魔法师徽章', image: 'https://images.unsplash.com/photo-1590218126487-d93510e160a2?w=200&h=200&fit=crop', points: 100, price: 29 },
  { id: 'p2', name: '定制版发光法杖', image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=200&h=200&fit=crop', points: 500, price: 128 },
  { id: 'p3', name: '魔法学院主题斗篷', image: 'https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?w=200&h=200&fit=crop', points: 800, price: 299 },
];

const MiniProgramView: React.FC<MiniProgramViewProps> = ({ userType, resetTrigger }) => {
  const [activeTab, setActiveTab] = useState<'HOME' | 'MINE'>('HOME');
  const [isAdminView, setIsAdminView] = useState(userType === 'STAFF');
  const [adminTab, setAdminTab] = useState<'TICKETS' | 'DATA' | 'IDENTITY' | 'CONTROL' | 'MERCH'>('TICKETS');
  const [ticketSubTab, setTicketSubTab] = useState<'GENERATE' | 'LIST'>('GENERATE');
  const [merchAdminSubTab, setMerchAdminSubTab] = useState<'MANAGE' | 'SALES' | 'STATS'>('SALES');
  
  // Home Page State
  const [homeStore, setHomeStore] = useState('北京·ClubMedJoyview延庆度假村');
  const [showHomeStoreSelect, setShowHomeStoreSelect] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [showStore, setShowStore] = useState(false);
  
  // User Data State
  const [userPoints, setUserPoints] = useState(1200);
  const [userMerchTickets, setUserMerchTickets] = useState<UserMerchTicket[]>([]);
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [mySessions, setMySessions] = useState<any[]>([]);
  const [generatedTickets, setGeneratedTickets] = useState<any[]>([]);

  // View States
  const [mineView, setMineView] = useState<'MENU' | 'TICKETS' | 'SESSIONS' | 'MERCH'>('MENU');
  const [bookingStep, setBookingStep] = useState<'NONE' | 'BASIC' | 'TICKETS' | 'SUCCESS'>('NONE');

  useEffect(() => {
    const loadData = () => {
      const storedMerch = localStorage.getItem('vr_user_merch');
      if (storedMerch) setUserMerchTickets(JSON.parse(storedMerch));
      
      const storedTickets = localStorage.getItem('vr_user_tickets');
      if (storedTickets) setMyTickets(JSON.parse(storedTickets));

      const storedSessions = localStorage.getItem('vr_sessions');
      if (storedSessions) setMySessions(JSON.parse(storedSessions));

      const storedGen = localStorage.getItem('vr_generated_tickets');
      if (storedGen) setGeneratedTickets(JSON.parse(storedGen));
    };
    loadData();
    window.addEventListener('storage_update', loadData);
    return () => window.removeEventListener('storage_update', loadData);
  }, []);

  const saveMerchTickets = (tickets: UserMerchTicket[]) => {
    setUserMerchTickets(tickets);
    localStorage.setItem('vr_user_merch', JSON.stringify(tickets));
    window.dispatchEvent(new Event('storage_update'));
  };

  const handleBuyOrRedeem = (item: MerchItem, method: 'PURCHASE' | 'POINTS') => {
    if (method === 'POINTS' && userPoints < item.points) {
      alert('积分不足');
      return;
    }
    const newTicket: UserMerchTicket = {
      id: 'M' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      productId: item.id,
      productName: item.name,
      status: 'PENDING',
      redeemMethod: method,
      timestamp: new Date().toLocaleString()
    };
    if (method === 'POINTS') setUserPoints(prev => prev - item.points);
    saveMerchTickets([newTicket, ...userMerchTickets]);
    alert(method === 'POINTS' ? '兑换成功！' : '购买成功！已为您生成商品券。');
  };

  const handleRedeemMerch = (ticket: UserMerchTicket) => {
    const storageKey = 'vr_chat_messages';
    const storedMsgs = localStorage.getItem(storageKey);
    let chatHistory = storedMsgs ? JSON.parse(storedMsgs) : [];
    const nowTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    const newMessage = {
      id: Date.now(),
      text: `我想核销商品：${ticket.productName}`, 
      sender: 'ME', 
      time: nowTime,
      type: 'MERCH_LINK',
      merchData: ticket
    };
    chatHistory.push(newMessage);
    localStorage.setItem(storageKey, JSON.stringify(chatHistory));
    window.dispatchEvent(new Event('storage_update'));
    window.dispatchEvent(new Event('new_chat_message'));
    alert('已向客服发送核销请求，请在聊天页查看回复');
  };

  const handleStaffFulfill = (ticketId: string) => {
    const updated = userMerchTickets.map(t => 
      t.id === ticketId ? { ...t, status: 'REDEEMED' as const } : t
    );
    saveMerchTickets(updated);
  };

  // --- Admin Content Renders ---

  const renderAdminTickets = () => (
    <div className="flex flex-col h-full bg-slate-50">
       <div className="bg-white p-2 mx-4 mt-4 mb-2 rounded-lg flex shadow-sm border border-gray-100">
         <button onClick={() => setTicketSubTab('GENERATE')} className={`flex-1 py-2 text-xs font-bold rounded-md ${ticketSubTab === 'GENERATE' ? 'bg-purple-100 text-purple-700' : 'text-gray-500'}`}>生成票券</button>
         <button onClick={() => setTicketSubTab('LIST')} className={`flex-1 py-2 text-xs font-bold rounded-md ${ticketSubTab === 'LIST' ? 'bg-purple-100 text-purple-700' : 'text-gray-500'}`}>票券列表</button>
       </div>
       <div className="flex-1 p-4 overflow-y-auto space-y-4">
         {ticketSubTab === 'GENERATE' ? (
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h3 className="font-bold mb-4 flex items-center gap-2"><Ticket size={18} className="text-purple-600" /> 配置体验券</h3>
             <div className="grid grid-cols-2 gap-3 mb-6">
                {[1,2,3,4].map(n => <button key={n} className="border-2 border-gray-100 p-4 rounded-xl text-center hover:border-purple-500 transition-all"><Users size={20} className="mx-auto mb-1 text-gray-400" /><div className="text-xs font-bold">{n}人票</div></button>)}
             </div>
             <button className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl shadow-lg">生成并发送</button>
           </div>
         ) : (
           <div className="space-y-2">
             {generatedTickets.map(t => (
               <div key={t.id} className="bg-white p-3 rounded-lg border flex justify-between items-center">
                 <div><div className="font-bold text-sm">{t.type}</div><div className="text-[10px] text-gray-400">{t.code}</div></div>
                 <div className="text-xs text-green-600 font-bold">{t.status === 'ACTIVE' ? '有效' : '已用'}</div>
               </div>
             ))}
           </div>
         )}
       </div>
    </div>
  );

  const renderAdminData = () => (
    <div className="flex flex-col h-full bg-slate-50 p-4 space-y-4">
      <div className="bg-white p-4 rounded-xl shadow-sm grid grid-cols-2 gap-4">
        <div className="text-center"><div className="text-2xl font-bold text-purple-600">88%</div><div className="text-[10px] text-gray-400">场次占有率</div></div>
        <div className="text-center"><div className="text-2xl font-bold text-blue-600">¥12.4k</div><div className="text-[10px] text-gray-400">今日总营收</div></div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <h4 className="font-bold text-sm mb-4">客流趋势</h4>
        <div className="h-32 w-full bg-gray-50 rounded flex items-end justify-around p-2 gap-1">
          {[40,60,80,30,90,70,50].map((h, i) => <div key={i} style={{height: `${h}%`}} className="w-full bg-purple-200 rounded-t hover:bg-purple-500 transition-all"></div>)}
        </div>
      </div>
    </div>
  );

  const renderAdminIdentity = () => (
    <div className="flex flex-col h-full bg-slate-50 p-6 text-center">
      <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 border-4 border-white shadow-lg flex items-center justify-center text-4xl">👩‍💼</div>
      <h2 className="text-xl font-bold text-gray-800">店长 · 李晓明</h2>
      <p className="text-xs text-gray-400 mt-1">ID: STAFF_88291</p>
      <div className="mt-8 space-y-3">
        <button className="w-full bg-white p-4 rounded-xl flex items-center justify-between font-medium"><span>系统设置</span><ChevronRight size={16}/></button>
        <button className="w-full bg-white p-4 rounded-xl flex items-center justify-between font-medium"><span>权限管理</span><ChevronRight size={16}/></button>
        <button onClick={() => setIsAdminView(false)} className="w-full bg-red-50 text-red-600 p-4 rounded-xl font-bold mt-10">退出管理模式</button>
      </div>
    </div>
  );

  const renderAdminControl = () => (
    <div className="flex flex-col h-full bg-slate-50 p-4 overflow-y-auto space-y-3">
      <div className="bg-purple-600 p-4 rounded-xl text-white flex justify-between items-center">
        <div><div className="text-xs opacity-80">当前正在进行</div><div className="text-lg font-bold">LUMI魔法学院·02场</div></div>
        <Activity size={24} className="animate-pulse" />
      </div>
      {[1,2,3,4,5].map(n => (
        <div key={n} className="bg-white p-3 rounded-lg border flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center font-bold text-gray-400">{n}</div>
            <div><div className="text-xs font-bold text-gray-700">14:00 - 14:30 场</div><div className="text-[10px] text-gray-400">2/4人已签到</div></div>
          </div>
          <button className="bg-purple-100 text-purple-700 text-[10px] px-3 py-1.5 rounded font-bold">中控操作</button>
        </div>
      ))}
    </div>
  );

  const StaffMerchBackend = () => (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white p-2 mx-4 mt-4 mb-2 rounded-lg flex shadow-sm border border-gray-100">
        <button onClick={() => setMerchAdminSubTab('MANAGE')} className={`flex-1 py-2 text-xs font-bold rounded-md ${merchAdminSubTab === 'MANAGE' ? 'bg-purple-100 text-purple-700' : 'text-gray-500'}`}>商品管理</button>
        <button onClick={() => setMerchAdminSubTab('SALES')} className={`flex-1 py-2 text-xs font-bold rounded-md ${merchAdminSubTab === 'SALES' ? 'bg-purple-100 text-purple-700' : 'text-gray-500'}`}>订单处理</button>
        <button onClick={() => setMerchAdminSubTab('STATS')} className={`flex-1 py-2 text-xs font-bold rounded-md ${merchAdminSubTab === 'STATS' ? 'bg-purple-100 text-purple-700' : 'text-gray-500'}`}>销售统计</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        {merchAdminSubTab === 'SALES' && (
          <div className="space-y-3">
            {userMerchTickets.map(ticket => (
              <div key={ticket.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-gray-800 text-sm">{ticket.productName}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded ${ticket.status === 'PENDING' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                    {ticket.status === 'PENDING' ? '待发货' : '已核销'}
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 mb-4">券码: {ticket.id} | {ticket.redeemMethod === 'POINTS' ? '积分兑换' : '现金支付'}</div>
                {ticket.status === 'PENDING' && (
                  <button onClick={() => handleStaffFulfill(ticket.id)} className="w-full bg-blue-600 text-white py-2 rounded-lg text-xs font-bold shadow-md shadow-blue-100">已发货/核销</button>
                )}
              </div>
            ))}
            {userMerchTickets.length === 0 && <div className="text-center py-20 text-gray-400 text-xs">暂无待处理订单</div>}
          </div>
        )}
        {merchAdminSubTab === 'MANAGE' && (
          <div className="space-y-3">
             {MOCK_PRODUCTS.map(p => (
               <div key={p.id} className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                  <img src={p.image} className="w-12 h-12 rounded object-cover" />
                  <div className="flex-1">
                    <div className="text-sm font-bold">{p.name}</div>
                    <div className="text-[10px] text-gray-400">¥{p.price} / {p.points}pts</div>
                  </div>
                  <button className="text-purple-600 text-xs font-bold">编辑</button>
               </div>
             ))}
             <button className="w-full border-2 border-dashed border-gray-200 py-3 rounded-xl text-gray-400 text-xs font-bold">+ 上架新商品</button>
          </div>
        )}
        {merchAdminSubTab === 'STATS' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
               <div className="bg-white p-4 rounded-xl shadow-sm text-center border">
                  <div className="text-2xl font-bold text-purple-600">{userMerchTickets.filter(t => t.status === 'PENDING').length}</div>
                  <div className="text-[10px] text-gray-400">待核销</div>
               </div>
               <div className="bg-white p-4 rounded-xl shadow-sm text-center border">
                  <div className="text-2xl font-bold text-blue-600">{userMerchTickets.filter(t => t.status === 'REDEEMED').length}</div>
                  <div className="text-[10px] text-gray-400">已核销</div>
               </div>
            </div>
            <div className="bg-white p-4 rounded-xl border">
               <h4 className="text-xs font-bold mb-3 flex items-center gap-2"><TrendingUp size={14}/> 商品热度排行</h4>
               {MOCK_PRODUCTS.map((p, i) => (
                 <div key={p.id} className="flex items-center justify-between mb-3 text-xs border-b border-gray-50 pb-2 last:border-0">
                    <span className="flex items-center gap-2">
                       <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white ${i === 0 ? 'bg-amber-400' : 'bg-gray-300'}`}>{i+1}</span>
                       {p.name}
                    </span>
                    <span className="font-bold text-gray-600">{Math.floor(Math.random()*20+5)} 件</span>
                 </div>
               ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // --- Main View Logic ---

  if (isAdminView) {
    return (
      <div className="flex flex-col h-full bg-slate-50">
        <div className="bg-white px-4 py-3 flex justify-between items-center shadow-sm z-10 shrink-0">
          <div className="font-bold text-lg text-gray-800">前店管理台</div>
          <div className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded border border-purple-200 font-bold">STAFF MODE</div>
        </div>
        <div className="flex-1 overflow-hidden relative">
          {adminTab === 'TICKETS' && renderAdminTickets()}
          {adminTab === 'DATA' && renderAdminData()}
          {adminTab === 'IDENTITY' && renderAdminIdentity()}
          {adminTab === 'CONTROL' && renderAdminControl()}
          {adminTab === 'MERCH' && <StaffMerchBackend />}
        </div>
        <div className="bg-white border-t border-gray-200 flex justify-around items-center h-20 shrink-0 pb-4">
          {[
            { id: 'TICKETS', label: '票务', icon: Ticket },
            { id: 'DATA', label: '数据', icon: BarChart },
            { id: 'IDENTITY', label: '身份', icon: User },
            { id: 'CONTROL', label: '中控', icon: Settings },
            { id: 'MERCH', label: '商品', icon: ShoppingBag },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setAdminTab(tab.id as any)} className={`flex flex-col items-center gap-1 w-full transition-all ${adminTab === tab.id ? 'text-purple-600 scale-110' : 'text-gray-400'}`}>
              <tab.icon size={22} strokeWidth={adminTab === tab.id ? 2.5 : 2} />
              <span className="text-[10px] font-bold">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- Guest Views (Modals) ---

  const IntroModal = () => (
    <div className="absolute inset-0 z-[60] bg-white animate-in slide-in-from-bottom duration-300 flex flex-col">
      <div className="p-4 flex items-center border-b">
        <button onClick={() => setShowIntro(false)}><ChevronLeft size={24} /></button>
        <h2 className="flex-1 text-center font-bold">魔法学院介绍</h2>
        <div className="w-6"></div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <img src="https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=600" className="rounded-xl w-full h-48 object-cover shadow-lg" alt="Intro" />
        <section>
          <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><BookOpen size={20} className="text-purple-600"/> 剧情简介</h3>
          <p className="text-sm text-gray-600 leading-relaxed italic">
            "在星辉交织的深夜，古老的LUMI学院钟声敲响。当现实与幻象的边界模糊，你作为天选学徒，将穿梭于破碎的时空缝隙中..."
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mt-2">
            本项目是一次深度XR沉浸式体验。通过自研的空间定位技术，玩家可以在300平米的场地内自由探索。你将经历森林、神庙与深渊，利用手势识别释放魔法，拯救崩塌的魔法世界。
          </p>
        </section>
        <section className="bg-gray-50 p-4 rounded-xl">
          <h3 className="font-bold text-sm mb-3">体验指南</h3>
          <ul className="text-xs text-gray-500 space-y-3">
            <li className="flex items-center gap-2"><Info size={14}/> 适合年龄：10-55岁</li>
            <li className="flex items-center gap-2"><Clock size={14}/> 体验时长：30-40分钟</li>
            <li className="flex items-center gap-2"><Users size={14}/> 组队人数：2-4人</li>
          </ul>
        </section>
      </div>
    </div>
  );

  const MerchStoreModal = () => (
    <div className="absolute inset-0 z-[60] bg-gray-50 animate-in slide-in-from-bottom duration-300 flex flex-col">
      <div className="bg-white p-4 flex items-center border-b sticky top-0 z-10 shadow-sm">
        <button onClick={() => setShowStore(false)}><ChevronLeft size={24} /></button>
        <h2 className="flex-1 text-center font-bold">魔法学院周边商城</h2>
        <div className="w-6"></div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="text-sm opacity-80 mb-1 font-medium">当前可用积分</div>
          <div className="text-4xl font-bold font-mono tracking-tighter">{userPoints}</div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {MOCK_PRODUCTS.map(product => (
            <div key={product.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex gap-4 hover:shadow-md transition-shadow">
              <img src={product.image} className="w-24 h-24 rounded-lg object-cover bg-gray-100 shadow-inner" />
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">{product.name}</h4>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded">{product.points} 积分</span>
                    <span className="text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded">¥{product.price}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => handleBuyOrRedeem(product, 'POINTS')} className="flex-1 bg-white text-purple-600 text-[10px] font-bold py-2 rounded-lg border border-purple-200 hover:bg-purple-50">积分兑换</button>
                  <button onClick={() => handleBuyOrRedeem(product, 'PURCHASE')} className="flex-1 bg-purple-600 text-white text-[10px] font-bold py-2 rounded-lg shadow-sm shadow-purple-100">付费购买</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const UserMerchTicketsView = () => (
    <div className="flex flex-col h-full bg-gray-50 animate-in slide-in-from-right">
      <div className="bg-white px-4 py-4 flex items-center gap-4 shadow-sm border-b">
          <button onClick={() => setMineView('MENU')} className="p-1 hover:bg-gray-100 rounded-full"><ArrowLeft size={24} /></button>
          <h2 className="font-bold text-lg">我的周边商品</h2>
      </div>
      <div className="p-4 space-y-4 pb-24">
          {userMerchTickets.length === 0 ? (
              <div className="text-center pt-24 text-gray-400 flex flex-col items-center">
                 <ShoppingBag size={48} className="opacity-10 mb-2"/>
                 <p className="text-sm">暂无购入商品，快去商城看看吧</p>
              </div>
          ) : (
              userMerchTickets.map(ticket => (
                  <div key={ticket.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="p-4 flex gap-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200">
                              <QrCode size={32} className="text-gray-300" />
                          </div>
                          <div className="flex-1">
                              <h4 className="font-bold text-gray-800 text-sm">{ticket.productName}</h4>
                              <div className="text-[10px] text-gray-400 mt-1">券码: <span className="font-mono text-gray-700">{ticket.id}</span></div>
                              <div className="flex items-center gap-2 mt-2">
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${ticket.status === 'PENDING' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                                      {ticket.status === 'PENDING' ? '待核销' : '已核销'}
                                  </span>
                                  <span className="text-[10px] text-gray-300">{ticket.redeemMethod === 'POINTS' ? '积分兑换' : '购买'}</span>
                              </div>
                          </div>
                      </div>
                      {ticket.status === 'PENDING' && (
                          <div className="bg-gray-50 p-2 border-t">
                              <button onClick={() => handleRedeemMerch(ticket)} className="w-full bg-purple-600 text-white text-xs font-bold py-2 rounded-lg">申请核销</button>
                          </div>
                      )}
                  </div>
              ))
          )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        {activeTab === 'HOME' ? (
          <div>
            <div className="relative h-64 w-full">
              <img src="https://images.unsplash.com/photo-1626379953822-baec19c3accd?q=80&w=1000" className="w-full h-full object-cover" alt="Banner" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute top-4 left-4 z-20">
                  <button onClick={() => setShowHomeStoreSelect(!showHomeStoreSelect)} className="flex items-center gap-1 text-white bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                    <MapPin size={12} /><span className="text-xs font-bold max-w-[120px] truncate">{homeStore}</span><ChevronDown size={14}/>
                  </button>
              </div>
              <div className="absolute bottom-4 left-4 text-white">
                <div className="text-[10px] font-bold bg-orange-500/90 backdrop-blur-sm px-2 py-0.5 rounded inline-block mb-2">XR大空间首店</div>
                <h1 className="text-2xl font-bold leading-tight tracking-tight">LUMI魔法学院<br />沉浸式奇幻之旅</h1>
              </div>
            </div>

            <div className="px-4 -mt-8 relative z-10 grid grid-cols-2 gap-3 mb-6">
              <button onClick={() => setBookingStep('BASIC' as any)} className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-xl h-28 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full"></div>
                <CalendarDays size={24} className="mb-2" />
                <div className="font-bold text-lg">预约购票</div>
                <div className="text-[10px] opacity-70">开启冒险</div>
              </button>
              <button className="bg-white rounded-2xl p-4 text-gray-800 shadow-lg border border-gray-50 h-28 flex flex-col justify-center">
                <Gift size={24} className="mb-2 text-purple-500" />
                <div className="font-bold text-lg">兑换体验券</div>
                <div className="text-[10px] text-gray-400">使用邀请码</div>
              </button>
            </div>

            <div className="px-4 space-y-4 mb-10">
              <button onClick={() => setShowStore(true)} className="w-full bg-white p-5 rounded-2xl border border-purple-100 shadow-sm flex items-center gap-5 text-left group hover:border-purple-300 transition-all">
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shadow-inner group-hover:scale-110 transition-transform"><ShoppingCart size={28}/></div>
                <div className="flex-1">
                  <div className="font-bold text-gray-800 text-lg">魔法学院周边商城</div>
                  <div className="text-xs text-gray-400 mt-1">正版周边，支持积分兑换</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center"><ChevronRight size={18} className="text-gray-300" /></div>
              </button>
              
              <button onClick={() => setShowIntro(true)} className="w-full bg-white p-5 rounded-2xl border border-blue-100 shadow-sm flex items-center gap-5 text-left group hover:border-blue-300 transition-all">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner group-hover:scale-110 transition-transform"><BookOpen size={28}/></div>
                <div className="flex-1">
                  <div className="font-bold text-gray-800 text-lg">大空间项目介绍</div>
                  <div className="text-xs text-gray-400 mt-1">深度揭秘，了解剧情背景</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center"><ChevronRight size={18} className="text-gray-300" /></div>
              </button>
            </div>
          </div>
        ) : (
          <div>
            {mineView === 'MENU' && (
              <div className="flex flex-col">
                <div className="bg-blue-600 pt-10 pb-16 px-6 text-white rounded-b-[3rem] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                  <div className="relative z-10 flex items-center gap-5 mt-4">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl shadow-2xl border-4 border-blue-400">👨‍🚀</div>
                    <div>
                      <h2 className="text-2xl font-bold">天选体验官</h2>
                      <div className="flex items-center gap-2 mt-1">
                         <span className="bg-blue-500/50 px-2 py-0.5 rounded-full text-[10px] border border-blue-300">钻石学徒</span>
                         <span className="text-blue-100 text-xs font-bold">积分: {userPoints}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-5 -mt-8 relative z-10 space-y-4">
                  <div className="bg-white rounded-2xl shadow-xl p-2 border border-white">
                    <button onClick={() => setMineView('SESSIONS')} className="w-full p-5 flex items-center justify-between border-b last:border-0 hover:bg-gray-50">
                      <div className="flex items-center gap-4"><Calendar size={20} className="text-blue-500"/> <span className="font-bold text-gray-700">我的场次</span></div>
                      <ChevronRight size={18} className="text-gray-300"/>
                    </button>
                    <button onClick={() => setMineView('TICKETS')} className="w-full p-5 flex items-center justify-between border-b last:border-0 hover:bg-gray-50">
                      <div className="flex items-center gap-4"><Ticket size={20} className="text-orange-500"/> <span className="font-bold text-gray-700">我的票券</span></div>
                      <ChevronRight size={18} className="text-gray-300"/>
                    </button>
                    <button onClick={() => setMineView('MERCH')} className="w-full p-5 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-4"><ShoppingBag size={20} className="text-purple-500"/> <span className="font-bold text-gray-700">我的周边商品</span></div>
                      <div className="flex items-center gap-2">
                         {userMerchTickets.filter(t => t.status === 'PENDING').length > 0 && (
                            <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">{userMerchTickets.filter(t => t.status === 'PENDING').length}</span>
                         )}
                         <ChevronRight size={18} className="text-gray-300"/>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
            {mineView === 'MERCH' && <UserMerchTicketsView />}
          </div>
        )}
      </div>

      {/* Guest Navbar */}
      <div className="absolute bottom-0 w-full h-18 bg-white border-t flex justify-around items-center px-6 pb-2 shrink-0">
        <button onClick={() => {setActiveTab('HOME'); setMineView('MENU');}} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'HOME' ? 'text-blue-600' : 'text-gray-400'}`}>
          <Home size={24} strokeWidth={activeTab === 'HOME' ? 2.5 : 2} />
          <span className="text-[10px] font-bold">首页</span>
        </button>
        <button onClick={() => setActiveTab('MINE')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'MINE' ? 'text-blue-600' : 'text-gray-400'}`}>
          <User size={24} strokeWidth={activeTab === 'MINE' ? 2.5 : 2} />
          <span className="text-[10px] font-bold">我的</span>
        </button>
      </div>

      {showIntro && <IntroModal />}
      {showStore && <MerchStoreModal />}
    </div>
  );
};

export default MiniProgramView;