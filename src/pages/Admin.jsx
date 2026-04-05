import React, { useState } from 'react';
import { 
  Users, 
  PlusCircle, 
  Newspaper, 
  MessageSquare, 
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import AdminDashboard from '../components/AdminDashboard';
import TicketManager from '../components/TicketManager';
import logoImg from '../assets/logo.jpg';
import vegapunkImg from '../assets/Vegapunk.png';

const Admin = () => {
  const [password, setPassword] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [status, setStatus] = useState({ type: '', message: '' });

  // Check auth status on mount
  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/check`, { credentials: 'include' });
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
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
        await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (e) { console.error(e); }
    setAuthorized(false);
    setPassword('');
  };

  if (loading) return (
    <div className="min-h-screen bg-[#020618] flex items-center justify-center text-white font-sans antialiased text-sm uppercase tracking-widest font-black">
      Synchronizing Network...
    </div>
  );

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#020618]">
        <div className="w-full max-w-md bg-[#0f172a]/50 border border-white/5 rounded-2xl p-8 space-y-6 shadow-2xl backdrop-blur-sm">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-orange-500" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Admin Terminal</h2>
            <p className="text-slate-400 text-sm">Enter credential key to access global controls.</p>
          </div>
          <div className="space-y-4">
            <input 
              type="password" 
              placeholder="Authorization Key..."
              className="w-full bg-[#1e293b] border border-white/10 rounded-xl py-4 px-6 text-white focus:outline-none focus:border-orange-500 transition-all placeholder-slate-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
            />
            <button 
              onClick={handleAuth}
              className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl hover:shadow-lg hover:shadow-orange-600/20 transition-all uppercase tracking-wide text-sm"
            >
              Access Command Center
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

  return (
    <div className="min-h-screen bg-[#020618] text-white flex font-sans antialiased">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-white/5 flex flex-col sticky top-0 h-screen hidden lg:flex">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10 px-2 group cursor-pointer">
            <div className="relative flex-shrink-0">
              <img src={logoImg} alt="Logo" className="w-10 h-10 rounded-full object-cover bg-black border border-white/10 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent uppercase">OP MASTER</span>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em] -mt-1">Admin Panel</span>
            </div>
          </div>
          
          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
              { id: 'users', label: 'User Directory', icon: Users },
              { id: 'inventory', label: 'Card Inventory', icon: PlusCircle },
              { id: 'news', label: 'News Center', icon: Newspaper },
              { id: 'reports', label: 'Reports', icon: MessageSquare, badge: 1 }, // Hardcoded for demo matching user code
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${
                  activeTab === item.id 
                  ? 'bg-orange-600/10 text-orange-500 border border-orange-500/20' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className="bg-orange-600 text-[10px] px-1.5 py-0.5 rounded text-white font-bold">{item.badge}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 text-slate-500 hover:text-red-400 text-sm transition-colors w-full px-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight capitalize">{activeTab.replace('-', ' ')}</h2>
            <p className="text-slate-500 text-sm">System Administration & Global Management</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right mr-2">
                <p className="text-xs font-bold text-white uppercase tracking-wider">Vegapunk</p>
                <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center justify-end gap-1">
                   <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Network Stable
                </p>
             </div>
             <div className="w-10 h-10 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden shadow-lg shadow-orange-500/10">
                <img src="https://static.beebom.com/wp-content/uploads/2024/08/Vegapunk.jpg?w=1024" alt="Vegapunk" className="w-full h-full object-cover" />
             </div>
          </div>
        </header>

        {/* Content Modules */}
        <div className="space-y-6">
           {activeTab === 'reports' ? (
             <TicketManager />
           ) : (
             <AdminDashboard activeTab={activeTab} />
           )}
        </div>
      </main>
    </div>
  );
};

export default Admin;
