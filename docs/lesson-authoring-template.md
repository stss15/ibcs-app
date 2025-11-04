# IBCS Unit Authoring Template

This template provides a standardized format for creating new learning units. By following this structure, you can ensure that your content is consistent and can be easily processed and rendered by the application.

**Workflow:**

1.  **Copy this file:** For each new unit, create a new folder (e.g., `content/year-7/y7-unit-1/`) and copy this template into it, renaming it to something descriptive (e.g., `y7u1-introduction-to-cs.md`).
2.  **Fill out the metadata:** Complete the YAML frontmatter at the top of the file.
3.  **Write your content:** Follow the Markdown structure to add stages, keywords, teacher recall questions, content, and formative assessments.
4.  **Save the file:** Once complete, the AI assistant can read this file and automatically generate the required component file (e.g., `y7u1.jsx`).

---

## Unit Metadata (YAML Frontmatter)

**Instructions:**
*   `unitId`: A short, unique identifier (e.g., "Y7U1", "B3").
*   `title`: The full title of the unit.
*   `guidingQuestion`: A high-level question that frames the unit's learning.
*   `hours`: Estimated time for Standard Level (sl) and Higher Level (hl) students.
*   `objectives`: A list of the key learning outcomes for the unit.

```yaml
---
unitId: "TEMPLATE-UNIT"
title: "Title of the Unit"
guidingQuestion: "What is the core question students will be able to answer?"
hours:
  sl: "10-12 hours"
  hl: "15-18 hours"
objectives:
  - "Students will be able to..."
  - "Students will understand..."
  - "Students will create..."
---
```

---

## Stages (Lessons)

A unit is composed of multiple stages. Each stage is a self-contained lesson with its own content and activities. Use a Level 1 Markdown Header (`#`) for each new stage.

# Stage 1: Title of the First Stage
**Duration:** ~45 mins

### Keywords
*Introduce key vocabulary for this stage here.*

- **Keyword 1:** The definition of the first keyword.
- **Keyword 2:** The definition of the second keyword.

### Teacher Recall (Teacher-Only View)
<!-- type: content, teacherOnly: true -->

> These questions are designed for classroom discussion to activate prior knowledge from previous units. They are displayed only to teachers and are not graded within the app.

- **Recall Question 1:** What did we learn about [Previous Topic] in [Previous Unit]?
- **Recall Question 2:** How does [Concept A] relate to [Concept B]?

### Content: Part 1
<!-- type: content -->

This is where the main teaching content goes. You can use standard Markdown formatting, including:

- Paragraphs
- **Bold** and *italic* text
- Bulleted lists
- Numbered lists
- `inline code`
- Images: `![Alt text for image](./path/to/your/image.png)`

This content will be rendered as a standard `ContentSegment`.

### Formative Check 1: Multiple Choice
<!-- type: micro-quiz -->

**Heading:** Check Your Understanding

**Question 1:** What is the capital of France?
- [ ] London
- [x] Paris
- [ ] Berlin
**Rationale:** "Paris is the capital of France. This rationale will be shown to students after they answer."

**Question 2 (Multi-Select):** Which of these are programming languages?
- [x] Python
- [ ] HTML
- [x] JavaScript
**Rationale:** "Python and JavaScript are programming languages, while HTML is a markup language."

**Question 3 (True/False):** The Earth is flat.
- [ ] True
- [x] False
**Rationale:** "The Earth is an oblate spheroid."

### Content: Part 2
<!-- type: content -->

You can add more content segments between formative checks to break up the learning.

### Formative Check 2: Matching Activity
<!-- type: activity, activityType: matching -->

**Heading:** Match the Concepts to their Scenarios

| Term          | Definition                               |
|---------------|------------------------------------------|
| Decomposition | Breaking down a problem into smaller parts. |
| Abstraction   | Hiding complexity to focus on essentials. |
| Algorithm     | A step-by-step procedure for calculations. |

---

# Stage 2: Title of the Second Stage
**Duration:** ~60 mins

*...continue the structure for all stages in the unit.*

---

## End of Unit Assessment
<!-- type: assessment -->

**Instructions:**
*   Define the final summative assessment for the unit. This is a text-based assessment that students will complete and export as a PDF.

**Duration:** 60 mins
**Total Marks:** 50

