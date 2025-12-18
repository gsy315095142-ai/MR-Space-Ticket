import React, { useState } from 'react';
// Added ShoppingCart to the import list from lucide-react
import { ShoppingBag, Tag, CheckCircle2, X, Barcode, Boxes, ShoppingCart } from 'lucide-react';
import { MerchItem } from '../types';

const MOCK_PRODUCTS: MerchItem[] = [
  { id: 'p1', name: 'LUMI魔法师徽章', image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop', points: 100, price: 29 },
  { id: 'p2', name: '定制版发光法杖', image: 'https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?w=600&h=800&fit=crop', points: 500, price: 128 }, // Updated Wand Image
  { id: 'p3', name: '魔法学院主题斗篷', image: 'https://images.unsplash.com/photo-1519074063912-cd2d042788f6?w=600&h=800&fit=crop', points: 800, price: 299 }, // Updated Cloak Image
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
          {/* Plank Body - Base shelf */}
          <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-b from-[#3d2b1f] to-[#2a1d15] rounded-lg shadow-[0_15px_30px_rgba(0,0,0,0.6)] border-t border-[#4d3b2f] z-10"></div>
          {/* Plank Side detail */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-[#5d4b3f] z-20 opacity-30"></div>
          
          <div className="grid grid-cols-3 gap-12 relative z-0 pb-12">
            {MOCK_PRODUCTS.map((product) => (
              <div 
                key={product.id} 
                onClick={() => setSelectedProduct(product)}
                className="relative group/item cursor-pointer flex flex-col items-center"
              >
                {/* Virtual Display Box Effect */}
                <div className="relative w-full aspect-[4/5] bg-gradient-to-b from-stone-800 to-stone-900 rounded-2xl overflow-hidden border border-stone-700 shadow-inner flex flex-col items-center justify-center p-4 transition-transform duration-500 hover:-translate-y-6 hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
                   {/* Light glow behind product */}
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-amber-500/10 blur-[40px] rounded-full"></div>
                   
                   <img 
                     src={product.image} 
                     alt={product.name} 
                     className="w-full h-full object-contain drop-shadow-[0_15px_15px_rgba(0,0,0,0.9)] z-10 transition-transform duration-700 group-hover/item:scale-110"
                   />
                   
                   {/* Floating Price Tag - Positioned high above the shelf */}
                   <div className="absolute top-2 right-2 bg-gradient-to-br from-[#d4af37] to-[#b8860b] text-black font-black text-lg px-4 py-1.5 rounded-lg shadow-xl border-l border-b border-white/20 z-20">
                     ¥{product.price}
                   </div>
                </div>
                
                {/* Label Tag - Placed on the shelf face or just below */}
                <div className="mt-4 bg-[#f4f1ea] px-4 py-1.5 rounded-sm shadow-md border-t-2 border-white flex flex-col items-center min-w-[110px] transform -rotate-1 relative z-20">
                   <div className="text-[9px] font-black text-stone-800 uppercase text-center truncate w-full">{product.name}</div>
                   <div className="h-[1px] w-full bg-stone-300 my-1"></div>
                   <div className="text-[7px] font-mono text-stone-400">#VR-ACAD-{product.id}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shelf Row 2 (Shadow Row) */}
        <div className="relative opacity-20 mt-12 pb-12">
          <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-b from-[#3d2b1f] to-[#2a1d15] rounded-lg shadow-[0_15px_30px_rgba(0,0,0,0.4)] border-t border-[#4d3b2f] z-10"></div>
          <div className="grid grid-cols-3 gap-12">
            {[1,2,3].map(i => (
              <div key={i} className="aspect-[4/5] flex flex-col items-center justify-center group">
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
        <p className="text-amber-500/60 text-xs font-bold uppercase tracking-widest italic">互动提示：点击货架上的展示位，开启“虚拟模型”销售确认流程</p>
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
                  <div className="relative w-32 h-32 flex items-center justify-center bg-stone-50 rounded-2xl">
                    <img src={selectedProduct.image} className="max-w-full max-h-full object-contain drop-shadow-lg z-10 relative" alt="" />
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
                      <div className="text-[10px] font-mono font-black text-stone-800 mt-2 tracking-[0.5em] uppercase">OFFLINE-SALE-{selectedProduct.id}</div>
                  </div>

                  <p className="text-stone-500 text-center text-sm font-medium leading-relaxed px-6">
                    正在核实线下库存... 确认成交后将自动扣减全平台配额并同步至工作人员【商品】仪表盘。
                  </p>

                  <button 
                    onClick={handlePurchase}
                    className="w-full bg-stone-900 text-white font-black py-6 rounded-[2rem] text-xl shadow-2xl shadow-stone-400/50 hover:bg-stone-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                  >
                    确认成交并同步
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
               <h2 className="text-5xl font-black text-white mb-4 font-serif italic tracking-tight">SALE RECORDED</h2>
               <p className="text-amber-500 font-bold tracking-[0.2em] uppercase text-sm">库存记录已实时同步至全平台</p>
            </div>
         </div>
      )}
    </div>
  );
};

export default OfflineStoreView;