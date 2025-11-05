import { useState, useRef } from "react";
import "./Accordion.css";

/**
 * Accordion component for progressive disclosure
 * 
 * @param {Array} items - Array of accordion items: [{ id, title, content }]
 * @param {boolean} multiple - Allow multiple items open at once (default: false)
 * @param {Array|string} defaultExpanded - ID(s) of items to expand by default
 */
export default function Accordion({ items = [], multiple = false, defaultExpanded = [] }) {
  const defaultExpandedIds = Array.isArray(defaultExpanded) ? defaultExpanded : [defaultExpanded];
  const [expandedIds, setExpandedIds] = useState(new Set(defaultExpandedIds));
  const itemRefs = useRef({});

  const toggleItem = (id) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        if (!multiple) {
          newSet.clear();
        }
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleKeyDown = (e, id, index) => {
    switch (e.key) {
      case "Enter":
      case " ": {
        e.preventDefault();
        toggleItem(id);
        break;
      }
      case "ArrowDown": {
        e.preventDefault();
        const nextIndex = (index + 1) % items.length;
        const nextId = items[nextIndex]?.id;
        if (nextId) {
          itemRefs.current[nextId]?.focus();
        }
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        const prevIndex = (index - 1 + items.length) % items.length;
        const prevId = items[prevIndex]?.id;
        if (prevId) {
          itemRefs.current[prevId]?.focus();
        }
        break;
      }
      case "Home": {
        e.preventDefault();
        const firstId = items[0]?.id;
        if (firstId) {
          itemRefs.current[firstId]?.focus();
        }
        break;
      }
      case "End": {
        e.preventDefault();
        const lastId = items[items.length - 1]?.id;
        if (lastId) {
          itemRefs.current[lastId]?.focus();
        }
        break;
      }
      default:
        break;
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="accordion" role="region">
      {items.map((item, index) => {
        const isExpanded = expandedIds.has(item.id);
        const contentId = `accordion-content-${item.id}`;
        const buttonId = `accordion-button-${item.id}`;

        return (
          <div key={item.id} className="accordion-item">
            <button
              id={buttonId}
              ref={(el) => (itemRefs.current[item.id] = el)}
              className="accordion-trigger"
              onClick={() => toggleItem(item.id)}
              onKeyDown={(e) => handleKeyDown(e, item.id, index)}
              aria-expanded={isExpanded}
              aria-controls={contentId}
              type="button"
            >
              <span className="accordion-title">{item.title}</span>
              <span className="accordion-icon" aria-hidden="true">
                {isExpanded ? "−" : "+"}
              </span>
            </button>
            <div
              id={contentId}
              className={`accordion-content ${isExpanded ? "is-expanded" : ""}`}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isExpanded}
            >
              <div className="accordion-content-inner">{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

