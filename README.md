# 🎓 Vox Language App

A mobile language learning application built with React Native (Expo) that uses spaced repetition, gamification, and AI to help users learn languages through immediate practice.

**Status**: 🚧 In Development - Phase 3 (Core Learning Mechanics)
**Version**: 1.0.0
**Last Updated**: 2025-11-20

---

## 🎯 Project Vision

Create a self-directed language learning app where users:
- Choose topics they care about (categories-first approach)
- Learn through **immediate practice** (not passive studying)
- Build confidence through **trials, not perfection**
- See **results from day one**

### Core Philosophy
> "Jump in, practice immediately, learn what you need, when you need it"

---

## ✨ Features

### ✅ Implemented
- **Authentication** - Email/password login and signup with Supabase
- **Offline-First Database** - SQLite with Supabase sync
- **Spaced Repetition** - SM-2 algorithm for optimal learning
- **50+ Vocabulary Words** - Across 4 categories (Food, Travel, Verbs, Objects)
- **Beautiful UI** - NativeWind (Tailwind) with smooth animations

### 🚧 In Progress
- **3-Card Learning Cycle** - Learning → Listening → Speaking
- **Flashcard System** - Interactive flashcards with audio
- **Session Flow** - 10-20 minute learning sessions

### 📋 Planned
- **Games** - Tap-to-Match, Multiple Choice
- **AI-Generated Content** - Personalized stories and lessons
- **Community Features** - Share recordings, get feedback
- **Progress Tracking** - Streaks, points, leaderboards

---

## 🛠 Tech Stack

- **Framework**: React Native (Expo SDK 54)
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based)
- **Styling**: NativeWind (Tailwind CSS)
- **Animations**: React Native Reanimated 3
- **Database**: SQLite (local) + Supabase (cloud sync)
- **State**: Zustand + React Query
- **Audio**: Expo AV
- **AI**: Google Gemini

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator
- Supabase account (free tier works)

### Installation

1. **Clone and install**:
```bash
cd "vox-language-app"
npm install
```

2. **Set up environment variables**:
```bash
# Copy example and fill in your credentials
cp .env.example .env

# Edit .env with your values:
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_key (optional)
```

3. **Start development server**:
```bash
npx expo start

# For specific platform:
npx expo start --ios
npx expo start --android
```

4. **Open in Expo Go** (easiest):
- Install Expo Go on your phone
- Scan QR code from terminal

---

## 📁 Project Structure

```
vox-language-app/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Login, signup, onboarding
│   ├── (tabs)/            # Main app tabs
│   ├── flashcard/         # Flashcard session screens
│   └── _layout.tsx        # Root layout with initialization
├── components/            # Reusable components
│   ├── flashcards/       # Flashcard components
│   ├── games/            # Game components
│   └── ui/               # UI components
├── lib/                   # Core logic
│   ├── db/               # Database utilities
│   ├── spaced-repetition/# SM-2 algorithm
│   └── config/           # Configuration
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript types
├── docs/                  # Documentation
│   ├── PROJECT_STATUS.md  # Current status
│   ├── PROGRESS_REPORT.md # Latest progress
│   └── claude.md          # Main reference
├── GEMINI_TASKS.md       # Tasks for Gemini AI
├── TROUBLESHOOTING.md    # Common issues
└── TODO.md               # Task list
```

---

## 📚 Documentation

- **[PROJECT_STATUS.md](docs/PROJECT_STATUS.md)** - Current phase, completed work, roadmap
- **[PROGRESS_REPORT.md](docs/PROGRESS_REPORT.md)** - Latest session report
- **[claude.md](docs/claude.md)** - Comprehensive project reference
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues & solutions
- **[GEMINI_TASKS.md](GEMINI_TASKS.md)** - Tasks for AI assistant
- **[TODO.md](TODO.md)** - Current sprint tasks

---

## 🤖 Working with AI Assistants

This project is designed to be collaboratively built with AI assistants (Claude & Gemini).

### For Claude:
- Main development partner
- Reviews `docs/PROJECT_STATUS.md` for current state
- Focuses on architecture, database, and core logic
- Updates documentation after each session

### For Gemini:
- Check `GEMINI_TASKS.md` for assigned tasks
- Focus on component development
- Follow existing patterns in codebase
- Document all work and questions

---

## 🧪 Testing

```bash
# Start with clear cache
npx expo start --clear

# Run on specific platform
npx expo start --ios
npx expo start --android

# Check for issues
npx expo-doctor

# Fix dependencies
npx expo install --fix
```

---

## 🗄 Database

### Local (SQLite)
- Primary data source
- Works 100% offline
- Stores flashcards, progress, sessions

### Cloud (Supabase)
- Backup and sync
- Enables cross-device sync
- Authentication provider

### Initialization
Automatic on app start (see `app/_layout.tsx`):
1. Validates environment variables
2. Creates SQLite tables
3. Inserts 50+ sample flashcards
4. Ready to use!

---

## 🎨 Design System

### Colors
- Primary: `#2196F3` (Blue)
- Success: `#4CAF50` (Green)
- Error: `#F44336` (Red)
- Warning: `#FF9800` (Orange)

### Typography
- Headings: Bold, large
- Body: Regular, readable
- Code: Monospace

### Components
- Use NativeWind classes: `className="bg-blue-500 p-4 rounded-lg"`
- Animations with Reanimated: `FadeIn`, `FadeOut`, etc.
- Consistent spacing: 4, 8, 12, 16, 24, 32 (multiples of 4)

---

## 🔐 Environment Variables

Required:
- `EXPO_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key

Optional:
- `EXPO_PUBLIC_GEMINI_API_KEY` - For AI features (future)

**Note**: All client-side env vars must start with `EXPO_PUBLIC_`

---

## 🐛 Troubleshooting

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues.

**Quick fixes**:
```bash
# 90% of issues
pkill -f "expo start"
rm -rf node_modules .expo
npm install
npx expo start --clear

# Check diagnostics
npx expo-doctor
```

---

## 🚀 Deployment

Coming soon - see `docs/future-features.md` for planned deployment strategy.

---

## 📄 License

Private project - All rights reserved.

---

## 👥 Contributors

- **Angel Polanco** - Project Owner
- **Claude Code** - AI Development Partner
- **Gemini** - AI Component Developer

---

## 📞 Support

- Check documentation in `/docs`
- Review `TROUBLESHOOTING.md`
- Ask Claude or Gemini for help

---

**Happy Learning! 🎉**
