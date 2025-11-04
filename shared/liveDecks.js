import IntroToCSLesson from "./content/lessons/intro-to-cs.js";

function buildTeacherMeta(slide) {
  if (!slide.teacherNotes) return null;
  return {
    headline: slide.teacherNotes,
    script: Array.isArray(slide.teacherScript) ? slide.teacherScript : null,
    prompts: slide.teacherPrompts || null,
  };
}

function buildStudentMeta(slide) {
  return {
    headline: slide.content?.headline || slide.content?.title || null,
  };
}

function transformSlide(slide, index) {
  const baseType = slide.type === "assessment" ? "assessment" : slide.type;
  return {
    id: slide.id,
    order: slide.order ?? index + 1,
    index,
    type: baseType,
    title: slide.title || `Slide ${index + 1}`,
    layout: slide.content?.layout ?? null,
    duration: slide.duration ?? null,
    allowRetry: slide.allowRetry !== false,
    content: slide.content,
    assessmentId: slide.assessmentId ?? null,
    teacher: buildTeacherMeta(slide),
    student: buildStudentMeta(slide),
    checkpoint: slide.content?.checkpoint ?? null,
  };
}

const KS3_DECK = {
    id: "KS3-COMP-FOUNDATIONS",
    slug: "ks3-computing-foundations",
    title: "Computing Foundations (Teacher-Paced)",
    summary:
      "A teacher-led launch sequence for Year 7 computing. Slides mirror the teacher display, and the pacing pointer prevents students from racing ahead while keeping earlier material available for revision.",
    accent: "#2563eb",
    icon: "🎯",
    estimatedDuration: "90 min",
    defaultAudience: "ks3",
  lesson: IntroToCSLesson,
  slides: IntroToCSLesson.slides.map(transformSlide),
};

const LIVE_DECKS = [KS3_DECK];

const deckIndex = new Map();
const slideIndex = new Map();

for (const deck of LIVE_DECKS) {
  deckIndex.set(deck.id, deck);
  deck.slides.forEach((slide, position) => {
    slideIndex.set(slide.id, {
      deckId: deck.id,
      deck,
      slide,
      index: position,
    });
  });
}

export function listLiveDecks() {
  return LIVE_DECKS.map((deck) => ({
    id: deck.id,
    title: deck.title,
    summary: deck.summary,
    accent: deck.accent,
    icon: deck.icon,
    estimatedDuration: deck.estimatedDuration ?? null,
    slideCount: deck.slides.length,
  }));
}

export function getDefaultLiveDeck() {
  return LIVE_DECKS[0] ?? null;
}

export function getLiveDeckById(deckId) {
  if (!deckId) return null;
  return deckIndex.get(deckId) ?? null;
}

export function getSlideById(slideId) {
  if (!slideId) return null;
  return slideIndex.get(slideId) ?? null;
}

export function getSlideWithinDeck(deckId, slideId) {
  const deck = getLiveDeckById(deckId);
  if (!deck) return null;
  const meta = deck.slides.find((slide) => slide.id === slideId);
  if (!meta) return null;
  return {
    deckId: deck.id,
    deck,
    slide: meta,
    index: deck.slides.indexOf(meta),
  };
}

export function getFirstSlide(deckId) {
  const deck = deckId ? getLiveDeckById(deckId) : getDefaultLiveDeck();
  if (!deck || deck.slides.length === 0) return null;
  const slide = deck.slides[0];
  return {
    deckId: deck.id,
    deck,
    slide,
    index: 0,
  };
}

export function getNextSlide(deckId, currentSlideId) {
  const deck = deckId ? getLiveDeckById(deckId) : getDefaultLiveDeck();
  if (!deck) return null;
  if (!currentSlideId) {
    return getFirstSlide(deck.id);
  }
  const currentIndex = deck.slides.findIndex((slide) => slide.id === currentSlideId);
  if (currentIndex === -1) return null;
  const nextSlide = deck.slides[currentIndex + 1];
  if (!nextSlide) return null;
  return {
    deckId: deck.id,
    deck,
    slide: nextSlide,
    index: currentIndex + 1,
  };
}

