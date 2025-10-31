import { notFound } from 'next/navigation';
import { createTRPCContext } from '@/lib/trpc';
import { appRouter } from '@/server/routers/_app';
import Link from 'next/link';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const ctx = await createTRPCContext();
  const caller = appRouter.createCaller(ctx);

  try {
    const category = await caller.categories.getBySlug({ slug });

    if (!category) {
      notFound();
    }

    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <Link 
              href="/categories" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" />
              Back to Categories
            </Link>
          </div>
        </header>

        {/* Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Category Header */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Tag className="size-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold">{category.name}</h1>
                    <p className="text-muted-foreground mt-2">
                      {category.posts.length} articles in this category
                    </p>
                  </div>
                </div>
                
                {category.description && (
                  <p className="text-xl text-muted-foreground">
                    {category.description}
                  </p>
                )}
              </div>

              {/* Posts */}
              {category.posts.length > 0 ? (
                <div className="grid gap-8">
                  {category.posts.map((post) => (
                    <article 
                      key={post.id}
                      className="bg-white rounded-lg border p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                        <Calendar className="size-4" />
                        <span>Published article</span>
                      </div>

                      <h2 className="text-2xl font-bold mb-3">
                        <Link 
                          href={`/posts/${post.slug}`}
                          className="hover:text-primary transition-colors"
                        >
                          {post.title}
                        </Link>
                      </h2>

                      <div className="flex items-center gap-2 mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          post.published 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {post.published ? 'Published' : 'Draft'}
                        </span>
                      </div>

                      <Link 
                        href={`/posts/${post.slug}`}
                        className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                      >
                        Read article →
                      </Link>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No posts in this category yet.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error('Error fetching category:', error);
    notFound();
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const ctx = await createTRPCContext();
  const caller = appRouter.createCaller(ctx);

  try {
    const category = await caller.categories.getBySlug({ slug });
    
    if (!category) {
      return {
        title: 'Category Not Found',
      };
    }

    return {
      title: `${category.name} - Blog Categories`,
      description: category.description || `Browse articles in the ${category.name} category`,
    };
  } catch (error) {
    return {
      title: 'Category Not Found',
    };
  }
}