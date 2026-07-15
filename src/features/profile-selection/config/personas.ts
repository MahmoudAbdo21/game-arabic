export interface Persona {
  id: string;
  title: string;
  trait: string;
  imageSrc: string;
  imageAlt: string;
}

export const PERSONAS: Persona[] = [
  {
    id: 'profile-explorer',
    title: 'المستكشف الشجاع',
    trait: 'أحب اكتشاف الحروف والأصوات',
    imageSrc: '/images/profiles/profile_explorer.png',
    imageAlt: 'المستكشف الشجاع'
  },
  {
    id: 'profile-storyteller',
    title: 'راوية الحكايات',
    trait: 'أحب الكلمات والقصص الجميلة',
    imageSrc: '/images/profiles/profile_storyteller.png',
    imageAlt: 'راوية الحكايات'
  },
  {
    id: 'profile-listener',
    title: 'صديق الأصوات',
    trait: 'أستمع جيدًا وأميّز الأصوات',
    imageSrc: '/images/profiles/profile_listener.png',
    imageAlt: 'صديق الأصوات'
  },
  {
    id: 'profile-builder',
    title: 'بطلة الكلمات',
    trait: 'أبني الكلمات خطوة خطوة',
    imageSrc: '/images/profiles/profile_builder.png',
    imageAlt: 'بطلة الكلمات'
  }
];
