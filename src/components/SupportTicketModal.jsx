import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle, Send, CreditCard, User, Wrench, Coins, HelpCircle } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useSupport } from '../context/SupportContext';

const CATEGORIES = [
    { value: 'transaction', label: 'Transaction Issue', icon: CreditCard },
    { value: 'account', label: 'Account Problem', icon: User },
    { value: 'technical', label: 'Technical Issue', icon: Wrench },
    { value: 'payment', label: 'Payment Issue', icon: Coins },
    { value: 'general', label: 'General Inquiry', icon: HelpCircle }
];

const PRIORITIES = [
    { value: 'low', label: 'LOW', color: 'text-slate-400', activeBg: 'bg-slate-800' },
    { value: 'medium', label: 'MEDIUM', color: 'text-blue-400', activeBg: 'bg-blue-500/10' },
    { value: 'high', label: 'HIGH', color: 'text-amber-400', activeBg: 'bg-amber-500/10' },
    { value: 'critical', label: 'CRITICAL', color: 'text-red-400', activeBg: 'bg-red-500/10' }
];

const SupportTicketModal = ({ isOpen, onClose }) => {
    const { user } = useUser();
    const { createTicket } = useSupport();
    const [formData, setFormData] = useState({
        category: 'general',
        subject: '',
        description: '',
        transactionId: '',
        priority: 'medium'
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.subject.trim() || !formData.description.trim()) {
            setStatus({ type: 'error', message: 'Please fill in all required fields' });
            return;
        }

        setIsSubmitting(true);
        
        try {
            createTicket({
                ...formData,
                userName: user.displayName || user.username,
                userEmail: user.email,
                userAvatar: user.selectedAvatar
            });

            setStatus({ type: 'success', message: 'Ticket submitted successfully!' });
            
            setTimeout(() => {
                setFormData({
                    category: 'general',
                    subject: '',
                    description: '',
                    transactionId: '',
                    priority: 'medium'
                });
                setStatus({ type: '', message: '' });
                onClose();
            }, 3500);
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to submit ticket. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-[#0f111a] w-full max-w-lg rounded-[2rem] border border-white/10 shadow-3xl relative animate-in zoom-in-95 duration-200 flex flex-col overflow-hidden">
                
                {/* Header */}
                <div className="pt-6 px-6 pb-4 flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight leading-none mb-1.5">
                            REPORT AN ISSUE
                        </h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            Grand Line Support Desk
                        </p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 rounded-xl bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="px-6 pb-6 overflow-y-auto max-h-[80vh] no-scrollbar">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        
                        {/* Category */}
                        <div>
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2">
                                ISSUE CATEGORY *
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, category: cat.value })}
                                        className={`p-3 rounded-xl border transition-all text-left flex items-center gap-3 relative overflow-hidden group/cat ${
                                            formData.category === cat.value
                                                ? 'border-amber-500/50 bg-amber-500/5'
                                                : 'border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.03]'
                                        }`}
                                    >
                                        <div className={`p-1.5 rounded-lg transition-colors ${formData.category === cat.value ? 'bg-amber-500/20 text-amber-500' : 'bg-white/5 text-slate-500 group-hover/cat:text-slate-400'}`}>
                                            <cat.icon className="w-3.5 h-3.5" />
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-tight leading-tight ${formData.category === cat.value ? 'text-white' : 'text-slate-500 group-hover/cat:text-slate-300'}`}>
                                            {cat.label}
                                        </span>
                                        {formData.category === cat.value && (
                                            <div className="absolute inset-0 border-2 border-amber-500 rounded-xl pointer-events-none opacity-10"></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2">
                                PRIORITY *
                            </label>
                            <div className="flex gap-1.5">
                                {PRIORITIES.map((priority) => (
                                    <button
                                        key={priority.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, priority: priority.value })}
                                        className={`flex-1 p-2.5 rounded-xl border transition-all text-center group ${
                                            formData.priority === priority.value
                                                ? `border-amber-500/50 ${priority.activeBg} ring-1 ring-amber-500/20`
                                                : 'border-white/5 bg-white/[0.01] hover:border-white/10'
                                        }`}
                                    >
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${formData.priority === priority.value ? (priority.value === 'medium' ? 'text-blue-400' : priority.color) : 'text-slate-600 group-hover:text-slate-400'}`}>
                                            {priority.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Subject & Transaction ID Row */}
                        <div className="grid grid-cols-5 gap-3">
                            <div className="col-span-3">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2">
                                    SUBJECT *
                                </label>
                                <input
                                    type="text"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    placeholder="Brief description..."
                                    className="w-full bg-[#08090d] border border-white/5 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-700 font-medium focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                                    required
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2">
                                    TRANS. ID
                                </label>
                                <input
                                    type="text"
                                    value={formData.transactionId}
                                    onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                                    placeholder="Optional #"
                                    className="w-full bg-[#08090d] border border-white/5 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all font-mono"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2">
                                DETAILED DESCRIPTION *
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Explain your issue..."
                                rows={2}
                                className="w-full bg-[#08090d] border border-white/5 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-700 font-medium focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all resize-none leading-relaxed"
                                required
                            />
                        </div>

                        {/* Status Message */}
                        {status.message && (
                            <div className={`p-2.5 rounded-xl text-[10px] font-bold flex items-center gap-2 animate-in slide-in-from-top-2 ${
                                status.type === 'error' 
                                    ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                                {status.type === 'error' ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                {status.message}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="pt-1">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3.5 bg-gradient-to-r from-[#ff5e0e] to-[#ff7d05] text-slate-950 font-black rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-[#ff5e0e]/10"
                            >
                                <Send className="w-3.5 h-3.5 fill-current" />
                                {isSubmitting ? 'SENDING...' : 'SUBMIT TICKET'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SupportTicketModal;
