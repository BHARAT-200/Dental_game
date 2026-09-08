# 🔄 Migration Guide: Crossword to Image Identification

## Overview

Round 1 has been completely replaced:
- **Before**: Crossword puzzle with auto-generated grid
- **After**: Image identification with 2 images per question

## Breaking Changes

### 1. Data Structure Change

**Before (Crossword)**:
```javascript
{
  crossword: [
    {
      id: "cw_001",
      answer: "ENAMEL",
      hint: "Hardest tissue in the human body"
    }
  ]
}
```

**After (Images)**:
```javascript
{
  images: [
    {
      id: "img_001",
      image1: "data:image/jpeg;base64,...",  // Base64 encoded
      image2: "data:image/jpeg;base64,...",  // Base64 encoded
      answer: "Dental Caries",
      hint: "Optional hint text",             // Optional
      explanation: "Why this is correct"      // Optional
    }
  ]
}
```

### 2. localStorage Key Changes

The admin question bank structure in localStorage (`qc_admin_questions`) has changed:

- **Removed**: `crossword` array
- **Added**: `images` array

### 3. Question Count Logic

**Before**: 
- Selected 12 random crossword words
- Generated a crossword grid
- Variable number displayed based on grid generation success

**After**:
- Selects exactly **10 random image questions** per game
- Uses all available if fewer than 10 exist
- No auto-generation - images must be uploaded by admin

## Migration Path for Existing Installations

### Automatic Migration

The application handles the migration automatically:

1. **First Load After Update**:
   - Old `crossword` data in localStorage is ignored
   - New `images` array is initialized as empty
   - Other rounds (2-5) continue working normally

2. **No Data Loss for Rounds 2-5**:
   - This or That questions preserved
   - Riddles preserved
   - MCQ preserved
   - Rapid Fire preserved

### Manual Steps Required

Since crossword words cannot be automatically converted to images:

1. **Open Admin Panel** after updating
2. Navigate to **Round 1 — Image Questions**
3. Add new image questions:
   - Upload 2 relevant dental images
   - Provide the answer text
   - Add optional hints/explanations
4. Add at least 10 questions for a full game experience

### Optional: Preserve Old Crossword Data

If you want to keep your old crossword questions for reference:

1. Before updating, export localStorage:
```javascript
// Run in browser console
const data = localStorage.getItem('qc_admin_questions');
console.log(data);
// Copy and save to a file
```

2. After updating, old crossword data is still in localStorage but unused
3. You can manually reference it when creating new image questions

## Image Storage Requirements

### Size Guidelines

- **Maximum per image**: 5MB original upload
- **Stored size**: ~500KB after compression
- **Recommended total**: 20-30 image questions
- **localStorage limit**: 5-10MB total (browser-dependent)

### Calculating Storage Usage

Each image question uses approximately:
- 500KB (image1) + 500KB (image2) = ~1MB per question
- 10 questions = ~10MB
- 30 questions = ~30MB ⚠️ (may exceed some browser limits)

### Storage Best Practices

1. **Keep images under 2MB before upload** - automatic compression works best on reasonably-sized images
2. **Use JPEG format** - better compression than PNG
3. **Crop images** - remove unnecessary borders/whitespace
4. **Optimize before upload** - use image editing tools to reduce file size
5. **Monitor question count** - don't exceed 20-30 total image questions

### Checking Storage Usage

```javascript
// Run in browser console to check localStorage size
const size = new Blob(Object.values(localStorage)).size;
console.log(`Using ${(size / 1024 / 1024).toFixed(2)} MB`);
```

## API Changes

### Hook: `useAdminQuestions`

**Changed**:
```javascript
// Before
bank.crossword  // Array of crossword words

// After
bank.images     // Array of image questions
```

**Method signatures remain the same**:
```javascript
const { bank, addQuestion, updateQuestion, removeQuestion } = useAdminQuestions();

// Usage unchanged
addQuestion('images', newQuestion);
```

### Hook: `useGameState`

**Changed**:
```javascript
// Before
questions.crossword  // Crossword grid object

// After
questions.images     // Array of image questions (10 selected)
```

### Component Props

**Before**:
```jsx
<Round1Crossword 
  crosswordData={game.questions.crossword}
  onComplete={(score) => handleRoundComplete('round1', score)}
/>
```

**After**:
```jsx
<Round1Images 
  questions={game.questions.images}
  onComplete={(score) => handleRoundComplete('round1', score)}
/>
```

## Removed Files

These files have been deleted and are no longer used:

1. **`src/utils/crosswordGenerator.js`** - Crossword grid generation logic
2. **`src/pages/Round1Crossword.jsx`** - Old crossword component

If you have custom modifications in these files, you'll need to adapt them to the new image-based system.

## New Files

These files have been added:

1. **`src/pages/Round1Images.jsx`** - New image identification component

## Custom Game Builder Changes

The Question Builder (`/builder` route) has been updated:

- Round 1 section now shows a message that images must be managed via Admin Panel
- Custom games use random images from the admin question bank
- Cannot configure specific images per custom game
- Rounds 2-5 custom configuration still works normally

### Why This Limitation?

Image upload requires file input and compression processing, which is complex for temporary custom games. For consistency and simplicity, all image questions are managed centrally in the Admin Panel.

## Testing Checklist

After migration, verify:

- [ ] Admin Panel opens without errors
- [ ] Can navigate to Round 1 — Image Questions
- [ ] Can upload new image questions (2 images each)
- [ ] Images display in preview after upload
- [ ] Can save image questions successfully
- [ ] Can edit existing image questions
- [ ] Can delete image questions
- [ ] Starting a Random Game works
- [ ] Round 1 displays correctly in game
- [ ] Images load and display properly
- [ ] Answer submission works
- [ ] Scoring works (+10 per correct answer)
- [ ] Can complete Round 1 and proceed to Round 2
- [ ] Rounds 2-5 still work normally
- [ ] Leaderboard still works
- [ ] Build completes: `npm run build`
- [ ] Lint passes: `npm run lint`

## Rollback Instructions

If you need to rollback to the crossword version:

1. **Git revert** to the commit before this update
2. **Restore localStorage** (if backed up):
```javascript
localStorage.setItem('qc_admin_questions', backupData);
```
3. **Rebuild**: `npm run build`

## Support

If you encounter issues during migration:

1. Check browser console for errors
2. Verify localStorage is not full
3. Clear localStorage and start fresh if necessary:
```javascript
localStorage.removeItem('qc_admin_questions');
// Then refresh page - will initialize with defaults
```

## Frequently Asked Questions

### Q: Can I still use crossword questions?

**A**: No, the crossword functionality has been completely removed. Round 1 is now exclusively image-based identification.

### Q: Will my old crossword questions be deleted?

**A**: They remain in localStorage but are unused. The app only reads from the new `images` array.

### Q: Can I convert crossword words to image questions automatically?

**A**: No, you must manually create image questions. Each question requires 2 actual image files to be uploaded.

### Q: What happens if I have 0 image questions?

**A**: The game will still run, but Round 1 will have 0 questions and immediately complete with 0 points.

### Q: Can I use external image URLs instead of uploading?

**A**: No, the current implementation requires uploaded images that are converted to base64. Using external URLs would require an internet connection and wouldn't work offline.

### Q: How do I reduce storage usage?

**A**: 
1. Delete unused image questions
2. Keep only essential questions (10-15 minimum for good gameplay)
3. Pre-optimize images before uploading

### Q: Can I export/import image questions between browsers?

**A**: Not directly through the UI. You could manually copy localStorage data, but the images will be copied as base64 which creates very large JSON files.

---

Last Updated: 2026-09-08
