# Gemini Development Guidelines for Vox Language App

This document provides a summary of the key development principles and procedures to follow when working on the Vox Language App. It is based on the extensive documentation in the `/docs` directory.

## 🚀 Core Philosophy

- **Effort over Perfection**: Reward practice attempts, not just accuracy. Create a safe space for learning.
- **Offline-First**: Core features must be available without an internet connection.
- **Incremental Development**: Build one screen at a time to ensure quality and focus.

##  workflow

We will follow a structured workflow to ensure code quality, consistency, and alignment with project goals.

### 1. Screen-by-Screen Development

To maintain focus and quality, we will adhere to a strict screen-by-screen development process. Do not start work on a new screen or feature until the current one is complete and tested.

The development order for the current phase is documented in `docs/PROJECT_STATUS.md`.

### 2. Code Analysis and Modification

Before making any changes to a file:
1.  **Understand the Context**: Read the entire file to understand its purpose, components, and logic.
2.  **Identify Dependencies**: Analyze how the file interacts with other parts of the application (components, hooks, state, etc.).
3.  **Assess Impact**: Consider the potential side effects of your changes. The goal is to enhance functionality without introducing breaking changes.

### 3. Committing and Documentation

- **Commit After Each Logical Unit**: Commits should be made after a significant, self-contained unit of work is complete (e.g., a screen is fully implemented, a major bug is fixed).
- **Use Conventional Commit Messages**: Follow the format outlined in `docs/claude.md`:
  ```
  Phase X: Brief description

  - Detailed change 1
  - Detailed change 2
  - Detailed change 3
  ```
- **Document "Why"**: When changes are made, the primary focus of documentation (in commit messages or code comments) should be on *why* the change was necessary, not just *what* was changed.

## 📱 Environment Setup

The project is built with Expo, allowing for a single codebase for both iOS and Android.

### Prerequisites
1.  **Node.js**: Install the latest LTS version.
2.  **Expo CLI**: Install globally with `npm install -g expo-cli`.
3.  **Simulator/Emulator**:
    -   **iOS**: Install Xcode.
    -   **Android**: Install Android Studio.
4.  **Environment Variables**: Copy `.env.example` to `.env` and fill in the Supabase and Gemini API keys.

### Running the App
```bash
# Install dependencies
npm install

# Start the development server
npx expo start

# To run on a specific platform
npx expo start --ios
npx expo start --android

# To clear the cache if you encounter issues
npx expo start -c
```

## 🔌 Offline-First Architecture

Optimizing for offline capabilities is a core requirement. The strategy is detailed in `docs/offline-architecture.md`.

### Key Principles
- **Primary Data Source**: The local SQLite database is the single source of truth for the UI.
- **Syncing**: Data is synced with Supabase when the device is online.
- **Queueing**: Changes made offline are queued and synced automatically when the connection is restored.
- **Preloading**: Lessons, images, and audio files are pre-downloaded for offline use.

### What Must Work Offline
- All Flashcard review cycles (Learning, Listening, Speaking).
- Spaced Repetition calculations.
- Games and exercises (with pre-downloaded content).
- Reading practice for pre-downloaded stories.
- Audio recording.
- Point and streak tracking (values are synced later).

When implementing features, always prioritize this offline functionality. Test thoroughly in an offline environment.

## ✅ Testing Checklist

For every feature or screen, ensure the following before committing:
- [ ] Works on iOS.
- [ ] Works on Android.
- [ ] Works completely offline (if applicable).
- [ ] Handles loading states gracefully.
- [ ] Handles error states without crashing.
- [ ] Animations are smooth (60fps).
- [ ] Data syncs correctly when the app comes back online.

By adhering to these guidelines, we can build a high-quality, stable, and robust application that meets the user's vision. This document serves as our primary reference; for more detail, always refer to the complete documentation in the `/docs` directory.
