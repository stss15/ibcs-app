# Unit B1: Computational Thinking – Master Companion

**Standard Level:** 5 hours  **Higher Level:** 5 hours  
**Guiding Question:** *How can we apply a computational solution to a real-world problem?*

---

## Aim of the Unit

To develop the ability to think logically, analyse problems, identify patterns, simplify complexity, and design clear, step-by-step computational solutions.  
By the end, students will:
- Construct precise problem specifications.  
- Apply abstraction, algorithmic design, decomposition, and pattern recognition.  
- Trace and evaluate flowcharts for algorithms.  
- Relate computational thinking (CT) to real-world applications.

---

## Key Vocabulary

| Term | Definition |
|------|-------------|
| **Computational Thinking** | A set of structured problem-solving techniques (abstraction, decomposition, pattern recognition, and algorithmic design) used to express solutions that can be executed computationally. |
| **Problem Specification** | A formal description of a problem that includes the problem statement, stakeholders, constraints, objectives, inputs, outputs, and evaluation criteria. |
| **Stakeholder** | Anyone affected by or influencing the solution (e.g. client, user, developer). |
| **Constraint / Limitation** | A restriction such as time, cost, hardware, legislation, or compatibility. |
| **Objective** | Broad, high-level desired outcome. |
| **Goal** | Measurable, specific target linked to an objective. |
| **Input / Output Specification** | Definitions of the type, format, and characteristics of data entering and leaving the system. |
| **Evaluation Criteria** | Benchmarks for judging solution success (effectiveness, efficiency, usability, maintainability). |
| **Abstraction** | Focusing on essential details while ignoring irrelevant ones to simplify a system. |
| **Decomposition** | Breaking a large or complex problem into smaller sub-problems. |
| **Pattern Recognition** | Identifying similarities or recurring structures to generalise or reuse solutions. |
| **Algorithmic Design** | Creating a logical, step-by-step plan to solve a problem. |
| **Flowchart** | A diagram using standardised symbols (ISO 5807) to represent logical steps and decisions in a process. |
| **Trace Table** | A table showing variable values at each algorithmic step to verify correctness. |

---

## B1.1.1  Constructing a Problem Specification

### Why it Matters
A clear specification ensures the *right* problem is solved efficiently and measurably. It anchors design, evaluation, and communication.

### Components
1. **Problem Statement** – Defines *what* the issue is and *why* it matters.  
   - **Poor example:** “Our customer service is inefficient.” (too vague)  
   - **Good example:** “Customers wait an average of 25 minutes before an agent answers, increasing abandoned calls by 15 % in the last quarter.” (specific, measurable, impact-driven)

2. **Constraints / Limitations** – Define boundaries and available resources.  
   - **Poor example:** “We don’t have many resources.”  
   - **Good example:** “Budget limited to €10 000 with a two-month deadline.”

3. **Objectives & Goals**  
   - **Objective:** Broad intent – “Enhance customer experience.”  
   - **Goal:** Measurable milestone – “Reduce average hold time by 20 % within three months.”

4. **Input Specifications** – Define format, type, and expected data quality.  
   Example: Text fields, 1–5 ratings, timestamps, CSV data.

5. **Output Specifications** – Define format, content, and presentation.  
   Example: Dashboard visualisations, alert messages, downloadable reports.

6. **Evaluation Criteria** – Define how success is measured:  
   - Effectiveness – does it solve the problem?  
   - Efficiency – time/resources used.  
   - Accuracy – correctness of results.  
   - Usability – ease of use and adoption.  
   - Maintainability – ability to update and adapt.

---

### Worked Example – Customer Service Chatbot
| Specification Element | Example |
|------------------------|----------|
| **Problem statement** | Customers abandon 15 % of chats because agents are unavailable. |
| **Constraint** | Budget €10 000; must integrate with CRM. |
| **Objective** | Reduce agent load while improving satisfaction. |
| **Goal** | Achieve 90 % task-completion rate via chatbot within 6 months. |
| **Input** | Text or voice queries; multilingual support. |
| **Output** | Text responses, knowledge-base links, escalation transcript. |
| **Evaluation criteria** | Accuracy of responses, user satisfaction ≥ 4 / 5, 24/7 availability. |

---

### Mini Checkpoints
- **True / False:** Problem specifications should include constraints.  
- **Fill-in:** The three measurable elements are ______, ______, and ______.  
- **Scenario:** Write a concise specification for an app tracking homework.  

### Reflection
How could you define success criteria for your IA or project idea?

---

## B1.1.2  Fundamental Concepts of Computational Thinking

### Why it Matters
Computational thinking is a transferable framework for problem solving in any discipline—breaking down, simplifying, identifying patterns, and formalising logical steps.

### 1  Decomposition
Break complex systems into simpler parts.

**Guiding Questions**
- Can I divide this into natural phases or sequences?  
- Which parts are independent?  
- What repeats?  
- How could I sketch this visually?  
- If explaining to a 5-year-old (“ELI5”), what would I keep?

**Examples**
- **Smartphone decomposition:** battery, processor, camera, OS, sensors.  
- **AI NPC decomposition:** perception → decision → action → movement modules.

---

### 2  Pattern Recognition
Identify repeated behaviours or structures to generalise.

**Questions**
- What repeats or changes predictably?  
- Which relationships are consistent?  

**Examples**
- Number pattern 2, 4, 6, 8 → formula *n + 2*.  
- Machine learning handwriting recognition: detect loops, vertical strokes, pixel clusters.

