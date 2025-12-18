import React, { useState } from 'react';
// Added ShoppingCart to the import list from lucide-react
import { ShoppingBag, Tag, CheckCircle2, X, Barcode, Boxes, ShoppingCart } from 'lucide-react';
import { MerchItem } from '../types';

const MOCK_PRODUCTS: MerchItem[] = [
  { id: 'p1', name: 'LUMI魔法师徽章', image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop', points: 100, price: 29 },
  { id: 'p2', name: '定制版发光法杖', image: 'https://images.unsplash.com/photo-1590534247854-e97d5e3fe367?w=400&h=400&fit=crop', points: 500, price: 128 },
  { id: 'p3', name: '魔法学院主题斗篷', image: 'https://images.unsplash.com/photo-1612197538223-e652419076ae?w=400&h=400&fit=crop', points: 800, price: 299 },
];

const OfflineStoreView: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<MerchItem | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePurchase = () => {
    if (!selectedProduct) return;

    const storedSales = localStorage.getItem('vr_offline_sales');
    const sales = storedSales ? JSON.parse(storedSales) : [];
    
    const newSale = {
      id: 'OFF' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      price: selectedProduct.price,
      timestamp: new Date().toLocaleString(),
      status: 'SOLD_OFFLINE'
    };

    localStorage.setItem('vr_offline_sales', JSON.stringify([newSale, ...sales]));
    
    window.dispatchEvent(new Event('storage_update'));
    window.dispatchEvent(new Event('offline_sale_created'));
    
    setIsSuccess(true);
    setTimeout(() => {
        setIsSuccess(false);
        setSelectedProduct(null);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a] p-8 overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8 bg-[#2a2a2a] p-6 rounded-3xl border border-[#3a3a3a] shadow-2xl shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-amber-500 to-amber-700 text-white rounded-2xl shadow-inner">
            <Boxes size={36} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-amber-50 font-serif tracking-tight">MAGICAL ACADEMY RETAIL</h1>
            <p className="text-amber-500/80 font-bold tracking-[0.2em] uppercase text-[10px]">学院纪念品商店·实物货架</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-amber-100/40 text-[10px] font-mono mb-1 uppercase tracking-widest">Store Status</div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            CONNECTED TO BACKEND
          </div>
        </div>
      </div>

      {/* Realistic Shelf Area */}
      <div className="flex-1 flex flex-col justify-start px-4 overflow-y-auto no-scrollbar">
        {/* Shelf Row 1 */}
        <div className="relative mb-24 group pt-4">
          {/* Plank Body - Adjusted position to not obscure prices */}
          <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-b from-[#3d2b1f] to-[#2a1d15] rounded-lg shadow-[0_15px_30px_rgba(0,0,0,0.6)] border-t border-[#4d3b2f] z-10"></div>
          {/* Plank Side detail */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-[#5d4b3f] z-20 opacity-30"></div>
          
          <div className="grid grid-cols-3 gap-12 relative z-0 pb-10">
            {MOCK_PRODUCTS.map((product) => (
              <div 
                key={product.id} 
                onClick={() => setSelectedProduct(product)}
                className="relative group/item cursor-pointer flex flex-col items-center"
              >
                {/* Item display */}
                <div className="relative w-full aspect-square flex items-center justify-center p-6 transition-transform duration-500 hover:-translate-y-8 hover:scale-105">
                   {/* Reflection/Shadow under item */}
                   <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-black/60 blur-xl rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                   
                   <img 
                     src={product.image} 
                     alt={product.name} 
                     className="max-w-full max-h-full object-contain drop-shadow-[0_25px_25px_rgba(0,0,0,0.8)] rounded-xl"
                   />
                   
                   {/* Floating Price Tag - Moved slightly up to avoid shelf */}
                   <div className="absolute -top-4 right-0 bg-[#d4af37] text-black font-black text-xl px-5 py-2 rounded-br-2xl shadow-xl border-l-2 border-b-2 border-white/40">
                     ¥{product.price}
                   </div>
                </div>
                
                {/* Physical Tag UI - Label below the product */}
                <div className="mt-2 bg-[#f4f1ea] px-4 py-2 rounded shadow-md border-t-2 border-white flex flex-col items-center min-w-[120px] transform -rotate-1 translate-y-2">
                   <div className="text-[10px] font-black text-stone-800 uppercase text-center truncate w-full">{product.name}</div>
                   <div className="h-[1px] w-full bg-stone-300 my-1"></div>
                   <div className="text-[8px] font-mono text-stone-400">#ACD-MAG-{product.id.slice(1)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shelf Row 2 (Empty slots for realism) */}
        <div className="relative opacity-30 mt-12 pb-12">
          <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-b from-[#3d2b1f] to-[#2a1d15] rounded-lg shadow-[0_15px_30px_rgba(0,0,0,0.4)] border-t border-[#4d3b2f] z-10"></div>
          <div className="grid grid-cols-3 gap-12">
            {[1,2,3].map(i => (
              <div key={i} className="aspect-square flex flex-col items-center justify-center group">
                <div className="w-1/2 h-40 bg-white/5 rounded-3xl border-2 border-dashed border-white/10 flex items-center justify-center">
                  <ShoppingCart size={32} className="text-white/20 group-hover:scale-110 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 bg-amber-900/10 border border-amber-900/30 p-4 rounded-2xl flex items-center justify-center gap-3 shrink-0">
        <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></div>
        <p className="text-amber-500/60 text-xs font-bold uppercase tracking-widest italic">互动提示：点击货架层板上的实物展示，触发线下订单同步流程</p>
      </div>

      {/* Purchase Modal with Metalic Theme */}
      {selectedProduct && !isSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setSelectedProduct(null)}></div>
          <div className="relative bg-[#fcfaf5] w-[520px] rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(212,175,55,0.2)] animate-in zoom-in-95 duration-300 border-8 border-[#2a2a2a]">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-8 right-8 p-3 hover:bg-stone-100 rounded-full text-stone-400 transition-colors"><X size={28} /></button>
            
            <div className="p-12">
               <div className="flex flex-col items-center mb-10">
                 <div className="text-[10px] font-black tracking-[0.3em] text-amber-600 mb-2 uppercase">Order Verification</div>
                 <h2 className="text-4xl font-black text-stone-900 font-serif">确认线下销售</h2>
               </div>
               
               <div className="flex gap-8 mb-12 items-center bg-white p-8 rounded-[2.5rem] shadow-inner border border-stone-100">
                  <div className="relative">
                    <img src={selectedProduct.image} className="w-40 h-40 rounded-3xl object-cover shadow-2xl z-10 relative" alt="" />
                    <div className="absolute -inset-4 bg-amber-100/50 rounded-full blur-3xl -z-0"></div>
                  </div>
                  <div className="flex-1">
                     <div className="text-2xl font-black text-stone-800 leading-tight mb-2 font-serif">{selectedProduct.name}</div>
                     <div className="flex items-baseline gap-1 text-4xl font-black text-red-600">
                        <span className="text-xl">¥</span>
                        {selectedProduct.price}
                     </div>
                  </div>
               </div>

               <div className="space-y-8">
                  <div className="bg-white p-8 rounded-3xl border-2 border-stone-800 flex flex-col items-center shadow-lg">
                      <Barcode size={80} className="text-stone-900" strokeWidth={1.5} />
                      <div className="text-[10px] font-mono font-black text-stone-800 mt-2 tracking-[0.5em] uppercase">9 787532 781522</div>
                  </div>

                  <p className="text-stone-500 text-center text-sm font-medium leading-relaxed px-6">
                    请确保客户已完成扫码支付或现金交易。确认后该库存记录将同步至前店工作台【商品】管理分页。
                  </p>

                  <button 
                    onClick={handlePurchase}
                    className="w-full bg-stone-900 text-white font-black py-6 rounded-[2rem] text-xl shadow-2xl shadow-stone-400/50 hover:bg-stone-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                  >
                    确认成交并出库
                    <CheckCircle2 size={24} className="text-amber-500" />
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Success View */}
      {isSuccess && (
         <div className="fixed inset-0 z-[110] flex items-center justify-center animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-[#1a1a1a]/95 backdrop-blur-2xl"></div>
            <div className="text-center animate-in zoom-in duration-500">
               <div className="w-40 h-40 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white mx-auto mb-8 shadow-[0_0_80px_rgba(212,175,55,0.4)] border-8 border-white/20">
                  <CheckCircle2 size={80} strokeWidth={2.5} />
               </div>
               <h2 className="text-5xl font-black text-white mb-4 font-serif italic tracking-tight">SOLD SUCCESSFULLY</h2>
               <p className="text-amber-500 font-bold tracking-[0.2em] uppercase text-sm">库存记录已实时同步至全平台</p>
            </div>
         </div>
      )}
    </div>
  );
};

export default OfflineStoreView;