# Teacher Mode and Pacing System

This document outlines the features and implementation of the Teacher Mode in the IBCS application, including the content pacing system.

## Teacher UI

When a user is authenticated as a teacher, the UI is adjusted to better suit a classroom and planning context. The key differences are:

- **No Gamification:** Teachers do not earn XP, have levels, or streaks. All gamification-related UI elements are hidden.
- **Full Content Access:** Teachers are not restricted by content locks. All units, stages, and segments are immediately accessible, allowing for easy planning and classroom presentation.
- **Presentation Mode:** A dedicated "Presentation Mode" is available on module pages. This mode provides a full-screen, distraction-free view of the content, ideal for displaying on a projector or smartboard. A floating "Exit presentation" control remains visible so you can leave projector view without refreshing the page.
- **Teacher-only segments:** Lesson authors can mark any segment with `audience: "teacher"`. These presenter notes appear exclusively in Teacher Mode, giving you a scripted launch without revealing it to learners.
- **Live Deck Controls:** Teachers can start, pause, reset, or advance a live deck. Each live session generates a short join code so late arrivals can synchronise their view instantly.
- **Live Assessment Dashboard:** When students are working on a formative assessment, teachers see a live dashboard of class progress instead of the assessment itself.
- **Integrated assessments:** The end-of-unit summative now lives in the final stage slot and unlocks automatically once every prior stage reports `completed`, keeping the pacing pointer consistent for both teachers and students.

## Pacing System

The pacing system, also known as the "teacher pointer," allows teachers to control the flow of content for their students. A teacher can set a specific slide in the live deck as the current "pace," and students in their class will only be able to access content up to and including that slide.

### How it Works

1.  **Launch a session:**
    - Use the "Start / resume" control on the Year 7 live deck page. This sets the pointer to the first slide (or last saved position) and creates a five-character join code.
    - The session status turns to `LIVE`, and the join code appears in the control panel. Students can join automatically if they belong to the class or manually by entering the join code.

2.  **Advance the pointer:**
    - The "Advance pointer" control moves the class to the next slide in the deck. The worker records slide history so teachers can resume later and students can revisit earlier slides.
    - Teachers can also click any slide in the timeline to move the pointer instantly (useful for reteaching or skipping).

3.  **Student Experience:**
    - A student’s view is locked to the current pointer. Slides already visited stay available for revision, but students cannot progress past the live pointer.
    - Checkpoints and summative tasks are gated: they only unlock once the pointer lands on those slides.

4.  **Saving progress at the end of a lesson:**
    - Use the "Pause session" control to clear the join code while saving the pointer position. History remains intact so the next "Start" resumes exactly where the class finished.

5.  **Join codes for late arrivals:**
    - Students can enter the join code via `POST /student/live-sessions/join`. The worker resolves the class, pointer, and accessible slide history so they instantly match the rest of the class.

6.  **Teacher preview mode:**
    - Opening a module without selecting a class keeps you out of live pacing. You can scroll freely, skip formative or summative assessments, and plan future lessons without affecting what students see.

The pacing state is stored in the `classPacing` collection with the following important fields: `deckId`, `slideId`, `sessionCode`, `sessionStatus`, `history[]`, and `accessibleSlides[]`. These fields keep the experience backward compatible even if students are added to a class after the session started.

## Live Assessment Dashboard

When a teacher navigates to a stage that contains a formative assessment (such as a micro-quiz or an interactive activity), the application will display a real-time dashboard instead of the assessment content. This dashboard is designed to give teachers immediate insight into student progress and understanding.

### Features

- **Real-Time Updates:** The dashboard automatically updates as students work. There is no need for the teacher to refresh the page.
- **Full Class Overview:** The dashboard displays a list of all students in the class, along with key metrics for each student on the current assessment.
- **Key Metrics:**
  - **Status:** Shows whether a student is "Not Started," "In Progress," or "Completed."
  - **Attempts:** Tracks the number of times a student has attempted the assessment. This is particularly useful for identifying students who may be struggling.
  - **Score:** Once a student completes the assessment, their score is displayed.
- **Completion Summary:** A progress bar at the top of the dashboard shows the overall completion rate for the class, making it easy to see when the majority of students are finished.

### Teacher Controls

From the dashboard, teachers have two important controls:

1.  **Show Assessment View:** This button allows the teacher to switch from the live dashboard to the actual assessment content. This is useful for when the teacher wants to review the questions with the class, discuss common mistakes, and clarify concepts. The teacher can toggle back to the dashboard at any time.
2.  **Unlock Next Slide:** This button functions as an override for the normal content pacing. It allows the teacher to jump to the next slide for all students, even if some students have not yet completed the current assessment. This is useful for managing classroom time and accommodating absent students.

### How it Works

- When a student interacts with a formative assessment, their progress (status, attempts, score) is sent to the backend and stored in the `liveAssessmentStatus` collection.
- The teacher's dashboard has a live subscription to this data for the current class and assessment. As new data comes in, the dashboard UI updates in real-time.
- This feature allows for a more interactive and responsive teaching experience, where teachers can provide targeted support to students exactly when they need it.

## Implementation Details

- **`liveDecks.js`:** Defines the default Year 7 live deck with slide metadata for both teacher and student views.
- **`classPacing` Schema:** Now stores `deckId`, `slideId`, `sessionCode`, `sessionStatus`, `history`, and `accessibleSlides` so the pointer persists across sessions and late joiners.
- **`updateClassPacing` endpoint:** Accepts commands `start`, `advance`, `stop`, and `reset`, plus manual `lessonId` overrides. The worker generates unique join codes and keeps history deduplicated.
- **Student join endpoint:** `POST /student/live-sessions/join` lets a student supply a join code and receive the same pacing payload as classmates.
- **Frontend Year 7 view:** `/curriculum/year7` renders a projector-friendly teacher console alongside the student-facing slide experience with checkpoints, matching tasks, and summative quizzes.
