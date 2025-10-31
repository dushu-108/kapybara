# Database Setup Guide - Neon PostgreSQL

This guide will help you set up your PostgreSQL database on Neon and deploy your schema.

## Step 1: Create a Neon Database

1. **Sign up for Neon** (if you haven't already):
   - Go to [https://neon.tech](https://neon.tech)
   - Sign up with your GitHub account or email
   - Neon offers a generous free tier

2. **Create a new project**:
   - Click "Create Project"
   - Choose a project name (e.g., "blog-app")
   - Select your preferred region
   - Choose PostgreSQL version (latest is recommended)

3. **Get your connection string**:
   - After creating the project, you'll see a connection string
   - It looks like: `postgresql://username:password@host/database?sslmode=require`
   - Copy this connection string

## Step 2: Configure Environment Variables

1. **Create `.env.local` file** in your project root:

```bash
# Database
DATABASE_URL="your-neon-connection-string-here"

# Example:
# DATABASE_URL="postgresql://username:password@ep-cool-lab-123456.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

2. **Add to `.gitignore`** (if not already there):
```
.env.local
.env
```

## Step 3: Install Dependencies

Run the following command to install drizzle-kit:

```bash
npm install
```

The `drizzle-kit` package has been added to your devDependencies.

## Step 4: Generate and Run Migrations

1. **Generate migration files**:
```bash
npm run db:generate
```

This creates SQL migration files in `src/db/migrations/` based on your schema.

2. **Apply migrations to your database**:
```bash
npm run db:migrate
```

This runs the migrations against your Neon database.

## Alternative: Push Schema Directly (Development)

For development, you can push your schema directly without generating migration files:

```bash
npm run db:push
```

⚠️ **Warning**: This is great for development but use migrations for production.

## Step 5: Verify Your Database

1. **Use Drizzle Studio** to inspect your database:
```bash
npm run db:studio
```

This opens a web interface at `https://local.drizzle.studio` where you can:
- View your tables
- Browse data
- Run queries
- Manage your database visually

2. **Or connect directly to Neon**:
   - Go to your Neon dashboard
   - Click on "SQL Editor"
   - Run queries to verify your tables exist

## Step 6: Test Your Setup

1. **Start your development server**:
```bash
npm run dev
```

2. **Visit your app** at `http://localhost:3000`
   - You should see the blog example interface
   - Try creating categories and posts
   - Check if data persists in your Neon database

## Database Schema Overview

Your database will have these tables:

### `posts`
- `id` (serial, primary key)
- `title` (varchar, 255)
- `content` (text)
- `slug` (varchar, 255, unique)
- `published` (boolean, default false)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### `categories`
- `id` (serial, primary key)
- `name` (varchar, 100)
- `description` (text, nullable)
- `slug` (varchar, 100, unique)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### `post_categories` (junction table)
- `id` (serial, primary key)
- `post_id` (integer, foreign key to posts.id)
- `category_id` (integer, foreign key to categories.id)
- `created_at` (timestamp)
- Unique constraint on (post_id, category_id)

## Available Scripts

```bash
# Generate migration files from schema changes
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Push schema directly (development only)
npm run db:push

# Open Drizzle Studio (database GUI)
npm run db:studio
```

## Troubleshooting

### Connection Issues
- Verify your `DATABASE_URL` is correct
- Ensure your Neon database is active (not suspended)
- Check if your IP is allowed (Neon allows all IPs by default)

### Migration Issues
- If migrations fail, check the error message
- You might need to reset your database and re-run migrations
- Use `db:push` for development to skip migration files

### Schema Changes
1. Modify your schema in `src/db/schema.ts`
2. Run `npm run db:generate` to create migration
3. Run `npm run db:migrate` to apply changes
4. Or use `npm run db:push` for quick development changes

## Production Deployment

For production (Vercel, Netlify, etc.):

1. **Add environment variable** in your deployment platform:
   - Variable name: `DATABASE_URL`
   - Value: Your Neon connection string

2. **Run migrations** in your build process:
   - Add `npm run db:migrate` to your build script
   - Or use `npm run db:push` if you prefer

3. **Neon automatically handles**:
   - Connection pooling
   - SSL certificates
   - Backups
   - Scaling

## Next Steps

Once your database is set up:
1. Your tRPC APIs will automatically work with the database
2. You can start building your blog frontend
3. Add authentication if needed
4. Deploy to your preferred platform

Your type-safe blog API is now ready with a production-grade PostgreSQL database! 🚀