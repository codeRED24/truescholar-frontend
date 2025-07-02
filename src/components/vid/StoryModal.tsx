'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './StoryModal.module.css';

interface StoryModalProps {
  videoUrls: string[];
  isOpen: boolean;
  onClose: () => void;
}

const StoryModal: React.FC<StoryModalProps> = ({ videoUrls, isOpen, onClose }) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  const currentVideoUrl = videoUrls[currentStoryIndex];
  const duration = 15000;

  useEffect(() => {
    if (!isOpen || isPaused || !currentVideoUrl) return;

    const interval = 100;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentStoryIndex < videoUrls.length - 1) {
            setCurrentStoryIndex((prev) => prev + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isOpen, isPaused, duration, currentStoryIndex, videoUrls, onClose]);

  const controlVideoPlayback = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !currentVideoUrl) return;

    if (playPromiseRef.current) {
      await playPromiseRef.current.catch(() => {});
    }

    if (isOpen && !isPaused) {
      video.src = currentVideoUrl;
      video.load();
      playPromiseRef.current = video.play();
      await playPromiseRef.current
        .then(() => {
          playPromiseRef.current = null;
        })
        .catch((error) => {
          console.error('Error playing video:', error);
          playPromiseRef.current = null;
        });
    } else {
      video.pause();
      video.currentTime = 0;
      playPromiseRef.current = null;
    }
  }, [isOpen, isPaused, currentVideoUrl]);

  useEffect(() => {
    controlVideoPlayback();
    return () => {
      const video = videoRef.current;
      if (video && !video.paused) {
        video.pause();
      }
    };
  }, [controlVideoPlayback]);

  useEffect(() => {
    setProgress(0);
  }, [currentStoryIndex]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const handleNext = useCallback(() => {
    if (currentStoryIndex < videoUrls.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  }, [currentStoryIndex, videoUrls.length, onClose]);

  const handlePrevious = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
    }
  }, [currentStoryIndex]);

  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!isOpen || !videoUrls.length) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContent}>
        <div className={styles.progressContainer}>
          {videoUrls.map((_, index) => (
            <div key={index} className={styles.progressBarWrapper}>
              <div
                className={styles.progressBar}
                style={{
                  width:
                    index < currentStoryIndex
                      ? '100%'
                      : index === currentStoryIndex
                      ? `${progress}%`
                      : '0%',
                }}
              />
            </div>
          ))}
        </div>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        <div className={styles.videoContainer}>
          <div className={styles.leftZone} onClick={handlePrevious} />
          <div className={styles.centerZone} onClick={togglePause}>
            <video
              ref={videoRef}
              muted={false}
              loop={false}
              playsInline
              className={styles.video}
            />
            {isPaused && (
              <div className={styles.pauseOverlay}>
                <span className={styles.pauseIcon}>⏸️</span>
              </div>
            )}
          </div>
          <div className={styles.rightZone} onClick={handleNext} />
        </div>
      </div>
    </div>
  );
};

export default StoryModal;