export function getPreviousSlide(deckId, currentSlideId) {
  const deck = deckId ? getLiveDeckById(deckId) : getDefaultLiveDeck();
  if (!deck) return null;
  if (!currentSlideId) return null;
  const currentIndex = deck.slides.findIndex((slide) => slide.id === currentSlideId);
  if (currentIndex <= 0) return null;
  const prevSlide = deck.slides[currentIndex - 1];
  return {
    deckId: deck.id,
    deck,
    slide: prevSlide,
    index: currentIndex - 1,
  };
}

export function listSlidesForDeck(deckId) {
  const deck = getLiveDeckById(deckId) ?? getDefaultLiveDeck();
  if (!deck) return [];
  return deck.slides.map((slide, index) => ({
    id: slide.id,
    title: slide.title,
    order: slide.order ?? index + 1,
    type: slide.type,
    deckId: deck.id,
    deckTitle: deck.title,
    index,
    layout: slide.layout ?? null,
    lockByDefault: Boolean(slide.lockByDefault),
  }));
}

export function flattenSlides() {
  return LIVE_DECKS.flatMap((deck) =>
    deck.slides.map((slide, index) => ({
      deckId: deck.id,
      deckTitle: deck.title,
      slideId: slide.id,
      slideTitle: slide.title,
      index,
      type: slide.type,
    })),
  );
}

export function normaliseHistory(deckId, history) {
  const deck = getLiveDeckById(deckId);
  if (!deck) return [];
  const sequence = deck.slides.map((slide) => slide.id);
  const seen = new Set();
  const result = [];
  for (const entry of Array.isArray(history) ? history : []) {
    if (sequence.includes(entry) && !seen.has(entry)) {
      seen.add(entry);
      result.push(entry);
    }
  }
  if (result.length === 0 && sequence.length > 0) {
    result.push(sequence[0]);
  }
  return result;
}

