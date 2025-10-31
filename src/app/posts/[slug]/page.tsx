import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Tag, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { createTRPCContext } from '@/lib/trpc';
import { appRouter } from '@/server/routers/_app';
import { DeletePostButton } from '@/components/delete-post-button';

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const ctx = await createTRPCContext();
  const caller = appRouter.createCaller(ctx);

  try {
    const post = await caller.posts.getBySlug({ slug });

    if (!post) {
      notFound();
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                <ArrowLeft className="size-4" />
                Back to Home
              </Link>
              
              <div className="flex items-center gap-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  post.published 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {post.published ? 'Published' : 'Draft'}
                </div>
                
                <Link
                  href={`/admin/edit-post/${post.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
                >
                  <Edit size={16} />
                  Edit Post
                </Link>
                
                <DeletePostButton postId={post.id} postTitle={post.title} />
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            {/* Categories */}
            {post.categories.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {post.categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="inline-flex items-center gap-1 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm rounded-full transition-colors font-medium"
                  >
                    <Tag className="size-3" />
                    {category.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight text-gray-900">
              {post.title}
            </h1>

            {/* Meta information */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-12 pb-8 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Calendar className="size-5 text-gray-400" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Published on</span>
                  <time dateTime={post.createdAt.toISOString()} className="text-lg">
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                </div>
              </div>
              
              {post.updatedAt.getTime() !== post.createdAt.getTime() && (
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Last updated</span>
                    <time dateTime={post.updatedAt.toISOString()} className="text-sm">
                      {new Date(post.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <span className="text-sm">
                  {Math.ceil(post.content.split(' ').length / 200)} min read
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="pb-16 lg:pb-24">
          <div className="max-w-4xl mx-auto px-4">
            <article className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 lg:p-12">
              <div className="prose prose-lg prose-gray max-w-none">
                <div className="whitespace-pre-wrap text-lg leading-relaxed text-gray-800">
                  {post.content}
                </div>
              </div>
            </article>

            {/* Post Footer */}
            <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-2">
                  <h3 className="font-semibold text-gray-900">Post Details</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span>ID: #{post.id}</span>
                    <span>Slug: {post.slug}</span>
                    <span>Words: ~{post.content.split(' ').length}</span>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Link 
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                  >
                    <ArrowLeft className="size-4" />
                    All Articles
                  </Link>
                  
                  {post.categories.length > 0 && (
                    <Link 
                      href={`/categories/${post.categories[0].slug}`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                    >
                      <Tag className="size-4" />
                      More in {post.categories[0].name}
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Related Categories */}
            {post.categories.length > 1 && (
              <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h3 className="font-semibold text-gray-900 mb-4">Related Topics</h3>
                <div className="flex flex-wrap gap-3">
                  {post.categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/categories/${category.slug}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors"
                    >
                      <Tag className="size-4" />
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error('Error fetching post:', error);
    notFound();
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PostPageProps) {
  const { slug } = await params;
  const ctx = await createTRPCContext();
  const caller = appRouter.createCaller(ctx);

  try {
    const post = await caller.posts.getBySlug({ slug });
    
    if (!post) {
      return {
        title: 'Post Not Found',
      };
    }

    return {
      title: post.title,
      description: post.content.substring(0, 160) + '...',
      openGraph: {
        title: post.title,
        description: post.content.substring(0, 160) + '...',
        type: 'article',
        publishedTime: post.createdAt.toISOString(),
        modifiedTime: post.updatedAt.toISOString(),
        tags: post.categories.map(cat => cat.name),
      },
    };
  } catch (error) {
    return {
      title: 'Post Not Found',
    };
  }
}