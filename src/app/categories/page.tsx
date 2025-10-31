import { createTRPCContext } from '@/lib/trpc';
import { appRouter } from '@/server/routers/_app';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default async function CategoriesPage() {
  const ctx = await createTRPCContext();
  const caller = appRouter.createCaller(ctx);

  const categories = await caller.categories.getAll();

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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Categories</h1>
            <p className="text-xl text-muted-foreground mb-12">
              Browse articles by topic and category.
            </p>

            {categories && categories.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="group bg-white rounded-lg border p-6 hover:shadow-lg hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <BookOpen className="size-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {category.postCount} articles
                        </p>
                      </div>
                    </div>

                    {category.description && (
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {category.description}
                      </p>
                    )}

                    <div className="mt-4 text-primary text-sm font-medium group-hover:underline">
                      View articles →
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No categories found.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}