import { createTRPCContext } from '@/lib/trpc';
import { appRouter } from '@/server/routers/_app';
import Link from 'next/link';
import { Calendar, Tag, ArrowLeft } from 'lucide-react';

export default async function PostsPage() {
  const ctx = await createTRPCContext();
  const caller = appRouter.createCaller(ctx);

  const posts = await caller.posts.getAll({
    published: true,
    limit: 50,
    offset: 0,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">All Posts</h1>
            <p className="text-xl text-muted-foreground mb-12">
              Browse all our published articles and insights.
            </p>

            {posts && posts.length > 0 ? (
              <div className="grid gap-8">
                {posts.map((post) => (
                  <article 
                    key={post.id}
                    className="bg-white rounded-lg border p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4" />
                        <time dateTime={post.createdAt.toISOString()}>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </time>
                      </div>
                      
                      {post.categories.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Tag className="size-4" />
                          <div className="flex gap-2">
                            {post.categories.slice(0, 2).map((category) => (
                              <span
                                key={category.id}
                                className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                              >
                                {category.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <h2 className="text-2xl font-bold mb-3">
                      <Link 
                        href={`/posts/${post.slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {post.title}
                      </Link>
                    </h2>

                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {post.content.substring(0, 200)}...
                    </p>

                    <Link 
                      href={`/posts/${post.slug}`}
                      className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                    >
                      Read more →
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No posts found.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}