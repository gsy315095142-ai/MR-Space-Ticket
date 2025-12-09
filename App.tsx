import React, { useState } from 'react';
import { ViewType, NavItem } from './types';
import MobileFrame from './components/MobileFrame';
import MiniProgramView from './components/MiniProgramView';
import BackstageView from './components/BackstageView';
import ChatView from './components/ChatView';
import { Smartphone, MessageSquare, Monitor, LayoutGrid } from 'lucide-react';

const NAV_ITEMS: NavItem[] = [
  { id: ViewType.STAFF_FRONT_STORE, label: '工作人员-前店小程序', icon: 'smartphone' },
  { id: ViewType.STAFF_BACKSTAGE, label: '工作人员-后厅APP', icon: 'monitor' },
  { id: ViewType.GUEST_CHAT, label: '用户-聊天页', icon: 'message-square' },
  { id: ViewType.GUEST_MINI_PROGRAM, label: '用户-小程序', icon: 'layout-grid' },
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.STAFF_FRONT_STORE);

  const renderView = () => {
    switch (currentView) {
      case ViewType.STAFF_FRONT_STORE:
        return <MiniProgramView userType="STAFF" />;
      case ViewType.STAFF_BACKSTAGE:
        return <BackstageView />;
      case ViewType.GUEST_CHAT:
        return <ChatView />;
      case ViewType.GUEST_MINI_PROGRAM:
        return <MiniProgramView userType="GUEST" />;
      default:
        return null;
    }
  };

  const getIcon = (iconName: string) => {
     switch(iconName) {
        case 'smartphone': return <Smartphone size={24} />;
        case 'monitor': return <Monitor size={24} />;
        case 'message-square': return <MessageSquare size={24} />;
        case 'layout-grid': return <LayoutGrid size={24} />;
        default: return <Smartphone size={24} />;
     }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-900 overflow-hidden">
      
      {/* Left Sidebar Navigation */}
      <div className="w-64 md:w-72 bg-slate-800 border-r border-slate-700 flex flex-col shadow-xl z-20">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-white text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            VR Space Admin
          </h1>
          <p className="text-slate-400 text-xs mt-1">售票体验VR大空间平台系统</p>
        </div>
        
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all duration-300 group
                ${currentView === item.id 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50 scale-105' 
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
            >
              <div className={`p-2 rounded-lg ${currentView === item.id ? 'bg-white/20' : 'bg-slate-800 group-hover:bg-slate-600'}`}>
                {getIcon(item.icon)}
              </div>
              <span className="font-medium text-sm text-left">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-slate-700 text-center text-slate-500 text-xs">
           © 2024 VR Space Platform
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 bg-slate-900 relative flex items-center justify-center p-8">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-purple-900/20 rounded-full blur-[120px]"></div>
           <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[100px]"></div>
        </div>

        {/* The Mobile Simulator */}
        <div className="relative z-10 scale-[0.9] md:scale-100 transition-transform duration-500">
          <MobileFrame statusBarColor={currentView === ViewType.GUEST_CHAT ? 'bg-white' : 'bg-gray-50'}>
            {renderView()}
          </MobileFrame>
          
          {/* Label below phone */}
          <div className="text-center mt-6 text-slate-400 text-sm font-medium tracking-wide uppercase">
            Current View: {NAV_ITEMS.find(n => n.id === currentView)?.label}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;