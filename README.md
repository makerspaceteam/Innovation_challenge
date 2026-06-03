# Makers Innovation Quest

A 20-day design thinking journey application built with **React** frontend and **Node.js/Express** backend.

## 🎯 Overview

Makers Innovation Quest is an interactive learning platform that guides users through a 20-day design thinking journey across four phases:

- **Discover (Days 1-5)**: Explore & understand the world around you
- **Define (Days 6-10)**: Find real needs and frame the right problem
- **Develop (Days 11-15)**: Imagine, brainstorm and create ideas that matter
- **Deliver (Days 16-20)**: Build, test and share solutions that make an impact

## 📁 Project Structure

```
Innovation_Challenge/
├── frontend/                    # React Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.js
│   │   │   ├── LandingPage.css
│   │   │   ├── JourneyPage.js
│   │   │   ├── JourneyPage.css
│   │   │   ├── DayQuestPage.js
│   │   │   └── DayQuestPage.css
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
└── backend/                     # Node.js/Express Backend
    ├── routes/
    │   ├── quests.js           # Quest endpoints
    │   ├── users.js            # User management
    │   ├── submissions.js      # Quest submissions
    │   ├── progress.js         # Progress tracking
    │   └── badges.js           # Badge management
    ├── server.js               # Main server file
    ├── package.json
    └── .env.example
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Start the backend server:
```bash
# Development with auto-reload
npm run dev

# Or production mode
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## 🌐 API Endpoints

### Quests API
- `GET /api/quests` - Get all quests
- `GET /api/quests/day/:dayNumber` - Get specific day quest
- `GET /api/quests/phase/:phase` - Get quests by phase

### Users API
- `POST /api/users/create` - Create or get user
- `GET /api/users/:userId` - Get user details
- `PUT /api/users/:userId/progress` - Update user progress
- `GET /api/users/:userId/stats` - Get user statistics

### Submissions API
- `POST /api/submissions/create` - Submit quest response
- `GET /api/submissions/user/:userId` - Get user submissions
- `GET /api/submissions/:userId/:dayNumber` - Get specific submission
- `PUT /api/submissions/:submissionId/feedback` - Add feedback

### Progress API
- `GET /api/progress/:userId` - Get user's journey progress
- `POST /api/progress/:userId/complete-day` - Mark day as completed
- `GET /api/progress/:userId/phase/:phase` - Get phase progress
- `GET /api/progress/:userId/stats` - Get journey statistics

### Badges API
- `GET /api/badges` - Get all available badges
- `GET /api/badges/:badgeId` - Get badge details
- `GET /api/badges/user/:userId` - Get user's badges
- `POST /api/badges/award` - Award badge to user
- `POST /api/badges/check-eligibility` - Check badge eligibility
- `GET /api/badges/user/:userId/progress` - Get badge progress

## 📱 Pages

### Landing Page (`/`)
- Hero section with call-to-action
- Overview of the 20-day journey
- Phase description cards
- Features section
- Call-to-action for starting the quest

### Journey Page (`/journey`)
- Visual progress bar
- Double diamond navigation showing all phases
- Day dots showing completion status
- Current quest card
- Badge collection display

### Day Quest Page (`/quest/day/:dayNumber`)
- Detailed quest information
- Instructions and sentence frames
- Response submission form
- Success celebration screen
- Sidebar with progress stats and achievements

## 🎨 Features

✨ **Interactive Learning**
- Daily quests with clear instructions
- Personalized sentence frames
- User response submissions

🏆 **Achievement System**
- 8 progressive badge levels
- Points system
- Progress tracking

📊 **Progress Tracking**
- Visual progress bar
- Phase-based organization
- Completion statistics
- Badge collection display

🎭 **Engaging UI**
- Cute shark mascot character
- Colorful phase indicators
- Smooth animations
- Responsive design

## 🛠 Technology Stack

### Frontend
- **React 18** - UI library
- **React Router** - Navigation
- **CSS3** - Styling with animations
- **Axios** - HTTP client

### Backend
- **Express.js** - Web framework
- **Node.js** - Runtime environment
- **UUID** - Unique identifier generation
- **CORS** - Cross-origin support
- **Dotenv** - Environment variables

## 📝 Data Flow

1. User starts on landing page
2. Creates an account or logs in
3. Views the 20-day journey
4. Selects a day to complete a quest
5. Submits response for the quest
6. Receives points and feedback
7. Earns badges as milestones are reached
8. Tracks progress across all 20 days

## 🔧 Customization

### Adding New Quests
Edit the `questsData` object in `backend/routes/quests.js`:

```javascript
const questsData = {
  21: { 
    day: 21, 
    title: 'Your Quest Title', 
    phase: 'Phase Name', 
    description: 'Quest description'
  }
};
```

### Adding New Badges
Edit the `badgesDefinition` array in `backend/routes/badges.js`

### Customizing Colors
Update the CSS color variables in the `.css` files:
- Primary: `#0051ba`
- Secondary: `#4f46e5`
- Phase colors: Various in component CSS files

## 📦 Deployment

### Backend Deployment (Heroku example)
```bash
heroku create your-app-name
git push heroku main
```

### Frontend Deployment (Vercel example)
```bash
npm install -g vercel
vercel
```

## 🐛 Troubleshooting

### CORS Issues
Make sure the backend CORS is properly configured in `server.js`

### Port Conflicts
If port 5000 or 3000 is already in use, change the port in:
- Backend: `.env` file
- Frontend: `react-scripts` configuration

### Dependencies Not Installing
Try clearing npm cache:
```bash
npm cache clean --force
```

## 📚 Learning Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [Design Thinking Resources](https://www.ideo.com/about)

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

This project is part of the Makers Innovation Challenge.

## 💡 Support

For questions or support, please contact the Makers team.

---

**Happy Making and Innovating! 🚀**