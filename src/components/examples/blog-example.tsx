'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc-client';

export function BlogExample() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryName, setCategoryName] = useState('');

  // tRPC queries with automatic type inference
  const { data: posts, refetch: refetchPosts } = trpc.posts.getAll.useQuery({
    published: true,
    limit: 10,
  });

  const { data: categories, refetch: refetchCategories } = trpc.categories.getAll.useQuery();

  // tRPC mutations with automatic type inference
  const createPost = trpc.posts.create.useMutation({
    onSuccess: () => {
      refetchPosts();
      setTitle('');
      setContent('');
    },
  });

  const createCategory = trpc.categories.create.useMutation({
    onSuccess: () => {
      refetchCategories();
      setCategoryName('');
    },
  });

  const deletePost = trpc.posts.delete.useMutation({
    onSuccess: () => {
      refetchPosts();
    },
  });

  const handleCreatePost = () => {
    if (title && content) {
      createPost.mutate({
        title,
        content,
        published: true,
        categoryIds: [], // You can add category selection logic here
      });
    }
  };

  const handleCreateCategory = () => {
    if (categoryName) {
      createCategory.mutate({
        name: categoryName,
        description: `Description for ${categoryName}`,
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Blog Management Example</h1>

      {/* Create Category */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Create Category</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Category name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="flex-1 px-3 py-2 border rounded"
          />
          <button
            onClick={handleCreateCategory}
            disabled={createCategory.isPending}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {createCategory.isPending ? 'Creating...' : 'Create Category'}
          </button>
        </div>
      </div>

      {/* Create Post */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Create Post</h2>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
          <textarea
            placeholder="Post content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border rounded"
          />
          <button
            onClick={handleCreatePost}
            disabled={createPost.isPending}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {createPost.isPending ? 'Creating...' : 'Create Post'}
          </button>
        </div>
      </div>

      {/* Categories List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories?.map((category) => (
            <div key={category.id} className="bg-white p-4 border rounded-lg">
              <h3 className="font-semibold">{category.name}</h3>
              <p className="text-sm text-gray-600">Slug: {category.slug}</p>
              <p className="text-sm text-gray-500">
                Posts: {category.postCount || 0}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Posts List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Posts</h2>
        <div className="space-y-4">
          {posts?.map((post) => (
            <div key={post.id} className="bg-white p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{post.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">Slug: {post.slug}</p>
                  <p className="text-gray-700 mb-3">{post.content}</p>
                  <div className="flex flex-wrap gap-2">
                    {post.categories.map((category) => (
                      <span
                        key={category.id}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => deletePost.mutate({ id: post.id })}
                  disabled={deletePost.isPending}
                  className="ml-4 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}