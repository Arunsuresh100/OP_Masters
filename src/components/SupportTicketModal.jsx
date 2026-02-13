import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle, Send } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useSupport } from '../context/SupportContext';

const CATEGORIES = [
    { value: 'transaction', label: 'Transaction Issue', icon: '💳' },
    { value: 'account', label: 'Account Problem', icon: '👤' },
    { value: 'technical', label: 'Technical Issue', icon: '🔧' },
    { value: 'payment', label: 'Payment Issue', icon: '💰' },
    { value: 'general', label: 'General Inquiry', icon: '❓' }
];

const PRIORITIES = [
    { value: 'low', label: 'Low', color: 'text-slate-400' },
    { value: 'medium', label: 'Medium', color: 'text-blue-400' },
    { value: 'high', label: 'High', color: 'text-amber-400' },
    { value: 'critical', label: 'Critical', color: 'text-red-400' }
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
            
            // Reset form and close after a brief delay
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
            }, 1500);
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
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-slate-900 w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col">
                
                {/* Header */}
                <div className="p-4 border-b border-white/10 bg-gradient-to-br from-amber-500/10 to-transparent flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-black text-white uppercase tracking-tight">
                            Report an Issue
                        </h2>
                        <p className="text-[10px] text-slate-400">
                            We'll get back to you soon
                        </p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-1.5 rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form - Compact Layout */}
                <div className="p-4">
                    <form onSubmit={handleSubmit} className="space-y-3">
                        
                        {/* Category */}
                        <div>
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                                Issue Category *
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, category: cat.value })}
                                        className={`p-2 rounded-lg border transition-all text-left flex items-center gap-2 ${
                                            formData.category === cat.value
                                                ? 'border-amber-500 bg-amber-500/10'
                                                : 'border-white/5 bg-slate-950/30 hover:border-amber-500/30'
                                        }`}
                                    >
                                        <span className="text-base">{cat.icon}</span>
                                        <span className="text-[10px] font-bold text-white leading-tight">{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                                Priority *
                            </label>
                            <div className="flex gap-2">
                                {PRIORITIES.map((priority) => (
                                    <button
                                        key={priority.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, priority: priority.value })}
                                        className={`flex-1 p-1.5 rounded-lg border transition-all text-center ${
                                            formData.priority === priority.value
                                                ? 'border-amber-500 bg-amber-500/10'
                                                : 'border-white/5 bg-slate-950/30 hover:border-amber-500/30'
                                        }`}
                                    >
                                        <span className={`text-[9px] font-black uppercase ${priority.color}`}>
                                            {priority.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Subject & Transaction ID Row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                                    Subject *
                                </label>
                                <input
                                    type="text"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    placeholder="Brief description..."
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                                    Trans. ID <span className="text-slate-600 font-normal">(Optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.transactionId}
                                    onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                                    placeholder="#"
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-all font-mono"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                                Detailed Description *
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Explain your issue..."
                                rows={3}
                                className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-all resize-none"
                                required
                            />
                        </div>

                        {/* Status Message */}
                        {status.message && (
                            <div className={`p-2 rounded-lg text-[10px] font-bold flex items-center gap-2 ${
                                status.type === 'error' 
                                    ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                                {status.type === 'error' ? <AlertCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                                {status.message}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="pt-1">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black rounded-lg hover:shadow-lg hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-3 h-3" />
                                {isSubmitting ? 'Sending...' : 'Submit Ticket'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SupportTicketModal;
