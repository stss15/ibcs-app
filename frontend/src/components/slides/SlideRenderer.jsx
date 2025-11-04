import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import FormativeAssessment from "../assessments/FormativeAssessment.jsx";
import {
  BinaryLightBulbs,
  RobotMaze,
  ThinkPairShare,
  LiveCodeEditor,
} from "../interactive/PedagogicalComponents.jsx";

const INTERACTIVE_COMPONENTS = {
  ThinkPairShare,
  BinaryLightBulbs,
  RobotMaze,
  LiveCodeEditor,
};

function HeadingBlock({ level = 2, text }) {
  const Tag = `h${Math.min(Math.max(level || 2, 1), 4)}`;
  return <Tag className="slide-block slide-block--heading">{text}</Tag>;
}

function ParagraphBlock({ text }) {
  return <p className="slide-block slide-block--paragraph">{text}</p>;
}

function BulletedList({ items = [] }) {
  return (
    <ul className="slide-block slide-block--list">
      {items.map((item, index) => (
        <li key={index}>{typeof item === "string" ? item : item?.text}</li>
      ))}
    </ul>
  );
}

function ObjectivesBlock({ objectives = [] }) {
  return (
    <div className="slide-panel slide-panel--objectives">
      <h3>Learning objectives</h3>
      <ul>
        {objectives.map((objective, index) => (
          <li key={index}>{objective}</li>
        ))}
      </ul>
    </div>
  );
}

function CalloutBlock({ type = "info", text, title }) {
  return (
    <div className={`slide-callout slide-callout--${type}`}>
      {title && <strong>{title}</strong>}
      <p>{text}</p>
    </div>
  );
}

function ReflectionBlock({ prompts = [], submitTo }) {
  return (
    <div className="slide-panel slide-panel--reflection">
      <h3>Reflection</h3>
      <ul>
        {prompts.map((prompt, index) => (
          <li key={index}>{prompt}</li>
        ))}
      </ul>
      {submitTo && <span className="slide-panel__meta">Responses are sent to {submitTo}</span>}
    </div>
  );
}

function BadgeAwardBlock({ badge }) {
  if (!badge) return null;
  return (
    <div className="slide-panel slide-panel--badge">
      <span className="slide-badge-icon" aria-hidden="true">
        {badge.icon || "🏅"}
      </span>
      <div>
        <h3>{badge.name}</h3>
        <p>{badge.description}</p>
        {typeof badge.experiencePoints === "number" && <span>{badge.experiencePoints} XP</span>}
      </div>
    </div>
  );
}

function InteractiveComponent({ component, props }) {
  const Component = INTERACTIVE_COMPONENTS[component] || null;
  if (!Component) {
    return (
      <div className="slide-panel slide-panel--placeholder">
        <p>Interactive component “{component}” is not yet supported.</p>
      </div>
    );
  }
  return <Component {...props} />;
}

function renderBlock(block, context) {
  if (!block) return null;
  const { sessionId, studentId, onAssessmentComplete } = context ?? {};
  const handleCompletion = (result) => {
    if (!onAssessmentComplete) return;
    if (typeof result === "boolean") {
      onAssessmentComplete({ status: result ? "completed" : "in-progress", score: result ? 1 : 0 });
    } else if (typeof result === "object") {
      onAssessmentComplete(result);
    }
  };
  switch (block.type) {
    case "heading":
      return <HeadingBlock level={block.level} text={block.text} />;
    case "paragraph":
      return <ParagraphBlock text={block.text} />;
    case "list":
      return <BulletedList items={block.items} />;
    case "objectives":
      return <ObjectivesBlock objectives={block.objectives} />;
    case "callout":
      return <CalloutBlock type={block.variant || block.calloutType || block.style || "info"} title={block.title} text={block.body || block.text} />;
    case "interactive":
      return <InteractiveComponent component={block.component} props={{ ...block, sessionId, studentId, onComplete: handleCompletion }} />;
    case "interactiveDiagram":
      return (
        <div className="slide-panel slide-panel--diagram">
          <h3>{block.title || "Interactive diagram"}</h3>
          <p>This diagram can be explored on student devices once unlocked.</p>
        </div>
      );
    case "reflectionPrompts":
      return <ReflectionBlock prompts={block.prompts} submitTo={block.submitTo} />;
    case "badgeAward":
      return <BadgeAwardBlock badge={block.badge} />;
    case "experience":
      return (
        <div className="slide-panel slide-panel--xp">
          <h3>Earn experience</h3>
          <p>{block.description || "Complete the activity to gain XP."}</p>
          {typeof block.xp === "number" && <span>{block.xp} XP</span>}
        </div>
      );
    case "formative":
      return <FormativeAssessment question={block.question} onComplete={handleCompletion} />;
    default:
      if (typeof block.text === "string") {
        return <ParagraphBlock text={block.text} />;
      }
      return null;
  }
}

