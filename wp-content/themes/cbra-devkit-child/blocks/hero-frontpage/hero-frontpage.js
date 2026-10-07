document.addEventListener("DOMContentLoaded", function () {
  const hero = document.querySelector(
    "#content > .cb-block--hero-frontpage:first-child"
  );
  if (!hero) return;

  const header = document.querySelector(".cb-site-header");
  if (!header) return;

  function onScroll() {
    // header.classList.toggle('is-scrolled', window.scrollY > hero.offsetHeight);
    header.classList.toggle("is-scrolled", window.scrollY > 32);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
});
