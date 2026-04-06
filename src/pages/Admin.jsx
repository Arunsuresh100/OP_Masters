import React, { useState } from 'react';
import { 
  Users, 
  PlusCircle, 
  Newspaper, 
  MessageSquare, 
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import AdminDashboard from '../components/AdminDashboard';
import TicketManager from '../components/TicketManager';
import logoImg from '../assets/logo.jpg';
import vegapunkImg from '../assets/Vegapunk.png';

// Simple Safety Wrapper to prevent White Screen Crashes
const SafeModule = ({ children }) => {
  const [hasError, setHasError] = React.useState(false);
  
  React.useEffect(() => {
    const handleError = (error) => {
      console.error("Module Crash Detected:", error);
      setHasError(true);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="p-20 bg-red-500/5 border border-red-500/10 rounded-[2.5rem] text-center flex flex-col items-center gap-6">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <div>
          <h3 className="text-xl font-black text-white uppercase italic mb-2 tracking-widest">Module Failure</h3>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">The requested administration terminal encountered a runtime exception.</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all"
        >
          Re-initialize System
        </button>
      </div>
    );
  }

  return children;
};

const Admin = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authorized, setAuthorized] = useState(false); // Locked by default
  const [loading, setLoading] = useState(true); // Must load to check existing cookie
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
          <div className="space-y-4 relative">
            <div className="relative group">
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="Authorization Key..."
                className="w-full bg-[#1e293b] border border-white/10 rounded-xl py-4 flex-1 px-6 pr-14 text-white focus:outline-none focus:border-orange-500 transition-all placeholder-slate-600 font-mono tracking-widest"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-white transition-colors"
                title={showPassword ? "Hide Key" : "Show Key"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
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
    <div className="h-screen overflow-hidden bg-[#020618] text-white flex flex-col lg:flex-row font-sans antialiased relative">
      
      {/* Mobile Top Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/5 sticky top-0 bg-[#020618]/90 backdrop-blur-xl z-[100]">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <img src={logoImg} alt="Logo" className="w-8 h-8 rounded-full object-cover bg-black border border-white/10" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent uppercase">OP MASTER</span>
            <span className="text-[7px] font-bold text-slate-500 uppercase tracking-[0.2em] -mt-0.5">Admin</span>
          </div>
        </div>
        <button onClick={handleLogout} className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Desktop Sidebar Navigation */}
      <aside className="w-64 border-r border-white/5 flex flex-col sticky top-0 h-screen hidden lg:flex">
        <div className="p-6 flex-1">
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
              { id: 'reports', label: 'Support Hub', icon: MessageSquare },
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
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 border-t border-white/5 flex-shrink-0">
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
      <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight capitalize">{activeTab.replace('-', ' ')}</h2>
            <p className="text-slate-500 text-xs md:text-sm">System Administration & Global Management</p>
          </div>
          <div className="flex items-center gap-4 self-start md:self-auto">
             <div className="text-right mr-2 hidden md:block">
                <p className="text-xs font-bold text-white uppercase tracking-wider">Vegapunk</p>
                <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center justify-end gap-1">
                   <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Network Stable
                </p>
             </div>
             <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden shadow-lg shadow-orange-500/10">
                <img src="https://static.beebom.com/wp-content/uploads/2024/08/Vegapunk.jpg?w=1024" alt="Vegapunk" className="w-full h-full object-cover" />
             </div>
          </div>
        </header>

        {/* Content Modules */}
        <div className="space-y-6">
           <SafeModule>
             {activeTab === 'reports' ? (
               <TicketManager />
             ) : (
               <AdminDashboard activeTab={activeTab} />
             )}
           </SafeModule>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-[#020618]/95 backdrop-blur-xl border-t border-white/10 z-[100] px-4 py-2 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
         <nav className="flex items-center justify-between">
            {[
              { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'inventory', label: 'Cards', icon: PlusCircle },
              { id: 'reports', label: 'Support', icon: MessageSquare },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center w-full py-1 gap-1 transition-all ${
                  activeTab === item.id 
                  ? 'text-orange-500' 
                  : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
              </button>
            ))}
         </nav>
      </div>

    </div>
  );
};

export default Admin;