**Question 1 (10 marks):**
The prompt for the first summative assessment question goes here.

**Question 2 (15 marks):**
The prompt for the second summative assessment question goes here.

**Question 3 (25 marks):**
The prompt for the third summative assessment question goes here.


here are the instructions for all the formative assessment styles we can use. 

# Interactive Formative Assessments Guide

This guide provides a comprehensive overview of the interactive, self-marking formative assessment components available in the IBCS application. Use these components to create engaging, effective checks for understanding.

## Core Principles

- **Immediate Feedback:** All components are self-marking and provide immediate feedback to students.
- **No Typing Required:** Assessments are designed to be completed through clicks, drags, and selections, avoiding the need for text input and complex answer parsing.
- **Variety:** A wide range of components are available to assess different types of knowledge and skills.

---

## Existing Assessment Types

### 1. Multiple Choice (Radio Buttons)

**Description:**
A standard multiple-choice question where students select a single correct answer from a list of options.

**Use Case:**
Ideal for testing factual recall, conceptual understanding, and simple problem-solving.

**Implementation:**
```jsx
{
  type: 'micro-quiz',
  questions: [
    {
      id: 'q1',
      prompt: 'Which of the following is a core concept of computational thinking?',
      options: [
        { id: 'a', text: 'Decomposition', isCorrect: true },
        { id: 'b', text: 'Compilation' },
        { id: 'c', text: 'Execution' },
      ],
      rationale: 'Decomposition is the process of breaking down a complex problem into smaller, more manageable parts.'
    }
  ]
}
```

### 2. Multi-Select (Checkboxes)

**Description:**
Allows students to select multiple correct answers from a list of options.

**Use Case:**
Useful for questions where more than one option is correct, testing a broader understanding of a topic.

**Implementation:**
```jsx
{
  type: 'micro-quiz',
  questions: [
    {
      id: 'q2',
      prompt: 'Which of the following are examples of input devices?',
      options: [
        { id: 'a', text: 'Keyboard', isCorrect: true },
        { id: 'b', text: 'Monitor' },
        { id: 'c', text: 'Mouse', isCorrect: true },
      ],
      rationale: 'A keyboard and mouse are used to provide input to a computer, while a monitor is an output device.'
    }
  ]
}
```

### 3. True/False

**Description:**
A simple question where students must determine if a statement is true or false.

**Use Case:**
Quickly check for common misconceptions and basic factual knowledge.

**Implementation:**
```jsx
{
  type: 'micro-quiz',
  questions: [
    {
      id: 'q3',
      prompt: 'HTML is a programming language.',
      options: [
        { id: 'a', text: 'True' },
        { id: 'b', text: 'False', isCorrect: true },
      ],
      rationale: 'HTML is a markup language, not a programming language, as it does not have logic or control structures.'
    }
  ]
}
```

### 4. Matching (Concepts to Scenarios)

**Description:**
Students match a list of items in one column to a corresponding list of items in another. This is typically implemented with dropdowns.

**Use Case:**
Excellent for assessing understanding of relationships between concepts, definitions, and examples.

**Implementation:**
```jsx
{
  type: 'activity',
  activityType: 'matching',
  heading: 'Match Concepts to Scenarios',
  items: [
    { id: 'decomp', term: 'Decomposition' },
    { id: 'abstr', term: 'Abstraction' },
  ],
  options: [
    { id: 'opt1', text: 'Breaking down a problem into smaller parts.' },
    { id: 'opt2', text: 'Ignoring irrelevant details to focus on the essential.' },
  ],
  answers: {
    decomp: 'opt1',
    abstr: 'opt2',
  }
}
```

### 5. Ordering/Sequencing

**Description:**
Students arrange a list of items into the correct order.

**Use Case:**
Perfect for testing understanding of processes, timelines, algorithms, or any step-by-step procedure.

**Implementation:**
```jsx
{
  type: 'activity',
  activityType: 'ordering',
  heading: 'Order the Steps of the Fetch-Execute Cycle',
  items: [
    { id: '1', text: 'Fetch the instruction from memory.' },
    { id: '2', text: 'Decode the instruction.' },
    { id: '3', text: 'Execute the instruction.' },
  ]
}
```

### 6. Gap Fill

