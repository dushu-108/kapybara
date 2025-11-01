import Link from 'next/link';
import { Home, FileText, Plus, FolderOpen } from 'lucide-react';

export function AdminNav() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">B</span>
              </div>
              Blog Admin
            </Link>
            
            <div className="flex items-center space-x-6">
              <Link
                href="/admin"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FileText size={16} />
                All Posts
              </Link>
              
              <Link
                href="/admin/create-post"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Plus size={16} />
                Create Post
              </Link>
              
              <Link
                href="/admin/categories"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FolderOpen size={16} />
                Categories
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Home size={16} />
              View Blog
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}