import React, { useState } from 'react';
import { ChevronLeft, Sparkles, Minus, Plus, Search } from 'lucide-react';
import { MerchItem, UserMerchTicket } from '../types';

interface MiniProgramMerchStoreProps {
  products: MerchItem[];
  userMerchTickets: UserMerchTicket[];
  userPoints: number;
  homeStore: string;
  onClose: () => void;
  onNavigateToBooking: () => void;
  onShowToast: (message: string) => void;
  onShowTicketQRCode: (ticket: UserMerchTicket) => void;
}

const MiniProgramMerchStore: React.FC<MiniProgramMerchStoreProps> = ({
  products,
  userMerchTickets,
  userPoints,
  homeStore,
  onClose,
  onNavigateToBooking,
  onShowToast,
  onShowTicketQRCode
}) => {
  const [storeCategory, setStoreCategory] = useState('全部');
  const [selectedProduct, setSelectedProduct] = useState<MerchItem | null>(null);
  const [showPurchasePage, setShowPurchasePage] = useState(false);
  const [showRedeemPage, setShowRedeemPage] = useState(false);
  const [confirmQuantity, setConfirmQuantity] = useState(1);

  // Helper to calculate remaining stock
  const getRemainingStock = (product: MerchItem) => {
      const pendingCount = userMerchTickets
        .filter(t => t.productId === product.id && t.status === 'PENDING')
        .reduce((acc, t) => acc + (t.quantity || 1), 0);
      return Math.max(0, (product.stock || 0) - pendingCount);
  };

  const handlePurchase = () => {
      if (!selectedProduct) return;
      const remaining = getRemainingStock(selectedProduct);
      if (confirmQuantity > remaining) { alert("数量超过库存配额"); return; }
      
      const qty = confirmQuantity;
      
      // Create ticket
      const newTicket: UserMerchTicket = {
        id: 'M' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        productId: selectedProduct.id, 
        productName: selectedProduct.name,
        productImage: selectedProduct.image,
        status: 'PENDING', 
        redeemMethod: 'PURCHASE', 
        timestamp: new Date().toLocaleString(),
        quantity: qty,
        store: homeStore
      };
      
      onShowToast(`成功购买 ${qty} 份商品`);
      
      const storedMerch = localStorage.getItem('vr_user_merch');
      const existing = storedMerch ? JSON.parse(storedMerch) : [];
      localStorage.setItem('vr_user_merch', JSON.stringify([newTicket, ...existing]));
      window.dispatchEvent(new Event('storage_update'));
      
      setShowPurchasePage(false);
      onShowTicketQRCode(newTicket);
  };

  const handleRedeem = () => {
      if (!selectedProduct) return;
      const remaining = getRemainingStock(selectedProduct);
      if (confirmQuantity > remaining) { alert("数量超过库存配额"); return; }
      const totalPoints = selectedProduct.points * confirmQuantity;
      if (userPoints < totalPoints) return;

      // Deduct points
      const newPoints = userPoints - totalPoints;
      localStorage.setItem('vr_user_points', newPoints.toString());

      const qty = confirmQuantity;
      const newTicket: UserMerchTicket = {
        id: 'M_PTS_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        productId: selectedProduct.id, 
        productName: selectedProduct.name,
        productImage: selectedProduct.image,
        status: 'PENDING', 
        redeemMethod: 'POINTS', 
        timestamp: new Date().toLocaleString(),
        quantity: qty,
        store: homeStore
      };
      
      onShowToast(`成功兑换 ${qty} 份商品`);

      const storedMerch = localStorage.getItem('vr_user_merch');
      const existing = storedMerch ? JSON.parse(storedMerch) : [];
      localStorage.setItem('vr_user_merch', JSON.stringify([newTicket, ...existing]));
      window.dispatchEvent(new Event('storage_update'));
      
      setShowRedeemPage(false);
      onShowTicketQRCode(newTicket);
  };

  return (
    <div className="absolute inset-0 z-[120] bg-[#f4f4f4] animate-in slide-in-from-bottom flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center border-b border-gray-100 shadow-sm shrink-0 sticky top-0 z-30">
          <button onClick={onClose} className="p-1 -ml-1 rounded-full hover:bg-gray-50 text-gray-800"><ChevronLeft size={26} /></button>
          <h2 className="flex-1 text-center font-bold text-base text-gray-900 mr-8">周边商城</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 pb-20 no-scrollbar">
        {/* Dark Card for Points */}
        <div className="bg-[#1a1a1a] rounded-xl p-5 mb-4 shadow-lg flex justify-between items-center text-white mx-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/20 rounded-full blur-2xl -mr-4 -mt-4"></div>
            <div className="relative z-10">
                <div className="text-xs font-bold text-gray-400 mb-1 flex items-center gap-1"><Sparkles size={12} className="text-yellow-400"/> 当前积分</div>
                <div className="text-3xl font-black tracking-tight font-sans">{userPoints}</div>
            </div>
            <button 
                onClick={onNavigateToBooking}
                className="relative z-10 bg-white/10 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md active:scale-95 transition-all"
            >
               <div className="text-[10px] font-bold">游玩魔法学院赚积分 {'>'}</div>
            </button>
        </div>
        
        {/* Category Filter */}
        <div className="flex items-center gap-2 mb-4 mx-1 overflow-x-auto no-scrollbar">
           {['全部', '服饰', '抱枕', '礼品'].map(cat => (
               <button 
                 key={cat}
                 onClick={() => setStoreCategory(cat)}
                 className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${storeCategory === cat ? 'bg-black text-white' : 'bg-white text-gray-500'}`}
               >
                   {cat}
               </button>
           ))}
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-2 gap-3 mx-1">
        {products
          .filter(p => p.isOnShelf !== false)
          .filter(p => storeCategory === '全部' || p.category === storeCategory)
          .map(product => {
              const displayRemaining = getRemainingStock(product);

              return (
          <div key={product.id} className="bg-white rounded-lg overflow-hidden flex flex-col">
            <div className="relative aspect-square bg-gray-50">
              <img src={product.image} className="w-full h-full object-cover" />
              {(!product.stock || product.stock <= 0) && (
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                       <span className="bg-black/60 text-white text-xs px-2 py-1 rounded font-bold backdrop-blur-sm">已售罄</span>
                   </div>
              )}
            </div>
            <div className="p-3 flex-1 flex flex-col">
              <h4 className="font-bold text-gray-900 text-xs leading-5 line-clamp-2 mb-3 h-10">{product.name}</h4>
              
              <div className="mt-auto">
                  {/* Price & Points Row */}
                  <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-sm font-bold text-purple-600">{product.points}</span>
                      <span className="text-[10px] font-bold text-purple-600">积分</span>
                      <span className="text-[10px] text-gray-300 mx-1">|</span>
                      <span className="text-xs font-bold text-gray-900">¥{product.price}</span>
                  </div>
                  
                  {/* Popularity Tag */}
                  <div className="text-[9px] text-gray-400 mb-2">10万+人关注</div>

                  <div className="text-[9px] text-gray-400 mb-3 flex items-center">
                      {product.stock && product.stock > 0 ? `剩余数量: ${displayRemaining}` : '暂时缺货'}
                  </div>

                  <div className="flex gap-2">
                    <button 
                        disabled={!product.stock || product.stock <= 0} 
                        onClick={() => { setSelectedProduct(product); setConfirmQuantity(1); setShowRedeemPage(true); }} 
                        className={`flex-1 text-[10px] font-bold py-2 rounded transition-colors border ${!product.stock || product.stock <= 0 ? 'border-gray-100 text-gray-300' : 'border-purple-100 text-purple-600 bg-purple-50/50'}`}
                    >
                        积分兑换
                    </button>
                    <button 
                        disabled={!product.stock || product.stock <= 0} 
                        onClick={() => { setSelectedProduct(product); setConfirmQuantity(1); setShowPurchasePage(true); }} 
                        className={`flex-1 text-[10px] font-bold py-2 rounded transition-colors ${!product.stock || product.stock <= 0 ? 'bg-gray-100 text-gray-300' : 'bg-black text-white'}`}
                    >
                        购买
                    </button>
                  </div>
              </div>
            </div>
          </div>
        )})}
        </div>
        
         <div className="text-center py-6 text-[10px] text-gray-300 font-mono tracking-widest uppercase">
            End of Collection
         </div>
      </div>

      {/* PURCHASE PAGE (Full Screen) */}
      {showPurchasePage && selectedProduct && (
        <div className="absolute inset-0 z-[130] bg-white animate-in slide-in-from-bottom flex flex-col">
            <div className="bg-white px-4 py-3 flex items-center border-b border-gray-100 shadow-sm shrink-0 sticky top-0 z-30">
                <button onClick={() => setShowPurchasePage(false)} className="p-1 -ml-1 rounded-full hover:bg-gray-50 text-gray-800"><ChevronLeft size={26} /></button>
                <h2 className="flex-1 text-center font-bold text-base text-gray-900 mr-8">购买商品</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-20">
                <div className="aspect-square bg-gray-50 rounded-2xl mb-6 flex items-center justify-center overflow-hidden">
                    <img src={selectedProduct.image} className="w-full h-full object-cover" />
                </div>
                
                <div className="mb-6">
                    <h1 className="text-xl font-black text-slate-900 mb-2">{selectedProduct.name}</h1>
                    <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-slate-500">
                            ¥{selectedProduct.price}
                        </div>
                        <div className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded font-bold">
                            剩余数量: {getRemainingStock(selectedProduct)}
                        </div>
                    </div>
                </div>

                <div className="h-px bg-gray-100 w-full mb-6"></div>

                <div className="flex justify-between items-center mb-6">
                    <span className="font-bold text-slate-800">购买数量</span>
                    <div className="flex items-center gap-4 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                        <button onClick={() => setConfirmQuantity(Math.max(1, confirmQuantity - 1))} className={`w-8 h-8 flex items-center justify-center text-gray-600 ${confirmQuantity <= 1 ? 'opacity-30' : ''}`}><Minus size={16}/></button>
                        <span className="font-black w-8 text-center">{confirmQuantity}</span>
                        <button onClick={() => setConfirmQuantity(Math.min(getRemainingStock(selectedProduct), confirmQuantity + 1))} className={`w-8 h-8 flex items-center justify-center text-gray-600 ${confirmQuantity >= getRemainingStock(selectedProduct) ? 'opacity-30' : ''}`}><Plus size={16}/></button>
                    </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-xl text-xs text-gray-400 leading-relaxed">
                    商品由LUMI魔法学院官方提供，购买后请前往柜台出示二维码核销领取。
                </div>
            </div>

            <div className="p-4 border-t border-gray-100 safe-bottom bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-center mb-3 px-1">
                    <span className="text-xs font-bold text-gray-400">应付总额</span>
                    <span className="text-2xl font-black text-slate-900">
                        ¥{selectedProduct.price * confirmQuantity}
                    </span>
                </div>
                
                <button 
                    onClick={handlePurchase}
                    className={`w-full font-bold py-4 rounded-2xl text-base shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 bg-black text-white shadow-gray-300`}
                >
                    立即支付
                </button>
            </div>
        </div>
      )}
      
      {/* REDEEM PAGE (Full Screen) */}
      {showRedeemPage && selectedProduct && (
        <div className="absolute inset-0 z-[130] bg-white animate-in slide-in-from-bottom flex flex-col">
            <div className="bg-white px-4 py-3 flex items-center border-b border-gray-100 shadow-sm shrink-0 sticky top-0 z-30">
                <button onClick={() => setShowRedeemPage(false)} className="p-1 -ml-1 rounded-full hover:bg-gray-50 text-gray-800"><ChevronLeft size={26} /></button>
                <h2 className="flex-1 text-center font-bold text-base text-gray-900 mr-8">积分兑换</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-20">
                <div className="aspect-square bg-gray-50 rounded-2xl mb-6 flex items-center justify-center overflow-hidden">
                    <img src={selectedProduct.image} className="w-full h-full object-cover" />
                </div>
                
                <div className="mb-6">
                    <h1 className="text-xl font-black text-slate-900 mb-2">{selectedProduct.name}</h1>
                    <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-purple-600">
                            {selectedProduct.points} 积分
                        </div>
                        <div className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded font-bold">
                            剩余数量: {getRemainingStock(selectedProduct)}
                        </div>
                    </div>
                </div>

                <div className="h-px bg-gray-100 w-full mb-6"></div>

                <div className="flex justify-between items-center mb-6">
                    <span className="font-bold text-slate-800">兑换数量</span>
                    <div className="flex items-center gap-4 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                        <button onClick={() => setConfirmQuantity(Math.max(1, confirmQuantity - 1))} className={`w-8 h-8 flex items-center justify-center text-gray-600 ${confirmQuantity <= 1 ? 'opacity-30' : ''}`}><Minus size={16}/></button>
                        <span className="font-black w-8 text-center">{confirmQuantity}</span>
                        <button onClick={() => setConfirmQuantity(Math.min(getRemainingStock(selectedProduct), confirmQuantity + 1))} className={`w-8 h-8 flex items-center justify-center text-gray-600 ${confirmQuantity >= getRemainingStock(selectedProduct) ? 'opacity-30' : ''}`}><Plus size={16}/></button>
                    </div>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-xl text-xs text-purple-400 leading-relaxed border border-purple-100">
                    消耗积分兑换商品，兑换成功后请前往柜台核销。
                </div>
            </div>

            <div className="p-4 border-t border-gray-100 safe-bottom bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-center mb-3 px-1">
                    <span className="text-xs font-bold text-gray-400">所需积分</span>
                    <span className={`text-2xl font-black ${userPoints < (selectedProduct.points * confirmQuantity) ? 'text-red-500' : 'text-purple-600'}`}>
                        {selectedProduct.points * confirmQuantity}
                        <span className="text-xs font-bold text-gray-400 ml-1">pts</span>
                    </span>
                </div>
                
                <button 
                    onClick={handleRedeem}
                    className={`w-full font-bold py-4 rounded-2xl text-base shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${userPoints < (selectedProduct.points * confirmQuantity) ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-purple-600 text-white shadow-purple-200'}`}
                >
                    {userPoints < (selectedProduct.points * confirmQuantity) ? '积分不足' : '立即兑换'}
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default MiniProgramMerchStore;
