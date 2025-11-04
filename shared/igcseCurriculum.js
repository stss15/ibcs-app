export const IGCSE_CURRICULUM = [
  {
    id: "IGCSE-COMPUTER-SYSTEMS",
    title: "Computer Systems",
    summary: "Topics 1–6 · Core theory across data, hardware, software, and emerging technology.",
    accent: "#1d4ed8",
    icon: "🖥️",
    lessons: [
      {
        id: "IGCSE-T1",
        order: 1,
        slug: "topic-1-data-representation",
        title: "Topic 1 · Data representation",
      },
      {
        id: "IGCSE-T2",
        order: 2,
        slug: "topic-2-data-transmission",
        title: "Topic 2 · Data transmission",
      },
      {
        id: "IGCSE-T3",
        order: 3,
        slug: "topic-3-hardware",
        title: "Topic 3 · Hardware",
      },
      {
        id: "IGCSE-T4",
        order: 4,
        slug: "topic-4-software",
        title: "Topic 4 · Software",
      },
      {
        id: "IGCSE-T5",
        order: 5,
        slug: "topic-5-internet-and-uses",
        title: "Topic 5 · The internet and its uses",
      },
      {
        id: "IGCSE-T6",
        order: 6,
        slug: "topic-6-automated-and-emerging-tech",
        title: "Topic 6 · Automated and emerging technologies",
      },
    ],
  },
  {
    id: "IGCSE-ALGORITHMS",
    title: "Algorithms, Programming & Logic",
    summary: "Topics 7–10 · Problem solving, coding practice, databases, and Boolean logic.",
    accent: "#0ea5e9",
    icon: "🧠",
    lessons: [
      {
        id: "IGCSE-T7",
        order: 7,
        slug: "topic-7-algorithm-design",
        title: "Topic 7 · Algorithm design and problem-solving",
      },
      {
        id: "IGCSE-T8",
        order: 8,
        slug: "topic-8-programming",
        title: "Topic 8 · Programming",
      },
      {
        id: "IGCSE-T9",
        order: 9,
        slug: "topic-9-databases",
        title: "Topic 9 · Databases",
      },
      {
        id: "IGCSE-T10",
        order: 10,
        slug: "topic-10-boolean-logic",
        title: "Topic 10 · Boolean logic",
      },
    ],
  },
];

export const IGCSE_LESSON_SEQUENCE = IGCSE_CURRICULUM.flatMap((unit) =>
  unit.lessons.map((lesson, index) => ({
    ...lesson,
    unitId: unit.id,
    unitTitle: unit.title,
    unitSummary: unit.summary,
    position: index,
  })),
);

export function getIgcseLessonIndex(lessonId) {
  if (!lessonId) return -1;
  return IGCSE_LESSON_SEQUENCE.findIndex((lesson) => lesson.id === lessonId);
}

export function getIgcseLessonById(lessonId) {
  return IGCSE_LESSON_SEQUENCE.find((lesson) => lesson.id === lessonId) ?? null;
}

export function getIgcseDefaultPointer() {
  const first = IGCSE_LESSON_SEQUENCE[0];
  if (!first) return null;
  return { unitId: first.unitId, lessonId: first.id };
}

