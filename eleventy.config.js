import worker from "./worker.js";

export default function (eleventyConfig) {
  // esbuild and sass write bundles straight into _site/assets; reload when they change
  eleventyConfig.setServerOptions({
    watch: ["_site/assets/**"],
    // Run the production Worker against the public API, which needs no Access token.
    onRequest: {
      "/api/*": ({ url }) => worker.fetch(new Request(url), { API_ORIGIN: "https://api.helldivers2.dev", ACCESS_CLIENT_ID: "", ACCESS_CLIENT_SECRET: "" }),
    },
  });
  eleventyConfig.addPassthroughCopy({
    "src/img": "img",
    "src/_redirects": "_redirects",
    "node_modules/@fontsource/barlow/files/barlow-latin-{400,600}-normal.woff*": "assets/files",
    "node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-{600,700}-normal.woff*": "assets/files",
  });

  return {
    dir: { input: "src", output: "_site" },
    templateFormats: ["njk", "html"],
    htmlTemplateEngine: "njk",
  };
}
