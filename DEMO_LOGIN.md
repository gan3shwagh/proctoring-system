# Demo Admin Login - Quick Start

## 🎯 Login Credentials

**Username:** `admin`  
**Password:** `123`

## 📋 How to Use

1. **Start the development server**:
   ```bash
   cd /home/ganesh/Desktop/proctoring-system
   npm run dev
   ```

2. **Open the login page**: 
   - Go to `http://localhost:5173/login`

3. **Login with demo credentials**:
   - Username: `admin`
   - Password: `123`

4. **You'll be redirected to**: `/instructor` (Instructor Dashboard)

## ✅ What's Available

### Instructor Features:
- ✅ **Instructor Dashboard** - View all exam sessions with scores
- ✅ **Exam Management** - Create and manage exams
- ✅ **Live Proctoring** - Monitor students in real-time
- ✅ **Session Details** - Click any session to see detailed results

### Admin Features (with admin role):
- ✅ **User Management** - Manage students and teachers
- ✅ **Institute Management** - Create and manage institutes/branches

## 🔧 Technical Details

This is a **demo mode** that:
- Bypasses Supabase authentication
- Stores user info in `localStorage`
- Works without database connection
- Perfect for testing functionality

### Files Modified:
- `LoginPage.tsx` - Added demo login check
- `AuthContext.tsx` - Added demo user support
- `RoleProtectedRoute.tsx` - Added demo role check

## 🚀 Next Steps

When ready for production:
1. Remove demo login code from `LoginPage.tsx`
2. Set up proper Supabase authentication
3. Create real admin users in the database

## 📝 Notes

- Demo user has `admin` role by default
- Logout will clear the demo session
- Refresh page will maintain demo session
- No database connection needed for demo mode
