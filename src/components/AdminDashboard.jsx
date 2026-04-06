import React, { useState, useRef } from 'react';
import { 
  Users, 
  PlusCircle, 
  Newspaper, 
  Trash2, 
  Upload, 
  Search,
  Package,
  Calendar,
  Clock,
  Globe,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

// Professional Analytics Data - April 2024
const monthlyUserData = [
  { name: 'Apr 01', users: 1200 },
  { name: 'Apr 05', users: 1900 },
  { name: 'Apr 10', users: 1500 },
  { name: 'Apr 15', users: 2800 },
  { name: 'Apr 20', users: 2400 },
  { name: 'Apr 25', users: 3200 },
  { name: 'Apr 30', users: 3100 },
];

const mockUsers = [
  { id: 1, name: 'Monkey D. Luffy', email: 'luffy@opmasters.com', active: true, created: '2023-10-12', lastActive: '2 mins ago', loginType: 'google' },
  { id: 2, name: 'Roronoa Zoro', email: 'zoro@swords.jp', active: false, created: '2023-11-05', lastActive: '3 days ago', loginType: 'email' },
  { id: 3, name: 'Nami', email: 'nami@weather.org', active: true, created: '2023-12-01', lastActive: 'Active', loginType: 'google' },
  { id: 4, name: 'Vinsmoke Sanji', email: 'sanji@allblue.fr', active: true, created: '2024-01-15', lastActive: '1 hour ago', loginType: 'email' },
  { id: 5, name: 'Nico Robin', email: 'robin@ohara.gov', active: false, created: '2024-02-20', lastActive: '5 days ago', loginType: 'google' },
];

const AdminDashboard = ({ activeTab = 'dashboard' }) => {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userLoginFilter, setUserLoginFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Form States
  const [cardForm, setCardForm] = useState({ name: '', type: '', valuation: '', expansion: '', customExpansion: '' });
  const [newsForm, setNewsForm] = useState({ headline: '', url: '', content: '' });
  const [errors, setErrors] = useState([]);
  const [formStatus, setFormStatus] = useState({ type: '', message: '' });

  // Design Tokens
  const theme = {
    bg: 'bg-[#020618]',
    card: 'bg-[#0f172a]/50 backdrop-blur-sm border border-white/5 rounded-xl',
    input: 'w-full bg-[#1e293b] border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-orange-500 transition-all text-sm outline-none',
    label: 'text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block',
    buttonPrimary: 'bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2',
    accentText: 'text-orange-500'
  };

  const filteredUsers = users.filter(user => {
    const matchesLogin = userLoginFilter === 'all' || user.loginType === userLoginFilter;
    const matchesStatus = userStatusFilter === 'all' || 
                          (userStatusFilter === 'online' && user.active) || 
                          (userStatusFilter === 'offline' && !user.active);
    return matchesLogin && matchesStatus;
  });
  
  // 1. Fetch Real Users from Cloud
  const refreshUsers = async () => {
    if (activeTab !== 'users') return;
    setLoadingUsers(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    refreshUsers();
  }, [activeTab]);

  const confirmDelete = async () => {
    if (!showDeleteModal) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${showDeleteModal}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== showDeleteModal));
        setFormStatus({ type: 'success', message: 'Target account successfully purged from registry.' });
      } else {
        setFormStatus({ type: 'error', message: 'Purge failed. Access restricted.' });
      }
    } catch (err) {
        setFormStatus({ type: 'error', message: 'Network interruption during purge.' });
    }
    setShowDeleteModal(null);
  };

  const handleAssetClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setErrors(prev => prev.filter(err => err !== 'image'));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateCardForm = () => {
    const newErrors = [];
    if (!cardForm.name) newErrors.push('name');
    if (!cardForm.type) newErrors.push('type');
    if (!cardForm.valuation) newErrors.push('valuation');
    if (!cardForm.expansion) newErrors.push('expansion');
    if (cardForm.expansion === 'others' && !cardForm.customExpansion) newErrors.push('customExpansion');
    if (!imagePreview) newErrors.push('image');
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleCommitCard = () => {
    if (validateCardForm()) {
      setFormStatus({ type: 'success', message: 'Card data successfully committed to ledger.' });
      setTimeout(() => setFormStatus({ type: '', message: '' }), 5000);
      // Reset form
      setCardForm({ name: '', type: '', valuation: '', expansion: '', customExpansion: '' });
      setImagePreview(null);
      setErrors([]);
    } else {
      setFormStatus({ type: 'error', message: 'Incomplete card registration. All fields and scan are mandatory.' });
    }
  };

  const validateNewsForm = () => {
    const newErrors = [];
    if (!newsForm.headline) newErrors.push('headline');
    if (!newsForm.url) newErrors.push('url');
    if (!newsForm.content) newErrors.push('content');
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleBroadcastNews = () => {
    if (validateNewsForm()) {
      setFormStatus({ type: 'success', message: 'Global bulletin successfully broadcasted.' });
      setTimeout(() => setFormStatus({ type: '', message: '' }), 5000);
      setNewsForm({ headline: '', url: '', content: '' });
      setErrors([]);
    } else {
      setFormStatus({ type: 'error', message: 'Incomplete bulletin. All informational fields are required.' });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Global Form Status Banner */}
      {formStatus.message && (
        <div className={`p-4 rounded-xl border animate-in slide-in-from-top-4 duration-300 flex items-center gap-3 ${
          formStatus.type === 'success' 
          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
          : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {formStatus.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="text-sm font-bold uppercase tracking-wide">{formStatus.message}</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-2xl scale-in-center">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Delete Account?</h3>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                Are you sure you want to delete this user? This operation is permanent and cannot be undone.
              </p>
              <div className="grid grid-cols-2 gap-4 w-full">
                <button 
                  onClick={() => setShowDeleteModal(null)}
                  className="py-2.5 rounded-lg border border-white/10 text-sm font-bold hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-lg shadow-red-600/20 transition-all"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'dashboard' && (
        <>
          {/* Analytics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={theme.card + " p-6"}>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Registered</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-white">12,842</h3>
                <span className="text-xs text-green-500 font-bold">+5.2%</span>
              </div>
            </div>

            <div className={theme.card + " p-6"}>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Active Sessions</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-white">482</h3>
                <span className="text-xs text-orange-500 animate-pulse font-bold tracking-tighter uppercase">Live</span>
              </div>
            </div>

            <div className={theme.card + " p-6"}>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Monthly Engagement</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-white">92.4%</h3>
                <span className="text-xs text-slate-500 font-bold tracking-tight">Stable</span>
              </div>
            </div>
          </div>

          <div className={theme.card + " p-6"}>
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest">User Acquisition Forecast</h4>
                <p className="text-[10px] text-slate-500 uppercase tracking-tight">Timeline: April 2024</p>
              </div>
              <div className="px-3 py-1 bg-white/5 rounded border border-white/10 text-[10px] font-bold text-slate-400">
                UTC +00:00
              </div>
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyUserData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ea580c" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10}
                  />
                  <YAxis 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => `${val}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    itemStyle={{ color: '#ea580c' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#ea580c" 
                    strokeWidth={2}
                    fill="url(#chartGradient)" 
                    dot={{ fill: '#ea580c', r: 3, strokeWidth: 2, stroke: '#020618' }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <div className={theme.card}>
          <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <h4 className="font-bold uppercase tracking-wider text-sm">Member Directory</h4>
            <div className="flex items-center gap-3">
                <div className="flex bg-white/5 border border-white/10 rounded-lg p-1">
                  {['all', 'google', 'email'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setUserLoginFilter(type)}
                      className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all ${userLoginFilter === type ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-slate-500 hover:text-white'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <div className="flex bg-white/5 border border-white/10 rounded-lg p-1">
                  {['all', 'online', 'offline'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setUserStatusFilter(status)}
                      className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all ${userStatusFilter === status ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-slate-500 hover:text-white'}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input type="text" placeholder="Search UUID..." className="bg-white/5 border border-white/10 rounded-md pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500" />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-500 text-[10px] uppercase font-bold tracking-widest border-b border-white/5">
                    <th className="px-6 py-4">User Identity</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Registry Date</th>
                    <th className="px-6 py-4">Last Session</th>
                    <th className="px-6 py-4 text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-bold text-sm text-white group-hover:text-orange-500 transition-colors uppercase tracking-tight">{user.name}</p>
                          {user.loginType === 'google' ? (
                            <Globe className="w-3 h-3 text-blue-400 opacity-60" />
                          ) : (
                            <Calendar className="w-3 h-3 text-slate-500 opacity-60" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{user.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        {user.active ? (
                          <span className="text-[9px] font-black text-emerald-500 flex items-center gap-1.5 bg-emerald-500/5 px-2.5 py-1 rounded-full border border-emerald-500/10 w-fit uppercase">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Network Active
                          </span>
                        ) : (
                          <span className="text-[9px] font-black text-slate-600 flex items-center gap-1.5 bg-slate-500/5 px-2.5 py-1 rounded-full border border-slate-500/10 w-fit uppercase">
                            <span className="w-1.5 h-1.5 bg-slate-700 rounded-full"></span> Disconnected
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <Calendar className="w-3.5 h-3.5 text-slate-600" />
                            {user.created}
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 font-mono uppercase">
                            <Clock className="w-3.5 h-3.5 text-slate-600" />
                            {user.lastActive}
                         </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setShowDeleteModal(user.id)}
                          className="p-2.5 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className={`${theme.card} lg:col-span-3 p-8`}>
              <h4 className="text-sm font-bold uppercase tracking-widest mb-8 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-orange-500" /> Card Registration
              </h4>
              <div className="space-y-6">
                <div>
                  <label className={theme.label}>Asset Upload</label>
                  <div 
                    onClick={handleAssetClick}
                    className={`border border-white/10 bg-white/5 rounded-xl p-10 border-dashed text-center hover:bg-orange-600/5 hover:border-orange-500/50 transition-all cursor-pointer group h-[120px] flex flex-col justify-center ${errors.includes('image') ? 'border-red-500/50' : ''}`}
                  >
                    <Upload className={`w-6 h-6 mx-auto mb-2 transition-colors ${errors.includes('image') ? 'text-red-500' : 'text-slate-600 group-hover:text-orange-500'}`} />
                    <p className={`text-[10px] ${errors.includes('image') ? 'text-red-400 font-bold' : 'text-slate-500'}`}>
                      {errors.includes('image') ? 'IMAGE ASSET REQUIRED' : 'Drop high-res scan or click to browse'}
                    </p>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={theme.label}>Card Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Gear 5 Luffy" 
                      className={`${theme.input} ${errors.includes('name') ? 'border-red-500/50' : ''}`}
                      value={cardForm.name}
                      onChange={(e) => {
                        setCardForm({ ...cardForm, name: e.target.value });
                        if(errors.includes('name')) setErrors(prev => prev.filter(err => err !== 'name'));
                      }}
                    />
                  </div>
                  <div>
                    <label className={theme.label}>Type</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Leader / Super Rare" 
                      className={`${theme.input} ${errors.includes('type') ? 'border-red-500/50' : ''}`}
                      value={cardForm.type}
                      onChange={(e) => {
                        setCardForm({ ...cardForm, type: e.target.value });
                        if(errors.includes('type')) setErrors(prev => prev.filter(err => err !== 'type'));
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className={theme.label}>Valuation ($)</label>
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      className={`${theme.input} ${errors.includes('valuation') ? 'border-red-500/50' : ''}`}
                      value={cardForm.valuation}
                      onChange={(e) => {
                        setCardForm({ ...cardForm, valuation: e.target.value });
                        if(errors.includes('valuation')) setErrors(prev => prev.filter(err => err !== 'valuation'));
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className={theme.label}>Expansion Set</label>
                  <select 
                    value={cardForm.expansion}
                    onChange={(e) => {
                      setCardForm({ ...cardForm, expansion: e.target.value });
                      if(errors.includes('expansion')) setErrors(prev => prev.filter(err => err !== 'expansion'));
                    }}
                    className={`${theme.input} cursor-pointer ${errors.includes('expansion') ? 'border-red-500/50' : ''}`}
                  >
                    <option value="">Choose Expansion</option>
                    <option value="op01">OP-01 Romance Dawn</option>
                    <option value="op02">OP-02 Paramount War</option>
                    <option value="op05">OP-05 Awakening</option>
                    <option value="others">Custom/Other</option>
                  </select>
                </div>
                {cardForm.expansion === 'others' && (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <label className={theme.label}>New Expansion Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter identifier..." 
                      className={`${theme.input} border-orange-500/30 bg-orange-500/5 ${errors.includes('customExpansion') ? 'border-red-500/50' : ''}`}
                      value={cardForm.customExpansion}
                      onChange={(e) => {
                        setCardForm({ ...cardForm, customExpansion: e.target.value });
                        if(errors.includes('customExpansion')) setErrors(prev => prev.filter(err => err !== 'customExpansion'));
                      }}
                    />
                  </div>
                )}
                <button 
                  onClick={handleCommitCard}
                  className={theme.buttonPrimary + " w-full mt-4"}
                >
                  Commit to Ledger
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className={theme.card + " p-6 h-full flex flex-col justify-center items-center text-slate-600"}>
                 {imagePreview ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4">
                       <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-orange-500 italic">Pre-production Scan</p>
                       <img src={imagePreview} alt="Preview" className="w-full h-auto max-h-[400px] object-contain rounded-lg shadow-2xl shadow-black/50 border border-white/10" />
                    </div>
                 ) : (
                    <>
                      <div className={`w-32 h-44 bg-white/5 border rounded-lg flex items-center justify-center mb-4 transition-all ${errors.includes('image') ? 'border-red-500/30' : 'border-white/10 hover:border-orange-500/30'}`}>
                        <Package className={`w-8 h-8 ${errors.includes('image') ? 'text-red-500 opacity-40' : 'opacity-20'}`} />
                      </div>
                      <p className={`text-[10px] font-bold uppercase tracking-tighter ${errors.includes('image') ? 'text-red-500' : ''}`}>
                        {errors.includes('image') ? 'MISSING ASSET' : 'Preview Sandbox'}
                      </p>
                    </>
                 )}
              </div>
            </div>
          </div>
        )}

      {activeTab === 'news' && (
         <div className={theme.card + " p-8"}>
            <h4 className="text-sm font-bold uppercase tracking-widest mb-8 text-white">Publish Global Update</h4>
            <div className="space-y-6">
               <div>
                  <label className={theme.label}>Headline</label>
                  <input 
                    type="text" 
                    placeholder="Title of the bulletin" 
                    className={`${theme.input} ${errors.includes('headline') ? 'border-red-500/50' : ''}`}
                    value={newsForm.headline}
                    onChange={(e) => {
                      setNewsForm({ ...newsForm, headline: e.target.value });
                      if(errors.includes('headline')) setErrors(prev => prev.filter(err => err !== 'headline'));
                    }}
                  />
               </div>
               <div>
                  <label className={theme.label}>Redirection URL</label>
                  <div className="relative">
                    <LinkIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${errors.includes('url') ? 'text-red-500' : 'text-slate-500'}`} />
                    <input 
                      type="text" 
                      placeholder="https://opmasters.com/news/expansion-01" 
                      className={`${theme.input} pl-10 ${errors.includes('url') ? 'border-red-500/50' : ''}`}
                      value={newsForm.url}
                      onChange={(e) => {
                        setNewsForm({ ...newsForm, url: e.target.value });
                        if(errors.includes('url')) setErrors(prev => prev.filter(err => err !== 'url'));
                      }}
                    />
                  </div>
               </div>
               <div>
                  <label className={theme.label}>Bulletin Content</label>
                  <textarea 
                    rows="8" 
                    placeholder="System notification text..." 
                    className={`${theme.input} resize-none ${errors.includes('content') ? 'border-red-500/50' : ''}`}
                    value={newsForm.content}
                    onChange={(e) => {
                      setNewsForm({ ...newsForm, content: e.target.value });
                      if(errors.includes('content')) setErrors(prev => prev.filter(err => err !== 'content'));
                    }}
                  ></textarea>
               </div>
               <div className="flex justify-end">
                  <button 
                    onClick={handleBroadcastNews}
                    className={theme.buttonPrimary + " px-12"}
                  >
                    Broadcast Bulletin
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default AdminDashboard;
