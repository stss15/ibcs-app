import { Fragment } from "react";
import { KeywordCard, Callout, EnhancedTable } from "../components/segments/EnhancedComponents";

const keyVocabulary = [
  {
    term: "Digital system",
    definition: "A combination of input, processing, storage, and output components that work together using binary data.",
    icon: "🖥️",
  },
  {
    term: "Input",
    definition: "Data or signals that enter a computer system from the outside world (for example a keyboard press or sensor reading).",
    icon: "🎤",
  },
  {
    term: "Output",
    definition: "Information a computer system sends back to users, such as images on a screen, printed text, or speaker sound.",
    icon: "🔊",
  },
  {
    term: "Processing",
    definition: "The calculations or decision making a computer performs to turn inputs into useful outputs.",
    icon: "⚙️",
  },
  {
    term: "Peripheral",
    definition: "A device that connects to a computer to add input, output, or storage features (for example, a mouse or printer).",
    icon: "🧲",
  },
];

const overviewAim = (
  <Fragment>
    <p>
      Launch your Year 7 class into computing with an upbeat, teacher-paced journey. Students will discover how digital
      systems sense, think, and respond while you guide the narrative live from the front of the room.
    </p>
    <ul>
      <li>Spot computers hidden in everyday life and describe their role.</li>
      <li>Explain the input → process → output cycle using familiar examples.</li>
      <li>Use precise vocabulary (system, peripheral, sensor) in discussion and quick checks.</li>
      <li>Self-mark a short quiz to prove readiness for the next unit.</li>
    </ul>
  </Fragment>
);

