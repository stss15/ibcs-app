import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DndContext } from "@dnd-kit/core";
import { Sandpack } from "@codesandbox/sandpack-react";

export function BinaryLightBulbs({ levels = [], onComplete }) {
  const [levelIndex, setLevelIndex] = useState(0);
  const [states, setStates] = useState(() => new Array(5).fill(0));
  const [score, setScore] = useState(0);

  const level = levels[levelIndex] ?? null;
  const bulbs = level ? level.bulbs : states.length;

  useEffect(() => {
    if (level && bulbs !== states.length) {
      setStates(new Array(bulbs).fill(0));
    }
  }, [level, bulbs, states.length]);

  const toggle = (position) => {
    setStates((prev) => {
      const next = [...prev];
      next[position] = next[position] === 0 ? 1 : 0;
      return next;
    });
  };

  const decimalValue = states.slice(states.length - bulbs).reduce((acc, value, index) => acc + value * Math.pow(2, bulbs - index - 1), 0);

  const handleCheck = () => {
    if (!level) return;
    const isCorrect = decimalValue === level.target;
    if (isCorrect) {
      const nextLevel = levelIndex + 1;
      setScore((prev) => prev + 50);
      if (nextLevel >= levels.length) {
        onComplete?.({ score: score + 50 });
      } else {
        setLevelIndex(nextLevel);
      }
    }
  };

  return (
    <div className="binary-light-bulbs">
      <h3>Make {level?.target ?? 0}</h3>
      <div className="binary-light-bulbs__grid">
        {states.slice(states.length - bulbs).map((value, index) => (
          <motion.button
            key={index}
            type="button"
            className={`binary-light-bulbs__bulb ${value === 1 ? "is-on" : ""}`}
            onClick={() => toggle(states.length - bulbs + index)}
            whileTap={{ scale: 0.95 }}
          >
            {value}
          </motion.button>
        ))}
      </div>
      <p className="binary-light-bulbs__value">Value: {decimalValue}</p>
      <button type="button" className="y7-btn y7-btn--primary" onClick={handleCheck}>
        Check
      </button>
      <p className="binary-light-bulbs__score">Score: {score}</p>
    </div>
  );
}

export function RobotMaze({ config, onComplete }) {
  const [commands, setCommands] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState("RIGHT");

  const findStart = () => {
    for (let y = 0; y < config.maze.length; y += 1) {
      const x = config.maze[y].indexOf("S");
      if (x !== -1) return { x, y };
    }
    return { x: 0, y: 0 };
  };

  useEffect(() => {
    setPosition(findStart());
  }, [config]);

  const turnRight = (current) => {
    switch (current) {
      case "UP":
        return "RIGHT";
      case "RIGHT":
        return "DOWN";
      case "DOWN":
        return "LEFT";
      default:
        return "UP";
    }
  };

  const turnLeft = (current) => {
    switch (current) {
      case "UP":
        return "LEFT";
      case "LEFT":
        return "DOWN";
      case "DOWN":
        return "RIGHT";
      default:
        return "UP";
    }
  };

  const moveForward = (pos, dir) => {
    const next = { ...pos };
    if (dir === "UP") next.y -= 1;
    if (dir === "DOWN") next.y += 1;
    if (dir === "LEFT") next.x -= 1;
    if (dir === "RIGHT") next.x += 1;
    const cell = config.maze[next.y]?.[next.x];
    if (!cell || cell === "W") return pos;
    return next;
  };

  const runProgram = async () => {
    if (commands.length === 0) return;
    setIsRunning(true);
    let pos = findStart();
    let dir = "RIGHT";
    for (const command of commands) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (command === "MOVE_FORWARD") {
        pos = moveForward(pos, dir);
      } else if (command === "TURN_LEFT") {
        dir = turnLeft(dir);
      } else if (command === "TURN_RIGHT") {
        dir = turnRight(dir);
      }
      setPosition(pos);
      setDirection(dir);
      const cell = config.maze[pos.y]?.[pos.x];
      if (cell === "G") {
        onComplete?.({ success: true });
        break;
      }
    }
    setIsRunning(false);
  };

  return (
    <div className="robot-maze">
      <div className="robot-maze__grid">
        {config.maze.map((row, y) => (
          <div key={`row-${y}`} className="robot-maze__row">
            {row.map((cell, x) => (
              <div key={`cell-${x}-${y}`} className={`robot-maze__cell robot-maze__cell--${cell.toLowerCase()}`}>
                {position.x === x && position.y === y ? "🤖" : cell === "G" ? "🎯" : ""}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="robot-maze__controls">
        {config.commands.map((command) => (
          <button
            key={command}
            type="button"
            className="y7-btn"
            onClick={() => setCommands((prev) => (prev.length >= config.maxCommands ? prev : [...prev, command]))}
            disabled={isRunning}
          >
            {command.replace("_", " ")}
          </button>
        ))}
      </div>
      <div className="robot-maze__program">
        {commands.map((cmd, index) => (
          <span key={`${cmd}-${index}`} className="robot-maze__chip">
            {cmd.replace("_", " ")}
          </span>
        ))}
      </div>
      <div className="robot-maze__actions">
        <button type="button" className="y7-btn y7-btn--primary" onClick={runProgram} disabled={isRunning || commands.length === 0}>
          Run program
        </button>
        <button type="button" className="y7-btn" onClick={() => setCommands([])} disabled={isRunning}>
          Clear
        </button>
      </div>
    </div>
  );
}

export function LiveCodeEditor({ initialCode, language = "react" }) {
  return (
    <Sandpack
      template={language}
      files={{
        "/App.js": initialCode,
      }}
      options={{
        showNavigator: false,
        showTabs: true,
        showLineNumbers: true,
        editorHeight: 360,
      }}
    />
  );
}

export function ThinkPairShare({ prompt, duration = 180 }) {
  const [phase, setPhase] = useState("think");
  const [timeLeft, setTimeLeft] = useState(Math.floor(duration / 3));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (phase === "think") {
            setPhase("pair");
            return Math.floor(duration / 3);
          }
          if (phase === "pair") {
            setPhase("share");
            return Math.floor(duration / 3);
          }
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, duration]);

  const phases = [
    { id: "think", label: "Think", icon: "🤔" },
    { id: "pair", label: "Pair", icon: "👥" },
    { id: "share", label: "Share", icon: "💬" },
  ];

  return (
    <div className="think-pair-share">
      <h3>{prompt}</h3>
      <div className="think-pair-share__phases">
        {phases.map((item) => (
          <div key={item.id} className={`think-pair-share__phase ${phase === item.id ? "is-active" : ""}`}>
            <span className="think-pair-share__icon" aria-hidden="true">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      <p className="think-pair-share__timer">
        {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
      </p>
    </div>
  );
}

export function InteractiveShell({ children }) {
  return <div className="interactive-shell">{children}</div>;
}

export const INTERACTIVE_REGISTRY = {
  BinaryLightBulbs,
  RobotMaze,
  ThinkPairShare,
  LiveCodeEditor,
};

