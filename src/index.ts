import { ModuleInterface } from '@freedompress/core'

// Blog Module Configuration
export const blogModule: ModuleInterface = {
  config: {
    name: 'blog',
    version: '1.0.0',
    description: 'Blog functionality for FreedomPress',
    author: 'FreedomPress Team',
    requires: {
      core: '^1.0.0'
    }
  },
  
  exports: {
    models: {
      Post: () => import('./models/Post'),
      Category: () => import('./models/Category'),
      Tag: () => import('./models/Tag')
    },
    api: {
      '/api/blog/posts': () => import('./api/posts'),
      '/api/blog/categories': () => import('./api/categories'),
      '/api/blog/tags': () => import('./api/tags')
    },
    pages: {
      '/blog': () => import('./pages/blog'),
      '/blog/[slug]': () => import('./pages/blog/[slug]'),
      '/blog/category/[slug]': () => import('./pages/blog/category/[slug]'),
      '/blog/tag/[slug]': () => import('./pages/blog/tag/[slug]')
    },
    components: {
      PostList: () => import('./components/PostList'),
      PostCard: () => import('./components/PostCard'),
      PostEditor: () => import('./components/PostEditor'),
      CategoryList: () => import('./components/CategoryList'),
      TagCloud: () => import('./components/TagCloud')
    },
    hooks: {
      usePosts: () => import('./hooks/usePosts'),
      useCategories: () => import('./hooks/useCategories'),
      useTags: () => import('./hooks/useTags')
    },
    utils: {
      slugify: () => import('./utils/slugify'),
      formatDate: () => import('./utils/formatDate'),
      generateExcerpt: () => import('./utils/generateExcerpt'),
      calculateReadingTime: () => import('./utils/calculateReadingTime')
    }
  },

  async install(context) {
    // Run database migrations for blog tables
    console.log('Installing blog module...')
    
    // Add blog-specific settings
    await context.prisma.setting.createMany({
      data: [
        { key: 'blog_posts_per_page', value: '10', category: 'blog' },
        { key: 'blog_allow_comments', value: 'true', category: 'blog' },
        { key: 'blog_moderate_comments', value: 'true', category: 'blog' },
        { key: 'blog_seo_enabled', value: 'true', category: 'blog' }
      ],
      skipDuplicates: true
    })
    
    console.log('Blog module installed successfully')
  },

  async activate(context) {
    console.log('Activating blog module...')
    
    // Register blog routes
    context.events.emit('module:routes:register', {
      module: 'blog',
      routes: Object.keys(this.exports.api || {})
    })
    
    // Register blog pages
    context.events.emit('module:pages:register', {
      module: 'blog',
      pages: Object.keys(this.exports.pages || {})
    })
    
    console.log('Blog module activated successfully')
  },

  async deactivate(context) {
    console.log('Deactivating blog module...')
    
    // Unregister routes and pages
    context.events.emit('module:routes:unregister', { module: 'blog' })
    context.events.emit('module:pages:unregister', { module: 'blog' })
    
    console.log('Blog module deactivated successfully')
  },

  getDefaultConfig() {
    return {
      postsPerPage: 10,
      allowComments: true,
      moderateComments: true,
      seoEnabled: true,
      featuredImageRequired: false,
      maxExcerptLength: 150,
      dateFormat: 'MMM dd, yyyy',
      enableRSS: true,
      enableSitemap: true,
      enableSocialSharing: true
    }
  },

  validateConfig(config) {
    const requiredFields = ['postsPerPage', 'allowComments']
    for (const field of requiredFields) {
      if (!(field in config)) {
        return false
      }
    }
    return true
  }
}

export default blogModule

// Export types for TypeScript support
export * from './types'
export * from './hooks'
export * from './utils'