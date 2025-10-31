import { z } from 'zod';

// Utility function to generate slugs
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Post schemas
export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
  published: z.boolean().default(false),
  categoryIds: z.array(z.number()).optional().default([]),
});

export const updatePostSchema = z.object({
  id: z.number(),
  title: z.string().min(1, 'Title is required').max(255, 'Title too long').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  published: z.boolean().optional(),
  categoryIds: z.array(z.number()).optional(),
});

export const getPostSchema = z.object({
  id: z.number(),
});

export const getPostBySlugSchema = z.object({
  slug: z.string(),
});

export const getPostsSchema = z.object({
  published: z.boolean().optional(),
  categoryId: z.number().optional(),
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
});

export const deletePostSchema = z.object({
  id: z.number(),
});

// Category schemas
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().optional(),
});

export const updateCategorySchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  description: z.string().optional(),
});

export const getCategorySchema = z.object({
  id: z.number(),
});

export const getCategoryBySlugSchema = z.object({
  slug: z.string(),
});

export const deleteCategorySchema = z.object({
  id: z.number(),
});

// Post-Category assignment schemas
export const assignCategoryToPostSchema = z.object({
  postId: z.number(),
  categoryId: z.number(),
});

export const removeCategoryFromPostSchema = z.object({
  postId: z.number(),
  categoryId: z.number(),
});

// Response types
export const postWithCategoriesSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  slug: z.string(),
  published: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  categories: z.array(z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
  })),
});

export const categoryWithPostsSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  slug: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  posts: z.array(z.object({
    id: z.number(),
    title: z.string(),
    slug: z.string(),
    published: z.boolean(),
  })),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type GetPostInput = z.infer<typeof getPostSchema>;
export type GetPostBySlugInput = z.infer<typeof getPostBySlugSchema>;
export type GetPostsInput = z.infer<typeof getPostsSchema>;
export type DeletePostInput = z.infer<typeof deletePostSchema>;

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type GetCategoryInput = z.infer<typeof getCategorySchema>;
export type GetCategoryBySlugInput = z.infer<typeof getCategoryBySlugSchema>;
export type DeleteCategoryInput = z.infer<typeof deleteCategorySchema>;

export type AssignCategoryToPostInput = z.infer<typeof assignCategoryToPostSchema>;
export type RemoveCategoryFromPostInput = z.infer<typeof removeCategoryFromPostSchema>;

export type PostWithCategories = z.infer<typeof postWithCategoriesSchema>;
export type CategoryWithPosts = z.infer<typeof categoryWithPostsSchema>;