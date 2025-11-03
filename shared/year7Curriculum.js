export const YEAR7_CURRICULUM = [
  {
    id: "Y7-INTRO",
    title: "Introduction to Computing",
    summary: "Discover how digital systems power everyday life and the vocabulary we use in class.",
    accent: "#2563eb",
    icon: "🚀",
    lessons: [
      { id: "Y7-INTRO-1", slug: "welcome-to-computing", order: 1, title: "Welcome to Computing", duration: "45 min" },
      { id: "Y7-INTRO-2", slug: "devices-around-us", order: 2, title: "Devices Around Us", duration: "45 min" },
      { id: "Y7-INTRO-3", slug: "classroom-toolkit", order: 3, title: "Classroom Toolkit", duration: "45 min" },
      { id: "Y7-INTRO-4", slug: "digital-safety-basics", order: 4, title: "Digital Safety Basics", duration: "45 min" }
    ]
  },
  {
    id: "Y7-DIGITAL-CITIZEN",
    title: "Becoming a Digital Citizen",
    summary: "Build healthy online habits, collaboration etiquette, and know-how for research.",
    accent: "#0f766e",
    icon: "🌐",
    lessons: [
      { id: "Y7-DIGITAL-CITIZEN-1", slug: "online-footprints", order: 5, title: "Online Footprints", duration: "45 min" },
      { id: "Y7-DIGITAL-CITIZEN-2", slug: "credible-sources", order: 6, title: "Spot Credible Sources", duration: "45 min" },
      { id: "Y7-DIGITAL-CITIZEN-3", slug: "collaborating-online", order: 7, title: "Collaborating Online", duration: "45 min" }
    ]
  },
  {
    id: "Y7-SYSTEMS-LOGIC",
    title: "Inside the Machine – Systems & Logic",
    summary: "Peek inside hardware components and use logic to explain how they talk to each other.",
    accent: "#7c3aed",
    icon: "🧠",
    lessons: [
      { id: "Y7-SYSTEMS-LOGIC-1", slug: "hardware-tour", order: 8, title: "Hardware Tour", duration: "45 min" },
      { id: "Y7-SYSTEMS-LOGIC-2", slug: "binary-and-logic", order: 9, title: "Binary and Logic", duration: "45 min" },
      { id: "Y7-SYSTEMS-LOGIC-3", slug: "inputs-and-outputs", order: 10, title: "Inputs and Outputs", duration: "45 min" }
    ]
  },
  {
    id: "Y7-DATA-REP",
    title: "Data & Representation",
    summary: "Represent numbers, colours, and sound with code-friendly formats.",
    accent: "#db2777",
    icon: "📊",
    lessons: [
      { id: "Y7-DATA-REP-1", slug: "representing-numbers", order: 11, title: "Representing Numbers", duration: "45 min" },
      { id: "Y7-DATA-REP-2", slug: "colour-and-images", order: 12, title: "Colour & Images", duration: "45 min" },
      { id: "Y7-DATA-REP-3", slug: "sound-and-compression", order: 13, title: "Sound & Compression", duration: "45 min" }
    ]
  },
  {
    id: "Y7-THINKING-WELLBEING",
    title: "Computational Thinking & Wellbeing",
    summary: "Practise decomposition and algorithms while maintaining balanced screen time.",
    accent: "#f97316",
    icon: "🧩",
    lessons: [
      { id: "Y7-THINKING-WELLBEING-1", slug: "break-it-down", order: 14, title: "Break It Down", duration: "45 min" },
      { id: "Y7-THINKING-WELLBEING-2", slug: "patterns-and-algorithms", order: 15, title: "Patterns & Algorithms", duration: "45 min" },
      { id: "Y7-THINKING-WELLBEING-3", slug: "healthy-tech-habits", order: 16, title: "Healthy Tech Habits", duration: "45 min" }
    ]
  },
  {
    id: "Y7-SYSTEMS-IN-ACTION",
    title: "Systems in Action (Project)",
    summary: "Apply everything in a collaborative build and reflect on impact.",
    accent: "#ca8a04",
    icon: "🏗️",
    lessons: [
      { id: "Y7-SYSTEMS-IN-ACTION-1", slug: "project-brief", order: 17, title: "Project Brief", duration: "45 min" },
      { id: "Y7-SYSTEMS-IN-ACTION-2", slug: "prototype-studio", order: 18, title: "Prototype Studio", duration: "45 min" },
      { id: "Y7-SYSTEMS-IN-ACTION-3", slug: "showcase-and-reflect", order: 19, title: "Showcase & Reflect", duration: "45 min" }
    ]
  }
];

export const YEAR7_LESSON_SEQUENCE = YEAR7_CURRICULUM.flatMap((unit) =>
  unit.lessons.map((lesson, index) => ({
    ...lesson,
    unitId: unit.id,
    unitTitle: unit.title,
    unitSummary: unit.summary,
    position: index,
  })),
);

export function getYear7LessonIndex(lessonId) {
  if (!lessonId) return -1;
  return YEAR7_LESSON_SEQUENCE.findIndex((lesson) => lesson.id === lessonId);
}

export function getYear7LessonById(lessonId) {
  return YEAR7_LESSON_SEQUENCE.find((lesson) => lesson.id === lessonId) ?? null;
}

export function getYear7NextLesson(currentLessonId) {
  const index = getYear7LessonIndex(currentLessonId);
  if (index === -1) {
    return YEAR7_LESSON_SEQUENCE[0] ?? null;
  }
  return YEAR7_LESSON_SEQUENCE[index + 1] ?? null;
}

export function getYear7DefaultPointer() {
  const first = YEAR7_LESSON_SEQUENCE[0];
  if (!first) return null;
  return {
    unitId: first.unitId,
    lessonId: first.id,
  };
}

