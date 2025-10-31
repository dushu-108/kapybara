# tRPC Blog API Implementation

This project implements a type-safe blog API using tRPC with full CRUD operations for posts and categories.

## Features

✅ **Type-Safe APIs**: End-to-end type safety with automatic type inference  
✅ **CRUD Operations**: Complete Create, Read, Update, Delete for posts and categories  
✅ **Category Assignment**: Assign and remove categories from posts  
✅ **Filtering**: Filter posts by category and publication status  
✅ **Slug Generation**: Automatic slug generation with uniqueness checks  
✅ **Error Handling**: Comprehensive error handling with proper HTTP status codes  
✅ **Validation**: Input validation using Zod schemas  
✅ **Middleware**: Request validation middleware  

## API Structure

### Posts Router (`/api/trpc/posts`)

- `posts.create` - Create a new post with optional category assignments
- `posts.getAll` - Get all posts with filtering options (published, category, pagination)
- `posts.getById` - Get a single post by ID with categories
- `posts.getBySlug` - Get a single post by slug with categories
- `posts.update` - Update post with optional category reassignment
- `posts.delete` - Delete a post (cascades to category assignments)

### Categories Router (`/api/trpc/categories`)

- `categories.create` - Create a new category
- `categories.getAll` - Get all categories with post counts
- `categories.getById` - Get a single category with its posts
- `categories.getBySlug` - Get a single category by slug with its posts
- `categories.update` - Update category details
- `categories.delete` - Delete a category (cascades to post assignments)
- `categories.assignToPost` - Assign a category to a post
- `categories.removeFromPost` - Remove a category from a post

## Usage Examples

### Client-Side Usage

```typescript
import { trpc } from '@/lib/trpc-client';

// Create a post
const createPost = trpc.posts.create.useMutation({
  onSuccess: (data) => {
    console.log('Post created:', data);
  },
});

createPost.mutate({
  title: 'My Blog Post',
  content: 'This is the content...',
  published: true,
  categoryIds: [1, 2], // Optional category assignments
});

// Get posts with filtering
const { data: posts } = trpc.posts.getAll.useQuery({
  published: true,
  categoryId: 1, // Filter by category
  limit: 10,
  offset: 0,
});

// Get a single post
const { data: post } = trpc.posts.getBySlug.useQuery({
  slug: 'my-blog-post',
});
```

### Server-Side Usage

```typescript
import { appRouter } from '@/server/routers/_app';
import { createTRPCContext } from '@/lib/trpc';

const ctx = await createTRPCContext();
const caller = appRouter.createCaller(ctx);

// Create a category
const category = await caller.categories.create({
  name: 'Technology',
  description: 'Tech-related posts',
});

// Assign category to post
await caller.categories.assignToPost({
  postId: 1,
  categoryId: category.id,
});
```

## Schema Validation

All inputs are validated using Zod schemas with proper error messages:

```typescript
// Post creation schema
const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
  published: z.boolean().default(false),
  categoryIds: z.array(z.number()).optional().default([]),
});
```

## Error Handling

The API provides comprehensive error handling:

- `NOT_FOUND` - Resource doesn't exist
- `BAD_REQUEST` - Invalid input or business logic violation
- `CONFLICT` - Resource conflict (e.g., duplicate category assignment)
- `INTERNAL_SERVER_ERROR` - Unexpected server errors

## Slug Generation

Automatic slug generation with uniqueness:

```typescript
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};
```

## Database Relations

The implementation handles complex many-to-many relationships between posts and categories:

- Posts can have multiple categories
- Categories can be assigned to multiple posts
- Cascade deletes maintain referential integrity
- Efficient queries with proper joins

## Type Safety

Full end-to-end type safety:

```typescript
// Types are automatically inferred
const posts = trpc.posts.getAll.useQuery({ published: true });
// posts.data is typed as PostWithCategories[]

const createPost = trpc.posts.create.useMutation();
// createPost.mutate expects CreatePostInput type
```

## Getting Started

1. Ensure your database is set up with the schema from `src/db/schema.ts`
2. Set your `DATABASE_URL` in `.env.local`
3. The tRPC provider is already configured in the layout
4. Use the example component in `src/components/examples/blog-example.tsx`

## File Structure

```
src/
├── lib/
│   ├── trpc.ts              # tRPC configuration
│   ├── trpc-client.ts       # Client-side tRPC setup
│   └── schemas.ts           # Zod validation schemas
├── server/
│   └── routers/
│       ├── _app.ts          # Main app router
│       ├── posts.ts         # Posts router
│       └── categories.ts    # Categories router
├── app/
│   └── api/
│       └── trpc/
│           └── [trpc]/
│               └── route.ts # Next.js API route handler
└── components/
    ├── providers/
    │   └── trpc-provider.tsx # React Query + tRPC provider
    └── examples/
        └── blog-example.tsx  # Usage example
```

This implementation provides a solid foundation for a type-safe blog API with all the requested features and proper error handling.