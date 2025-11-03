import { Fragment } from "react";
import SegmentNav from "./SegmentNav.jsx";
import { EnhancedTable } from "./EnhancedComponents.jsx";
import "./Segments.css";
import "./EnhancedComponents.css";

function renderBody(segment) {
  switch (segment.type) {
    case "content":
      return <div className="gamified-card__body">{segment.body}</div>;
    case "list":
      return (
        <div className="gamified-card__body gamified-card__body--list">
          {segment.items?.map((item) => (
            <div key={item.title} className="gamified-list-item">
              <h4>{item.title}</h4>
              <div>{item.body}</div>
            </div>
          ))}
        </div>
      );
    case "table":
      return (
        <div className="gamified-table-wrapper">
          <table>
            <thead>
              <tr>
                {segment.columns?.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {segment.rows?.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "accordion":
      return (
        <div className="gamified-accordion">
          {segment.items?.map((item, index) => (
            <details key={item.title} open={index === 0}>
              <summary>{item.title}</summary>
              <div>{item.body}</div>
            </details>
          ))}
        </div>
      );
    default:
      return <div className="gamified-card__body">{segment.body ?? <Fragment />}</div>;
  }
}

export default function ContentSegment({ segment, onComplete, onBack }) {
  return (
    <article className="gamified-card">
      <header>
        <h3>{segment.heading}</h3>
        {segment.subheading && <p className="muted">{segment.subheading}</p>}
      </header>
      {renderBody(segment)}
      <SegmentNav onBack={onBack} onComplete={onComplete} />
    </article>
  );
}

