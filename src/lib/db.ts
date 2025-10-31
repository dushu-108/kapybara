import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import * as schema from "@/db/schema";

config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in environment variables");
}

const client = neon(process.env.DATABASE_URL, {
  // Add connection options for better reliability
  fetchConnectionCache: true,
});

const db = drizzle(client, { 
  schema,
  logger: process.env.NODE_ENV === 'development',
});

export { db };
