import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://brosandbitez.vercel.app' // Updated to your Vercel domain

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/login', '/admin'], // Prevent indexing of private/admin areas
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
