How can we apply a computational solution to a
real-world problem?
Computer scientists frame problems by applying computational thinking.
Computational thinking encompasses       a set of problem-solving skills
including abstraction, algorithmic thinking, decomposition and pz
recognition. This way of thinking is very effective for clearly understanding
and solving th      roblems.

Computer science requires careful thinking, careful listening, and careful
understanding. Once
               on you understand your problem, you can start to
solve it.
                             Approaches to computational
                             thinking
    Syllabus understandings
    B1.1.1 Construct a problem specification

    B1.1.2 Describe the fundamental concepts of computational thinking

    B1.1.3 Explain how applying computational thinking to fundamental concepts
    is used to approach and solve problems in computer science

    B1.1.4 Trace flowcharts for a range of programming algorithms


Computational thinking is a framework for thinking about problems and
questions in various disciplines. It is a way of thinking about and examining
problems where solutions can be represented computationally. Computational
thinking helps you analyse how systems with multiple components work
together. At the heart of computational thinking are four key ideas.
*     Abstraction
*      Algorithmic design

*     Decomposition
e     Pattern recognition


B1.1.1 Construct a problem specification
A problem specification consists of the following components.
1.    The problem statement

2.    Constraints and limitations

3.    Objectives and goals

4.    Input specifications

5.    OQutput specifications

6.    Evaluation criteria

The problem statement
A problem statement comprehensively and clearly defines a problem to be
solved. Whenevera computer scientist encounters a problem, they ensure they
understand every single word of the problem before thinking about how to
approach the solution.

Problem statements should be concise and specific, and avoid ambiguity. Itis
helpful when problem statements focus on the “what” and “why” of the problem.

Problems statements often come from a client. However, as is the case with the
internal assessment (IA), you can find any problem you want to solve or an area
of computing you want to explore. No matter where a problem originates, the
problem specification must be clear and concise.



                                                                                  317
      Bl Computational thinking


                                            A poor example of a problem statement
                                            “Our customer service processes are inefficient.”
                                            This statement is far too broad and does not pinpoint the specific problem.
                                            The term “inefficient” could mean many things. For example, long wait times,
                                            lack of knowledge among staff, or poor issue resolution. The problem statement
                                            also lacks a clear “why". Why is inefficiency a significant problem? Does it lead
                                            to customer churn, lost revenue, or damage to the company’s reputation?
                                            A better example ofa problem statement
                                            “Customers wait an average of 25 minutes on hold before reaching a customer
                                            service representative, leading to a 15% increase in abandoned calls over the
                                            past quarter.”
                                            This is a good example because it is focused, measurable, and highlights
                                            impact. It clearly identifies the problem as extended hold times, provides
                                            quantifiable metrics (25-minute wait, 15% increase) and links the problem to a
      A Figure1 Customer waiting time is    negative consequence for the business (abandoned calls).
      specific and measurable
                                           Another good example ofa problem statement might be, “The limited
                                           address space of IPv4 is hindering the expansion of connected devices within
                                           an organization, leading to network scalability issues and potential security
                                           vulnerabilities as workarounds are used.”

                                           Constraints and limitations
                                           A constraint is a restriction or boundary that impacts the solution. This could
                                           include resource limitations (such as time, budget or materials), technical
                                           constraints (such as software or hardware), or external factors (such as regulations
                                           or dependencies with other systems).

                                           As with the problem statement, constraints must be clear and concise.

                                            A poor example of a constraint and limitation
                                            “We don't have many resources to fix our customer service problem.”
                                            This statement is vague and provides no guidance about what specific
                                            limitations exist. “Resources” is too broad: does it refer
                                                                                                     to money, people,
                                            time, technology, or something else? The impact is also unclear. How does this
                                            resource shortage affect the project’s potential solutions?
                                            A better example of a constraint and limitation
                                            “The project budget is limited to $10,000, and you cannot exceed this amount
                                            due to funding restrictions.”
                                            This is a strong constraint because it is specific, measurable, and states a clear
                                            limitation. It clearly states the budget is the resource constraint, it provides an
                                            exact dollar figure, and it states that exceeding this budgeted amount is not
      A Figure 2 A budget states a clear    an option.
      limitation
                                           Objectives and goals
                                           Outline the desired cutcomes you want to achieve with the solution and
                                           differentiate between high-level objectives and specific goals.

                                           High-level objectives represent the broad desired results you want to produce
                                           in a particular area of the customer service system. They are directional and
                                           aspirational. Specific goals are quantifiable targets that act as milestones toward
                                           achieving the high-level objective: they must be directly linked to the high-level
                                           objectives. Specific goals are directly measurable and usually time-constrained.

