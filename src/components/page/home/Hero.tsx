"use client";
import { useState, useEffect, useCallback, memo } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageType {
  src: string;
  alt: string;
}

const IMAGES: ImageType[] = [
  { src: "/hero.webp", alt: "Hero background image 1" },
  { src: "/hero.webp", alt: "Hero background image 2" },
  { src: "/hero.webp", alt: "Hero background image 3" },
] as const;

const AUTO_ROTATE_INTERVAL = 5000;

const CarouselItem = memo(({ image, isActive, onLoad }: {
  image: ImageType;
  isActive: boolean;
  onLoad: () => void;
}) => (
  <div className={`absolute inset-0 transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
    <Image
      src={image.src}
      alt={image.alt}
      fill
      quality={75}
      priority={isActive}
      className="object-cover"
      sizes="100vw"
      onLoad={onLoad}
    />
  </div>
));
CarouselItem.displayName = 'CarouselItem';

const NavButton = memo(({ direction, onClick, ariaLabel }: {
  direction: 'prev' | 'next';
  onClick: () => void;
  ariaLabel: string;
}) => (
  <button
    onClick={onClick}
    className={`absolute ${direction === 'prev' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 z-[3]
              bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors
              focus:outline-none focus:ring-2 focus:ring-primary-1 hidden md:block`}
    aria-label={ariaLabel}
  >
    {direction === 'prev' ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
  </button>
));
NavButton.displayName = 'NavButton';

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<boolean[]>([]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? IMAGES.length - 1 : prev - 1));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % IMAGES.length);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const handleImageLoad = useCallback((index: number) => {
    setLoadedImages((prev) => {
      const newLoaded = [...prev];
      newLoaded[index] = true;
      return newLoaded;
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(goToNext, AUTO_ROTATE_INTERVAL);
    return () => clearInterval(interval);
  }, [goToNext]);

  useEffect(() => {
    const nextIndex = (currentIndex + 1) % IMAGES.length;
    new window.Image().src = IMAGES[nextIndex].src;
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };
    window.addEventListener('keydown', handleKeyDown as EventListener);
    return () => window.removeEventListener('keydown', handleKeyDown as EventListener);
  }, [goToPrevious, goToNext]);

  return (
    <div className="relative w-full h-[50vh] md:h-[70vh] lg:h-[80vh] overflow-hidden">
      {!loadedImages[0] && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse">
          <div className="h-full w-full flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-primary-1 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      )}

      {IMAGES.map((image, index) => (
        <CarouselItem
          key={image.src + index}
          image={image}
          isActive={index === currentIndex}
          onLoad={() => handleImageLoad(index)}
        />
      ))}

      <div className="absolute inset-0 z-[1] bg-[#141a218e]" />

      <div className="absolute inset-0 z-[2] flex items-center justify-center text-center px-4 md:px-8 lg:px-16">
        <h1 className="text-[#919EAB] text-lg sm:text-xl md:text-3xl lg:text-5xl font-barlow font-medium leading-tight md:leading-veryWide max-w-4xl">
          <span className="text-primary-1 font-public font-bold">Find, Compare, Apply </span>
          Plus Access
          <span className="text-white block font-public font-bold my-1 md:my-2">Career Guidance & Financial Aid</span>
          All in One Place!
        </h1>
      </div>

      <NavButton direction="prev" onClick={goToPrevious} ariaLabel="Previous slide" />
      <NavButton direction="next" onClick={goToNext} ariaLabel="Next slide" />

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[3] flex gap-2">
        {IMAGES.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex 
                ? 'bg-white w-4' 
                : 'bg-white/50 hover:bg-white/80 w-2'
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentIndex}
          />
        ))}
      </div>
    </div>
  );
};

export default Hero;