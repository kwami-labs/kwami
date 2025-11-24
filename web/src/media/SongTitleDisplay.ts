import mediaLinks from '../media-links.json';

type TitleType = 'music' | 'voice' | 'video';

const songTitleDisplay = document.createElement('a');
songTitleDisplay.id = 'song-title-display';
songTitleDisplay.target = '_blank';
songTitleDisplay.rel = 'noopener noreferrer';
songTitleDisplay.style.cssText = `
  position: fixed;
  bottom: 100px;
  left: 0;
  right: 0;
  width: 100vw;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
  font-weight: 400;
  z-index: 9998;
  white-space: nowrap;
  overflow: hidden;
  text-align: center;
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;
  text-decoration: none;
  cursor: pointer;
`;
document.body.appendChild(songTitleDisplay);

let titleAnimationFrameId: number | null = null;

/**
 * Display media title with animated letters.
 */
export function showSongTitle(title: string, type: TitleType = 'music') {
  let youtubeUrl: string | undefined;
  if (type === 'music') {
    const fileName = `${title}.mp3`;
    youtubeUrl = mediaLinks.music[fileName as keyof typeof mediaLinks.music];
  } else if (type === 'video') {
    const fileName = `${title}.mp4`;
    youtubeUrl = mediaLinks.video[fileName as keyof typeof mediaLinks.video];
  }

  songTitleDisplay.innerHTML = '';
  const letters = title.split('');
  const letterSpans: HTMLSpanElement[] = [];

  letters.forEach((char) => {
    const span = document.createElement('span');
    span.textContent = char;
    span.className = 'title-letter';
    span.style.display = 'inline-block';
    span.style.transition = 'transform 0.15s ease-out';
    letterSpans.push(span);
    songTitleDisplay.appendChild(span);
  });

  if (youtubeUrl) {
    songTitleDisplay.href = youtubeUrl;
    songTitleDisplay.style.pointerEvents = 'auto';
    songTitleDisplay.title = 'Click to watch on YouTube';
  } else {
    songTitleDisplay.removeAttribute('href');
    songTitleDisplay.style.pointerEvents = 'none';
    songTitleDisplay.title = '';
  }

  songTitleDisplay.style.opacity = '1';
  if (type === 'voice') {
    songTitleDisplay.style.pointerEvents = 'none';
    songTitleDisplay.title = 'Playing voice sample';
  }

  if (type === 'music' || type === 'video') {
    startTitleAnimation(letterSpans);
  }

  const titleWidth = songTitleDisplay.scrollWidth;
  const containerWidth = window.innerWidth;

  if (titleWidth > containerWidth) {
    songTitleDisplay.style.animation = 'none';
    setTimeout(() => {
      songTitleDisplay.style.animation = 'marquee 15s linear infinite';
    }, 10);
  } else {
    songTitleDisplay.style.animation = 'none';
  }
}

/**
 * Hide the media title indicator and stop animations.
 */
export function hideSongTitle() {
  songTitleDisplay.style.opacity = '0';
  songTitleDisplay.style.animation = 'none';

  if (titleAnimationFrameId !== null) {
    cancelAnimationFrame(titleAnimationFrameId);
    titleAnimationFrameId = null;
  }
}

function startTitleAnimation(letterSpans: HTMLSpanElement[]) {
  if (titleAnimationFrameId !== null) {
    cancelAnimationFrame(titleAnimationFrameId);
  }

  let lastBeatTime = 0;
  const beatThreshold = 0.6;
  const minBeatInterval = 100;

  const animate = () => {
    const scrollManager = (window as any).scrollManager;
    const kwami = scrollManager?.getKwami?.();

    if (!kwami?.body?.audio) {
      titleAnimationFrameId = requestAnimationFrame(animate);
      return;
    }

    const audioSystem = kwami.body.audio;
    const analyzer = audioSystem.getAnalyser?.();

    if (analyzer) {
      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyzer.getByteFrequencyData(dataArray);

      const bassEnd = Math.floor(bufferLength * 0.15);
      let bassSum = 0;
      for (let i = 0; i < bassEnd; i++) {
        bassSum += dataArray[i];
      }
      const bassAverage = bassSum / bassEnd / 255;

      const now = Date.now();
      if (bassAverage > beatThreshold && (now - lastBeatTime) > minBeatInterval) {
        lastBeatTime = now;
        const numLettersToJump = Math.floor(Math.random() * 3) + 2;
        const selectedIndices = new Set<number>();

        while (selectedIndices.size < numLettersToJump && selectedIndices.size < letterSpans.length) {
          const randomIndex = Math.floor(Math.random() * letterSpans.length);
          selectedIndices.add(randomIndex);
        }

        selectedIndices.forEach(index => {
          const span = letterSpans[index];
          const jumpHeight = (Math.random() * 8 + 4);
          const rotation = (Math.random() * 20 - 10);

          span.style.transform = `translateY(-${jumpHeight}px) rotate(${rotation}deg)`;

          setTimeout(() => {
            span.style.transform = 'translateY(0) rotate(0deg)';
          }, 150);
        });
      } else {
        const midEnd = Math.floor(bufferLength * 0.5);
        let midSum = 0;
        for (let i = bassEnd; i < midEnd; i++) {
          midSum += dataArray[i];
        }
        const midAverage = midSum / (midEnd - bassEnd) / 255;

        if (Math.random() < midAverage * 0.3) {
          const randomIndex = Math.floor(Math.random() * letterSpans.length);
          const span = letterSpans[randomIndex];
          const scale = 1 + (midAverage * 0.1);

          span.style.transform = `scale(${scale})`;
          setTimeout(() => {
            span.style.transform = 'scale(1)';
          }, 100);
        }
      }
    }

    titleAnimationFrameId = requestAnimationFrame(animate);
  };

  titleAnimationFrameId = requestAnimationFrame(animate);
}


