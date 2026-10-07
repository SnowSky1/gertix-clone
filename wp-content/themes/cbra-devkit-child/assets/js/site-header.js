document.addEventListener("DOMContentLoaded", function () {
  const header = document.querySelector(".cb-site-header");
  const burger = document.querySelector(".cb-site-header__burger");

  if (!header || !burger) return;

  burger.addEventListener("click", function () {
    var isOpen = header.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", isOpen.toString());
    burger.setAttribute(
      "aria-label",
      isOpen
        ? burger.getAttribute("data-label-close")
        : burger.getAttribute("data-label-open")
    );
  });
});
