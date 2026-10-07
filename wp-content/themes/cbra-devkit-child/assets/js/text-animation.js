document.addEventListener('DOMContentLoaded', function () {
  initTextRevealAnimation();
  initLottieAnimation();
});

/*
   1) TEXT REVEAL ANIMATION
*/

function initTextRevealAnimation() {
  const content = document.querySelector('.text-animation__content');
  const sticky  = document.querySelector('.text-animation__sticky');
  const reveal  = document.querySelector('.text-animation__reveal');
  const heading = document.querySelector('.text-animation__heading');
  const items   = Array.from(document.querySelectorAll('.text-animation__text-item'));
  const button  = reveal ? reveal.querySelector('.cb-button') : null;

  if (!content || !sticky || !reveal) return;

  const firstItem = items[0] || null;
  const FIRST_ITEM_OFFSET = 40;
  const FIRST_ITEM_PHASE_END = 0.15;

  const hiddenItems = items.slice(1);
  const itemSegments = hiddenItems.length;
  const segments = itemSegments + (button ? 1 : 0);

  const itemsPhaseEnd = segments > 0 ? itemSegments / segments : 1;

  function getScrollProgress() {
    const stickyTop = parseFloat(getComputedStyle(sticky).top) || 0;
    const scrolled = stickyTop - content.getBoundingClientRect().top;
    const pinDistance = content.offsetHeight - sticky.offsetHeight;

    return pinDistance > 0
      ? clamp(scrolled / pinDistance, 0, 1)
      : 0;
  }

  function revealItems(progress, travelDistance) {
    if (firstItem) {
      const firstItemProgress = clamp(progress / FIRST_ITEM_PHASE_END, 0, 1);

      firstItem.style.transform =
        `translateY(${FIRST_ITEM_OFFSET * (1 - firstItemProgress)}px)`;
    }

    const itemsProgress = itemsPhaseEnd > 0
      ? clamp(progress / itemsPhaseEnd, 0, 1)
      : 1;

    hiddenItems.forEach((item, index) => {
      const itemProgress = clamp(
        (itemsProgress - index / itemSegments) * itemSegments,
        0,
        1
      );

      item.style.transform =
        `translateY(${travelDistance * (1 - itemProgress)}px)`;
    });

    if (button) {
      const buttonProgress = clamp(
        (progress - itemsPhaseEnd) / (1 - itemsPhaseEnd),
        0,
        1
      );

      button.style.transform =
        `translateY(${travelDistance * (1 - buttonProgress)}px)`;
    }
  }

  function resetReveal() {
    if (firstItem) {
      firstItem.style.transform = '';
    }

    hiddenItems.forEach(item => {
      item.style.transform = '';
    });

    if (button) {
      button.style.transform = '';
    }
  }

  function setHeadingFill(percent) {
    if (heading) {
      heading.style.setProperty('--fill', percent + '%');
    }
  }

  function updateScrollRoom() {
    const isSticky = getComputedStyle(sticky).position === 'sticky';

    content.style.minHeight =
      isSticky && segments > 0
        ? `calc(150vh + ${segments * window.innerHeight * 0.4}px)`
        : '';
  }

  function update() {
    const isSticky =
      getComputedStyle(sticky).position === 'sticky';

    if (!isSticky) {
      resetReveal();
      setHeadingFill(0);
      targetLottieProgress = 0;
      return;
    }

    const travelDistance = window.innerHeight * 0.4;
    const progress = getScrollProgress();

    if (segments > 0 || firstItem) {
      revealItems(progress, travelDistance);
    }

    setHeadingFill(progress * 100);

    // csak a célértéket frissítjük
    targetLottieProgress = progress;
  }

  window.addEventListener('scroll', update, { passive: true });

  window.addEventListener('resize', () => {
    updateScrollRoom();
    update();
  });

  updateScrollRoom();
  update();
}

/*
   2) LOTTIE ANIMATION
*/

let lottieAnim = null;

let targetLottieProgress = 0;
let currentLottieProgress = 0;
let animationStarted = false;

function initLottieAnimation() {
  const container = document.getElementById('text-animation-lottie');

  if (!container) return;
  if (typeof lottie === 'undefined') return;
  if (
    typeof CBRA_TEXT_ANIMATION === 'undefined' ||
    !CBRA_TEXT_ANIMATION.lottieUrl
  ) {
    return;
  }

  lottieAnim = lottie.loadAnimation({
    container,
    renderer: 'canvas',
    loop: false,
    autoplay: false,
    path: CBRA_TEXT_ANIMATION.lottieUrl,
  });

  lottieAnim.addEventListener('DOMLoaded', () => {
    window.dispatchEvent(new Event('scroll'));

    if (!animationStarted) {
      animationStarted = true;
      animateLottie();
    }
  });
}

function animateLottie() {
  currentLottieProgress +=
    (targetLottieProgress - currentLottieProgress) * 0.15;

  if (
    Math.abs(targetLottieProgress - currentLottieProgress) < 0.0001
  ) {
    currentLottieProgress = targetLottieProgress;
  }

  setLottieProgress(currentLottieProgress);

  requestAnimationFrame(animateLottie);
}

function setLottieProgress(progress) {
  if (!lottieAnim || !lottieAnim.totalFrames) return;

  const lastFrame = lottieAnim.totalFrames - 1;

  lottieAnim.goToAndStop(progress * lastFrame, true);
}

/*
   Helper
*/

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}