318
                                                                                        B1.1 Approaches to computational thinking



 Worked example 1                                                Worked example 2
 A business wants to reduce waiting times for customers          The business in Worked example 1 also wants to
 contacting it. Write an objective and goals for                 improve customer satisfaction. Write an objective and
 the business.                                                   goals for it.

 Solution                                                        Solution
 A high-level objective might be to “enhance the overall         A high-level objective could be to “increase customer
 customer experience by minimizing wait times for support.”      satisfaction with service interactions.”
 The specific goals must be directly linked to the objective.    The specific goals would be to achieve an average
 These might include decreasing average phone hold time          customer satisfaction rating of 4 out of 5 stars on post-
 by 20% within the next quarter and reducing average             service surveys over the next six months and reduce
 response time to email enquiries to under 12 hours within       the number of “highly dissatisfied” customer ratings
 the next two months. The goals are measurable and time-         by 30% within the next quarter. Both of these are time-
 constrained, so the business can check if it is meeting         constrained, quantifiable and measurable.
 the goals.




A Figure 3 Specific goals are measurable and time-constrained


Input specifications
In the specification, describe the format, type and expected characteristics of the
data or information fed into the solution. This ensures compatibility and proper
processing.



 Worked example 3
  Describe the format, type and characteristics of a customer feedback system.

 Solution
 The input data is customer feedback, both qualitative and quantitative.
 The formats might be open-ended text comments (from surveys, emails, social
 media), numerical ratings (1-5 stars, satisfaction scales), and net promoter
 score (NPS) responses. NPS rates the likelihood that a customer would
  recommend a company, product or service to a friend or colleague.

 The expected characteristics of the input would include feedback directly
 related to specific interactions or aspects of the customer service experience,
 feedback collected as close to the service experience as possible, and,
 if possible, the ability to link feedback to a specific customer and their
 interaction history.
                                                                                       A Figure 4 Customer satisfaction scale

                                                                                                                                    319
      Bl Computational thinking



                                            Worked example 4
                                            The company has decided to create a chatbot which accepts customer
                                            enquiries and requests in natural language format. State the formats and
                                            expected characteristics of the input.

  0                                         Solution
                                            The formats would be text-based input via a chat interface and, if the chatbot
       Search online for news stories       supports voice interaction, voice-to-text input.
       about businesses local to you.       Ideally, input would be clear, concise and unambiguous. Of course, this is not
       Write an objective and specific      the case in the real world, but this should be your goal. In addition, the bot
       goals for the business to address    should be trained on a data set of frequently asked questions and common
       the issue discussed in the news      customer needs. Finally, the bot would have a wide variety of answers to
       story. Use these worked examples     handle diverse phrasing and ways of expressing the same intent (for example,
       to guide you.                        “| have a problem with my bill” may need the same answer as “My invoice
                                            seemswrong”).
                                            Remember that having detailed input specifications helps your solution
                                            design and determines the type of data processing, storage and analysis
                                            the solution requires. Good input specification also guides the collection of
                                            feedback or enquiries to ensure they are useful and support the solution’s
                                            goals. Finally, you can help ensure compatibility, and ensure the solution can
                                            handle real-world data from your customer base.


                                           Output specifications
                                           Define the format, content and presentation of the results generated by the
                                           solution. Be clear about how the solution will deliver the desired outcome.

                                           Example: Customer feedback system

                                           Output formats might include dashboards with visualizations (charts, graphs)
                                           highlighting trends in customer satisfaction ratings, wait times, and so on.
                                           There might also be detailed reports summarizing qualitative feedback and
                                           common themes. Finally, alerts for individual cases of highly negative feedback
                                           requiring immediate follow-up might be part of the output.




                                           A Figure 5 Inputand output




320
                                                                                         B1.1 Approaches to computational thinking


The key metrics would probably include average satisfaction scores, NPS,
wait times, volume of feedback by channel, changes in key metrics over time
(week-over-week, month-over-month) and categorization of qualitative feedback
such as common issues, praise or areas for improvement.

The presentation would need to have a clear, user-friendly interface suitable
for customer service managers and team members and customizable reports
allowing for filtering by date range, channel or topic.

Example: Customer service chatbot

Output formats might include direct responses to customer enquiries in text
format, knowledge base articles or frequently asked questions (FAQs) linked
to relevant topics and escalation to a live agent with a transcript of the chatbot
interaction for seamless transfer.

Content probably includes accurate answers to common questions, step-by-step
guidance for resolving simple issues, and the ability to recognize when a query
is beyond its capabilities and redirect appropriately. The bot must appear
friendly and use natural-sounding language, with an option to display timestamps
for clarity.

Output specifications help ensure there is a high degree of clarity. They ensure
the solution produces results aligned with the desired outcomes for improved
customer service. Outcomes also help define what metrics and presentations you
need to be able to track if the solution is effective. Finally, outcome specifications
guide how the solution will interact with customer service staff.


Evaluation criteria
Define the benchmarks you will use to measure the success of the solution.
Consider factors such as effectiveness, efficiency, accuracy, usability and
maintainability.

Example: Customer feedback system

One of the first and best questions to ask when evaluating a solution is: how
effective is it? In other words, does the solution solve the problem you set out to
solve or answer the question you asked?

