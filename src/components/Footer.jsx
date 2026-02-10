import React from 'react';
import { TrendingUp, Play, Crown, Users } from 'lucide-react';

const Footer = ({ channelUrl }) => {
    return (
        <>
            <footer className="relative py-12 border-t border-white/10 text-center">
                <p className="text-slate-600 text-sm">© 2026 OP Masters. Unofficial Fan Site. <br/>One Piece is a trademark of Eiichiro Oda / Shueisha / Toei Animation.</p>
            </footer>
            {/* Mobile Bottom Navigation (App-like feel) */}
            <div className="fixed bottom-0 left-0 w-full bg-slate-950/90 backdrop-blur-xl border-t border-white/10 md:hidden z-50 pb-safe">
                <div className="flex justify-around items-center h-16">
                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex flex-col items-center justify-center w-full h-full text-amber-500">
                    <TrendingUp className="w-6 h-6" />
                    <span className="text-[10px] font-bold mt-1">Home</span>
                </button>
                <a href="https://www.youtube.com/@OnepieceMasters/videos" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-white transition-colors">
                    <Play className="w-6 h-6" />
                    <span className="text-[10px] font-bold mt-1">Videos</span>
                </a>
                {/* Linked to 'common' id for Rarities section */}
                <button onClick={() => document.getElementById('common')?.scrollIntoView({ behavior: 'smooth' })} className="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-white transition-colors">
                    <Crown className="w-6 h-6" />
                    <span className="text-[10px] font-bold mt-1">Rarities</span>
                </button>
                <a href={channelUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-white transition-colors">
                    <Users className="w-6 h-6" />
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
