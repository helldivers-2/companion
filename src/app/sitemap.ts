export default async function sitemap() {
  let routes = ['', '/items', '/faq', '/map', '/shop', '/news', '/messages'].map((route) => ({
    url: `https://helldivers.vercel.app${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }));

  return [...routes];
}