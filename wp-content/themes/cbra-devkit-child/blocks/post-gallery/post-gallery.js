document.addEventListener("DOMContentLoaded", () => {
  const swiperEl = document.querySelector(".cb-block--post-gallery .swiper");
  if(!swiperEl) {
    return;
  }

  const swiper = new Swiper(swiperEl, {
    slidesPerView: "auto",
    freeMode: { enabled: true, momentum: false },
    grabCursor: true,
    mousewheel: {
      enabled: true,
      forceToAxis: false,
      releaseOnEdges: true,
      sensitivity: 1,
    },
  });

  const wrapper = swiper.wrapperEl;
  const originalSlides = Array.from(wrapper.children);

  if(originalSlides.length === 0) {
    return;
  }

  originalSlides.forEach((slide) => wrapper.appendChild(slide.cloneNode(true)));
  swiper.update();

  const oneSetWidth = wrapper.children[originalSlides.length].offsetLeft;

  let isPaused = false;
  swiper.el.addEventListener("mouseenter", () => { isPaused = true; });
  swiper.el.addEventListener("mouseleave", () => { isPaused = false; });
  swiper.on("touchStart", () => { isPaused = true; });
  swiper.on("touchEnd", () => { isPaused = false; });

  const pixelsPerSecond = 40;
  let lastTimestamp = null;

  function autoScroll(timestamp) {
    if(lastTimestamp === null) {
      lastTimestamp = timestamp;
    }
    const elapsed = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    let translate = swiper.translate;

    if(!isPaused) {
      translate -= (pixelsPerSecond * elapsed) / 1000;
    }

    translate %= oneSetWidth;
    if(translate > 0) {
      translate -= oneSetWidth;
    }

    swiper.setTranslate(translate);
    requestAnimationFrame(autoScroll);
  }

  requestAnimationFrame(autoScroll);
});
