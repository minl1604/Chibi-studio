import { StyleOption, QuickFilter, BackgroundOption, ColorPalette } from './types';

export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const STYLES: StyleOption[] = [
  {
    id: 'classic',
    label: 'Chibi Classic',
    description: 'Đầu to, thân nhỏ, màu pastel nhẹ nhàng.',
    promptAddon: 'Style: Classic Chibi. Big head, small body, soft pastel colors, cute, clean lines, simple shading.',
    color: 'bg-blue-100 border-blue-300',
    darkColor: 'dark:bg-blue-900/30 dark:border-blue-700',
  },
  {
    id: 'anime',
    label: 'Chibi Anime',
    description: 'Nét vẽ sắc sảo, màu sắc rực rỡ.',
    promptAddon: 'Style: Anime Chibi. Sharp anime line art, vibrant colors, expressive eyes, dynamic shading.',
    color: 'bg-purple-100 border-purple-300',
    darkColor: 'dark:bg-purple-900/30 dark:border-purple-700',
  },
  {
    id: 'tet',
    label: 'Chibi Tết',
    description: 'Không khí Tết, áo dài, hoa mai, hoa đào.',
    promptAddon: 'Style: Vietnamese New Year (Tet) theme. Festive atmosphere. Background elements: apricot blossoms (hoa mai), peach blossoms (hoa đào), lanterns, red envelopes. Clothing: Ao dai or traditional festive attire. Colors: Warm red, gold, yellow.',
    color: 'bg-red-100 border-red-300',
    darkColor: 'dark:bg-red-900/30 dark:border-red-700',
  },
  {
    id: 'pastel',
    label: 'Chibi Pastel',
    description: 'Tone hồng tím mộng mơ, siêu dễ thương.',
    promptAddon: 'Style: Pastel Dreamy Chibi. Pink, purple, and mint pastel tones. Very cute, soft, dreamy atmosphere, kawaii aesthetic.',
    color: 'bg-pink-100 border-pink-300',
    darkColor: 'dark:bg-pink-900/30 dark:border-pink-700',
  },
];

export const BACKGROUND_OPTIONS: { id: BackgroundOption; label: string; icon: string; prompt: string }[] = [
  { id: 'original', label: 'Gốc', icon: '🖼️', prompt: 'Keep the background from the original image, but render it in the chosen chibi style. Do not change the location.' },
  { id: 'simple', label: 'Đơn giản', icon: '⬜', prompt: 'Background: Simple solid white or soft gradient background. Minimalist.' },
  { id: 'room', label: 'Phòng Cute', icon: '🧸', prompt: 'Background: A cozy, cute bedroom with pastel furniture, plushies, and soft lighting.' },
  { id: 'nature', label: 'Thiên nhiên', icon: '🌿', prompt: 'Background: Beautiful nature scene, green grass, blue sky, flowers, sunlight.' },
  { id: 'fantasy', label: 'Phép thuật', icon: '✨', prompt: 'Background: Magical fantasy world, glowing particles, floating islands, dreamy atmosphere.' },
  { id: 'galaxy', label: 'Vũ trụ', icon: '🌌', prompt: 'Background: Galaxy, stars, nebula, deep space, shiny and magical.' },
];

export const COLOR_PALETTES: ColorPalette[] = [
  { id: 'default', label: 'Tự nhiên', hex: '#e2e8f0', prompt: '' },
  { id: 'pink', label: 'Hồng Pastel', hex: '#f9a8d4', prompt: 'Dominant colors: Soft Pink, White, Pastel tones. Girly and cute vibe.' },
  { id: 'mint', label: 'Xanh Mint', hex: '#6ee7b7', prompt: 'Dominant colors: Mint Green, White, Fresh and airy vibe.' },
  { id: 'galaxy', label: 'Galaxy', hex: '#6366f1', prompt: 'Dominant colors: Deep Purple, Blue, Gold, Sparkling aesthetic.' },
  { id: 'anime_black', label: 'Dark Anime', hex: '#334155', prompt: 'Dominant colors: Black, Dark Grey, Red accents, Cool and edgy vibe.' },
  { id: 'sakura', label: 'Sakura', hex: '#fca5a5', prompt: 'Dominant colors: Cherry Blossom Pink, Soft White, Spring colors.' },
];

export const QUICK_FILTERS: QuickFilter[] = [
  { id: 'big_eyes', label: 'Mắt to lấp lánh', prompt: 'Make the eyes bigger, sparklier, and more expressive.' },
  { id: 'blush', label: 'Má hồng', prompt: 'Add cute pink blush on cheeks.' },
  { id: 'glasses', label: 'Thêm kính', prompt: 'Wear cute round glasses.' },
  { id: 'smile', label: 'Cười tươi', prompt: 'Big happy smile.' },
  { id: 'cat_ears', label: 'Tai mèo', prompt: 'Add cute fluffy cat ears.' },
];

export const LOADING_MESSAGES = [
  "Đang pha màu pastel... 🎨",
  "Đang gọi các nghệ sĩ Chibi... 📞",
  "Thêm chút phép thuật... ✨",
  "Đang chỉnh sửa lại tóc tai... 💇‍♀️",
  "Gần xong rồi nè... 🚀",
  "Đang vẽ mắt long lanh... 👀",
  "Đang tô nền lung linh... 🌈"
];