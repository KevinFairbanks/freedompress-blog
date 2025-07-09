# @freedompress/blog

A complete blog module for FreedomPress - Modern CMS with comprehensive content management features.

## Features

- ✅ **Content Management**: Rich text posts with markdown support
- ✅ **Categories & Tags**: Organize content with hierarchical categories and tags
- ✅ **Comments System**: Nested comments with moderation
- ✅ **SEO Optimized**: Built-in meta tags, sitemap, and RSS feed
- ✅ **Author Management**: Multi-author support with profiles
- ✅ **Media Support**: Featured images and media management
- ✅ **Search & Filtering**: Full-text search with advanced filtering
- ✅ **Responsive Design**: Mobile-first design with Tailwind CSS
- ✅ **Analytics Ready**: Built-in view tracking and metrics

## Installation

```bash
npm install @freedompress/blog @freedompress/core
```

## Quick Start

1. **Install the module**:
   ```bash
   npm install @freedompress/blog
   ```

2. **Add to your FreedomPress project**:
   ```javascript
   import { blogModule } from '@freedompress/blog'
   
   // Register the module
   await blogModule.install(context)
   await blogModule.activate(context)
   ```

3. **Use components in your app**:
   ```jsx
   import { PostList, PostCard } from '@freedompress/blog'
   
   function BlogPage() {
     return (
       <div>
         <h1>Blog</h1>
         <PostList posts={posts} />
       </div>
     )
   }
   ```

## API Routes

The blog module provides the following API endpoints:

- `GET /api/blog/posts` - Get all posts with pagination
- `POST /api/blog/posts` - Create a new post
- `GET /api/blog/posts/[slug]` - Get a specific post
- `PUT /api/blog/posts/[id]` - Update a post
- `DELETE /api/blog/posts/[id]` - Delete a post
- `GET /api/blog/categories` - Get all categories
- `GET /api/blog/tags` - Get all tags
- `GET /api/blog/comments` - Get comments for a post

## Components

### PostList
Display a list of blog posts with pagination.

```jsx
import { PostList } from '@freedompress/blog'

<PostList 
  posts={posts}
  pagination={pagination}
  onLoadMore={handleLoadMore}
/>
```

### PostCard
Display a single blog post in card format.

```jsx
import { PostCard } from '@freedompress/blog'

<PostCard 
  post={post}
  showExcerpt={true}
  showAuthor={true}
  showCategories={true}
/>
```

## Hooks

### usePosts
Hook for fetching and managing blog posts.

```jsx
import { usePosts } from '@freedompress/blog'

function BlogPage() {
  const { posts, loading, error } = usePosts({
    query: { published: true, limit: 10 }
  })
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  
  return <PostList posts={posts} />
}
```

### useCategories
Hook for fetching and managing blog categories.

```jsx
import { useCategories } from '@freedompress/blog'

function CategorySidebar() {
  const { categories, loading } = useCategories()
  
  return (
    <div>
      {categories.map(category => (
        <Link key={category.id} href={`/blog/category/${category.slug}`}>
          {category.name}
        </Link>
      ))}
    </div>
  )
}
```

## Configuration

The blog module can be configured with the following options:

```javascript
{
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
```

## Database Schema

The blog module uses the following database tables:

- `posts` - Blog posts with content and metadata
- `categories` - Hierarchical categories
- `tags` - Post tags
- `comments` - Nested comments system
- `post_categories` - Post to category relationships
- `post_tags` - Post to tag relationships

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support, please visit our [GitHub Issues](https://github.com/KevinFairbanks/freedompress-blog/issues) page.