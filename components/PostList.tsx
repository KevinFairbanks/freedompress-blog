import React from 'react'
import { PostListProps } from '../src/types'
import PostCard from './PostCard'

const PostList: React.FC<PostListProps> = ({
  posts,
  loading = false,
  error,
  pagination,
  onLoadMore,
  className = ''
}) => {
  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {[...Array(3)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-red-500 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading posts</h3>
        <p className="text-gray-500">{error}</p>
      </div>
    )
  }

  if (!posts || posts.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
        <p className="text-gray-500">There are no blog posts to display.</p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid gap-6">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            showExcerpt={true}
            showAuthor={true}
            showDate={true}
            showCategories={true}
            showTags={true}
          />
        ))}
      </div>

      {pagination && (
        <div className="flex items-center justify-between pt-6">
          <div className="text-sm text-gray-500">
            Showing {pagination.page === 1 ? 1 : (pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} posts
          </div>

          <div className="flex items-center space-x-2">
            {pagination.hasPrev && (
              <button
                onClick={() => onLoadMore && onLoadMore()}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                Previous
              </button>
            )}

            <span className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            {pagination.hasNext && (
              <button
                onClick={() => onLoadMore && onLoadMore()}
                className="px-3 py-1 text-sm bg-primary-100 hover:bg-primary-200 text-primary-700 rounded transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PostList