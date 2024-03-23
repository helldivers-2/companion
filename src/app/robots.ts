import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
    return {
      rules: [
        {
            userAgent: '*',
            allow: '/',
            disallow: '/items/',
        },
      ],
      sitemap: 'https://helldivers.vercel.app/sitemap.xml',
      host: 'https://helldivers.vercel.app',
    };
  }