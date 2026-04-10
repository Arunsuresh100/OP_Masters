import React, { useState, useEffect, useRef } from 'react';
import { X, Shield, Mail, Lock, Eye, EyeOff, User, Smartphone, ArrowLeft, CheckCircle2, Calendar, Clock, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useUser } from '../context/UserContext';
import { API_URL } from '../constants';

const AuthModals = ({ isOpen, onClose, initialMode = 'login' }) => {
    const navigate = useNavigate();
    // Internal view state initialized from prop
    const [view, setView] = useState(initialMode); 
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showSignupPassword, setShowSignupPassword] = useState(false);
    
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [signupData, setSignupData] = useState({ 
        name: '', 
        email: '', 
        phone: '', 
        password: '',
        gender: '',
        dob: ''
    });

    const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
    const otpRefs = useRef([]);

    const maskEmail = (email) => {
        if (!email) return '';
        const [user, domain] = email.split('@');
        if (!domain) return email;
        const maskedUser = user.length > 2 ? user[0] + '***' + user[user.length - 1] : user + '***';
        return `${maskedUser}@${domain}`;
    };

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [timer, setTimer] = useState(180); // 3 minutes standard
    const [resendCooldown, setResendCooldown] = useState(0);
    const [isValidating, setIsValidating] = useState(false);
    const [touched, setTouched] = useState({});
    
    const { login } = useUser();
    const API_BASE = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;

    // MOBILE-ONLY BACKGROUND LOCK
    useEffect(() => {
        const isMobile = window.innerWidth < 768;
        if (isOpen && isMobile) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Synchronize view with initialMode when the modal opens
    useEffect(() => {
        if (isOpen) {
            setView(initialMode);
            // Reset common state
            setError('');
            setSuccess('');
            setIsValidating(false);
            setOtpArray(['', '', '', '', '', '']);
            setResendCooldown(0);
        }
    }, [isOpen, initialMode]);

    const handleReset = (newView = 'login') => {
        setFormData({ email: '', password: '' });
        setSignupData({ name: '', email: '', phone: '', password: '', gender: '', dob: '' });
        setOtpArray(['', '', '', '', '', '']);
        setError('');
        setSuccess('');
        setView(newView);
        setTimer(180);
        setResendCooldown(0);
        setIsValidating(false);
    };

    useEffect(() => {
        let interval = null;
        if (view === 'otp' && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [view, timer]);

    useEffect(() => {
        let interval = null;
        if (resendCooldown > 0) {
            interval = setInterval(() => {
                setResendCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendCooldown]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Clean up forms when closing
    useEffect(() => {
        if (!isOpen) {
            setFormData({ email: '', password: '' });
            setSignupData({ name: '', email: '', phone: '', password: '', gender: '', dob: '' });
            setOtpArray(['', '', '', '', '', '']);
            setError('');
            setSuccess('');
            setTimer(180);
            setResendCooldown(0);
            setIsValidating(false);
        }
    }, [isOpen]);

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setLoading(true);
                const res = await fetch(`${API_BASE}/api/auth/google`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ access_token: tokenResponse.access_token }),
                    credentials: 'include'
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Login failed');
                login(data.user);
                navigate('/');
                onClose();
            } catch (err) {
                console.error('Google Auth Error:', err);
                setError('Connection failed. If it\'s your first time today, please try again in 30 seconds.');
            } finally {
                setLoading(false);
            }
        }
    });

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                credentials: 'include'
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            login(data.user);
            navigate('/');
            onClose();
        } catch (err) {
            console.error('Login Error:', err);
            setError(err.message || 'Connection failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isValidPhone = (phone) => /^\d{10}$/.test(phone);

    const handleSignupInit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (!signupData.gender) {
            setLoading(false);
            return setError('Please select your gender.');
        }

        if (!isValidEmail(signupData.email)) {
            setLoading(false);
            return setError('Please enter a valid email address');
        }
        if (!isValidPhone(signupData.phone)) {
            setLoading(false);
            return setError('Mobile number must be exactly 10 digits');
        }
        
        const bday = new Date(signupData.dob);
        const today = new Date();
        if (bday >= today) {
            setLoading(false);
            return setError('Age Error: You cannot be born in the future!');
        }

        const age = today.getFullYear() - bday.getFullYear();
        if (age < 18) {
            setLoading(false);
            return setError('Access Denied: You must be at least 18 years old.');
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // Increased to 60s for SMTP reliability

        try {
            const res = await fetch(`${API_BASE}/api/auth/signup/init`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(signupData),
                credentials: 'include',
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Signup failed');

            setSuccess('OTP sent to your email ID');
            
            setTimeout(() => {
                setSuccess('');
                setView('otp');
                setTimer(180);
            }, 1000);
        } catch (err) {
            clearTimeout(timeoutId);
            console.error('Signup Error:', err);
            const msg = err.name === 'AbortError' 
                ? 'Server is taking too long to respond. Please try again.'
                : (err.message || 'Could not connect to server.');
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (timer === 0 || isValidating) return;
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otpArray];
        newOtp[index] = value.slice(-1);
        setOtpArray(newOtp);
        if (value && index < 5) otpRefs.current[index + 1]?.focus();
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        if (timer === 0 || isValidating) return;
        
        const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!pasteData) return;

        const newOtp = [...otpArray];
        pasteData.split('').forEach((char, idx) => {
            if (idx < 6) newOtp[idx] = char;
        });
        
        setOtpArray(newOtp);
        
        // Focus the last filled box or the next empty one
        const nextIndex = Math.min(pasteData.length, 5);
        otpRefs.current[nextIndex]?.focus();
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0 || loading) return;
        
        setLoading(true);
        setError('');
        setSuccess('');
        
        try {
            const res = await fetch(`${API_BASE}/api/auth/signup/resend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: signupData.email }),
                credentials: 'include'
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            
            setOtpArray(['', '', '', '', '', '']);
            setTimer(180); // Reset to 3 minutes
            setResendCooldown(60);
            setSuccess('New code sent to your email!');
        } catch (err) {
            setError(err.message || 'Failed to resend code.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fullOtp = otpArray.join('');
        if (fullOtp.length === 6 && timer > 0 && !isValidating) {
            const verifyOtp = async () => {
                setIsValidating(true);
                setError('');
                try {
                    const res = await fetch(`${API_BASE}/api/auth/signup/verify`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            email: signupData.email, 
                            otp: fullOtp 
                        }),
                        credentials: 'include'
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);

                    setSuccess('Identity Verified! Welcome aboard.');
                    setTimeout(() => {
                        login(data.user);
                        navigate('/');
                        onClose();
                    }, 1500);
                } catch (err) {
                    setError(err.message || 'Verification failed.');
                    setIsValidating(false);
                    // Clear OTP array on failure for retry
                    setOtpArray(['', '', '', '', '', '']);
                    otpRefs.current[0]?.focus();
                }
            };
            verifyOtp();
        }
    }, [otpArray, timer, isValidating]);

    const getPasswordStrength = (pwd) => {
        if (!pwd) return null;
        let score = 0;
        if (pwd.length > 5) score++;
        if (pwd.length > 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (score < 2) return { label: 'Weak', color: 'text-rose-500' };
        if (score < 4) return { label: 'Medium', color: 'text-amber-500' };
        return { label: 'Strong', color: 'text-emerald-500' };
    };

    const strength = getPasswordStrength(signupData.password);

    if (!isOpen) return null;



    return (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/90 animate-in fade-in duration-200 pt-20 uppercase overflow-hidden">
            <div className={`bg-slate-900 w-full ${view === 'signup' ? 'max-w-xl' : 'max-w-md'} rounded-[20px] border border-white/10 shadow-2xl overflow-hidden relative pointer-events-auto transition-all duration-300 h-auto max-h-[85vh] md:max-h-[none]`}>
                
                <button 
                    onClick={() => onClose()} 
                    className="absolute top-4 right-4 z-50 p-2 rounded-[10px] bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-6 pt-8 pb-3">
                    <div className="text-center mb-6">
                        {view === 'otp' && (
                            <button onClick={() => setView('signup')} className="absolute top-6 left-6 p-2 text-slate-500 hover:text-white transition-colors cursor-pointer">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        )}
                        <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-1">
                            {view === 'login' ? 'Welcome' : view === 'signup' ? 'Create Account' : 'Verify Email'}
                        </h1>
                        <p className="text-slate-400 text-sm normal-case px-4">
                            {view === 'login' ? 'Access your One Piece card collection' : view === 'signup' ? 'Join the Grand Line of card traders' : `Enter code sent to ${maskEmail(signupData.email)}`}
                        </p>
                    </div>

                    {(error || success) && (
                        <div className={`mb-4 mx-auto w-full p-2.5 border rounded-[10px] flex items-center gap-3 animate-in slide-in-from-top-2 ${error ? 'bg-rose-500/10 border-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                            {error ? <X className="w-4 h-4 text-rose-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                            <p className={`text-xs font-bold ${error ? 'text-rose-400' : 'text-emerald-400'}`}>{error || success}</p>
                        </div>
                    )}

                    {view === 'login' && (
                        <div className="animate-in fade-in duration-300 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-6">
                            <form onSubmit={handleEmailLogin} className="space-y-4">
                                <div className="space-y-3">
                                    <div className="relative group w-full">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input type="email" required placeholder="Email Address" className="w-full bg-white/5 border border-white/10 rounded-[10px] py-3 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 font-bold transition-all text-sm" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                    </div>
                                    <div className="relative group w-full">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input type={showPassword ? "text" : "password"} required placeholder="Password" className="w-full bg-white/5 border border-white/10 rounded-[10px] py-3 pl-11 pr-11 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 font-bold transition-all text-sm" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="flex justify-end">
                                    <button 
                                        type="button" 
                                        onClick={() => { 
                                            onClose();
                                            navigate('/forgot-password');
                                        }} 
                                        className="text-[9px] font-black text-amber-500 hover:text-amber-400 uppercase tracking-widest transition-colors"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>

                                <div className="w-full">
                                    <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black rounded-[12px] shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-50 uppercase tracking-wider text-sm">
                                        {loading ? 'Authenticating...' : 'Sign In'}
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 my-4 w-full">
                                    <div className="h-px flex-1 bg-white/5"></div>
                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">OR</span>
                                    <div className="h-px flex-1 bg-white/5"></div>
                                </div>

                                <div className="w-full">
                                    <button type="button" onClick={() => handleGoogleLogin()} className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 px-4 rounded-[12px] border border-white/10 transition-all transform active:scale-[0.98] shadow-lg group normal-case text-sm">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                        </svg>
                                        Continue with Google
                                    </button>
                                </div>
                                
                                <div className="mt-6 flex items-center justify-center gap-1.5 text-xs font-bold tracking-wider">
                                    <span className="text-slate-400 capitalize">I'm new here</span>
                                    <button type="button" onClick={() => { setError(''); setSuccess(''); setView('signup'); }} className="text-orange-500 hover:underline transition-all capitalize">
                                        Create account
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {view === 'signup' && (
                        <div className="overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-6 max-h-[60vh]">
                            <form className="space-y-4" onSubmit={handleSignupInit}>
                                <div className="space-y-1 w-full">
                                    <label className="text-[10px] text-white uppercase tracking-widest ml-1">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                        <input type="text" required value={signupData.name} onChange={(e) => setSignupData({ ...signupData, name: e.target.value })} placeholder="Full Name" className="w-full bg-black/40 border border-white/5 rounded-[10px] py-2.5 pl-11 pr-5 text-sm text-white focus:outline-none focus:border-amber-500/50 font-bold placeholder-slate-700" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-white uppercase tracking-widest ml-1">Email address</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input type="email" required value={signupData.email} onChange={(e) => { setSignupData({ ...signupData, email: e.target.value }); if (!touched.email) setTouched({ ...touched, email: true }); }} placeholder="Email Address" className={`w-full bg-white/5 border rounded-[10px] py-2.5 pl-11 pr-5 text-sm text-white focus:outline-none font-bold placeholder-slate-700 transition-all ${touched.email && signupData.email && !isValidEmail(signupData.email) ? 'border-rose-500/50 bg-rose-500/5' : 'border-white/10 focus:border-amber-500/50'}`} />
                                        </div>
                                        {touched.email && signupData.email && !isValidEmail(signupData.email) && <p className="text-[9px] text-rose-500 font-bold ml-1">Please enter a valid email format</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-white uppercase tracking-widest ml-1">Mobile Number</label>
                                        <div className="relative group">
                                            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input type="tel" required value={signupData.phone} onChange={(e) => { const val = e.target.value.replace(/\D/g, '').slice(0, 10); setSignupData({ ...signupData, phone: val }); if (!touched.phone) setTouched({ ...touched, phone: true }); }} placeholder="10 Digits" className={`w-full bg-white/5 border rounded-[10px] py-2.5 pl-11 pr-5 text-sm text-white focus:outline-none font-bold placeholder-slate-700 transition-all ${touched.phone && signupData.phone && !isValidPhone(signupData.phone) ? 'border-rose-500/50 bg-rose-500/5' : 'border-white/10 focus:border-amber-500/50'}`} />
                                        </div>
                                        {touched.phone && signupData.phone && !isValidPhone(signupData.phone) && <p className="text-[9px] text-rose-500 font-bold ml-1">10 Digits Required</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end w-full">
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-white uppercase tracking-widest ml-1">Gender</label>
                                        <div className="flex gap-2">
                                            {['M', 'F', 'O'].map(g => (
                                                <button key={g} type="button" onClick={() => setSignupData({ ...signupData, gender: g })} className={`flex-1 py-2 rounded-[10px] border text-[9px] font-black transition-all ${signupData.gender === g ? 'bg-white text-slate-950 border-white shadow-lg' : 'bg-black/20 border-white/5 text-slate-600 hover:text-white'}`}>{g === 'M' ? 'MALE' : g === 'F' ? 'FEMALE' : 'OTHER'}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-white uppercase tracking-widest ml-1">Age (18+ only)</label>
                                        <div className="relative group">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                            <input type="date" required max={new Date(Date.now() - 86400000).toISOString().split('T')[0]} value={signupData.dob} onChange={(e) => setSignupData({ ...signupData, dob: e.target.value })} className="w-full bg-black/40 border border-white/5 rounded-[10px] py-2.5 pl-11 pr-4 text-[11px] text-white focus:outline-none focus:border-amber-500/50 font-bold" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1 w-full relative">
                                    <label className="text-[10px] text-white uppercase tracking-widest ml-1">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                        <input type={showSignupPassword ? "text" : "password"} required value={signupData.password} onChange={(e) => setSignupData({ ...signupData, password: e.target.value })} placeholder="Create Password" className="w-full bg-black/40 border border-white/5 rounded-[10px] py-2.5 pl-11 pr-11 text-sm text-white focus:outline-none focus:border-amber-500/50 font-bold placeholder-slate-700" />
                                        <button type="button" onClick={() => setShowSignupPassword(!showSignupPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                                            {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {signupData.password && (
                                        <div className="mt-1.5 flex items-center gap-2">
                                            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div className={`h-full transition-all duration-500 ${strength?.label === 'Weak' ? 'w-1/3 bg-rose-500' : strength?.label === 'Medium' ? 'w-2/3 bg-amber-500' : 'w-full bg-emerald-500'}`}></div>
                                            </div>
                                            <span className={`text-[8px] font-black uppercase tracking-widest ${strength?.color}`}>{strength?.label} Password</span>
                                        </div>
                                    )}
                                </div>

                                <div className="w-full">
                                    <button type="submit" disabled={loading} className={`w-full font-black py-3 rounded-[12px] uppercase text-[11px] tracking-widest transition-all mt-4 shadow-xl transform active:scale-[0.98] ${loading ? 'bg-slate-700 text-slate-400 opacity-50' : 'bg-white text-slate-950 hover:bg-amber-500'}`}>
                                        {loading ? 'Sending Code...' : 'Create Account'}
                                    </button>
                                </div>
                                
                                <div className="mt-6 flex items-center justify-center gap-1.5 text-xs font-bold tracking-wider">
                                    <span className="text-slate-400 capitalize">I already have access</span>
                                    <button type="button" onClick={() => { setError(''); setSuccess(''); setView('login'); }} className="text-orange-500 hover:underline transition-all capitalize">
                                        Sign In
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {view === 'otp' && (
                        <div className="animate-in fade-in zoom-in-95 duration-300 px-4 pb-6">
                            <div className="flex flex-col items-center mb-6">
                                <div className={`w-12 h-12 rounded-[10px] flex items-center justify-center border mb-4 ${timer === 0 ? 'bg-rose-500/10 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : 'bg-amber-500/10 border-amber-500/20 animate-pulse'}`}>
                                    <Clock className={`w-6 h-6 ${timer === 0 ? 'text-rose-500' : 'text-amber-500'}`} />
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-1">Verify Security Code</p>
                                <div className={`flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border ${timer === 0 ? 'border-rose-500/10' : 'border-white/10'}`}>
                                    <span className={`text-[10px] font-black ${timer === 0 ? 'text-rose-500' : 'text-white'}`}>{timer === 0 ? 'EXPIRED' : formatTime(timer)}</span>
                                    {timer > 0 && <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">REMAINING</span>}
                                </div>
                            </div>
                            
                            <div className="flex justify-center gap-2 mb-6">
                                {otpArray.map((digit, idx) => (
                                    <input
                                        key={idx}
                                        ref={(el) => (otpRefs.current[idx] = el)}
                                        type="text"
                                        maxLength="1"
                                        disabled={timer === 0 || isValidating}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                        onPaste={handleOtpPaste}
                                        className={`w-12 h-12 md:w-14 md:h-14 bg-white/5 border-2 rounded-[12px] text-center text-2xl font-black transition-all ${isValidating ? 'border-emerald-500 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : timer === 0 ? 'border-rose-500/20 text-rose-500/50 cursor-not-allowed' : 'border-white/20 text-white focus:border-amber-500 focus:bg-white/10 outline-none'}`}
                                        autoFocus={idx === 0}
                                    />
                                ))}
                            </div>

                            <div className="text-center space-y-4">
                                {timer === 0 ? (
                                    <div className="space-y-4">
                                        <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest">Verification Session Expired</p>
                                        <button 
                                            onClick={() => setView('signup')}
                                            className="flex items-center gap-2 mx-auto text-xs text-white font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 px-6 py-3 rounded-[12px] transition-all border border-white/5 shadow-xl"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                            Restart Signup
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-4">
                                        <button onClick={() => setView('signup')} className="text-[10px] text-slate-500 font-bold uppercase hover:underline tracking-widest">Change Email Address / Restart</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModals;