---

### 3  Abstraction
Filter unnecessary details to reveal essentials.

**Guiding Questions**
- What truly affects outcomes?  
- Which components are essential to function?  
- Can I replace specifics with variables?  

**Worked Example – Car Race**
Essential factors: engine power, driver skill, track type, weather.  
Irrelevant: car colour, driver’s snack.  
Abstraction = focus on performance variables only.

---

### 4  Algorithmic Design
Design clear, finite, unambiguous step-by-step procedures.

**Key Questions**
- What are inputs and outputs?  
- Where are decisions and loops?  
- Can steps be simplified or modularised?  

**Example – Predict Next Even Number**
```
1. Get current number
2. Add 2
3. Output result
```

---

### Mini Checkpoints
- Multiple Choice: Which concept filters irrelevant data?  
- Sequence: Arrange steps of an algorithm.  
- Match: Concept ↔ Example.  
- Short Response: How does decomposition simplify design?

### Reflection
Apply CT to your study routine—how could decomposition help you revise?

---

## B1.1.3  Applying Computational Thinking to Real-World Problems

### Why it Matters
CT is not coding—it’s *thinking systematically*. Professionals use it to design reliable, efficient, ethical systems.

| Domain | Use of CT Concepts |
|---------|--------------------|
| **Software Dev** | Decompose modules (CRM, UI); reuse patterns; abstract objects; design email-scheduler algorithms. |
| **Data Analysis** | Decompose ETL pipeline; recognise seasonal trends; abstract KPIs; design cleaning scripts. |
| **Machine Learning** | Decompose pipeline (data → features → model → deploy); recognise image patterns; abstract features; design training algorithm. |
| **Database Design** | Decompose design stages; recognise common queries; abstract entities; design transaction algorithms. |
| **Network Security** | Decompose risk areas; recognise attack patterns; abstract protocols; design encryption steps. |
| **Healthcare Scheduling Case (Jana)** | Applied abstraction, pattern recognition, decomposition, and algorithmic design to allocate beds and staff efficiently. |

---

### Thinking Skills
Computational thinking encourages adaptability, precision, and ethical reflection.  
**TOK Prompt:** When abstracting, how do you decide what *not* to model, and what ethical impact might that have?

### Mini Checkpoints
- True / False: CT always involves coding.  
- Scenario: Describe how a data analyst applies pattern recognition.  
- Reflection: Which CT skill do you use most naturally?

---

## B1.1.4  Tracing Flowcharts for Programming Algorithms

### Why it Matters
Flowcharts clarify algorithm logic and debugging. They also teach precision and structure.

### Standard Symbols (ISO 5807)

| Symbol | Name | Function |
|---------|------|----------|
| ⭘ | **Start / End** | Begin or end of process |
| ⬒ | **Input / Output** | Data entry or display |
| ▭ | **Process / Operation** | Transformation of data |
| ◇ | **Decision** | True/False branch |
| → | **Flowline** | Direction of logic |
| ⊙ | **Connector** | Join separate parts of a diagram |

---

### Worked Example – Guess-the-Number Game
Randomly pick 1–10 → Input guess → Compare → Repeat until correct → Output “You win”.

**Linear Search Example**
Check each array element sequentially until target found.  

**Trace Table Example**
| Step | A | B | Output |
|------|----|----|--------|
| 1 | 20 | 90 | – |
| 5 | 60 | 50 | End Program |

---

### Practical Exercise
Use Gliffy, Lucidchart, PowerPoint, or Slides to draw a flowchart of your morning routine.  
Ask a partner to interpret it and refine for clarity.

---

### Mini Checkpoints
- Label flowchart symbols.  
- Trace variable changes using test data.  
- Explain how trace tables verify logic.

---

## Consolidation Project
**Design a program to track weekly café sales:**
1. Write a problem specification.  
2. Identify CT concepts used.  
3. Draw a flowchart and trace it.  
4. Suggest evaluation criteria.

---

## End-of-Unit Assessment

**Time:** 45 min **Total:** 25 marks  

| Q | Question | Marks |
|---|-----------|-------|
| 1 | Define *computational thinking* and explain its four core concepts. | 3 |
| 2 | Explain why a clear problem specification is essential before coding, using an example. | 4 |
| 3 | Outline and justify one constraint, one objective, and one evaluation criterion for a mobile banking app. | 4 |
| 4 | Describe how decomposition and pattern recognition work together in machine learning model development. | 6 |
| 5 (a) | Identify the input, process, and output for an algorithm that converts hours and minutes to seconds. | 3 |
| 5 (b) | Draw or describe a flowchart to find the largest of three numbers. | 3 |
| 5 (c) | Explain two benefits of trace tables when testing algorithms. | 2 |
| 5 (d) | Discuss one ethical risk of using computational thinking in AI decision-making. | 2 |
| **Total** |  | **25 marks** |

---

## Linking Questions
- *How is pattern recognition used to identify different types of network traffic?* (A2)  
- *How do CT concepts influence algorithm design?* (B2)

---

## Summary Checklist

✔ Define and justify elements of a problem specification.  
✔ Describe and apply the four CT concepts.  
✔ Explain CT’s use in software, data, AI, and security.  
✔ Construct and trace flowcharts with ISO symbols.  
✔ Evaluate solutions against criteria of effectiveness, efficiency, and ethics.
