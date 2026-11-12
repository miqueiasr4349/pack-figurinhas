const storyCarousel = document.querySelector('#story-carousel');
const storySlides = storyCarousel.querySelectorAll('img').length;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const supportsHover = window.matchMedia('(hover: hover)');
let storyTimer;

// The last frame matches the first, so resetting the scroll position is invisible.
const loopFrame = storyCarousel.firstElementChild.cloneNode();
loopFrame.alt = '';
loopFrame.setAttribute('aria-hidden', 'true');
storyCarousel.append(loopFrame);

function currentStory() {
  return Math.round(storyCarousel.scrollLeft / storyCarousel.clientWidth);
}

function moveStory(direction) {
  const next = currentStory() + direction;
  const index = next < 0 ? storySlides - 1 : Math.min(next, storySlides);
  storyCarousel.scrollTo({
    left: index === storySlides ? storyCarousel.scrollWidth : index * storyCarousel.clientWidth,
    behavior: reducedMotion.matches ? 'instant' : 'smooth',
  });
}

function restartStoryTimer() {
  window.clearInterval(storyTimer);
  storyTimer = window.setInterval(() => {
    const isHovered = supportsHover.matches && storyCarousel.matches(':hover');
    if (!document.hidden && !reducedMotion.matches && !isHovered && !storyCarousel.matches(':focus-visible')) {
      moveStory(1);
    }
  }, 2600);
}

storyCarousel.addEventListener('scroll', () => {
  const end = storyCarousel.scrollWidth - storyCarousel.clientWidth;
  if (end > 0 && storyCarousel.scrollLeft >= end - 1) {
    storyCarousel.scrollTo({ left: 0, behavior: 'instant' });
  }
}, { passive: true });
storyCarousel.addEventListener('pointerdown', restartStoryTimer);
storyCarousel.addEventListener('keydown', (event) => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  moveStory(event.key === 'ArrowRight' ? 1 : -1);
  restartStoryTimer();
});
restartStoryTimer();

const demoVideo = document.querySelector('#video-story video');
const videoPlay = document.querySelector('.video-play');

videoPlay.hidden = false;
videoPlay.addEventListener('click', () => {
  demoVideo.play().catch(() => demoVideo.focus());
});
demoVideo.addEventListener('play', () => {
  if (document.activeElement === videoPlay) demoVideo.focus();
  videoPlay.hidden = true;
});
demoVideo.addEventListener('pause', () => { videoPlay.hidden = false; });

const videoObserver = new IntersectionObserver(([entry], observer) => {
  if (!entry.isIntersecting) return;
  demoVideo.preload = 'auto';
  observer.disconnect();
}, { rootMargin: '160px' });
videoObserver.observe(demoVideo);

const sectionObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.intersectionRatio < .2) return;
    entry.target.classList.add('is-revealed');
    observer.unobserve(entry.target);
  });
}, { threshold: .2 });
document.querySelectorAll('[data-reveal]').forEach((section) => sectionObserver.observe(section));

const nicheSection = document.querySelector('.niche-section');
const nicheTags = nicheSection.querySelector('.tags');
const nicheButtons = [...nicheTags.querySelectorAll('button')];
const nicheExample = document.querySelector('#niche-example');
let selectedNiche = 0;
let nicheTimer;

function selectNiche(index) {
  nicheButtons[selectedNiche].setAttribute('aria-pressed', 'false');
  const next = nicheButtons[index];
  next.setAttribute('aria-pressed', 'true');
  nicheExample.textContent = `“${next.dataset.example}”`;
  selectedNiche = index;
  if (!reducedMotion.matches) {
    nicheExample.animate([{ opacity: .45, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 240, easing: 'ease-out' });
  }
}

nicheButtons.forEach((button, index) => {
  button.addEventListener('click', () => selectNiche(index));
});

const nicheObserver = new IntersectionObserver(([entry]) => {
  window.clearInterval(nicheTimer);
  if (entry.intersectionRatio < .3) return;
  nicheTimer = window.setInterval(() => {
    if (document.hidden || reducedMotion.matches || nicheTags.matches(':focus-within')) return;
    selectNiche((selectedNiche + 1) % nicheButtons.length);
  }, 2200);
}, { threshold: .3 });
nicheObserver.observe(nicheSection);
