// Unified Side-Profile Mascot Character Avatars (옆모습 개/말 캐릭터 통일)
// 1. 주현우 (CEO, 20세 남성) - 🐶 개 옆모습 (Puppy Side Profile Mascot) : 당차고 총명한 청년 CEO 강아지 옆모습, 블루 테마
// 2. 주용원 (CTO, 40세 남성) - 🐴 말 옆모습 (Tech Horse Side Profile Mascot) : 지적인 둥근 안경, 날렵하고 듬직한 테크 리더 말 옆모습, 스카이블루 테마
// 3. 이유진 (CFO, 40세 여성) - 🐴 말 옆모습 (Elegant Rose Horse Side Profile Mascot) : 우아한 로즈핑크 갈기, 별빛 핀, 단아하고 꼼꼼한 재무 리더 말 옆모습, 핑크 테마

export const AVATAR_SVG_HYUNWOO = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <clipPath id="clipHyunwoo">
      <circle cx="60" cy="60" r="56" />
    </clipPath>
    <linearGradient id="bgHyunwoo" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#EFF6FF" />
      <stop offset="100%" stop-color="#DBEAFE" />
    </linearGradient>
    <linearGradient id="dogFurSide" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FDE68A" />
      <stop offset="60%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>
    <linearGradient id="ceoSuitBlue" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2563EB" />
      <stop offset="100%" stop-color="#1D4ED8" />
    </linearGradient>
  </defs>

  <g clip-path="url(#clipHyunwoo)">
    <!-- Background -->
    <rect width="120" height="120" fill="url(#bgHyunwoo)" />

    <!-- CEO Suit & Shirt (Side Profile Torso) -->
    <path d="M18 120 C20 95 36 84 58 84 C76 84 96 95 102 120 Z" fill="url(#ceoSuitBlue)" stroke="#1E3A8A" stroke-width="2.5" />
    <!-- White Shirt Collar & Royal Tie -->
    <polygon points="56,84 66,84 61,102" fill="#FFFFFF" />
    <polygon points="58,88 64,88 62,110 60,110" fill="#3B82F6" stroke="#1D4ED8" stroke-width="1" />

    <!-- Dog Neck -->
    <path d="M38 84 C40 68 44 58 48 48 C56 52 64 64 66 84 Z" fill="url(#dogFurSide)" />

    <!-- Cute Droopy Dog Ear (개 귀 옆모습) -->
    <path d="M42 32 C34 26 22 35 22 50 C22 64 30 72 38 68 C44 65 46 52 44 40 Z" fill="#D97706" stroke="#92400E" stroke-width="2.5" />
    <path d="M30 45 C28 53 32 62 36 62 C40 62 42 54 40 44 Z" fill="#F59E0B" />

    <!-- Dog Head & Snout Silhouette Facing Right (개 옆모습 실루엣) -->
    <path d="M44 40 C42 30 54 26 64 32 C68 35 68 43 72 46 L86 52 C89 53 89 58 85 61 C80 64 74 62 70 60 C66 66 56 68 50 68 C44 68 40 58 40 48 Z" fill="url(#dogFurSide)" stroke="#92400E" stroke-width="2.5" stroke-linejoin="round" />

    <!-- White Snout Underside Patch -->
    <path d="M68 48 L84 53 C87 55 86 58 83 60 C76 62 71 60 68 56 Z" fill="#FFFFFF" opacity="0.95" />

    <!-- Shiny Black Puppy Button Nose Tip (주둥이 앞 코) -->
    <ellipse cx="86" cy="52.5" rx="4.5" ry="3.5" fill="#1E293B" />
    <circle cx="84.5" cy="51" r="1.3" fill="#FFFFFF" />

    <!-- Gentle Friendly Smile Under Snout -->
    <path d="M83 58 Q77 60 72 58" fill="none" stroke="#92400E" stroke-width="1.8" stroke-linecap="round" />

    <!-- Big Sparkling Puppy Eye (Side View) -->
    <ellipse cx="60" cy="44" rx="5" ry="6.2" fill="#1F2937" />
    <circle cx="58.5" cy="42" r="2.2" fill="#FFFFFF" />
    <circle cx="61.5" cy="46" r="1.2" fill="#FFFFFF" />
    <!-- Cute Eyebrow -->
    <path d="M55 35 Q60 33 65 36" fill="none" stroke="#92400E" stroke-width="2.2" stroke-linecap="round" />

    <!-- Soft Rosy Cheek -->
    <circle cx="66" cy="54" r="4.5" fill="#F87171" opacity="0.4" />
  </g>
  <!-- Outer border circle -->
  <circle cx="60" cy="60" r="56" fill="none" stroke="#3B82F6" stroke-width="4" />
