import {
  FiBox, FiTruck, FiGift, FiPackage, FiClipboard, FiCreditCard, FiSlash,
  FiHeadphones, FiMail, FiShield, FiClock, FiHelpCircle, FiCheckCircle,
  FiRotateCcw, FiMapPin, FiHeart, FiGlobe, FiFeather, FiDroplet, FiAward,
  FiStar, FiUsers,
} from 'react-icons/fi';

// Curated icon set admins can attach to highlight cards (policy pages) and
// brand values (About page). Keyed by a stable string stored in the DB so
// swapping the underlying icon component later never breaks saved content.
export const PAGE_ICONS = {
  box: FiBox,
  truck: FiTruck,
  gift: FiGift,
  package: FiPackage,
  clipboard: FiClipboard,
  card: FiCreditCard,
  slash: FiSlash,
  headphones: FiHeadphones,
  mail: FiMail,
  shield: FiShield,
  clock: FiClock,
  help: FiHelpCircle,
  check: FiCheckCircle,
  rotate: FiRotateCcw,
  pin: FiMapPin,
  heart: FiHeart,
  globe: FiGlobe,
  feather: FiFeather,
  droplet: FiDroplet,
  award: FiAward,
  star: FiStar,
  users: FiUsers,
};

export const ICON_OPTIONS = [
  { value: 'box', label: 'Box' },
  { value: 'truck', label: 'Truck / Shipping' },
  { value: 'gift', label: 'Gift' },
  { value: 'package', label: 'Package' },
  { value: 'clipboard', label: 'Clipboard / Proof' },
  { value: 'card', label: 'Card / Refund' },
  { value: 'slash', label: 'Not Allowed' },
  { value: 'headphones', label: 'Support / Headset' },
  { value: 'mail', label: 'Mail' },
  { value: 'shield', label: 'Shield / Quality' },
  { value: 'clock', label: 'Clock / Time' },
  { value: 'help', label: 'Help' },
  { value: 'check', label: 'Check / Verified' },
  { value: 'rotate', label: 'Return / Refresh' },
  { value: 'pin', label: 'Location' },
  { value: 'heart', label: 'Heart / Passion' },
  { value: 'globe', label: 'Globe / Sustainability' },
  { value: 'feather', label: 'Feather / Authenticity' },
  { value: 'droplet', label: 'Droplet / Fragrance' },
  { value: 'award', label: 'Award / Premium' },
  { value: 'star', label: 'Star' },
  { value: 'users', label: 'Customers' },
];

export const getPageIcon = (key) => PAGE_ICONS[key] || FiHelpCircle;