**Description:**
Students fill in the blanks in a sentence or paragraph. This can be done either by selecting from a dropdown menu for each blank, or by dragging and dropping words from a word bank.

**Use Case:**
Great for testing vocabulary, understanding of definitions, and knowledge of key concepts in context.

**Implementation (Dropdown):**
```jsx
{
  type: 'activity',
  activityType: 'gap-fill',
  interaction: 'dropdown',
  heading: 'Fill in the Blanks',
  text: 'A ___ is a set of instructions that a computer can execute. It is written in a ___ language.',
  gaps: [
    { id: '1', options: ['program', 'variable', 'function'], answer: 'program' },
    { id: '2', options: ['programming', 'markup', 'natural'], answer: 'programming' },
  ]
}
```

**Implementation (Drag-and-Drop):**
```jsx
{
  type: 'activity',
  activityType: 'gap-fill',
  interaction: 'drag',
  heading: 'Complete the Sentence',
  text: 'The ___ is the main circuit board of a computer, and the ___ is its brain.',
  tokens: ['CPU', 'motherboard', 'RAM'],
  answers: {
    '1': 'motherboard',
    '2': 'CPU',
  }
}
```

---

## New and Advanced Assessment Types

Here is a list of new, innovative assessment types that can be implemented to further enhance the interactive learning experience.

### 1. Image Hotspot

**Description:**
An image is displayed with several clickable "hotspot" areas. Students are prompted to click on the area that corresponds to a specific concept or question.

**Use Case:**
Ideal for testing knowledge of diagrams, charts, maps, or any visual information. For example, identifying parts of a computer, a network topology, or a specific component in a diagram.

**Implementation:**
```jsx
{
  type: 'activity',
  activityType: 'image-hotspot',
  heading: 'Identify the CPU',
  image: { src: '/path/to/motherboard.jpg', alt: 'A computer motherboard' },
  hotspots: [
    { id: '1', x: 50, y: 30, width: 10, height: 15, isCorrect: true },
    { id: '2', x: 20, y: 50, width: 15, height: 10 },
  ],
  prompt: 'Click on the Central Processing Unit (CPU).'
}
```

### 2. Classification/Categorization

**Description:**
Students are given a collection of items (words or images) and several categories. They must drag and drop each item into the correct category.

**Use Case:**
Excellent for testing a student's ability to classify information, understand relationships between concepts, and apply rules. For example, sorting programming terms into "data types," "control structures," and "operators."

**Implementation:**
```jsx
{
  type: 'activity',
  activityType: 'classification',
  heading: 'Categorize the Terms',
  categories: [
    { id: 'cat1', title: 'Input Devices' },
    { id: 'cat2', title: 'Output Devices' },
  ],
  items: [
    { id: 'item1', text: 'Keyboard', category: 'cat1' },
    { id: 'item2', text: 'Monitor', category: 'cat2' },
    { id: 'item3', text: 'Mouse', category: 'cat1' },
    { id: 'item4', text: 'Printer', category: 'cat2' },
  ]
}
```

### 3. Code Completion

**Description:**
A snippet of code is presented with one or more blanks. Students must choose the correct code from a dropdown or a list of options to complete the snippet.

**Use Case:**
A great way to assess understanding of syntax, programming logic, and common algorithms without requiring students to write code from scratch.

**Implementation:**
```jsx
{
  type: 'activity',
  activityType: 'code-completion',
  heading: 'Complete the Loop',
  code: `
for i in range(___):
  print("Hello, World!")
  `,
  blanks: [
    {
      id: '1',
      options: ['10', 'i', 'range'],
      answer: '10'
    }
  ]
}
```

### 4. Annotated Text

**Description:**
A paragraph or passage of text is displayed, and the student is asked to click on or highlight the words or phrases that meet a certain criterion.

**Use Case:**
Useful for assessing reading comprehension, ability to identify key terms, or understanding of grammatical or syntactical concepts in context. For example, "Highlight all the verbs in the following passage."

**Implementation:**
```jsx
{
  type: 'activity',
  activityType: 'annotated-text',
  heading: 'Identify the Keywords',
  text: 'Abstraction is the process of hiding the complexity and showing only the essential features of the object. It helps in reducing programming complexity and effort.',
  prompt: 'Click on all the words that are core concepts of Object-Oriented Programming.',
  correctWords: ['Abstraction']
}
```

