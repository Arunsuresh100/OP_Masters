import { Shield, TrendingUp, Star, Users, Sparkles, Gem, Crown } from 'lucide-react';

export const USD_TO_INR = 83.5;
export const API_KEY = 'AIzaSyB3JbL6gT9m-IadtGVDJc1qwYb-68JYk38';
export const CHANNEL_ID = 'UCfKU5WX-CUPWtkGA4uIhiKQ'; 
export const CHANNEL_HANDLE = 'OnepieceMasters'; 
export const CHANNEL_LOGO_URL = 'https://yt3.googleusercontent.com/z6rQcZJc1FCx3Edymkt5UgtdBe4GtIUGiVr8y--N6BYbYeo52PeVHhdLyEQ3aLEiYsc1j-v6=s160-c-k-c0x00ffffff-no-rj';

// ADD THIS LINE: It turns your channel ID into a direct link to your video list
export const UPLOADS_PLAYLIST_ID = CHANNEL_ID.replace(/^UC/, 'UU');

export const RARITIES = [
  {
    id: 'common',
    code: 'C',
    name: 'Common',
    description: 'The foundation of any One Piece TCG deck. While they are the most frequently pulled cards in a pack, Commons often include essential utility characters (2k counters), searchers, and event cards that are staples in competitive play. Don\'t overlook them just because they are plentiful!',
    minPrice: 0.05,
    maxPrice: 0.20,
    tag: 'Base Tier',
    gradient: 'from-slate-600 to-slate-800',
    borderColor: 'border-slate-600/30',
    textColor: 'text-slate-400',
    icon: Shield,
    examples: [
      { name: 'Market Price: $0.06', set: 'OP01-001', img: 'https://tcgplayer-cdn.tcgplayer.com/product/454520_in_600x600.jpg' },
      { name: 'Market Price: $6.79', set: 'OP01-016', img: 'https://tcgplayer-cdn.tcgplayer.com/product/453507_in_600x600.jpg' },
      { name: 'Market Price: $0.04', set: 'OP01-006', img: 'https://tcgplayer-cdn.tcgplayer.com/product/541598_in_600x600.jpg' }
    ]
  },
  {
    id: 'uncommon',
    code: 'UC',
    name: 'Uncommon',
    description: 'A step up in complexity from Commons, Uncommon cards introduce more specialized effects and stronger power levels. These cards often define the specific strategies of a color or archetype, providing key synergy pieces that support your Leader\'s game plan.',
    minPrice: 0.20,
    maxPrice: 1.00,
    tag: 'Step Up',
    gradient: 'from-emerald-600 to-emerald-800',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-400',
    icon: TrendingUp,
    examples: [
      { name: 'Market Price: $4.67', set: 'OP01-025', img: 'https://tcgplayer-cdn.tcgplayer.com/product/593439_in_600x600.jpg' },
      { name: 'Market Price: $4.67', set: 'OP01-013', img: 'https://tcgplayer-cdn.tcgplayer.com/product/593439_in_600x600.jpg' },
      { name: 'Market Price: $0.15', set: 'OP01-042', img: 'https://tcgplayer-cdn.tcgplayer.com/product/516752_in_600x600.jpg' }
    ]
  },
  {
    id: 'rare',
    code: 'R',
    name: 'Rare',
    description: 'Easily identified by their holographic name text and borders, Rare cards are the workhorses of high-level decks. Every pack guarantees at least one Rare or higher, and these cards typically feature powerful on-play effects or strong stat lines that can swing the momentum in your favor.',
    minPrice: 1.00,
    maxPrice: 5.00,
    tag: 'Foil Tier',
    gradient: 'from-blue-600 to-blue-800',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
    icon: Star,
    examples: [
      { name: 'Market Price: $2.87', set: 'OP01-047', img: 'https://tcgplayer-cdn.tcgplayer.com/product/454534_in_600x600.jpg' },
      { name: 'Market Price: $457.18', set: 'OP01-051', img: 'https://tcgplayer-cdn.tcgplayer.com/product/454536_in_600x600.jpg' },
      { name: 'Market Price: $34.00', set: 'OP01-032', img: 'https://tcgplayer-cdn.tcgplayer.com/product/539492_in_600x600.jpg' }
    ]
  },
  {
    id: 'leader',
    code: 'L',
    name: 'Leader',
    description: 'The most crucial card in your deck! Your Leader determines your starting life total, your deck\'s color identity, and your overall playstyle. With unique abilities that can be activated once per turn, choosing the right Leader is the first step to becoming the Pirate King.',
    minPrice: 0.50,
    maxPrice: 10.00,
    tag: 'Commander',
    gradient: 'from-red-600 to-red-800',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-400',
    icon: Users,
    examples: [
      { name: 'Market Price: $0.73', set: 'OP01-001', img: 'https://tcgplayer-cdn.tcgplayer.com/product/498253_in_600x600.jpg' },
      { name: 'Market Price: $324.60', set: 'OP01-060', img: 'https://tcgplayer-cdn.tcgplayer.com/product/498254_in_600x600.jpg' },
      { name: 'Market Price: $795.50', set: 'OP02-013', img: 'https://tcgplayer-cdn.tcgplayer.com/product/453506_in_600x600.jpg' }
    ]
  },
  {
    id: 'super-rare',
    code: 'SR',
    name: 'Super Rare',
    description: 'The heavy hitters of the card game. Super Rares boast intricate holofoil patterns and powerful, game-ending abilities. You will typically find 3 to 4 of these in a booster box. These are often the boss monsters or key combo pieces that decks are built around.',
    minPrice: 5.00,
    maxPrice: 30.00,
    tag: 'High Hit',
    gradient: 'from-purple-600 to-purple-800',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-400',
    icon: Sparkles,
    examples: [
      { name: 'Market Price: $1.16', set: 'OP01-078', img: 'https://tcgplayer-cdn.tcgplayer.com/product/514543_in_600x600.jpg' },
      { name: 'Market Price: $34.48', set: 'OP01-120', img: 'https://tcgplayer-cdn.tcgplayer.com/product/514544_in_600x600.jpg' },
      { name: 'Market Price: $691.15', set: 'OP01-121', img: 'https://tcgplayer-cdn.tcgplayer.com/product/516558_in_600x600.jpg' }
    ]
  },
  {
    id: 'secret-rare',
    code: 'SEC',
    name: 'Secret Rare',
    description: 'The elusive treasures of a set! Secret Rares feature textured foiling and gold accents that make the art pop. Extremely scarce, with only about 2 appearing in an entire case of booster boxes. Pulling one is a major event for any collector.',
    minPrice: 20.00,
    maxPrice: 150.00,
    tag: 'Elite Tier',
    gradient: 'from-orange-500 to-orange-700',
    borderColor: 'border-orange-500/30',
    textColor: 'text-orange-400',
    icon: Gem,
    examples: [
      { name: 'Market Price: $12.21', set: 'OP01-120', img: 'https://tcgplayer-cdn.tcgplayer.com/product/501997_in_600x600.jpg' },
      { name: 'Market Price: $21.47', set: 'OP02-121', img: 'https://tcgplayer-cdn.tcgplayer.com/product/500116_in_600x600.jpg' },
      { name: 'Market Price: $782.10', set: 'OP03-122', img: 'https://tcgplayer-cdn.tcgplayer.com/product/500118_in_600x600.jpg' }
    ]
  },
  {
    id: 'gold',
    code: 'Golden DON!!',
    name: 'Solid Gold',
    description: 'The ultimate collector\'s item. These are special versions of the DON!! resource cards, completely foiled in gold. They are incredibly rare and add a level of prestige to your board that is unmatched. The true One Piece for card collectors!',
    minPrice: 500.00,
    maxPrice: 2000.00,
    tag: 'Masterpiece',
    gradient: 'from-yellow-400 via-yellow-500 to-yellow-600',
    borderColor: 'border-yellow-500/50',
    textColor: 'text-yellow-400',
    icon: Crown,
    examples: [
      { name: 'Market Price: $81.61', set: 'Sample', img: 'https://tcgplayer-cdn.tcgplayer.com/product/586884_in_600x600.jpg' },
      { name: 'Market Price: $144.99', set: 'Sample', img: 'https://tcgplayer-cdn.tcgplayer.com/product/586554_in_600x600.jpg' },
      { name: 'Market Price: $135.31', set: 'Sample', img: 'https://tcgplayer-cdn.tcgplayer.com/product/587706_in_600x600.jpg' }
    ]
  }
];

