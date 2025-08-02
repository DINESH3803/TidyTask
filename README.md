# TidyTask 🎯

A beautiful, gamified task management app that transforms your productivity journey into an engaging experience. Built with modern web technologies for a smooth, delightful user experience.

![TidyTask Preview](https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop)

## ✨ Features

- **🎮 Gamification**: XP system, levels, streaks, and achievements
- **🌓 Dark/Light Theme**: Beautiful themes that adapt to your preference
- **📱 Responsive Design**: Works perfectly on all devices
- **🎨 Modern UI**: Glassmorphism design with smooth animations
- **⚡ Fast**: Built with Vite for lightning-fast development and builds
- **🔧 TypeScript**: Full type safety throughout the application
- **🎯 Accessibility**: WCAG compliant and keyboard navigable

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm 8+ (recommended package manager)
- Supabase account (for backend features)

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo-url>
   cd tidytask
   pnpm install
   ```

2. **Set up Supabase:**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Create a `.env.local` file with your Supabase credentials:
     ```
     VITE_SUPABASE_URL=your_supabase_url_here
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
     ```

3. **Set up the database:**
   - Run the SQL commands in the Supabase SQL editor (see Database Schema section)

4. **Start the development server:**
   ```bash
   pnpm dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:5173` to see your app running!

### Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Lint code
pnpm lint

# Auto-fix lint issues
pnpm lint:fix

# Format code with Prettier
pnpm format

# Check code formatting
pnpm format:check

# Type check without building
pnpm type-check
```

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Backend**: Supabase (PostgreSQL database, Authentication, Real-time)
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React
- **Code Quality**: ESLint + Prettier
- **Type Safety**: TypeScript with strict mode
- **State Management**: Zustand with persistence
- **Authentication**: Supabase Auth with email/password

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AuthModal.tsx   # Authentication modal
│   ├── Layout.tsx      # Main app layout
│   └── ...
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
│   └── supabase.ts     # Supabase client configuration
├── stores/             # State management (Zustand)
│   ├── authStore.ts    # Authentication state
│   └── taskStore.ts    # Task management state
├── types/              # TypeScript type definitions
└── styles/             # Additional CSS files
```

## 🗄️ Database Schema

Run these SQL commands in your Supabase SQL editor:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create users table
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT NOT NULL,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  last_completion_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  category TEXT NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  xp_reward INTEGER DEFAULT 10,
  completed_at TIMESTAMPTZ,
  favorite BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);
```

## 🎨 Design System

TidyTask uses a carefully crafted design system with:

- **Color Palette**: HSL-based colors for better theme support
- **Typography**: Inter font family with multiple weights
- **Spacing**: 8px base grid system
- **Border Radius**: Consistent rounded corners
- **Shadows**: Layered shadows for depth
- **Animations**: Smooth, purposeful micro-interactions

### Theme Configuration

The app supports both light and dark themes with CSS custom properties. Themes are configured in `src/index.css` and can be toggled programmatically.

## 🔧 Configuration

### Absolute Imports

The project is configured with absolute imports using the `@/` prefix:

```typescript
// Instead of: import Button from '../../../components/Button'
import Button from '@/components/Button'
```

### Tailwind CSS

Custom configuration includes:
- Dark mode support (`class` strategy)
- Custom color palette with CSS variables
- Extended animations and keyframes
- Custom utility classes

### TypeScript

Strict TypeScript configuration with:
- Path mapping for absolute imports
- Strict type checking
- Unused variable detection
- Proper module resolution

## 📦 Adding Dependencies

Use pnpm for dependency management:

```bash
# Add a dependency
pnpm add package-name

# Add a dev dependency
pnpm add -D package-name

# Remove a dependency
pnpm remove package-name
```

## 🚀 Deployment

### Environment Variables

Make sure to set these environment variables in your deployment platform:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Build for Production

```bash
pnpm build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

### Deployment Platforms

This app can be deployed to:
- **Vercel**: Zero-config deployment
- **Netlify**: Drag and drop or Git integration
- **GitHub Pages**: Static site hosting
- **Firebase Hosting**: Google's hosting solution

## 🧪 Testing (Coming Soon)

- **Unit Tests**: Vitest + React Testing Library
- **E2E Tests**: Playwright
- **Component Tests**: Storybook

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- Design inspiration from modern productivity apps
- Built with love using React and TypeScript

---

**Happy Task Managing! 🎯**

> "The secret of getting ahead is getting started." - Mark Twain