export default async function sitemap() {
  let routes = ['', '/items', '/faq', '/shop', '/events',].map((route) => ({
    url: `https://helldivers.vercel.app${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }));

  return [...routes];
}