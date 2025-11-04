# Teacher Mode and Pacing System

This document outlines the features and implementation of the Teacher Mode in the IBCS application, including the content pacing system.

## Teacher UI

When a user is authenticated as a teacher, the UI is adjusted to better suit a classroom and planning context. The key differences are:

- **No Gamification:** Teachers do not earn XP, have levels, or streaks. All gamification-related UI elements are hidden.
- **Full Content Access:** Teachers are not restricted by content locks. All units, stages, and segments are immediately accessible, allowing for easy planning and classroom presentation.
- **Presentation Mode:** A dedicated "Presentation Mode" is available on module pages. This mode provides a full-screen, distraction-free view of the content, ideal for displaying on a projector or smartboard. A floating "Exit presentation" control remains visible so you can leave projector view without refreshing the page.
- **Teacher-only segments:** Lesson authors can mark any segment with `audience: "teacher"`. These presenter notes appear exclusively in Teacher Mode, giving you a scripted launch without revealing it to learners.
- **Pacing Controls:** Teachers have controls to set the learning pace for their classes.
- **Live Assessment Dashboard:** When students are working on a formative assessment, teachers see a live dashboard of class progress instead of the assessment itself.
- **Integrated assessments:** The end-of-unit summative now lives in the final stage slot and unlocks automatically once every prior stage reports `completed`, keeping the pacing pointer consistent for both teachers and students.

## Pacing System

The pacing system, also known as the "teacher pointer," allows teachers to control the flow of content for their students. A teacher can set a specific stage as the current "pace," and students in their class will only be able to access content up to and including that stage.

> **KS3 parity** – Year 7/KS3 modules now use the same pacing controls and presentation tooling as the IB units. The revamped Year 7 map surfaces the live pointer and arranges units in a compact grid so the entire pathway fits on screen.

### How it Works

1.  **Setting the Pace:**
    - On the module page, teachers will see a "Set Pace" button next to each stage in the navigation sidebar.
    - Clicking this button sets that stage as the current pace for the selected class. This is saved to the backend in the `classPacing` collection.

2.  **Student Experience:**
    - When a student loads a module page, the application fetches the pacing information for their class.
    - The student's progress is gated by the teacher's pace. They can only access stages up to the one set by the teacher.
    - Within the paced limit, students must still complete stages sequentially. For example, if the pace is set to Stage 3, a student must complete Stage 1 before they can access Stage 2.

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
2.  **Unlock Next Stage:** This button functions as an override for the normal content pacing. It allows the teacher to unlock the next stage for all students in the class, even if some students have not yet completed the current assessment. This is useful for managing classroom time and accommodating absent students.

### How it Works

- When a student interacts with a formative assessment, their progress (status, attempts, score) is sent to the backend and stored in the `liveAssessmentStatus` collection.
- The teacher's dashboard has a live subscription to this data for the current class and assessment. As new data comes in, the dashboard UI updates in real-time.
- This feature allows for a more interactive and responsive teaching experience, where teachers can provide targeted support to students exactly when they need it.

## Implementation Details

- **`GamifiedModulePage.jsx`:** This component now handles both student and teacher views. It uses an `isTeacher` flag to conditionally render UI elements and apply different logic.
- **`TeacherModeContext.jsx`:** This context provides the `isPresentationMode` state and the `currentPacing` information for the UI.
- **`classPacing` Schema:** The `instant.schema.ts` defines the `classPacing` entity, which stores the `classId`, `unitId`, and `lessonId` (which corresponds to a stage ID).
- **`liveAssessmentStatus` Schema:** A new schema has been added to `instant.schema.ts` to store real-time assessment data.
- **API:** The `updateClassPacing` function in `lib/api.js` is used to persist the teacher's pacing selection to the backend. The `getClassPacing` function retrieves it for the students. The `updateLiveAssessmentStatus` endpoint lets students report their progress, and `getLiveAssessmentStatus` streams the current class snapshot for teachers.
