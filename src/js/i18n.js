// base.njk embeds this locale's script strings (eleventyComputed.js picks them); test/setup.js stubs the page for Node.
export const lang = document.documentElement.lang;
export const t = JSON.parse(document.getElementById("strings").textContent);
export const fill = (s, vars) => s.replace(/\{(\w+)\}/g, (_, k) => vars[k]);
