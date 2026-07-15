'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Volume2, Pause } from './IntroIcons';
import { IntroButton as Button } from './IntroButton';
import { FloatingLetters } from './FloatingLetters';
import { IntroImage } from './IntroImage';
import { imageAssets } from '../config/intro-assets';
import styles from '../styles/Intro.module.css';
import { useAudio } from '@/providers/AudioProvider';

interface IntroExperienceProps {
  onComplete: () => void;
}

type IntroSceneId =
  | 'official-azhar'
  | 'official-researcher-book'
  | 'official-supervision-board'
  | 'welcome-gate'
  | 'welcome-skills-island'
  | 'welcome-adventure-train';

interface IntroTextBlock {
  title?: string;
  lines: string[];
  emphasis?: boolean;
}

interface IntroScene {
  id: IntroSceneId;
  phase: 'official' | 'welcome';
  eyebrow: string;
  sceneTitle: string;
  title: string;
  subtitle: string;
  narration: string;
  blocks: IntroTextBlock[];
}

const INTRO_SCENES: IntroScene[] = [
  {
    id: 'official-azhar',
    phase: 'official',
    eyebrow: 'منارة العلم واللغة العربية',
    sceneTitle: 'واجهة الأزهر الشريف',
    title: 'جامعة الأزهر',
    subtitle: 'كلية التربية بنين بالقاهرة - قسم المناهج وطرق التدريس',
    narration:
      'مَرْحَبًا بِكُمْ فِي هَذَا التَّطْبِيقِ التَّعْلِيمِيِّ، الْمُهْدَى مِنْ جَامِعَةِ الْأَزْهَرِ الشَّرِيفِ، كُلِّيَّةِ التَّرْبِيَةِ بَنِينَ بِالْقَاهِرَةِ، قِسْمِ الْمَنَاهِجِ وَطُرُقِ التَّدْرِيسِ.',
    blocks: [
      {
        lines: ['جامعة الأزهر', 'كلية التربية بنين بالقاهرة', 'قسم المناهج وطرق التدريس'],
        emphasis: true,
      },
      {
        title: 'تحت إشراف',
        lines: ['أ.د. خالد فاروق الهواري', 'د. باسم محمد عبده الجندي', 'د. أشرف محمد سعد'],
      },
    ],
  },
  {
    id: 'official-researcher-book',
    phase: 'official',
    eyebrow: 'كتاب الباحث السحري',
    sceneTitle: 'بيانات البحث',
    title: 'هذا التطبيق مقدم استكمالًا لمتطلبات الحصول على درجة الماجستير',
    subtitle: 'تخصص: مناهج وطرق تدريس اللغة العربية',
    narration:
      'هَذَا الْعَمَلُ مُقَدَّمٌ اسْتِكْمَالًا لِمُتَطَلَّبَاتِ الْحُصُولِ عَلَى دَرَجَةِ الْمَاجِسْتِيرِ فِي التَّرْبِيَةِ، تَخَصُّصِ مَنَاهِجَ وَطُرُقِ تَدْرِيسِ اللُّغَةِ الْعَرَبِيَّةِ. إِعْدَادُ الْبَاحِثِ: مُصْطَفَى أَحْمَد مُحَمَّد حَسَن حَسَّان.',
    blocks: [
      {
        lines: [
          'هذا التطبيق مقدم استكمالًا لمتطلبات الحصول على درجة الماجستير في التربية',
          'تخصص: مناهج وطرق تدريس اللغة العربية',
        ],
        emphasis: true,
      },
      {
        title: 'إعداد الباحث',
        lines: [
          'مصطفى أحمد محمد حسن حسان',
          'معلم لغة عربية',
          'بوزارة التربية والتعليم بجمهورية مصر العربية',
        ],
      },
    ],
  },
  {
    id: 'official-supervision-board',
    phase: 'official',
    eyebrow: 'لوحة الإشراف الأكاديمي',
    sceneTitle: 'تحت إشراف',
    title: 'نخبة من العلماء الأجلاء',
    subtitle: 'كلية التربية بالقاهرة - جامعة الأزهر',
    narration:
      'وَيَأْتِي هَذَا الْعَمَلُ تَحْتَ إِشْرَافِ نُخْبَةٍ مِنَ الْعُلَمَاءِ الْأَجِلَّاءِ: الْأُسْتَاذِ الدُّكْتُورِ خَالِد فَارُوق الْهَوَّارِي، الدُّكْتُورِ بَاسِم مُحَمَّد عَبْدُهُ الْجُنْدِي، وَالدُّكْتُورِ أَشْرَف مُحَمَّد سَعْد، أَسَاتِذَةِ الْمَنَاهِجِ وَطُرُقِ التَّدْرِيسِ بِكُلِّيَّةِ التَّرْبِيَةِ بِجَامِعَةِ الْأَزْهَرِ.',
    blocks: [
      {
        title: 'أ.د. خالد فاروق الهواري',
        lines: ['أستاذ المناهج وطرق التدريس', 'كلية التربية بالقاهرة - جامعة الأزهر'],
      },
      {
        title: 'د. باسم محمد عبده الجندي',
        lines: ['أستاذ المناهج وطرق التدريس', 'كلية التربية بالقاهرة - جامعة الأزهر'],
      },
      {
        title: 'د. أشرف محمد سعد',
        lines: ['أستاذ المناهج وطرق التدريس', 'كلية التربية بالقاهرة - جامعة الأزهر'],
      },
    ],
  },
  {
    id: 'welcome-gate',
    phase: 'welcome',
    eyebrow: 'واحة الحروف والأصوات السحرية',
    sceneTitle: 'بوابة الترحيب',
    title: 'مرحبًا بك!',
    subtitle: 'أهلًا بك يا بطل الصف الأول الابتدائي',
    narration:
      'عَزِيزِي تِلْمِيذَ الصَّفِّ الْأَوَّلِ الِابْتِدَائِيِّ، أَهْلًا وَمَرْحَبًا بِكَ يَا بَطَلُ فِي رِحْلَةٍ مُمْتِعَةٍ وَشَيِّقَةٍ، مَلِيئَةٍ بِالْأَلْعَابِ اللُّغَوِيَّةِ الْإِلِكْتُرُونِيَّةِ الْمُرْتَبِطَةِ بِالْأَصْوَاتِ وَالْحُرُوفِ الْجَمِيلَةِ.',
    blocks: [
      {
        lines: [
          'عزيزي تلميذ الصف الأول الابتدائي، أهلًا ومرحبًا بك يا بطل في رحلة ممتعة وشيقة.',
          'رحلتك مليئة بالألعاب اللغوية الإلكترونية المرتبطة بالأصوات والحروف الجميلة.',
        ],
        emphasis: true,
      },
    ],
  },
  {
    id: 'welcome-skills-island',
    phase: 'welcome',
    eyebrow: 'واحة الحروف والأصوات السحرية',
    sceneTitle: 'جزيرة المهارات',
    title: 'نسمع، نتعرف، نحلل، ندمج',
    subtitle: 'مهارات الأصوات والحروف خطوة بخطوة',
    narration:
      'عَزِيزِي التِّلْمِيذُ، فِي هَذَا التَّطْبِيقِ سَوْفَ تَتَعَلَّمُ كَيْفَ تَسْمَعُ الْأَصْوَاتَ، وَتَتَعَرَّفُ عَلَى الْحُرُوفِ وَالْكَلِمَاتِ، وَتُحَلِّلُهَا وَتَدْمِجُهَا بِطَرِيقَةٍ سَهْلَةٍ وَمَرِحَةٍ.',
    blocks: [
      {
        lines: [
          'سوف تتعلم كيف تسمع الأصوات.',
          'وتتعرف على الحروف والكلمات.',
          'وتحللها وتدمجها بطريقة سهلة ومرحة.',
        ],
        emphasis: true,
      },
    ],
  },
  {
    id: 'welcome-adventure-train',
    phase: 'welcome',
    eyebrow: 'واحة الحروف والأصوات السحرية',
    sceneTitle: 'قطار المغامرة والانطلاق',
    title: 'هَيَّا بنا ننطلق!',
    subtitle: 'نلعب ونتعلم الأصوات والحروف في مغامرات ممتعة',
    narration:
      'هَيَّا بِنَا نَنْطَلِقْ! عَزِيزِي التِّلْمِيذُ، نَلْعَبُ وَنَتَعَلَّمُ الْأَصْوَاتَ وَالْحُرُوفَ فِي مُغَامَرَاتٍ مُمْتِعَةٍ تُسَاعِدُكَ عَلَى التَّمْيِيزِ بَيْنَ الْأَصْوَاتِ، وَالتَّعَرُّفِ عَلَى الْحُرُوفِ، وَبِنَاءِ مَهَارَاتِكَ خُطْوَةً بِخُطْوَةٍ.',
    blocks: [
      {
        lines: [
          'نلعب ونتعلم الأصوات والحروف في مغامرات ممتعة.',
          'ستساعدك الرحلة على التمييز بين الأصوات، والتعرف على الحروف، وبناء مهاراتك خطوة بخطوة.',
        ],
        emphasis: true,
      },
    ],
  },
];

