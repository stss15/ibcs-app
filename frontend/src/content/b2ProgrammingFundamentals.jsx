import { Fragment } from "react";
import systemArchitecture from "../assets/system-architecture.svg";

const keyVocabulary = [
  {
    term: "Variable",
    definition: "Named reference to a value stored in memory.",
  },
  {
    term: "Data type",
    definition: "Describes the kind of value a variable may store and which operations are valid.",
  },
  {
    term: "Boolean",
    definition: "True or False value used in decision making.",
  },
  {
    term: "Integer",
    definition: "Whole number without a fractional component.",
  },
  {
    term: "Float",
    definition: "Number with a fractional component; supports decimal precision.",
  },
  {
    term: "String",
    definition: "Ordered, immutable sequence of characters.",
  },
  {
    term: "Character",
    definition: "Single-character string such as \"A\".",
  },
  {
    term: "List",
    definition: "Ordered, mutable collection of values.",
  },
  {
    term: "Dictionary",
    definition: "Mapping of keys to values for structured records.",
  },
  {
    term: "Operator",
    definition: "Symbol performing arithmetic, comparison, or logical work.",
  },
  {
    term: "Assignment",
    definition: "Evaluates the right-hand expression and stores the result in a variable.",
  },
  {
    term: "Slice",
    definition: "Portion of a sequence selected using start:stop indexes.",
  },
  {
    term: "Concatenation",
    definition: "Combining sequences end-to-end.",
  },
  {
    term: "Escape character",
    definition: "Backslash (\\) used to insert quotes, newlines, or tabs into strings.",
  },
  {
    term: "Exception",
    definition: "Runtime error that can be intercepted with try/except blocks.",
  },
  {
    term: "Debugging",
    definition: "Structured process of locating and fixing errors.",
  },
  {
    term: "Trace table",
    definition: "Table logging variable values across steps to verify logic.",
  },
];

const keyVocabularyList = keyVocabulary.map(({ term, definition }) => ({
  title: term,
  body: definition,
}));

const overviewAim = (
  <Fragment>
    <p>
      Build fluency writing, tracing, and debugging Python programs. You will evaluate data types, practise string
      manipulation, defend against runtime errors, and apply deliberate debugging workflows.
    </p>
    <ul>
      <li>Choose appropriate data types and reason about scope and assignment.</li>
      <li>Slice, search, and format strings defensively while reusing the Python standard library.</li>
      <li>Handle exceptions gracefully and document debugging evidence.</li>
    </ul>
  </Fragment>
);

const learningOutcomes = (
  <Fragment>
    <p>After completing this pathway you will be able to:</p>
    <ul>
      <li>
        <strong>B2.1.1</strong> Construct and trace programs that use global and local variables of multiple data types.
      </li>
      <li>
        <strong>B2.1.2</strong> Extract, reformat, and validate substrings using language-standard operations.
      </li>
      <li>
        <strong>B2.1.3</strong> Describe and implement common exception handling strategies.
      </li>
      <li>
        <strong>B2.1.4</strong> Apply structured debugging techniques including trace tables, breakpoints, and logging.
      </li>
    </ul>
  </Fragment>
);

const typeComparisonRows = [
  ["Boolean", "flag = True", "Booleans control decision branches and loop flow."],
  ["Integer", "attempts = 3", "Whole numbers; combine with // for floor division."],
  ["Float", "price = 19.95", "Store decimal values; use round() or format() for display."],
  ["String", 'name = "Ibcs"', "Immutable sequences; slicing returns new strings."],
  ["List", "scores = [88, 76, 93]", "Ordered, mutable collection suited to loops and aggregations."],
  ["Dictionary", '{"username": "ada", "role": "student"}', "Key/value pairs for structured records."],
  ["Set", '{"python", "scratch"}', "Unique items with fast membership tests."],
  ["Operators", "+ - * / // % **, comparisons < <= > >= == !=, logic and or not", "Pick the operator that matches the required behaviour."],
  ["Assignment", "score = base + bonus", "Right side evaluates first; previous value is overwritten."],
];

const stringMethodRows = [
  ["Indexing", "greeting[2]", "Returns character at index 2; check len(greeting) first."],
  ["Slice", "phrase[0:8]", "Start index inclusive, end exclusive; supports negative indexes."],
  ["find", 'phrase.find("Sci")', "Returns index or -1 if not found; test before slicing."],
  ["replace", 'phrase.replace("is", "will be")', "Creates a new string with replacements."],
  ["split", 'sentence.split()', "Breaks a string into a list of tokens on whitespace by default."],
  ["strip", 'raw.strip()', "Removes leading and trailing whitespace."],
  ["formatting", 'f"{item} costs {price:.2f}"', "Use f-strings for readable output with controlled precision."],
];

