import { Shield, TrendingUp, Star, Users, Sparkles, Gem, Crown } from 'lucide-react';

export const USD_TO_INR = 83.5;
export const API_KEY = ''; // Moved to Backend for Security
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
    description: 'The backbone of every deck. While plentiful, C-rarities contain essential utility cards and 2k counters.',
    minPrice: 0.01,
    maxPrice: 0.50,
    tag: 'Base',
    gradient: 'from-slate-600 to-slate-800',
    borderColor: 'border-slate-500/30',
    textColor: 'text-slate-400',
    icon: Shield,
    examples: [
      { name: 'Nami', set: 'OP01-016', img: 'https://tcgplayer-cdn.tcgplayer.com/product/453507_in_600x600.jpg' },
      { name: 'Otama', set: 'OP01-006', img: 'https://tcgplayer-cdn.tcgplayer.com/product/541598_in_600x600.jpg' }
    ]
  },
  {
    id: 'uncommon',
    code: 'UC',
    name: 'Uncommon',
    description: 'Stronger synergy components that often define specific color archetypes.',
    minPrice: 0.20,
    maxPrice: 2.00,
    tag: 'Step Up',
    gradient: 'from-emerald-600 to-emerald-800',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-400',
    icon: TrendingUp,
    examples: []
  },
  {
    id: 'rare',
    code: 'R',
    name: 'Rare',
    description: 'Guaranteed holographic text/borders. High-utility cards for competitive strategies.',
    minPrice: 1.00,
    maxPrice: 10.00,
    tag: 'Foil',
    gradient: 'from-blue-600 to-blue-800',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
    icon: Star,
    examples: []
  },
  {
    id: 'leader',
    code: 'L',
    name: 'Leader',
    description: 'The commander of your deck. Choice of Leader defines your entire game strategy.',
    minPrice: 0.50,
    maxPrice: 50.00,
    tag: 'Commander',
    gradient: 'from-red-600 to-red-800',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-400',
    icon: Users,
    examples: []
  },
  {
    id: 'super-rare',
    code: 'SR',
    name: 'Super Rare',
    description: 'Boss monsters with intricate foil patterns. Only 3-4 per booster box.',
    minPrice: 5.00,
    maxPrice: 80.00,
    tag: 'Hit',
    gradient: 'from-purple-600 to-purple-800',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-400',
    icon: Sparkles,
    examples: []
  },
  {
    id: 'secret-rare',
    code: 'SEC',
    name: 'Secret Rare',
    description: 'Elite treasures featuring gold accents and textured foiling. Highly elusive.',
    minPrice: 20.00,
    maxPrice: 300.00,
    tag: 'Elite',
    gradient: 'from-orange-500 to-orange-700',
    borderColor: 'border-orange-500/30',
    textColor: 'text-orange-400',
    icon: Gem,
    examples: []
  },
  {
    id: 'special-rare',
    code: 'SP',
    name: 'Special Rare',
    description: 'Alternative art versions of popular cards with unique framing and textures.',
    minPrice: 50.00,
    maxPrice: 500.00,
    tag: 'Alternate',
    gradient: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-500/30',
    textColor: 'text-cyan-400',
    icon: Sparkles,
    examples: []
  },
  {
    id: 'treasure-rare',
    code: 'TR',
    name: 'Treasure Rare',
    description: 'Special reprints with treasure-map inspired designs and premium foiling.',
    minPrice: 30.00,
    maxPrice: 200.00,
    tag: 'Treasure',
    gradient: 'from-rose-500 to-pink-600',
    borderColor: 'border-rose-500/30',
    textColor: 'text-rose-400',
    icon: Gem,
    examples: []
  },
  {
    id: 'manga',
    code: 'Manga',
    name: 'Manga Rare',
    description: 'The ultimate chase. Features original Eiichiro Oda manga artwork. The holy grail of One Piece TCG.',
    minPrice: 500.00,
    maxPrice: 5000.00,
    tag: 'Ultimate',
    gradient: 'from-yellow-400 via-amber-500 to-yellow-600',
    borderColor: 'border-amber-500/50',
    textColor: 'text-amber-400',
    icon: Crown,
    examples: [
      { name: 'Sogeking (Manga)', set: 'OP03-122', img: 'https://tcgplayer-cdn.tcgplayer.com/product/500118_in_600x600.jpg' },
      { name: 'Portgas.D.Ace (Manga)', set: 'OP02-120', img: 'https://tcgplayer-cdn.tcgplayer.com/product/484918_in_600x600.jpg' }
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
    name: 'OP MASTER',
    handle: '@OnepieceMasters',
    url: 'https://www.youtube.com/@OnepieceMasters',
    subscribers: 3850,
    videos: 68,
    views: 593236,
    avatar: CHANNEL_LOGO_URL,
    description: 'Welcome to OnePiece Masterz, the channel dedicated to One Piece TCG openings, manga card pulls, deck highlights, collector tips, and rare card hunts in Malayalam.'
  };

export const FALLBACK_VIDEOS = [
    {
      id: 'xtq17a5VYd8',
      title: 'BIGGEST Giveaway Yet | Illustration Box Vol 5 & 6 Opening | One Piece TCG Malayalam',
      thumbnail: 'https://i.ytimg.com/vi/xtq17a5VYd8/maxresdefault.jpg',
      timeAgo: '1 day ago',
      duration: '15:23',
      views: '1.5K'
    },
    {
      id: 'ciD4ox542Yo',
      title: 'Can I Pull a Manga?! | One Piece TCG Box Opening | Malayalam',
      thumbnail: 'https://i.ytimg.com/vi/ciD4ox542Yo/maxresdefault.jpg',
      timeAgo: '1 month ago',
      duration: '22:50',
      views: '3.4K'
    },
    {
      id: 'SbC23PVCKFE',
      title: 'One Piece TCG Malayalam | 10 Packs Opening | Any Manga?',
      thumbnail: 'https://i.ytimg.com/vi/SbC23PVCKFE/maxresdefault.jpg',
      timeAgo: '2 months ago',
      duration: '12:45',
      views: '2.8K'
    },
    {
      id: 'jKXI6DL6Dyk',
      title: 'Pack Madness Ep.01 | One Piece TCG Malayalam | CRAZY HITS!',
      thumbnail: 'https://i.ytimg.com/vi/jKXI6DL6Dyk/maxresdefault.jpg',
      timeAgo: '3 months ago',
      duration: '14:20',
      views: '3.1K'
    }
  ];
