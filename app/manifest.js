export default function manifest() {
    return {
      name: 'caidéiseach',
      short_name: 'caidéiseach',
      description: 'A Blog brimming with curiosity about languages and technology',
      start_url: '/',
      display: 'standalone',
      icons: [
        {
          src: '/profile.png',
          sizes: '32x32',
          type: 'image/png',
        },
          {
          src: '/profile.png',
          sizes: '16x16',
          type: 'image/png',
        },
            {
          src: '/profile.png',
          sizes: '192x192',
          type: 'image/png',
        },
            {
          src: '/profile.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    }
  }