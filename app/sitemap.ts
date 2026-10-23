import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://www.valhallastudio.com.mx',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://www.valhallastudio.com.mx/aviso-de-privacidad',
      lastModified: new Date('2026-10-21'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
