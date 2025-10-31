"use server";
import { db } from "@/lib/db";
import { posts, categories } from "@/db/schema";
import { eq } from "drizzle-orm";

// Example server actions for posts
export async function createPost(title: string, content: string) {
  await db.insert(posts).values({ 
    title, 
    content, 
    slug: title.toLowerCase().replace(/\s+/g, '-'),
    published: false 
  });
}

export async function getPosts() {
  return await db.select().from(posts);
}

export async function updatePost(id: number, title: string, content: string) {
  await db.update(posts).set({ 
    title, 
    content, 
    updatedAt: new Date() 
  }).where(eq(posts.id, id));
}

export async function deletePost(id: number) {
  await db.delete(posts).where(eq(posts.id, id));
}
