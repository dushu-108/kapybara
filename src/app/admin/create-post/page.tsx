'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc-client';
import Link from 'next/link';
import { ArrowLeft, Save, Eye } from 'lucide-react';

export default function CreatePostPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  // Fetch categories for selection
  const { data: categories } = trpc.categories.getAll.useQuery();

  // Create post mutation
  const createPost = trpc.posts.create.useMutation({
    onSuccess: (data) => {
      router.push(`/posts/${data.slug}`);
    },
    onError: (error) => {
      alert('Error creating post: ' + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    createPost.mutate({
      title: title.trim(),
      content: content.trim(),
      published,
      categoryIds: selectedCategories,
    });
  };

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
                Back to Blog
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-2xl font-bold text-gray-900">Create New Post</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPublished(!published)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  published 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Eye size={16} />
                {published ? 'Published' : 'Draft'}
              </button>
              
              <button
                type="submit"
                form="create-post-form"
                disabled={createPost.isPending}
                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
              >
                <Save size={16} />
                {createPost.isPending ? 'Saving...' : 'Save Post'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <form id="create-post-form" onSubmit={handleSubmit} className="space-y-8">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Post Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your post title..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              required
            />
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Post Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content here..."
              rows={12}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
              required
            />
          </div>

          {/* Categories */}
          {categories && categories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategories.includes(category.id)
                        ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                        : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Select categories for your post (optional)
              </p>
            </div>
          )}

          {/* Preview */}
          {(title || content) && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
              <div className="prose max-w-none">
                {title && (
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
                )}
                {content && (
                  <div className="text-gray-700 whitespace-pre-wrap">{content}</div>
                )}
                {selectedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                    {selectedCategories.map((categoryId) => {
                      const category = categories?.find(c => c.id === categoryId);
                      return category ? (
                        <span
                          key={category.id}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {category.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}