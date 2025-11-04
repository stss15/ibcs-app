import { db, tx, id } from "../instantdb/schema.js";

function safeNumber(value, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  return fallback;
}

class AnalyticsService {
  constructor() {
    this.enabled = Boolean(db);
  }

  isEnabled() {
    return this.enabled && Boolean(db);
  }

  async trackEvent(eventType, data = {}) {
    if (!this.isEnabled() || !eventType) return null;

    const timestamp = Date.now();
    const event = {
      type: eventType,
      timestamp,
      ...data,
    };

    try {
      const eventId = id();
      await db.transact([
        tx.analytics[eventId].update({
          ...event,
          payload: event.payload ?? null,
        }),
      ]);

      this.processForMetrics({ id: eventId, ...event });
      return eventId;
    } catch (error) {
      console.warn("Analytics event failed", eventType, error);
      return null;
    }
  }

  async processForMetrics(event) {
    if (!event?.type) return;

    switch (event.type) {
      case "slide_view":
        await this.updateSlideMetrics(event);
        break;
      default:
        break;
    }
  }

  async updateSlideMetrics(event) {
    if (!this.isEnabled() || !event?.slideId) return;

    try {
      const records = await db.analytics
        .where("type", "slide_view")
        .where("slideId", event.slideId)
        .get();

      if (!Array.isArray(records) || records.length === 0) return;

      const totalViews = records.length;
      const totalDuration = records.reduce((acc, row) => acc + safeNumber(row.payload?.durationMs, 0), 0);
      const averageViewTime = totalViews === 0 ? 0 : Math.round(totalDuration / totalViews);

      const metricId = id();
      const existing = await db.slideMetrics.where("slideId", event.slideId).get();
      const targetId = existing?.[0]?.id ?? metricId;

      await db.transact([
        tx.slideMetrics[targetId].update({
          slideId: event.slideId,
          averageViewTime,
          totalViews,
        }),
      ]);
    } catch (error) {
      console.warn("Failed to update slide metrics", error);
    }
  }
}

const analyticsService = new AnalyticsService();

export default analyticsService;
export { AnalyticsService };

