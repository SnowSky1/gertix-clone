class BusinessAreasSnap {
  constructor(section) {
    this.section = section;
    this.sticky = section.querySelector(".business-areas__sticky");
    this.cards = [...section.querySelectorAll(".business-areas__card")];
    this.count = this.cards.length;

    if (this.count < 2) {
      return;
    }

    this.ticking = false;

    this.onScroll = this.onScroll.bind(this);
    this.onResize = this.onResize.bind(this);
    this.update = this.update.bind(this);

    window.addEventListener("scroll", this.onScroll, { passive: true });
    window.addEventListener("resize", this.onResize, { passive: true });

    this.resize();
    this.update();
  }

  viewportHeight() {
    return this.sticky
      ? this.sticky.getBoundingClientRect().height
      : window.innerHeight;
  }

  resize() {
    this.vh = this.viewportHeight();
    this.section.style.height = this.count * this.vh + "px";
  }

  onResize() {
    this.resize();
    this.update();
  }

  onScroll() {
    if (this.ticking) {
      return;
    }
    this.ticking = true;
    requestAnimationFrame(this.update);
  }

  update() {
    this.ticking = false;

    const top = this.section.getBoundingClientRect().top;
    const stickyTop = this.sticky ? this.sticky.getBoundingClientRect().top : 0;
    const scrolledIn = stickyTop - top;

    this.cards.forEach((card, i) => {
      if (i === 0) {
        return;
      }

      const start = (i - 1) * this.vh;
      const progress = Math.min(Math.max((scrolledIn - start) / this.vh, 0), 1);

      card.style.transform = `translateY(${(1 - progress) * 100}%)`;
    });
  }
}

document
  .querySelectorAll(".business-areas--snap")
  .forEach((el) => new BusinessAreasSnap(el));