function ContentSlide({ slide, context }) {
  const layout = slide?.content?.layout || "stack";
  const blocks = Array.isArray(slide?.content?.blocks) ? slide.content.blocks : [];

  if (layout === "split") {
    return (
      <div className="slide-layout slide-layout--split">
        {blocks.map((block, index) => (
          <div key={index} className="slide-layout__column">
            {renderBlock(block, context)}
          </div>
        ))}
      </div>
    );
  }

  if (layout === "gallery") {
    const items = blocks[0]?.items ?? [];
    return (
      <div className="slide-gallery">
        {items.map((item) => (
          <article key={item.title} className="slide-gallery__card">
            {item.image && <img src={item.image} alt={item.title} loading="lazy" />}
            <div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    );
  }

  if (layout === "reflection") {
    return (
      <div className="slide-layout slide-layout--stack">
        {blocks.map((block, index) => (
          <div key={index} className="slide-layout__item">
            {renderBlock(block, context)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="slide-layout slide-layout--stack">
      {blocks.map((block, index) => (
        <div key={index} className="slide-layout__item">
          {renderBlock(block, context)}
        </div>
      ))}
    </div>
  );
}

function InteractiveSlide({ slide, context }) {
  const activity = slide?.content?.blocks?.[0];
  if (!activity) return null;

  const normalise = (result) => {
    if (!context.onAssessmentComplete) return;
    if (typeof result === "boolean") {
      context.onAssessmentComplete({ status: result ? "completed" : "in-progress", score: result ? 1 : 0 });
    } else if (typeof result === "object") {
      context.onAssessmentComplete(result);
    }
  };

  if (activity.type === "sortingActivity") {
    return (
        <FormativeAssessment
          variant="classification"
          question={{
            id: activity.assessmentId || slide.assessmentId,
            prompt: activity.instruction,
            items: activity.items,
            categories: activity.categories,
          }}
          onComplete={normalise}
        />
    );
  }

  return renderBlock(activity, context);
}

function AssessmentSlide({ slide, context }) {
  const { onAssessmentComplete } = context;
  const payload = slide?.content;
  const handleComplete = (result) => {
    if (!onAssessmentComplete) return;
    if (typeof result === "boolean") {
      onAssessmentComplete({ status: result ? "completed" : "in-progress", score: result ? 1 : 0 });
    } else if (typeof result === "object") {
      onAssessmentComplete(result);
    }
  };

  if (payload?.type === "multipart") {
    return (
      <div className="slide-assessment slide-assessment--multipart">
        <h3>{payload.title}</h3>
        {Array.isArray(payload.parts) &&
          payload.parts.map((part, index) => {
            if (part.type === "sequencing") {
              return (
                <FormativeAssessment
                  key={index}
                  question={{
                    id: `${slide.id}-part-${index}`,
                    prompt: part.prompt,
                    items: part.items.map((item) => ({ id: item.id, content: item.text })),
                    correctOrder: part.correctOrder,
                  }}
                  onComplete={handleComplete}
                />
              );
            }
            if (part.type === "pattern-recognition") {
              return (
                <FormativeAssessment
                  key={index}
                  variant="multiple-choice"
                  question={{
                    id: `${slide.id}-part-${index}`,
                    prompt: part.prompt,
                    options: part.options.map((option) => ({ id: option, label: option })),
                    answer: part.correct,
                  }}
                  onComplete={handleComplete}
                />
              );
            }
            return null;
          })}
      </div>
    );
  }

  return <FormativeAssessment question={payload} onComplete={handleComplete} />;
}

export default function SlideRenderer({ slideData, isTeacher, sessionId, studentId, canProgress, onAssessmentComplete }) {
  const variant = useMemo(() => ({
    initial: { opacity: 0, x: 60 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -60 },
  }), []);

  const context = useMemo(
    () => ({
      isTeacher,
      sessionId,
      studentId,
      onAssessmentComplete,
    }),
    [isTeacher, sessionId, studentId, onAssessmentComplete],
  );

  if (!slideData) {
    return (
      <div className="slide-container slide-container--empty">
        <p>Select a slide to begin.</p>
      </div>
    );
  }

  const { type } = slideData;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={slideData.id}
        className={`slide-container slide-container--${type}`}
        initial={variant.initial}
        animate={variant.animate}
        exit={variant.exit}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {type === "content" && <ContentSlide slide={slideData} context={context} />}
        {type === "interactive" && <InteractiveSlide slide={slideData} context={context} />}
        {type === "assessment" && <AssessmentSlide slide={slideData} context={context} />}
        {type === "checkpoint" && <AssessmentSlide slide={slideData} context={context} />}
        {type === "summative" && <AssessmentSlide slide={slideData} context={context} />}

        {!isTeacher && canProgress === false && (
          <div className="slide-lock-overlay">
            <div>
              <p>Waiting for teacher to unlock this content…</p>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

