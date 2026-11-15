export default function (eleventyConfig) {
  // webpack writes bundles straight into _site/assets; reload when they change
  eleventyConfig.setServerOptions({ watch: ["_site/assets/**"] });
  eleventyConfig.addWatchTarget("src/_data/");

  return {
    dir: { input: "src", output: "_site" },
    templateFormats: ["njk", "html"],
    htmlTemplateEngine: "njk",
  };
}
