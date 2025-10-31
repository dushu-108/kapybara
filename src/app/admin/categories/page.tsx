'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { AdminNav } from '@/components/admin-nav';

interface EditingCategory {
  id: number;
  name: string;
  description: string;
}

export default function CategoriesAdminPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingCategory, setEditingCategory] = useState<EditingCategory | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });

  const utils = trpc.useUtils();
  const { data: categories, isLoading } = trpc.categories.getAll.useQuery();

  const createMutation = trpc.categories.create.useMutation({
    onSuccess: () => {
      utils.categories.getAll.invalidate();
      setNewCategory({ name: '', description: '' });
      setIsCreating(false);
    },
  });

  const updateMutation = trpc.categories.update.useMutation({
    onSuccess: () => {
      utils.categories.getAll.invalidate();
      setEditingCategory(null);
    },
  });

  const deleteMutation = trpc.categories.delete.useMutation({
    onSuccess: () => {
      utils.categories.getAll.invalidate();
    },
  });

  const handleCreate = () => {
    if (newCategory.name.trim()) {
      createMutation.mutate({
        name: newCategory.name.trim(),
        description: newCategory.description.trim() || undefined,
      });
    }
  };

  const handleUpdate = () => {
    if (editingCategory && editingCategory.name.trim()) {
      updateMutation.mutate({
        id: editingCategory.id,
        name: editingCategory.name.trim(),
        description: editingCategory.description.trim() || undefined,
      });
    }
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete the category "${name}"? This action cannot be undone.`)) {
      deleteMutation.mutate({ id });
    }
  };

  const startEditing = (category: any) => {
    setEditingCategory({
      id: category.id,
      name: category.name,
      description: category.description || '',
    });
  };

  const cancelEditing = () => {
    setEditingCategory(null);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading categories...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <AdminNav />
      <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-600 mt-2">Manage your blog categories</p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          disabled={isCreating}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Add Category
        </Button>
      </div>

      {/* Create New Category Form */}
      {isCreating && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Category</CardTitle>
            <CardDescription>Add a new category for organizing your blog posts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="new-name">Category Name</Label>
              <Input
                id="new-name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Enter category name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="new-description">Description (Optional)</Label>
              <Input
                id="new-description"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                placeholder="Enter category description"
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreate}
                disabled={!newCategory.name.trim() || createMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save size={16} />
                {createMutation.isPending ? 'Creating...' : 'Create Category'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setNewCategory({ name: '', description: '' });
                }}
              >
                <X size={16} />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories List */}
      <div className="grid gap-4">
        {categories?.map((category) => (
          <Card key={category.id}>
            <CardContent className="p-6">
              {editingCategory?.id === category.id ? (
                // Edit Mode
                <div className="space-y-4">
                  <div>
                    <Label htmlFor={`edit-name-${category.id}`}>Category Name</Label>
                    <Input
                      id={`edit-name-${category.id}`}
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`edit-description-${category.id}`}>Description</Label>
                    <Input
                      id={`edit-description-${category.id}`}
                      value={editingCategory.description}
                      onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleUpdate}
                      disabled={!editingCategory.name.trim() || updateMutation.isPending}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Save size={14} />
                      {updateMutation.isPending ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={cancelEditing}
                      size="sm"
                    >
                      <X size={14} />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{category.name}</h3>
                      <Badge variant="secondary">
                        {category.postCount} {category.postCount === 1 ? 'post' : 'posts'}
                      </Badge>
                    </div>
                    {category.description && (
                      <p className="text-gray-600">{category.description}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      Slug: /{category.slug}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing(category)}
                      className="flex items-center gap-2"
                    >
                      <Edit size={14} />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(category.id, category.name)}
                      disabled={deleteMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <Trash2 size={14} />
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {categories?.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-500">
                <h3 className="text-lg font-medium mb-2">No categories yet</h3>
                <p>Create your first category to start organizing your blog posts.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    </>
  );
}