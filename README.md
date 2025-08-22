# BandSeeking - Musician Connection Platform

A modern, elegant musician networking platform built with Next.js, Supabase, and Tailwind CSS. BandSeeking helps musicians connect with each other for bands, collaborations, and music projects.

## ✨ Features

### 🎵 Core Features
- **User Authentication** - Secure sign up, login, and email verification
- **Profile Creation** - Multi-step onboarding with detailed musical preferences
- **Profile Discovery** - Browse and search for musicians with advanced filtering
- **Real-time Chat** - Direct messaging between musicians using Supabase Realtime
- **Save Musicians** - Bookmark profiles for future collaboration
- **Location-based Search** - Find musicians within your preferred travel distance

### 🎸 Profile Features
- **Main & Secondary Instruments** - Showcase all your musical abilities
- **Experience Levels** - From beginner to professional
- **Genre Preferences** - Rock, Jazz, Blues, Electronic, and more
- **Collaboration Types** - Original bands, cover bands, session work, etc.
- **Availability Settings** - Weekdays, weekends, evenings, flexible
- **Logistics** - Transportation and equipment availability
- **Social Links** - Connect Instagram, YouTube, SoundCloud, Spotify
- **Travel Distance** - Set how far you're willing to travel

### 📱 User Experience
- **Mobile-First Design** - Responsive and optimized for mobile devices
- **Clean Black & White UI** - Elegant, minimal aesthetic
- **Real-time Updates** - Live chat and instant profile updates
- **Advanced Search** - Filter by instrument, genre, location, and more
- **User Dashboard** - Manage profile, messages, and saved musicians

## 🛠 Tech Stack

- **Frontend**: Next.js 15+ with App Router
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Hosting**: Vercel
- **Language**: TypeScript

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bandseeking
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. Set up the database:
- Run the SQL schema from `supabase/schema.sql` in your Supabase project
- Enable Row Level Security (RLS) for all tables
- Set up the authentication policies as defined in the schema

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) to view the application

## 📚 Project Structure

```
bandseeking/
├── app/                          # Next.js app directory
│   ├── auth/                     # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   └── verify/
│   ├── dashboard/                # User dashboard
│   │   ├── messages/             # Chat system
│   │   ├── profile/              # Profile management
│   │   └── saved/                # Saved musicians
│   ├── onboarding/               # Multi-step profile creation
│   ├── profile/[username]/       # Public profile pages
│   ├── search/                   # Search and filtering
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Homepage
├── components/                   # Reusable components
│   ├── layout/                   # Layout components
│   └── ui/                       # UI components
├── lib/                          # Utilities and configurations
│   ├── supabase.ts              # Supabase client
│   ├── database.types.ts        # TypeScript types
│   └── utils.ts                 # Helper functions
├── supabase/                     # Database schema
│   └── schema.sql               # PostgreSQL schema
└── vercel.json                  # Vercel configuration
```

## 🗃 Database Schema

### Core Tables
- **users** - User accounts with basic info and location
- **profiles** - Detailed musician profiles with preferences
- **saved_profiles** - User's saved/bookmarked musicians
- **messages** - Real-time chat messages between users

### Key Features
- Row Level Security (RLS) enabled on all tables
- Real-time subscriptions for chat functionality
- Geolocation support via latitude/longitude
- JSON fields for flexible data storage (social links)

## 🚀 Deployment

### Vercel Deployment

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Deploy automatically from main branch

### Environment Variables

Required environment variables for production:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 🎨 Design System

### Color Palette
- **Primary**: Black (`#000000`)
- **Secondary**: White (`#ffffff`) 
- **Accent**: Gray shades for depth and hierarchy
- **Interactive**: Hover states with subtle gray transitions

### Typography
- **Font**: Inter (Google Fonts)
- **Hierarchy**: Clear heading structure with consistent spacing
- **Readability**: Optimized for mobile and desktop screens

### Components
- **Buttons**: Primary (black), Secondary (outlined), Ghost (transparent)
- **Cards**: Clean borders with subtle shadows and hover effects
- **Forms**: Consistent input styling with focus states
- **Navigation**: Mobile-first responsive navigation

## 📱 Mobile Optimization

- **Touch-friendly**: 44px minimum tap targets
- **Responsive Grid**: Adapts from 1 to 4 columns based on screen size
- **Collapsible Filters**: Mobile-optimized search filters
- **Swipe Navigation**: Intuitive mobile interactions
- **Loading States**: Skeleton screens for better perceived performance

## 🔒 Security Features

- **Authentication**: Supabase Auth with email verification
- **Authorization**: Row Level Security (RLS) policies
- **Data Protection**: User data isolation and privacy controls
- **Input Validation**: Form validation with Zod schemas
- **SQL Injection Prevention**: Parameterized queries via Supabase

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Supabase** - For the amazing backend-as-a-service platform
- **Next.js** - For the excellent React framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Lucide React** - For the beautiful icon set
- **Vercel** - For seamless deployment platform

---

**Built with ❤️ for the music community**