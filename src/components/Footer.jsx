import React from 'react';
import { TrendingUp, ShoppingBag, Crown, Users, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

const DiscordIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057 13.0646 13.0646 0 01-1.8719-.8925.0774.0774 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1971.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/>
    </svg>
);

const Footer = ({ channelUrl }) => {
    return (
        <>
            <footer className="relative pt-12 pb-16 border-t border-white/10 text-center space-y-6">
                <p className="text-slate-600 text-sm">© 2026 One Piece Masters. Unofficial Fan Site. <br/>One Piece is a trademark of Eiichiro Oda / Shueisha / Toei Animation.</p>
                <div className="flex justify-center items-center gap-8">
                  <a href="https://instagram.com/onepiece_masters" target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:text-orange-500 transition-all transform hover:scale-110 active:scale-95">
                    <Instagram className="w-6 h-6" />
                  </a>
                  <a href="https://discord.gg/onepiecemasters" target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:text-indigo-400 transition-all transform hover:scale-110 active:scale-95">
                    <DiscordIcon className="w-7 h-7" />
                  </a>
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
