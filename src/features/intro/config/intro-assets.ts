export interface ImageAsset {
  fileName: string;
  path: string;
  description: string;
  alt: string;
}

export interface ImageAssets {
  intro: {
    alazhar_minarets_faculty: ImageAsset;
    magical_research_book: ImageAsset;
    golden_honor_board: ImageAsset;
    welcome_magic_gate: ImageAsset;
    skills_floating_island: ImageAsset;
    flying_adventure_train: ImageAsset;
  };
}

export const imageAssets: ImageAssets = {
  intro: {
    alazhar_minarets_faculty: {
      fileName: "alazhar_minarets_faculty.png",
      path: "/images/intro/alazhar_minarets_faculty.png",
      description: "مآذن الأزهر وكلية التربية، مشهد افتتاحي للشاشة الأولى.",
      alt: "مآذن الأزهر وكلية التربية"
    },
    magical_research_book: {
      fileName: "magical_research_book.png",
      path: "/images/intro/magical_research_book.png",
      description: "كتاب الباحث السحري، مشهد الشاشة الثانية.",
      alt: "كتاب الباحث السحري"
    },
    golden_honor_board: {
      fileName: "golden_honor_board.png",
      path: "/images/intro/golden_honor_board.png",
      description: "لوحة الإشراف الأكاديمي، مشهد الشاشة الثالثة.",
      alt: "لوحة الإشراف الأكاديمي"
    },
    welcome_magic_gate: {
      fileName: "welcome_magic_gate.png",
      path: "/images/intro/welcome_magic_gate.png",
      description: "بوابة الترحيب السحرية، مشهد الشاشة الرابعة.",
      alt: "بوابة الترحيب السحرية"
    },
    skills_floating_island: {
      fileName: "skills_floating_island.png",
      path: "/images/intro/skills_floating_island.png",
      description: "جزيرة المهارات الطافية، مشهد الشاشة الخامسة.",
      alt: "جزيرة المهارات الطافية"
    },
    flying_adventure_train: {
      fileName: "flying_adventure_train.png",
      path: "/images/intro/flying_adventure_train.png",
      description: "قطار المغامرة الطائر، مشهد الشاشة السادسة.",
      alt: "قطار المغامرة الطائر"
    }
  }
};