const exceptionScenarios = [
  {
    title: "Unexpected input",
    body: (
      <Fragment>
        <p>
          Users may enter empty strings, negative numbers, or malformed data. Validate ranges and wrap conversions in
          <code>try/except</code> to present a helpful message instead of letting the program crash.
        </p>
      </Fragment>
    ),
  },
  {
    title: "Missing resources",
    body: (
      <Fragment>
        <p>
          Files, databases, or network resources might not exist or might be unavailable. Handle exceptions like{" "}
          <code>FileNotFoundError</code> and close resources in a <code>finally</code> block.
        </p>
      </Fragment>
    ),
  },
  {
    title: "Logic errors at runtime",
    body: (
      <Fragment>
        <p>
          Off-by-one indexes or division by zero can surface after deployment. Defensive checks and descriptive error
          messages make debugging faster for future maintainers.
        </p>
      </Fragment>
    ),
  },
];

const debuggingTechniqueItems = [
  {
    title: "Trace tables",
    body: (
      <Fragment>
        <p>
          Track variable values per iteration to reveal where logic diverges. Perfect for validating loop boundaries or
          conditional branches.
        </p>
      </Fragment>
    ),
  },
  {
    title: "Breakpoints",
    body: (
      <Fragment>
        <p>
          Pause program execution at a line to inspect state. Use when a branch or loop appears to skip expected code.
        </p>
      </Fragment>
    ),
  },
  {
    title: "Print logging",
    body: (
      <Fragment>
        <p>
          Insert temporary print statements to confirm control flow and data values. Combine with labels so output stays
          clear during debugging.
        </p>
      </Fragment>
    ),
  },
  {
    title: "Step execution",
    body: (
      <Fragment>
        <p>
          Use your IDE to run code line-by-line. Ideal when you suspect an off-by-one error or incorrect function call
          order.
        </p>
      </Fragment>
    ),
  },
];

