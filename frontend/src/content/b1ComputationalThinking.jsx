import { Fragment } from "react";
import {
  KeywordCard,
  Callout,
  EnhancedTable,
} from "../components/segments/EnhancedComponents";

const keyVocabulary = [
  {
    term: "Computational Thinking",
    definition:
      "A problem-solving approach that involves abstraction, decomposition, pattern recognition, and algorithmic design to create solutions that can be executed by a computer.",
    icon: "🧠",
  },
  {
    term: "Problem Specification",
    definition:
      "A detailed document outlining a problem, including the problem statement, constraints, objectives, goals, input/output requirements, and evaluation criteria.",
    icon: "📝",
  },
  {
    term: "Abstraction",
    definition:
      "The process of filtering out unnecessary details to focus on the essential elements of a problem or system.",
    icon: "🌬️",
  },
  {
    term: "Decomposition",
    definition:
      "Breaking down a complex problem into smaller, more manageable sub-problems that are easier to solve.",
    icon: "🧩",
  },
  {
    term: "Pattern Recognition",
    definition:
      "Identifying recurring similarities, trends, or regularities within problems or data. Recognizing patterns allows you to reuse solutions and make predictions.",
    icon: "🎨",
  },
  {
    term: "Algorithmic Design",
    definition:
      "Creating a clear, step-by-step set of instructions to solve a problem. The algorithm is the roadmap that a computer (or a person) follows to reach the solution.",
    icon: "⚙️",
  },
  {
    term: "Flowchart",
    definition:
      "A diagram that visually represents a process, workflow, or algorithm using standardized symbols (ISO 5807).",
    icon: "📊",
  },
  {
    term: "Constraint",
    definition:
      "A restriction or boundary that impacts the solution, such as time, budget, technology, or regulations.",
    icon: "🔒",
  },
  {
    term: "Stakeholder",
    definition:
      "An individual or group affected by or having an interest in a project or its outcome.",
    icon: "👥",
  },
];

const overviewAim = (
  <Fragment>
    <p>
      This unit will equip you with a powerful mental toolkit for solving
      problems like a computer scientist. You will learn to break down complex
      challenges, identify patterns, focus on what truly matters, and design
      clear, logical solutions.
    </p>
    <ul>
      <li>
        <strong>Construct</strong> a formal problem specification to guide a
        project.
      </li>
      <li>
        <strong>Describe and apply</strong> the four cornerstones of
        computational thinking.
      </li>
      <li>
        <strong>Explain</strong> how these concepts are used across different
        areas of computer science.
      </li>
      <li>
        <strong>Trace and interpret</strong> flowcharts that represent
        algorithms.
      </li>
    </ul>
  </Fragment>
);

