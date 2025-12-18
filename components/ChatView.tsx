
import React, { useState, useEffect } from 'react';
import { Search, Send, Ticket, CheckCircle, ShoppingBag, Package } from 'lucide-react';

const contacts = [
  { id: 1, name: '前台客服', avatar: 'https://picsum.photos/40/40?random=10', lastMsg: '您好，请问有什么可以帮您？' },
  { id: 2, name: '售后支持', avatar: 'https://picsum.photos/40/40?random=11', lastMsg: '关于周边商品...' },
];

const ChatView: React.FC = () => {
  const [selectedContactId, setSelectedContactId] = useState<number>(1);
  const [messages, setMessages] = useState<any[]>([]);

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

  return (
    <div className="flex flex-col h-full bg-white">
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
                    <div className="max-w-[85%] bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
                      <div className="bg-blue-600 p-3 text-white text-xs font-bold">VR体验赠票</div>
                      <div className="p-2 text-[10px]">点击查收票券</div>
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
    </div>
  );
};

export default ChatView;