export const b2Unit = {
  id: "B2",
  title: "Programming Fundamentals",
  hours: {
    sl: "SL · 40 hours",
    hl: "HL · 42 hours",
  },
  guidingQuestion: "How can we apply programming to solve problems?",
  overview: {
    aim: overviewAim,
    vocabulary: keyVocabulary,
  },
  stages: [
    {
      id: "B2-overview",
      title: "Unit Orientation",
      duration: "20 min",
      description:
        "Orient yourself to the learning outcomes, vocabulary, and assessment flow for programming fundamentals.",
      segments: [
        {
          type: "content",
          id: "b2-overview-aim",
          heading: "Aim of the Unit",
          body: overviewAim,
        },
        {
          type: "content",
          id: "b2-overview-outcomes",
          heading: "Learning Outcomes",
          body: learningOutcomes,
        },
        {
          type: "list",
          id: "b2-overview-vocab",
          heading: "Key Vocabulary",
          items: keyVocabularyList,
        },
        {
          type: "micro-quiz",
          id: "b2-overview-check",
          heading: "Ready to Start?",
          questions: [
            {
              id: "b2-overview-q1",
              type: "mcq",
              prompt: "Which statement best describes a programming variable?",
              options: [
                { id: "b2-overview-q1-a", label: "Static storage that cannot change after initial assignment." },
                {
                  id: "b2-overview-q1-b",
                  label: "Named memory location whose stored value can update during execution.",
                },
                { id: "b2-overview-q1-c", label: "Collection of operations that run only once." },
              ],
              answer: "b2-overview-q1-b",
              rationale: "Variables are storage locations that can change while a program runs.",
            },
            {
              id: "b2-overview-q2",
              type: "true-false",
              prompt: "Exception handling exists to hide bugs rather than improve user experience.",
              answer: false,
              rationale: "Exception handling catches predictable failures and offers recovery paths for users.",
            },
          ],
        },
      ],
    },
    {
      id: "B2.1.1",
      title: "Variables and Data Types",
      duration: "55 min",
      description:
        "Choose appropriate data types, reason about scope, and trace how assignments update program state.",
      segments: [
        {
          type: "content",
          id: "b2-211-why",
          heading: "Why Variables and Types Matter",
          body: (
            <Fragment>
              <p>
                Correct types unlock valid operations and prevent precision loss. When you choose the wrong type, simple
                calculations can overflow, string conversions become awkward, and comparisons fail silently.
              </p>
              <p>
                Understanding scope also prevents accidental reuse of values and makes debugging faster because you know
                where each variable lives.
              </p>
            </Fragment>
          ),
        },
        {
          type: "table",
          id: "b2-211-types",
          heading: "Type Cheat Sheet",
          columns: ["Concept", "Python example", "Why it matters"],
          rows: typeComparisonRows,
        },
        {
          type: "list",
          id: "b2-211-rules",
          heading: "Essential Rules",
          items: [
            {
              title: "Declaration vs inference",
              body: "Python infers type from the assigned value. Keep readability high by naming variables descriptively and documenting expected types when needed.",
            },
            {
              title: "Scope",
              body: "Global variables persist for the program lifetime; local variables disappear when a function or block ends. Minimise global state to avoid surprise mutations.",
            },
            {
              title: "Assignments overwrite",
              body: "When you assign a new value, the prior contents are gone. Copy values you still need before overwriting.",
            },
            {
              title: "Type conversions",
              body: "Use constructors like int(), float(), str(), or bool() to convert values explicitly and capture ValueError when inputs are invalid.",
            },
          ],
        },
        {
          type: "activity",
          id: "b2-211-diagram",
          activityType: "diagram-label",
          heading: "Label the System Components",
          instructions: "Drag each label onto the numbered hotspot to identify how data flows through a simple computer system.",
          image: {
            src: systemArchitecture,
            alt: "Diagram showing input, CPU, cache and output blocks.",
          },
          tokens: [
            { id: "sys-input", label: "Input devices" },
            { id: "sys-cpu", label: "CPU" },
            { id: "sys-cache", label: "Cache / RAM" },
            { id: "sys-output", label: "Output devices" },
          ],
          targets: [
            { id: "spot-input", x: 31, y: 42, answer: "sys-input" },
            { id: "spot-cpu", x: 50, y: 20, answer: "sys-cpu" },
            { id: "spot-cache", x: 50, y: 89, answer: "sys-cache" },
            { id: "spot-output", x: 84, y: 39, answer: "sys-output" },
          ],
        },
        {
          type: "activity",
          id: "b2-211-matching",
          activityType: "matching",
          heading: "Match the Data Type to the Scenario",
          instructions: "Match each scenario to the most appropriate data type choice.",
          pairs: [
            {
              term: "Boolean",
              example: "Store whether a customer opted in to marketing emails.",
            },
            {
              term: "float",
              example: "Track the price of a flight ticket with cents precision.",
            },
            {
              term: "String",
              example: "Record a phone number that preserves leading zeroes and punctuation.",
            },
            {
              term: "int",
              example: "Count how many login attempts remain before lockout.",
            },
            {
              term: "list",
              example: "Maintain the quiz scores for a single student.",
            },
          ],
        },
        {
          type: "activity",
          id: "b2-211-swap",
          activityType: "ordering",
          heading: "Ordering: Safe Variable Swap",
          instructions: "Arrange the steps to safely swap two variable values using a temporary placeholder.",
          items: [
            "Store the value of variable A in temp.",
            "Assign the value of variable B to variable A.",
            "Assign temp to variable B.",
            "Declare the temporary variable temp.",
          ],
        },
        {
          type: "activity",
          id: "b2-211-spot",
          activityType: "spot-error",
          heading: "Spot the Type Errors",
          instructions: "Select every line that would raise a type or casting issue.",
          items: [
            {
              id: "b2-211-spot-1",
              text: "price = float(\"9.99\")",
              isError: false,
              explanation: "Converting the string to a float succeeds when the input is numeric.",
            },
            {
              id: "b2-211-spot-2",
              text: "tickets = int(user_input)",
              isError: true,
              explanation: "If user_input is not numeric this raises ValueError unless wrapped in try/except.",
            },
            {
              id: "b2-211-spot-3",
              text: "total = 42 + \" students\"",
              isError: true,
              explanation: "Python cannot add an int and a string without explicit conversion.",
            },
            {
              id: "b2-211-spot-4",
              text: "done = bool(1)",
              isError: false,
              explanation: "bool(1) evaluates to True, which is valid when you intend to cast integers to boolean.",
            },
            {
              id: "b2-211-spot-5",
              text: "stock = list({\"apples\": 3})",
              isError: true,
              explanation: "Casting a dict to list drops keys unexpectedly; use list(dictionary.items()) or keep the dict type.",
            },
          ],
        },
        {
          type: "python-playground",
          id: "b2-211-playground",
          heading: "Try It: Inspecting Types and Swapping",
          prompt: (
            <Fragment>
              <p>Run the starter to inspect variable types, then experiment with your own assignments.</p>
              <ul>
                <li>Observe how Python infers types and how <code>type()</code> reports them.</li>
                <li>Practise swapping values without losing the original data.</li>
              </ul>
            </Fragment>
          ),
          starterCode: `user_name = "Ada"
age_years = 19
ticket_price = 19.95
is_student = True

print("Values:", user_name, age_years, ticket_price, is_student)
print("Types:", type(user_name), type(age_years), type(ticket_price), type(is_student))

# TODO: swap the values of a and b without losing data
a = 7
b = 3
print("Before swap:", a, b)

temp = a
a = b
b = temp

print("After swap:", a, b)
`,
          snippets: [
            {
              id: "b2-211-cast",
              label: "Cast user input",
              code: 'raw_age = "17"\\nage = int(raw_age)\\nprint("Age as int:", age, type(age))',
            },
            {
              id: "b2-211-format",
              label: "Format receipt line",
              code: 'item = "Notebook"\\nprice = 4.5\\nprint(f"{item} ... ${price:.2f}")',
            },
          ],
        },
        {
          type: "micro-quiz",
          id: "b2-211-quiz",
          heading: "Mini Checkpoint",
          questions: [
            {
              id: "b2-211-q1",
              type: "mcq",
              prompt: "What does 7 // 2 evaluate to in Python?",
              options: [
                { id: "b2-211-q1-a", label: "3.5" },
                { id: "b2-211-q1-b", label: "3" },
                { id: "b2-211-q1-c", label: "4" },
              ],
              answer: "b2-211-q1-b",
              rationale: "// performs floor division, returning the integer 3 for 7 // 2.",
            },
            {
              id: "b2-211-q2",
              type: "true-false",
              prompt: "Python floor division uses the operator //.",
              answer: true,
              rationale: "`//` performs floor division in Python, returning an integer result.",
            },
            {
              id: "b2-211-q3",
              type: "mcq",
              prompt: "Why do we need a temporary variable when swapping values?",
              options: [
                {
                  id: "b2-211-q3-a",
                  label: "Without it the interpreter refuses to reassign values.",
                },
                {
                  id: "b2-211-q3-b",
                  label: "Reassignment overwrites values; a temporary variable preserves one value until the swap finishes.",
                },
                {
                  id: "b2-211-q3-c",
                  label: "It makes the code compile faster.",
                },
              ],
              answer: "b2-211-q3-b",
              rationale: "Assignments overwrite values, so a temporary placeholder preserves one of them during the swap.",
            },
            {
              id: "b2-211-q4",
              type: "true-false",
              prompt: "bool(0) evaluates to False in Python.",
              answer: true,
              rationale: "Non-zero numbers cast to True; zero casts to False.",
            },
          ],
        },
        {
          type: "reflection",
          id: "b2-211-reflection",
          heading: "Reflection",
          prompt: "When would you store age as a float instead of an int in a Python application? Justify the choice.",
        },
      ],
    },
    {
      id: "B2.1.2",
      title: "Strings: Extraction and Manipulation",
      duration: "55 min",
      description:
        "Practise slicing, searching, and formatting text while guarding against index errors and inconsistent casing.",
      segments: [
        {
          type: "content",
          id: "b2-212-why",
          heading: "Why String Skills Matter",
          body: (
            <Fragment>
              <p>
                User-facing programs rely on text: usernames, passwords, log entries, IoT messages. Clean string
                handling makes it possible to validate input and prepare meaningful outputs.
              </p>
              <p>
                Index errors and inconsistent casing are common failure points—defensive slicing and checks keep strings
                safe before you manipulate them.
              </p>
            </Fragment>
          ),
        },
        {
          type: "accordion",
          id: "b2-212-techniques",
          heading: "Technique Highlights",
          items: [
            {
              title: "Indexing",
              body: (
                <Fragment>
                  <p>
                    Python indexing requires <code>0 ≤ index &lt; len(sequence)</code>. Check the length first to avoid
                    <code>IndexError</code>.
                  </p>
                </Fragment>
              ),
            },
            {
              title: "Finding substrings",
              body: (
                <Fragment>
                  <p>
                    Use <code>find</code> to locate substrings. A result of <code>-1</code> means the target was not
                    found—handle that before slicing.
                  </p>
                </Fragment>
              ),
            },
            {
              title: "Formatting output",
              body: (
                <Fragment>
                  <p>
                    Python f-strings produce readable output with explicit formatting. Prefer them over manual
                    concatenation when combining multiple values.
                  </p>
                </Fragment>
              ),
            },
          ],
        },
        {
          type: "table",
          id: "b2-212-methods",
          heading: "Common String Operations",
          columns: ["Operation", "Python example", "Why use it?"],
          rows: stringMethodRows,
        },
        {
          type: "activity",
          id: "b2-212-matching",
          activityType: "matching",
          heading: "Match Method to Outcome",
          instructions: "Pair each operation with the result it produces for the sample string.",
          pairs: [
            {
              term: 's = "Old Town"; s[4]',
              example: '"T"',
            },
            {
              term: 's = "Computer Science is fun"; s[9:16]',
              example: '"Science"',
            },
            {
              term: 's = "Computer Science is fun"; s.replace("is", "will be")',
              example: '"Computer Science will be fun"',
            },
            {
              term: 'words = "Hello world".split()',
              example: '["Hello", "world"]',
            },
          ],
        },
        {
          type: "activity",
          id: "b2-212-gap",
          activityType: "gap-fill",
          heading: "Fill the String Toolkit",
          instructions: "Drag the correct method into each blank to complete the description.",
          interaction: "drag",
          text:
            "Use [[b2-212-gap-find]] to locate a substring, [[b2-212-gap-slice]] to extract it, and [[b2-212-gap-format]] to output a tidy message.",
          tokens: [
            { id: "token-find", label: "find" },
            { id: "token-slice", label: "slice" },
            { id: "token-format", label: "f-string" },
          ],
          blanks: [
            { id: "b2-212-gap-find", answer: "token-find" },
            { id: "b2-212-gap-slice", answer: "token-slice" },
            { id: "b2-212-gap-format", answer: "token-format" },
          ],
        },
        {
          type: "python-playground",
          id: "b2-212-playground",
          heading: "Try It: Build a Password Tag",
          prompt: (
            <Fragment>
              <p>
                Generate a simple password suggestion using slices and formatting. Modify indices or methods to see how
                the output changes.
              </p>
              <p className="muted">Tip: Re-run the code each time you tweak the slicing range.</p>
            </Fragment>
          ),
          starterCode: `surname = "Stewart"
special = "#42"
base = surname.lower()

first_four = base[:4]
password = f"{first_four}{special}"

print(password)

# Challenge: ensure surname is at least 4 characters before slicing.
if len(base) < 4:
    print("Surname too short for default slice.")
`,
          snippets: [
            {
              id: "b2-212-strip",
              label: "Strip whitespace",
              code: 'raw = "  Computer Science  "\\nprint(raw.strip())',
            },
            {
              id: "b2-212-format",
              label: "Format sentence",
              code: 'course = "IBCS"\\nscore = 87.456\\nprint(f"{course} score: {score:.1f}")',
            },
          ],
        },
        {
          type: "micro-quiz",
          id: "b2-212-quiz",
          heading: "String Skills Pulse Check",
          questions: [
            {
              id: "b2-212-q1",
              type: "mcq",
              prompt: 'What does Python return for "Science"[2:6]?',
              options: [
                { id: "b2-212-q1-a", label: '"ienc"' },
                { id: "b2-212-q1-b", label: '"ien"' },
                { id: "b2-212-q1-c", label: '"ence"' },
              ],
              answer: "b2-212-q1-a",
              rationale: "Start index inclusive (2) and end exclusive (6) yields the characters i, e, n, c.",
            },
            {
              id: "b2-212-q2",
              type: "true-false",
              prompt: "Python strings are immutable.",
              answer: true,
              rationale: "All string operations return new strings instead of modifying the original.",
            },
            {
              id: "b2-212-q3",
              type: "mcq",
              prompt: "Which approach most clearly concatenates numbers into a string?",
              options: [
                { id: "b2-212-q3-a", label: "Use the + operator repeatedly with raw integers." },
                {
                  id: "b2-212-q3-b",
                  label: "Use formatting, e.g., f-strings or String.format, to control layout explicitly.",
                },
                { id: "b2-212-q3-c", label: "Convert numbers to binary strings first." },
              ],
              answer: "b2-212-q3-b",
              rationale: "Formatting keeps intent clear and avoids implicit conversions.",
            },
          ],
        },
        {
          type: "reflection",
          id: "b2-212-reflection",
          heading: "Reflection",
          prompt: "When concatenating numbers into strings, which Python formatting approach keeps your intent clearest?",
        },
      ],
    },
    {
      id: "B2.1.3",
      title: "Exception Handling",
      duration: "45 min",
      description: "Plan for runtime failures and design error messages that guide users instead of crashing the app.",
      segments: [
        {
          type: "content",
          id: "b2-213-why",
          heading: "Why Exceptions Happen",
          body: (
            <Fragment>
              <p>
                Unchecked input, missing files, and timing issues cause runtime failures. Exception handling lets you
                respond predictably, log useful diagnostics, and keep programs stable.
              </p>
              <p>
                The goal is not to hide bugs—it is to surface helpful information while preserving control over the app.
              </p>
            </Fragment>
          ),
        },
        {
          type: "list",
          id: "b2-213-failures",
          heading: "Typical Failure Points",
          items: [
            {
              title: "Bad or missing input",
              body: "Empty strings, unexpected characters, or numbers outside an allowed range.",
            },
            {
              title: "Unavailable resources",
              body: "Files, networks, or sensors that fail to respond when needed.",
            },
            {
              title: "Logic defects",
              body: "Dividing by zero, out-of-range indexes, or null dereferences triggered by logic mistakes.",
            },
          ],
        },
        {
          type: "accordion",
          id: "b2-213-accordion",
          heading: "Handling Patterns",
          items: exceptionScenarios,
        },
        {
          type: "activity",
          id: "b2-213-classify",
          activityType: "classification",
          heading: "Classify the Exception Strategy",
          instructions: "Drag each scenario to the way you would respond to it.",
          categories: [
            { id: "prevent", title: "Prevent", description: "Validate or constrain inputs before they fail." },
            { id: "handle", title: "Handle", description: "Catch the error and present a friendly message." },
            { id: "recover", title: "Recover", description: "Retry or fallback to keep the program running." },
          ],
          tokens: [
            {
              id: "b2-213-token-1",
              label: "Ensure age is 0-120 before converting user input.",
              answer: "prevent",
            },
            {
              id: "b2-213-token-2",
              label: "Wrap file access in try/except and show a missing-file notice.",
              answer: "handle",
            },
            {
              id: "b2-213-token-3",
              label: "Retry a network request with exponential back-off.",
              answer: "recover",
            },
            {
              id: "b2-213-token-4",
              label: "Validate dropdown selections so invalid IDs never hit the server.",
              answer: "prevent",
            },
          ],
        },
        {
          type: "activity",
          id: "b2-213-ordering",
          activityType: "ordering",
          heading: "Ordering: Handle Input Safely",
          instructions: "Place the steps in order to validate age input and handle failures.",
          items: [
            "Prompt the user for age input.",
            "Attempt to convert the input to an integer inside a try block.",
            "Check that the age is between 0 and 120 inclusive.",
            "Raise or report an error if conversion fails or the range check fails.",
            "Proceed with the program when conversion and range checks succeed.",
          ],
        },
        {
          type: "micro-quiz",
          id: "b2-213-quiz",
          heading: "Exception Handling Pulse Check",
          questions: [
            {
              id: "b2-213-q1",
              type: "true-false",
              prompt: "A finally block only runs when an exception occurs.",
              answer: false,
              rationale: "Finally runs regardless of whether an exception was raised.",
            },
            {
              id: "b2-213-q2",
              type: "mcq",
              prompt: "Which Python exception best matches a missing file scenario?",
              options: [
                { id: "b2-213-q2-a", label: "FileNotFoundError" },
                { id: "b2-213-q2-b", label: "IndexError" },
                { id: "b2-213-q2-c", label: "ValueError" },
              ],
              answer: "b2-213-q2-a",
              rationale: "Missing resources trigger file-related exceptions that must be handled.",
            },
            {
              id: "b2-213-q3",
              type: "mcq",
              prompt: "How does 'garbage in, garbage out' influence validation?",
              options: [
                {
                  id: "b2-213-q3-a",
                  label: "It suggests skipping validation to avoid upsetting users.",
                },
                {
                  id: "b2-213-q3-b",
                  label: "It emphasises preventing bad input early to avoid cascading failures.",
                },
                { id: "b2-213-q3-c", label: "It means errors are always the user's fault." },
              ],
              answer: "b2-213-q3-b",
              rationale: "Defensive validation stops bad input before it propagates through the system.",
            },
          ],
        },
        {
          type: "reflection",
          id: "b2-213-reflection",
          heading: "Reflection",
          prompt: "How does “garbage in, garbage out” influence your validation strategy for user forms?",
        },
      ],
    },
    {
      id: "B2.1.4",
      title: "Debugging Techniques",
      duration: "50 min",
      description:
        "Diagnose faults with trace tables, breakpoints, print logging, and step execution, then apply them to a sample program.",
      segments: [
        {
          type: "content",
          id: "b2-214-why",
          heading: "Debugging without Guesswork",
          body: (
            <Fragment>
              <p>
                Bugs lurk in correct-looking code. A deliberate debugging workflow saves hours compared with random
                tweaks—especially when the bug refuses to reproduce on command.
              </p>
              <p>Pick tools based on symptoms, capture evidence, and share it with teammates for faster fixes.</p>
            </Fragment>
          ),
        },
        {
          type: "accordion",
          id: "b2-214-techniques",
          heading: "Technique Toolkit",
          items: debuggingTechniqueItems,
        },
        {
          type: "activity",
          id: "b2-214-matching",
          activityType: "matching",
          heading: "Match Bug Symptom to Technique",
          instructions: "Choose the debugging technique that best fits each scenario.",
          pairs: [
            {
              term: "Loop skips the final element",
              example: "Complete a trace table to inspect index and length per iteration.",
            },
            {
              term: "Branch never triggers even with matching conditions",
              example: "Set a breakpoint on the branch and inspect variable values at runtime.",
            },
            {
              term: "API call fails midway through execution",
              example: "Add labelled print statements before and after the call to confirm parameters and response.",
            },
            {
              term: "Suspect off-by-one error in nested loop",
              example: "Use step execution to watch the loop counters progress together.",
            },
          ],
        },
        {
          type: "activity",
          id: "b2-214-completion",
          activityType: "code-completion",
          heading: "Code Completion: Debug Logger",
          instructions: "Fill in the missing expressions to finish the debugging helper.",
          prompt: (
            <Fragment>
              <p>Use deliberate logging to capture what your loop is doing at runtime.</p>
            </Fragment>
          ),
          code: `for index, value in enumerate(numbers):\n    [[b2-214-gap-log]]\n    if [[b2-214-gap-condition]]:\n        print("Found the value", value)\n`,
          placeholders: [
            {
              id: "b2-214-gap-log",
              answer: "print(f\"Checking index {index}: {value}\")",
              label: "Log statement",
              hint: "Print both the index and current value.",
            },
            {
              id: "b2-214-gap-condition",
              answer: "value == target",
              label: "Condition",
              hint: "Compare the current value to the target before printing.",
            },
          ],
        },
        {
          type: "python-playground",
          id: "b2-214-playground",
          heading: "Try It: Debug Selection Sort",
          prompt: (
            <Fragment>
              <p>
                Run the selection sort sample with logging enabled. Modify the logging to capture more detail or fix the
                bug that misplaces the final element.
              </p>
            </Fragment>
          ),
          starterCode: `numbers = [7, 2, 9, 4, 3]

def selection_sort(values):
    items = values[:]
    for i in range(len(items) - 1):
        lowest_index = i
        print(f"Outer loop i={i}, start list: {items}")
        for j in range(i + 1, len(items)):
            print(f"  Compare items[{j}]={items[j]} with items[{lowest_index}]={items[lowest_index]}")
            if items[j] < items[lowest_index]:
                lowest_index = j
        # BUG: swap missing when lowest_index equals i
        if lowest_index != i:
            items[i], items[lowest_index] = items[lowest_index], items[i]
        print(f"After pass {i}: {items}")
    return items

print("Original:", numbers)
sorted_values = selection_sort(numbers)
print("Sorted:", sorted_values)
`,
          snippets: [
            {
              id: "b2-214-trace",
              label: "Trace with enumerate",
              code: 'for index, value in enumerate(numbers):\\n    print(index, value)',
            },
            {
              id: "b2-214-todo",
              label: "Add TODO marker",
              code: 'print("TODO: inspect lowest_index when equal to i")',
            },
          ],
        },
        {
          type: "micro-quiz",
          id: "b2-214-quiz",
          heading: "Debugging Pulse Check",
          questions: [
            {
              id: "b2-214-q1",
              type: "mcq",
              prompt: "Which technique best surfaces an off-by-one error in a loop?",
              options: [
                { id: "b2-214-q1-a", label: "Trace table covering each iteration." },
                { id: "b2-214-q1-b", label: "Only re-running the program repeatedly." },
                { id: "b2-214-q1-c", label: "Adding more features to the code." },
              ],
              answer: "b2-214-q1-a",
              rationale: "Trace tables expose iteration-by-iteration variable states.",
            },
            {
              id: "b2-214-q2",
              type: "true-false",
              prompt: "Breakpoints let you pause execution to inspect values mid-run.",
              answer: true,
              rationale: "Breakpoints intentionally halt execution so you can inspect the stack and variables.",
            },
            {
              id: "b2-214-q3",
              type: "mcq",
              prompt: "When do you prefer a breakpoint over print statements?",
              options: [
                {
                  id: "b2-214-q3-a",
                  label: "When you need to inspect variable state inside a complex branch without altering code output.",
                },
                { id: "b2-214-q3-b", label: "When print statements crash the program." },
                { id: "b2-214-q3-c", label: "Prints are always better than breakpoints." },
              ],
              answer: "b2-214-q3-a",
              rationale: "Breakpoints expose state without adding new output to the console.",
            },
          ],
        },
        {
          type: "reflection",
          id: "b2-214-reflection",
          heading: "Reflection",
          prompt: "Which bug did you last fix? Which technique helped you pinpoint it fastest?",
        },
      ],
    },
    {
      id: "B2.1.summary",
      title: "Consolidation Task",
      duration: "50 min",
      description: "Plan and implement a username utility with validation, exceptions, and debugging evidence.",
      segments: [
        {
          type: "content",
          id: "b2-summary-brief",
          heading: "Project Brief",
          body: (
            <ol>
              <li>Ask for first and last names; create a username from the last two letters of the first name and the first three of the last.</li>
              <li>Lower-case the result and validate minimum lengths before slicing.</li>
              <li>Raise exceptions for short names or non-alphabetic characters.</li>
              <li>Capture debug prints or trace-table notes for at least two test cases.</li>
            </ol>
          ),
        },
        {
          type: "activity",
          id: "b2-summary-planner",
          activityType: "planner",
          heading: "Username Utility Planner",
          instructions: "Complete each panel to outline your solution. Save the notes before you move on.",
          panels: [
            { id: "b2-summary-input", label: "Inputs & validation rules" },
            { id: "b2-summary-exceptions", label: "Exceptions to handle and messages to show" },
            { id: "b2-summary-tests", label: "Test cases and expected outputs" },
            { id: "b2-summary-debug", label: "Debugging evidence you will capture" },
          ],
        },
        {
          type: "micro-quiz",
          id: "b2-summary-exit",
          heading: "Exit Ticket",
          questions: [
            {
              id: "b2-summary-q1",
              type: "mcq",
              prompt: "Which step should run first when validating username inputs?",
              options: [
                { id: "b2-summary-q1-a", label: "Slice the names immediately." },
                { id: "b2-summary-q1-b", label: "Check the length and character rules before slicing." },
                { id: "b2-summary-q1-c", label: "Print the username before validation." },
              ],
              answer: "b2-summary-q1-b",
              rationale: "Validate before slicing to avoid runtime errors and produce helpful messages.",
            },
            {
              id: "b2-summary-q2",
              type: "true-false",
              prompt: "Planner notes are only useful for teachers, not students.",
              answer: false,
              rationale: "Planner notes help you implement and debug your own work.",
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
        id: "b2-assessment-q1",
        prompt: "Define variable and data type. Explain why type choice affects what operations are valid.",
        marks: 3,
      },
      {
        id: "b2-assessment-q2",
        prompt:
          "Given short snippets, identify bugs caused by integer versus floating-point division and correct them.",
        marks: 4,
      },
      {
        id: "b2-assessment-q3",
        prompt:
          'For input text "Computer Science is fun", extract "Science", replace "is" with "will be", and output the final string using Python string operations.',
        marks: 5,
      },
      {
        id: "b2-assessment-q4",
        prompt:
          "Describe two distinct exception scenarios and outline appropriate try/catch or try/except blocks with finally for each.",
        marks: 5,
      },
      {
        id: "b2-assessment-q5a",
        prompt: "Complete a trace table for a loop that counts values > 20 and provide the final count.",
        marks: 4,
      },
      {
        id: "b2-assessment-q5b",
        prompt: "Justify when to use breakpoints versus print statements when debugging the same task.",
        marks: 4,
      },
    ],
  },
};

export default b2Unit;