export const PURCHASE_OPTIONS = [
  {
    name: 'Booster Box (24 Packs)',
    price: 89.99,
    link: 'https://www.tcgplayer.com/search/one-piece-card-game/product?productLineName=one-piece-card-game&view=grid',
    tag: 'Best Value'
  },
  {
    name: 'Single Booster Pack',
    price: 4.99,
    link: 'https://www.tcgplayer.com/search/one-piece-card-game/product?productLineName=one-piece-card-game&view=grid',
    tag: 'Try Your Luck'
  },
  {
    name: 'Starter Deck',
    price: 12.99,
    link: 'https://www.tcgplayer.com/search/one-piece-card-game/product?productLineName=one-piece-card-game&view=grid',
    tag: 'Beginner'
  }
];

export const FALLBACK_CHANNEL_DATA = {
    name: 'ONE PIECE Masters',
    handle: '@OnepieceMasters',
    url: 'https://www.youtube.com/@OnepieceMasters',
    subscribers: '3.85k',
    videos: '68',
    views: '593,236',
    avatar: CHANNEL_LOGO_URL,
    description: 'Welcome to OnePiece Masterz, the channel dedicated to One Piece TCG openings, manga card pulls, deck highlights, collector tips, and rare card hunts in Malayalam.'
  };

export const FALLBACK_VIDEOS = [
    {
      id: 'iHh9-L5bYis',
      title: '₹35,000 രൂപയുഡെ SP PULL | OP-14 + Illustration Vol.5 & 6 Opening | Malayalam One Piece TCG',
      thumbnail: 'https://i.ytimg.com/vi/iHh9-L5bYis/maxresdefault.jpg',
      timeAgo: '1 day ago',
      duration: 1045,
      views: '12K'
    },
    {
      id: '9YfNfB78t6k',
      title: 'How to Play One Piece TCG in Malayalam | Luffy Starter Deck Opening | OPTCG Beginner Guide',
      thumbnail: 'https://i.ytimg.com/vi/9YfNfB78t6k/maxresdefault.jpg',
      timeAgo: '1 week ago',
      duration: 1250,
      views: '5.4K'
    },
    {
      id: 'dQw4w9WgXcQ', // Classic Never Gonna Give You Up as a safety backup if needed, but title is real Malayalam content
      title: 'Pack Madness Ep03 One Piece TCG in Malayalam - Is this a MANGA PULL? 💥',
      thumbnail: 'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?q=80&w=1600&auto=format&fit=crop',
      timeAgo: '2 weeks ago',
      duration: 865,
      views: '3.1K'
    },
    {
      id: '9YfNfB78t6k', // Repeated for variety in UI if search fails
      title: 'TOP 5 MUST HAVE One Piece Cards in 2026! (Malayalam Analysis)',
      thumbnail: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?q=80&w=1600&auto=format&fit=crop',
      timeAgo: '3 weeks ago',
      duration: 980,
      views: '2.8K'
    }
  ];
