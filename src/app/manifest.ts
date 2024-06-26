import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Helldivers Companion',
    short_name: 'Companion',
    description: 'Stay updated on the Helldivers 2 war.',
    categories: ['games', 'news', 'technology'],
    start_url: '/',
    display: 'standalone',
    background_color: '#0c0a09',
    theme_color: '#0c0a09',
    icons: [
      {
        src: '/icons/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    shortcuts: [
        {
          name: 'current Status',
          url: '/',
          description: 'See the current status of the game.',
        },
        {
          name: 'all Items',
          url: '/items',
          description: 'A database of all items.',
        },
        {
          name: 'FAQ',
          url: '/faq',
          description: 'See frequently asked questions.',
        },
      ],
  }
}