In this example, you would look for improved customer satisfaction scores,
positive movement in average ratings, and/or NPS over time. You would also
want to measure reduced negative feedback and measurable decrease in the
volume of highly dissatisfied customers. Finally, the feedback system would start
to identify trends and customer pain points (things that frustrate customers in the
sales process), which would lead to targeted improvements.




                                                                                                                                     321
      Bl Computational thinking


                                  In terms of efficiency, you would look at time savings and reduced time spent
                                  manually gathering and analysing feedback. Faster issue identification might
                                  include proactive flagging ofcritical customer concerns, allowing them to be
                                  resolved sooner.

                                  Usability would measure user adoption, meaning that customer service staff
                                  find the dashboards and reports easy to use and integrate into their workflow.
                                  The interface should be intuitive, meaning that users require minimal training to
                                  navigate and extract meaningful insights.

                                  In terms of maintainability, the adaptability of the system can be adjusted to
                                  accommodate new feedback channels or changing customer needs, and the
                                  system reliably safequards feedback data.

                                  Example: Customer service chatbot

                                  To measure effectiveness, you should look at the task completion rate, which
                                  is the percentage of enquiries successfully resolved by the chatbot without
                                  needing human escalation. The customer satisfaction with chatbot interactions
                                  should also be evaluated by analysing positive ratings on post-chat surveys.
                                  Business users of the system would hope to have reduced strain on live agents
                                  and a measurable decrease in the volume of simple, repetitive enquiries
                                  handled by human staff.

                                  The system should have 24/7 availability and the ability to provide support
                                  outside of regular business hours. You would also expect faster resolution times,
                                  so the average time taken to solve basic issues is shorter with the chatbot than
                                  through traditional channels.

                                  Correctness of responses (accuracy) is important. You need to measure
                                  whether the chatbot provides factually accurate information and guidance.
                                  Customers will experience this as a question at the end of the query, asking if
                                  the chat (with the bot) has resolved their issue. Businesses also need to ensure
                                  that their chatbot understands customer intent and can correctly interpret
                                  different phrasings of the same request.

                                  Finally, you would want to evaluate usability. Does the chatbot have a
                                  simple interface, clear prompts, and an intuitive flow that make it easy for
                                  customers to use?

                                  A prablem specification may include a problem statement, constraints and
                                  limitations, objectives and goals, input specifications, output specifications and
                                  evaluation criteria. All of these are of vital importance if you want to solve the
                                  right problem the right way. It does take some extra time to create a problem
                                  specification, but the result is a much clearer solution to a well-understood
                                  problem or question.




322
                                                                                    B1.1 Approaches to computational thinking



|ana is a software engineer ata large hospital. She was asked to help manage a hospital unit with limited staff,
beds, and specialized equipment. She needed to schedule these resources to accommodate incoming
patients while maximizing efficiency and minimizing conflicts.

She started with abstraction, and identified core elements of the problem: staff (doctors, nurses, technicians with
specific skills), equipment (operating rooms, specialized machines, and so on) and beds (general ward, ICU, and
soon).

Atfirst, she simplified the problem and ignored factors such as staff breaks or equipment maintenance schedules
and she assumed all patients had equal priority.

                                               “




A Figure 6 Scheduling software helps hospitals to use resources efficiently

She then started to apply pattern recognition to this problem. She analysed historical data, looking at past
records for peak times for certain types of patient cases (more trauma at night, elective surgeries in the morning).
She also investigated patterns in the length of stay for different conditions. She analysed incoming patient data
and realised incoming patient scheduling was based on urgency and resource needs. She also recognized a
potential conflict when two patients needed the same specialized machine simultaneously.

|ana started to decompose the problem. She looked for subproblems where she could break down the large
scheduling problem. She saw three subproblems.
1.    Staff scheduling: match staff skill sets to predicted patient needs.

2.    Equipment scheduling: align equipment availability with surgical procedures or treatment schedules.
3.    Bed allocation: prioritize ICU beds for critical cases, track the expected discharge timeline for other patients.

Next, Jana started to consider how to solve this problem. She applied algorithmic design to the problem.
She considered heuristic algorithms, which provide quick, “good enough” solutions. Her heuristic algorithm
could assign staff based on availability and basic skill fit, then adjust as needed. She also considered optimization
algorithms where she could search for the mathematically best solution. This is more computationally demanding
but would provide a more stable and predictable schedule.

AsJana considered the possible algorithm to use, she realized she needed to consider the following.

1.    Prioritization: how do you weigh urgency, resource scarcity and potential conflicts?
      Flexibility: how does the algorithm adapt to unexpected events (ambulance arrival, equipment malfunction)?
Eal




      Evaluation: how do you measure the “success” of the schedule (efficiency, patient wait times, resource utilization)?
 L




      Risk: the cost of poor scheduling may result in harm to a human being. What is the correct ethical approach
      to use when developing a solution for the hospital?
