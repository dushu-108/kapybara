import { TRPCError } from "@trpc/server";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
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
  create: validatedProcedure
    .input(createPostSchema)
    .mutation(async ({ ctx, input }) => {
      const { title, content, published, categoryIds } = input;

      let slug = generateSlug(title);
      let slugCounter = 0;
      let finalSlug = slug;

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

        if (categoryIds && categoryIds.length > 0) {
          const existingCategories = await ctx.db
            .select({ id: categories.id })
            .from(categories)
            .where(inArray(categories.id, categoryIds));

          if (existingCategories.length !== categoryIds.length) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "One or more categories do not exist",
            });
          }

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

  getAll: validatedProcedure
    .input(getPostsSchema)
    .query(async ({ ctx, input }) => {
      const { published, categoryId, limit, offset } = input;

      try {
        let whereConditions = [];

        if (published !== undefined) {
          whereConditions.push(eq(posts.published, published));
        }

        if (categoryId) {
          const categoryConditions = [
            ...whereConditions,
            eq(postCategories.categoryId, categoryId),
          ];

          // Get total count for pagination
          const totalCountResult = await ctx.db
            .select({ count: sql<number>`count(distinct ${posts.id})` })
            .from(posts)
            .innerJoin(postCategories, eq(posts.id, postCategories.postId))
            .innerJoin(categories, eq(postCategories.categoryId, categories.id))
            .where(
              categoryConditions.length > 0
                ? and(...categoryConditions)
                : undefined
            );

          const totalCount = totalCountResult[0]?.count || 0;

          const result = await ctx.db
            .select({
              id: posts.id,
              title: posts.title,
              content: posts.content,
              slug: posts.slug,
              published: posts.published,
              createdAt: posts.createdAt,
              updatedAt: posts.updatedAt,
              categoryId: categories.id,
              categoryName: categories.name,
              categorySlug: categories.slug,
            })
            .from(posts)
            .innerJoin(postCategories, eq(posts.id, postCategories.postId))
            .innerJoin(categories, eq(postCategories.categoryId, categories.id))
            .where(
              categoryConditions.length > 0
                ? and(...categoryConditions)
                : undefined
            )
            .orderBy(desc(posts.createdAt))
            .limit(limit)
            .offset(offset);

          const postsMap = new Map();
          result.forEach((row: any) => {
            if (!postsMap.has(row.id)) {
              postsMap.set(row.id, {
                id: row.id,
                title: row.title,
                content: row.content,
                slug: row.slug,
                published: row.published,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
                categories: [],
              });
            }
            postsMap.get(row.id).categories.push({
              id: row.categoryId,
              name: row.categoryName,
              slug: row.categorySlug,
            });
          });

          return {
            posts: Array.from(postsMap.values()),
            totalCount,
            hasMore: offset + limit < totalCount,
          };
        } else {
          // Get total count for pagination
          const totalCountResult = await ctx.db
            .select({ count: sql<number>`count(*)` })
            .from(posts)
            .where(
              whereConditions.length > 0 ? and(...whereConditions) : undefined
            );

          const totalCount = totalCountResult[0]?.count || 0;

          const result = await ctx.db
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

          if (result.length === 0) {
            return {
              posts: [],
              totalCount,
              hasMore: false,
            };
          }

          const postIds = result.map((p) => p.id);
          const allCategories = await ctx.db
            .select({
              postId: postCategories.postId,
              id: categories.id,
              name: categories.name,
              slug: categories.slug,
            })
            .from(categories)
            .innerJoin(postCategories, eq(categories.id, postCategories.categoryId))
            .where(inArray(postCategories.postId, postIds));

          const categoriesMap = new Map<number, Array<{id: number, name: string, slug: string}>>();
          allCategories.forEach((cat) => {
            if (!categoriesMap.has(cat.postId)) {
              categoriesMap.set(cat.postId, []);
            }
            categoriesMap.get(cat.postId)!.push({
              id: cat.id,
              name: cat.name,
              slug: cat.slug,
            });
          });

          const postsWithCategories = result.map((post) => ({
            ...post,
            categories: categoriesMap.get(post.id) || [],
          }));

          return {
            posts: postsWithCategories,
            totalCount,
            hasMore: offset + limit < totalCount,
          };
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch posts",
          cause: error,
        });
      }
    }),

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

  update: validatedProcedure
    .input(updatePostSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, title, content, published, categoryIds } = input;

      try {
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

        const updateData: any = { updatedAt: new Date() };

        if (title !== undefined) {
          updateData.title = title;
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

        const [updatedPost] = await ctx.db
          .update(posts)
          .set(updateData)
          .where(eq(posts.id, id))
          .returning();

        if (categoryIds !== undefined) {
          await ctx.db
            .delete(postCategories)
            .where(eq(postCategories.postId, id));

          if (categoryIds.length > 0) {
            const existingCategories = await ctx.db
              .select({ id: categories.id })
              .from(categories)
              .where(inArray(categories.id, categoryIds));

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