export function deriveAccessibleSlides(deckId, currentSlideId, history) {
  const deck = getLiveDeckById(deckId);
  if (!deck) return [];
  const normalised = normaliseHistory(deckId, history);
  const knownIds = new Set(normalised);
  if (currentSlideId && !knownIds.has(currentSlideId)) {
    knownIds.add(currentSlideId);
    normalised.push(currentSlideId);
  }
  return normalised
    .map((slideId) => {
      const match = getSlideWithinDeck(deckId, slideId);
      if (!match) return null;
      return {
        deckId: match.deckId,
        slideId: match.slide.id,
        title: match.slide.title,
        type: match.slide.type,
        layout: match.slide.layout ?? null,
        order: match.slide.order ?? match.index + 1,
        index: match.index,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.index - b.index);
}

export function getSlideAfter(deckId, slideId, offset = 1) {
  const deck = getLiveDeckById(deckId);
  if (!deck) return null;
  const index = deck.slides.findIndex((slide) => slide.id === slideId);
  if (index === -1) return null;
  const target = deck.slides[index + offset];
  if (!target) return null;
  return {
    deckId: deck.id,
    deck,
    slide: target,
    index: index + offset,
  };
}

export function describeSlide(slideId) {
  const meta = getSlideById(slideId);
  if (!meta) return null;
  const { deck, slide, index } = meta;
  return {
    deckId: deck.id,
    deckTitle: deck.title,
    slideId: slide.id,
    slideTitle: slide.title,
    type: slide.type,
    index,
    order: slide.order ?? index + 1,
    layout: slide.layout ?? null,
  };
}

export function getDeckSummary(deckId) {
  const deck = getLiveDeckById(deckId);
  if (!deck) return null;
  return {
    id: deck.id,
    title: deck.title,
    summary: deck.summary,
    accent: deck.accent,
    icon: deck.icon,
    estimatedDuration: deck.estimatedDuration ?? null,
    slideCount: deck.slides.length,
  };
}

const DEFAULT_DECK = getDefaultLiveDeck();
const DEFAULT_DECK_ID = DEFAULT_DECK?.id ?? null;

export const YEAR7_CURRICULUM = LIVE_DECKS.map((deck) => ({
  id: deck.id,
  title: deck.title,
  summary: deck.summary,
  accent: deck.accent,
  icon: deck.icon,
  lessons: deck.slides.map((slide, index) => ({
    id: slide.id,
    slug: slide.id,
    order: slide.order ?? index + 1,
    title: slide.title,
    duration: slide.duration ?? null,
    type: slide.type,
    mode: slide.type,
  })),
}));

export const YEAR7_LESSON_SEQUENCE = listSlidesForDeck(DEFAULT_DECK_ID);

export function getYear7LessonById(lessonId) {
  if (!lessonId) return null;
  const described = describeSlide(lessonId);
  if (!described) return null;
  return {
    id: described.slideId,
    title: described.slideTitle,
    unitId: described.deckId,
    unitTitle: described.deckTitle,
    mode: described.type,
    order: described.order,
    index: described.index,
  };
}

export function getYear7LessonIndex(lessonId) {
  const meta = describeSlide(lessonId);
  return meta?.index ?? -1;
}

export function getYear7NextLesson(currentLessonId) {
  if (!DEFAULT_DECK_ID) return null;
  const next = getNextSlide(DEFAULT_DECK_ID, currentLessonId);
  if (!next) return null;
  return {
    id: next.slide.id,
    title: next.slide.title,
    unitId: next.deckId,
    unitTitle: next.deck.title,
    index: next.index,
    order: next.slide.order ?? next.index + 1,
  };
}

export function getYear7DefaultPointer() {
  if (!DEFAULT_DECK_ID) return null;
  const first = getFirstSlide(DEFAULT_DECK_ID);
  if (!first) return null;
  return {
    unitId: first.deckId,
    lessonId: first.slide.id,
    index: first.index,
  };
}

export function listYear7Slides() {
  return listSlidesForDeck(DEFAULT_DECK_ID);
}

export function getYear7DeckById(deckId) {
  return getLiveDeckById(deckId);
}

export function getYear7SlideContent(lessonId) {
  const meta = getSlideById(lessonId);
  if (!meta) return null;
  return {
    deck: getDeckSummary(meta.deckId),
    slide: meta.slide,
    meta: describeSlide(lessonId),
  };
}

export function listYear7Decks() {
  return listLiveDecks();
}

export { LIVE_DECKS };

export const YEAR7_UNITS = [
  {
    id: "y7-unit-1",
    title: "Unit 1 · Introduction to Computing",
    summary:
      "Launch the course with live, teacher-paced slides that introduce digital systems, the IPO model, and collaborative routines.",
    focus: "Teacher-paced live deck",
    estimatedHours: "5–6 lessons",
    deckId: LIVE_DECKS[0]?.id ?? null,
    status: "available",
    icon: "🧭",
    colour: "#2563eb",
  },
  {
    id: "y7-unit-2",
    title: "Unit 2 · Digital Systems in Context",
    summary: "Investigate real-world systems, sensors, and control loops through guided case studies.",
    focus: "Project-based",
    estimatedHours: "6 lessons",
    deckId: null,
    status: "upcoming",
    icon: "🛠️",
    colour: "#0ea5e9",
  },
  {
    id: "y7-unit-3",
    title: "Unit 3 · Computational Thinking",
    summary: "Build decomposition, pattern recognition, abstraction, and algorithm skills with unplugged challenges.",
    focus: "Unplugged + micro-tasks",
    estimatedHours: "5 lessons",
    deckId: null,
    status: "upcoming",
    icon: "🧩",
    colour: "#6366f1",
  },
  {
    id: "y7-unit-4",
    title: "Unit 4 · Python Foundations",
    summary: "Move from blocks to Python with short, confidence-building coding sprints.",
    focus: "Coding labs",
    estimatedHours: "6 lessons",
    deckId: null,
    status: "upcoming",
    icon: "🐍",
    colour: "#22c55e",
  },
  {
    id: "y7-unit-5",
    title: "Unit 5 · Data, Media & Representation",
    summary: "Explore how computers store numbers, text, and media through interactive demos.",
    focus: "Interactive media",
    estimatedHours: "4 lessons",
    deckId: null,
    status: "upcoming",
    icon: "🎨",
    colour: "#f59e0b",
  },
  {
    id: "y7-unit-6",
    title: "Unit 6 · Create & Reflect",
    summary: "Wrap the year with a mini project that blends research, making, and reflection.",
    focus: "Capstone",
    estimatedHours: "5 lessons",
    deckId: null,
    status: "upcoming",
    icon: "🚀",
    colour: "#ef4444",
  },
];


