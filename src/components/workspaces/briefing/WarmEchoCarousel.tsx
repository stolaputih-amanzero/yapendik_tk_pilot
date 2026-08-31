import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';

export interface ParentEchoItem {
  id: string;
  childName: string;
  childInitials: string;
  parentName: string;
  className: string;
  topicTag: string;
  quote: string;
  timeFormatted: string;
}

const DEFAULT_ECHOES: ParentEchoItem[] = [
  {
    id: 'echo_1',
    childName: 'Sean Abimanyu',
    childInitials: 'SA',
    parentName: 'Mama Sean',
    className: 'Kelas TK A',
    topicTag: 'Sentra Seni & Balok',
    quote: 'Sean cerita tadi siang sangat senang membuat jembatan balok bersama teman-temannya. Terima kasih Bu Erna.',
    timeFormatted: '14:20 WIB'
  },
  {
    id: 'echo_2',
    childName: 'Kenzo Alvarendra',
    childInitials: 'KA',
    parentName: 'Papa Kenzo',
    className: 'Kelas TK A',
    topicTag: 'Kemandirian & Doa',
    quote: 'Puji Tuhan, Kenzo sekarang selalu ingat berdoa sendiri sebelum makan di rumah. Terima kasih bimbingannya Bu Guru.',
    timeFormatted: '15:10 WIB'
  },
  {
    id: 'echo_3',
    childName: 'Clarissa Maria',
    childInitials: 'CM',
    parentName: 'Mama Clarissa',
    className: 'Kelas TK A',
    topicTag: 'Motorik & Kolase',
    quote: 'Clarissa bangga sekali memamerkan hasil karya gunting tempelnya tadi sore. Terima kasih banyak atas kesabaran Ibu.',
    timeFormatted: '16:05 WIB'
  },
  {
    id: 'echo_4',
    childName: 'Millen Theo',
    childInitials: 'MT',
    parentName: 'Mama Millen',
    className: 'Kelas TK A',
    topicTag: 'Gotong Royong',
    quote: 'Millen cerita senang sekali bisa berbagi bekal buah bersama teman-teman hari ini. Terima kasih Bu Erna dan Ibu Novita.',
    timeFormatted: '16:45 WIB'
  },
  {
    id: 'echo_5',
    childName: 'Eliana Rachel',
    childInitials: 'ER',
    parentName: 'Papa Eliana',
    className: 'Kelas TK A',
    topicTag: 'Sentra Dongeng',
    quote: 'Eliana antusias sekali menceritakan kembali dongeng yang dibacakan Ibu Guru tadi pagi di kelas.',
    timeFormatted: '17:15 WIB'
  }
];

export interface WarmEchoCarouselProps {
  echoes?: ParentEchoItem[];
  onAppreciate?: (echoId: string) => void;
}

