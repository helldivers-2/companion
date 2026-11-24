// setTheme comes from the inline script in base.njk, which has already applied the saved choice.
const box = document.getElementById("theme");
const items = box.querySelectorAll("[role=menuitem]");
const mark = (v) => items.forEach((b) => (b.ariaCurrent = b.value === v ? "true" : null));
mark(document.documentElement.dataset.theme);
box.addEventListener("click", (e) => {
  const b = e.target.closest("[role=menuitem]");
  if (!b) return;
  window.setTheme(b.value, true);
  mark(b.value);
  box.querySelector("[popover]").hidePopover();
});
box.hidden = false;