export function IntroExperience({ onComplete }: IntroExperienceProps) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const completionStartedRef = useRef(false);
  const completionTimeoutRef = useRef<number | null>(null);
  
  const { play, pause, resume, replay, isPlaying, isManualMode, enterManualMode, currentAudioId } = useAudio();
  const [hasStarted, setHasStarted] = useState(false);
  
  const isManualModeRef = useRef(isManualMode);
  useEffect(() => {
    isManualModeRef.current = isManualMode;
  }, [isManualMode]);

  const [isPendingComplete, setIsPendingComplete] = useState(false);
  const pendingCompletionRef = useRef(false);
  const audioCompletedRef = useRef<boolean[]>(new Array(INTRO_SCENES.length).fill(false));

  useEffect(() => {
    return () => {
      if (completionTimeoutRef.current !== null) {
        window.clearTimeout(completionTimeoutRef.current);
      }
    };
  }, []);

  const completeIntro = useCallback(async () => {
    if (leaving || completionStartedRef.current) return;
    completionStartedRef.current = true;
    setLeaving(true);
    completionTimeoutRef.current = window.setTimeout(onComplete, 200);
  }, [leaving, onComplete]);

  const goToNextSceneAuto = useCallback(() => {
    if (sceneIndex >= INTRO_SCENES.length - 1) {
      completeIntro();
      return;
    }
    setSceneIndex((current) => Math.min(current + 1, INTRO_SCENES.length - 1));
  }, [completeIntro, sceneIndex]);

  const goToNextSceneManual = useCallback(() => {
    enterManualMode();
    setHasStarted(true);
    if (sceneIndex >= INTRO_SCENES.length - 1) {
      if (audioCompletedRef.current[sceneIndex]) {
        completeIntro();
      } else {
        pendingCompletionRef.current = true;
        setIsPendingComplete(true);
      }
      return;
    }
    setSceneIndex((current) => Math.min(current + 1, INTRO_SCENES.length - 1));
  }, [completeIntro, sceneIndex, enterManualMode]);

  const goToPreviousSceneManual = useCallback(() => {
    enterManualMode();
    setHasStarted(true);
    setSceneIndex((current) => Math.max(current - 1, 0));
  }, [enterManualMode]);

  // Audio orchestrator
  useEffect(() => {
    if (hasStarted) {
      audioCompletedRef.current[sceneIndex] = false;
      play(`global-intro-intro-scene-${sceneIndex}`, {
        onEnded: () => {
          audioCompletedRef.current[sceneIndex] = true;
          if (sceneIndex === INTRO_SCENES.length - 1 && pendingCompletionRef.current) {
            completeIntro();
          } else if (!isManualModeRef.current) {
            goToNextSceneAuto();
          }
        },
        onError: () => {
          audioCompletedRef.current[sceneIndex] = true;
          if (sceneIndex === INTRO_SCENES.length - 1 && pendingCompletionRef.current) {
            completeIntro();
          } else if (!isManualModeRef.current) {
            goToNextSceneAuto();
          }
        }
      });
    }
  }, [sceneIndex, hasStarted, play, goToNextSceneAuto, completeIntro]);

  const onPlayToggle = useCallback(() => {
    if (!hasStarted) {
      setHasStarted(true);
      return;
    }
    if (isPlaying) {
      pause();
    } else {
      if (currentAudioId === `global-intro-intro-scene-${sceneIndex}`) {
        resume();
      } else {
        replay();
      }
    }
  }, [hasStarted, isPlaying, pause, resume, replay, currentAudioId, sceneIndex]);

  const scene = INTRO_SCENES[sceneIndex];

  return (
    <div
      className={`${styles.introOverlay} ${leaving ? styles.introOverlayLeaving : styles.introOverlayActive}`}
      dir="rtl"
    >
      <div className={styles.topGradient} />
      <div className={styles.bottomGradient} />
      <FloatingLetters />

      <CinematicScenePlayer
        scene={scene}
        sceneIndex={sceneIndex}
        sceneCount={INTRO_SCENES.length}
        onNext={goToNextSceneManual}
        onPrevious={goToPreviousSceneManual}
        onSkip={completeIntro}
        onPlayToggle={onPlayToggle}
        isPlaying={isPlaying && currentAudioId === `global-intro-intro-scene-${sceneIndex}`}
        isPendingComplete={isPendingComplete}
      />
    </div>
  );
}

