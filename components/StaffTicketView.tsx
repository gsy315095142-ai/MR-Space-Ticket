import React, { useState, useEffect } from 'react';
import { Ticket, Users, Calendar, ChevronDown } from 'lucide-react';

interface StaffTicketViewProps {
  onShowToast: (message: string) => void;
}

const StaffTicketView: React.FC<StaffTicketViewProps> = ({ onShowToast }) => {
  const [subTab, setSubTab] = useState<'GENERATE' | 'LIST'>('GENERATE');
  const [genTicketCount, setGenTicketCount] = useState(1);
  const [generatedTickets, setGeneratedTickets] = useState<any[]>([]);

  const loadData = () => {
    const storedGen = localStorage.getItem('vr_generated_tickets');
    if (storedGen) setGeneratedTickets(JSON.parse(storedGen));
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage_update', loadData);
    return () => window.removeEventListener('storage_update', loadData);
  }, []);

  const handleGenerateAndSend = () => {
    const storedMessages = localStorage.getItem('vr_chat_messages');
    const messages = storedMessages ? JSON.parse(storedMessages) : [];
    
    // Create chat message
    const newMessage = {
        id: Date.now(),
        sender: 'STAFF', // Not 'ME'
        type: 'TICKET_LINK',
        text: `[系统] 您收到一张${genTicketCount}人票`,
        ticketData: {
            count: genTicketCount,
            name: `${genTicketCount}人VR体验票`
        },
        timestamp: new Date().toISOString()
    };

    localStorage.setItem('vr_chat_messages', JSON.stringify([...messages, newMessage]));
    
    // Create Staff Record
    const newGenTicket = {
        id: 'T' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        type: `${genTicketCount}人票`,
        code: Math.random().toString(36).substr(2, 8).toUpperCase(),
        status: 'ACTIVE'
    };
    
    const updatedGenTickets = [newGenTicket, ...generatedTickets];
    setGeneratedTickets(updatedGenTickets);
    localStorage.setItem('vr_generated_tickets', JSON.stringify(updatedGenTickets));
    
    window.dispatchEvent(new Event('storage_update'));
    window.dispatchEvent(new Event('new_chat_message')); 
    
    onShowToast('票券已发送给用户');
  };

  return (
    <div className="flex flex-col h-full bg-[#f5f7fa] animate-in fade-in font-sans">
       {/* Tabs Header */}
       <div className="bg-gradient-to-r from-indigo-50/50 via-white to-blue-50/50 shrink-0 border-b border-gray-100">
         <div className="flex items-center justify-around">
            <button 
              onClick={() => setSubTab('GENERATE')} 
              className={`flex-1 py-3 text-sm font-medium relative transition-colors ${subTab === 'GENERATE' ? 'text-blue-600 font-bold' : 'text-gray-500'}`}
            >
              生成票券
              {subTab === 'GENERATE' && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full"></div>
              )}
            </button>
            <button 
              onClick={() => setSubTab('LIST')} 
              className={`flex-1 py-3 text-sm font-medium relative transition-colors ${subTab === 'LIST' ? 'text-blue-600 font-bold' : 'text-gray-500'}`}
            >
              票券列表
              {subTab === 'LIST' && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full"></div>
              )}
            </button>
         </div>
       </div>

       <div className="flex-1 overflow-y-auto no-scrollbar p-3">
         {subTab === 'GENERATE' ? (
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-2">
             <h3 className="font-bold mb-4 flex items-center gap-2 text-sm text-purple-600"><Ticket size={18} /> 配置新票券</h3>
             <div className="grid grid-cols-2 gap-3 mb-6">
                {[1,2,3,4].map(n => (
                    <button 
                        key={n} 
                        onClick={() => setGenTicketCount(n)}
                        className={`border-2 p-4 rounded-xl text-center transition-all ${genTicketCount === n ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-100 hover:border-purple-300'}`}
                    >
                        <Users size={20} className={`mx-auto mb-1 ${genTicketCount === n ? 'text-purple-600' : 'text-gray-400'}`} />
                        <div className="text-xs font-bold">{n}人票</div>
                    </button>
                ))}
             </div>
             <button onClick={handleGenerateAndSend} className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-all">生成并发送</button>
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
};

export default StaffTicketView;