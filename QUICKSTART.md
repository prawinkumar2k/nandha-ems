# EduLearn - Quick Start Guide

Get started with EduLearn in 5 minutes!

## 🚀 Installation (1 minute)

```bash
# 1. Install dependencies
pnpm install

# 2. Start development server
pnpm run dev
```

That's it! The app is now running at `http://localhost:8080`

## 🔐 Login (2 minutes)

Use any of these demo accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | password |
| HOD | hod@example.com | password |
| Faculty | faculty@example.com | password |
| Student | student@example.com | password |

Choose your role and explore!

## 📱 Key Features to Try

### As an Admin
1. **Overview Tab**: See system statistics
2. **Users Tab**: Manage system users
3. **Courses Tab**: Manage all courses
4. **Analytics**: View system analytics
5. **Settings**: Configure system settings

### As a Faculty Member
1. **Overview**: See your teaching dashboard
2. **Courses**: Manage your courses
3. **Assignments**: Create and grade assignments
4. **Students**: View enrolled students
5. **Attendance**: Track student attendance with calendar view

### As a Student
1. **Overview**: See your academic progress
2. **Courses**: View enrolled courses with progress bars
3. **Assignments**: Submit your work
4. **Grades**: Check your marks
5. **Attendance**: View your attendance calendar

### Everyone Can
- **Take an Exam**: Navigate to `/exam/demo` to experience the secure exam system
  - Features: Timer, copy-paste blocking, tab switch detection
  - Try to copy-paste, switch tabs, or right-click!

## 🎨 Customization

### Change Colors
Edit `client/global.css` and `tailwind.config.ts`:

```css
:root {
  --primary: 217 91% 60%;        /* Change primary color */
  --accent: 35 100% 55%;         /* Change accent color */
  /* ... other colors ... */
}
```

### Add Your Institution Name
Edit `client/pages/Login.tsx`:
```typescript
<h1 className="text-3xl font-bold text-foreground">
  Your Institution Name LMS  {/* Change this */}
</h1>
```

## 🗄️ Connect MongoDB (5 minutes)

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions.

Quick version:
```bash
# 1. Create .env file
cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/lms
JWT_SECRET=your-secret-key
EOF

# 2. Restart server
# Changes will apply automatically
```

## 📁 Project Structure

```
client/              → React frontend
server/              → Express backend
shared/              → Shared types
README.md            → Full documentation
SETUP_GUIDE.md       → Database setup
QUICKSTART.md        → This file
```

## 🔧 Available Commands

```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Run production build
pnpm test             # Run tests
pnpm typecheck        # Check TypeScript
pnpm format.fix       # Format code
```

## 🎓 Understanding the Architecture

```
┌─────────────┐
│   Browser   │  (Your Computer)
│  (React UI) │
└──────┬──────┘
       │
    /api/
       │
┌──────▼──────────────┐
│  Express Server     │  (Localhost:8080)
│  (Backend Logic)    │
└──────┬──────────────┘
       │
       │ (When MongoDB connected)
┌──────▼──────────────┐
│  MongoDB Database   │
│  (Data Storage)     │
└─────────────────────┘
```

## 🔐 Security Features Implemented

✅ **Authentication**: JWT-based login system  
✅ **Authorization**: Role-based access control  
✅ **Protected Routes**: Authenticated users only  
✅ **Secure Exams**: Copy-paste blocking, tab switch detection  
✅ **Activity Logging**: Track suspicious behavior  

## 🆘 Troubleshooting

**App won't start?**
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm run dev
```

**Port 8080 already in use?**
```bash
lsof -ti:8080 | xargs kill -9
```

**TypeScript errors?**
```bash
pnpm typecheck
```

## 📚 Next Steps

1. ✅ Explore the demo accounts
2. ✅ Try the exam system with security features
3. ✅ Check the attendance calendar
4. 📌 Connect MongoDB (see SETUP_GUIDE.md)
5. 📌 Customize colors and branding
6. 📌 Deploy to production

## 🎯 Feature Checklist

- [x] Role-based authentication (Admin, HOD, Faculty, Student)
- [x] Professional dashboards for each role
- [x] Admin user management
- [x] Faculty course management
- [x] Exam system with security
- [x] Attendance tracking with calendar
- [x] Responsive mobile design
- [x] Modern UI with TailwindCSS
- [ ] MongoDB integration (see SETUP_GUIDE.md)
- [ ] File upload system
- [ ] Email notifications
- [ ] Real-time updates
- [ ] Advanced analytics

## 💡 Tips

1. **Responsive Design**: Resize browser to see mobile layout
2. **Exam Security**: Try all the security features in the exam
3. **Attendance**: Check the calendar for different status types
4. **Dark Mode**: System follows OS dark mode preference
5. **Demo Data**: All dashboards have example data to explore

## 🤖 Example: Adding a New Page

Want to add a new page? Here's how:

1. Create component in `client/pages/NewPage.tsx`
2. Add route in `client/App.tsx`
3. Link to it from navigation

```typescript
// client/pages/NewPage.tsx
export default function NewPage() {
  const { user } = useAuth();
  return <div>Hello {user?.name}!</div>;
}

// client/App.tsx
import NewPage from "./pages/NewPage";
// Add this route:
<Route path="/new-page" element={<ProtectedRoute><NewPage /></ProtectedRoute>} />
```

## 📞 Need Help?

1. Check [README.md](./README.md) for full documentation
2. See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for database setup
3. Review code comments in component files
4. Check browser console for errors (F12)

## 🎉 You're All Set!

Start building your LMS! Happy coding! 🚀

---

**Quick Links:**
- [Full Documentation](./README.md)
- [Setup Guide](./SETUP_GUIDE.md)
- [GitHub](https://github.com)
- [Report Issue](https://github.com/issues)
