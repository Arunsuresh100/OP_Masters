import React, { useState } from 'react';
import { Send, Plus, Trash2, ShieldCheck, AlertCircle, LayoutDashboard, Ticket, Users, CreditCard, Box, LogOut } from 'lucide-react';
import AdminDashboard from '../components/AdminDashboard';
import TicketManager from '../components/TicketManager';

const Admin = () => {
  const [password, setPassword] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    rarity: 'SR',
    set: 'OP09',
    image: '',
    price: '',
    character: '',
    description: '',
    condition: 'Near Mint'
  });
  const [status, setStatus] = useState({ type: '', message: '' });

  // Check auth status on mount
  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/auth/check', { credentials: 'include' });
        if (res.ok) {
          setAuthorized(true);
        }
      } catch (err) {
        console.error('Auth check failed', err);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleAuth = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        credentials: 'include'
      });

      if (res.ok) {
        setAuthorized(true);
        setStatus({ type: 'success', message: 'Authorized access.' });
      } else {
        setStatus({ type: 'error', message: 'Invalid Admin Secret.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Login failed. Server unreachable.' });
    }
  };

  const handleLogout = async () => {
    try {
        await fetch('http://localhost:3001/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (e) { console.error(e); }
    setAuthorized(false);
    setPassword('');
  };

  const handleCardSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Send cookies
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setStatus({ type: 'success', message: 'Card posted successfully!' });
        setFormData({ ...formData, id: '', name: '', image: '', price: '', character: '' });
      } else {
        const err = await res.json();
        setStatus({ type: 'error', message: err.error || 'Failed to post card.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Server connection failed.' });
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Security Module...</div>;

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 pt-32 bg-slate-950">
        <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl shadow-amber-500/5">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Admin Access</h2>
            <p className="text-slate-400 text-sm">Enter secret key to manage the platform.</p>
          </div>
          <div className="space-y-4">
            <input 
              type="password" 
              placeholder="Admin Secret..."
              className="w-full bg-slate-950 border border-white/10 rounded-xl py-4 px-6 text-white focus:outline-none focus:border-amber-500 transition-all placeholder-slate-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
            />
            <button 
              onClick={handleAuth}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black rounded-xl hover:shadow-lg hover:shadow-amber-500/20 transition-all uppercase tracking-wide text-sm"
            >
              Unlock Terminal
            </button>
          </div>
          {status.message && (
            <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${status.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
              <AlertCircle className="w-4 h-4" />
              {status.message}
            </div>
          )}
        </div>
      </div>
    );
  }

  const NavItem = ({ id, label, icon: Icon, isMobile = false }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={isMobile 
        ? `flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
            activeTab === id 
              ? 'text-amber-500 scale-105' 
              : 'text-slate-500 hover:text-slate-400'
          }`
        : `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            activeTab === id 
              ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`
      }
    >
      <Icon className={isMobile ? "w-6 h-6 mb-1" : "w-5 h-5"} />
      <span className={isMobile ? "text-[10px] font-bold uppercase tracking-wide" : "text-sm font-bold uppercase tracking-wide text-left"}>
        {label}
      </span>
      {!isMobile && id === 'tickets' && (
        <span className="ml-auto bg-slate-950 px-2 py-0.5 rounded text-[10px] text-amber-500 font-black border border-amber-500/20">
          !
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-950 lg:pt-24 pt-20 pb-24 lg:pb-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Desktop Sidebar Navigation (Hidden on Mobile) */}
        <div className="hidden lg:block lg:col-span-3 space-y-6">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 space-y-2 sticky top-24">
            <h3 className="px-4 py-2 text-xs font-black text-slate-500 uppercase tracking-widest">Dashboard</h3>
            <NavItem id="overview" label="Overview" icon={LayoutDashboard} />
            <NavItem id="tickets" label="Support Tickets" icon={Ticket} />
            
            <div className="h-px bg-white/5 my-2"></div>
            
            <h3 className="px-4 py-2 text-xs font-black text-slate-500 uppercase tracking-widest">Management</h3>
            <NavItem id="cards" label="Card Manager" icon={Box} />
            <NavItem id="users" label="Users" icon={Users} />
            <NavItem id="transactions" label="Transactions" icon={CreditCard} />
            
            <div className="h-px bg-white/5 my-2"></div>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all font-bold text-sm uppercase tracking-wide"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Bottom Navigation (Visible only on Mobile/Tablet) */}
        <div className="lg:hidden fixed bottom-6 left-4 right-4 z-50 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl flex justify-around items-center">
            <NavItem id="overview" label="Home" icon={LayoutDashboard} isMobile={true} />
            <NavItem id="tickets" label="Support" icon={Ticket} isMobile={true} />
            <NavItem id="cards" label="Cards" icon={Box} isMobile={true} />
            <button 
                onClick={handleLogout}
                className="flex flex-col items-center justify-center p-2 text-red-400 rounded-xl"
            >
                <LogOut className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-wide">Exit</span>
            </button>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tight">
                {activeTab === 'overview' && 'Dashboard Overview'}
                {activeTab === 'tickets' && 'Support Tickets'}
                {activeTab === 'cards' && 'Card Management'}
                {activeTab === 'users' && 'User Management'}
                {activeTab === 'transactions' && 'Transaction History'}
              </h1>
              <p className="hidden sm:block text-slate-500 text-sm mt-1">
                Welcome back, Admin. System is running optimally.
              </p>
            </div>
            <div className="hidden sm:block">
               <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-bold text-emerald-400 flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                 System Online
               </span>
            </div>
          </div>

          {/* Content Rendering */}
          {(activeTab === 'overview' || activeTab === 'users') && <AdminDashboard activeTab={activeTab} />}


          {activeTab === 'transactions' && (
             <div className="bg-slate-900 border border-white/10 rounded-2xl p-12 text-center">
                <CreditCard className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Transaction History</h3>
                <p className="text-slate-500 mt-2">Module under development. Coming in Phase 3.</p>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Admin;

