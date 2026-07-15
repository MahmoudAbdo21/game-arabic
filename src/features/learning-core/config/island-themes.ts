// Island-specific theme configuration
// Each island has its own visual identity, colors, stations, and hero treatment.

export interface IslandTheme {
  id: string;
  title: string;
  subtitle: string;
  invitation: string;
  heroImage: string;
  heroObjectPosition: string;
  primaryColor: string;
  backgroundColor: string;
  panelColor: string;
  worldEmoji: string;
}

export const ISLAND_THEMES: Record<string, IslandTheme> = {
  'island-1': {
    id: 'island-1',
    title: 'هَيَّا نَتَعَلَّمْ يَا جَدِّي',
    subtitle: 'الجزيرة الأولى',
    invitation: 'انطلق مع مريم ويوسف في رحلة داخل البيت والحديقة، واكتشف أصوات الحروف والكلمات.',
    heroImage: '/images/islands/island1_interior_hero.png',
    heroObjectPosition: 'center 40%',
    primaryColor: '#059669', // emerald-600
    backgroundColor: '#ecfdf5', // emerald-50
    panelColor: '#ffffff',
    worldEmoji: '🏡',
  },
  'island-2': {
    id: 'island-2',
    title: 'أَمِيرَة وَأُسْرَتُهَا السَّعِيدَة',
    subtitle: 'الجزيرة الثانية',
    invitation: 'ادخل مع أميرة إلى غرف المنزل الدافئ واكتشف أسرار العائلة السعيدة وحروفها.',
    heroImage: '/images/islands/island2_interior_hero.png',
    heroObjectPosition: 'center 50%',
    primaryColor: '#e11d48', // rose-600
    backgroundColor: '#fff1f2', // rose-50
    panelColor: '#ffffff',
    worldEmoji: '👨‍👩‍👧‍👦',
  },
  'island-3': {
    id: 'island-3',
    title: 'عَالَمُ الحَيَوَان',
    subtitle: 'الجزيرة الثالثة',
    invitation: 'انطلق في مغامرة عبر الغابة الخضراء واكتشف أصوات الحيوانات وحروفها السحرية.',
    heroImage: '/images/islands/island3_interior_hero.png',
    heroObjectPosition: 'center 35%',
    primaryColor: '#65a30d', // lime-600
    backgroundColor: '#f7fee7', // lime-50
    panelColor: '#ffffff',
    worldEmoji: '🦁',
  },
  'island-4': {
    id: 'island-4',
    title: 'يَوْمٌ فِي المَدْرَسَة',
    subtitle: 'الجزيرة الرابعة',
    invitation: 'ادخل المدرسة مع أصدقائك واكتشف مختبر الأصوات وفصل الفنون ومعمل الحروف.',
    heroImage: '/images/islands/island4_interior_hero.png',
    heroObjectPosition: 'center 45%',
    primaryColor: '#0284c7', // sky-600
    backgroundColor: '#f0f9ff', // sky-50
    panelColor: '#ffffff',
    worldEmoji: '🏫',
  },
};

export function getIslandTheme(islandId: string): IslandTheme {
  return ISLAND_THEMES[islandId] || ISLAND_THEMES['island-1'];
}
