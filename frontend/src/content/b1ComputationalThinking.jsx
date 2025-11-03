import { Fragment } from "react";

const keyVocabulary = [
  {
    term: "Computational Thinking",
    definition:
      "A set of structured problem-solving techniques (abstraction, decomposition, pattern recognition, and algorithmic design) used to express solutions that can be executed computationally.",
  },
  {
    term: "Problem Specification",
    definition:
      "A formal description of a problem that includes the problem statement, stakeholders, constraints, objectives, inputs, outputs, and evaluation criteria.",
  },
  {
    term: "Stakeholder",
    definition: "Anyone affected by or influencing the solution (e.g. client, user, developer).",
  },
  {
    term: "Constraint / Limitation",
    definition: "A restriction such as time, cost, hardware, legislation, or compatibility.",
  },
  {
    term: "Objective",
    definition: "Broad, high-level desired outcome.",
  },
  {
    term: "Goal",
    definition: "Measurable, specific target linked to an objective.",
  },
  {
    term: "Input / Output Specification",
    definition: "Definitions of the type, format, and characteristics of data entering and leaving the system.",
  },
  {
    term: "Evaluation Criteria",
    definition: "Benchmarks for judging solution success (effectiveness, efficiency, usability, maintainability).",
  },
  {
    term: "Abstraction",
    definition: "Focusing on essential details while ignoring irrelevant ones to simplify a system.",
  },
  {
    term: "Decomposition",
    definition: "Breaking a large or complex problem into smaller sub-problems.",
  },
  {
    term: "Pattern Recognition",
    definition: "Identifying similarities or recurring structures to generalise or reuse solutions.",
  },
  {
    term: "Algorithmic Design",
    definition: "Creating a logical, step-by-step plan to solve a problem.",
  },
  {
    term: "Flowchart",
    definition: "A diagram using standardised symbols (ISO 5807) to represent logical steps and decisions in a process.",
  },
  {
    term: "Trace Table",
    definition: "A table showing variable values at each algorithmic step to verify correctness.",
  },
];

const flowchartSymbols = [
  { symbol: "⭘", name: "Start / End", function: "Begin or end of process" },
  { symbol: "⬒", name: "Input / Output", function: "Data entry or display" },
  { symbol: "▭", name: "Process / Operation", function: "Transformation of data" },
  { symbol: "◇", name: "Decision", function: "True/False branch" },
  { symbol: "→", name: "Flowline", function: "Direction of logic" },
  { symbol: "⊙", name: "Connector", function: "Join separate parts of a diagram" },
];

