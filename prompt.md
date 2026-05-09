Build a cross-platform React Native study planning app (iOS, Android, Web) with the following specifications:

## Core Concept
A gamified study roadmap generator that assesses student knowledge and creates personalized study plans. NOT a chatbot or AI tutor - the student stays in control, the app just guides what and when to study.

## Tech Stack
- React Native with Expo (for cross-platform support)
- TypeScript
- Local-first architecture with async storage
- PDF parsing library for source analysis
- Push notifications (expo-notifications)

## User Flow

### Onboarding (Modal Flow)
1. "What are you studying?" → Text input for subject title
2. "What are your sources?" → File picker (PDF) + URL input + notes textarea
3. "When is your deadline?" → Date picker + optional hours/week input
4. Processing screen → Analyze sources, generate initial assessment quiz
5. Assessment quiz → 10-15 questions to gauge current knowledge
6. Generate roadmap → Display personalized study plan with levels

### Core Screens

**Home Screen (Game-y Dashboard)**
- Daily objectives cards with source material references
- Current level indicator (visual progress bar/circle)
- Streak counter (days studied consecutively)
- "Take Challenge" button (unlocks early level advancement)
- Space repetition quiz prompt (3-5 quick questions from previous topics), like 1, 3 days later, a week later, etc. This is done to improve long term memory. If the user fail it should add other spaced repetition prompts to review that topic again.

**Study Roadmap Screen**
- Timeline view of all levels with deadlines
- Each level shows:
  - Topic name
  - Specific arguments (expandable)
  - Source material references (clickable)
  - Completion status
  - Time remaining
- Progress graphs per topic
- Completion history for past levels

**Focus Mode (Landscape Orientation)**
- Triggered by phone rotation
- Fullscreen current topic view
- Source material viewer (PDF/web embedded)
- Study session timer (Pomodoro style)
- Minimal UI, distraction-free
- "Complete session" button

**Profile/Settings**
- User stats (total study hours, levels completed, streak record)
- Badges earned
- Notification preferences
- Subject management

## Key Features to Implement

### Source-Centric Knowledge Ranking
- Parse PDFs to extract topics/sections
- Generate questions based on source content

### Adaptive Study Plan
- Initial assessment determines starting level
- Each level has:
  - Required topics (from sources)
  - Suggested study time
  - Deadline (calculated from final deadline)
  - Prerequisites (previous levels)
- Real-time adjustment based on quiz performance
- If user fails level test 2+ times → suggest more study time, reschedule plan

### Gamification System
- **Points**: +10 per completed study session, +50 per passed level, +20 per streak day
- **Levels**: Topic-based (e.g., "Calculus Level 3", "Physics Level 5")
- **Badges**: 7-day streak, Perfect Score, Early Completion, Night Owl, etc.
- **Leaderboards**: Weekly/monthly rankings (optional social feature)

### Spaced Repetition
- At session start, show 3-5 quick questions from previous topics
- Use spaced repetition algorithm (simple Leitner system)
- Questions pulled from source materials based on topic priority

### Notification System
- Daily reminder at preferred time
- Level deadline approaching (24h before)
- Streak about to break warning
- Challenge available notification

### Level Progression
- Each level has quiz (5-10 questions)
- Pass threshold: 70% correct
- Can attempt early via "Take Challenge" button
- Auto-prompted at level deadline
- On failure: reschedule plan, suggest extended study time
- On early completion: adjust remaining plan, unlock next level early

### Design System
- Modern, game-inspired UI (vibrant colors, smooth animations)
- Progress indicators everywhere (bars, circles, percentages)
- Card-based layouts
- Dark mode only
- Haptic feedback for achievements

### Networking/Architecture
- Offline-first (all data cached locally)
- Separate rest api/proxy for AI calls (make assumptions and describe endpoints, those will be implemented later)
- Much of the context will be MarkDown strings to be ingested by the AI
- AI should plan and use Agents to orchestrate the generation of content (generating the questions, study plan, other agents will handle answer grading, etc)
- Responses will be mostly structured data, JSON
- Rough draft, so error handling and retry mechanisms don't need to be perfect, make optimistic assumptions 
- **Focus on the MVP**: the app need to be shippable, with all the features listed above.

## Build Instructions
The repository is already set up with Expo and TypeScript, with the default template project.

Plan for how you want to implement the functionality from a UX prospective, and start building it.