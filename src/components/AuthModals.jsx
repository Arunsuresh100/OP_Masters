import React, { useState, useEffect } from 'react';
import { X, Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useUser } from '../context/UserContext';

const AuthModals = ({ isOpen, onClose, initialMode = 'login' }) => {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { login } = useUser();
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    const handleGoogleError = (error) => {
        console.error('Google Login Failed:', error);
        alert('Google login failed. Please try again.');
    };

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
                onClose();
            } catch (error) {
                console.error('Google login error:', error);
                alert('Login failed: ' + error.message);
            } finally {
                setLoading(false);
            }
        },
        onError: handleGoogleError
    });

    useEffect(() => {
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

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        // This is a placeholder for actual email/password login
        setTimeout(() => {
            setLoading(false);
            alert('Email login feature is currently being implemented. Please use Google login for now.');
        }, 1000);
    };

    return (
        <div 
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200"
        >
            <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative top-[30px] animate-in zoom-in-95 duration-200">
                
                {/* Close Button */}
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 z-30 p-2 rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 pt-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
                            Welcome
                        </h1>
                        <p className="text-slate-400 text-sm">
                            Access your One Piece card collection
                        </p>
                    </div>

                    {/* Email/Password Form */}
                    <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
                        <div className="space-y-4">
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                                <input 
                                    type="email" 
                                    required
                                    placeholder="Email Address" 
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    required
                                    placeholder="Password" 
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-end">
                            <button type="button" className="text-xs font-bold text-amber-500/80 hover:text-amber-400 transition-colors">
                                Forgot Password?
                            </button>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wider"
                        >
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </form>

                    {/* OR Divider */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-px flex-1 bg-white/5"></div>
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">OR</span>
                        <div className="h-px flex-1 bg-white/5"></div>
                    </div>

                    {/* Google Sign In Button */}
                    <div className="space-y-6">
                        <div className="flex justify-center w-full">
                            <button 
                                onClick={() => handleGoogleLogin()}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-medium py-3 px-4 rounded-xl border border-white/10 transition-all transform active:scale-[0.98] shadow-lg"
                            >
                                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                <span>Continue with Google</span>
                            </button>
                        </div>
                        
                        {/* Footer Link */}
                        <div className="text-center mt-6">
                            <p className="text-slate-500 text-xs font-medium">
                                Don't have an account? {' '}
                                <button className="text-amber-500 font-bold hover:underline transition-all">
                                    Create one now
                                </button>
                            </p>
                        </div>
                    </div>


                    {/* Footer */}
                </div>
            </div>
        </div>
    );
};

export default AuthModals;