export const WarmEchoCarousel: React.FC<WarmEchoCarouselProps> = ({
  echoes = DEFAULT_ECHOES,
  onAppreciate
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [appreciatedMap, setAppreciatedMap] = useState<Record<string, boolean>>({});
  const [isPaused, setIsPaused] = useState(false);
  const [showHeartPop, setShowHeartPop] = useState(false);

  const touchStartXRef = useRef<number | null>(null);

  const activeEcho = echoes[currentIndex] || echoes[0];
  const isAppreciated = !!appreciatedMap[activeEcho.id];

  // Auto-advance every 7 seconds when not paused
  useEffect(() => {
    if (isPaused || echoes.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % echoes.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [isPaused, echoes.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % echoes.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + echoes.length) % echoes.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;

    if (diff > 40) {
      handleNext();
    } else if (diff < -40) {
      handlePrev();
    }
    touchStartXRef.current = null;
    setIsPaused(false);
  };

  const triggerHeartReaction = () => {
    const nextState = !isAppreciated;
    setAppreciatedMap((prev) => ({ ...prev, [activeEcho.id]: nextState }));
    
    if (nextState) {
      setShowHeartPop(true);
      setTimeout(() => {
        setShowHeartPop(false);
      }, 900);
    }

    if (onAppreciate) {
      onAppreciate(activeEcho.id);
    }
  };

  return (
    <div 
      className={`relative rounded-2xl p-4 medium:p-5 transition-all duration-500 overflow-hidden select-none ${
        isAppreciated 
          ? 'bg-accent-valor/[0.06] border border-accent-valor/50 shadow-xs' 
          : 'bg-surface-subtle border border-accent-valor/20 shadow-xs'
      }`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Luminous Heart Pop Floating Overlay Animation */}
      {showHeartPop && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none animate-in fade-in zoom-in-50 duration-300">
          <div className="p-4 rounded-full bg-surface/90 shadow-xl border border-accent-valor/50 animate-bounce">
            <Heart className="w-16 h-16 text-accent-valor fill-accent-valor" />
          </div>
        </div>
      )}

      {/* Editorial Grand Gold Quote Mark */}
      <div 
        className="font-serif text-6xl medium:text-7xl leading-[0.6] text-accent-valor/40 pt-1 -mb-2 select-none pointer-events-none"
        aria-hidden="true"
      >
        “
      </div>

      {/* Main Quote & Navigation Flow */}
      <div className="relative z-10 space-y-3 pt-1">
        <div className="flex items-center gap-2">
          {/* Navigation Chevron Left (Ghost) */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Catatan sebelumnya"
            className="p-1 -ml-1 text-ink-faint/50 hover-only:text-ink active:scale-90 transition-all shrink-0 flex items-center justify-center cursor-pointer select-none"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Child Avatar & Quote Content (Clickable to trigger Heart Reaction) */}
          <div 
            onClick={triggerHeartReaction}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                triggerHeartReaction();
              }
            }}
            title="Ketuk pesan untuk menyambut dengan kasih"
            className="grow flex items-start gap-3 min-w-0 cursor-pointer active:scale-[0.99] transition-transform py-0.5"
          >
            {/* Child Initial Pastel Avatar */}
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all duration-300 ${
              isAppreciated 
                ? 'bg-accent-valor text-ink font-extrabold ring-2 ring-accent-valor shadow-xs' 
                : 'bg-accent-valor/20 border border-accent-valor/30 text-ink'
            }`}>
              {activeEcho.childInitials}
            </div>

            {/* Quote Text */}
            <p className="grow text-sm medium:text-base font-serif italic text-ink leading-relaxed pr-1 line-clamp-3">
              "{activeEcho.quote}"
            </p>
          </div>

          {/* Navigation Chevron Right (Ghost) */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Catatan berikutnya"
            className="p-1 -mr-1 text-ink-faint/50 hover-only:text-ink active:scale-90 transition-all shrink-0 flex items-center justify-center cursor-pointer select-none"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Full-Width Metadata Line Justified: Author • Class (Left) | Topic Tag (Right) - Pure Ghost */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-line-hairline/60 text-xs">
          <div className="flex items-center gap-1.5 min-w-0 truncate text-ink-soft">
            <span className="font-semibold text-ink truncate">
              {activeEcho.parentName}
            </span>
            <span className="text-ink-faint shrink-0">•</span>
            <span className="text-ink-faint truncate">{activeEcho.className}</span>
          </div>

          <button 
            type="button"
            onClick={triggerHeartReaction}
            aria-label="Sambut pesan dengan kasih"
            className={`inline-flex items-center gap-1.5 text-xs transition-all duration-300 cursor-pointer shrink-0 bg-transparent border-0 p-0 select-none ${
              isAppreciated
                ? 'text-brand-deep font-semibold'
                : 'text-ink-faint hover-only:text-ink'
            }`}
          >
            <Heart 
              className={`w-3.5 h-3.5 transition-transform duration-300 ${
                isAppreciated 
                  ? 'fill-accent-valor text-accent-valor scale-110' 
                  : 'text-ink-faint/60 hover-only:text-accent-valor'
              }`} 
            />
            <span>{activeEcho.topicTag}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