export const y7IntroUnit = {
  id: "Y7-INTRO",
  programmeLabel: "Year 7 Computing",
  title: "Introduction to Computing",
  hours: {
    sl: "KS3 · 2 lessons (90 min)",
    hl: "Teacher-paced whole class",
  },
  guidingQuestion: "How do modern computers sense, process, and improve everyday experiences?",
  overview: {
    aim: overviewAim,
    vocabulary: keyVocabulary,
  },
  stages: [
    {
      id: "Y7-INTRO-1",
      title: "Welcome to Computing",
      duration: "45 min",
      description: "Surface everything students already know about technology and set shared expectations for the year.",
      segments: [
        {
          type: "content",
          id: "y7intro1-overview",
          audience: "teacher",
          heading: "Lesson snapshot",
          body: (
            <Fragment>
              <Callout type="info" title="Objectives">
                <ul>
                  <li>Spot everyday objects that contain hidden digital systems.</li>
                  <li>Use the words <em>input</em>, <em>process</em>, and <em>output</em> in full sentences.</li>
                  <li>Agree classroom norms for practical computing work.</li>
                </ul>
              </Callout>
              <Callout type="tip" title="Key vocabulary">
                <ul>
                  <li><strong>Digital system</strong> – a device that turns inputs into outputs by processing data.</li>
                  <li><strong>Input</strong> – data captured from the world (voice, movement, light).</li>
                  <li><strong>Output</strong> – information or action returned to the user.</li>
                  <li><strong>Peripheral</strong> – hardware that expands a system’s input or output options.</li>
                </ul>
              </Callout>
            </Fragment>
          ),
        },
        {
          type: "content",
          id: "y7intro1-teacher-brief",
          audience: "teacher",
          heading: "Teacher launch plan",
          body: (
            <Fragment>
              <Callout type="info" title="Before you press go">
                <ul>
                  <li>Open Presentation Mode so the slide view fills your display.</li>
                  <li>Invite students to keep devices closed until the first check-for-understanding.</li>
                  <li>Frame the lesson goal: “We will spot computers in places you didn’t expect.”</li>
                </ul>
              </Callout>
              <Callout type="success" title="Teacher-only recall prompts">
                <ul>
                  <li>Ask: “What tech gadget did you use before school today?”</li>
                  <li>Ask: “Why do you think computers are good at repeating tasks?”</li>
                </ul>
              </Callout>
            </Fragment>
          ),
        },
        {
          type: "content",
          id: "y7intro1-task-setup",
          audience: "teacher",
          heading: "Run the classification task",
          body: (
            <Fragment>
              <Callout type="info" title="Facilitate the task">
                <ol>
                  <li>Explain that every card belongs in exactly one column. Model the first drag for the class.</li>
                  <li>Give students two quiet minutes to classify individually, then a minute to compare answers with a partner.</li>
                  <li>Use Presentation Mode to reveal the solution and coach arguments for any cards that caused debate.</li>
                </ol>
              </Callout>
              <Callout type="success" title="Debrief prompts">
                <ul>
                  <li>“Which items fooled you at first? What input/output clues helped you decide?”</li>
                  <li>“How could we upgrade one of the ‘helper’ items so it becomes a digital system?”</li>
                </ul>
              </Callout>
            </Fragment>
          ),
        },
        {
          type: "content",
          id: "y7intro1-big-picture",
          heading: "Computing is everywhere",
          body: (
            <Fragment>
              <p>
                Computers are not just laptops and gaming consoles. Any device that senses inputs, processes data, and
                produces an output counts. From traffic lights to toothbrushes, digital systems quietly run your city.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <KeywordCard
                  term="Traffic sensor"
                  definition="Detects cars (input), times the light change (process), and switches the lights (output)."
                  icon="🚦"
                />
                <KeywordCard
                  term="Fitness tracker"
                  definition="Reads movement (input), calculates steps (process), and shows progress (output)."
                  icon="🏃"
                />
              </div>
              <Callout type="tip" title="Quick partner chat">
                Turn to the person next to you. Name one classroom object that might contain a computer. What clues made you
                think so?
              </Callout>
            </Fragment>
          ),
        },
        {
          type: "activity",
          id: "y7intro1-classification",
          activityType: "classification",
          heading: "Sort the examples",
          instructions: "Drag each item into the category that best matches how it uses computing.",
          categories: [
            { id: "cat-digital", title: "Built-in digital system" },
            { id: "cat-helper", title: "Helpful, but not a computer" },
            { id: "cat-connected", title: "Works best with another computer" },
          ],
          tokens: [
            { id: "tok-smart-speaker", label: "Smart speaker", answer: "cat-digital" },
            { id: "tok-bike-helmet", label: "Bike helmet", answer: "cat-helper" },
            { id: "tok-traffic-sensor", label: "Traffic light sensor", answer: "cat-digital" },
            { id: "tok-fitness-app", label: "Fitness tracker synced to a phone", answer: "cat-connected" },
            { id: "tok-paper-planner", label: "Paper homework planner", answer: "cat-helper" },
            { id: "tok-smart-pet", label: "App-connected pet feeder", answer: "cat-connected" },
          ],
        },
        {
          type: "micro-quiz",
          id: "y7intro1-check",
          heading: "Check your understanding",
          questions: [
            {
              id: "y7intro1-q1",
              type: "mcq",
              prompt: "Which device is definitely a digital system?",
              options: [
                { id: "y7intro1-q1-a", label: "A glass window that lets in sunlight" },
                { id: "y7intro1-q1-b", label: "A smartwatch that tracks your heartbeat" },
                { id: "y7intro1-q1-c", label: "A pencil sharpener" },
              ],
              answer: "y7intro1-q1-b",
              rationale: "The smartwatch senses input, processes data, and shows an output.",
            },
            {
              id: "y7intro1-q2",
              type: "true-false",
              prompt: "All computers need a screen to count as a digital system.",
              answer: false,
              rationale: "Many embedded computers, like smart speakers, have no screen but still compute.",
            },
            {
              id: "y7intro1-q3",
              type: "mcq",
              prompt: "What word best describes a device that adds features to a computer?",
              options: [
                { id: "y7intro1-q3-a", label: "Peripheral" },
                { id: "y7intro1-q3-b", label: "Calculation" },
                { id: "y7intro1-q3-c", label: "Iteration" },
              ],
              answer: "y7intro1-q3-a",
              rationale: "Peripherals extend a system with extra input, output, or storage options.",
            },
          ],
        },
        {
          type: "reflection",
          id: "y7intro1-reflection",
          heading: "Quick reflection",
          prompt: "Write one surprise place you spotted a computer today and explain why it counts as a digital system.",
        },
      ],
    },
    {
      id: "Y7-INTRO-2",
      title: "Inside every digital system",
      duration: "45 min",
      description: "Break a system into inputs, processors, and outputs so students can describe how technology works.",
      segments: [
        {
          type: "content",
          id: "y7intro2-overview",
          audience: "teacher",
          heading: "Lesson snapshot",
          body: (
            <Fragment>
              <Callout type="info" title="Objectives">
                <ul>
                  <li>Model the input → process → output pattern with real-world systems.</li>
                  <li>Connect classroom examples to the language of components (sensor, CPU, actuator).</li>
                  <li>Coach students to justify why a component belongs in a particular stage.</li>
                </ul>
              </Callout>
              <Callout type="tip" title="Key vocabulary">
                <ul>
                  <li><strong>Processor</strong> – the part of a system that makes decisions using instructions.</li>
                  <li><strong>Actuator</strong> – hardware that turns digital decisions into physical movement or light.</li>
                  <li><strong>Feedback</strong> – information that loops back to adjust inputs or processing.</li>
                </ul>
              </Callout>
            </Fragment>
          ),
        },
        {
          type: "content",
          id: "y7intro2-teacher-brief",
          audience: "teacher",
          heading: "Teacher pacing notes",
          body: (
            <Fragment>
              <Callout type="warning" title="Set the stage">
                <ul>
                  <li>Reset the class pace to this stage before students open devices.</li>
                  <li>Use the first slide to recap yesterday’s exit reflections.</li>
                  <li>Prep three volunteers to act out input → process → output with props.</li>
                </ul>
              </Callout>
            </Fragment>
          ),
        },
        {
          type: "content",
          id: "y7intro2-ipo",
          heading: "Input → Process → Output",
          body: (
            <Fragment>
              <p>
                Every digital experience follows the same pattern. Something happens in the real world, a processor makes a
                decision, and the system responds. Spotting this pattern helps you explain any gadget.
              </p>
              <EnhancedTable
                caption="Examples you can model in class"
                columns={["Scenario", "Input", "Process", "Output"]}
                rows={[
                  [
                    "Automatic door",
                    "Motion sensor detects movement",
                    "Controller checks if doorway is clear",
                    "Door motors slide open",
                  ],
                  [
                    "Music streaming app",
                    "You tap the play button",
                    "App fetches the song data and buffers it",
                    "Song plays through the speakers",
                  ],
                  [
                    "Classroom CO₂ monitor",
                    "Sensor measures air quality",
                    "Microcontroller compares to safe ranges",
                    "Display shows green, amber, or red light",
                  ],
                ]}
              />
            </Fragment>
          ),
        },
        {
          type: "content",
          id: "y7intro2-systems-thinking",
          heading: "Systems thinking in plain language",
          body: (
            <Fragment>
              <p>
                Systems thinking means zooming out to see the full story, not just the shiny gadget. We look for inputs,
                outputs, and the decision making in between. If something breaks, this lens helps us troubleshoot.
              </p>
              <Callout type="tip" title="Class discussion">
                Ask: “If the output is wrong, which part of the system should we test first?” Encourage students to justify
                their choice using the table above.
              </Callout>
            </Fragment>
          ),
        },
        {
          type: "content",
          id: "y7intro2-task-setup",
          audience: "teacher",
          heading: "Guide the matching task",
          body: (
            <Fragment>
              <Callout type="info" title="Steps to run">
                <ol>
                  <li>Invite students to predict which items represent input, process, or output before they touch devices.</li>
                  <li>Set a three-minute timer and encourage pairs to justify each match aloud using the vocabulary list.</li>
                  <li>Project the Live Dashboard to monitor progress, then cold-call for explanations once most are complete.</li>
                </ol>
              </Callout>
              <Callout type="warning" title="Teacher move">
                Reinforce that a single component can take different roles in different systems (e.g., a touch screen is both
                input and output). Ask students to produce alternate examples.
              </Callout>
            </Fragment>
          ),
        },
        {
          type: "activity",
          id: "y7intro2-matching",
          activityType: "matching",
          heading: "Match the role to the component",
          instructions: "Pair each component with the job it performs inside a digital system.",
          pairs: [
            {
              term: "Microphone",
              example: "Captures sound waves so the system has data to process (input).",
            },
            {
              term: "CPU",
              example: "Runs instructions to decide what should happen next (process).",
            },
            {
              term: "Screen",
              example: "Shows information back to the user (output).",
            },
            {
              term: "Sensor",
              example: "Reads information from the environment, like light or temperature (input).",
            },
          ],
        },
        {
          type: "micro-quiz",
          id: "y7intro2-check",
          heading: "Ready to explain a system?",
          questions: [
            {
              id: "y7intro2-q1",
              type: "mcq",
              prompt: "Which part of a tablet is an input device?",
              options: [
                { id: "y7intro2-q1-a", label: "Touchscreen" },
                { id: "y7intro2-q1-b", label: "Speaker" },
                { id: "y7intro2-q1-c", label: "Wallpaper background" },
              ],
              answer: "y7intro2-q1-a",
              rationale: "The touchscreen senses taps and swipes, feeding data into the system.",
            },
            {
              id: "y7intro2-q2",
              type: "true-false",
              prompt: "Processing only happens in large desktop computers.",
              answer: false,
              rationale: "Even tiny microcontrollers process instructions to drive outputs.",
            },
            {
              id: "y7intro2-q3",
              type: "multi-select",
              prompt: "Select all examples that show an output from a system.",
              options: [
                { id: "y7intro2-q3-a", label: "A smartwatch vibrating" },
                { id: "y7intro2-q3-b", label: "A touchpad detecting a finger" },
                { id: "y7intro2-q3-c", label: "A classroom display turning red" },
                { id: "y7intro2-q3-d", label: "A temperature sensor measuring the air" },
              ],
              answers: ["y7intro2-q3-a", "y7intro2-q3-c"],
              rationale: "Outputs communicate back — like vibrations or coloured lights — while sensors gather input data.",
            },
          ],
        },
        {
          type: "reflection",
          id: "y7intro2-reflection",
          heading: "Exit ticket",
          prompt: "Describe a system you use at home. Label the input, the process, and the output in one sentence.",
        },
      ],
    },
  ],
  assessment: {
    format: "auto-mcq",
    duration: "15 min",
    totalMarks: 6,
    instructions: "Answer each question to prove you can describe how digital systems work. Review your score instantly.",
    questions: [
      {
        id: "y7intro-assess-q1",
        type: "mcq",
        prompt: "Which option lists the stages of the input-process-output cycle in the correct order?",
        options: [
          { id: "y7intro-assess-q1-a", label: "Process → Output → Input" },
          { id: "y7intro-assess-q1-b", label: "Input → Process → Output" },
          { id: "y7intro-assess-q1-c", label: "Output → Input → Process" },
        ],
        answer: "y7intro-assess-q1-b",
        rationale: "Systems always sense something first, process it, and then respond.",
        points: 2,
      },
      {
        id: "y7intro-assess-q2",
        type: "multi-select",
        prompt: "Select all components that count as input devices.",
        options: [
          { id: "y7intro-assess-q2-a", label: "Microphone" },
          { id: "y7intro-assess-q2-b", label: "Projector" },
          { id: "y7intro-assess-q2-c", label: "Temperature sensor" },
          { id: "y7intro-assess-q2-d", label: "Smart bulb" },
        ],
        answers: ["y7intro-assess-q2-a", "y7intro-assess-q2-c"],
        rationale: "Microphones and sensors capture data. Projectors and smart bulbs send information out.",
        points: 2,
      },
      {
        id: "y7intro-assess-q3",
        type: "mcq",
        prompt: "A climate control system closes the windows when CO₂ levels rise. What is the processing step?",
        options: [
          { id: "y7intro-assess-q3-a", label: "Sensors reading the CO₂" },
          { id: "y7intro-assess-q3-b", label: "Controller deciding the level is unsafe" },
          { id: "y7intro-assess-q3-c", label: "Motors moving the window" },
        ],
        answer: "y7intro-assess-q3-b",
        rationale: "Processing is the decision the controller makes before triggering the motors.",
        points: 2,
      },
    ],
  },
};

export default y7IntroUnit;

