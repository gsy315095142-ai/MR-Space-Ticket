import React, { useState, useEffect } from 'react';
import { Search, Send, Ticket, CheckCircle, ShoppingBag, Package } from 'lucide-react';

const contacts = [
  { id: 1, name: '前台客服', avatar: 'https://picsum.photos/40/40?random=10', lastMsg: '您好，请问有什么可以帮您？' },
  { id: 2, name: '售后支持', avatar: 'https://picsum.photos/40/40?random=11', lastMsg: '关于周边商品...' },
];

const ChatView: React.FC = () => {
  const [selectedContactId, setSelectedContactId] = useState<number>(1);
  const [messages, setMessages] = useState<any[]>([]);
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  const loadMessages = () => {
      const stored = localStorage.getItem('vr_chat_messages');
      if (stored) {
          setMessages(JSON.parse(stored));
      } else {
          setMessages([]);
      }
  };

  useEffect(() => {
      loadMessages();
      window.addEventListener('storage_update', loadMessages);
      return () => window.removeEventListener('storage_update', loadMessages);
  }, []);

  const showToast = (message: string) => {
      setToast({ show: true, message });
      setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const handleClaimTicket = (msg: any) => {
      if (msg.claimed) return;

      const stored = localStorage.getItem('vr_guest_tickets');
      const tickets = stored ? JSON.parse(stored) : [];
      
      const newTicket = {
          id: `T_CHAT_${Date.now()}`,
          code: Math.random().toString(36).substring(2, 9).toUpperCase(),
          name: msg.ticketData?.name || '客服赠票',
          peopleCount: msg.ticketData?.count || 1,
          date: new Date().toLocaleDateString(),
          store: 'LUMI魔法学院', // Default store
          status: 'PENDING',
          expiryText: '有效期30天',
          tags: ['客服赠送']
      };
      
      // 1. Save Ticket
      localStorage.setItem('vr_guest_tickets', JSON.stringify([newTicket, ...tickets]));
      
      // 2. Mark Message as Claimed
      const updatedMessages = messages.map(m => 
          m.id === msg.id ? { ...m, claimed: true } : m
      );
      setMessages(updatedMessages);
      localStorage.setItem('vr_chat_messages', JSON.stringify(updatedMessages));

      // 3. Dispatch Events
      window.dispatchEvent(new Event('storage_update'));
      window.dispatchEvent(new Event('new_user_ticket'));
      
      showToast('领取成功！已存入【我的票券】');
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="h-12 border-b flex items-center justify-center font-bold text-gray-800 shrink-0">消息中心</div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[80px] border-r bg-gray-50 overflow-y-auto flex flex-col no-scrollbar">
          {contacts.map(contact => (
            <div key={contact.id} onClick={() => setSelectedContactId(contact.id)} className={`p-3 flex flex-col items-center gap-1 cursor-pointer ${selectedContactId === contact.id ? 'bg-purple-50 border-l-4 border-purple-500' : ''}`}>
              <img src={contact.avatar} className="w-10 h-10 rounded-full bg-gray-300 object-cover" />
              <span className="text-[10px] text-center text-gray-600 truncate w-full">{contact.name}</span>
            </div>
          ))}
        </div>
        <div className="flex-1 flex flex-col bg-slate-50">
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
             {messages.map(msg => (
               <div key={msg.id} className={`flex ${msg.sender === 'ME' ? 'justify-end' : 'justify-start'}`}>
                  {msg.type === 'MERCH_LINK' ? (
                    <div className="max-w-[85%] bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden">
                      <div className="bg-purple-600 p-3 flex items-center gap-3 text-white">
                        <ShoppingBag size={16} />
                        <div><div className="font-bold text-xs">商品核销申请</div><div className="text-[10px] opacity-80">{msg.merchData.productName}</div></div>
                      </div>
                      <div className="p-3">
                        <div className="text-[10px] text-gray-500 mb-2">用户请求核销商品，请在后台核对券码：{msg.merchData.id}</div>
                        <div className="flex items-center gap-1 text-[10px] text-purple-600 font-bold"><Package size={12}/> 处理中...</div>
                      </div>
                    </div>
                  ) : msg.type === 'TICKET_LINK' ? (
                    <div 
                        onClick={() => !msg.claimed && handleClaimTicket(msg)} 
                        className={`max-w-[85%] bg-white rounded-xl shadow-sm border overflow-hidden transition-all ${msg.claimed ? 'border-gray-200 opacity-70' : 'border-blue-100 cursor-pointer active:opacity-80'}`}
                    >
                      <div className={`${msg.claimed ? 'bg-gray-400' : 'bg-blue-600'} p-3 text-white text-xs font-bold flex items-center gap-2`}>
                          <Ticket size={16} />
                          <span>VR体验赠票</span>
                      </div>
                      <div className="p-3">
                          <div className={`font-bold text-sm mb-1 ${msg.claimed ? 'text-gray-500' : 'text-gray-800'}`}>{msg.ticketData.name}</div>
                          <div className={`text-[10px] ${msg.claimed ? 'text-gray-400' : 'text-blue-500'}`}>
                              {msg.claimed ? '已领取' : '点击领取放入卡包 >'}
                          </div>
                      </div>
                    </div>
                  ) : (
                    <div className={`max-w-[85%] rounded-lg p-2 text-xs ${msg.sender === 'ME' ? 'bg-purple-600 text-white' : 'bg-white text-gray-800'}`}>
                      {msg.text}
                    </div>
                  )}
               </div>
             ))}
          </div>
          <div className="h-12 bg-white border-t px-2 flex items-center gap-2">
            <input type="text" placeholder="发送消息..." className="flex-1 bg-gray-100 rounded-full h-8 px-3 text-xs" />
            <button className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white"><Send size={14} /></button>
          </div>
        </div>
      </div>
      
      {/* TOAST NOTIFICATION */}
      {toast.show && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white px-6 py-3 rounded-xl shadow-2xl z-[300] flex items-center gap-3 animate-in fade-in slide-in-from-top-4 backdrop-blur-md max-w-[90%]">
              <CheckCircle size={20} className="text-green-400 shrink-0" />
              <span className="text-xs font-bold text-center leading-relaxed">{toast.message}</span>
          </div>
      )}
    </div>
  );
};

export default ChatView;