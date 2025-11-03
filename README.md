# Blog Management System

A modern, full-stack blog management system built with Next.js, tRPC, and Neon PostgreSQL. Features a clean admin interface for content management and a beautiful public blog display.

## 🚀 Features

### ✅ Priority 1 - Core Functionality
- [x] **Create Blog Posts** - Rich text editor with title and content
- [x] **View Blog Posts** - Beautiful grid layout with responsive design
- [x] **Edit Blog Posts** - Full CRUD operations with admin interface
- [x] **Delete Blog Posts** - One-click deletion with confirmation
- [x] **Category Management** - Create and assign categories to posts
- [x] **Publish/Draft System** - Posts are published immediately upon creation

### ✅ Priority 2 - Enhanced Features
- [x] **Category Creation During Post Creation** - Create categories on-the-fly
- [x] **Responsive Design** - Works perfectly on desktop and mobile
- [x] **Admin Dashboard** - Comprehensive management interface
- [x] **Post Filtering** - Filter by published/draft status
- [x] **SEO Optimization** - Dynamic metadata generation
- [x] **Database Relations** - Proper many-to-many category relationships

### ✅ Priority 3 - Polish & UX
- [x] **Hover Effects** - Interactive post cards with smooth animations
- [x] **Loading States** - Proper loading indicators
- [x] **Error Handling** - Graceful error messages and validation
- [x] **Instant Updates** - Real-time UI updates after operations
- [x] **Clean URLs** - SEO-friendly slugs for all posts
- [x] **No-Redirect Deletion** - Posts vanish from homepage without navigation

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons
- **Radix UI** - Accessible UI components

### Backend
- **tRPC** - End-to-end typesafe APIs
- **Drizzle ORM** - Type-safe database queries
- **Neon PostgreSQL** - Serverless PostgreSQL database
- **Zod** - Schema validation

### Development
- **ESLint** - Code linting
- **Drizzle Kit** - Database migrations and management

## 📦 Setup Instructions

### Prerequisites
- Node.js 18+ installed
- A Neon PostgreSQL database account

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd project
npm install
```

### 2. Database Setup
1. Create a new project in [Neon Console](https://console.neon.tech)
2. Copy your connection string
3. Create `.env.local` file:
```bash
DATABASE_URL="postgresql://*****************@ep-winter-fire-a4selt05-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

### 3. Database Migration
```bash
# Generate and apply database schema
npm run db:push

# Optional: Open database studio
npm run db:studio
```

### 4. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see your blog!

## 🎯 Usage

### Creating Posts
1. Click **"Create Post"** button on homepage
2. Fill in title and content
3. Create/select categories as needed
4. Click **"Save Post"** - automatically published and visible

### Managing Posts
1. Visit `/admin` for the admin dashboard
2. View all posts (published and drafts)
3. Edit, publish/unpublish, or delete posts
4. Manage categories

### Deleting Posts
1. Hover over any post card on homepage
2. Click the trash icon that appears
3. Confirm deletion - post vanishes immediately

## 🏗️ Project Structure

```
project/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/             # Admin interface
│   │   ├── posts/             # Blog post pages
│   │   └── categories/        # Category pages
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   └── *.tsx             # Feature components
│   ├── db/                   # Database schema and migrations
│   ├── lib/                  # Utilities and configurations
│   └── server/               # tRPC routers and API logic
├── drizzle.config.ts         # Database configuration
└── package.json              # Dependencies and scripts
```

## 🔧 Key Design Decisions

### Database Architecture
- **PostgreSQL with Drizzle ORM** - Chosen for type safety and excellent TypeScript integration
- **Many-to-many relationships** - Posts can have multiple categories
- **Cascade deletes** - Removing posts automatically cleans up category relationships

### API Design
- **tRPC** - Provides end-to-end type safety from database to frontend
- **Zod validation** - All inputs are validated at the API level
- **Error handling** - Comprehensive error messages and graceful failures

### UX Decisions
- **Immediate publishing** - Posts are published when "Save Post" is clicked
- **No-redirect deletion** - Posts disappear from homepage without navigation
- **Hover interactions** - Edit/delete buttons appear on hover for clean UI
- **Category creation during post creation** - Streamlined workflow

### Performance Optimizations
- **Connection pooling** - Optimized database connections for Neon
- **Efficient queries** - Single queries with joins to minimize database round trips
- **Static generation** - Pages are pre-rendered where possible

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables
Make sure to set your `DATABASE_URL` in your production environment.

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Apply database migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

Built with ❤️ using modern web technologies for a fast, reliable, and beautiful blogging experience.