This process of computational thinking led to a high-quality effective solution for the hospital and the patients.

                                                                                                                                323
      Bl Computational thinking


                                             B1.1.2 Describe the fundamental concepts
                                             of computational thinking
                                             Decomposition
                                             Decomposition involves breaking down complex problems into smaller, manageable
                                             components. This makes problem-solving easier by focusing on individual pieces.
                                             The single responsibility principle (SRP) aids this process by ensuring each component
                                             has a single, clear task. While there is no universal algorithm for decomposition, asking
                                             key questions can help identify the fundamental parts ofa problem.

                                             Can I divide this problem into smaller, more manageable steps? Are there
       The single responsibility principle   natural phases or sequences to follow?
       was first used in the context of
       object-oriented programming           Are there any repeated patterns or elements | can group together?
       (OOP), which you will learn about     Identifying repetitive processes often reveals opportunities for modularization.
       in topic B3.
                                             Which parts of the problem are independent of each other? Does the order
                                             of solving some parts matter or can they be solved in isolation?

                                             What does a picture of the problem look like? Can | sketch diagrams or mind
                                             maps to visually represent the problem and its parts?

                                             If you had to explain this problem to a 5-year-old child, how would you
                                             doit? This is colloquially known as “Explain like I'm five” (ELI5) and forces you to
                                             simplify the problem and focus on the essentials.

                                             Decomposing a bicycle
                                             Using the five questions above, how would you decompose a bicycle?
                                             1.   Frame                                    6.   Seating
                                             2.   Drivetrain                               7.   Mechanisms for changing gears
                                             3.   Wheels                                   8.   Suspension
                                             4.   Steering and control                     9.   Lightsand reflectors
                                             5.   Brakes                                   10. Fenders

                                             Decomposing a smartphone
                                             You can decompose a smartphone into constituent parts. (This is not an
                                             exhaustive list.)
                                                  Touchscreen                              9.   Ports (for example, USB,
                                             2.   Display panel                                 headphone jack)
                                             3.   Battery pack                             10. Frontcamera

                                             4.   Charging circuit                         11. Rear camera


                                             6.   RAM                                      13. Accelerometer

                                             7.   Storage (for example, internal           14. Gyroscope
                                                  storage, microSD card)                   15. Proximity sensor
                                             8.   Buttons (for example, volume,            16. Ambient light sensor

                                                  power)                                   17. Operating system and software

                                             By breaking down the smartphone into these fundamental components, you can
                                             better understand and manage its complexity.
324
                                                                                         B1.1 Approaches to computational thinking


Decomposing Al behaviour
Imagine you want to design a non-playing character (NPC) that behaves
realistically within a video game environment. How might you decompose this
problem? You would start by thinking about the basic actions an NPC needs
to complete.

Table 1 A method to decompose NPC actions

 Component            Example
 Sensing              Equip the NPC with the ability to perceive the player and the surroundings (sight, hearing).
 Decision-making     Implementa system for the NPC to evaluate situations and pick actions (for example, a behaviour tree or
                     a finite state machine).
 Actions              Develop a set of actions the NPC can take (patrolling, attacking, fleeing, hiding).
 Pathfinding          Ensure the NPC can navigate the environment to reach its goals.


Table 2 Alternative method to decompose NPC actions

 Component

 Motivation            Goals Determine high-level goals or needs            Personality Establish traits that influence
                       motivating the NPC's behaviour (for example,         decision-making (for example, aggressive,
                       survival, resource gathering, territory defence).    cautious, curious).
 Perception            Sensory input Define types of stimuli the NPC        Filtering Process raw sensory data to focus on
                       reacts to (visual, auditory, proximity).             relevant details (for example, recognizing threats,
                                                                            identifying valuable objects).
 Decision-making       Behaviour library Create a modular set of            Evaluation module Develop a system (for
                       potential behaviours the NPC can choose from         example, utility-based Al, rule-based system)
                       (for example, investigate, pursue, attack,           to evaluate behaviours based on motivation,
                       retreat, hide).                                      personality and perceived information, and select
                                                                            the most appropriate action.
 Action execution      Animation control Tie specific behaviours to         Movement control Use pathfinding and
                       corresponding animations (for example, play          movement systems to execute chosen actions,
                       a "flee” animation when the retreat behaviour        ensuring the NPC's actions are physically
                       is chosen).                                          possible in the world.

Pattern recognition
Pattern recognition is the ability to identify recurring similarities, trends or
regularities within data, problems or solutions. Pattern recognition helps you to
solve problems by identifying similar subproblems to solve. Solutions to similar
subproblems can then be generalized or adapted, avoiding the need to reinvent
solutions for each variation.

As with decomposition, there is no single foolproof algorithm to identify patterns.
However, there are some questions you can ask yourself as you search for patterns

What elements or components make up the system? Are there specific parts
that interact in predictable ways?

Are there repeated actions, processes or structures? Do things happenin
the same way or a similar way over time?

