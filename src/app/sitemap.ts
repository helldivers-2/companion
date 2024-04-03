export default async function sitemap() {
  let routes = ['', '/items', '/faq', '/shop', '/leaderboard', '/stratagems'].map((route) => ({
    url: `https://helldiverscompanion.app${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }));

  return [...routes];
}