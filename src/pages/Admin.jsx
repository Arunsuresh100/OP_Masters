import React, { useState } from 'react';
import { Send, Plus, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';

const Admin = () => {
  const [password, setPassword] = useState('');
  const [authorized, setAuthorized] = useState(false);
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

  const handleAuth = () => {
    // Basic frontend check, backend also verifies
    if (password === 'op-masters-secret-2026') {
      setAuthorized(true);
      setStatus({ type: 'success', message: 'Authorized access.' });
    } else {
      setStatus({ type: 'error', message: 'Invalid Admin Secret.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': password
        },
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

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 pt-32">
        <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-white">Admin Access</h2>
            <p className="text-slate-400 text-sm">Enter secret key to post new cards.</p>
          </div>
          <div className="space-y-4">
            <input 
              type="password" 
              placeholder="Admin Secret..."
              className="w-full bg-slate-950 border border-white/10 rounded-xl py-4 px-6 text-white focus:outline-none focus:border-amber-500 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button 
              onClick={handleAuth}
              className="w-full py-4 bg-amber-500 text-slate-950 font-black rounded-xl hover:bg-amber-400 transition-all"
            >
              Unlock Terminal
            </button>
          </div>
          {status.message && (
            <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${status.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
              {status.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
              {status.message}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-40 px-4 sm:px-6 max-w-4xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black text-white">Post New <span className="text-amber-500">Card</span></h1>
        <button onClick={() => setAuthorized(false)} className="text-xs font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors">Logout</button>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-white/10 rounded-3xl p-8 md:p-12 space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Card ID (e.g. OP09-119)</label>
            <input 
              required
              className="w-full bg-slate-950 border border-white/5 rounded-xl py-3 px-4 text-white focus:border-amber-500"
              value={formData.id}
              onChange={(e) => setFormData({...formData, id: e.target.value})}
            />
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Card Name</label>
            <input 
              required
              className="w-full bg-slate-950 border border-white/5 rounded-xl py-3 px-4 text-white focus:border-amber-500"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rarity</label>
            <select 
              className="w-full bg-slate-950 border border-white/5 rounded-xl py-3 px-4 text-white focus:border-amber-500"
              value={formData.rarity}
              onChange={(e) => setFormData({...formData, rarity: e.target.value})}
            >
              <option value="C">Common (C)</option>
              <option value="UC">Uncommon (UC)</option>
              <option value="R">Rare (R)</option>
              <option value="SR">Super Rare (SR)</option>
              <option value="SEC">Secret Rare (SEC)</option>
              <option value="L">Leader (L)</option>
            </select>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Price (USD)</label>
            <input 
              type="number" step="0.01"
              required
              className="w-full bg-slate-950 border border-white/5 rounded-xl py-3 px-4 text-white focus:border-amber-500"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
            />
          </div>
          <div className="md:col-span-2 space-y-4">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Image URL</label>
            <input 
              required
              className="w-full bg-slate-950 border border-white/5 rounded-xl py-3 px-4 text-white focus:border-amber-500"
              value={formData.image}
              onChange={(e) => setFormData({...formData, image: e.target.value})}
            />
          </div>
        </div>

        <button 
          type="submit"
          className="w-full py-5 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black rounded-2xl hover:shadow-2xl hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-3"
        >
          <Plus className="w-5 h-5" /> Deploy to Trade Network
        </button>

        {status.message && (
          <div className={`p-4 rounded-xl text-[10px] font-bold text-center ${status.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
            {status.message}
          </div>
        )}
      </form>
    </div>
  );
};

export default Admin;
