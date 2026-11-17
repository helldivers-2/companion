// setTheme comes from the inline script in base.njk, which has already applied the saved choice.
const box = document.getElementById("theme");
box.querySelector(`input[value="${document.documentElement.dataset.theme}"]`).checked = true;
box.addEventListener("change", (e) => window.setTheme(e.target.value, true));
box.hidden = false;