How do things change within the system? Are there specific transformations,
increases, decreases ortransitions that happen regularly?
                                                                                                                                     325
      Bl Computational thinking



                                       Worked example 5
                                       Predict the next number in this sequence: 2, 4, 6, 8.

                                       Solution
                                       Applying pattern recognition, you will recognize that each number is 2 greater
                                       than the previous one. This is an increasing pattern with a constant difference.
                                       A computational solution is to represent this pattern with a simple formula:
                                       next_number = current_number + 2

                                       This pattern represents the concept of arithmetic progression, allowing you
                                       to generalize the solution to predict future numbers in any sequence with this
                                       constant difference. No matter how large this sequence becomes, you can
                                       find the next number.



                                       Worked example 6
                                       Build a system that can recognize handwritten digits (0-9) from images.

                                       Solution


       AL3YS
                                       Start by considering pattern recognition. Each image can be represented as
                                       a grid of pixels, where each pixel has a brightness value (grayscale). These
                                       pixels become the raw features your solution needs to look for.



       51870
                                       Then, look for the characteristic shapes and patterns of each digit. For
                                       example, “0” is often an oval shape, “1” is typicallya vertical line, and “8" has
                                       two connected loops.
      A Figure 7 Handwritten digits    Develop a computational solution to look for these patterns. For example, any
                                       pattern which has a loop or oval is likely tobea 0, 6, 8 or 9.


                                      Abstraction
                                      Abstraction is the process of filtering out unnecessary details to focus on the
                                      essential elements or properties ofa problem or system, representing them
                                      with a simplified model. Abstraction allows you to ignore distractions and create
                                      generalized solutions that can apply to other similar problems.

                                      The challenge with abstraction is deciding what is necessary and what is
                                      unnecessary. Focus on the essential parts of the system. For example, the colour
                                      of a car is not essential but the type of engine is.

                                      Ask yourself these questions as you abstract a problem:

                                      What is the core purpose of the system? What is the ultimate problem it is
                                      trying to solve, or what main outcome does it produce?

                                      What are the essential inputs and outputs? \What minimum information does
                                      the system need to start, and what does it generate at the end?

                                      Which parts of the system are truly necessary? If | remove a component,
                                      does the system still achieve its core purpose, or does it break down?

                                      Can | simplify how components interact? Can | replace multiple steps or
                                      components with a single, higher-level concept?




326
                                                                                   B1.1 Approaches to computational thinking


Are there common functions performed by different parts? Can | group
parts by what they do, regardless of their specific details?

Could I replace specific details with variables? Instead of focusing on
concrete values, can | think of elements in terms of placeholders?


 Worked example 7
 Make a program to predict the outcome ofa football match between your
 two favourite teams.

 Solution
 To create an abstraction of two football teams, ask yourself what are
 the essential parts of the teams that are likely to impact who may win.
 Consider, for example, the following.

 Will the colour of a player’s shoelaces matter? No. We can be confident
 that this will not affect the result.

 Will a recent injury impact the game? Probably, but it will depend on
 the severity of the injury, how many players are injured, and their position(s)
 on the team.

 Will the team’s past record impact the game? Probably. If team
 Ahas beaten team B 127 times in the last 128 games, they are likely to feel
 very confident.
 Will the age of the players matter? This is harder to say: older players have
 maturity and experience but younger players are usually faster and more agile.
 On balance, this may not be as important to the outcome.
 So, an abstraction could be: “the chance of winning depends on
 (serious injuries) — (past record of wins).”

