import MatchingActivity from "./MatchingActivity.jsx";
import OrderingActivity from "./OrderingActivity.jsx";
import DragDropActivity from "./DragDropActivity.jsx";
import GapFillActivity from "./GapFillActivity.jsx";
import ImageHotspotActivity from "./ImageHotspotActivity.jsx";
import PlannerActivity from "./PlannerActivity.jsx";

export default function ActivitySegment(props) {
  const { segment } = props;
  switch (segment.activityType) {
    case "matching":
      return <MatchingActivity {...props} />;
    case "ordering":
      return <OrderingActivity {...props} />;
    case "drag-drop":
      return <DragDropActivity {...props} />;
    case "gap-fill":
      return <GapFillActivity {...props} />;
    case "image-hotspot":
      return <ImageHotspotActivity {...props} />;
    case "planner":
      return <PlannerActivity {...props} />;
    default:
      return (
        <article className="gamified-card">
          <header>
            <h3>{segment.heading}</h3>
          </header>
          <p>This activity type is coming soon.</p>
        </article>
      );
  }
}

