import { Component } from "@/components/colorful-bento-grid";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function Home() {
  return (
    <main className="bg-[#F0F0F0] w-screen min-h-screen">
      {/* Header with Create Post Button */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blog Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Manage and view your blog posts
            </p>
          </div>
          <Link
            href="/admin/create-post"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            Create Post
          </Link>
        </div>
      </div>

      {/* Blog Grid Component */}
      <Component />
    </main>
  );
}