</svg>
`.trim();

export const AVATAR_SVG_YONGWON = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <clipPath id="clipYongwon">
      <circle cx="60" cy="60" r="56" />
    </clipPath>
    <linearGradient id="bgYongwon" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F0F9FF" />
      <stop offset="100%" stop-color="#E0F2FE" />
    </linearGradient>
    <linearGradient id="horseFurTechSide" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#7DD3FC" />
      <stop offset="60%" stop-color="#38BDF8" />
      <stop offset="100%" stop-color="#0284C7" />
    </linearGradient>
    <linearGradient id="horseManeTechSide" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0369A1" />
      <stop offset="100%" stop-color="#0C4A6E" />
    </linearGradient>
  </defs>

  <g clip-path="url(#clipYongwon)">
    <!-- Background -->
    <rect width="120" height="120" fill="url(#bgYongwon)" />

    <!-- Tech Navy Suit Torso (Side Profile) -->
    <path d="M18 120 C20 95 36 84 58 84 C76 84 96 95 102 120 Z" fill="#0369A1" stroke="#075985" stroke-width="2.5" />
    <!-- White Shirt Collar & Cyan Tie -->
    <polygon points="56,84 66,84 61,102" fill="#FFFFFF" />
    <polygon points="58,88 64,88 62,110 60,110" fill="#0284C7" />

    <!-- Arched Equine Neck (말의 듬직한 목선) -->
    <path d="M28 120 C34 85 40 65 46 32 C58 40 68 62 70 85 Z" fill="url(#horseFurTechSide)" />

    <!-- Tech Swept-Back Mane along Crest (멋진 테크 갈기 옆모습) -->
    <path d="M46 28 C40 18 32 30 30 42 C26 34 22 50 20 64 C16 56 14 74 12 88 C22 84 32 80 36 78 Z" fill="url(#horseManeTechSide)" stroke="#075985" stroke-width="2" />
    <path d="M48 24 Q55 20 54 28 Q49 32 46 28 Z" fill="url(#horseManeTechSide)" />

    <!-- Horse Alert Pricked Ears (쫑긋 세운 말 귀 옆모습) -->
    <polygon points="38,32 34,14 44,28" fill="#0284C7" stroke="#075985" stroke-width="2" stroke-linejoin="round" />
    <polygon points="46,30 40,8 54,24" fill="#38BDF8" stroke="#075985" stroke-width="2.5" stroke-linejoin="round" />
    <polygon points="45,26 42,14 49,24" fill="#BAE6FD" />

    <!-- Equine Head Silhouette Facing Right (말 머리 옆모습) -->
    <path d="M46 28 C56 34 70 46 88 56 C92 58 92 64 88 66 C82 68 76 66 66 68 C54 70 48 58 46 48 Z" fill="url(#horseFurTechSide)" stroke="#075985" stroke-width="2.5" stroke-linejoin="round" />

    <!-- Muzzle Highlight Patch (부드러운 주둥이) -->
    <path d="M76 49 L89 57 C92 61 89 65 85 66 C79 66 74 60 72 54 Z" fill="#E0F2FE" />

    <!-- Single Cute Equine Nostril Curve (옆모습 콧구멍 곡선 - 작은 얼굴처럼 보이지 않는 단일 곡선!) -->
    <path d="M85 58 Q87 59 86 62" fill="none" stroke="#075985" stroke-width="2" stroke-linecap="round" />

    <!-- Gentle Friendly Smile Line -->
    <path d="M86 63 Q80 65 75 62" fill="none" stroke="#075985" stroke-width="2" stroke-linecap="round" />

    <!-- CTO Signature Round Glasses (측면 둥근 안경) -->
    <ellipse cx="62" cy="46" rx="9" ry="9.5" fill="#FFFFFF" fill-opacity="0.25" stroke="#0F172A" stroke-width="3" />
    <line x1="53" y1="46" x2="40" y2="40" stroke="#0F172A" stroke-width="2.8" stroke-linecap="round" />
    <line x1="71" y1="48" x2="76" y2="51" stroke="#0F172A" stroke-width="2.8" stroke-linecap="round" />

    <!-- Wise Smart Eye behind Glasses (Side View) -->
    <ellipse cx="62" cy="46" rx="4.5" ry="5.5" fill="#0F172A" />
    <circle cx="60.5" cy="44" r="1.8" fill="#FFFFFF" />
    <circle cx="63.5" cy="48" r="0.9" fill="#FFFFFF" />

    <!-- Soft Cheek Blush -->
    <circle cx="68" cy="58" r="4.5" fill="#38BDF8" opacity="0.6" />
  </g>
  <!-- Outer border circle -->
  <circle cx="60" cy="60" r="56" fill="none" stroke="#0EA5E9" stroke-width="4" />
</svg>
`.trim();

