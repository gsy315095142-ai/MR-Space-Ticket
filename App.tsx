
import React, { useState, useEffect } from 'react';
import { ViewType, NavItem } from './types';
import MobileFrame from './components/MobileFrame';
import MiniProgramView from './components/MiniProgramView';
import BackstageView from './components/BackstageView';
import ChatView from './components/ChatView';
import OfflineStoreView from './components/OfflineStoreView';
import { Smartphone, MessageSquare, Monitor, LayoutGrid, Store, Box } from 'lucide-react';

const NAV_ITEMS: NavItem[] = [
  { id: ViewType.STAFF_FRONT_STORE, label: '工作人员-前店小程序', icon: 'smartphone' },
  { id: ViewType.STAFF_BACKSTAGE, label: '工作人员-后厅APP', icon: 'monitor' },
  { id: ViewType.GUEST_CHAT, label: '用户-聊天页', icon: 'message-square' },
  { id: ViewType.GUEST_MINI_PROGRAM, label: '用户-小程序', icon: 'layout-grid' },
];

const SCENE_ITEMS = [
  { id: ViewType.OFFLINE_STORE, label: '场景-线下门店', icon: 'store' }
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.STAFF_FRONT_STORE);
  const [guestMiniProgramResetTrigger, setGuestMiniProgramResetTrigger] = useState(0);
  const [staffInitialTab, setStaffInitialTab] = useState<'TICKETS' | 'DATA' | 'IDENTITY' | 'CONTROL' | 'MERCH' | undefined>(undefined);
  const [badges, setBadges] = useState<Record<string, boolean>>({
    [ViewType.GUEST_CHAT]: false,
    [ViewType.GUEST_MINI_PROGRAM]: false,
    [ViewType.STAFF_FRONT_STORE]: false,
    [ViewType.STAFF_BACKSTAGE]: false
  });

  useEffect(() => {
      const handleNewMsg = () => {
          if (currentView !== ViewType.GUEST_CHAT) {
              setBadges(prev => ({ ...prev, [ViewType.GUEST_CHAT]: true }));
          }
      };
      const handleNewTicket = () => {
           if (currentView !== ViewType.GUEST_MINI_PROGRAM) {
              setBadges(prev => ({ ...prev, [ViewType.GUEST_MINI_PROGRAM]: true }));
          }
      };
      const handleNewBooking = () => {
          if (currentView !== ViewType.STAFF_FRONT_STORE) {
              setBadges(prev => ({ ...prev, [ViewType.STAFF_FRONT_STORE]: true }));
          }
      };
      const handleOfflineSale = () => {
          if (currentView !== ViewType.STAFF_FRONT_STORE) {
              setBadges(prev => ({ ...prev, [ViewType.STAFF_FRONT_STORE]: true }));
          }
      };
      const handleBackstageTransfer = () => {
          if (currentView !== ViewType.STAFF_BACKSTAGE) {
              setBadges(prev => ({ ...prev, [ViewType.STAFF_BACKSTAGE]: true }));
          }
      };

      window.addEventListener('new_chat_message', handleNewMsg);
      window.addEventListener('new_user_ticket', handleNewTicket);
      window.addEventListener('new_booking_created', handleNewBooking);
      window.addEventListener('offline_sale_created', handleOfflineSale);
      window.addEventListener('session_transferred_to_backstage', handleBackstageTransfer);
      
      return () => {
          window.removeEventListener('new_chat_message', handleNewMsg);
          window.removeEventListener('new_user_ticket', handleNewTicket);
          window.removeEventListener('new_booking_created', handleNewBooking);
          window.removeEventListener('offline_sale_created', handleOfflineSale);
          window.removeEventListener('session_transferred_to_backstage', handleBackstageTransfer);
      }
  }, [currentView]);

  const handleNavClick = (view: ViewType) => {
      if (view === ViewType.GUEST_MINI_PROGRAM) {
          setGuestMiniProgramResetTrigger(prev => prev + 1);
      }
      
      // If clicking Staff app while badge is on AND we know it's from an offline sale
      // or simply as requested: jump to MERCH tab.
      if (view === ViewType.STAFF_FRONT_STORE && badges[ViewType.STAFF_FRONT_STORE]) {
          setStaffInitialTab('MERCH');
      } else {
          setStaffInitialTab(undefined);
      }

      setCurrentView(view);
      setBadges(prev => ({ ...prev, [view]: false }));
  };

  const renderView = () => {
    switch (currentView) {
      case ViewType.STAFF_FRONT_STORE:
        return <MiniProgramView key="staff-front-store" userType="STAFF" initialAdminTab={staffInitialTab} />;
      case ViewType.STAFF_BACKSTAGE:
        return <BackstageView key="staff-backstage" />;
      case ViewType.GUEST_CHAT:
        return <ChatView key="guest-chat" />;
      case ViewType.GUEST_MINI_PROGRAM:
        return <MiniProgramView key="guest-mini-program" userType="GUEST" resetTrigger={guestMiniProgramResetTrigger} />;
      case ViewType.OFFLINE_STORE:
        return <OfflineStoreView />;
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
        case 'store': return <Store size={24} />;
        default: return <Smartphone size={24} />;
     }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-900 overflow-hidden">
      <div className="w-64 md:w-72 bg-slate-800 border-r border-slate-700 flex flex-col shadow-xl z-20">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-white text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            LUMI魔法学院XR
          </h1>
          <p className="text-slate-400 text-xs mt-1">售票体验VR大空间平台</p>
        </div>
        
        <div className="flex-1 p-4 space-y-6 overflow-y-auto no-scrollbar">
          {/* Main Apps */}
          <div className="space-y-2">
            <div className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">系统模拟</div>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full p-3 rounded-xl flex items-center gap-4 transition-all duration-300 group relative
                  ${currentView === item.id 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50 scale-105' 
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
              >
                <div className={`p-2 rounded-lg ${currentView === item.id ? 'bg-white/20' : 'bg-slate-800 group-hover:bg-slate-600'}`}>
                  {getIcon(item.icon)}
                </div>
                <span className="font-medium text-xs text-left">{item.label}</span>
                {badges[item.id] && (
                  <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-800 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
                )}
              </button>
            ))}
          </div>

          {/* New Scenes Section */}
          <div className="space-y-2 pt-4 border-t border-slate-700">
            <div className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">场景-线下门店</div>
            {SCENE_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full p-3 rounded-xl flex items-center gap-4 transition-all duration-300 group relative
                  ${currentView === item.id 
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-900/50 scale-105' 
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
              >
                <div className={`p-2 rounded-lg ${currentView === item.id ? 'bg-white/20' : 'bg-slate-800 group-hover:bg-slate-600'}`}>
                  {getIcon(item.icon)}
                </div>
                <span className="font-medium text-xs text-left">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 bg-slate-900 relative flex items-center justify-center p-8">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-purple-900/20 rounded-full blur-[120px]"></div>
           <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[100px]"></div>
        </div>

        <div className={`relative z-10 transition-all duration-500 ${currentView === ViewType.OFFLINE_STORE ? 'w-full h-full max-w-6xl' : 'scale-[0.85] md:scale-95 lg:scale-100'}`}>
          {currentView === ViewType.OFFLINE_STORE ? (
              <div className="w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl border-[12px] border-slate-800 bg-white">
                  {renderView()}
              </div>
          ) : (
            <MobileFrame statusBarColor={currentView === ViewType.GUEST_CHAT ? 'bg-white' : 'bg-gray-50'}>
              {renderView()}
            </MobileFrame>
          )}
          <div className="text-center mt-6 text-slate-400 text-sm font-medium tracking-wide uppercase">
            Current View: {currentView === ViewType.OFFLINE_STORE ? 'SCENE: OFFLINE STORE' : NAV_ITEMS.find(n => n.id === currentView)?.label}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
