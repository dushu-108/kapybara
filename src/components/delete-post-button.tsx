'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc-client';
import { Trash2 } from 'lucide-react';

interface DeletePostButtonProps {
  postId: number;
  postTitle: string;
  variant?: 'default' | 'icon';
  onSuccess?: () => void;
}

export function DeletePostButton({ postId, postTitle, variant = 'default', onSuccess }: DeletePostButtonProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);

  const deletePost = trpc.posts.delete.useMutation({
    onSuccess: () => {
      setShowConfirm(false);
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/');
      }
    },
    onError: (error) => {
      alert('Error deleting post: ' + error.message);
      setShowConfirm(false);
    },
  });

  const handleDelete = () => {
    deletePost.mutate({ id: postId });
  };

  if (showConfirm) {
    return (
      <div className={variant === 'icon' ? "absolute top-0 right-0 bg-white rounded-lg shadow-lg p-2 min-w-48" : "flex items-center gap-2"}>
        <div className="text-sm text-gray-600 mb-2">Delete "{postTitle.length > 20 ? postTitle.substring(0, 20) + '...' : postTitle}"?</div>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleDelete();
            }}
            disabled={deletePost.isPending}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm rounded font-medium transition-colors"
          >
            {deletePost.isPending ? 'Deleting...' : 'Confirm'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setShowConfirm(false);
            }}
            className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-700 text-sm rounded font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowConfirm(true);
        }}
        className="p-2 bg-white/90 hover:bg-white text-gray-700 hover:text-red-600 rounded-lg shadow-lg transition-colors"
        title="Delete post"
      >
        <Trash2 size={16} />
      </button>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors text-sm"
    >
      <Trash2 size={16} />
      Delete
    </button>
  );
}