This is a simplification ofa complex system. That is the essence of abstraction.


 Worked example 8
 Create an abstraction to predict the winner of a car race.

 Solution
 Work out what are the essential factors that will impact the outcome.

 Will the colour of the car matter? Probably not.
 Will the engine horsepower, tyre condition and aerodynamics of the
 car matter? Yes, absolutely.

 Will the driver’s favourite snack matter? Unlikely.

 Will the driver’s experience, reaction times and ability to handle the car
 under pressure impact the race? VYes, definitely.

 Will the shape of the clouds matter? No, but the weather conditions are
 likely to be a factor.

 Will the track layout (sharp turns versus long straights) and track
 surface impact the race? Yes, certainly.
 Will unexpected things like mechanical failures or pit crew errors
 dramatically change the race? Yes, of course.


                                                                                                                               327
      Bl Computational thinking



                                           e Your abstracted model might focus on these essential factors.
                                                Car performance on a scale from 1to 10. Assign a composite score based
                                                on things like engine power, aerodynamics and tyre wear.
                                                Driver skill on a scale from 1 to 10. Assign a rating based on the driver's past
                                                record, qualifying times, and any known strengths or weaknesses.

                                                Track suitability on a scale from 1 to 10. Assign a value based on how well
                                                the strengths of the car and driver match the demands of the specific course.
                                                A powerful car might excel on a track with long straights, while a skilled driver
                                                might have a greater advantage on a technical track.
                                                Model mechanical failures. Assign a chance there is a mechanical failure
                                                for each component of the car. The brakes might have 50% chance of
                                                failure, a tyre might have a /5% chance offailure, and the engine might
                                                have a 10% chance of failure.
                                                Remember that abstractions are simplifications. This model gives you a
                                                starting point for focusing on the elements most likely to determine the race
                                                winner. A real prediction model would be much more complex.


                                              Algorithmic design
                                              An algorithm is step-by-step instruction to solve a problem or achieve a desired
                                              outcome. Algorithms provide a logical and unambiguous roadmap fora
                                              computer (or human) to follow. Algorithms must be clear, precise and efficient.

                                              In this part of computational thinking, you need to design an algorithm. This can
                                              bein code, butit does not have to be. Many programmers use flowcharts to
                                              help them think through how the system functions. You will learn more about
       Flowcharts Diagrams which              flowcharts in the next section.
       logically and unambiguously
       represent the process (flow) of a      There are some questions you should ask yourself
                                                                                             as you design an algorithm.
       program or system.
                                              What is the exact problem | am trying to solve? Can | state it clearly
                                              and concisely?

                                              What are the inputs? What kind of data will my algorithm need to process?

                                              What are the expected outputs? What should my algorithm produce, and in
                                              what format?

                                              Are there any decision points in the algorithm?

                                              Are there any places where there is a loop (or iteration)?

                                              Can | break the problem into smaller, more manageable steps? Is there a
                                              natural sequence | can divide the process into?

                                              The last question is especially helpful. Can you explain to a friend (who has
                                              limited knowledge of your solution) the step-by-step process of how your
                                              solution will function? This often helps you find missing bits of your algorithm.

                                              You can look at the number pattern from Worked example 5 in a different way.




328
                                                                                   B1.1 Approaches to computational thinking



 Worked example 9
 Predict the next number in this sequence: 2, 4, 6, 8.

 Solution
 An algorithmic design might be as follows.

 1.   Get current number

 2.   Add 2 to current number

 3.   Output the new number                                    Get number

 Or perhaps like this.                                               v

 1.   Getthe current and assign it to a variable named          Add two to
      NUMBER
                                                               that number
 2.   Add 2 to the variable NUMBER, and store the
      answer in a variable NEXT_NUMBER                               Y
 3.   Output NEXT_NUMBER                                       Output new
                                                                 number
 Or, using a flowchart, it might look like this.



@ Thinking skills
 Computational thinking teaches you to identify the core elements ofa
 problem and understand their relationships. Focusing on essential features
 while filtering out extraneous detail fosters creative solutions. Computational
 thinking encourages you to identify the underlying patterns and principles
 behind a problem. The process of designing step-by-step solution
 procedures reinforces a structured approach to problem-solving. This
 logical, systematic way of thinking can be transferred to other disciplines,
 allowing you to adapt your approach based on the nature of the problem.
 For example, imagine you have multiple subjects to study for an upcoming
 exam, but you are unsure how to allocate your time effectively.
 Applying computational thinking:

 1.   Identify core elements List the subjects you need to study, the topics
      within each subject, and the available time before the exam.

 2. Filter out extraneous detail Focus on the most challenging topics or
    those with the most weight in the exam, ignoring minor topics that you
    are already confident in.

 3. Identify patterns Notice if certain subjects or topics are interrelated
    (for example, maths principles that apply to physics).

 4. Design step-by-step solution Create a daily study plan that allocates
    specific time slots to each subject based on priority. Include breaks and
      review sessions.

 5. Adapt approach If you find one topic more difficult than anticipated,
    adjust your schedule to spend more time on it, shifting easier topics
    to later.

 How can you apply computational thinking to a problem in your life?



                                                                                                                               329
      Bl Computational thinking


                                              B1.1.3 Explain how applying computational
                                              thinking to fundamental concepts is used to
                                              approach and solve problems in computer
                                              science
                                              Computational thinking is a framework for thinking about problems.
                                              Using abstraction, algorithmic design, decomposition and pattern recognition,
                                              computer scientists can frame problems in such a way that they are computationally
                                              solvable. The habit and practice of computational thinking lends itself
                                                                                                                    to becoming
                                              an excellent problem solver.


                                              Software development
                                              When creating a large-scale customer relationship management (CRM) system,
                                              the project is decomposed into several modules such as lead tracking,
                                              customer management, and communication tools. Developers identify common
                                              software bugs and document these patterns to speed up debugging in future
       You will learn about object-oriented   projects. They then use object-oriented programming (OOP) to abstract
       programming in more detail in          complex operations into objects with methods that can be reused across the
       topic B3.                              system without repeating code. Algorithmic design includes implementing
                                              functionality for automatic email scheduling, defining the precise steps and
                                              conditions under which emails should be sent to different user segments.


                                              Data analysis
                                              During decomposition, a data analyst breaks down the process of analysing
                                              large sales data sets into specific tasks like data cleaning, normalization and
                                              analysis. In pattern recognition, the analyst looks at trends in seasonal sales data
                                              to predict future demands and optimize stock levels. Abstraction focuses on key
                                              performance indicators (KPls) like monthly sales growth and customer acquisition
                                              cost, while filtering out less relevant data. Finally, in algorithmic design the
                                              analyst will create a data processing pipeline using scripts that systematically
                                              extract, transform and load data (ETL process).


                                              Machine learning
                                              Decomposition involves dividing a machine learning project into data
                                              collection, feature extraction, model training, evaluation and deployment phases.
                                              Pattern recognition includes identifying features in image data that are most
                                              relevant for classifying images into different categories using convolutional neural
                                              networks. Abstraction would represent complex data through a set of features
                                              and labels that serve as the input and output of machine learning models. Finally,
                                              algorithmic design would include designing a neural network architecture,
                                              specifying the number of layers, activation functions, and optimization
                                              algorithms.

                                              Database design
                                              Decomposition structures the database design process into conceptual
                                              design, logical design and physical design stages. Pattern recognition notices




