import React from 'react';
import { useSupport } from '../context/SupportContext';
import { Users, ShoppingBag, AlertCircle, DollarSign, TrendingUp, Activity, ArrowUpRight } from 'lucide-react';
import { formatCompactNumber } from '../utils';

const AdminDashboard = ({ activeTab = 'overview' }) => {
    const { getStats } = useSupport();
    const ticketStats = getStats();
    const [stats, setStats] = React.useState({
        totalRevenue: 0,
        totalUsers: 0,
        activeListings: 0,
        revenueGrowth: 0,
        userGrowth: 0,
        listingsGrowth: 0,
        recentActivity: []
    });

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/stats', {
                    credentials: 'include' // Important for admin_token cookie
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (err) {
                console.error("Failed to fetch admin stats", err);
            }
        };
        fetchStats();
    }, []);

    const StatCard = ({ title, value, icon: Icon, color, trend }) => (
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-white/20 transition-all">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl bg-${color}-500/10 border border-${color}-500/20`}>
                        <Icon className={`w-6 h-6 text-${color}-500`} />
                    </div>
                    {trend !== undefined && (
                        <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                            <TrendingUp className="w-3 h-3" />
                            <span>+{trend}%</span>
                        </div>
                    )}
                </div>
                
                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</h3>
                <div className="text-2xl font-black text-white">{value}</div>
            </div>
        </div>
    );

    const [usersList, setUsersList] = React.useState([]);



    React.useEffect(() => {
        if (activeTab === 'users') {
            const fetchUsers = async () => {
                try {
                    const res = await fetch('http://localhost:3001/api/users', {
                        credentials: 'include'
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setUsersList(data.users);
                    }
                } catch (err) {
                    console.error("Failed to fetch users", err);
                }
            };
            fetchUsers();
        }
    }, [activeTab]);

    return (
        <div className="space-y-8">
            {/* Dashboard Content */}
            {activeTab === 'overview' && (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        <StatCard 
                            title="Total Revenue" 
                            value={`$${formatCompactNumber(stats.totalRevenue)}`} 
                            icon={DollarSign} 
                            color="emerald" 
                            trend={stats.revenueGrowth}
                        />
                        <StatCard 
                            title="Total Users" 
                            value={formatCompactNumber(stats.totalUsers)} 
                            icon={Users} 
                            color="blue" 
                            trend={stats.userGrowth}
                        />
                        <StatCard 
                            title="Active Listings" 
                            value={formatCompactNumber(stats.activeListings)} 
                            icon={ShoppingBag} 
                            color="purple" 
                            trend={stats.listingsGrowth}
                        />
                        <StatCard 
                            title="Open Tickets" 
                            value={ticketStats.open + ticketStats.inProgress} 
                            icon={AlertCircle} 
                            color="amber" 
                        />
                    </div>

                    {/* Charts & Activity Section */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* Main Chart Area (Mockup) */}
                        <div className="xl:col-span-2 bg-slate-900 border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-black text-white uppercase tracking-tight">Revenue Overview</h3>
                                    <p className="text-xs text-slate-500">Monthly revenue performance</p>
                                </div>
                                <select className="bg-slate-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500">
                                    <option>This Year</option>
                                    <option>Last Year</option>
                                </select>
                            </div>
                            
                            {/* CSS Bar Chart (Placeholder for Future Data) */}
                            <div className="overflow-x-auto pb-2 scrollbar-hide">
                                <div className="h-48 md:h-64 flex items-end justify-between gap-2 md:gap-4 px-2 min-w-[500px] md:min-w-0">
                                    {/* Initialize with 0s for now as requested by user */}
                                    {new Array(12).fill(0).map((height, i) => (
                                        <div key={i} className="w-full flex flex-col items-center gap-2 group">
                                            <div 
                                                className="w-full bg-slate-800 rounded-t-lg transition-colors relative"
                                                style={{ height: `${Math.max(height, 2)}%` }} // Min height for visibility
                                            >
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap shadow-xl border border-white/10">
                                                    ${height}k
                                                </div>
                                            </div>
                                            <span className="text-[9px] md:text-[10px] text-slate-500 font-mono uppercase">
                                                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity (Now Dynamic-ish) */}
                        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
                            <h3 className="text-lg font-black text-white uppercase tracking-tight mb-6">Recent Activity</h3>
                            <div className="space-y-6">
                                {stats.recentActivity && stats.recentActivity.length > 0 ? (
                                    stats.recentActivity.map((activity, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0`}>
                                                <Activity className={`w-4 h-4 text-emerald-500`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <p className="text-xs font-bold text-white truncate">
                                                        <span className="text-slate-400">{activity.userId || 'User'}</span> {activity.type}
                                                    </p>
                                                    <span className="text-[10px] text-slate-600 font-mono whitespace-nowrap">
                                                        {new Date(activity.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center mt-0.5">
                                                    <p className="text-[10px] text-slate-500 truncate">{activity.itemId || 'Item'}</p>
                                                    {activity.amount && (
                                                        <span className="text-[10px] font-bold text-emerald-400">${activity.amount}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-slate-500 text-xs py-8">
                                        No recent activity
                                    </div>
                                )}
                            </div>
                            <button className="w-full mt-6 py-3 bg-slate-950/50 hover:bg-slate-950 border border-white/5 rounded-xl text-xs font-bold text-slate-400 uppercase tracking-widest transition-all flex items-center justify-center gap-2 group">
                                View All Activity
                                <ArrowUpRight className="w-3 h-3 group-hover:text-amber-500 transition-colors" />
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Support Tickets Tab */}
            {activeTab === 'tickets' && (
                <TicketManager />
            )}

            {/* User Management Tab - NOW IMPLEMENTED */}
            {activeTab === 'users' && (
                <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">User Database</h3>
                            <p className="text-xs text-slate-500">View and manage registered users</p>
                        </div>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Live Data
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-slate-950/50">
                                    <th className="p-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold">User</th>
                                    <th className="p-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Email</th>
                                    <th className="p-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Role</th>
                                    <th className="p-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Joined</th>
                                    <th className="p-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {usersList.length > 0 ? (
                                    usersList.map((user) => (
                                        <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden border border-white/10">
                                                        {user.picture ? (
                                                            <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
                                                                {user.name?.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-bold text-white group-hover:text-amber-500 transition-colors">
                                                        {user.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-xs text-slate-400 font-mono">{user.email}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                                                    user.role === 'admin' 
                                                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                                                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-4 text-xs text-slate-500">
                                                {new Date(user.joinedAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button className="text-xs font-bold text-slate-500 hover:text-white transition-colors">
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-slate-500 italic">
                                            No users yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
