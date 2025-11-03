# Teacher Mode and Pacing System

This document outlines the features and implementation of the Teacher Mode in the IBCS application, including the content pacing system.

## Teacher UI

When a user is authenticated as a teacher, the UI is adjusted to better suit a classroom and planning context. The key differences are:

- **No Gamification:** Teachers do not earn XP, have levels, or streaks. All gamification-related UI elements are hidden.
- **Full Content Access:** Teachers are not restricted by content locks. All units, stages, and segments are immediately accessible, allowing for easy planning and classroom presentation.
- **Presentation Mode:** A dedicated "Presentation Mode" is available on module pages. This mode provides a full-screen, distraction-free view of the content, ideal for displaying on a projector or smartboard.
- **Pacing Controls:** Teachers have controls to set the learning pace for their classes.

## Pacing System

The pacing system, also known as the "teacher pointer," allows teachers to control the flow of content for their students. A teacher can set a specific stage as the current "pace," and students in their class will only be able to access content up to and including that stage.

### How it Works

1.  **Setting the Pace:**
    - On the module page, teachers will see a "Set Pace" button next to each stage in the navigation sidebar.
    - Clicking this button sets that stage as the current pace for the selected class. This is saved to the backend in the `classPacing` collection.

2.  **Student Experience:**
    - When a student loads a module page, the application fetches the pacing information for their class.
    - The student's progress is gated by the teacher's pace. They can only access stages up to the one set by the teacher.
    - Within the paced limit, students must still complete stages sequentially. For example, if the pace is set to Stage 3, a student must complete Stage 1 before they can access Stage 2.

### Implementation Details

- **`GamifiedModulePage.jsx`:** This component now handles both student and teacher views. It uses an `isTeacher` flag to conditionally render UI elements and apply different logic.
- **`TeacherModeContext.jsx`:** This context provides the `isPresentationMode` state and the `currentPacing` information for the UI.
- **`classPacing` Schema:** The `instant.schema.ts` defines the `classPacing` entity, which stores the `classId`, `unitId`, and `lessonId` (which corresponds to a stage ID).
- **API:** The `updateClassPacing` function in `lib/api.js` is used to persist the teacher's pacing selection to the backend. The `getClassPacing` function retrieves it for the students.
