import React from 'react';
import Image from 'next/image';
import styles from './StoryTrigger.module.css';

type StoryState = 'unread' | 'read' | 'no-story';

interface StoryTriggerProps {
  state: StoryState;
  onClick: () => void;
  imageSrc?: string;
  altText?: string;
  defaultImageSrc?: string;
}

const StoryTrigger: React.FC<StoryTriggerProps> = ({
  state,
  onClick,
  imageSrc,
  altText = 'Story image',
  defaultImageSrc = 'https://d28xcrw70jd98d.cloudfront.net/allCollegeLogo/defaultLogo1.webp',
}) => {
  const imageSource = imageSrc || defaultImageSrc;

  if (state === 'no-story') {
    return (
      <div className={`${styles.trigger} ${styles.noStory}`}>
        <Image
          src={imageSource}
          alt={altText}
          className={styles.innerImage}
          height={80}
          width={80}
          aria-label={altText}
        />
      </div>
    );
  }

  return (
    <button
      className={`${styles.trigger} ${state === 'unread' ? styles.unread : styles.read}`}
      onClick={onClick}
    >
      <Image
        src={imageSource}
        alt={altText}
        className={styles.innerImage}
        height={80}
        width={80}
        aria-label={altText}
      />
    </button>
  );
};

export default StoryTrigger;