function CinematicScenePlayer({
  scene,
  sceneIndex,
  sceneCount,
  onNext,
  onPrevious,
  onSkip,
  onPlayToggle,
  isPlaying,
  isPendingComplete,
}: {
  scene: IntroScene;
  sceneIndex: number;
  sceneCount: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onPlayToggle: () => void;
  isPlaying: boolean;
  isPendingComplete: boolean;
}) {
  const isFirstScene = sceneIndex === 0;
  const isLastScene = sceneIndex === sceneCount - 1;
  const progress = ((sceneIndex + 1) / sceneCount) * 100;

  return (
    <main className={styles.mainContainer}>
      <header className={styles.headerRow}>
        <div className={styles.headerInfoBox}>
          <p className={styles.eyebrowText}>{scene.eyebrow}</p>
          <p className={styles.sceneTitleText}>
            المشهد {sceneIndex + 1} من {sceneCount}: {scene.sceneTitle}
          </p>
        </div>

        <Button
          type="button"
          onClick={onSkip}
          className={`${styles.btn} ${styles.btnSkip}`}
          data-testid="intro-skip"
        >
          تخطي المقدمة
        </Button>
      </header>

      <div className={styles.progressBarContainer}>
        <motion.div
          key={scene.id}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className={styles.progressBarFill}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.section
          key={scene.id}
          initial={{ opacity: 0, y: 22, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -14, scale: 0.98 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          className={styles.sceneSection}
          data-testid={`intro-scene-${scene.id}`}
        >
          <SceneVisual scene={scene} />
          <SceneCopy
            scene={scene}
            isFirstScene={isFirstScene}
            isLastScene={isLastScene}
            onNext={onNext}
            onPrevious={onPrevious}
            onPlayToggle={onPlayToggle}
            isPlaying={isPlaying}
            isPendingComplete={isPendingComplete}
          />
        </motion.section>
      </AnimatePresence>
    </main>
  );
}

function SceneCopy({
  scene,
  isFirstScene,
  isLastScene,
  onNext,
  onPrevious,
  onPlayToggle,
  isPlaying,
  isPendingComplete,
}: {
  scene: IntroScene;
  isFirstScene: boolean;
  isLastScene: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onPlayToggle: () => void;
  isPlaying: boolean;
  isPendingComplete: boolean;
}) {
  return (
    <div className={styles.sceneCopyContainer}>
      <div className={styles.sceneTitlesBox}>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <span className={styles.sceneEyebrowBadge}>
            {scene.eyebrow}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={styles.sceneMainTitle}
        >
          {scene.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={styles.sceneSubtitle}
        >
          {scene.subtitle}
        </motion.p>
      </div>

      <div className={styles.blocksContainer}>
        {scene.blocks.map((block, blockIndex) => (
          <motion.div
            key={`${scene.id}-${block.title || blockIndex}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + blockIndex * 0.1 }}
            className={`${styles.blockCard} ${
              block.emphasis ? styles.blockCardEmphasis : styles.blockCardNormal
            }`}
          >
            {block.title && (
              <h3 className={styles.blockTitle}>
                {block.title}
              </h3>
            )}
            <div className={styles.blockLinesContainer}>
              {block.lines.map((line) => (
                <p
                  key={line}
                  className={`${styles.blockLine} ${
                    block.emphasis ? styles.blockLineEmphasis : styles.blockLineNormal
                  }`}
                >
                  {line}
                </p>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={styles.actionsGrid}
      >
        <Button
          type="button"
          onClick={onPrevious}
          disabled={isFirstScene}
          className={`${styles.btn} ${styles.btnOutline}`}
          data-testid="intro-previous"
        >
          <ChevronRight className={styles.iconRight} />
          عودة
        </Button>

        <Button
          type="button"
          onClick={onPlayToggle}
          className={`${styles.btn} ${styles.btnAudio}`}
          title={isPlaying ? "إيقاف الصوت" : "تشغيل الصوت"}
          data-testid="intro-audio-toggle"
        >
          {isPlaying ? (
            <>
              <Pause className={styles.iconRight} /> إيقاف الصوت
            </>
          ) : (
             <>
              <Play className={styles.iconRight} /> تشغيل الصوت
            </>
          )}
        </Button>

        <Button
          type="button"
          onClick={onNext}
          className={`${styles.btn} ${styles.btnNext}`}
          data-testid="intro-next"
          disabled={isPendingComplete}
        >
          {isLastScene ? (
            isPendingComplete ? (
              <>جارٍ إنهاء الرسالة...</>
            ) : (
              <>
                <Play className={`${styles.iconRight} fill-current`} />
                ابدأ الرحلة
              </>
            )
          ) : (
            <>
              التالي
              <ChevronLeft className={styles.iconLeft} />
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}

function SceneVisual({ scene }: { scene: IntroScene }) {
  if (scene.id === 'official-azhar') return <OfficialIntroScene />;
  if (scene.id === 'official-researcher-book') return <ResearcherBookScene />;
  if (scene.id === 'official-supervision-board') return <HonorBoardScene />;
  if (scene.id === 'welcome-gate') return <WelcomeIntroScene />;
  if (scene.id === 'welcome-skills-island') return <SkillsIslandScene />;
  return <AdventureTrainScene />;
}

function OfficialIntroScene() {
  return (
    <div className={styles.sceneImageWrapper}>
      <IntroImage
        src={imageAssets.intro.alazhar_minarets_faculty.path}
        alt={imageAssets.intro.alazhar_minarets_faculty.alt}
        className={styles.sceneImage}
        priority
      />
    </div>
  );
}

function ResearcherBookScene() {
  return (
    <div className={styles.sceneImageWrapper}>
      <IntroImage
        src={imageAssets.intro.magical_research_book.path}
        alt={imageAssets.intro.magical_research_book.alt}
        className={styles.sceneImage}
        priority
      />
    </div>
  );
}

function HonorBoardScene() {
  return (
    <div className={styles.sceneImageWrapper}>
      <IntroImage
        src={imageAssets.intro.golden_honor_board.path}
        alt={imageAssets.intro.golden_honor_board.alt}
        className={styles.sceneImage}
        priority
      />
    </div>
  );
}

function WelcomeIntroScene() {
  return (
    <div className={styles.sceneImageWrapper}>
      <IntroImage
        src={imageAssets.intro.welcome_magic_gate.path}
        alt={imageAssets.intro.welcome_magic_gate.alt}
        className={styles.sceneImage}
        priority
      />
    </div>
  );
}

function SkillsIslandScene() {
  return (
    <div className={styles.sceneImageWrapper}>
      <IntroImage
        src={imageAssets.intro.skills_floating_island.path}
        alt={imageAssets.intro.skills_floating_island.alt}
        className={styles.sceneImage}
        priority
      />
    </div>
  );
}

function AdventureTrainScene() {
  return (
    <div className={styles.sceneImageWrapper}>
      <IntroImage
        src={imageAssets.intro.flying_adventure_train.path}
        alt={imageAssets.intro.flying_adventure_train.alt}
        className={styles.sceneImage}
        priority
      />
    </div>
  );
}
