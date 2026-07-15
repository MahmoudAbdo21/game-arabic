export interface Island {
  id: string;
  title: string;
  sequence: number;
  imageSrc: string;
  imageAlt: string;
  state: 'UNLOCKED' | 'LOCKED';
}

export const ISLANDS: Island[] = [
  {
    id: 'island-1',
    title: 'هيا نتعلم يا جدي',
    sequence: 1,
    imageSrc: '/images/islands/island_grandpa-transparent.png',
    imageAlt: 'جزيرة هيا نتعلم يا جدي',
    state: 'UNLOCKED'
  },
  {
    id: 'island-2',
    title: 'أَمِيرَة وأسرتها السعيدة',
    sequence: 2,
    imageSrc: '/images/islands/island_family-transparent.png',
    imageAlt: 'جزيرة أَمِيرَة وأسرتها السعيدة',
    state: 'UNLOCKED'
  },
  {
    id: 'island-3',
    title: 'عالم الحيوان',
    sequence: 3,
    imageSrc: '/images/islands/island_nature-transparent.png',
    imageAlt: 'جزيرة عالم الحيوان',
    state: 'UNLOCKED'
  },
  {
    id: 'island-4',
    title: 'يوم في المدرسة',
    sequence: 4,
    imageSrc: '/images/islands/island_school-transparent.png',
    imageAlt: 'جزيرة يوم في المدرسة',
    state: 'UNLOCKED'
  }
];
