export default function (eleventyConfig) {
  // esbuild and sass write bundles straight into _site/assets; reload when they change
  eleventyConfig.setServerOptions({ watch: ["_site/assets/**"] });
  eleventyConfig.addPassthroughCopy({
    "src/img": "img",
    "node_modules/@fontsource/barlow/files/barlow-latin-{400,600}-normal.woff*": "assets/files",
    "node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-{600,700}-normal.woff*": "assets/files",
  });

  return {
    dir: { input: "src", output: "_site" },
    templateFormats: ["njk", "html"],
    htmlTemplateEngine: "njk",
  };
}
