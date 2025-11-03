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
