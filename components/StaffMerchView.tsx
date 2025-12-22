import React, { useState, useEffect } from 'react';
import { Ticket, Edit, PlusCircle, X, Image as ImageIcon, Upload, Store, ChevronDown } from 'lucide-react';
import { MerchItem, UserMerchTicket } from '../types';

interface StaffMerchViewProps {
  onShowToast: (message: string) => void;
}

const DEFAULT_PRODUCTS: MerchItem[] = [
  { id: 'p1', name: 'LUMI魔法师徽章', image: 'https://images.unsplash.com/photo-1590543789988-66236b2f689e?w=400&h=400&fit=crop', points: 100, price: 29, stock: 50, isOnShelf: true },
  { id: 'p2', name: '定制版发光法杖', image: 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=600&h=800&fit=crop', points: 500, price: 128, stock: 20, isOnShelf: true },
  { id: 'p3', name: '魔法学院主题斗篷', image: 'https://images.unsplash.com/photo-1517462964-21fdcec3f25b?w=600&h=800&fit=crop', points: 800, price: 299, stock: 15, isOnShelf: true },
];

const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_WIDTH = 500;
                const MAX_HEIGHT = 500;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                } else {
                    resolve(e.target?.result as string);
                }
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    });
};

const StaffMerchView: React.FC<StaffMerchViewProps> = ({ onShowToast }) => {
  const [products, setProducts] = useState<MerchItem[]>(DEFAULT_PRODUCTS);
  const [userMerchTickets, setUserMerchTickets] = useState<UserMerchTicket[]>([]);
  const [offlineSales, setOfflineSales] = useState<any[]>([]);
  const [merchAdminSubTab, setMerchAdminSubTab] = useState<'MANAGE' | 'SALES' | 'STATS'>('SALES');
  const [editingProduct, setEditingProduct] = useState<MerchItem | null>(null);
  const [selectedStore, setSelectedStore] = useState('ALL');

  const STORES = [
      { id: 'ALL', name: '全部门店' },
      { id: 'BJ', name: '北京·ClubMedJoyview延庆度假村' },
      { id: 'SH', name: '上海·LUMI魔法学院旗舰店' }
  ];

  const loadData = () => {
    const storedMerch = localStorage.getItem('vr_user_merch');
    if (storedMerch) setUserMerchTickets(JSON.parse(storedMerch));
    
    const storedOffline = localStorage.getItem('vr_offline_sales');
    if (storedOffline) setOfflineSales(JSON.parse(storedOffline));
    
    const storedProducts = localStorage.getItem('vr_global_products');
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      localStorage.setItem('vr_global_products', JSON.stringify(DEFAULT_PRODUCTS));
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage_update', loadData);
    return () => window.removeEventListener('storage_update', loadData);
  }, []);

  const toggleProductShelf = (product: MerchItem) => {
    const updatedProducts = products.map(p => {
        if (p.id === product.id) {
            return { ...p, isOnShelf: p.isOnShelf === false ? true : false };
        }
        return p;
    });
    setProducts(updatedProducts);
    localStorage.setItem('vr_global_products', JSON.stringify(updatedProducts));
    window.dispatchEvent(new Event('storage_update'));
    onShowToast(product.isOnShelf === false ? '商品已上架' : '商品已下架');
  };

  return (
    <>
      <div className="flex flex-col h-full bg-slate-50 animate-in fade-in">
        <div className="bg-white p-2 mx-4 mt-4 mb-2 rounded-lg flex shadow-sm border border-gray-100 shrink-0">
          <button onClick={() => setMerchAdminSubTab('MANAGE')} className={`flex-1 py-2 text-xs font-bold rounded-md ${merchAdminSubTab === 'MANAGE' ? 'bg-purple-100 text-purple-700' : 'text-gray-500'}`}>商品管理</button>
          <button onClick={() => setMerchAdminSubTab('SALES')} className={`flex-1 py-2 text-xs font-bold rounded-md ${merchAdminSubTab === 'SALES' ? 'bg-purple-100 text-purple-700' : 'text-gray-500'}`}>订单处理</button>
          <button onClick={() => setMerchAdminSubTab('STATS')} className={`flex-1 py-2 text-xs font-bold rounded-md ${merchAdminSubTab === 'STATS' ? 'bg-purple-100 text-purple-700' : 'text-gray-500'}`}>统计看板</button>
        </div>

        {/* Store Filter */}
        <div className="mx-4 mb-3 animate-in fade-in slide-in-from-top-1">
             <div className="relative">
                 <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 z-10">
                    <Store size={14} />
                 </div>
                 <select 
                    value={selectedStore} 
                    onChange={(e) => setSelectedStore(e.target.value)}
                    className="w-full appearance-none bg-white border border-purple-100 text-slate-700 text-xs font-bold py-3 pl-10 pr-10 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-50/50 shadow-sm cursor-pointer hover:border-purple-300 transition-all"
                 >
                    {STORES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                 </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-purple-300">
                    <ChevronDown size={16} />
                 </div>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pb-20 no-scrollbar">
          {merchAdminSubTab === 'MANAGE' && (
             <div className="space-y-3">
                {products.map(p => (
                  <div key={p.id} className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-3 shadow-sm">
                     <img src={p.image} className="w-12 h-12 rounded object-cover shadow-sm bg-gray-50" />
                     <div className="flex-1">
                       <div className="text-sm font-bold">{p.name}</div>
                       <div className="text-[10px] text-gray-400">¥{p.price} / {p.points}pts / 库存:{p.stock || 0}</div>
                     </div>
                     <div className="flex flex-col gap-2 items-end">
                        <button onClick={() => setEditingProduct(p)} className="text-purple-600 text-xs font-bold flex items-center gap-1 bg-purple-50 px-2 py-1.5 rounded">
                          <Edit size={14} /> 编辑
                        </button>
                        
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold ${p.isOnShelf !== false ? 'text-green-600' : 'text-gray-400'}`}>
                             {p.isOnShelf !== false ? '上架中' : '已下架'}
                          </span>
                          <button 
                              onClick={() => toggleProductShelf(p)}
                              className={`w-8 h-4 rounded-full relative transition-colors duration-200 ${p.isOnShelf !== false ? 'bg-green-500' : 'bg-gray-300'}`}
                          >
                              <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all duration-200 ${p.isOnShelf !== false ? 'translate-x-[18px]' : 'translate-x-[2px]'}`}></div>
                          </button>
                        </div>
                     </div>
                  </div>
                ))}
                <button onClick={() => setEditingProduct({ id: 'p' + Date.now(), name: '', image: '', points: 0, price: 0, stock: 0, isOnShelf: true })} className="w-full border-2 border-dashed border-gray-200 py-3 rounded-xl text-gray-400 text-xs font-bold flex items-center justify-center gap-2 hover:bg-white hover:border-purple-300 hover:text-purple-500 transition-all"><PlusCircle size={16} /> 同步商品信息</button>
             </div>
          )}
          {merchAdminSubTab === 'SALES' && (
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2 px-1"><Ticket size={12}/> 待处理核销</h4>
              <div className="space-y-3">
                {userMerchTickets.filter(t => t.status === 'PENDING').map(ticket => (
                  <div key={ticket.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-1"><span className="font-bold text-gray-800 text-sm">{ticket.productName}</span><span className="text-[10px] px-2 py-0.5 rounded bg-orange-100 text-orange-600">待核销</span></div>
                    <div className="text-[10px] text-gray-400 mb-4">券码: {ticket.id}</div>
                    <button 
                      onClick={() => {
                          const updated = userMerchTickets.map(t => t.id === ticket.id ? { ...t, status: 'REDEEMED' as const } : t);
                          setUserMerchTickets(updated);
                          localStorage.setItem('vr_user_merch', JSON.stringify(updated));
                          window.dispatchEvent(new Event('storage_update'));
                          alert('已核销成功！');
                      }}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg text-xs font-bold shadow-md shadow-blue-100 active:scale-[0.98] transition-all"
                    >
                      确认核销并交付
                    </button>
                  </div>
                ))}
                {userMerchTickets.filter(t => t.status === 'PENDING').length === 0 && <div className="text-center py-10 text-gray-300 text-xs">暂无待处理订单</div>}
              </div>
            </div>
          )}
          {merchAdminSubTab === 'STATS' && (
            <div className="grid grid-cols-2 gap-3">
               <div className="bg-white p-4 rounded-xl shadow-sm text-center border">
                  <div className="text-2xl font-bold text-purple-600">{userMerchTickets.filter(t => t.status === 'PENDING').length}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase">待核销券</div>
               </div>
               <div className="bg-white p-4 rounded-xl shadow-sm text-center border">
                  <div className="text-2xl font-bold text-blue-600">{offlineSales.length}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase">线下已售</div>
               </div>
            </div>
          )}
        </div>
      </div>

      {editingProduct && (
        <div className="absolute inset-0 z-[260] flex items-center justify-center p-6 animate-in fade-in">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingProduct(null)}></div>
           <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 relative z-10 flex flex-col max-h-[90%]">
               <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-lg text-slate-800">{editingProduct.id.startsWith('p') ? '编辑商品' : '上架商品'}</h3>
                   <button onClick={() => setEditingProduct(null)} className="p-1 rounded-full hover:bg-gray-100"><X size={20} className="text-gray-400"/></button>
               </div>
               
               <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar pb-4">
                   <div className="flex flex-col items-center gap-3">
                       <div className="w-24 h-24 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative">
                           {editingProduct.image ? (
                               <img src={editingProduct.image} className="w-full h-full object-cover" />
                           ) : (
                               <ImageIcon className="text-gray-300" />
                           )}
                       </div>
                       
                       <label className="cursor-pointer bg-purple-50 hover:bg-purple-100 text-purple-600 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors">
                           <Upload size={14} />
                           上传图片
                           <input 
                               type="file" 
                               accept="image/*" 
                               className="hidden"
                               onChange={async (e) => {
                                   const file = e.target.files?.[0];
                                   if(file) {
                                       try {
                                           const resizedImage = await resizeImage(file);
                                           setEditingProduct({...editingProduct, image: resizedImage});
                                       } catch (error) {
                                           console.error("Error processing image", error);
                                           alert("图片处理失败");
                                       }
                                   }
                               }} 
                           />
                       </label>
                   </div>

                   <div>
                       <label className="text-xs font-bold text-gray-500 mb-1 block">商品名称</label>
                       <input 
                           type="text" 
                           value={editingProduct.name} 
                           onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                           className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-purple-500"
                           placeholder="请输入商品名称"
                       />
                   </div>

                   <div className="flex gap-3">
                       <div className="flex-1">
                           <label className="text-xs font-bold text-gray-500 mb-1 block">售价 (¥)</label>
                           <input 
                               type="number" 
                               value={editingProduct.price} 
                               onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                               className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-purple-500"
                               placeholder="0.00"
                           />
                       </div>
                       <div className="flex-1">
                           <label className="text-xs font-bold text-gray-500 mb-1 block">兑换积分</label>
                           <input 
                               type="number" 
                               value={editingProduct.points} 
                               onChange={e => setEditingProduct({...editingProduct, points: Number(e.target.value)})}
                               className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-purple-500"
                               placeholder="0"
                           />
                       </div>
                   </div>

                    <div>
                       <label className="text-xs font-bold text-gray-500 mb-1 block">库存数量</label>
                       <input 
                           type="number" 
                           value={editingProduct.stock || 0} 
                           onChange={e => setEditingProduct({...editingProduct, stock: Number(e.target.value)})}
                           className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-purple-500"
                           placeholder="0"
                       />
                   </div>
               </div>

               <button 
                   onClick={() => {
                       if (!editingProduct.name) {
                           alert('请输入商品名称');
                           return;
                       }
                       let updatedProducts = [...products];
                       const index = updatedProducts.findIndex(p => p.id === editingProduct.id);
                       if (index > -1) {
                           updatedProducts[index] = editingProduct;
                       } else {
                           updatedProducts.push(editingProduct); 
                       }
                       
                       try {
                           localStorage.setItem('vr_global_products', JSON.stringify(updatedProducts));
                           setProducts(updatedProducts);
                           window.dispatchEvent(new Event('storage_update'));
                           setEditingProduct(null);
                           onShowToast('商品信息已更新');
                       } catch (e) {
                           alert('存储空间不足，图片可能过大，请尝试上传更小的图片。');
                           console.error('LocalStorage quota exceeded', e);
                       }
                   }}
                   className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-200 active:scale-95 transition-all mt-2"
               >
                   保存更改
               </button>
           </div>
        </div>
      )}
    </>
  );
};

export default StaffMerchView;