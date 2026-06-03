# Project File Structure

## Frontend Files
```
frontend/
├── public/
│   └── index.html                 # Main HTML file
├── src/
│   ├── App.js                     # Main app component with routing
│   ├── App.css                    # Global styles
│   ├── index.js                   # React entry point
│   ├── index.css                  # Global CSS
│   └── pages/
│       ├── LandingPage.js         # Home page component
│       ├── LandingPage.css        # Landing page styles
│       ├── JourneyPage.js         # 20-day journey tracker
│       ├── JourneyPage.css        # Journey page styles
│       ├── DayQuestPage.js        # Individual quest page
│       └── DayQuestPage.css       # Quest page styles
└── package.json                   # Frontend dependencies
```

## Backend Files
```
backend/
├── server.js                      # Main Express server
├── package.json                   # Backend dependencies
├── .env.example                   # Environment variable template
└── routes/
    ├── quests.js                  # Quest CRUD operations
    ├── users.js                   # User management
    ├── submissions.js             # Quest submission handling
    ├── progress.js                # Progress tracking
    └── badges.js                  # Badge system
```

## Root Files
```
Innovation_Challenge/
├── README.md                      # Full documentation
├── QUICK_START.md                 # Quick setup guide
├── FILE_STRUCTURE.md              # This file
└── .gitignore                     # Git ignore rules
```

## Component Hierarchy

```
App
├── LandingPage
│   ├── Navigation
│   ├── Hero Section
│   ├── Phases Section
│   ├── Features Section
│   ├── CTA Section
│   └── Footer
├── JourneyPage
│   ├── Navigation
│   ├── Header
│   ├── Progress Section
│   ├── Diamond Navigation
│   ├── Day Phases
│   ├── Current Quest Card
│   ├── Badges Section
│   └── Footer
└── DayQuestPage
    ├── Navigation
    ├── Breadcrumb
    ├── Quest Header
    ├── Quest Description
    ├── Instructions
    ├── Sentence Frame
    ├── Tip Box
    ├── Response Form / Success Message
    ├── Sidebar (Progress, Phase Info, Achievement, Tips)
    └── Footer
```

## Backend Routes Structure

```
/api/
├── /quests
│   ├── GET /                  # All quests
│   ├── GET /day/:dayNumber    # Specific day quest
│   └── GET /phase/:phase      # Phase quests
├── /users
│   ├── POST /create           # Create user
│   ├── GET /:userId           # User details
│   ├── PUT /:userId/progress  # Update progress
│   └── GET /:userId/stats     # User stats
├── /submissions
│   ├── POST /create           # Create submission
│   ├── GET /user/:userId      # User submissions
│   ├── GET /:userId/:dayNumber # Specific submission
│   └── PUT /:submissionId/feedback # Add feedback
├── /progress
│   ├── GET /:userId           # User progress
│   ├── POST /:userId/complete-day # Mark day complete
│   ├── GET /:userId/phase/:phase # Phase progress
│   └── GET /:userId/stats     # Journey stats
└── /badges
    ├── GET /                  # All badges
    ├── GET /:badgeId          # Badge details
    ├── GET /user/:userId      # User badges
    ├── POST /award            # Award badge
    ├── POST /check-eligibility # Check eligibility
    └── GET /user/:userId/progress # Badge progress
```

## Key Features by Component

### LandingPage
- Hero section with animation
- Four phase cards (Discover, Define, Develop, Deliver)
- Feature highlights
- Call-to-action buttons
- Responsive grid layout

### JourneyPage
- Linear progress bar (8/20 days)
- Diamond phase navigation
- Four phase sections with day dots
- Color-coded phases (yellow, purple, pink, blue)
- Day dots with status (completed ✓, current ●, locked 🔒)
- Current quest card with mascot
- Badge achievement display

### DayQuestPage
- Breadcrumb navigation
- Phase indicator badge
- Quest title and description
- Mascot illustration
- Step-by-step instructions
- Sentence frame template
- Tip box with advice
- Textarea for response submission
- Success celebration screen
- Sidebar with:
  - Progress statistics
  - Phase information
  - Achievement preview
  - Daily tips checklist

## Styling System

### Color Scheme
- Primary Blue: `#0051ba`
- Secondary Purple: `#4f46e5`
- Discover (Yellow): `#fbbf24`
- Define (Purple): `#a78bfa`
- Develop (Pink): `#f472b6`
- Deliver (Blue): `#3b82f6`

### Responsive Breakpoints
- Desktop: 1024px+
- Tablet: 768px - 1023px
- Mobile: < 768px

### Key Animations
- Floating mascot
- Pulse effect on current day
- Hover scale effects
- Smooth transitions (0.3s)

## Data Models

### User
```javascript
{
  id: UUID,
  name: string,
  email: string,
  currentDay: number (1-20),
  completedDays: array,
  badges: array,
  points: number,
  joinedAt: ISO timestamp
}
```

### Quest
```javascript
{
  day: number,
  title: string,
  phase: string (Discover|Define|Develop|Deliver),
  description: string,
  instructions: array,
  sentenceFrame: string,
  tips: string
}
```

### Submission
```javascript
{
  id: UUID,
  userId: UUID,
  dayNumber: number,
  phase: string,
  response: string,
  submittedAt: ISO timestamp,
  feedback: string,
  pointsEarned: number
}
```

### Badge
```javascript
{
  id: number,
  level: number,
  name: string,
  description: string,
  icon: string,
  requiredCompletions: number,
  awardedAt: ISO timestamp (optional)
}
```

## Performance Considerations

- CSS animations use GPU-accelerated properties (transform, opacity)
- Component-based architecture for reusability
- In-memory data storage (ready for database integration)
- Async/await error handling in backend
- CORS enabled for frontend-backend communication

## Future Enhancement Opportunities

1. **Database Integration**: Replace in-memory storage with MongoDB/PostgreSQL
2. **Authentication**: Add JWT-based user authentication
3. **Notifications**: Email reminders and achievement notifications
4. **Analytics**: Track user engagement and completion rates
5. **Admin Dashboard**: Manage quests, badges, and user feedback
6. **Social Features**: User profiles, leaderboards, sharing
7. **Mobile App**: React Native mobile version
8. **Gamification**: Points, levels, streaks, challenges
9. **Content Management**: CMS for managing quests dynamically
10. **Localization**: Multi-language support
