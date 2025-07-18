import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { prisma } from '@freedompress/core'
import { createApiHandler, successResponse, errorResponse } from '@freedompress/core'
import { PostCreateInput, PostUpdateInput, PostQuery, BlogApiResponse, PaginatedResponse, Post } from '../src/types'
import { generateSlug, generateExcerpt, validatePostData } from '../src/utils'
import { withSecurity } from '../src/middleware/security'

// GET /api/blog/posts - Get all posts with pagination and filtering
async function getPosts(req: NextApiRequest, res: NextApiResponse) {
  // Apply security middleware
  const securityPassed = await withSecurity(req, res, {
    rateLimit: { maxRequests: 100 },
    csrf: false, // GET requests don't need CSRF protection
    sanitizeInput: true,
    validateIP: true,
    setHeaders: true
  })
  
  if (!securityPassed) {
    return // Security middleware already sent the response
  }

  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      tag,
      author,
      published,
      featured,
      sortBy = 'publishedAt',
      sortOrder = 'desc'
    } = req.query as PostQuery

    // Validate and sanitize pagination parameters
    const pageNum = Math.max(1, parseInt(page as string) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10))
    const skip = (pageNum - 1) * limitNum

    // Build where clause
    const where: any = {}
    
    if (published !== undefined) {
      where.published = published === 'true'
    }
    
    if (featured !== undefined) {
      where.featured = featured === 'true'
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { content: { contains: search as string, mode: 'insensitive' } },
        { excerpt: { contains: search as string, mode: 'insensitive' } }
      ]
    }
    
    if (category) {
      where.categories = {
        some: {
          category: {
            slug: category as string
          }
        }
      }
    }
    
    if (tag) {
      where.tags = {
        some: {
          tag: {
            slug: tag as string
          }
        }
      }
    }
    
    if (author) {
      where.author = {
        id: author as string
      }
    }

    // Build order clause with SQL injection protection
    const allowedSortFields = ['publishedAt', 'createdAt', 'updatedAt', 'title', 'views', 'likes']
    const allowedSortOrders = ['asc', 'desc']
    
    const safeSortBy = allowedSortFields.includes(sortBy as string) ? sortBy as string : 'publishedAt'
    const safeSortOrder = allowedSortOrders.includes(sortOrder as string) ? sortOrder as string : 'desc'
    
    const orderBy: any = {}
    orderBy[safeSortBy] = safeSortOrder

    // Get posts with relations
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              displayName: true
            }
          },
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  color: true
                }
              }
            }
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  color: true
                }
              }
            }
          },
          _count: {
            select: {
              comments: true
            }
          }
        },
        orderBy,
        skip,
        take: limitNum
      }),
      prisma.post.count({ where })
    ])

    const totalPages = Math.ceil(total / limitNum)

    const response: BlogApiResponse<PaginatedResponse<Post>> = {
      success: true,
      data: {
        data: posts as Post[],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      }
    }

    return successResponse(res, response.data)
  } catch (error) {
    // Log error securely without exposing sensitive data
    console.error('Error fetching posts:', {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    })
    return errorResponse(res, 'Failed to fetch posts', 500)
  }
}

