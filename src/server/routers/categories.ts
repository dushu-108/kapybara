import { TRPCError } from '@trpc/server';
import { eq, and, desc, sql } from 'drizzle-orm';
import { router, validatedProcedure } from '@/lib/trpc';
import { categories, posts, postCategories } from '@/db/schema';
import {
  createCategorySchema,
  updateCategorySchema,
  getCategorySchema,
  getCategoryBySlugSchema,
  deleteCategorySchema,
  assignCategoryToPostSchema,
  removeCategoryFromPostSchema,
  generateSlug,
} from '@/lib/schemas';

export const categoriesRouter = router({
  // Create a new category
  create: validatedProcedure
    .input(createCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const { name, description } = input;
      
      // Generate unique slug
      let slug = generateSlug(name);
      let slugCounter = 0;
      let finalSlug = slug;
      
      // Check if slug exists and make it unique
      while (true) {
        const existingCategory = await ctx.db
          .select({ id: categories.id })
          .from(categories)
          .where(eq(categories.slug, finalSlug))
          .limit(1);
          
        if (existingCategory.length === 0) break;
        
        slugCounter++;
        finalSlug = `${slug}-${slugCounter}`;
      }

      try {
        const [newCategory] = await ctx.db
          .insert(categories)
          .values({
            name,
            description: description || null,
            slug: finalSlug,
            updatedAt: new Date(),
          })
          .returning();

        return newCategory;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create category',
          cause: error,
        });
      }
    }),

  // Get all categories
  getAll: validatedProcedure
    .query(async ({ ctx }) => {
      console.log('📊 Categories.getAll called');
      try {
        const result = await ctx.db
          .select()
          .from(categories)
          .orderBy(desc(categories.createdAt));

        // Get post count for each category
        const categoriesWithPostCount = await Promise.all(
          result.map(async (category) => {
            const [postCount] = await ctx.db
              .select({ count: sql<number>`count(*)` })
              .from(postCategories)
              .where(eq(postCategories.categoryId, category.id));

            return {
              ...category,
              postCount: postCount.count,
            };
          })
        );

        return categoriesWithPostCount;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch categories',
          cause: error,
        });
      }
    }),

  // Get a single category by ID with its posts
  getById: validatedProcedure
    .input(getCategorySchema)
    .query(async ({ ctx, input }) => {
      try {
        const [category] = await ctx.db
          .select()
          .from(categories)
          .where(eq(categories.id, input.id))
          .limit(1);

        if (!category) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Category not found',
          });
        }

        // Get posts in this category
        const categoryPosts = await ctx.db
          .select({
            id: posts.id,
            title: posts.title,
            slug: posts.slug,
            published: posts.published,
          })
          .from(posts)
          .innerJoin(postCategories, eq(posts.id, postCategories.postId))
          .where(eq(postCategories.categoryId, category.id))
          .orderBy(desc(posts.createdAt));

        return {
          ...category,
          posts: categoryPosts,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch category',
          cause: error,
        });
      }
    }),

  // Get a single category by slug with its posts
  getBySlug: validatedProcedure
    .input(getCategoryBySlugSchema)
    .query(async ({ ctx, input }) => {
      try {
        const [category] = await ctx.db
          .select()
          .from(categories)
          .where(eq(categories.slug, input.slug))
          .limit(1);

        if (!category) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Category not found',
          });
        }

        // Get posts in this category
        const categoryPosts = await ctx.db
          .select({
            id: posts.id,
            title: posts.title,
            slug: posts.slug,
            published: posts.published,
          })
          .from(posts)
          .innerJoin(postCategories, eq(posts.id, postCategories.postId))
          .where(eq(postCategories.categoryId, category.id))
          .orderBy(desc(posts.createdAt));

        return {
          ...category,
          posts: categoryPosts,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch category',
          cause: error,
        });
      }
    }),

  // Update a category
  update: validatedProcedure
    .input(updateCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const { id, name, description } = input;

      try {
        // Check if category exists
        const [existingCategory] = await ctx.db
          .select()
          .from(categories)
          .where(eq(categories.id, id))
          .limit(1);

        if (!existingCategory) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Category not found',
          });
        }

        // Prepare update data
        const updateData: any = { updatedAt: new Date() };
        
        if (name !== undefined) {
          updateData.name = name;
          // Generate new slug if name changed
          if (name !== existingCategory.name) {
            let slug = generateSlug(name);
            let slugCounter = 0;
            let finalSlug = slug;
            
            while (true) {
              const existingSlug = await ctx.db
                .select({ id: categories.id })
                .from(categories)
                .where(and(eq(categories.slug, finalSlug), sql`${categories.id} != ${id}`))
                .limit(1);
                
              if (existingSlug.length === 0) break;
              
              slugCounter++;
              finalSlug = `${slug}-${slugCounter}`;
            }
            
            updateData.slug = finalSlug;
          }
        }
        
        if (description !== undefined) updateData.description = description;

        // Update the category
        const [updatedCategory] = await ctx.db
          .update(categories)
          .set(updateData)
          .where(eq(categories.id, id))
          .returning();

        return updatedCategory;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update category',
          cause: error,
        });
      }
    }),

  // Delete a category
  delete: validatedProcedure
    .input(deleteCategorySchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if category exists
        const [existingCategory] = await ctx.db
          .select({ id: categories.id })
          .from(categories)
          .where(eq(categories.id, input.id))
          .limit(1);

        if (!existingCategory) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Category not found',
          });
        }

        // Delete the category (post associations will be deleted automatically due to cascade)
        await ctx.db.delete(categories).where(eq(categories.id, input.id));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete category',
          cause: error,
        });
      }
    }),

  // Assign a category to a post
  assignToPost: validatedProcedure
    .input(assignCategoryToPostSchema)
    .mutation(async ({ ctx, input }) => {
      const { postId, categoryId } = input;

      try {
        // Check if post exists
        const [post] = await ctx.db
          .select({ id: posts.id })
          .from(posts)
          .where(eq(posts.id, postId))
          .limit(1);

        if (!post) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Post not found',
          });
        }

        // Check if category exists
        const [category] = await ctx.db
          .select({ id: categories.id })
          .from(categories)
          .where(eq(categories.id, categoryId))
          .limit(1);

        if (!category) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Category not found',
          });
        }

        // Check if assignment already exists
        const [existing] = await ctx.db
          .select({ id: postCategories.id })
          .from(postCategories)
          .where(
            and(
              eq(postCategories.postId, postId),
              eq(postCategories.categoryId, categoryId)
            )
          )
          .limit(1);

        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Category is already assigned to this post',
          });
        }

        // Create the assignment
        const [assignment] = await ctx.db
          .insert(postCategories)
          .values({ postId, categoryId })
          .returning();

        return assignment;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to assign category to post',
          cause: error,
        });
      }
    }),

  // Remove a category from a post
  removeFromPost: validatedProcedure
    .input(removeCategoryFromPostSchema)
    .mutation(async ({ ctx, input }) => {
      const { postId, categoryId } = input;

      try {
        // Check if assignment exists
        const [existing] = await ctx.db
          .select({ id: postCategories.id })
          .from(postCategories)
          .where(
            and(
              eq(postCategories.postId, postId),
              eq(postCategories.categoryId, categoryId)
            )
          )
          .limit(1);

        if (!existing) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Category assignment not found',
          });
        }

        // Remove the assignment
        await ctx.db
          .delete(postCategories)
          .where(
            and(
              eq(postCategories.postId, postId),
              eq(postCategories.categoryId, categoryId)
            )
          );

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove category from post',
          cause: error,
        });
      }
    }),
});