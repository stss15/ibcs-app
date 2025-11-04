import { init, tx, id } from "@instantdb/react";

const APP_ID = import.meta.env?.VITE_INSTANTDB_APP_ID || process.env?.NEXT_PUBLIC_INSTANTDB_APP_ID || process.env?.VITE_INSTANTDB_APP_ID;

const db = APP_ID
  ? init({
      appId: APP_ID,
      schema: {
        liveSessions: {
          classId: { type: "string", indexed: true },
          lessonId: { type: "string", indexed: true },
          lessonKey: { type: "string" },
          deckId: { type: "string", indexed: true },
          status: { type: "string" },
          pointer: {
            currentSlideId: { type: "string" },
            currentIndex: { type: "number" },
            maxUnlockedIndex: { type: "number" },
            timestamp: { type: "number" },
          },
          slideHistory: { type: "array" },
          activeAssessments: { type: "array" },
          startedAt: { type: "number" },
          attendance: { type: "object" },
        },
        studentStates: {
          sessionId: { type: "string", indexed: true },
          studentId: { type: "string", indexed: true },
          classId: { type: "string", indexed: true },
          currentPosition: { type: "number" },
          currentSlideId: { type: "string" },
          viewedSlides: { type: "array" },
          timePerSlide: { type: "object" },
          isActive: { type: "boolean" },
          isBehind: { type: "boolean" },
          lastHeartbeat: { type: "number" },
        },
        assessmentResponses: {
          sessionId: { type: "string", indexed: true },
          studentId: { type: "string", indexed: true },
          assessmentId: { type: "string", indexed: true },
          attempts: { type: "array" },
          isComplete: { type: "boolean" },
          score: { type: "number" },
          lastUpdated: { type: "number" },
        },
        analytics: {
          type: { type: "string", indexed: true },
          sessionId: { type: "string", indexed: true },
          classId: { type: "string", indexed: true },
          studentId: { type: "string", indexed: true },
          slideId: { type: "string" },
          timestamp: { type: "number" },
          payload: { type: "object" },
        },
        slideMetrics: {
          slideId: { type: "string", indexed: true },
          averageViewTime: { type: "number" },
          totalViews: { type: "number" },
        },
      },
    })
  : null;

export { db, tx, id };

export function assertDb() {
  if (!db) {
    throw new Error(
      "InstantDB app id is not configured. Set VITE_INSTANTDB_APP_ID (or NEXT_PUBLIC_INSTANTDB_APP_ID) before using realtime features.",
    );
  }
  return db;
}

