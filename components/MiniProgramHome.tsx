import React from 'react';
import { MapPin, CalendarDays, Gift, QrCode, User, ChevronRight, ShoppingBag, Sparkles, BookOpen } from 'lucide-react';
import { UserSession, GlobalBooking } from '../types';

interface MiniProgramHomeProps {
  userSessions: UserSession[];
  globalBookings: GlobalBooking[];
  homeStore: string;
  onStartBooking: () => void;
  onStartRedeem: () => void;
  onViewSession: (session: UserSession) => void;
  onShowStore: () => void;
  onShowIntro: () => void;
}

const MiniProgramHome: React.FC<MiniProgramHomeProps> = ({
  userSessions,
  globalBookings,
  homeStore,
  onStartBooking,
  onStartRedeem,
  onViewSession,
  onShowStore,
  onShowIntro
}) => {
  const isSessionStarted = (session: UserSession) => {
      const now = new Date();
      // Parse session start time
      let sessionDate = new Date();
      if (session.dateStr === '今天') {
         // keep today
      } else if (session.dateStr === '明天') {
         sessionDate.setDate(sessionDate.getDate() + 1);
      } else {
         sessionDate = new Date(session.fullDate);
      }
      
      const [hours, minutes] = session.time.split(':').map(Number);
      sessionDate.setHours(hours, minutes, 0, 0);

      return now >= sessionDate;
  };

  // Find nearest upcoming session
  const upcomingSession = userSessions
      .filter(s => {
          // Basic filtering: not started (time-wise) and not cancelled
          // Explicitly filter out COMPLETED sessions
          if (isSessionStarted(s) || s.status === 'CANCELLED' || s.status === 'COMPLETED') return false;
          
          // Requirement: Do not show if transferred to backstage
          const globalState = globalBookings.find(b => b.id === s.id);
          if (globalState && globalState.status === 'TRANSFERRED') return false;
          
          return true;
      })
      .sort((a, b) => {
           const da = a.dateStr === '今天' ? 0 : a.dateStr === '明天' ? 1 : 2;
           const db = b.dateStr === '今天' ? 0 : b.dateStr === '明天' ? 1 : 2;
           if (da !== db) return da - db;
           return a.time.localeCompare(b.time);
      })[0];

  return (
    <div className="flex flex-col bg-white pb-32">
      {/* Banner */}
      <div className="relative h-80 w-full shrink-0">
        <img src="https://images.unsplash.com/photo-1626379953822-baec19c3accd?q=80&w=1000" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
        <div className="absolute top-4 left-4 z-20"><div className="flex items-center gap-1 text-white bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20"><MapPin size={12} /><span className="text-xs font-bold max-w-[120px] truncate">{homeStore}</span></div></div>
        <div className="absolute bottom-20 left-6 text-white"><div className="text-[10px] font-bold bg-purple-500/90 backdrop-blur-sm px-2 py-0.5 rounded inline-block mb-2 shadow-lg shadow-purple-900/50">XR大空间旗舰店</div><h1 className="text-3xl font-black leading-tight drop-shadow-md">LUMI魔法学院<br />沉浸式奇幻之旅</h1></div>
      </div>
      
      {/* Quick Actions */}
      <div className="px-5 -mt-12 relative z-10 grid grid-cols-2 gap-4">
        <button 
          onClick={onStartBooking}
          className="bg-white rounded-[2rem] p-5 shadow-xl shadow-slate-200 border border-slate-100 flex flex-col justify-between h-40 active:scale-95 transition-transform text-left group overflow-hidden relative"
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-110 transition-transform"></div>
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center relative z-10 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors"><CalendarDays size={24} /></div>
          <div className="relative z-10">
            <div className="font-black text-lg text-slate-800">预约购票</div>
            <div className="text-[10px] text-slate-400 mt-1">沉浸式奇幻体验</div>
          </div>
        </button>
        <button 
          onClick={onStartRedeem}
          className="bg-white rounded-[2rem] p-5 shadow-xl shadow-slate-200 border border-slate-100 flex flex-col justify-between h-40 active:scale-95 transition-transform text-left group overflow-hidden relative"
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 rounded-full group-hover:scale-110 transition-transform"></div>
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center relative z-10 shadow-sm group-hover:bg-purple-600 group-hover:text-white transition-colors"><Gift size={24} /></div>
          <div className="relative z-10">
            <div className="font-black text-lg text-slate-800">兑换体验券</div>
            <div className="text-[10px] text-slate-400 mt-1">魔法验证码兑换</div>
          </div>
        </button>
      </div>

      {/* Main Content Sections */}
      <div className="px-5 mt-8 space-y-6">

        {/* Upcoming Session Card */}
        {upcomingSession && (
             <div onClick={() => onViewSession(upcomingSession)} className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-[2rem] p-5 shadow-xl shadow-slate-300 border border-slate-700 relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all">
                <div className="absolute top-0 right-0 p-3 opacity-10"><QrCode size={100} className="text-white"/></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse ${upcomingSession.status === 'CHECKED_IN' ? 'bg-blue-500 text-white' : upcomingSession.status === 'RUNNING' ? 'bg-purple-500 text-white' : 'bg-emerald-500 text-white'}`}>
                            {upcomingSession.status === 'CHECKED_IN' ? '已签到' : upcomingSession.status === 'RUNNING' ? '体验中' : '即将开始'}
                        </span>
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Upcoming Session</span>
                    </div>
                    <div className="flex items-end gap-3 mb-2">
                        <div className="text-3xl font-black text-white leading-none">{upcomingSession.time}</div>
                        <div className="text-sm font-bold text-slate-300 mb-1">{upcomingSession.dateStr}</div>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <MapPin size={10} /> {upcomingSession.store}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center">
                        <div className="flex -space-x-2">
                            {Array.from({length: Math.min(3, upcomingSession.guests)}).map((_,i) => (
                                <div key={i} className="w-6 h-6 rounded-full bg-slate-600 border-2 border-slate-800 flex items-center justify-center text-[8px] text-white">
                                    <User size={10} />
                                </div>
                            ))}
                            {upcomingSession.guests > 3 && <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-[8px] text-white font-bold">+{upcomingSession.guests-3}</div>}
                        </div>
                        <button className="bg-white text-slate-900 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 group-hover:bg-purple-400 group-hover:text-white transition-colors">
                            查看凭证 <ChevronRight size={10} />
                        </button>
                    </div>
                </div>
             </div>
        )}

        {/* Merch Store Module */}
        <section>
          <div className="flex items-center justify-between px-1 mb-4">
            <h3 className="font-black text-slate-800 flex items-center gap-2 text-lg"><ShoppingBag size={20} className="text-purple-600" /> 周边商城</h3>
            <button onClick={onShowStore} className="text-xs font-bold text-slate-400 hover:text-purple-600">更多好物 ></button>
          </div>
          <button onClick={onShowStore} className="relative w-full h-48 rounded-[2rem] overflow-hidden shadow-2xl active:scale-[0.98] transition-all group">
            <img src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/40 to-transparent"></div>
            <div className="absolute inset-0 p-8 flex flex-col justify-center text-white">
              <div className="text-xs text-purple-300 font-black mb-2 flex items-center gap-1 uppercase tracking-widest"><Sparkles size={12}/> Artisan Magic</div>
              <div className="text-3xl font-black mb-2">魔法学院<br/>周边上新</div>
              <div className="text-[10px] opacity-80 max-w-[150px] leading-relaxed">让魔法带回家，收藏属于你的回忆</div>
            </div>
          </button>
        </section>

        {/* Project Intro Module */}
        <section>
          <div className="flex items-center justify-between px-1 mb-4">
            <h3 className="font-black text-slate-800 flex items-center gap-2 text-lg"><BookOpen size={20} className="text-blue-600" /> 项目介绍</h3>
            <button onClick={onShowIntro} className="text-xs font-bold text-slate-400 hover:text-blue-600">了解详情 ></button>
          </div>
          <button onClick={onShowIntro} className="relative w-full h-40 rounded-[2rem] overflow-hidden shadow-xl group active:scale-[0.98] transition-all border border-slate-100">
            <img src="https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=600" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 text-left w-full">
              <div className="text-xl font-black text-white mb-1 flex items-center gap-2">探索魔法学院奥秘 <ChevronRight size={16} className="text-white/50"/></div>
              <div className="text-[10px] text-white/70 truncate">在300平米物理空间内，开启属于你的魔法传奇</div>
            </div>
          </button>
        </section>
      </div>
    </div>
  );
};

export default MiniProgramHome;