export const b1Unit = {
  id: "B1",
  title: "Computational Thinking",
  hours: {
    sl: "SL · 5 hours",
    hl: "HL · 5 hours",
  },
  guidingQuestion:
    "How can we apply a computational solution to a real-world problem?",
  overview: {
    aim: overviewAim,
    vocabulary: keyVocabulary,
  },
  stages: [
    {
      id: "B1-orientation",
      title: "Unit Orientation",
      duration: "15 min",
      description:
        "Get familiar with the unit&apos;s guiding question, learning objectives, and key vocabulary.",
      segments: [
        {
          type: "content",
          id: "orientation-aim",
          heading: "Unit Aims and Objectives",
          body: overviewAim,
        },
        {
          type: "content",
          id: "orientation-vocab",
          heading: "Key Vocabulary",
          body: (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {keyVocabulary.map((item) => (
                <KeywordCard
                  key={item.term}
                  term={item.term}
                  definition={item.definition}
                  icon={item.icon}
                />
              ))}
            </div>
          ),
        },
      ],
    },
    {
      id: "B1.1.1",
      title: "Constructing a Problem Specification",
      duration: "60 min",
      description:
        "Learn to define problems with clarity and precision by constructing a formal problem specification.",
      segments: [
        {
          type: "content",
          id: "spec-intro",
          heading: "The Blueprint for Success",
          body: (
            <Fragment>
              <p>
                Before writing a single line of code, a computer scientist must
                deeply understand the problem. A Problem Specification is the
                formal document that ensures everyone involved—clients,
                developers, and users—shares the same understanding. It acts as
                a blueprint and a contract, defining what success looks like.
              </p>
              <Callout type="info" title="Core Components">
                A thorough problem specification consists of six key parts: the
                problem statement, constraints, objectives and goals, input
                specifications, output specifications, and evaluation
                criteria.
              </Callout>
            </Fragment>
          ),
        },
        {
          type: "accordion",
          id: "spec-components-deep-dive",
          heading: "Deep Dive into Specification Components",
          items: [
            {
              title: "1. The Problem Statement",
              body: (
                <Fragment>
                  <p>
                    This is a concise, clear definition of the problem. It
                    focuses on the &lsquo;what&rsquo; and the &lsquo;why&rsquo;.
                  </p>
                  <Callout type="error" title="Poor Example">
                    “Our customer service processes are inefficient.” (This is
                    too broad and vague. What does &quot;inefficient&quot; mean?)
                  </Callout>
                  <Callout type="success" title="Strong Example">
                    “Customers wait an average of 25 minutes on hold before
                    reaching a representative, leading to a 15% increase in
                    abandoned calls over the past quarter.” (This is focused,
                    measurable, and highlights the negative impact.)
                  </Callout>
                </Fragment>
              ),
            },
            {
              title: "2. Constraints and Limitations",
              body: (
                <Fragment>
                  <p>
                    These are restrictions or boundaries that impact the
                    solution. They can be technical, financial, or even legal.
                  </p>
                  <Callout type="error" title="Poor Example">
                    “We don&apos;t have many resources.” (Vague. Does this refer to
                    money, people, or time?)
                  </Callout>
                  <Callout type="success" title="Strong Example">
                    “The project budget is limited to $10,000 and the solution
                    must be deployed within three months.” (Specific,
                    measurable, and provides clear boundaries.)
                  </Callout>
                </Fragment>
              ),
            },
            {
              title: "3. Objectives and Goals",
              body: (
                <Fragment>
                  <p>
                    Objectives are the broad, high-level desired outcomes.
                    Goals are the specific, measurable, time-constrained
                    milestones to achieve those objectives.
                  </p>
                  <p>
                    <strong>Objective:</strong> &quot;Increase customer satisfaction
                    with service interactions.&quot;
                  </p>
                  <p>
                    <strong>Specific Goals:</strong>
                  </p>
                  <ul>
                    <li>
                      Achieve an average customer satisfaction rating of 4 out
                      of 5 stars on post-service surveys over the next six
                      months.
                    </li>
                    <li>
                      Reduce the number of &lsquo;highly dissatisfied&rsquo; customer
                      ratings by 30% within the next quarter.
                    </li>
                  </ul>
                </Fragment>
              ),
            },
            {
              title: "4. Input and Output Specifications",
              body: (
                <Fragment>
                  <p>
                    These define the format, type, and expected characteristics
                    of any data entering or leaving the system. This ensures
                    compatibility and proper processing.
                  </p>
                  <p>
                    <strong>Input Example (Chatbot):</strong> Text-based input
                    via a chat interface; voice-to-text input. Should handle
                    diverse phrasing for the same intent.
                  </p>
                  <p>
                    <strong>Output Example (Chatbot):</strong> Direct text
                    responses; links to knowledge base articles; escalation to a
                    live agent with a chat transcript.
                  </p>
                </Fragment>
              ),
            },
            {
              title: "5. Evaluation Criteria",
              body: (
                <Fragment>
                  <p>
                    These are the benchmarks used to measure the success of the
                    solution. They should be directly linked to the objectives
                    and goals.
                  </p>
                  <p>
                    Consider factors like:
                  </p>
                  <ul>
                    <li>
                      <strong>Effectiveness:</strong> Does it solve the
                      problem? (e.g., task completion rate of 90% for a
                      chatbot).
                    </li>
                    <li>
                      <strong>Efficiency:</strong> Does it save time or
                      resources? (e.g., faster issue resolution time).
                    </li>
                    <li>
                      <strong>Usability:</strong> Is it easy for people to use?
                      (e.g., intuitive interface requiring minimal training).
                    </li>
                  </ul>
                </Fragment>
              ),
            },
          ],
        },
        {
          type: "activity",
          id: "spec-classification",
          activityType: "classification",
          heading: "Classify the Specification Components",
          instructions:
            "Drag each example into the correct component category.",
          categories: [
            { id: "cat-problem", title: "Problem Statement" },
            { id: "cat-constraint", title: "Constraint" },
            { id: "cat-goal", title: "Specific Goal" },
            { id: "cat-eval", title: "Evaluation Criterion" },
          ],
          tokens: [
            {
              id: "tok-1",
              label:
                "The new mobile app must be available on both iOS and Android.",
              answer: "cat-constraint",
            },
            {
              id: "tok-2",
              label:
                "Increase daily active users by 25% in the next quarter.",
              answer: "cat-goal",
            },
            {
              id: "tok-3",
              label:
                "Our current inventory system leads to a 5% error rate in stock levels, causing shipping delays.",
              answer: "cat-problem",
            },
            {
              id: "tok-4",
              label:
                "The system must process 99.9% of transactions accurately under peak load.",
              answer: "cat-eval",
            },
          ],
        },
      ],
    },
    {
      id: "B1.1.2",
      title: "Fundamental Concepts of CT",
      duration: "60 min",
      description:
        "Master the four core techniques of computational thinking: decomposition, pattern recognition, abstraction, and algorithmic design.",
      segments: [
        {
          type: "content",
          id: "ct-intro-main",
          heading: "The Four Pillars of Computational Thinking",
          body: (
            <p>
              Computational thinking provides a structured way to approach complex
              problems. By mastering these four concepts, you can develop robust
              and efficient solutions.
            </p>
          ),
        },
        {
          type: "accordion",
          id: "ct-concepts-deep-dive",
          heading: "Exploring the Concepts",
          items: [
            {
              title: "Decomposition 🧩",
              body: (
                <Fragment>
                  <p>
                    Breaking down a large, complex problem into smaller, more
                    manageable sub-problems. This makes the problem easier to
                    understand and solve.
                  </p>
                  <Callout type="tip" title="Example: Designing an NPC">
                    Instead of tackling &quot;realistic AI behavior&quot; all at once, you
                    decompose it into:
                    <ul>
                      <li>
                        <strong>Sensing:</strong> How does it see or hear the
                        player?
                      </li>
                      <li>
                        <strong>Decision-making:</strong> How does it choose an
                        action (flee, attack)?
                      </li>
                      <li>
                        <strong>Pathfinding:</strong> How does it navigate the
                        world?
                      </li>
                    </ul>
                  </Callout>
                </Fragment>
              ),
            },
            {
              title: "Pattern Recognition 🎨",
              body: (
                <Fragment>
                  <p>
                    Identifying recurring similarities, trends, or regularities
                    within problems or data. Recognizing patterns allows you to
                    reuse solutions and make predictions.
                  </p>
                  <Callout type="tip" title="Example: Handwritten Digits">
                    To recognize a handwritten &lsquo;8&rsquo;, a machine learning model
                    doesn&apos;t memorize every possible &lsquo;8&rsquo;. It learns the
                    underlying pattern: two connected loops. This allows it to
                    recognize any &lsquo;8&rsquo;, even ones it has never seen before.
                  </Callout>
                </Fragment>
              ),
            },
            {
              title: "Abstraction 🌬️",
              body: (
                <Fragment>
                  <p>
                    Filtering out unnecessary details to focus on the essential
                    elements. Abstraction simplifies complexity by creating a
                    model of the problem that is easier to work with.
                  </p>
                  <Callout type="tip" title="Example: Predicting a Race Winner">
                    What factors are essential? Engine horsepower, driver
                    experience, weather. What&apos;s irrelevant? The car&apos;s color,
                    the driver&apos;s favorite snack. Abstraction means you build
                    your predictive model using only the essential factors.
                  </Callout>
                </Fragment>
              ),
            },
            {
              title: "Algorithmic Design ⚙️",
              body: (
                <Fragment>
                  <p>
                    Developing a step-by-step, unambiguous set of instructions
                    to solve a problem. The algorithm is the roadmap that a
                    computer (or a person) follows to reach the solution.
                  </p>
                  <Callout type="tip" title="Example: Number Sequence">
                    To find the next number in the sequence 2, 4, 6, 8... the
                    algorithm is simple:
                    <ol>
                      <li>Get the current number.</li>
                      <li>Add 2 to the current number.</li>
                      <li>Output the result.</li>
                    </ol>
                  </Callout>
                </Fragment>
              ),
            },
          ],
        },
        {
          type: "activity",
          id: "ct-matching-scenarios",
          activityType: "matching",
          heading: "Match Concepts to Scenarios",
          instructions:
            "Match each computational thinking concept to the scenario that best illustrates it.",
          pairs: [
            {
              term: "Decomposition",
              example:
                "Planning a large software project by breaking it into modules: user authentication, data processing, and user interface.",
            },
            {
              term: "Pattern Recognition",
              example:
                "Analyzing sales data and noticing that a certain product sells best on weekends, then creating a general rule for weekend promotions.",
            },
            {
              term: "Abstraction",
              example:
                "Creating a subway map that shows the order of stations and connections, but ignores the exact geographical distances and street layouts.",
            },
            {
              term: "Algorithmic Design",
              example:
                "Writing a detailed recipe for baking a cake, with precise measurements and steps that must be followed in order.",
            },
          ],
        },
      ],
    },
    {
      id: "B1.1.3",
      title: "Applying CT in Computer Science",
      duration: "45 min",
      description:
        "See how the core CT concepts are applied in real-world computer science domains.",
      segments: [
        {
          type: "content",
          id: "ct-app-intro",
          heading: "Computational Thinking in Action",
          body: (
            <p>
              Computational thinking isn&apos;t just a theoretical framework; it&apos;s the
              practical foundation for many fields within computer science. Let&apos;s
              explore how the four concepts are applied in different areas.
            </p>
          ),
        },
        {
          type: "list",
          id: "ct-app-examples",
          heading: "Domain Examples",
          items: [
            {
              title: "Software Development",
              body: "A large Customer Relationship Management (CRM) system is decomposed into modules (lead tracking, customer management). Developers recognize common bug patterns to speed up debugging. They use Object-Oriented Programming to abstract complex operations into reusable objects.",
            },
            {
              title: "Data Analysis",
              body: "An analyst decomposes the process of analyzing sales data into tasks like data cleaning and normalization. They use pattern recognition to spot seasonal trends. Abstraction is used to focus on Key Performance Indicators (KPIs) like monthly sales growth.",
            },
            {
              title: "Machine Learning",
              body: "A project is decomposed into data collection, model training, and deployment. Pattern recognition is key to identifying features in image data (e.g., using convolutional neural networks). Data is abstracted into feature sets and labels for the model.",
            },
            {
              title: "Network Security",
              body: "Security challenges are decomposed into categories like physical and application security. Pattern recognition identifies typical attack patterns (like DDoS or phishing). Abstraction is used to create generic security models and protocols (like SSL/TLS).",
            },
          ],
        },
        {
          type: "activity",
          id: "ct-app-spot-error",
          activityType: "spot-error",
          heading: "Which Statement is Incorrect?",
          instructions:
            "Read the statements about applying CT and identify the one that is logically flawed.",
          items: [
            {
              id: "err-1",
              text: "In database design, abstraction helps represent real-world entities as tables while ignoring irrelevant details.",
              isError: false,
            },
            {
              id: "err-2",
              text: "When developing software, decomposition is only useful for single developers, not for teams.",
              isError: true,
              explanation:
                "Decomposition is especially powerful for teams, as it allows different team members to work on separate modules concurrently.",
            },
            {
              id: "err-3",
              text: "A data analyst uses pattern recognition to predict future demand based on historical sales data.",
              isError: false,
            },
          ],
        },
      ],
    },
    {
      id: "B1.1.4",
      title: "Tracing Flowcharts and Algorithms",
      duration: "45 min",
      description:
        "Learn to read, interpret, and trace visual representations of algorithms using standardized flowchart symbols.",
      segments: [
        {
          type: "content",
          id: "flow-intro",
          heading: "Visualizing Logic",
          body: (
            <Fragment>
              <p>
                Flowcharts are diagrams that use standardized symbols (defined by
                ISO 5807) to visually depict processes, decisions, and the flow
                of control in an algorithm. They are an essential tool for
                designing, documenting, and debugging logic before and after
                coding.
              </p>
            </Fragment>
          ),
        },
        {
          type: "content",
          id: "flow-symbols-table",
          heading: "Standard Flowchart Symbols (ISO 5807)",
          body: (
            <EnhancedTable
              columns={["Symbol", "Name", "Definition and Notes"]}
              rows={[
                [
                  "Oval",
                  "Terminator (Start/End)",
                  "Indicates the beginning and ending of a program or sub-process.",
                ],
                [
                  "Parallelogram",
                  "Input / Output",
                  "Represents a process of inputting data (e.g., from a user) or outputting data (e.g., to a screen).",
                ],
                [
                  "Rectangle",
                  "Process / Operation",
                  "Represents a set of operations that changes the value, form, or location of data.",
                ],
                [
                  "Diamond",
                  "Decision",
                  "Indicates a point where a decision must be made. The question inside should have only two possible answers (e.g., Yes/No or True/False), leading to different paths.",
                ],
                [
                  "Arrow",
                  "Flowline",
                  "Shows the order of operations by connecting the other symbols.",
                ],
              ]}
            />
          ),
        },
        {
          type: "activity",
          id: "flow-gap-fill",
          activityType: "gap-fill",
          heading: "Build a Flowchart Explanation",
          instructions:
            "Drag the words into the correct blanks to complete the sentence.",
          interaction: "drag",
          text: "In a flowchart, a [[diamond]] symbol is used for a decision, a [[rectangle]] is used for a process, and a [[parallelogram]] is used for input or output.",
          tokens: [
            { id: "tok-diamond", label: "diamond" },
            { id: "tok-para", label: "parallelogram" },
            { id: "tok-rect", label: "rectangle" },
          ],
          blanks: [
            { id: "diamond", answer: "tok-diamond" },
            { id: "rectangle", answer: "tok-rect" },
            { id: "parallelogram", answer: "tok-para" },
          ],
        },
        {
          type: "content",
          id: "flow-tracing",
          heading: "Trace Tables: Testing the Logic",
          body: (
            <Fragment>
              <p>
                How do you know if your algorithm is correct? You trace it. A
                trace table is a technique used to test an algorithm by tracking
                the values of variables at each step. This helps you identify
                logic errors.
              </p>
              <Callout type="tip" title="Worked Example">
                Consider an algorithm where A starts at 10 and B starts at
                100. In a loop, B decreases by 10 and A increases by 10 until A
                is greater than or equal to B.
              </Callout>
              <EnhancedTable
                columns={["Iteration", "A", "B", "Condition (A >= B)"]}
                rows={[
                  ["Start", "10", "100", "False"],
                  ["1", "20", "90", "False"],
                  ["2", "30", "80", "False"],
                  ["3", "40", "70", "False"],
                  ["4", "50", "60", "False"],
                  ["5", "60", "50", "True -> Program Ends"],
                ]}
              />
            </Fragment>
          ),
        },
      ],
    },
  ],
  assessment: {
    duration: "45 min",
    totalMarks: 31,
    questions: [
      {
        id: "as-q1",
        prompt:
          "Describe what a problem statement is and why it is critical in the problem specification process.",
        marks: 2,
      },
      {
        id: "as-q2",
        prompt:
          "Explain the difference between a poor and a strong problem statement, giving an example of each.",
        marks: 4,
      },
      {
        id: "as-q3",
        prompt:
          "Define the role of constraints in a problem specification and provide an example of a well-defined constraint.",
        marks: 3,
      },
      {
        id: "as-q4",
        prompt:
          "Compare high-level objectives and specific goals in the context of computational problem-solving.",
        marks: 3,
      },
      {
        id: "as-q5",
        prompt:
          "Describe the process of decomposition in computational thinking and explain how it can be applied to a real-life problem.",
        marks: 4,
      },
      {
        id: "as-q6",
        prompt:
          "Explain the importance of pattern recognition in computational thinking, using a relevant example.",
        marks: 2,
      },
      {
        id: "as-q7",
        prompt:
          "Describe how abstraction simplifies problem-solving in computational thinking.",
        marks: 2,
      },
      {
        id: "as-q8",
        prompt:
          "Describe the process of algorithmic design, including the steps typically followed.",
        marks: 4,
      },
      {
        id: "as-q9",
        prompt:
          "Explain how the four fundamental concepts of computational thinking work together to solve problems in computer science.",
        marks: 4,
      },
    ],
  },
};

export default b1Unit;
