'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc-client';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar } from 'lucide-react';
import { AdminNav } from '@/components/admin-nav';

export default function AdminPage() {
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Fetch all posts
  const { data: allPosts, refetch: refetchPosts } = trpc.posts.getAll.useQuery({
    limit: 100,
    offset: 0,
  });

  // Fetch categories for display
  const { data: categories } = trpc.categories.getAll.useQuery();

  // Update post mutation (for publish/unpublish)
  const updatePost = trpc.posts.update.useMutation({
    onSuccess: () => {
      refetchPosts();
    },
    onError: (error) => {
      alert('Error updating post: ' + error.message);
    },
  });

  // Delete post mutation
  const deletePost = trpc.posts.delete.useMutation({
    onSuccess: () => {
      refetchPosts();
    },
    onError: (error) => {
      alert('Error deleting post: ' + error.message);
    },
  });

  const handleTogglePublish = (postId: number, currentStatus: boolean) => {
    updatePost.mutate({
      id: postId,
      published: !currentStatus,
    });
  };

  const handleDeletePost = (postId: number, postTitle: string) => {
    if (confirm(`Are you sure you want to delete "${postTitle}"?`)) {
      deletePost.mutate({ id: postId });
    }
  };

  // Filter posts based on selected filter
  const filteredPosts = allPosts?.filter(post => {
    if (filter === 'published') return post.published;
    if (filter === 'draft') return !post.published;
    return true; // 'all'
  }) || [];

  const publishedCount = allPosts?.filter(post => post.published).length || 0;
  const draftCount = allPosts?.filter(post => !post.published).length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your blog posts and content</p>
            </div>
            
            <Link
              href="/admin/create-post"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <Plus size={20} />
              Create New Post
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Posts</p>
                <p className="text-3xl font-bold text-gray-900">{allPosts?.length || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Edit className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-3xl font-bold text-green-600">{publishedCount}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Drafts</p>
                <p className="text-3xl font-bold text-yellow-600">{draftCount}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <EyeOff className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'all', label: 'All Posts', count: allPosts?.length || 0 },
                { key: 'published', label: 'Published', count: publishedCount },
                { key: 'draft', label: 'Drafts', count: draftCount },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    filter === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>

          {/* Posts List */}
          <div className="p-6">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {filter === 'all' ? 'No posts yet' : 
                   filter === 'published' ? 'No published posts' : 'No drafts'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {filter === 'all' ? 'Create your first blog post to get started.' :
                   filter === 'published' ? 'Publish some drafts to see them here.' : 'All your posts are published!'}
                </p>
                <Link
                  href="/admin/create-post"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  <Plus size={16} />
                  Create Post
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <div key={post.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {post.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            post.published 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {post.published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {post.content.substring(0, 150)}...
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(post.createdAt).toLocaleDateString()}
                          </div>
                          <div>
                            Slug: {post.slug}
                          </div>
                          {post.categories && post.categories.length > 0 && (
                            <div className="flex gap-1">
                              {post.categories.slice(0, 2).map((category: any) => (
                                <span key={category.id} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                  {category.name}
                                </span>
                              ))}
                              {post.categories.length > 2 && (
                                <span className="text-xs text-gray-500">+{post.categories.length - 2} more</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleTogglePublish(post.id, post.published)}
                          disabled={updatePost.isPending}
                          className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                            post.published
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {post.published ? <EyeOff size={14} /> : <Eye size={14} />}
                          {updatePost.isPending ? 'Updating...' : (post.published ? 'Unpublish' : 'Publish')}
                        </button>
                        
                        <Link
                          href={`/admin/edit-post/${post.slug}`}
                          className="inline-flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded-lg font-medium text-sm transition-colors"
                        >
                          <Edit size={14} />
                          Edit
                        </Link>
                        
                        <button
                          onClick={() => handleDeletePost(post.id, post.title)}
                          disabled={deletePost.isPending}
                          className="inline-flex items-center gap-1 px-3 py-2 bg-red-100 text-red-800 hover:bg-red-200 rounded-lg font-medium text-sm transition-colors"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}