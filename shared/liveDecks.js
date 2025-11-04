const LIVE_DECKS = [
  {
    id: "KS3-COMP-FOUNDATIONS",
    slug: "ks3-computing-foundations",
    title: "Computing Foundations (Teacher-Paced)",
    summary:
      "A teacher-led launch sequence for Year 7 computing. Slides mirror the teacher display, and the pacing pointer prevents students from racing ahead while keeping earlier material available for revision.",
    accent: "#2563eb",
    icon: "🎯",
    estimatedDuration: "90 min",
    defaultAudience: "ks3",
    slides: [
      {
        id: "KS3-COMP-FOUNDATIONS-01",
        order: 1,
        type: "content",
        layout: "title",
        title: "Welcome to Computing",
        duration: "5 min",
        teacher: {
          headline: "Set the tone and frame the pointer routine.",
          script: [
            "Greet the class, project the live deck, and explain that their screens mirror yours slide-by-slide.",
            "Point out the blue pacing dot. Students only move when it moves.",
          ],
          prompts: [
            "Quick poll: hands up if you used a computer before school today. Call on two students to share how.",
          ],
          transitions: ["Advance once notebooks are open and everyone can see the pointer."],
        },
        student: {
          headline: "We learn together.",
          bullets: [
            "Stay on the slide with the blue dot. Your view updates automatically.",
            "Devices stay flat unless you see an activity card.",
            "Every slide you see now stays available later for revision.",
          ],
          notes: [
            "If you join late, use the join code from your teacher to sync instantly.",
          ],
        },
      },
      {
        id: "KS3-COMP-FOUNDATIONS-02",
        order: 2,
        type: "content",
        layout: "objectives",
        title: "Today's Objectives",
        duration: "5 min",
        teacher: {
          headline: "Surface the learning journey before diving in.",
          script: [
            "Read each objective aloud and ask students which feels easiest and which might stretch them.",
            "Signal that a short quiz unlocks at the end once we finish each checkpoint together.",
          ],
          prompts: [
            "Which objective sounds most familiar? Invite one volunteer to share why.",
          ],
        },
        student: {
          headline: "By the end of this live lesson you will be able to…",
          objectives: [
            "Spot hidden digital systems in everyday life.",
            "Explain the input → process → output pattern in plain language.",
            "Use precise vocabulary like sensor, processor, actuator.",
            "Complete a readiness quiz once the teacher unlocks it.",
          ],
          reminders: [
            "You can revisit this slide later, but you cannot jump ahead of the live pointer.",
          ],
        },
      },
      {
        id: "KS3-COMP-FOUNDATIONS-03",
        order: 3,
        type: "content",
        layout: "reveal",
        title: "Input → Process → Output",
        duration: "12 min",
        teacher: {
          headline: "Model the IPO cycle with concrete artefacts.",
          script: [
            "Reveal each stage. Hold up a classroom device (e.g., automatic door video) to anchor the idea.",
            "After the third reveal, pause for a pair-share: which stage feels like the 'brain' and why?",
          ],
          prompts: [
            "Invite a student to narrate the IPO story for a device of their choice.",
          ],
        },
        student: {
          headline: "Every digital system follows the same heartbeat.",
          revealSteps: [
            {
              title: "1. Input",
              body: "Sensors capture what is happening: motion detectors, microphones, touchscreens.",
            },
            {
              title: "2. Process",
              body: "A processor compares the input with rules or data and decides what happens next.",
            },
            {
              title: "3. Output",
              body: "The system responds: lights change, speakers play, motors move, notifications appear.",
            },
          ],
          callouts: [
            {
              type: "tip",
              title: "Discuss",
              body: "When the pointer pauses on a reveal, expect a quick share-out or cold call.",
            },
          ],
        },
      },
      {
        id: "KS3-COMP-FOUNDATIONS-04",
        order: 4,
        type: "checkpoint",
        layout: "quiz",
        title: "Checkpoint: Is it a digital system?",
        duration: "8 min",
        allowRetry: true,
        teacher: {
          headline: "Monitor the live dashboard while students respond.",
          script: [
            "Tell students the checkpoint is unlocked on their device now. Give two minutes for independent answers.",
            "Address misconceptions aloud before advancing. Cold call one student per item to explain their choice.",
          ],
        },
        checkpoint: {
          type: "quiz",
          questions: [
            {
              id: "ks3-c1-q1",
              kind: "mcq",
              prompt: "Which option describes a digital system?",
              options: [
                { id: "a", label: "A whiteboard you write on with a marker" },
                { id: "b", label: "A motion-triggered automatic door" },
                { id: "c", label: "A poster on the wall" },
              ],
              answer: "b",
              rationale: "The door senses movement (input), decides (process), and moves (output).",
            },
            {
              id: "ks3-c1-q2",
              kind: "true-false",
              prompt: "A device cannot be a digital system without a screen.",
              answer: false,
              rationale: "Many embedded systems compute without screens (e.g., smart speakers).",
            },
          ],
        },
      },
      {
        id: "KS3-COMP-FOUNDATIONS-05",
        order: 5,
        type: "content",
        layout: "split",
        title: "Spot the Systems",
        duration: "10 min",
        teacher: {
          headline: "Send students on a quick hunt for hidden computers.",
          script: [
            "Give two minutes to scan the room and jot down one suspected digital system.",
            "Circulate, narrating strong examples. Highlight sensory input and output.",
          ],
          prompts: [
            "If a student is stuck, point to classroom tech and rebuild the IPO story together.",
          ],
        },
        student: {
          headline: "Look around. Where are the hidden computers?",
          bullets: [
            "Find one object that must sense something to do its job.",
            "Sketch its input, process, and output in your notebook.",
          ],
          callouts: [
            {
              type: "warning",
              title: "Need a nudge?",
              body: "Think about anything that lights up, makes a decision, or reacts when you touch it.",
            },
          ],
        },
      },
      {
        id: "KS3-COMP-FOUNDATIONS-06",
        order: 6,
        type: "checkpoint",
        layout: "matching",
        title: "Checkpoint: Match the Stage",
        duration: "8 min",
        allowRetry: true,
        teacher: {
          headline: "Drag-and-drop activity with live visibility.",
          script: [
            "Unlock the matching task. Encourage students to justify each pairing to a partner.",
            "Use the dashboard to identify terms causing confusion and discuss them before advancing.",
          ],
        },
        checkpoint: {
          type: "matching",
          prompt: "Drag each component to the correct part of the IPO cycle.",
          pairs: [
            { id: "light-sensor", term: "Light sensor", match: "input" },
            { id: "microcontroller", term: "Microcontroller", match: "process" },
            { id: "servo", term: "Servo motor", match: "output" },
            { id: "touch-screen", term: "Touch screen", match: "input" },
          ],
          feedback: {
            input: "Sensors collect data.",
            process: "Controllers decide what to do.",
            output: "Actuators make things happen.",
          },
        },
      },
      {
        id: "KS3-COMP-FOUNDATIONS-07",
        order: 7,
        type: "content",
        layout: "reflection",
        title: "Wrap and Reflect",
        duration: "5 min",
        teacher: {
          headline: "Close the lesson and prepare for the summative quiz unlock.",
          script: [
            "Ask for one new digital system students spotted today and one vocabulary word they want to remember.",
            "Explain that the summative unlocks only once everyone is ready—use it as an exit ticket or homework.",
          ],
        },
        student: {
          headline: "Quick reflection",
          bullets: [
            "Name one digital system you spotted and describe its input, process, and output.",
            "List any vocabulary you want to remember (sensor, actuator, feedback).",
          ],
          callouts: [
            {
              type: "success",
              title: "Ready for the quiz",
              body: "When your teacher unlocks the summative, a button will appear on your screen.",
            },
          ],
        },
      },
      {
        id: "KS3-COMP-FOUNDATIONS-08",
        order: 8,
        type: "summative",
        layout: "quiz",
        title: "Summative Check",
        duration: "10 min",
        allowRetry: false,
        lockByDefault: true,
        teacher: {
          headline: "Trigger this only when both checkpoints are complete.",
          script: [
            "Confirm every student has cleared both checkpoints before unlocking the summative.",
            "During the attempt, circulate silently. Debrief common errors afterward.",
          ],
        },
        checkpoint: {
          type: "quiz",
          questions: [
            {
              id: "ks3-s1-q1",
              kind: "mcq",
              prompt: "Which sequence matches the input → process → output pattern?",
              options: [
                { id: "a", label: "Speaker plays music → You tap play → App buffers the song" },
                { id: "b", label: "You tap play → App buffers the song → Speaker plays music" },
                { id: "c", label: "App buffers the song → Speaker plays music → You tap play" },
              ],
              answer: "b",
            },
            {
              id: "ks3-s1-q2",
              kind: "multi",
              prompt: "Select all devices that can act as sensors (inputs).",
              options: [
                { id: "a", label: "Microphone" },
                { id: "b", label: "LED strip" },
                { id: "c", label: "Accelerometer" },
                { id: "d", label: "Smart bulb" },
              ],
              answers: ["a", "c"],
            },
            {
              id: "ks3-s1-q3",
              kind: "mcq",
              prompt: "A greenhouse system closes vents when it gets too hot. Which part is the processor?",
              options: [
                { id: "a", label: "Temperature sensor" },
                { id: "b", label: "Controller comparing temperature to a safe range" },
                { id: "c", label: "Vent motor" },
              ],
              answer: "b",
            },
          ],
        },
      },
    ],
  },
];

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


