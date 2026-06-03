# Quick Start Guide 🚀

Get the Makers Innovation Quest app running in 5 minutes!

## Step 1: Backend Setup (Terminal 1)

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Start the server
npm run dev
```

✅ Backend running on `http://localhost:5000`

## Step 2: Frontend Setup (Terminal 2)

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start the app
npm start
```

✅ Frontend running on `http://localhost:3000`

## You're Done! 🎉

Open your browser and go to: **http://localhost:3000**

## What You'll See

1. **Landing Page** - Welcome screen with journey overview
2. **Journey Page** - 20-day progress tracker with all phases
3. **Day Quest Pages** - Individual quest pages (try Day 8: "Point of View Power")

## 🔗 API Testing

Test the backend APIs using any REST client (Postman, Insomnia, etc.):

```
http://localhost:5000/api/quests
http://localhost:5000/api/badges
http://localhost:5000/api/users/create (POST)
```

## 📸 Key Features to Try

✨ Click through the day dots on the Journey page
✨ Submit a quest response on any Day Quest page
✨ View the success celebration screen
✨ Check badge progress and achievements
✨ Responsive design - try resizing your browser

## 🆘 Troubleshooting

**Port already in use?**
```bash
# Change backend port in backend/.env
# Change frontend port with:
PORT=3001 npm start
```

**Dependencies issues?**
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

**Still having issues?**
1. Make sure you're in the correct folder before running npm
2. Check Node.js version: `node --version` (should be v14+)
3. Kill any existing processes on ports 3000 and 5000

## 🎓 Next Steps

- Customize quest content in `backend/routes/quests.js`
- Add more badges in `backend/routes/badges.js`
- Update colors and styling in CSS files
- Connect to a real database (MongoDB, PostgreSQL, etc.)
- Deploy to production!

## 📞 Need Help?

Check the main README.md for detailed documentation!

---

**Enjoy your Innovation Quest! 🐟✨**
