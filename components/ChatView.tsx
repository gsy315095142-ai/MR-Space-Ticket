import React, { useState } from 'react';
import { Search, Send } from 'lucide-react';

const contacts = [
  { id: 1, name: '前台客服', avatar: 'https://picsum.photos/40/40?random=10', lastMsg: '您好，请问有什么可以帮您？' },
  { id: 2, name: '技术支持', avatar: 'https://picsum.photos/40/40?random=11', lastMsg: 'VR眼镜如果模糊请...' },
  { id: 3, name: '活动通知', avatar: 'https://picsum.photos/40/40?random=12', lastMsg: '恭喜您获得优惠券！' },
];

const messages = [
  { id: 1, text: '您好，我预订了下午3点的票，需要提前多久到？', sender: 'ME', time: '14:20' },
  { id: 2, text: '您好！建议您提前15分钟到达现场进行检票和穿戴设备。', sender: 'OTHER', time: '14:21' },
  { id: 3, text: '好的，停车方便吗？', sender: 'ME', time: '14:22' },
  { id: 4, text: '商场B2层有大量停车位，乘坐电梯直达3楼即可。', sender: 'OTHER', time: '14:23' },
  { id: 5, text: '非常感谢！一会儿见。', sender: 'ME', time: '14:25' },
];

const ChatView: React.FC = () => {
  const [selectedContactId, setSelectedContactId] = useState<number>(1);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="h-12 border-b flex items-center justify-center font-bold text-gray-800 shrink-0">
        消息中心
      </div>

      {/* Split View Container */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Side: Contact List */}
        <div className="w-[100px] border-r bg-gray-50 overflow-y-auto flex flex-col no-scrollbar">
          {contacts.map(contact => (
            <div 
              key={contact.id} 
              onClick={() => setSelectedContactId(contact.id)}
              className={`p-2 flex flex-col items-center gap-1 cursor-pointer hover:bg-gray-100 transition-colors ${selectedContactId === contact.id ? 'bg-purple-50 border-l-4 border-purple-500' : 'border-l-4 border-transparent'}`}
            >
              <img src={contact.avatar} className="w-10 h-10 rounded-full bg-gray-300 object-cover" alt={contact.name} />
              <span className="text-[10px] text-center font-medium text-gray-700 leading-tight w-full truncate px-1">
                {contact.name}
              </span>
            </div>
          ))}
        </div>

        {/* Right Side: Chat Content */}
        <div className="flex-1 flex flex-col bg-slate-50">
          {/* Chat Header (Mini) */}
          <div className="h-8 border-b bg-white flex items-center px-3 text-xs font-bold text-gray-600 shrink-0">
            {contacts.find(c => c.id === selectedContactId)?.name}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
             {selectedContactId === 1 ? (
                messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === 'ME' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-lg p-2 text-xs shadow-sm ${msg.sender === 'ME' ? 'bg-purple-600 text-white' : 'bg-white text-gray-800'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))
             ) : (
               <div className="flex h-full items-center justify-center text-gray-400 text-xs">
                 暂无历史消息
               </div>
             )}
          </div>

          {/* Input Area */}
          <div className="h-12 bg-white border-t px-2 flex items-center gap-2 shrink-0">
            <input 
              type="text" 
              placeholder="发送消息..." 
              className="flex-1 bg-gray-100 rounded-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <button className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white">
              <Send size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChatView;