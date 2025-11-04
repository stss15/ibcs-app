import { db, tx, id } from "../instantdb/schema.js";

function toNumber(value, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return fallback;
}

class GamificationService {
  constructor() {
    this.enabled = Boolean(db);
    this.experienceTable = {
      slide_complete: 5,
      assessment_attempt: 10,
      assessment_perfect: 35,
      interactive_complete: 25,
    };
  }

  isEnabled() {
    return this.enabled && Boolean(db);
  }

  calculateLevel(xp) {
    const safeXp = toNumber(xp, 0);
    return Math.max(1, Math.floor(safeXp / 150) + 1);
  }

  async fetchStudentRecord(studentId) {
    if (!this.isEnabled() || !studentId) return null;
    try {
      const existing = await db.studentGamification.where("studentId", studentId).get();
      return existing?.[0] ?? null;
    } catch (error) {
      console.warn("Failed to fetch gamification record", error);
      return null;
    }
  }

  async awardExperience(studentId, action, context = {}) {
    if (!this.isEnabled() || !studentId) {
      return { awarded: 0, total: null, level: null, achievements: [] };
    }

    const base = toNumber(this.experienceTable[action], 0);
    let totalAward = base;

    if (context.correct && action !== "assessment_perfect") {
      totalAward += 5;
    }

    if (context.firstAttempt && action === "assessment_perfect") {
      totalAward += 10;
    }

    if (totalAward <= 0) {
      return { awarded: 0, total: null, level: null, achievements: [] };
    }

    try {
      const record = await this.fetchStudentRecord(studentId);
      const recordId = record?.id ?? id();
      const previousXp = toNumber(record?.xp, 0);
      const previousCorrect = toNumber(record?.totalCorrect, 0);
      const previousAttempts = toNumber(record?.totalAttempts, 0);
      const previousStreak = toNumber(record?.streak, 0);

      const total = previousXp + totalAward;
      const level = this.calculateLevel(total);
      const correctIncrement = context.correct ? 1 : 0;
      const attemptsIncrement = context.attempts ? toNumber(context.attempts, 1) : 1;
      const streak = context.correct ? previousStreak + 1 : 0;

      await db.transact([
        tx.studentGamification[recordId].update({
          studentId,
          xp: total,
          level,
          streak,
          totalCorrect: previousCorrect + correctIncrement,
          totalAttempts: previousAttempts + attemptsIncrement,
          lastUpdated: new Date().toISOString(),
        }),
      ]);

      return {
        awarded: totalAward,
        total,
        level,
        achievements: [],
      };
    } catch (error) {
      console.warn("Gamification award failed", error);
      return { awarded: 0, total: null, level: null, achievements: [] };
    }
  }
}

const gamificationService = new GamificationService();

export default gamificationService;
export { GamificationService };

