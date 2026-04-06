import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, 
  PlusCircle, 
  Trash2, 
  Upload, 
  Search,
  Package,
  Calendar,
  Clock,
  Globe,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle,
  ShieldAlert,
  ShieldCheck,
  ArrowRightLeft
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
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [userLoginFilter, setUserLoginFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Form States
  const [cardForm, setCardForm] = useState({ name: '', type: '', valuation: '', expansion: '', customExpansion: '' });
  const [errors, setErrors] = useState([]);
  const [formStatus, setFormStatus] = useState({ type: '', message: '' });

  const [inventory, setInventory] = useState([]);
  const [allCards, setAllCards] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [fetchId, setFetchId] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);
  const [isSearching, setIsSearching] = useState(false); // keep for legacy if needed, but primarily fetchId now

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
      const secret = import.meta.env.VITE_ADMIN_SECRET || 'Op_masters@100';
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users?admin_secret=${secret}`, { credentials: 'include' });
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

  // 2. Fetch Dashboard Statistics
  const refreshStats = async () => {
    if (activeTab !== 'dashboard') return;
    setLoadingStats(true);
    try {
      const secret = import.meta.env.VITE_ADMIN_SECRET || 'Op_masters@100';
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/stats?admin_secret=${secret}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        console.log("[DEBUG] Admin stats fetched:", data);
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  // 3. Fetch Inventory Registry
  const refreshInventory = async () => {
    if (activeTab !== 'inventory') return;
    setLoadingInventory(true);
    try {
      const secret = import.meta.env.VITE_ADMIN_SECRET || 'Op_masters@100';
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/inventory?admin_secret=${secret}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setInventory(data);
      }
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
    } finally {
      setLoadingInventory(false);
    }
  };

  // 4. Fetch Global Library (for search)
  const fetchAllCards = async () => {
    if (activeTab !== 'inventory' || allCards.length > 0) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cards`);
      if (res.ok) {
        const data = await res.json();
        setAllCards(data);
      }
    } catch (err) {
      console.error("Failed to fetch card library:", err);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') refreshUsers();
    if (activeTab === 'dashboard') refreshStats();
    if (activeTab === 'inventory') {
      refreshInventory();
      fetchAllCards();
    }
  }, [activeTab]);

  const handleDeleteInventoryItem = async (id) => {
    try {
      // FIX: Use RESTful path parameter instead of query string to match server route
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/inventory/${id}?admin_secret=${import.meta.env.VITE_ADMIN_SECRET || 'Op_masters@100'}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setFormStatus({ type: 'success', message: 'Asset removed.' });
        // Stabilization delay to avoid white screen race condition
        setTimeout(() => refreshInventory(), 500);
      } else {
        setFormStatus({ type: 'error', message: 'Server rejected deletion.' });
      }
    } catch (err) {
      console.error("Delete error:", err);
      setFormStatus({ type: 'error', message: 'Network failure during deletion.' });
    } finally {
      // Auto-clear success/error message after 4 seconds - use object to avoid null crash
      setTimeout(() => setFormStatus({ type: '', message: '' }), 4000);
    }
  };

  const confirmDelete = async () => {
    if (!showDeleteModal) return;
    try {
      const secret = import.meta.env.VITE_ADMIN_SECRET || 'Op_masters@100';
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${showDeleteModal}?admin_secret=${secret}`, {
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

  const handleFetchCard = () => {
    if (!fetchId) return;
    const card = allCards.find(c => c.id.toLowerCase() === fetchId.toLowerCase() || c.name.toLowerCase().includes(fetchId.toLowerCase()));
    if (card) {
      setSelectedCard(card);
      setCardForm({
        name: card.name,
        type: card.rarity,
        valuation: card.priceEnglish,
        expansion: card.set,
        customExpansion: ''
      });
      setImagePreview(card.image);
      setFormStatus({ type: 'success', message: `Found: ${card.name} (${card.id})` });
    } else {
      setFormStatus({ type: 'error', message: 'Asset not found in global library. Enter manually below.' });
      setSelectedCard(null);
      setImagePreview(null);
    }
  };

  const handleCommitCard = async () => {
    if (!cardForm.name || !cardForm.valuation) {
      setFormStatus({ type: 'error', message: 'Name and Valuation are required.' });
      setTimeout(() => setFormStatus(null), 2000); // Remove after 2 seconds as requested
      return;
    }

    setLoadingInventory(true);
    try {
      // Background ID Generation for automated registry (no more manual typing)
      const shortId = Math.random().toString(36).substring(2, 6).toUpperCase();
      const finalId = `OTH-${shortId}`;

      const payload = {
        id: finalId,
        name: cardForm.name || 'UNNAMED ASSET',
        set: 'Other', // Standardized for library filter matching
        rarity: cardForm.type || 'P',
        price_usd: parseFloat(cardForm.valuation) || 0,
        image_url: imagePreview || '',
        type: 'Character'
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      if (res.ok) {
        setFormStatus({ type: 'success', message: 'Asset registered successfully.' });
        // Small delay to allow Supabase to stabilize before refresh
        setTimeout(() => refreshInventory(), 500);
        setCardForm({ id: '', name: '', type: '', valuation: '', expansion: '', customExpansion: '' });
        setImagePreview(null);
      } else {
          setFormStatus({ type: 'error', message: 'Server rejected registration.' });
      }
    } catch (err) {
      setFormStatus({ type: 'error', message: 'Network failure.' });
    } finally {
      setLoadingInventory(false);
      // Auto-clear message and red symbol after 4 seconds - use object to avoid null crash
      setTimeout(() => setFormStatus({ type: '', message: '' }), 4000);
    }
  };

  const handleSelectSearchResult = (card) => {
    setSelectedCard(card);
    setCardForm({
      name: card.name,
      type: card.rarity,
      valuation: card.priceEnglish,
      expansion: card.set,
      customExpansion: ''
    });
    setImagePreview(card.image);
    setFetchId('');
    setIsSearching(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Global Form Status Banner - Null Safe */}
      {formStatus?.message && (
        <div className={`p-4 rounded-xl border animate-in slide-in-from-top-4 duration-300 flex items-center gap-3 ${
          formStatus.type === 'success' 
          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
          : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {formStatus.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className={theme.card + " p-6 relative overflow-hidden group"}>
              <div className="absolute inset-0 bg-gradient-to-br from-orange-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">User Community</p>
              {loadingStats ? (
                <div className="h-9 w-24 bg-white/5 animate-pulse rounded-md" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black text-white">{stats?.totalUsers?.toLocaleString() || '0'}</h3>
                  <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-tighter italic">Members</span>
                </div>
              )}
            </div>

            <div className={theme.card + " p-6 relative overflow-hidden group border-orange-500/10"}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Global Asset Registry</p>
              {loadingStats ? (
                <div className="h-9 w-24 bg-white/5 animate-pulse rounded-md" />
              ) : (
                <div className="flex items-baseline gap-3">
                  <h3 className="text-3xl font-black text-white">{(stats?.totalCards || 0).toLocaleString()}</h3>
                  <div className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[8px] text-amber-500 font-black uppercase tracking-widest">
                     Unified
                  </div>
                </div>
              )}
            </div>

            <div className={theme.card + " p-6 relative overflow-hidden group border-orange-500/10"}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Support Inbox</p>
              {loadingStats ? (
                <div className="h-9 w-24 bg-white/5 animate-pulse rounded-md" />
              ) : (
                <div className="flex items-baseline gap-3">
                  <h3 className="text-3xl font-black text-white">{stats?.totalEnquiries || '0'}</h3>
                  <span className="text-[10px] text-blue-500 font-bold uppercase tracking-tighter italic">Tickets</span>
                </div>
              )}
            </div>

            <div className={theme.card + " p-6 relative overflow-hidden group border-orange-500/10"}>
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1 text-red-400/80">Priority Queue</p>
              {loadingStats ? (
                <div className="h-9 w-24 bg-white/5 animate-pulse rounded-md" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black text-white">{stats?.pendingReplies || '0'}</h3>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[9px] text-red-500 font-black uppercase tracking-widest">
                     Pending Reply
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={theme.card + " p-8"}>
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h4 className="text-sm font-black uppercase tracking-widest text-white italic">Daily Active Momentum</h4>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Past 12-hour interaction tracking</p>
              </div>
              <div className="px-3 py-1 bg-white/5 rounded border border-white/10 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Pulse Stream
              </div>
            </div>
            <div className="h-[350px] w-full">
              {loadingStats ? (
                <div className="w-full h-full bg-white/5 animate-pulse rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-3">
                   <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-orange-500 animate-spin" />
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Synching Timeline...</span>
                </div>
              ) : (
                <div className="w-full h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart 
                      data={stats?.todayActivity?.length > 0 ? stats.todayActivity : [{name: '00:00', users: 0.1}, {name: '23:59', users: 0.1}]} 
                      margin={{ top: 10, right: 30, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ea580c" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#475569" 
                        fontSize={9} 
                        tickLine={false} 
                        axisLine={false} 
                        dy={10}
                        className="font-bold font-mono"
                        interval={1} // Show every 2nd hour for better density in 12h view
                      />
                      <YAxis 
                        stroke="#475569" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        domain={[0, 'auto']}
                        allowDecimals={false}
                        className="font-bold"
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0f172a', 
                          border: '1px solid rgba(234, 88, 12, 0.2)', 
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '800',
                          textTransform: 'uppercase',
                          padding: '12px',
                          backdropFilter: 'blur(8px)'
                        }}
                        itemStyle={{ color: '#ea580c' }}
                        labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontSize: '9px' }}
                        cursor={{ stroke: '#ea580c', strokeWidth: 1, strokeDasharray: '4 4' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="users" 
                        stroke="#ea580c" 
                        strokeWidth={4}
                        fill="url(#chartGradient)" 
                        animationDuration={1000}
                        dot={{ fill: '#ea580c', r: 0 }}
                        activeDot={{ r: 4, fill: '#ea580c', strokeWidth: 3, stroke: '#020618' }}
                        connectNulls
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
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
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* COMPACT REGISTRATION BOX */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className={`${theme.card} lg:col-span-8 p-6 border-orange-500/20 relative`}>
                {/* SUCCESS TOAST POPUP (With safety check) */}
                {formStatus?.message && (
                  <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-2 rounded-xl shadow-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
                    formStatus.type === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white' : 'bg-red-500/90 border-red-400 text-white'
                  }`}>
                    {formStatus.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                    <span className="text-[11px] font-black uppercase tracking-widest">{formStatus.message}</span>
                  </div>
                )}

                <div className="mb-6 flex justify-between items-center">
                   <div>
                     <h4 className="text-lg font-black uppercase tracking-widest text-white italic flex items-center gap-2">
                       <PlusCircle className="w-5 h-5 text-orange-500 not-italic" /> Asset Registration
                     </h4>
                   </div>
                   <div className="text-[9px] font-black text-slate-500 uppercase bg-white/5 px-3 py-1 rounded-full border border-white/5">
                     Manual Mode
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* LEFT COLUMN: IDENTITY & IMAGE */}
                   <div className="space-y-4">
                      {/* AUTOMATED IDENTITY: Manual cards now default to OTHERS automatically */}
                      <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-3 flex items-center justify-between">
                         <div className="flex flex-col">
                            <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest leading-none">Global Registry Type</span>
                            <span className="text-xs font-black text-white uppercase mt-1">OTHERS – SPECIAL PRODUCTS</span>
                         </div>
                         <div className="px-2 py-1 bg-white/5 rounded text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Auto-Assign</div>
                      </div>

                      <div>
                        <label className={theme.label + " text-[10px]"}>Character Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. MONKEY.D.LUFFY"
                          className={theme.input + " h-10 bg-white/5 uppercase font-black text-xs border-white/5"}
                          value={cardForm.name || ''}
                          onChange={(e) => setCardForm({...cardForm, name: e.target.value})}
                        />
                      </div>

                      <div className="grid grid-cols-1">
                        <div>
                          <label className={theme.label + " text-[10px]"}>Paste Image URL</label>
                          <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
                            <input 
                              type="text" 
                              placeholder="https://..."
                              className={theme.input + " pl-10 h-10 bg-white/5 text-xs"}
                              value={imagePreview && typeof imagePreview === 'string' && imagePreview.startsWith('http') ? imagePreview : ''}
                              onChange={(e) => setImagePreview(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div 
                        onClick={() => fileInputRef.current.click()}
                        className="border border-dashed border-white/10 hover:border-orange-500/30 bg-white/[0.02] rounded-xl p-3 text-center cursor-pointer transition-all group mt-2"
                      >
                         <Upload className="w-3.5 h-3.5 mx-auto mb-1 text-slate-700 group-hover:text-orange-500 transition-colors" />
                         <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors">Import Local Scan</span>
                         <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                      </div>
                   </div>

                   {/* RIGHT COLUMN: VALUATION & CLASSIFICATION */}
                   <div className="space-y-4">
                      <div>
                        <label className={theme.label + " text-[10px]"}>Classification (Rarity)</label>
                        <select 
                          className={theme.input + " h-10 bg-slate-900 uppercase font-bold text-xs border-white/10 text-white"}
                          value={cardForm.type || ''}
                          onChange={(e) => setCardForm({...cardForm, type: e.target.value})}
                        >
                           <option value="" className="bg-slate-900">Select Rarity</option>
                           <option value="SEC" className="bg-slate-900">SEC - Secret Rare</option>
                           <option value="L" className="bg-slate-900">L - Leader</option>
                           <option value="SR" className="bg-slate-900">SR - Super Rare</option>
                           <option value="R" className="bg-slate-900">R - Rare</option>
                           <option value="UC" className="bg-slate-900">UC - Uncommon</option>
                           <option value="C" className="bg-slate-900">C - Common</option>
                           <option value="P" className="bg-slate-900">P - Promo / Special</option>
                        </select>
                      </div>

                      <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl relative overflow-hidden group">
                         <label className={theme.label + " mb-3 text-[10px]"}>Market Valuation</label>
                         <div className="space-y-4 relative z-10">
                            <div className="relative">
                               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 font-black text-lg">$</span>
                               <input 
                                 type="number" 
                                 placeholder="USD"
                                 className={theme.input + " pl-10 h-12 bg-white/5 text-xl font-black text-white"}
                                 value={cardForm.valuation || ''}
                                 onChange={(e) => setCardForm({...cardForm, valuation: e.target.value})}
                               />
                            </div>
                            <div className="flex items-center gap-4 py-3 px-5 bg-orange-600/10 border border-orange-500/30 rounded-xl">
                               <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-orange-600/40">
                                 ₹
                               </div>
                               <div>
                                  <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest leading-none">Listing Value</p>
                                  <p className="text-xl font-black text-white tracking-tighter mt-1">
                                     {cardForm.valuation ? (parseFloat(cardForm.valuation) * 84).toLocaleString('en-IN') : '0'}
                                  </p>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5">
                   <button 
                      onClick={handleCommitCard}
                      disabled={loadingInventory}
                      className="w-full h-12 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-black uppercase tracking-[0.2em] rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-orange-600/10 active:scale-[0.98] text-[11px]"
                   >
                     {loadingInventory ? (
                       <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                     ) : (
                       "ADD TO REGISTRY"
                     )}
                   </button>
                </div>
              </div>

              {/* LIVE PREVIEW COLUMN */}
              <div className="lg:col-span-4 h-full">
                 <div className={`${theme.card} h-full p-4 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-white/[0.03] to-transparent`}>
                    {imagePreview ? (
                      <div className="w-full flex flex-col items-center animate-in zoom-in-95 duration-500">
                        <img 
                          src={imagePreview} 
                          alt="Asset" 
                          className="w-full max-w-[200px] h-auto object-contain rounded-xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] border border-white/10" 
                          onError={(e) => e.target.src = 'https://placehold.co/400x600/0f172a/white?text=ERR'}
                        />
                        <div className="mt-6 text-center px-4">
                           <h5 className="text-sm font-black text-white uppercase italic truncate w-full">{cardForm.name || 'PENDING'}</h5>
                           <p className="text-[9px] text-orange-500 font-bold uppercase tracking-[0.2em] mt-1">
                             {(cardForm.expansion || 'SET')}-{cardForm.id || '000'} • {cardForm.type || 'CLASS'}
                           </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center opacity-20">
                         <div className="w-32 h-44 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl mb-4 flex items-center justify-center">
                            <Package className="w-8 h-8 text-slate-500" />
                         </div>
                         <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic">Visualizer</p>
                      </div>
                    )}
                 </div>
              </div>
            </div>

            {/* ASSET REGISTRY LIST */}
            <div className={`${theme.card} shadow-2xl border-white/10 overflow-hidden`}>
               <div className="p-6 border-b border-white/5 bg-white/[0.03] flex justify-between items-center text-xs">
                  <h4 className="font-black uppercase tracking-widest text-white italic">Asset Registry Control</h4>
                  <div className="bg-orange-600/10 px-4 py-1.5 rounded-xl border border-orange-500/20 font-black text-orange-500 flex items-center gap-3">
                     <span className="w-2 h-2 bg-orange-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(234,88,12,0.8)]"></span>
                     {inventory.length} UNITS
                  </div>
               </div>
               
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="bg-black/40 text-slate-600 text-[10px] uppercase font-black tracking-[0.3em] border-b border-white/5">
                        <th className="px-8 py-4">Asset</th>
                        <th className="px-8 py-4">Class</th>
                        <th className="px-8 py-4">Value</th>
                        <th className="px-8 py-4">ID</th>
                        <th className="px-8 py-4 text-right">Op</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                      {inventory.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-8 py-16 text-center">
                             <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-10 italic">Registry Empty</span>
                          </td>
                        </tr>
                      ) : (
                        inventory.filter(Boolean).map((item) => (
                          <tr key={item?.id || Math.random()} className="hover:bg-white/[0.04] transition-all group">
                             <td className="px-8 py-4">
                                <div className="flex items-center gap-4">
                                   <div className="w-10 h-14 bg-white/5 rounded-lg overflow-hidden border border-white/10 shadow-lg shrink-0">
                                      <img src={item?.image_url || item?.image} alt="" className="w-full h-full object-contain" />
                                   </div>
                                   <div>
                                      <p className="text-xs font-black text-white uppercase italic tracking-tighter">{item?.name || 'Unnamed'}</p>
                                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{item?.set || 'OTHERS'}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-4">
                                <span className="text-[9px] font-black px-3 py-1 bg-slate-800 rounded-lg text-slate-400">
                                   {item?.rarity || 'P'}
                                </span>
                             </td>
                             <td className="px-8 py-4 font-black text-orange-500 text-xs">
                                ₹ {( (item?.price_usd || item?.valuation || 0) * 84).toLocaleString()}
                             </td>
                             <td className="px-8 py-4 font-mono text-[9px] text-slate-600">
                                {item?.id || 'N/A'}
                             </td>
                             <td className="px-8 py-4 text-right">
                                <button 
                                  onClick={() => item?.id && handleDeleteInventoryItem(item.id)}
                                  className="p-2 text-slate-700 hover:text-red-500 transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                             </td>
                          </tr>
                        ))
                      )}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}
      </div>
    );
  };

export default AdminDashboard;
