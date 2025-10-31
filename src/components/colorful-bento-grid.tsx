"use client";

import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc-client";
import { BookOpen, Tag, Calendar, Eye, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { DeletePostButton } from "@/components/delete-post-button";

export interface ColorfulBentoGridProps {
  showAdminCards?: boolean;
}

export const ColorfulBentoGrid = ({
  showAdminCards = false,
}: ColorfulBentoGridProps) => {
  // Fetch blog data using tRPC
  const { data: posts, isLoading: postsLoading } = trpc.posts.getAll.useQuery({
    published: true,
    limit: 6,
    offset: 0,
  });

  const { data: categories, isLoading: categoriesLoading } =
    trpc.categories.getAll.useQuery();

  const { data: allPosts } = trpc.posts.getAll.useQuery({
    limit: 100,
    offset: 0,
  });

  // Calculate stats
  const publishedCount = allPosts?.filter((post) => post.published).length || 0;
  const draftCount = allPosts?.filter((post) => !post.published).length || 0;
  const totalCategories = categories?.length || 0;
  const totalPosts = allPosts?.length || 0;

  if (postsLoading || categoriesLoading) {
    return (
      <section className="bg-white rounded-3xl p-4 my-16 max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </section>
    );
  }

  // Generate gradient for each post
  const getPostGradient = (index: number) => {
    const gradients = [
      "from-blue-400/20 to-purple-500/20",
      "from-green-400/20 to-emerald-500/20",
      "from-purple-400/20 to-pink-500/20",
      "from-orange-400/20 to-red-500/20",
      "from-teal-400/20 to-cyan-500/20",
      "from-indigo-400/20 to-blue-500/20",
      "from-pink-400/20 to-rose-500/20",
      "from-yellow-400/20 to-orange-500/20",
    ];
    return gradients[index % gradients.length];
  };

  // Generate hover shadow color for each post
  const getHoverShadow = (index: number) => {
    const shadows = [
      "hover:shadow-[-6px_6px_32px_8px_rgba(59,130,246,0.15)]",
      "hover:shadow-[-6px_6px_32px_8px_rgba(34,197,94,0.15)]",
      "hover:shadow-[-6px_6px_32px_8px_rgba(168,85,247,0.15)]",
      "hover:shadow-[-6px_6px_32px_8px_rgba(239,68,68,0.15)]",
      "hover:shadow-[-6px_6px_32px_8px_rgba(20,184,166,0.15)]",
      "hover:shadow-[-6px_6px_32px_8px_rgba(99,102,241,0.15)]",
      "hover:shadow-[-6px_6px_32px_8px_rgba(236,72,153,0.15)]",
      "hover:shadow-[-6px_6px_32px_8px_rgba(251,146,60,0.15)]",
    ];
    return shadows[index % shadows.length];
  };

  // Generate rotation for each post
  const getRotation = (index: number) => {
    const rotations = [
      "hover:rotate-1",
      "hover:-rotate-1",
      "hover:rotate-2",
      "hover:-rotate-2",
      "hover:rotate-3",
      "hover:-rotate-3",
    ];
    return rotations[index % rotations.length];
  };

  // Generate author names
  const getAuthorName = (index: number) => {
    const authors = [
      "Olivia Rhye",
      "Phoenix Baker",
      "Lana Steiner",
      "Demi Wilkinson",
      "Candice Wu",
      "Natali Craig",
      "Drew Cano",
      "Orlando Diggs",
    ];
    return authors[index % authors.length];
  };

  if (!posts || posts.length === 0) {
    return (
      <section className="bg-white rounded-3xl p-6 my-16 max-w-7xl mx-auto">
        <div className="text-center py-20">
          <p className="text-gray-500">
            No posts found. Create your first post to get started!
          </p>
        </div>
      </section>
    );
  }

  const recentPosts = posts.slice(0, 3);
  const allPostsForGrid = allPosts || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-16">
      {/* Recent Blog Posts Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Recent blog posts
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Featured Post (Large) */}
          {recentPosts[0] && (
            <div className="lg:col-span-2">
              <Link
                href={`/posts/${recentPosts[0].slug}`}
                className="group block"
              >
                <div
                  className={cn(
                    "relative h-80 rounded-xl overflow-hidden mb-6 bg-linear-to-br transition-all duration-200 ease-in-out",
                    getPostGradient(0),
                    getHoverShadow(0),
                    getRotation(0)
                  )}
                >
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
                  
                  {/* Hover Actions */}
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = `/admin/edit-post/${recentPosts[0].slug}`;
                      }}
                      className="p-2 bg-white/90 hover:bg-white text-gray-700 hover:text-blue-600 rounded-lg shadow-lg transition-colors"
                      title="Edit post"
                    >
                      <Edit size={16} />
                    </button>
                    <DeletePostButton 
                      postId={recentPosts[0].id} 
                      postTitle={recentPosts[0].title}
                      variant="icon"
                    />
                  </div>
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <div className="flex items-center gap-2 text-sm mb-3">
                      <span>{getAuthorName(0)}</span>
                      <span>•</span>
                      <span>
                        {new Date(recentPosts[0].createdAt).toLocaleDateString(
                          "en-US",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-gray-200 transition-colors">
                      {recentPosts[0].title}
                    </h3>
                    <p className="text-gray-200 leading-relaxed mb-4">
                      {recentPosts[0].content.length > 150
                        ? recentPosts[0].content.substring(0, 150) + "..."
                        : recentPosts[0].content}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {recentPosts[0].categories.map((category) => (
                        <span
                          key={category.id}
                          className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full font-medium"
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Smaller Posts (Right Side) */}
          <div className="space-y-8">
            {recentPosts.slice(1, 3).map((post, index) => (
              <div key={post.id}>
                <Link href={`/posts/${post.slug}`} className="group block">
                  <div className="flex gap-4">
                    <div
                      className={cn(
                        "relative w-32 h-24 rounded-lg overflow-hidden shrink-0 bg-linear-to-br transition-all duration-200 ease-in-out",
                        getPostGradient(index + 1),
                        "group-hover:scale-105"
                      )}
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{getAuthorName(index + 1)}</span>
                        <span>•</span>
                        <span>
                          {new Date(post.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {post.content.length > 100
                          ? post.content.substring(0, 100) + "..."
                          : post.content}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {post.categories.slice(0, 2).map((category) => (
                          <span
                            key={category.id}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium"
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All Blog Posts Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          All blog posts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allPostsForGrid.map((post, index) => (
            <article key={post.id} className="group relative">
              <Link href={`/posts/${post.slug}`} className="block">
                <div
                  className={cn(
                    "relative h-48 rounded-xl overflow-hidden mb-6 bg-linear-to-br transition-all duration-200 ease-in-out",
                    getPostGradient(index),
                    getHoverShadow(index),
                    getRotation(index)
                  )}
                >
                  <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
                  
                  {/* Hover Actions */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = `/admin/edit-post/${post.slug}`;
                      }}
                      className="p-2 bg-white/90 hover:bg-white text-gray-700 hover:text-blue-600 rounded-lg shadow-lg transition-colors"
                      title="Edit post"
                    >
                      <Edit size={16} />
                    </button>
                    <DeletePostButton 
                      postId={post.id} 
                      postTitle={post.title}
                      variant="icon"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{getAuthorName(index)}</span>
                    <span>•</span>
                    <span>
                      {new Date(post.createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 line-clamp-3">
                    {post.content.length > 120
                      ? post.content.substring(0, 120) + "..."
                      : post.content}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {post.categories.map((category) => (
                      <span
                        key={category.id}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-medium"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

// Also export as Component for backward compatibility
export const Component = ColorfulBentoGrid;
