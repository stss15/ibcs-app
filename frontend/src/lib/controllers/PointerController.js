import { db, tx } from "../instantdb/schema.js";
import { getClassPacing, updateClassPacing } from "../api.js";

export default class PointerController {
  constructor({ sessionId, classId, role, token, deckId }) {
    this.sessionId = sessionId || null;
    this.classId = classId || null;
    this.deckId = deckId || null;
    this.role = role;
    this.token = token;
    this.throttleTimer = null;
  }

  async loadSnapshot() {
    if (db && this.sessionId) {
      const result = await db.liveSessions.where("id", this.sessionId).get();
      return result?.[0] ?? null;
    }
    if (this.classId && this.token) {
      return getClassPacing(this.token, this.classId);
    }
    return null;
  }

  async advancePointer() {
    if (this.role !== "teacher") {
      throw new Error("Only teachers can advance the pointer");
    }
    if (this.throttleTimer) return null;

    if (db && this.sessionId) {
      const session = await db.liveSessions.where("id", this.sessionId).get();
      const current = session?.[0];
      if (!current) return null;
      const nextIndex = (current.pointer?.currentIndex ?? 0) + 1;
      await db.transact([
        tx.liveSessions[this.sessionId].update({
          pointer: {
            currentIndex: nextIndex,
            currentSlideId: current.slideHistory?.[nextIndex] || current.pointer?.currentSlideId,
            maxUnlockedIndex: Math.max(nextIndex, current.pointer?.maxUnlockedIndex ?? 0),
            timestamp: Date.now(),
          },
        }),
      ]);
    } else if (this.classId && this.token) {
      await updateClassPacing(this.token, this.classId, { command: "advance", unitId: this.deckId });
    }

    this.throttleTimer = setTimeout(() => {
      this.throttleTimer = null;
    }, 2000);
    return null;
  }

  async canNavigateTo(targetIndex) {
    if (this.role === "teacher") return true;
    const snapshot = await this.loadSnapshot();
    if (!snapshot) return false;
    const maxIndex = snapshot.pointer?.maxUnlockedIndex ?? 0;
    return targetIndex <= maxIndex;
  }

  subscribe(callback) {
    if (db && this.sessionId) {
      return db.subscribeQuery(db.liveSessions.where("id", this.sessionId), (sessions) => {
        callback?.(sessions?.[0] ?? null);
      });
    }
    let cancelled = false;
    const poll = async () => {
      if (cancelled || !this.classId || !this.token) return;
      try {
        const snapshot = await getClassPacing(this.token, this.classId);
        if (!cancelled) callback?.(snapshot);
      } catch (err) {
        console.error("Pointer polling failed", err);
      } finally {
        if (!cancelled) setTimeout(poll, 4000);
      }
    };
    poll();
    return () => {
      cancelled = true;
    };
  }
}

