import { TRPCError } from "@trpc/server";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import { router, validatedProcedure } from "@/lib/trpc";
import { posts, categories, postCategories } from "@/db/schema";
import {
  createPostSchema,
  updatePostSchema,
  getPostSchema,
  getPostBySlugSchema,
  getPostsSchema,
  deletePostSchema,
  generateSlug,
} from "@/lib/schemas";

export const postsRouter = router({
  // Create a new post
  create: validatedProcedure
    .input(createPostSchema)
    .mutation(async ({ ctx, input }) => {
      const { title, content, published, categoryIds } = input;

      // Generate unique slug
      let slug = generateSlug(title);
      let slugCounter = 0;
      let finalSlug = slug;

      // Check if slug exists and make it unique
      while (true) {
        const existingPost = await ctx.db
          .select({ id: posts.id })
          .from(posts)
          .where(eq(posts.slug, finalSlug))
          .limit(1);

        if (existingPost.length === 0) break;

        slugCounter++;
        finalSlug = `${slug}-${slugCounter}`;
      }

      try {
        // Create the post
        const [newPost] = await ctx.db
          .insert(posts)
          .values({
            title,
            content,
            slug: finalSlug,
            published,
            updatedAt: new Date(),
          })
          .returning();

        // Assign categories if provided
        if (categoryIds && categoryIds.length > 0) {
          // Verify categories exist
          const existingCategories = await ctx.db
            .select({ id: categories.id })
            .from(categories)
            .where(sql`${categories.id} = ANY(${categoryIds})`);

          if (existingCategories.length !== categoryIds.length) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "One or more categories do not exist",
            });
          }

          // Insert post-category relationships
          await ctx.db.insert(postCategories).values(
            categoryIds.map((categoryId) => ({
              postId: newPost.id,
              categoryId,
            }))
          );
        }

        return newPost;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create post",
          cause: error,
        });
      }
    }),

  // Get all posts with optional filtering
  getAll: validatedProcedure
    .input(getPostsSchema)
    .query(async ({ ctx, input }) => {
      const { published, categoryId, limit, offset } = input;

      console.log('📊 Posts.getAll called with input:', input);

      try {
        let whereConditions = [];

        // Filter by published status
        if (published !== undefined) {
          whereConditions.push(eq(posts.published, published));
        }

        let result;

        // Filter by category
        if (categoryId) {
          const categoryConditions = [
            ...whereConditions,
            eq(postCategories.categoryId, categoryId),
          ];

          result = await ctx.db
            .select({
              id: posts.id,
              title: posts.title,
              content: posts.content,
              slug: posts.slug,
              published: posts.published,
              createdAt: posts.createdAt,
              updatedAt: posts.updatedAt,
            })
            .from(posts)
            .innerJoin(postCategories, eq(posts.id, postCategories.postId))
            .where(
              categoryConditions.length > 0
                ? and(...categoryConditions)
                : undefined
            )
            .orderBy(desc(posts.createdAt))
            .limit(limit)
            .offset(offset);
        } else {
          result = await ctx.db
            .select({
              id: posts.id,
              title: posts.title,
              content: posts.content,
              slug: posts.slug,
              published: posts.published,
              createdAt: posts.createdAt,
              updatedAt: posts.updatedAt,
            })
            .from(posts)
            .where(
              whereConditions.length > 0 ? and(...whereConditions) : undefined
            )
            .orderBy(desc(posts.createdAt))
            .limit(limit)
            .offset(offset);
        }

        // Get categories for each post
        const postsWithCategories = await Promise.all(
          result.map(async (post) => {
            const postCats = await ctx.db
              .select({
                id: categories.id,
                name: categories.name,
                slug: categories.slug,
              })
              .from(categories)
              .innerJoin(
                postCategories,
                eq(categories.id, postCategories.categoryId)
              )
              .where(eq(postCategories.postId, post.id));

            return {
              ...post,
              categories: postCats,
            };
          })
        );

        console.log('✅ Posts.getAll successful, returning', postsWithCategories.length, 'posts');
        return postsWithCategories;
      } catch (error) {
        console.error('❌ Posts.getAll failed:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch posts",
          cause: error,
        });
      }
    }),

  // Get a single post by ID
  getById: validatedProcedure
    .input(getPostSchema)
    .query(async ({ ctx, input }) => {
      try {
        const [post] = await ctx.db
          .select()
          .from(posts)
          .where(eq(posts.id, input.id))
          .limit(1);

        if (!post) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Post not found",
          });
        }

        // Get categories for this post
        const postCats = await ctx.db
          .select({
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
          })
          .from(categories)
          .innerJoin(
            postCategories,
            eq(categories.id, postCategories.categoryId)
          )
          .where(eq(postCategories.postId, post.id));

        return {
          ...post,
          categories: postCats,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch post",
          cause: error,
        });
      }
    }),

  // Get a single post by slug
  getBySlug: validatedProcedure
    .input(getPostBySlugSchema)
    .query(async ({ ctx, input }) => {
      try {
        const [post] = await ctx.db
          .select()
          .from(posts)
          .where(eq(posts.slug, input.slug))
          .limit(1);

        if (!post) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Post not found",
          });
        }

        // Get categories for this post
        const postCats = await ctx.db
          .select({
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
          })
          .from(categories)
          .innerJoin(
            postCategories,
            eq(categories.id, postCategories.categoryId)
          )
          .where(eq(postCategories.postId, post.id));

        return {
          ...post,
          categories: postCats,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch post",
          cause: error,
        });
      }
    }),

  // Update a post
  update: validatedProcedure
    .input(updatePostSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, title, content, published, categoryIds } = input;

      try {
        // Check if post exists
        const [existingPost] = await ctx.db
          .select()
          .from(posts)
          .where(eq(posts.id, id))
          .limit(1);

        if (!existingPost) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Post not found",
          });
        }

        // Prepare update data
        const updateData: any = { updatedAt: new Date() };

        if (title !== undefined) {
          updateData.title = title;
          // Generate new slug if title changed
          if (title !== existingPost.title) {
            let slug = generateSlug(title);
            let slugCounter = 0;
            let finalSlug = slug;

            while (true) {
              const existingSlug = await ctx.db
                .select({ id: posts.id })
                .from(posts)
                .where(
                  and(eq(posts.slug, finalSlug), sql`${posts.id} != ${id}`)
                )
                .limit(1);

              if (existingSlug.length === 0) break;

              slugCounter++;
              finalSlug = `${slug}-${slugCounter}`;
            }

            updateData.slug = finalSlug;
          }
        }

        if (content !== undefined) updateData.content = content;
        if (published !== undefined) updateData.published = published;

        // Update the post
        const [updatedPost] = await ctx.db
          .update(posts)
          .set(updateData)
          .where(eq(posts.id, id))
          .returning()
        if (categoryIds !== undefined) {
          await ctx.db
            .delete(postCategories)
            .where(eq(postCategories.postId, id));

          if (categoryIds.length > 0) {
            const existingCategories = await ctx.db
              .select({ id: categories.id })
              .from(categories)
              .where(sql`${categories.id} = ANY(${categoryIds})`);

            if (existingCategories.length !== categoryIds.length) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "One or more categories do not exist",
              });
            }

            await ctx.db.insert(postCategories).values(
              categoryIds.map((categoryId) => ({
                postId: id,
                categoryId,
              }))
            );
          }
        }

        return updatedPost;
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update post",
          cause: error,
        });
      }
    }),
  delete: validatedProcedure
    .input(deletePostSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const [existingPost] = await ctx.db
          .select({ id: posts.id })
          .from(posts)
          .where(eq(posts.id, input.id))
          .limit(1);

        if (!existingPost) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Post not found",
          });
        }

        await ctx.db.delete(posts).where(eq(posts.id, input.id));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete post",
          cause: error,
        });
      }
    }),
});