330
                                                                                         B1.1 Approaches to computational thinking


common queries and structures the database schema to optimize these queries
by indexing or denormalization. Abstraction defines tables and relationships in
a way that represents real-world entities while ignoring irrelevant details. Finally,
algorithmic design develops algorithms      for efficient querying, updating and
maintaining database integrity through transaction processes.


Network security
Decomposition analyses network security challenges by categorizing them
into physical security, network infrastructure and application security. Pattern
recognition identifies typical attack patterns like distributed denial of service
(DDoS) or phishing to enhance predictive threat detection. Abstraction
uses generic security models and protocols that provide a framework for
implementing specific security measures without detailing the underlying
complexities. Algorithmic design creates encryption algorithms and protocols
like SSL and TLS to securely encrypt communications over the network.


B1.1.4 Trace flowcharts for a range of
programming algorithms
Flowcharts are used to depict processes, decisions, and flows of control.
Generally, flowcharts flow from top to bottom and left to right.
Table 3 Standard flowchart symbols. Symbols are approved and standardized by
the International Organization for Standardization (ISO) in ISO 5807


 Symbol name               Symbol                 Symbol definition and notes
                                                  If you have a complicated flowchart, you can use an on-page connector,
                                                  which connects a part of flowchart without the need for drawing lines.
 Connector
                                    O             This forms a shortcut between parts of the diagram shown on different parts
                                                  ofthe page.
                                                  This symbol indicates a decision with only two possible answers.
 Decisi                                           There should be a question in the symbol, which states which one of
  ecision                                         two paths a program will take. The question should only be a yes/no
                                                  question or a true/false test.
 Flowline                    _                    Shows the process’s order of operation.
                                                   Represents a process of inputting and outputting data.
 Input/Qutput

                                                   Represents a set of operations that changes
                                                                                            the value, form or location of
 Process/Operation                                data.

                                                   Indicates the beginning and ending ofa program or sub-process.
 Start/End
 (or Terminal)




                                                                                                                                     331
      Bl Computational thinking


                                                                                        Guess the secret
                                                                                         number game

                                                                                                Start



                                                                                                 Y
                                                                                  Randomly choose a secret
                                                                                   number from 1to 10 and
                                                                                   save it in variable named
                                                                                      SECRET_NUMBER



                                                                                                 Y
                                                                                           Get guess      ;
          Should | play video
                                                                                            from user
               games?




                                                                                      Is user guess equal           No           Qutput
                   Do                                                                 SECRET_NUMBER?                          Wrong guess,
                 | have                                                                                                       try again...”
                                   Yes       Do not pla
              homework?                            P2y


                                                   X                                            Yes
                   No
                                                 End
                Play for                                                                    Output
                awhile                                                                     “You win!”



                    Y                                                                            Y

                  End                                                                           End


      A Figure 8 A simple example ofa flowchart. It is helpful to label        A Figure 9 A flowchart fora "guess the number” game.
      the flowlines from a decision process. Note that the decision            In this game, the player continues to guess until they get the
      process has only two possible states (outcomes)                          correct answer



                                                        A flowchart can represent the logical process ofa computer program. This can
       You will learn more about linear
                                                        help you trace (or follow) the process. A linear search sequentially checks every
       searches in section B2.4.2.
                                                        element in an array, starting at the beginning and warking through to the end
                                                        of the array.




332
                                                                                  B1.1 Approaches to computational thinking



                                                            Linear search       array =[2,4,6,8,10,12... 100]
                                                             @                     TARGET_VALUE = 42


                                                                 Y

                                                       set CURRENT_INDEX = O}




                                                                does                       Output “Found
                                           No          array(CURRENT_INDEX) =    Yes      target number at
                                                           TARGET_VALUE?                CURRENT_INDEX."


                                                                 No


                                       Are we at             Increment
                  OQutput
    End         “Not found1”/ € Y&    endofamay?   =      CURREEJT] INDEX
                                                                 /


