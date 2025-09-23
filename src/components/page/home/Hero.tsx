"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import dynamic from "next/dynamic";
const AvatarCircles = dynamic(() =>
  import("@/components/magicui/avatar-circles").then((mod) => mod.AvatarCircles)
);

interface Avatar {
  imageUrl: string;
  profileUrl: string;
}

const avatars: Avatar[] = [
  {
    imageUrl:
      "https://d28xcrw70jd98d.cloudfront.net/allCollegeLogo/logo/1630668488phpf8KwKV.jpeg",
    profileUrl: "colleges",
  },
  {
    imageUrl:
      "https://d28xcrw70jd98d.cloudfront.net/allCollegeLogo/logo/1607775181php8zIJFF.jpeg",
    profileUrl: "colleges",
  },
  {
    imageUrl:
      "https://d28xcrw70jd98d.cloudfront.net/allCollegeLogo/logo/1570094042phpyJMujv.jpg",
    profileUrl: "colleges",
  },
];

interface CarouselSlide {
  id: string;
  image: string;
  title?: string;
  subtitle?: string;
  description?: string;
  stats?: {
    icon: string;
    text: string;
  };
}

const slides: CarouselSlide[] = [
  {
    id: "1",
    image: "/hero.webp",
  },
  {
    id: "2",
    image: "/hero.webp",
  },
  {
    id: "3",
    image: "/hero.webp",
  },
];

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(nextSlide, 20000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  // Pause auto-play on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") prevSlide();
      if (event.key === "ArrowRight") nextSlide();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  return (
    <section
      className="relative h-[50vh] md:h-[70vh] lg:h-[80vh] max-h-[80vh] w-full overflow-hidden flex-shrink-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="region"
      aria-label="Hero carousel"
    >
      {/* Carousel Container */}
      <div className="relative h-full w-full max-h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-in-out h-full w-full",
              index === currentSlide ? "opacity-100" : "opacity-0"
            )}
          >
            {/* Background Image with Next.js optimization */}
            <div className="absolute inset-0 w-full h-full max-h-full overflow-hidden">
              <Image
                src={slide.image || "/placeholder.svg"}
                alt={`Hero background image ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0} // Prioritize first image for LCP
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, (max-width: 1280px) 100vw, 100vw"
                fetchPriority={index === 0 ? "high" : "low"}
                style={{
                  objectFit: "cover",
                  maxHeight: "100%",
                  maxWidth: "100%",
                }}
              />
              {/* Dark overlay for better text readability */}
              <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Content */}
            {/* <div className="relative z-10 h-full w-full flex items-center justify-center min-h-0 max-h-full">
              <div className="text-center text-white max-w-4xl mx-auto px-4 flex-shrink-0 max-h-full overflow-hidden">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 text-balance">
                  <span className="text-white">
                    {slide?.title?.split(" ").slice(0, -2).join(" ")}
                  </span>{" "}
                  <span className="text-gray-300">
                    {slide?.title?.split(" ").slice(-2).join(" ")}
                  </span>
                </h1>

                <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-200 text-balance">
                  {slide.subtitle}
                </h2>

                <p className="text-xl md:text-2xl lg:text-3xl mb-8 text-gray-300 text-balance">
                  {slide.description}
                </p>

                {slide.stats && (
                  <div className="flex items-center justify-center space-x-2 text-lg md:text-xl">
                    <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                      <span className="text-2xl">{slide.stats.icon}</span>
                      <span className="font-semibold text-emerald-400">
                        {slide.stats.text}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div> */}
          </div>
        ))}
        <div className="absolute inset-0 z-[2] flex flex-col gap-6 items-center justify-center text-center px-4 md:px-8 lg:px-16">
          {" "}
          <h1 className="text-[#919EAB] text-xl md:text-3xl lg:text-5xl font-barlow font-medium leading-5 md:leading-wide max-w-4xl">
            {" "}
            <span className="text-primary-1 font-family font-extrabold">
              Find, Compare, Apply{" "}
            </span>
            Plus Access{" "}
            <span className="text-white block font-barlow text-2xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold my-1 md:my-2">
              Career Guidance & Financial Aid{" "}
            </span>
            All in One Place!{" "}
          </h1>{" "}
          <div className="flex items-center text-sm sm:text-base md:text-lg text-[#00B8D9] underline gap-2">
            <AvatarCircles className="" avatarUrls={avatars} />
            <Link href={"/colleges"}>30,000+ Colleges</Link>{" "}
          </div>{" "}
        </div>
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 rounded-full hover:bg-black/40 text-white h-12 w-12"
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute hidden rounded-full md:flex right-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 text-white h-12 w-12"
        onClick={nextSlide}
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[3] flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide
                ? "bg-white w-4"
                : "bg-white/50 hover:bg-white/80 w-2"
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentSlide}
          />
        ))}
      </div>

      {/* Screen reader announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Slide {currentSlide + 1} of {slides.length}:{" "}
        {slides[currentSlide].title}
      </div>
    </section>
  );
}
