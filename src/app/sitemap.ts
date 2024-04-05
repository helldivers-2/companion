export default async function sitemap() {
  let routes = ['', '/items', '/faq', '/shop', '/leaderboard', '/stratagems', '/stats', '/news'].map((route) => ({
    url: `https://www.helldiverscompanion.app${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }));

  return [...routes];
}