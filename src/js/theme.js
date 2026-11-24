// setTheme comes from the inline script in base.njk, which has already applied the saved choice.
// The choices appear twice (wide-screen dropdown and phone "More" menu), so both stay marked.
const items = document.querySelectorAll(".theme-choice [role=menuitem]");
const mark = (v) => items.forEach((b) => (b.ariaCurrent = b.value === v ? "true" : null));
mark(document.documentElement.dataset.theme);
for (const box of document.querySelectorAll(".theme-choice")) {
  box.addEventListener("click", (e) => {
    const b = e.target.closest("[role=menuitem]");
    if (!b) return;
    window.setTheme(b.value, true);
    mark(b.value);
    b.closest("[popover]").hidePopover();
  });
  box.hidden = false;
}