// POST /api/blog/posts - Create a new post
async function createPost(req: NextApiRequest, res: NextApiResponse) {
  // Apply security middleware with CSRF protection
  const securityPassed = await withSecurity(req, res, {
    rateLimit: { maxRequests: 20 }, // Stricter rate limit for POST requests
    csrf: true, // POST requests need CSRF protection
    sanitizeInput: true,
    validateIP: true,
    setHeaders: true
  })
  
  if (!securityPassed) {
    return // Security middleware already sent the response
  }

  try {
    const session = await getSession({ req })
    if (!session?.user) {
      return errorResponse(res, 'Unauthorized', 401)
    }

    const postData = req.body as PostCreateInput
    
    // Validate input
    const validation = validatePostData(postData)
    if (!validation.valid) {
      return errorResponse(res, 'Invalid post data', 400, validation.errors)
    }

    // Generate slug if not provided
    const slug = postData.slug || generateSlug(postData.title)
    
    // Check if slug already exists
    const existingPost = await prisma.post.findUnique({
      where: { slug }
    })
    
    if (existingPost) {
      return errorResponse(res, 'Post with this slug already exists', 400)
    }

    // Generate excerpt if not provided
    const excerpt = postData.excerpt || generateExcerpt(postData.content)

    // Create post
    const post = await prisma.post.create({
      data: {
        title: postData.title,
        slug,
        content: postData.content,
        excerpt,
        published: postData.published || false,
        featured: postData.featured || false,
        metaTitle: postData.metaTitle,
        metaDescription: postData.metaDescription,
        metaKeywords: postData.metaKeywords,
        featuredImage: postData.featuredImage,
        featuredImageAlt: postData.featuredImageAlt,
        publishedAt: postData.published ? new Date() : null,
        authorId: session.user.id,
        categories: {
          create: postData.categories?.map(categoryId => ({
            categoryId
          })) || []
        },
        tags: {
          create: postData.tags?.map(tagId => ({
            tagId
          })) || []
        }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            displayName: true
          }
        },
        categories: {
          include: {
            category: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    const response: BlogApiResponse<Post> = {
      success: true,
      data: post as Post,
      message: 'Post created successfully'
    }

    return successResponse(res, response.data, 201)
  } catch (error) {
    // Log error securely without exposing sensitive data
    console.error('Error creating post:', {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    })
    return errorResponse(res, 'Failed to create post', 500)
  }
}

// PUT /api/blog/posts/[id] - Update a post
async function updatePost(req: NextApiRequest, res: NextApiResponse) {
  // Apply security middleware with CSRF protection
  const securityPassed = await withSecurity(req, res, {
    rateLimit: { maxRequests: 20 }, // Stricter rate limit for PUT requests
    csrf: true, // PUT requests need CSRF protection
    sanitizeInput: true,
    validateIP: true,
    setHeaders: true
  })
  
  if (!securityPassed) {
    return // Security middleware already sent the response
  }

  try {
    const session = await getSession({ req })
    if (!session?.user) {
      return errorResponse(res, 'Unauthorized', 401)
    }

    const { id } = req.query
    const postData = req.body as PostUpdateInput

    // Check if post exists and user has permission
    const existingPost = await prisma.post.findUnique({
      where: { id: id as string },
      include: { author: true }
    })

    if (!existingPost) {
      return errorResponse(res, 'Post not found', 404)
    }

    // Check permission - only author or admin can update
    // Get user from database to verify role (don't trust client session)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true }
    })

    if (!user) {
      return errorResponse(res, 'Unauthorized', 401)
    }

    if (existingPost.authorId !== user.id && user.role !== 'admin') {
      return errorResponse(res, 'Forbidden', 403)
    }

    // Validate input
    const validation = validatePostData(postData)
    if (!validation.valid) {
      return errorResponse(res, 'Invalid post data', 400, validation.errors)
    }

    // Generate slug if title changed
    let slug = existingPost.slug
    if (postData.title && postData.title !== existingPost.title) {
      slug = generateSlug(postData.title)
      
      // Check if new slug already exists
      const slugExists = await prisma.post.findUnique({
        where: { slug, NOT: { id: id as string } }
      })
      
      if (slugExists) {
        return errorResponse(res, 'Post with this slug already exists', 400)
      }
    }

    // Generate excerpt if content changed
    let excerpt = existingPost.excerpt
    if (postData.content && postData.content !== existingPost.content) {
      excerpt = postData.excerpt || generateExcerpt(postData.content)
    }

    // Update post
    const updatedPost = await prisma.post.update({
      where: { id: id as string },
      data: {
        title: postData.title,
        slug,
        content: postData.content,
        excerpt,
        published: postData.published,
        featured: postData.featured,
        metaTitle: postData.metaTitle,
        metaDescription: postData.metaDescription,
        metaKeywords: postData.metaKeywords,
        featuredImage: postData.featuredImage,
        featuredImageAlt: postData.featuredImageAlt,
        publishedAt: postData.published && !existingPost.published ? new Date() : undefined,
        categories: postData.categories ? {
          deleteMany: {},
          create: postData.categories.map(categoryId => ({
            categoryId
          }))
        } : undefined,
        tags: postData.tags ? {
          deleteMany: {},
          create: postData.tags.map(tagId => ({
            tagId
          }))
        } : undefined
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            displayName: true
          }
        },
        categories: {
          include: {
            category: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    const response: BlogApiResponse<Post> = {
      success: true,
      data: updatedPost as Post,
      message: 'Post updated successfully'
    }

    return successResponse(res, response.data)
  } catch (error) {
    // Log error securely without exposing sensitive data
    console.error('Error updating post:', {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    })
    return errorResponse(res, 'Failed to update post', 500)
  }
}

// DELETE /api/blog/posts/[id] - Delete a post
async function deletePost(req: NextApiRequest, res: NextApiResponse) {
  // Apply security middleware with CSRF protection
  const securityPassed = await withSecurity(req, res, {
    rateLimit: { maxRequests: 10 }, // Very strict rate limit for DELETE requests
    csrf: true, // DELETE requests need CSRF protection
    sanitizeInput: true,
    validateIP: true,
    setHeaders: true
  })
  
  if (!securityPassed) {
    return // Security middleware already sent the response
  }

  try {
    const session = await getSession({ req })
    if (!session?.user) {
      return errorResponse(res, 'Unauthorized', 401)
    }

    const { id } = req.query

    // Check if post exists and user has permission
    const existingPost = await prisma.post.findUnique({
      where: { id: id as string },
      include: { author: true }
    })

    if (!existingPost) {
      return errorResponse(res, 'Post not found', 404)
    }

    // Check permission - only author or admin can delete
    // Get user from database to verify role (don't trust client session)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true }
    })

    if (!user) {
      return errorResponse(res, 'Unauthorized', 401)
    }

    if (existingPost.authorId !== user.id && user.role !== 'admin') {
      return errorResponse(res, 'Forbidden', 403)
    }

    // Delete post (cascade will handle related data)
    await prisma.post.delete({
      where: { id: id as string }
    })

    const response: BlogApiResponse = {
      success: true,
      message: 'Post deleted successfully'
    }

    return successResponse(res, response)
  } catch (error) {
    // Log error securely without exposing sensitive data
    console.error('Error deleting post:', {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    })
    return errorResponse(res, 'Failed to delete post', 500)
  }
}

// GET /api/blog/posts/[slug] - Get single post by slug
async function getPostBySlug(req: NextApiRequest, res: NextApiResponse) {
  // Apply security middleware
  const securityPassed = await withSecurity(req, res, {
    rateLimit: { maxRequests: 200 }, // Higher rate limit for individual post views
    csrf: false, // GET requests don't need CSRF protection
    sanitizeInput: true,
    validateIP: true,
    setHeaders: true
  })
  
  if (!securityPassed) {
    return // Security middleware already sent the response
  }

  try {
    const { slug } = req.query

    const post = await prisma.post.findUnique({
      where: { slug: slug as string },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            displayName: true,
            bio: true,
            website: true,
            socialLinks: true
          }
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
                description: true
              }
            }
          }
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true
              }
            }
          }
        },
        comments: {
          where: { approved: true },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                displayName: true
              }
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    displayName: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!post) {
      return errorResponse(res, 'Post not found', 404)
    }

    // Only show published posts to non-authors
    const session = await getSession({ req })
    if (!post.published) {
      if (!session?.user) {
        return errorResponse(res, 'Post not found', 404)
      }
      
      // Get user from database to verify role (don't trust client session)
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, role: true }
      })

      if (!user || (user.id !== post.authorId && user.role !== 'admin')) {
        return errorResponse(res, 'Post not found', 404)
      }
    }

    // Increment view count
    await prisma.post.update({
      where: { id: post.id },
      data: { views: { increment: 1 } }
    })

    const response: BlogApiResponse<Post> = {
      success: true,
      data: post as Post
    }

    return successResponse(res, response.data)
  } catch (error) {
    // Log error securely without exposing sensitive data
    console.error('Error fetching post:', {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    })
    return errorResponse(res, 'Failed to fetch post', 500)
  }
}

// Main API handler
export default createApiHandler({
  GET: getPosts,
  POST: createPost
})

// Export individual handlers for dynamic routes
export {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  getPostBySlug
}