const overviewAim = (
  <Fragment>
    <p>
      Develop the ability to think logically, analyse problems, identify patterns, simplify complexity, and design
      clear, step-by-step computational solutions.
    </p>
    <ul>
      <li>Construct precise problem specifications.</li>
      <li>Apply abstraction, algorithmic design, decomposition, and pattern recognition.</li>
      <li>Trace and evaluate flowcharts for algorithms.</li>
      <li>Relate computational thinking (CT) to real-world applications.</li>
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
  guidingQuestion: "How can we apply a computational solution to a real-world problem?",
  overview: {
    aim: overviewAim,
    vocabulary: keyVocabulary,
  },
  stages: [
    {
      id: "B1-overview",
      title: "Unit Orientation",
      duration: "15 min",
      description:
        "Get familiar with the unit aims, key vocabulary, and how progress will be tracked. This stage introduces the learning contract for the B1 pathway.",
      segments: [
        {
          type: "content",
          id: "overview-aim",
          heading: "Aim of the Unit",
          body: overviewAim,
        },
        {
          type: "vocabulary",
          id: "overview-vocab",
          heading: "Key Vocabulary",
          entries: keyVocabulary,
        },
        {
          type: "checkpoint",
          id: "overview-check",
          heading: "Vocabulary Pulse Check",
          questions: [
            {
              id: "overview-q1",
              type: "mcq",
              prompt: "Which of the following best describes a constraint?",
              options: [
                { id: "opt-a", label: "A measurable milestone used to judge success." },
                { id: "opt-b", label: "Any factor limiting the solution, such as budget or hardware." },
                { id: "opt-c", label: "A list of users who benefit from the system." },
              ],
              answer: "opt-b",
              rationale: "Constraints define the boundaries you must respect while designing the solution.",
            },
            {
              id: "overview-q2",
              type: "true-false",
              prompt: "A goal is broader than an objective.",
              answer: false,
              rationale: "An objective is broad; a goal is a specific measurable milestone supporting the objective.",
            },
          ],
        },
      ],
    },
    {
      id: "B1.1.1",
      title: "Constructing a Problem Specification",
      duration: "45 min",
      description:
        "Learn how to articulate a complete specification that anchors design, testing, and evaluation activities.",
      segments: [
        {
          type: "content",
          id: "spec-why",
          heading: "Why a Specification Matters",
          body: (
            <Fragment>
              <p>
                A clear specification ensures the right problem is solved efficiently and measurably. It anchors design,
                evaluation, and communication between stakeholders.
              </p>
              <p>Explore each component before attempting the matching activity.</p>
            </Fragment>
          ),
        },
        {
          type: "list",
          id: "spec-components",
          heading: "Core Components",
          items: [
            {
              title: "Problem Statement",
              body: (
                <Fragment>
                  <strong>Poor example:</strong> “Our customer service is inefficient.” (too vague)
                  <br />
                  <strong>Better example:</strong> “Customers wait an average of 25 minutes before an agent answers,
                  increasing abandoned calls by 15 % in the last quarter.”
                </Fragment>
              ),
            },
            {
              title: "Constraints / Limitations",
              body: (
                <Fragment>
                  <strong>Poor example:</strong> “We don’t have many resources.”
                  <br />
                  <strong>Better example:</strong> “Budget limited to €10&nbsp;000 with a two-month deadline.”
                </Fragment>
              ),
            },
            {
              title: "Objectives & Goals",
              body: (
                <Fragment>
                  <strong>Objective:</strong> “Enhance customer experience.”
                  <br />
                  <strong>Goal:</strong> “Reduce average hold time by 20&nbsp;% within three months.”
                </Fragment>
              ),
            },
            {
              title: "Input & Output Specifications",
              body: "Define the format, type, and quality of incoming and outgoing data. Example inputs include text, 1–5 ratings, timestamps; outputs include dashboard visuals and alerts.",
            },
            {
              title: "Evaluation Criteria",
              body: (
                <Fragment>
                  Consider effectiveness, efficiency, accuracy, usability, and maintainability. These criteria determine
                  whether the solution genuinely solves the stated problem.
                </Fragment>
              ),
            },
          ],
        },
        {
          type: "activity",
          id: "spec-matching",
          activityType: "matching",
          heading: "Match Components to Examples",
          instructions: "Drag or select the example that best matches each specification element.",
          pairs: [
            {
              term: "Constraint",
              example: "Budget €10 000 and a two-month delivery deadline.",
            },
            {
              term: "Goal",
              example: "Reduce hold time by 20 % within three months.",
            },
            {
              term: "Input specification",
              example: "Customer text queries with timestamps and 1–5 satisfaction ratings.",
            },
            {
              term: "Evaluation criterion",
              example: "User satisfaction of at least 4/5 with 24/7 availability.",
            },
          ],
        },
        {
          type: "worked-example",
          id: "spec-example",
          heading: "Worked Example – Customer Service Chatbot",
          rows: [
            ["Problem statement", "Customers abandon 15 % of chats because agents are unavailable."],
            ["Constraint", "Budget €10 000; must integrate with existing CRM."],
            ["Objective", "Reduce agent load while improving satisfaction."],
            ["Goal", "Achieve 90 % task-completion rate via chatbot within 6 months."],
            ["Input", "Text or voice queries with multilingual support."],
            ["Output", "Text responses, knowledge-base links, escalation transcript."],
            ["Evaluation criteria", "Accuracy, satisfaction ≥ 4/5, 24/7 availability."],
          ],
        },
        {
          type: "checkpoint",
          id: "spec-quiz",
          heading: "Mini Checkpoint",
          questions: [
            {
              id: "spec-q1",
              type: "true-false",
              prompt: "Every problem specification must record constraints explicitly.",
              answer: true,
              rationale: "Constraints shape the feasible solution space and must be stated up front.",
            },
            {
              id: "spec-q2",
              type: "fill-multi",
              prompt: "The three measurable elements of a good goal are:",
              placeholders: ["Element 1", "Element 2", "Element 3"],
              answers: ["baseline", "target", "timeframe"],
              rationale:
                "Strong goals specify the baseline being improved, the target value, and the timeframe for achievement.",
            },
          ],
        },
        {
          type: "reflection",
          id: "spec-reflection",
          heading: "Reflection",
          prompt: "Draft success criteria for your IA or project idea. Which constraints will challenge you most?",
        },
      ],
    },
    {
      id: "B1.1.2",
      title: "Fundamental Computational Thinking Concepts",
      duration: "60 min",
      description:
        "Explore decomposition, pattern recognition, abstraction, and algorithmic design through guiding questions and applied tasks.",
      segments: [
        {
          type: "content",
          id: "ct-intro",
          heading: "Why CT Matters",
          body: (
            <Fragment>
              <p>
                Computational thinking is a transferable framework for problem solving in any discipline—breaking down,
                simplifying, identifying patterns, and formalising logical steps.
              </p>
            </Fragment>
          ),
        },
        {
          type: "accordion",
          id: "ct-decomposition",
          heading: "Decomposition",
          items: [
            {
              title: "Guiding Questions",
              body: (
                <ul>
                  <li>Can I divide this into natural phases or sequences?</li>
                  <li>Which parts are independent or repeat?</li>
                  <li>How could I sketch this visually or explain it simply?</li>
                </ul>
              ),
            },
            {
              title: "Example",
              body: (
                <Fragment>
                  <p>
                    A smartphone can be decomposed into battery, processor, camera, operating system, and sensors—each
                    managed and tested separately.
                  </p>
                </Fragment>
              ),
            },
          ],
        },
        {
          type: "accordion",
          id: "ct-patterns",
          heading: "Pattern Recognition",
          items: [
            {
              title: "Questions",
              body: (
                <ul>
                  <li>What repeats or changes predictably?</li>
                  <li>Which relationships are consistent and reusable?</li>
                </ul>
              ),
            },
            {
              title: "Example",
              body: (
                <Fragment>
                  <p>
                    Handwriting recognition models identify loops, vertical strokes, and pixel clusters—patterns that
                    make classifying letters possible.
                  </p>
                </Fragment>
              ),
            },
          ],
        },
        {
          type: "accordion",
          id: "ct-abstraction",
          heading: "Abstraction",
          items: [
            {
              title: "Guiding Questions",
              body: (
                <ul>
                  <li>What details truly affect the outcome?</li>
                  <li>Which components are essential to function?</li>
                  <li>Can I replace specifics with variables?</li>
                </ul>
              ),
            },
            {
              title: "Worked Example – Car Race",
              body: (
                <Fragment>
                  <p>Focus on engine power, driver skill, track type, and weather. Car colour is irrelevant!</p>
                </Fragment>
              ),
            },
          ],
        },
        {
          type: "accordion",
          id: "ct-algorithm",
          heading: "Algorithmic Design",
          items: [
            {
              title: "Key Questions",
              body: (
                <ul>
                  <li>What are the inputs and outputs?</li>
                  <li>Where are decisions or loops?</li>
                  <li>Can steps be simplified or modularised?</li>
                </ul>
              ),
            },
            {
              title: "Example",
              body: (
                <pre>
{`1. Get current number
2. Add 2
3. Output result`}
                </pre>
              ),
            },
          ],
        },
        {
          type: "activity",
          id: "ct-matrix",
          activityType: "ordering",
          heading: "Order the CT Moves",
          instructions: "Arrange the steps to solve a maze using computational thinking.",
          items: [
            "Break the maze into sections (decomposition).",
            "Record successful routes to reuse (pattern recognition).",
            "Ignore wall texture, focus on openings (abstraction).",
            "Describe the step-by-step solution (algorithmic design).",
          ],
        },
        {
          type: "checkpoint",
          id: "ct-quiz",
          heading: "Concept Checkpoint",
          questions: [
            {
              id: "ct-q1",
              type: "mcq",
              prompt: "Which CT concept helps you ignore distractions when modelling a system?",
              options: [
                { id: "ct-q1-a", label: "Pattern recognition" },
                { id: "ct-q1-b", label: "Abstraction" },
                { id: "ct-q1-c", label: "Algorithmic design" },
              ],
              answer: "ct-q1-b",
              rationale: "Abstraction focuses on essential details and filters unnecessary noise.",
            },
            {
              id: "ct-q2",
              type: "mcq",
              prompt: "A developer sketches a flowchart before coding. Which CT concept is most evident?",
              options: [
                { id: "ct-q2-a", label: "Algorithmic design" },
                { id: "ct-q2-b", label: "Decomposition" },
                { id: "ct-q2-c", label: "Pattern recognition" },
              ],
              answer: "ct-q2-a",
              rationale: "Flowcharts capture the logical sequence of steps—core to algorithmic design.",
            },
          ],
        },
        {
          type: "reflection",
          id: "ct-reflection",
          heading: "Apply CT to Your Context",
          prompt:
            "Think of a current coursework problem. Which CT concept do you instinctively use first, and which do you overlook? Record an action you will take to balance them.",
        },
      ],
    },
    {
      id: "B1.1.4",
      title: "Tracing Flowcharts and Algorithms",
      duration: "45 min",
      description:
        "Use ISO 5807 symbols to communicate logic. Practise tracing flowcharts and verifying behaviour with trace tables.",
      segments: [
        {
          type: "content",
          id: "flow-why",
          heading: "Why Flowcharts Matter",
          body: (
            <Fragment>
              <p>Flowcharts clarify algorithm logic, guide communication, and support debugging and testing.</p>
            </Fragment>
          ),
        },
        {
          type: "table",
          id: "flow-symbols",
          heading: "Core Symbols",
          columns: ["Symbol", "Name", "Function"],
          rows: flowchartSymbols.map((symbol) => [symbol.symbol, symbol.name, symbol.function]),
        },
        {
          type: "content",
          id: "flow-examples",
          heading: "Worked Examples",
          body: (
            <Fragment>
              <p>
                <strong>Guess-the-number game:</strong> Randomly pick 1–10, ask for a guess, compare, repeat until
                correct, output “You win”. Linear search checks elements sequentially until the target is found.
              </p>
              <p>
                <strong>Trace table snippet:</strong> Keep a column per variable and record the value at each step to
                verify correctness.
              </p>
            </Fragment>
          ),
        },
        {
          type: "activity",
          id: "flow-sort",
          activityType: "matching",
          heading: "Symbol Match",
          instructions: "Match each ISO symbol to its description.",
          pairs: flowchartSymbols.map((symbol) => ({
            term: symbol.symbol,
            example: `${symbol.name} — ${symbol.function}`,
          })),
        },
        {
          type: "activity",
          id: "flow-trace",
          activityType: "fill-gaps",
          heading: "Trace Table Practice",
          instructions: "Complete the trace table for the linear search example.",
          rows: [
            {
              prompt: "Step when the algorithm first finds the target?",
              answer: "4",
            },
            {
              prompt: "Value of the index variable at that step?",
              answer: "3",
            },
          ],
        },
        {
          type: "checkpoint",
          id: "flow-quiz",
          heading: "Mini Checkpoint",
          questions: [
            {
              id: "flow-q1",
              type: "true-false",
              prompt: "Trace tables are only useful for finding syntax errors.",
              answer: false,
              rationale: "Trace tables reveal logic errors by tracking variable states across steps.",
            },
            {
              id: "flow-q2",
              type: "mcq",
              prompt: "Which symbol should you use to represent a decision?",
              options: [
                { id: "flow-q2-a", label: "▭ Process" },
                { id: "flow-q2-b", label: "◇ Decision" },
                { id: "flow-q2-c", label: "⬒ Input/Output" },
              ],
              answer: "flow-q2-b",
              rationale: "The diamond (◇) symbol represents branching logic.",
            },
          ],
        },
        {
          type: "reflection",
          id: "flow-reflection",
          heading: "Practical Exercise",
          prompt:
            "Sketch a flowchart of your morning routine using ISO symbols. Ask a peer to interpret it and note ambiguities. Record your refinements here.",
        },
      ],
    },
    {
      id: "B1-project",
      title: "Consolidation Project",
      duration: "60 min",
      description:
        "Synthesize specification writing, CT concepts, and flowcharting by designing a solution for a café sales tracker.",
      segments: [
        {
          type: "content",
          id: "project-brief",
          heading: "Design Brief",
          body: (
            <ol>
              <li>Write a problem specification for tracking weekly café sales.</li>
              <li>Identify where each computational thinking concept will be applied.</li>
              <li>Draw a flowchart and trace it with sample data.</li>
              <li>Suggest evaluation criteria for success.</li>
            </ol>
          ),
        },
        {
          type: "activity",
          id: "project-planner",
          activityType: "planner",
          heading: "Project Planner",
          instructions:
            "Complete each panel to plan your solution. You can export notes once complete. All fields must have content before continuing.",
          panels: [
            { id: "project-problem", label: "Problem statement & stakeholders" },
            { id: "project-constraints", label: "Constraints & goals" },
            { id: "project-ct", label: "CT concepts you will apply" },
            { id: "project-eval", label: "Evaluation criteria" },
          ],
        },
        {
          type: "reflection",
          id: "project-reflection",
          heading: "Ready to Build",
          prompt:
            "What is your biggest risk in this project? Which artefact (specification, flowchart, trace table) will you prototype first?",
        },
      ],
    },
    {
      id: "B1-summary",
      title: "Summary & Linking Questions",
      duration: "20 min",
      description: "Review checklist and prepare to sit the assessment.",
      segments: [
        {
          type: "content",
          id: "summary-checklist",
          heading: "Summary Checklist",
          body: (
            <ul>
              <li>Define and justify elements of a problem specification.</li>
              <li>Describe and apply the four computational thinking concepts.</li>
              <li>Explain CT’s use in software, data, AI, and security.</li>
              <li>Construct and trace flowcharts with ISO symbols.</li>
              <li>Evaluate solutions against effectiveness, efficiency, and ethics.</li>
            </ul>
          ),
        },
        {
          type: "content",
          id: "summary-links",
          heading: "Linking Questions",
          body: (
            <ul>
              <li>How is pattern recognition used to identify different types of network traffic? (A2)</li>
              <li>How do CT concepts influence algorithm design? (B2)</li>
            </ul>
          ),
        },
        {
          type: "checkpoint",
          id: "summary-quiz",
          heading: "Exit Ticket",
          questions: [
            {
              id: "summary-q1",
              type: "mcq",
              prompt: "Which artefact best demonstrates maintainability in your solution?",
              options: [
                { id: "summary-q1-a", label: "A specification with clear version history." },
                { id: "summary-q1-b", label: "A flowchart without decision nodes." },
                { id: "summary-q1-c", label: "A trace table that only shows final outputs." },
              ],
              answer: "summary-q1-a",
              rationale: "Maintainability depends on documentation that supports change over time.",
            },
          ],
        },
      ],
    },
  ],
  assessment: {
    duration: "45 min",
    totalMarks: 25,
    questions: [
      {
        id: "assessment-q1",
        prompt: "Define computational thinking and explain its four core concepts.",
        marks: 3,
      },
      {
        id: "assessment-q2",
        prompt: "Explain why a clear problem specification is essential before coding, using an example.",
        marks: 4,
      },
      {
        id: "assessment-q3",
        prompt:
          "Outline and justify one constraint, one objective, and one evaluation criterion for a mobile banking app.",
        marks: 4,
      },
      {
        id: "assessment-q4",
        prompt: "Describe how decomposition and pattern recognition work together in machine learning model development.",
        marks: 6,
      },
      {
        id: "assessment-q5a",
        prompt: "Identify the input, process, and output for an algorithm that converts hours and minutes to seconds.",
        marks: 3,
      },
      {
        id: "assessment-q5b",
        prompt: "Draw or describe a flowchart to find the largest of three numbers.",
        marks: 3,
      },
      {
        id: "assessment-q5c",
        prompt: "Explain two benefits of trace tables when testing algorithms.",
        marks: 2,
      },
      {
        id: "assessment-q5d",
        prompt: "Discuss one ethical risk of using computational thinking in AI decision-making.",
        marks: 2,
      },
    ],
  },
};

export default b1Unit;
