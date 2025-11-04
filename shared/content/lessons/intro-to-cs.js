const IntroToCSLesson = {
  id: "lesson_cs_intro_001",
  title: "Introduction to Computer Science",
  yearGroup: 7,
  duration: 50,
  objectives: [
    "Understand what computer science is",
    "Identify the key components of a computer system",
    "Recognize the difference between hardware and software",
    "Apply computational thinking to solve a simple problem",
  ],
  slides: [
    {
      id: "slide_001",
      type: "content",
      index: 0,
      content: {
        layout: "centered",
        blocks: [
          {
            type: "heading",
            level: 1,
            text: "Welcome to Computer Science! 🚀",
          },
          {
            type: "interactive",
            component: "ThinkPairShare",
            prompt: "What do you think computer science is?",
            duration: 120,
          },
        ],
      },
      teacherNotes: "Start with engagement. Let students discuss in pairs for 2 minutes.",
      minimumViewTime: 30,
    },
    {
      id: "slide_002",
      type: "content",
      index: 1,
      content: {
        layout: "split",
        blocks: [
          {
            type: "objectives",
            objectives: [
              "Computer Science is the study of computation",
              "It focuses on problem solving with algorithms",
              "We build digital solutions to real problems",
            ],
          },
          {
            type: "paragraph",
            text: "Tap each pillar to reveal examples.",
          },
        ],
      },
      teacherNotes: "Click each pillar to reveal. Emphasize problem-solving aspect.",
    },
    {
      id: "slide_003",
      type: "interactive",
      index: 2,
      content: {
        layout: "full",
        blocks: [
          {
            type: "sortingActivity",
            title: "Hardware or Software?",
            instruction: "Drag each item to the correct category",
            items: [
              { id: "mouse", label: "Mouse", correct: "hardware" },
              { id: "windows", label: "Windows 11", correct: "software" },
              { id: "ram", label: "RAM Memory", correct: "hardware" },
              { id: "chrome", label: "Google Chrome", correct: "software" },
              { id: "keyboard", label: "Keyboard", correct: "hardware" },
              { id: "python", label: "Python", correct: "software" },
            ],
            categories: ["hardware", "software"],
            feedback: {
              correct: "🎉 Excellent! You understand the difference!",
              incorrect: "Not quite. Remember: Hardware you can touch, Software you cannot.",
            },
          },
        ],
      },
      assessmentId: "assess_hardware_software",
    },
    {
      id: "slide_004",
      type: "content",
      index: 3,
      content: {
        layout: "interactive",
        blocks: [
          {
            type: "heading",
            text: "How Computers Think: Binary! 💡",
          },
          {
            type: "interactive",
            component: "BinaryLightBulbs",
            levels: [
              { target: 5, bulbs: 3 },
              { target: 10, bulbs: 4 },
              { target: 21, bulbs: 5 },
            ],
          },
        ],
      },
      teacherNotes: "Let students experiment. Show binary patterns on board.",
    },
    {
      id: "slide_005",
      type: "assessment",
      index: 4,
      assessmentId: "assess_computational_thinking",
      content: {
        type: "multipart",
        title: "Computational Thinking Challenge",
        parts: [
          {
            type: "sequencing",
            prompt: "Put these steps in order to make a sandwich:",
            items: [
              { id: 1, text: "Get two slices of bread" },
              { id: 2, text: "Spread butter on bread" },
              { id: 3, text: "Add filling" },
              { id: 4, text: "Put slices together" },
              { id: 5, text: "Cut sandwich in half" },
            ],
            correctOrder: [1, 2, 3, 4, 5],
          },
          {
            type: "pattern-recognition",
            prompt: "What comes next in this pattern?",
            sequence: ["2", "4", "8", "16", "?"],
            options: ["20", "24", "32", "64"],
            correct: "32",
          },
        ],
        timeLimit: 180,
        experienceReward: 100,
      },
    },
    {
      id: "slide_006",
      type: "content",
      index: 5,
      content: {
        layout: "gallery",
        blocks: [
          {
            type: "gallery",
            items: [
              {
                title: "Gaming",
                image: "/images/gaming.jpg",
                description: "Game engines use physics algorithms",
                link: "explore_gaming_cs",
              },
              {
                title: "Social Media",
                image: "/images/social.jpg",
                description: "Recommendation algorithms decide what you see",
                link: "explore_social_cs",
              },
              {
                title: "Medicine",
                image: "/images/medicine.jpg",
                description: "AI helps doctors diagnose diseases",
                link: "explore_medical_cs",
              },
              {
                title: "Environment",
                image: "/images/environment.jpg",
                description: "Climate models predict weather patterns",
                link: "explore_climate_cs",
              },
            ],
          },
        ],
      },
      teacherNotes: "Click each card to reveal. Relate to student interests.",
    },
    {
      id: "slide_007",
      type: "interactive",
      index: 6,
      content: {
        layout: "collaborative",
        blocks: [
          {
            type: "heading",
            text: "Team Challenge: Program a Robot! 🤖",
          },
          {
            type: "interactive",
            component: "RobotMaze",
            config: {
              maze: [
                ["S", "0", "0", "W"],
                ["W", "W", "0", "0"],
                ["0", "0", "0", "W"],
                ["W", "0", "G", "0"],
              ],
              commands: ["MOVE_FORWARD", "TURN_LEFT", "TURN_RIGHT"],
              maxCommands: 10,
              teamSize: 2,
              shareResults: true,
            },
            experiencePoints: 150,
          },
        ],
      },
      assessmentId: "assess_robot_programming",
    },
    {
      id: "slide_008",
      type: "content",
      index: 7,
      content: {
        layout: "reflection",
        blocks: [
          {
            type: "heading",
            text: "What Did We Learn Today? 🎓",
          },
          {
            type: "reflectionPrompts",
            prompts: [
              "One thing that surprised me about computer science was...",
              "I think computer science is important because...",
              "One question I still have is...",
            ],
            submitTo: "teacherDashboard",
          },
          {
            type: "badgeAward",
            badge: {
              id: "badge_cs_intro",
              name: "CS Explorer",
              icon: "🏆",
              description: "Completed Introduction to Computer Science",
              experiencePoints: 200,
            },
          },
        ],
      },
      teacherNotes: "Allow 5 minutes for reflection. Celebrate achievements!",
    },
  ],
  homework: {
    id: "hw_cs_intro_001",
    title: "CS in My World",
    tasks: [
      {
        type: "research",
        prompt: "Find 3 examples of computer science in your home",
        submission: "photo_upload",
      },
      {
        type: "creative",
        prompt: "Design your own simple algorithm for a daily task",
        submission: "text_diagram",
      },
    ],
    dueInDays: 7,
    experiencePoints: 100,
  },
};

export default IntroToCSLesson;

