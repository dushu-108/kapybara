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
  create: validatedProcedure
    .input(createCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const { name, description } = input;
      
      let slug = generateSlug(name);
      let slugCounter = 0;
      let finalSlug = slug;
      
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

  getAll: validatedProcedure
    .query(async ({ ctx }) => {
      console.log('Categories.getAll called');
      try {
        const result = await ctx.db
          .select()
          .from(categories)
          .orderBy(desc(categories.createdAt));

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

  update: validatedProcedure
    .input(updateCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const { id, name, description } = input;

      try {
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

        const updateData: any = { updatedAt: new Date() };
        
        if (name !== undefined) {
          updateData.name = name;
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

  delete: validatedProcedure
    .input(deleteCategorySchema)
    .mutation(async ({ ctx, input }) => {
      try {
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

  assignToPost: validatedProcedure
    .input(assignCategoryToPostSchema)
    .mutation(async ({ ctx, input }) => {
      const { postId, categoryId } = input;

      try {
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

  removeFromPost: validatedProcedure
    .input(removeCategoryFromPostSchema)
    .mutation(async ({ ctx, input }) => {
      const { postId, categoryId } = input;

      try {
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