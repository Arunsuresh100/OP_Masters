import React from 'react';
import { TrendingUp, ShoppingBag, Crown, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = ({ channelUrl }) => {
    return (
        <>
            <footer className="relative py-12 border-t border-white/10 text-center space-y-4">
                <p className="text-slate-600 text-sm">© 2026 One Piece Masters. Unofficial Fan Site. <br/>One Piece is a trademark of Eiichiro Oda / Shueisha / Toei Animation.</p>
                <div className="flex justify-center gap-4">
                  <Link to="/admin" className="text-[10px] text-slate-800 hover:text-slate-600 transition-colors uppercase tracking-widest font-black">Terminal Access</Link>
                </div>
            </footer>
            {/* Mobile Bottom Navigation (App-like feel) */}
            <div className="fixed bottom-0 left-0 w-full bg-slate-950/90 backdrop-blur-xl border-t border-white/10 md:hidden z-50 pb-safe">
                <div className="flex justify-around items-center h-16">
                <Link to="/" className="flex flex-col items-center justify-center w-full h-full text-amber-500">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-[10px] font-bold mt-1">Home</span>
                </Link>
                <Link to="/marketplace" className="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-white transition-colors">
                    <ShoppingBag className="w-5 h-5" />
                    <span className="text-[10px] font-bold mt-1">Market</span>
                </Link>
                <button onClick={() => {
                    if (window.location.pathname === '/') {
                        document.getElementById('common')?.scrollIntoView({ behavior: 'smooth' });
                    }
                }} className="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-white transition-colors">
                    <Crown className="w-5 h-5" />
                    <span className="text-[10px] font-bold mt-1">Rarities</span>
                </button>
                <a href={channelUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-white transition-colors">
                    <Users className="w-5 h-5" />
                    <span className="text-[10px] font-bold mt-1">Channel</span>
                </a>
                </div>
            </div>
            {/* Spacer to prevent Footer from being hidden behind Nav */}
            <div className="h-20 md:hidden"></div>
      </>
    );
};

export default Footer;
