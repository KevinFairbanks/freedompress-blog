// Blog Post Types
export interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  published: boolean
  featured: boolean
  views: number
  likes: number
  
  // SEO
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
  
  // Media
  featuredImage?: string
  featuredImageAlt?: string
  
  // Publishing
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
  
  // Relations
  authorId: string
  author: User
  categories: PostCategory[]
  tags: PostTag[]
  comments: Comment[]
}

export interface PostCreateInput {
  title: string
  content: string
  excerpt?: string
  published?: boolean
  featured?: boolean
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
  featuredImage?: string
  featuredImageAlt?: string
  publishedAt?: Date
  categories?: string[]
  tags?: string[]
}

export interface PostUpdateInput extends Partial<PostCreateInput> {
  id: string
}

// Category Types
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
  
  // SEO
  metaTitle?: string
  metaDescription?: string
  
  // Media
  image?: string
  imageAlt?: string
  
  // Hierarchy
  parentId?: string
  parent?: Category
  children: Category[]
  
  createdAt: Date
  updatedAt: Date
  
  // Relations
  posts: PostCategory[]
}

export interface CategoryCreateInput {
  name: string
  description?: string
  color?: string
  metaTitle?: string
  metaDescription?: string
  image?: string
  imageAlt?: string
  parentId?: string
}

export interface CategoryUpdateInput extends Partial<CategoryCreateInput> {
  id: string
}

// Tag Types
export interface Tag {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
  
  createdAt: Date
  updatedAt: Date
  
  // Relations
  posts: PostTag[]
}

export interface TagCreateInput {
  name: string
  description?: string
  color?: string
}

export interface TagUpdateInput extends Partial<TagCreateInput> {
  id: string
}

// Comment Types
export interface Comment {
  id: string
  content: string
  approved: boolean
  
  // User info (for guest comments)
  authorName?: string
  authorEmail?: string
  authorUrl?: string
  
  // Reply system
  parentId?: string
  parent?: Comment
  replies: Comment[]
  
  createdAt: Date
  updatedAt: Date
  
  // Relations
  postId: string
  post: Post
  userId?: string
  user?: User
}

export interface CommentCreateInput {
  content: string
  postId: string
  parentId?: string
  authorName?: string
  authorEmail?: string
  authorUrl?: string
}

export interface CommentUpdateInput extends Partial<CommentCreateInput> {
  id: string
  approved?: boolean
}

// Junction Types
export interface PostCategory {
  postId: string
  categoryId: string
  post: Post
  category: Category
}

export interface PostTag {
  postId: string
  tagId: string
  post: Post
  tag: Tag
}

// User Types (extends core User)
export interface User {
  id: string
  name?: string
  email: string
  emailVerified?: Date
  image?: string
  bio?: string
  
  // Blog-specific fields
  displayName?: string
  website?: string
  socialLinks?: Record<string, string>
  
  // Permissions
  role: string
  canPublish: boolean
  canModerate: boolean
  
  createdAt: Date
  updatedAt: Date
  
  // Relations
  posts: Post[]
  comments: Comment[]
}

// API Response Types
export interface BlogApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: string[]
}

export interface PaginatedResponse<T = any> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Query Types
export interface PostQuery {
  page?: number
  limit?: number
  search?: string
  category?: string
  tag?: string
  author?: string
  published?: boolean
  featured?: boolean
  sortBy?: 'title' | 'createdAt' | 'publishedAt' | 'views' | 'likes'
  sortOrder?: 'asc' | 'desc'
}

export interface CategoryQuery {
  page?: number
  limit?: number
  search?: string
  parent?: string
  sortBy?: 'name' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface TagQuery {
  page?: number
  limit?: number
  search?: string
  sortBy?: 'name' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface CommentQuery {
  page?: number
  limit?: number
  postId?: string
  approved?: boolean
  sortBy?: 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

// Component Props Types
export interface PostListProps {
  posts: Post[]
  loading?: boolean
  error?: string
  pagination?: PaginatedResponse<Post>['pagination']
  onLoadMore?: () => void
}

export interface PostCardProps {
  post: Post
  showExcerpt?: boolean
  showAuthor?: boolean
  showDate?: boolean
  showCategories?: boolean
  showTags?: boolean
  className?: string
}

export interface PostEditorProps {
  post?: Post
  onSave: (post: PostCreateInput | PostUpdateInput) => void
  onCancel: () => void
  loading?: boolean
  error?: string
}

export interface CategoryListProps {
  categories: Category[]
  loading?: boolean
  error?: string
  onCategorySelect?: (category: Category) => void
}

export interface TagCloudProps {
  tags: Tag[]
  loading?: boolean
  error?: string
  onTagSelect?: (tag: Tag) => void
  maxTags?: number
  className?: string
}

// Hook Types
export interface UsePostsOptions {
  query?: PostQuery
  enabled?: boolean
  onError?: (error: Error) => void
}

export interface UseCategoriesOptions {
  query?: CategoryQuery
  enabled?: boolean
  onError?: (error: Error) => void
}

export interface UseTagsOptions {
  query?: TagQuery
  enabled?: boolean
  onError?: (error: Error) => void
}

export interface UseCommentsOptions {
  query?: CommentQuery
  enabled?: boolean
  onError?: (error: Error) => void
}

// Blog Configuration Types
export interface BlogConfig {
  postsPerPage: number
  allowComments: boolean
  moderateComments: boolean
  seoEnabled: boolean
  featuredImageRequired: boolean
  maxExcerptLength: number
  dateFormat: string
  enableRSS: boolean
  enableSitemap: boolean
  enableSocialSharing: boolean
}

// SEO Types
export interface BlogSEO {
  title?: string
  description?: string
  keywords?: string
  image?: string
  type?: 'article' | 'blog' | 'website'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  tags?: string[]
}