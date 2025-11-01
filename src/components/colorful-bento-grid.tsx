"use client";

import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc-client";
import { Edit } from "lucide-react";
import Link from "next/link";
import { DeletePostButton } from "@/components/delete-post-button";

export const ColorfulBentoGrid = () => {
  const { data: realPosts, isLoading: postsLoading, refetch: refetchPosts } = trpc.posts.getAll.useQuery({
    published: true,
    limit: 50,
    offset: 0,
  }, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { data: draftPosts } = trpc.posts.getAll.useQuery({
    published: false,
    limit: 10,
    offset: 0,
  }, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const posts = (realPosts || []).slice(0, 6);

  if (postsLoading && !posts.length) {
    return (
      <section className="bg-white rounded-3xl p-4 my-16 max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </section>
    );
  }

  if (!postsLoading && posts.length === 0) {
    const hasDrafts = draftPosts && draftPosts.length > 0;
    
    return (
      <section className="bg-white rounded-3xl p-4 my-16 max-w-6xl mx-auto">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Published Posts Yet</h2>
          <p className="text-gray-600 mb-6 max-w-md">
            {hasDrafts 
              ? `You have ${draftPosts.length} draft post${draftPosts.length > 1 ? 's' : ''}, but no published posts yet. Publish your drafts to see them here.`
              : "You haven't created any blog posts yet. Create your first post and make sure to set it as 'Published' to see it here."
            }
          </p>
          <div className="flex gap-3">
            <a
              href="/admin/create-post"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Create New Post
            </a>
            {hasDrafts && (
              <a
                href="/admin"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Manage Drafts
              </a>
            )}
          </div>
        </div>
      </section>
    );
  }

  const getPostGradient = (index: number) => {
    const gradients = [
      "from-blue-400/20 to-purple-500/20",
      "from-green-400/20 to-blue-500/20",
      "from-purple-400/20 to-pink-500/20",
      "from-pink-400/20 to-rose-500/20",
      "from-yellow-400/20 to-orange-500/20",
    ];
    return gradients[index % gradients.length];
  };

  const getHoverShadow = (index: number) => {
    const shadows = [
      "hover:shadow-[-6px_6px_32px_8px_rgba(59,130,246,0.15)]",
      "hover:shadow-[-6px_6px_32px_8px_rgba(34,197,94,0.15)]",
      "hover:shadow-[-6px_6px_32px_8px_rgba(168,85,247,0.15)]",
      "hover:shadow-[-6px_6px_32px_8px_rgba(236,72,153,0.15)]",
      "hover:shadow-[-6px_6px_32px_8px_rgba(251,146,60,0.15)]",
    ];
    return shadows[index % shadows.length];
  };

  const getRotation = (index: number) => {
    const rotations = [
      "hover:rotate-1",
      "hover:-rotate-1",
      "hover:rotate-2",
      "hover:rotate-3",
      "hover:-rotate-3",
    ];
    return rotations[index % rotations.length];
  };

  const getAuthorName = (index: number) => {
    const authors = [
      "Alex Johnson",
      "Sarah Chen",
      "Mike Rodriguez",
      "Emily Davis",
      "Drew Cano",
      "Orlando Diggs",
    ];
    return authors[index % authors.length];
  };

  const recentPosts = posts.slice(0, 3);
  const allPostsForGrid = posts || [];

  return (
    <section className="bg-white rounded-3xl p-4 my-16 max-w-6xl mx-auto">
      <div className="p-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Latest Blog Posts
          </h2>
          <p className="text-gray-600 text-lg">
            Discover insights, tutorials, and stories from our community
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {recentPosts[0] && (
            <div className="lg:col-span-2 relative group">
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2 z-10">
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
                  onSuccess={refetchPosts}
                />
              </div>
              
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
                    <h3 className="text-2xl font-bold mb-3 line-clamp-2">
                      {recentPosts[0].title}
                    </h3>
                    <p className="text-white/90 line-clamp-2">
                      {recentPosts[0].content.length > 120
                        ? recentPosts[0].content.substring(0, 120) + "..."
                        : recentPosts[0].content}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          )}

          <div className="space-y-6">
            {recentPosts.slice(1, 3).map(
              (
                post: {
                  id: any;
                  slug: any;
                  createdAt: string | number | Date;
                  title: any;
                  content: string;
                  categories: any[];
                },
                index: number
              ) => (
                <div key={post.id}>
                  <Link href={`/posts/${post.slug}`} className="group block">
                    <div className="flex gap-4">
                      <div
                        className={cn(
                          "w-24 h-24 rounded-lg bg-linear-to-br shrink-0 transition-all duration-200 ease-in-out",
                          getPostGradient(index + 1),
                          getRotation(index + 1)
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                          <span>{getAuthorName(index + 1)}</span>
                          <span>•</span>
                          <span>
                            {new Date(post.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                day: "numeric",
                                month: "short",
                              }
                            )}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {post.content && typeof post.content === 'string' && post.content.length > 100
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
              )
            )}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          All Articles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allPostsForGrid.map((post: any, index: number) => (
            <article key={post.id} className="group relative">
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2 z-10">
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
                  onSuccess={refetchPosts}
                />
              </div>
              
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
                    {post.categories.map(
                      (category: {
                        id: any;
                        name: any;
                      }) => (
                        <span
                          key={category.id}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-medium"
                        >
                          {category.name}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};