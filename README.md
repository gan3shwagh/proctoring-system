# 🎓 AI Proctoring System

An intelligent exam proctoring system with real-time AI monitoring, violation detection, and comprehensive analytics.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6.svg)
![Node](https://img.shields.io/badge/Node.js-18+-339933.svg)

## ✨ Features

### For Students
- 🔐 **Secure Authentication** - Email/password with face photo registration
- 📝 **Exam Taking** - Clean, distraction-free exam interface
- 📊 **Results & History** - View scores, correct/incorrect answers, and past exams
- 🎯 **Real-time Feedback** - Instant violation warnings during exams

### For Instructors
- 👥 **Live Monitoring** - Real-time student feed with violation alerts
- 📈 **Session Analytics** - Credibility scores and violation breakdowns
- 📚 **Exam Management** - Create, edit, and delete exams with custom questions
- 🔍 **Detailed Reports** - Session-by-session violation timelines

### AI Proctoring Features
- 👁️ **Gaze Detection** - Tracks eye movement and looking away
- 👤 **Face Detection** - Ensures student presence and identity
- 🔊 **Audio Monitoring** - Detects unauthorized speech
- 🪟 **Tab Switching** - Monitors focus and window changes
- 📱 **Multiple Faces** - Detects additional people in frame

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first styling
- **Zustand** - State management
- **MediaPipe** - AI/ML for face & gaze detection

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Supabase** - PostgreSQL database & auth

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR-USERNAME/proctoring-system.git
cd proctoring-system
```

2. **Install dependencies**
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL migrations in order:
     1. `supabase_schema.sql`
     2. `add_user_roles.sql`
     3. `add_exam_results.sql`
   - Run the auto-profile trigger SQL (see Database Setup below)

4. **Configure environment variables**

**Client** (`client/.env`):
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Server** (`server/.env`):
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PORT=3000
```

5. **Start development servers**
```bash
# Terminal 1 - Start client
cd client
npm run dev

# Terminal 2 - Start server
cd server
npm run dev
```

6. **Access the application**
   - Client: http://localhost:5173
   - Server: http://localhost:3000

## 📊 Database Setup

### Auto-create User Profiles (Important!)

Run this in Supabase SQL Editor to automatically create user profiles on signup:

```sql
-- Create function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, name, role)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'User'), 'student');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Make a User an Instructor

```sql
UPDATE user_profiles 
SET role = 'instructor' 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
```

## 🌐 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repo
3. Configure:
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy!

### Backend (Railway)

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
4. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `PORT` (Railway sets this automatically)
5. Deploy!

### Update API URL

After deploying backend, update `client/src/services/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.PROD 
    ? 'https://your-backend.railway.app/api'
    : 'http://localhost:3000/api';
```

## 📁 Project Structure

```
proctoring-system/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts (Auth)
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── store/         # Zustand stores
│   └── package.json
├── server/                # Express backend
│   ├── src/
│   │   ├── routes/       # API routes
│   │   └── lib/          # Utilities
│   └── package.json
├── supabase_schema.sql   # Database schema
├── add_user_roles.sql    # Role system migration
└── add_exam_results.sql  # Results feature migration
```

## 🔒 Security Features

- Row Level Security (RLS) policies
- JWT-based authentication
- Service role for instructor access
- Face photo verification
- Secure session management

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using React, Node.js, and Supabase
