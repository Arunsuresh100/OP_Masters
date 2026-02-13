import React, { useState } from 'react';
import { X, Shield } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useUser } from '../context/UserContext';

const AuthModals = ({ isOpen, onClose, initialMode = 'login' }) => {
    const [loading, setLoading] = useState(false);
    const { login } = useUser();

    if (!isOpen) return null;

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setLoading(true);
            const res = await fetch('http://localhost:3001/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: credentialResponse.credential }),
                credentials: 'include'
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }
            
            // Login with user data from backend
            login(data.user);
            onClose();
        } catch (error) {
            console.error('Google login error:', error);
            alert('Login failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        console.error('Google Login Failed');
        alert('Google login failed. Please try again.');
    };

    return (
        <div 
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
                
                {/* Close Button */}
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 z-30 p-2 rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 pt-8">
                    {/* Security Badge - Inside */}
                    <div className="flex justify-center mb-6">
                        <div className="flex items-center gap-1.5 bg-emerald-500 px-4 py-1.5 rounded-full shadow-lg">
                            <Shield className="w-3.5 h-3.5 text-white" />
                            <span className="text-white text-[10px] font-black uppercase tracking-wider">Secure</span>
                        </div>
                    </div>
                    
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
                            Welcome
                        </h1>
                        <p className="text-slate-400 text-sm">
                            Sign in securely with your Google account
                        </p>
                    </div>

                    {/* Google Sign In Button */}
                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <div className="overflow-hidden rounded-xl">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={handleGoogleError}
                                    theme="outline"
                                    size="large"
                                    text="continue_with"
                                    shape="rectangular"
                                    width="350"
                                />
                            </div>
                        </div>
                        
                        {/* Trust Indicators */}
                        <div className="flex items-center justify-center gap-6 pt-2">
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Secure</span>
                            </div>
                            <div className="w-px h-4 bg-white/10"></div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Verified</span>
                            </div>
                            <div className="w-px h-4 bg-white/10"></div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                                <span>No Passwords</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-[10px] text-slate-600 mt-6">
                        Secure authentication • No passwords needed
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthModals;
