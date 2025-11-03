import { Fragment } from "react";
import flowchartBasics from "../assets/flowchart-basics.svg";

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

const keyVocabularyList = keyVocabulary.map(({ term, definition }) => ({
  title: term,
  body: definition,
}));

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
          type: "list",
          id: "overview-vocab",
          heading: "Key Vocabulary",
          items: keyVocabularyList,
        },
        {
          type: "micro-quiz",
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
          instructions: "Match each specification component to a fresh scenario example.",
          pairs: [
            {
              term: "Constraint",
              example: "Analytics dashboard must launch within four weeks and use existing cloud licences.",
            },
            {
              term: "Goal",
              example: "Achieve 95 % of grocery orders dispatched within 12 hours.",
            },
            {
              term: "Input specification",
              example: "IoT thermometers streaming temperature data every five minutes in CSV format.",
            },
            {
              term: "Evaluation criterion",
              example: "System uptime of at least 99 % with audit trail for stock adjustments.",
            },
          ],
        },
        {
          type: "table",
          id: "spec-example",
          heading: "Worked Example – Customer Service Chatbot",
          columns: ["Component", "Details"],
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
          type: "micro-quiz",
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
              type: "multi-select",
              prompt: "Select all details that describe constraints for an e-scooter rental platform refresh.",
              options: [
                { id: "spec-q2-a", label: "Launch in three cities before tourist season begins." },
                { id: "spec-q2-b", label: "Increase daily rentals by 30 % during summer." },
                { id: "spec-q2-c", label: "Budget capped at €50 000 for hardware upgrades." },
                { id: "spec-q2-d", label: "Provide itinerary suggestions for riders." },
              ],
              answers: ["spec-q2-a", "spec-q2-c"],
              rationale:
                "Constraints define boundaries such as timelines and budgets. Growth targets or feature ideas are not constraints.",
            },
            {
              id: "spec-q3",
              type: "mcq",
              prompt: "Which question checks whether your evaluation criteria are measurable?",
              options: [
                { id: "spec-q3-a", label: "Who is responsible for building the dashboard?" },
                { id: "spec-q3-b", label: "What accuracy or response time will prove the chatbot is effective?" },
                { id: "spec-q3-c", label: "How will customer journeys be storyboarded?" },
              ],
              answer: "spec-q3-b",
              rationale: "Evaluation criteria require defined success metrics such as accuracy or response time.",
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
          type: "activity",
          id: "ct-classify",
          activityType: "classification",
          heading: "Match Scenarios to CT Concepts",
          instructions: "Drag each scenario to the computational thinking concept it best represents.",
          categories: [
            { id: "decomposition", title: "Decomposition", description: "Break a complex task into manageable parts." },
            { id: "patterns", title: "Pattern recognition", description: "Spot repeated structures or behaviours." },
            { id: "abstraction", title: "Abstraction", description: "Filter noise to focus on essentials." },
            { id: "algorithm", title: "Algorithmic design", description: "Plan the exact steps to follow." },
          ],
          tokens: [
            { id: "ct-token-1", label: "Group past exam questions by topic before revising.", answer: "patterns" },
            { id: "ct-token-2", label: "Describe login validation as inputs, decisions, and outputs.", answer: "abstraction" },
            { id: "ct-token-3", label: "Sketch the cafeteria ordering process as stations.", answer: "decomposition" },
            { id: "ct-token-4", label: "Write pseudocode for a playlist shuffle routine.", answer: "algorithm" },
          ],
        },
        {
          type: "micro-quiz",
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
          type: "activity",
          id: "flow-labels",
          activityType: "diagram-label",
          heading: "Label the Flowchart",
          instructions: "Drag each label onto the numbered hotspot to identify the correct ISO symbol.",
          image: {
            src: flowchartBasics,
            alt: "Simplified flowchart with three numbered callouts.",
          },
          tokens: [
            { id: "label-start", label: "Terminator (Start/End)" },
            { id: "label-process", label: "Process" },
            { id: "label-decision", label: "Decision" },
          ],
          targets: [
            { id: "spot-start", x: 18.5, y: 9, answer: "label-start" },
            { id: "spot-process", x: 56, y: 67, answer: "label-process" },
            { id: "spot-decision", x: 81, y: 15, answer: "label-decision" },
          ],
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
          id: "flow-gap",
          activityType: "gap-fill",
          heading: "Trace Table Sentence Builder",
          instructions: "Drag each phrase into the sentence to explain what a trace table records.",
          interaction: "drag",
          text:
            "A trace table captures the [[flow-state]] of variables, the [[flow-condition]] being evaluated, and the [[flow-output]] produced at each step.",
          tokens: [
            { id: "token-state", label: "current state" },
            { id: "token-condition", label: "condition result" },
            { id: "token-output", label: "output or action" },
          ],
          blanks: [
            { id: "flow-state", answer: "token-state" },
            { id: "flow-condition", answer: "token-condition" },
            { id: "flow-output", answer: "token-output" },
          ],
        },
        {
          type: "micro-quiz",
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
              prompt: "A warehouse flowchart checks \"Inventory below threshold?\" before reordering. Which symbol surrounds this question?",
              options: [
                { id: "flow-q2-a", label: "▭ Process" },
                { id: "flow-q2-b", label: "◇ Decision" },
                { id: "flow-q2-c", label: "⬒ Input/Output" },
              ],
              answer: "flow-q2-b",
              rationale: "The diamond (◇) symbol represents branching logic.",
            },
            {
              id: "flow-q3",
              type: "multi-select",
              prompt: "Select all trace-table observations that prove a while loop stops when a match is found.",
              options: [
                { id: "flow-q3-a", label: "The loop flag switches from true to false once the item matches." },
                { id: "flow-q3-b", label: "The index variable keeps incrementing even after the match." },
                { id: "flow-q3-c", label: "The output column shows \"Found\" immediately after the condition succeeds." },
                { id: "flow-q3-d", label: "The accumulator resets to zero each iteration." },
              ],
              answers: ["flow-q3-a", "flow-q3-c"],
              rationale:
                "A change in the loop control flag and a new output confirm the loop exits once the match occurs. Continuing increments or reset accumulators would indicate it keeps iterating.",
            },
            {
              id: "flow-q4",
              type: "mcq",
              prompt:
                "During a system audit you spot a connector ⊙ leading into a decision with no matching outbound connector. What risk does this introduce?",
              options: [
                { id: "flow-q4-a", label: "It can create an infinite branch that never rejoins the main flow." },
                { id: "flow-q4-b", label: "It forces the process to restart from the terminator symbol." },
                { id: "flow-q4-c", label: "It converts the decision into a process block." },
              ],
              answer: "flow-q4-a",
              rationale: "Connectors must pair to maintain flow continuity; a missing pair can cause dangling branches.",
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
          type: "micro-quiz",
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
