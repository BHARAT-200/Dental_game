# 🦷 Ultimate Dental Quiz Challenge

A comprehensive 5-round dental science quiz application built with React, Vite, Tailwind CSS, and Framer Motion.

## 🎮 Game Rounds

1. **Round 1 — Image Identification** 🖼️  
   Students identify dental concepts by viewing two images and typing their answer. Up to 10 questions selected randomly from the admin question bank. +10 points per correct answer.

2. **Round 2 — This or That** ⚖️  
   Multiple-choice questions with two options. Students choose the correct dental answer. +10 points each.

3. **Round 3 — Riddles** 🧩  
   Solve dental science riddles with optional hints. Free-text answers with fuzzy matching. +15 points each.

4. **Round 4 — Multiple Choice Questions** 📝  
   Traditional MCQ format with 4 options. Detailed explanations provided. +10 points each.

5. **Round 5 — Rapid Fire** ⚡  
   Quick-fire questions with countdown timers. Test your speed and knowledge. +5 points each.

## ✨ Key Features

- **Persistent Admin Question Bank**: Add, edit, and delete questions for all 5 rounds via the Admin Panel
- **Image Storage**: Upload and store images as compressed base64 data URLs in localStorage
- **Random Game Mode**: Automatically selects questions from the admin bank
- **Custom Game Builder**: Create temporary custom games with specific questions
- **Leaderboard**: Track top 10 scores with player names and performance badges
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Sound Effects**: Optional audio feedback for interactions
- **Confetti Animations**: Celebrate achievements with particle effects
- **Glass Morphism UI**: Modern, elegant dark theme design

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── Background.jsx
│   ├── Button.jsx
│   ├── Confetti.jsx
│   ├── Navbar.jsx
│   ├── ProgressBar.jsx
│   └── ScoreDisplay.jsx
├── data/
│   └── questions.js  # Default question data (mostly empty - use Admin Panel)
├── hooks/
│   ├── useAdminQuestions.js  # Admin question bank management
│   ├── useGameState.js       # Game state and flow
│   └── useSettings.js        # User preferences
├── pages/            # Main application pages
│   ├── AdminPanel.jsx        # Question bank management
│   ├── Home.jsx
│   ├── Instructions.jsx
│   ├── Leaderboard.jsx
│   ├── QuestionBuilder.jsx   # Custom game builder
│   ├── ResultPage.jsx
│   ├── Round1Images.jsx      # NEW: Image identification
│   ├── Round2ThisOrThat.jsx
│   ├── Round3Riddles.jsx
│   ├── Round4MCQ.jsx
│   └── Round5RapidFire.jsx
├── utils/
│   ├── helpers.js    # Utility functions (shuffle, pickRandom, answersMatch)
│   ├── sounds.js     # Audio playback
│   └── storage.js    # localStorage wrapper
├── App.jsx           # Main app component with routing
└── main.jsx          # Entry point
```

## 🖼️ Round 1: Image Questions

### Admin Panel - Adding Image Questions

1. Open **Admin Panel** from the home screen
2. Select **Round 1 — Image Questions**
3. Click **Add Image Question**
4. Upload two images (automatically compressed to ~500KB each)
5. Enter the answer
6. Optionally add a hint and explanation
7. Click **Save**

### Image Storage

- Images are stored as **base64 data URLs** in localStorage
- Automatic compression keeps each image under 500KB
- Maximum resolution scaled to 1200px
- JPEG compression quality: 70%
- Works offline - no backend required

### Game Behavior

- Exactly **10 questions** are randomly selected per game (or all available if fewer than 10)
- Students see both images side-by-side
- Type their answer in a text field
- Answer matching is case-insensitive with fuzzy matching for long answers
- Optional hints available before submitting
- Correct answer and explanation shown after submission

## 🔧 Admin Panel

The Admin Panel provides full CRUD operations for all question types:

- **Round 1**: Image Questions (upload 2 images, define answer)
- **Round 2**: This or That (question with 2 options)
- **Round 3**: Riddles (riddle text + answer + optional hint)
- **Round 4**: MCQ (question + 4 options + explanation)
- **Round 5**: Rapid Fire (question + answer + time limit)

All changes are:
- ✅ Saved to localStorage
- ✅ Persistent across page refreshes
- ✅ Preserved in browser sessions
- ✅ Used in all future Random Games

### Reset to Defaults

The "Reset to Defaults" button restores the original dental science question bank.

**Note**: For Round 1 (images), the default bank is empty. You must add your own image questions through the Admin Panel.

## 🎮 Game Modes

### Random Game
- Uses questions from the Admin Question Bank
- Randomly selects questions for each round
- Quick start - no configuration needed

### Custom Game
- Configure questions for Rounds 2-5 via Question Builder
- Round 1 always uses Admin Panel images (cannot be customized in builder)
- Temporary - does not affect persistent admin bank
- Export/import custom game configurations as JSON

## 💾 Data Persistence

All data is stored in **localStorage**:

- `qc_admin_questions`: Persistent question bank
- `qc_leaderboard`: Top 10 scores
- `qc_best_score`: User's personal best
- `qc_settings`: Sound/theme preferences

### Storage Considerations

- Round 1 image questions can consume significant localStorage space
- Browser limit: typically 5-10MB per domain
- Recommend limiting to 20-30 image questions maximum
- Consider clearing old questions if approaching storage limits

## 🎨 Tech Stack

- **React 19** - UI framework
- **Vite 8** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animations and transitions
- **Lucide React** - Icon library
- **Oxlint** - Fast JavaScript linter

## 📝 Recent Changes (Round 1 Refactor)

### What Changed

- ❌ Removed: Crossword puzzle round and auto-generation
- ✅ Added: Image-based identification round
- ✅ Added: Image upload and compression in Admin Panel
- ✅ Added: Base64 storage for offline image access
- ✅ Updated: All UI references from "Crossword" to "Identify Images"

### Files Created
- `src/pages/Round1Images.jsx` - New round component

### Files Modified
- `src/data/questions.js` - Replaced `crosswordWords` with `imageQuestions`
- `src/hooks/useAdminQuestions.js` - Updated to handle image questions
- `src/hooks/useGameState.js` - Random selection of 10 images
- `src/pages/AdminPanel.jsx` - Image upload panel with compression
- `src/pages/QuestionBuilder.jsx` - Updated for Round 1 (uses admin images)
- `src/App.jsx` - Route to Round1Images component
- `src/pages/Instructions.jsx` - Updated round description
- `src/pages/Home.jsx` - Updated UI labels
- `src/components/ProgressBar.jsx` - Updated round display
- `src/utils/storage.js` - Schema updated for `images` array

### Files Removed
- `src/utils/crosswordGenerator.js` - No longer needed
- `src/pages/Round1Crossword.jsx` - Replaced by Round1Images.jsx

## ⚠️ Limitations

- **localStorage Only**: No backend - all data stored locally
- **Per-Browser Storage**: Questions don't sync across browsers/devices
- **Storage Limits**: ~5-10MB total per domain (browser-dependent)
- **Image Size**: Recommend keeping admin bank under 30 image questions
- **Base64 Overhead**: Images stored as base64 (~33% larger than binary)

## 🏗️ Future Enhancements (Optional)

- Backend integration for cloud storage
- Multi-user support with authentication
- Image CDN integration instead of base64
- Bulk import/export of image questions
- Question tagging and categorization
- Difficulty levels and adaptive quizzing

## 📄 License

This project is open source. Use it for educational purposes.

---

Built with ❤️ for dental education
