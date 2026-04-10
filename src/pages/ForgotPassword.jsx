import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Shield, 
    Mail, 
    Lock, 
    Eye, 
    EyeOff, 
    ArrowLeft, 
    CheckCircle2, 
    Clock, 
    RotateCcw,
    ChevronRight,
    Search,
    AlertCircle,
    Loader2,
    Sparkles,
    KeyRound
} from 'lucide-react';
import { API_URL } from '../constants';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [stage, setStage] = useState('email'); // email, otp, reset, success
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Form States
    const [email, setEmail] = useState('');
    const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
    const [resetToken, setResetToken] = useState('');
    const [passwords, setPasswords] = useState({ new: '', confirm: '' });
    const [showPassword, setShowPassword] = useState(false);
    
    // Timer States
    const [timer, setTimer] = useState(300); // 5 minutes
    const [resendCooldown, setResendCooldown] = useState(0);
    const otpRefs = useRef([]);

    // --- UTILS ---
    const maskEmail = (email) => {
        if (!email) return '';
        const [user, domain] = email.split('@');
        return `${user[0]}***${user[user.length - 1]}@${domain}`;
    };

    // Auto-hide success message
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    // Automatic OTP Verification
    useEffect(() => {
        const otp = otpArray.join('');
        if (otp.length === 6) {
            autoVerifyOtp(otp);
        }
    }, [otpArray]);

    const autoVerifyOtp = async (otp) => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_URL}/api/auth/reset/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.toLowerCase().trim(), otp })
            });
            const data = await res.json();
            if (res.ok) {
                setResetToken(data.resetToken);
                setStage('reset');
                // Identity verified - move to reset stage silently for smoother UX
            } else {
                setError(data.error || 'Invalid or expired code.');
                // Senior UX: Clear OTP on failure
                setOtpArray(['', '', '', '', '', '']);
                otpRefs.current[0]?.focus();
            }
        } catch (err) {
            setError('Connection failed.');
        } finally {
            setLoading(false);
        }
    };

    // 1. Initialize Reset
    const handleInitReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const res = await fetch(`${API_URL}/api/auth/reset/init`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.toLowerCase().trim() })
            });
            
            const data = await res.json();
            if (res.ok) {
                setStage('otp');
                setTimer(300);
                setResendCooldown(60);
                // Removed redundant success toast as per user request
            } else {
                setError(data.error || 'Check email and try again.');
            }
        } catch (err) {
            setError('Network error.');
        } finally {
            setLoading(false);
        }
    };

    // 3. Complete Reset
    const handleCompleteReset = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) return setError('Mismatch.');
        if (passwords.new.length < 8) return setError('Too short (8+).');
        
        setLoading(true);
        setError('');
        
        try {
            const res = await fetch(`${API_URL}/api/auth/reset/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: email.toLowerCase().trim(),
                    resetToken,
                    newPassword: passwords.new
                })
            });
            
            const data = await res.json();
            if (res.ok) {
                setStage('success');
                // Removed success toast as per user request - transition moves directly to short success view and then redirect
                // Senior Logic: Auto-redirect after a short visual confirmation
                setTimeout(() => {
                    navigate('/?auth=login');
                }, 3000);
            } else {
                setError(data.error || 'Reset failed.');
            }
        } catch (err) {
            setError('Network error.');
        } finally {
            setLoading(false);
        }
    };

    // OTP Input Helpers
    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otpArray];
        newOtp[index] = value.slice(-1);
        setOtpArray(newOtp);
        if (value && index < 5) otpRefs.current[index + 1].focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
            otpRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pastedData.length > 0) {
            const newOtp = [...otpArray];
            pastedData.split('').forEach((char, i) => {
                if (i < 6) newOtp[i] = char;
            });
            setOtpArray(newOtp);
            // Focus specific box or trigger auto-verify
            const focusIdx = Math.min(pastedData.length, 5);
            otpRefs.current[focusIdx]?.focus();
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Success Toast / Popup */}
            {success && (
                <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[3000] animate-in fade-in slide-in-from-top-6 duration-500 pointer-events-none">
                    <div className="bg-emerald-500/90 backdrop-blur-xl border border-emerald-400/20 px-6 py-3 rounded-full shadow-[0_15px_40px_rgba(16,185,129,0.25)] flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                        <span className="text-xs font-black text-white uppercase tracking-widest whitespace-nowrap">{success}</span>
                    </div>
                </div>
            )}

            {/* Background Aesthetics */}
            <div className="absolute top-0 left-0 w-full h-full opacity-60">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/10 blur-[130px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[130px] rounded-full animate-pulse delay-1000" />
            </div>

            <div className={`w-full transition-all duration-500 ease-out z-10 ${stage === 'otp' ? 'max-w-lg' : 'max-w-md'}`}>
                {/* Main Card */}
                <div className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden">
                    
                    {error && (
                        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                            <p className="text-rose-200 text-xs font-bold leading-relaxed">{error}</p>
                        </div>
                    )}

                    {/* Stage Rendering */}
                    {stage === 'email' && (
                        <form onSubmit={handleInitReset} className="space-y-8">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Forgot Password?</h2>
                                <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest">Identify your account to proceed</p>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                                        <Mail className="w-4 h-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                                    </div>
                                    <input 
                                        type="email" required value={email} 
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="Enter your email address"
                                        className={`w-full h-13 bg-slate-950/40 border ${email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'border-rose-500' : 'border-white/5'} rounded-2xl py-3.5 pl-14 pr-5 text-sm font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 focus:bg-slate-900/40 transition-all`}
                                    />
                                </div>
                                {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                                    <p className="text-rose-500 text-[10px] font-black uppercase px-2 flex items-center gap-1.5">
                                        <AlertCircle className="w-3 h-3" /> Please enter a valid email
                                    </p>
                                )}
                            </div>

                            <button 
                                type="submit" disabled={loading || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))}
                                className="w-full h-13 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:bg-amber-500 transition-all duration-300 shadow-xl disabled:opacity-20"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Send Reset Code <ChevronRight className="w-4 h-4" /></>}
                            </button>
                            
                            <Link to="/" className="flex items-center justify-center gap-2 text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">
                                <ArrowLeft className="w-3.5 h-3.5" /> Back to Log In
                            </Link>
                        </form>
                    )}

                    {stage === 'otp' && (
                        <form className="space-y-10">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black text-white uppercase tracking-tight">Check Your Inbox</h2>
                                <p className="text-slate-500 text-[11px] font-black uppercase leading-relaxed tracking-widest">
                                    Code sent to <span className="text-white">{maskEmail(email)}</span>
                                </p>
                            </div>

                            <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
                                {otpArray.map((digit, idx) => (
                                    <input 
                                        key={idx} ref={el => otpRefs.current[idx] = el}
                                        type="text" maxLength={1} value={digit}
                                        onChange={e => handleOtpChange(idx, e.target.value)}
                                        onKeyDown={e => handleKeyDown(idx, e)}
                                        onPaste={handlePaste}
                                        className="w-12 h-14 md:w-13 md:h-15 bg-slate-950/60 border border-white/5 rounded-2xl text-center text-2xl font-black text-amber-500 focus:outline-none focus:border-amber-500 focus:bg-slate-900 transition-all shadow-xl uppercase"
                                    />
                                ))}
                            </div>

                            <div className="space-y-6">
                                {loading && (
                                    <div className="flex justify-center">
                                        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                                    </div>
                                )}
                                <div className="flex flex-col items-center gap-4">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-1.5 bg-white/5 rounded-full">
                                        <Clock className="w-3.5 h-3.5" />
                                        Expires in <span className="text-amber-500">{formatTime(timer)}</span>
                                    </div>
                                    <button 
                                        type="button" disabled={resendCooldown > 0 || loading}
                                        onClick={handleInitReset}
                                        className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest disabled:opacity-20 hover:text-amber-500 transition-colors"
                                    >
                                        <RotateCcw className={`w-3 h-3 ${resendCooldown > 0 ? '' : 'animate-spin-once'}`} />
                                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {stage === 'reset' && (
                        <form onSubmit={handleCompleteReset} className="space-y-8">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">New Password</h2>
                                <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest">Set your new secure access code</p>
                            </div>

                            <div className="space-y-4">
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                                    <input 
                                        type={showPassword ? 'text' : 'password'} required
                                        value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                        placeholder="Create New Password"
                                        className={`w-full h-13 bg-slate-950/40 border ${passwords.new && passwords.new.length < 8 ? 'border-rose-500' : 'border-white/5'} rounded-2xl py-3.5 pl-14 pr-12 text-sm font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-all`}
                                    />
                                    <button 
                                        type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {passwords.new && passwords.new.length < 8 && (
                                    <p className="text-rose-500 text-[10px] font-black uppercase px-2 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                                        <AlertCircle className="w-3 h-3" /> Password must be at least 8 characters
                                    </p>
                                )}

                                <div className="relative group">
                                    <CheckCircle2 className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                                    <input 
                                        type={showPassword ? 'text' : 'password'} required
                                        value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                        placeholder="Confirm New Password"
                                        className={`w-full h-13 bg-slate-950/40 border ${passwords.confirm && passwords.new !== passwords.confirm ? 'border-rose-500' : 'border-white/5'} rounded-2xl py-3.5 pl-14 pr-5 text-sm font-bold text-white placeholder:text-slate-700 focus:outline-none focus:border-amber-500/50 transition-all`}
                                    />
                                </div>
                                {passwords.confirm && passwords.new !== passwords.confirm && (
                                    <p className="text-rose-500 text-[10px] font-black uppercase px-2 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                                        <AlertCircle className="w-3 h-3" /> Passwords do not match
                                    </p>
                                )}
                            </div>

                            {/* Password Strength */}
                            <div className="px-1">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Strength</span>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${passwords.new.length >= 8 && /\d/.test(passwords.new) ? 'text-emerald-500' : 'text-amber-500'}`}>
                                        {passwords.new.length === 0 ? '---' : passwords.new.length >= 8 && /\d/.test(passwords.new) ? 'Secure' : 'Insufficient'}
                                    </span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                     <div 
                                        className={`h-full transition-all duration-700 ${passwords.new.length >= 8 && /\d/.test(passwords.new) ? 'bg-emerald-500 w-full' : passwords.new.length > 0 ? 'bg-amber-500 w-1/3' : 'w-0'}`}
                                     />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading || passwords.new.length < 8 || passwords.new !== passwords.confirm}
                                className="w-full h-13 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-20 disabled:grayscale disabled:scale-100"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply New Password'}
                            </button>
                        </form>
                    )}

                    {stage === 'success' && (
                        <div className="text-center py-6 space-y-8 animate-in zoom-in-95 duration-700">
                            <div className="relative w-24 h-24 mx-auto">
                                <div className="absolute inset-0 bg-emerald-500/20 blur-[30px] rounded-full animate-pulse" />
                                <div className="relative w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.4)]">
                                    <CheckCircle2 className="w-12 h-12 text-white" />
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">Password Updated</h2>
                                <p className="text-slate-400 text-sm font-bold leading-relaxed max-w-xs mx-auto">
                                    Your vault access has been restored. Redirecting to terminal...
                                </p>
                            </div>

                            <div className="flex justify-center">
                                <Loader2 className="w-6 h-6 animate-spin text-emerald-500 opacity-50" />
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
