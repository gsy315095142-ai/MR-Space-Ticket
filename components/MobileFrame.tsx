import React from 'react';

interface MobileFrameProps {
  children: React.ReactNode;
  statusBarColor?: string;
}

const MobileFrame: React.FC<MobileFrameProps> = ({ children, statusBarColor = 'bg-white' }) => {
  return (
    <div className="relative mx-auto border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[750px] w-[375px] shadow-2xl flex flex-col overflow-hidden">
      {/* Notch / Camera / Speaker */}
      <div className="absolute top-0 w-full h-8 z-50 flex justify-center items-center pointer-events-none">
        <div className="h-4 w-32 bg-black rounded-b-xl relative"></div>
      </div>

      {/* Screen Content */}
      <div className={`flex-1 w-full h-full overflow-hidden bg-gray-50 relative flex flex-col ${statusBarColor}`}>
        {/* Status Bar Shim */}
        <div className="h-8 w-full shrink-0 flex justify-between items-center px-6 text-[10px] font-medium text-gray-900 z-40 select-none">
          <span>9:41</span>
          <div className="flex gap-1">
            <span>5G</span>
            <span>100%</span>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 w-full relative overflow-y-auto no-scrollbar flex flex-col">
          {children}
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1/3 h-1 bg-gray-900/20 rounded-full z-50 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default MobileFrame;