export const AVATAR_SVG_YUJIN = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <clipPath id="clipYujin">
      <circle cx="60" cy="60" r="56" />
    </clipPath>
    <linearGradient id="bgYujin" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFF1F2" />
      <stop offset="100%" stop-color="#FFE4E6" />
    </linearGradient>
    <linearGradient id="horseFurEleganceSide" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="60%" stop-color="#FFF1F2" />
      <stop offset="100%" stop-color="#FECDD3" />
    </linearGradient>
    <linearGradient id="horseManeEleganceSide" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FB7185" />
      <stop offset="100%" stop-color="#E11D48" />
    </linearGradient>
    <linearGradient id="cfoBlouseRose" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F43F5E" />
      <stop offset="100%" stop-color="#BE123C" />
    </linearGradient>
  </defs>

  <g clip-path="url(#clipYujin)">
    <!-- Background -->
    <rect width="120" height="120" fill="url(#bgYujin)" />

    <!-- Elegant CFO Rose Blazer Torso (Side Profile) -->
    <path d="M18 120 C20 95 36 84 58 84 C76 84 96 95 102 120 Z" fill="url(#cfoBlouseRose)" stroke="#9F1239" stroke-width="2.5" />
    <!-- Pearl Necklace at Neckline -->
    <path d="M46 88 Q60 94 74 88" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
    <circle cx="60" cy="93" r="3" fill="#FFFFFF" stroke="#E11D48" stroke-width="1" />

    <!-- Graceful Arched Equine Neck (우아한 말 목선) -->
    <path d="M28 120 C34 85 40 65 46 32 C58 40 68 62 70 85 Z" fill="url(#horseFurEleganceSide)" />

    <!-- Flowing Wavy Rose Mane (우아한 로즈핑크 갈기 머리) -->
    <path d="M46 26 C40 18 30 26 28 38 C22 30 16 44 14 58 C10 50 8 68 10 84 C18 80 28 76 34 72 Z" fill="url(#horseManeEleganceSide)" stroke="#9F1239" stroke-width="2" />
    <path d="M48 24 C56 18 58 28 54 34 C50 34 46 28 48 24 Z" fill="url(#horseManeEleganceSide)" />

    <!-- Golden Star Hairpin (단아한 별빛 헤어핀) -->
    <path d="M50 28 L51.5 31.5 L55 31.5 L52.2 33.5 L53.5 37 L50 35 L46.5 37 L47.8 33.5 L45 31.5 L48.5 31.5 Z" fill="#F59E0B" stroke="#B45309" stroke-width="1" />

    <!-- Horse Alert Pricked Ears (우아한 말 귀) -->
    <polygon points="38,32 34,14 44,28" fill="#FFE4E6" stroke="#E11D48" stroke-width="2" stroke-linejoin="round" />
    <polygon points="46,30 40,8 54,24" fill="#FFF1F2" stroke="#E11D48" stroke-width="2.5" stroke-linejoin="round" />
    <polygon points="45,26 42,14 49,24" fill="#FECDD3" />

    <!-- Equine Head Silhouette Facing Right (말 머리 옆모습) -->
    <path d="M46 28 C56 34 70 46 88 56 C92 58 92 64 88 66 C82 68 76 66 66 68 C54 70 48 58 46 48 Z" fill="url(#horseFurEleganceSide)" stroke="#E11D48" stroke-width="2.5" stroke-linejoin="round" />

    <!-- Soft Muzzle Highlight -->
    <path d="M76 49 L89 57 C92 61 89 65 85 66 C79 66 74 60 72 54 Z" fill="#FFFFFF" />

    <!-- Single Cute Equine Nostril Curve (옆모습 콧구멍 곡선 - 단일 곡선) -->
    <path d="M85 58 Q87 59 86 62" fill="none" stroke="#E11D48" stroke-width="2" stroke-linecap="round" />

    <!-- Sweet Gentle Smile Line -->
    <path d="M86 63 Q80 65 75 62" fill="none" stroke="#E11D48" stroke-width="2" stroke-linecap="round" />

    <!-- Sparkling Kind Eye with Eyelashes (Side View) -->
    <ellipse cx="64" cy="46" rx="5" ry="6.2" fill="#881337" />
    <circle cx="62.5" cy="44" r="2.2" fill="#FFFFFF" />
    <circle cx="65.5" cy="48" r="1.1" fill="#FFFFFF" />
    <!-- Pretty Eyelashes -->
    <path d="M66 41 Q70 37 72 39" fill="none" stroke="#881337" stroke-width="2" stroke-linecap="round" />
    <path d="M68 43 Q72 41 74 43" fill="none" stroke="#881337" stroke-width="1.8" stroke-linecap="round" />

    <!-- Soft Rosy Blush -->
    <circle cx="70" cy="56" r="5" fill="#FB7185" opacity="0.45" />
  </g>
  <!-- Outer border circle -->
  <circle cx="60" cy="60" r="56" fill="none" stroke="#F43F5E" stroke-width="4" />
</svg>
`.trim();

// Convert SVG to data URI for use in <img> tags
export const getAvatarDataUri = (svgString: string): string => {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
};

export const HYUNWOO_AVATAR_URI = getAvatarDataUri(AVATAR_SVG_HYUNWOO);
export const YONGWON_AVATAR_URI = getAvatarDataUri(AVATAR_SVG_YONGWON);
export const YUJIN_AVATAR_URI = getAvatarDataUri(AVATAR_SVG_YUJIN);

export const AVATAR_DATA_URI_HYUNWOO = HYUNWOO_AVATAR_URI;
export const AVATAR_DATA_URI_YONGWON = YONGWON_AVATAR_URI;
export const AVATAR_DATA_URI_YUJIN = YUJIN_AVATAR_URI;
