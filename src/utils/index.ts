import slugify from 'slugify'
import { format } from 'date-fns'
import { PostCreateInput, PostUpdateInput } from '../types'

// Slug generation
export function generateSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  })
}

// Excerpt generation
export function generateExcerpt(content: string, maxLength: number = 150): string {
  // Remove HTML tags and markdown
  const plainText = content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Remove markdown links
    .replace(/[#*_`~]/g, '') // Remove markdown formatting
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()

  if (plainText.length <= maxLength) {
    return plainText
  }

  // Find the last complete word within the limit
  const truncated = plainText.substring(0, maxLength)
  const lastSpaceIndex = truncated.lastIndexOf(' ')
  
  if (lastSpaceIndex > 0) {
    return truncated.substring(0, lastSpaceIndex) + '...'
  }
  
  return truncated + '...'
}

// Calculate reading time
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  const readingTime = Math.ceil(words / wordsPerMinute)
  return readingTime
}

// Format date
export function formatDate(date: Date | string, dateFormat: string = 'MMM dd, yyyy'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, dateFormat)
}

// Format relative date
export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInMs = now.getTime() - dateObj.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInMinutes < 1) {
    return 'just now'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  } else {
    return formatDate(date, 'MMM dd, yyyy')
  }
}

// Validate post data
export function validatePostData(data: PostCreateInput | PostUpdateInput): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Required fields
  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required')
  }

  if (!data.content || data.content.trim().length === 0) {
    errors.push('Content is required')
  }

  // Validate title length
  if (data.title && data.title.length > 200) {
    errors.push('Title must be less than 200 characters')
  }

  // Validate excerpt length
  if (data.excerpt && data.excerpt.length > 500) {
    errors.push('Excerpt must be less than 500 characters')
  }

  // Validate meta fields
  if (data.metaTitle && data.metaTitle.length > 60) {
    errors.push('Meta title must be less than 60 characters')
  }

  if (data.metaDescription && data.metaDescription.length > 160) {
    errors.push('Meta description must be less than 160 characters')
  }

  // Validate URLs
  if (data.featuredImage && !isValidUrl(data.featuredImage)) {
    errors.push('Featured image must be a valid URL')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// URL validation
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Search helper
export function highlightSearchTerms(text: string, searchTerm: string): string {
  if (!searchTerm) return text
  
  const regex = new RegExp(`(${searchTerm})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

// Category color generator
export function generateCategoryColor(): string {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// Tag color generator
export function generateTagColor(): string {
  const colors = [
    '#fecaca', '#fed7aa', '#fef3c7', '#fde68a', '#d9f99d',
    '#bbf7d0', '#a7f3d0', '#99f6e4', '#a5f3fc', '#bfdbfe',
    '#c7d2fe', '#ddd6fe', '#e9d5ff', '#f3e8ff', '#fce7f3',
    '#fda4af', '#fecdd3'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// Content processing
export function processContent(content: string): string {
  // Process markdown-like syntax
  let processed = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
    .replace(/`(.*?)`/g, '<code>$1</code>') // Inline code
    .replace(/\n\n/g, '</p><p>') // Paragraphs
    .replace(/\n/g, '<br>') // Line breaks

  // Wrap in paragraph tags
  processed = '<p>' + processed + '</p>'

  // Clean up empty paragraphs
  processed = processed.replace(/<p><\/p>/g, '')

  return processed
}

// SEO helpers
export function generateMetaDescription(content: string, maxLength: number = 160): string {
  const excerpt = generateExcerpt(content, maxLength)
  return excerpt.replace(/\.\.\.$/, '').trim()
}

export function generateMetaKeywords(title: string, content: string, categories: string[] = [], tags: string[] = []): string {
  const words = [
    ...title.toLowerCase().split(' '),
    ...content.toLowerCase().split(' ').slice(0, 100), // First 100 words
    ...categories.map(c => c.toLowerCase()),
    ...tags.map(t => t.toLowerCase())
  ]

  // Filter out common words and get unique keywords
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'among', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can', 'may', 'might', 'must', 'shall', 'this', 'that', 'these', 'those', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves']

  const keywords = words
    .filter(word => word.length > 2 && !stopWords.includes(word))
    .filter((word, index, arr) => arr.indexOf(word) === index) // Remove duplicates
    .slice(0, 10) // Take top 10

  return keywords.join(', ')
}

// Pagination helpers
export function getPaginationInfo(page: number, limit: number, total: number) {
  const totalPages = Math.ceil(total / limit)
  const hasNext = page < totalPages
  const hasPrev = page > 1

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext,
    hasPrev,
    startIndex: (page - 1) * limit + 1,
    endIndex: Math.min(page * limit, total)
  }
}

// Social sharing URLs
export function generateSocialShareUrls(post: { title: string; slug: string }, baseUrl: string) {
  const url = `${baseUrl}/blog/${post.slug}`
  const title = encodeURIComponent(post.title)
  const encodedUrl = encodeURIComponent(url)

  return {
    twitter: `https://twitter.com/intent/tweet?text=${title}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    reddit: `https://www.reddit.com/submit?url=${encodedUrl}&title=${title}`,
    email: `mailto:?subject=${title}&body=${encodedUrl}`
  }
}

// RSS feed helpers
export function generateRSSItem(post: any, baseUrl: string) {
  const url = `${baseUrl}/blog/${post.slug}`
  const pubDate = post.publishedAt ? new Date(post.publishedAt).toUTCString() : new Date(post.createdAt).toUTCString()

  return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${url}</link>
      <guid>${url}</guid>
      <description><![CDATA[${post.excerpt || generateExcerpt(post.content)}]]></description>
      <pubDate>${pubDate}</pubDate>
      <author><![CDATA[${post.author.name || post.author.email}]]></author>
      ${post.categories?.map((cat: any) => `<category><![CDATA[${cat.category.name}]]></category>`).join('') || ''}
    </item>
  `
}

// Sitemap helpers
export function generateSiteMapEntry(post: any, baseUrl: string) {
  const url = `${baseUrl}/blog/${post.slug}`
  const lastmod = post.updatedAt ? new Date(post.updatedAt).toISOString() : new Date(post.createdAt).toISOString()

  return `
    <url>
      <loc>${url}</loc>
      <lastmod>${lastmod}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.8</priority>
    </url>
  `
}

// Export all functions
export {
  slugify,
  format
}