A Figure 10 Alinear search


 Worked example 10
 How many iterations are needed for this program to end?




            ‘    setA=10       |
                 set
                  B =100




                       No


                 B=B-10
                 A=A+10



 Solution
 After1 iteration:     A=20,B=90
 After 2 iterations: A=30,B =80
 After 3 iterations:    A=40,B=7/0
 After
     4 iterations:      A=50, B =60
 After 5 iterations: A= 60, B = 50; program ends




                                                                                                                              333
Bl Computational thinking



 TOK                                   Practice questions

 Computational thinking is a           1.   Construct a problem statement fora software system designed
 powerful, effective way to                 to manage patient scheduling in a hospital.                              [4 marks]
 understand and solve problems.        2.   Describe constraints and limitations for a mobile banking application,
 But a reliance on computational            considering security, user interface and network reliability.      [4 marks]
 thinking is often criticized for
                                       3.   List a set of input specifications for an online customer feedback
 encouraging computer scientists
                                            system. Include the types of data the system should collect and
 to think about all the possible
                                            the expected data formats.                                              [4 marks]
 problems they can solve without
 putting enough thought into the       4.   Construct a set of objectives and goals for a web-based
 ethical, environmental and social          e-commerce platform, differentiating between high-level
 implications of the technology             objectives and specific measurable goals.                                [4 marks]
 they are creating.
                                       5.   Construct evaluation criteria to assess the effectiveness and
 When you abstract a problem, how           efficiency of
                                                        an Al-based chatbot used for customer service,
 do you decide what to keep and             ensuring that both user satisfaction and task completion
 what to ignore?                            rates are considered.                                                   [4 marks]

 What are the implications for a
 solution if pattern recognition     @ Self-management skills
 cannot account for important
 “edge cases”?                         Learning to use software to draw flowcharts neatly and accurately is
                                       important. This practical task helps solidify your understanding of flowchart
 Can algorithms be biased?             symbols and your uses in depicting algorithmic processes.
                                       1.   lLookfor some flowcharts online and try to follow the logical flow.

                                       2.   Use the internet to investigate software that helps you create and trace
                                            flowcharts. Gliffy is one option that is easy to use and web-based. There
                                            are others, including Lucidchart and Microsoft Visio. You can also find the
                                            shapes in Google Slides and Microsoft PowerPoint.
                                       If you do not have regular access to a computer, practice drawing the shapes.
                                       You can buy stencils to help you if you are not good at drawing.
                                       3.   Constructa flowchart  to illustrate a process. This could be of your
                                            morning routine, or making a cup of tea, or something else. Include as
                                            many details as possible.
                                       4.   Aska friend to explain your flowchart. Listen carefully for misunderstandings
                                            or errors.
                                       5.   Briefly reflect on how easy or difficult you find flowcharts. If any errors or
                                            misunderstandings were spotted in part 4, make a plan to address them.




                                     @ Linking questions

                                       1.   How is pattern recognition used to identify different types of traffic
                                            flowing across a network (A2)7?

                                       2.   How are the concepts of computational thinking used in code when
                                            designing algorithms (B2)?
                                                                                          End-of-topic questions




End-of-topic questions
Topicreview
1.   Using your knowledge from this topic, B, answer the guiding question
     as fully as possible:
     How can we apply a computational solution to a real-world problem?       [6 marks]


Exam-style questions
2.   Describe what a problem statement is and why it is critical in the problem
     specification process.                                                   [2 marks]

3.   Explain the difference between a poor and a strong problem statement,
     giving examples of each.                                              [4 marks]

4.   a.   Define the role of constraints and limitations in a problem
          specification.                                                       [1 mark]

     b.   Outline an example ofa well-defined constraint.                    [2 marks]

5.   a.   Define:

          i.   high-level objectives

          ii. specific goals.                                                [2 marks]

     b.   Compare high-level objectives and specific goals in the context of
          computational problem-solving.                                     [3 marks]

6.   Discussthe role of input and output specifications in ensuring the effectiveness
     ofa computational solution.                                              [3 marks]

7.   a.   Describe the process of decomposition in computational thinking.    [2 marks]

     b.   Explain how decomposition can be applied to solve a
          real-life problem.                                                 [2 marks]

8.   a.   Describe the concept of pattern recognition.                       [2 marks]

     b.   Explain the importance of pattern recognition in computational
          thinking, using a relevant example.                                [2 marks]

9.   a.   Describe how abstraction simplifies problem-solving in
          computational thinking.                                            [2 marks]

     b.   Explain how abstraction can be applied to solve a
          real-life problem.                                                 [2 marks]

10. Describe the process of algorithmic design, including the steps
     typically followed in creating an algorithm.                            [4 marks]

11. Explain how the four fundamental concepts of computational thinking
     (abstraction, algorithmic design, decomposition and pattern recognition)
     work together to solve problems in computer science.                  [4 marks]




                                                                                                                   335
