document.addEventListener("DOMContentLoaded", function () {
  const footer = document.querySelector(".cb-site-footer");

  if (!footer) return;

  footer.addEventListener("mousemove", function (event) {
    const rect = footer.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    footer.style.setProperty("--mouse-x", x + "%");
    footer.style.setProperty("--mouse-y", y + "%");
  });

  footer.addEventListener("mouseleave", function () {
    footer.style.setProperty("--mouse-x", "0%");
    footer.style.setProperty("--mouse-y", "0%");
  });
});
