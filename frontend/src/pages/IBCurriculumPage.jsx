import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSession } from "../hooks/useSession.js";
import {
  useCurriculumManifest,
  getTrackLabel,
  resetCurriculumManifestCache,
} from "../hooks/useCurriculumManifest.js";
import { IB_UNIT_METADATA, SUBTOPIC_DESCRIPTIONS } from "../lib/ibMetadata.js";
import b1Unit from "../content/b1ComputationalThinking.jsx";
import b2Unit from "../content/b2ProgrammingFundamentals.jsx";
import "./IBCurriculumPage.css";

function getTrackOptions(manifest) {
  if (!manifest?.tracks) return [];
  return Object.entries(manifest.tracks)
    .filter(([track]) => track.startsWith("ib"))
    .map(([track, value]) => ({
      id: track,
      label: value.label ?? track,
      defaultLessons: value.defaultLessons ?? [],
    }));
}

function resolveInitialTrack(sessionTrack, trackOptions) {
  const normalized = typeof sessionTrack === "string" ? sessionTrack.toLowerCase() : "";
  if (normalized && trackOptions.some((option) => option.id === normalized)) {
    return normalized;
  }
  return trackOptions[0]?.id ?? "ib-sl";
}

function computeLessonStatus({ lesson, lessonIndex, unit, subtopic, track, canViewAll }) {
  if (canViewAll) {
    return "unlocked";
  }
  const unitAvailable = Array.isArray(unit.availableFor)
    ? unit.availableFor.includes(track)
    : true;
  const subtopicAvailable = Array.isArray(subtopic.availableFor)
    ? subtopic.availableFor.includes(track)
    : true;

  const hlOnly = Boolean(lesson.hlOnly);
  const trackSupportsHL = track === "ib-hl";
  const accessible = unitAvailable && subtopicAvailable && (!hlOnly || trackSupportsHL);

  if (!accessible) {
    return hlOnly ? "hl-only" : "locked";
  }

  return lessonIndex === 0 ? "unlocked" : "locked";
}

function IBCurriculumPage() {
  const { session } = useSession();
  const location = useLocation();
  const { manifest, status, error } = useCurriculumManifest();
  const role = session?.user?.role ?? null;
  const isTeacher = role === "teacher";
  const canViewAll = role === "teacher" || role === "admin";
  const staffBadgeLabel = isTeacher ? "Teacher view" : "Staff view";
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const trackOptions = useMemo(() => getTrackOptions(manifest), [manifest]);

  const selectedTrack = useMemo(() => {
    if (!trackOptions.length) {
      return canViewAll
        ? "ib-hl"
        : resolveInitialTrack(session?.user?.curriculumTrack, [
            { id: "ib-sl" },
            { id: "ib-hl" },
          ]);
    }
    if (canViewAll) {
      return trackOptions.find((option) => option.id === "ib-hl")?.id ?? trackOptions[0].id;
    }
    return resolveInitialTrack(session?.user?.curriculumTrack, trackOptions);
  }, [trackOptions, canViewAll, session?.user?.curriculumTrack]);

  useEffect(() => {
    if (!manifest) return;

    const units = manifest.units ?? [];

    const findFirstAccessibleUnit = () => {
      if (canViewAll || !selectedTrack) {
        return units.find((unit) => unit.id === "A1") ?? units[0];
      }
      return (
        units.find((unit) => {
          if (unit.id === "A1") {
            return !unit.availableFor || unit.availableFor.includes(selectedTrack);
          }
          return false;
        }) ??
        units.find((unit) => !unit.availableFor || unit.availableFor.includes(selectedTrack)) ??
        units[0]
      );
    };

    if (!selectedUnitId) {
      const defaultUnit = findFirstAccessibleUnit();
      if (defaultUnit) {
        setSelectedUnitId(defaultUnit.id);
      }
      return;
    }

    if (!canViewAll && selectedTrack) {
      const activeUnit = units.find((unit) => unit.id === selectedUnitId);
      const accessible = activeUnit
        ? !activeUnit.availableFor || activeUnit.availableFor.includes(selectedTrack)
        : false;
      if (!accessible) {
        const fallback = findFirstAccessibleUnit();
        if (fallback) {
          setSelectedUnitId(fallback.id);
        }
      }
    }
  }, [manifest, selectedUnitId, selectedTrack, canViewAll]);

  useEffect(() => {
    if (!manifest) return;
    const focusUnit = location.state?.focusUnit;
    if (focusUnit) {
      setSelectedUnitId(focusUnit);
    }
  }, [location.state, manifest]);

  const selectedUnit = useMemo(() => {
    if (!manifest || !selectedUnitId) return null;
    return manifest.units?.find((unit) => unit.id === selectedUnitId) ?? null;
  }, [manifest, selectedUnitId]);

  if (status === "loading") {
    return (
      <section className="ib-loading card">
        <p className="muted">Loading IB curriculum…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="ib-loading card">
        <h2>Unable to load curriculum</h2>
        <p className="muted">{error.message ?? "Please try again later."}</p>
        <button
          type="button"
          onClick={() => {
            resetCurriculumManifestCache();
            window.location.reload();
          }}
          className="pill pill--action"
        >
          Try again
        </button>
      </section>
    );
  }

  if (!manifest) {
    return null;
  }

  const baseTrackLabel = getTrackLabel(manifest, selectedTrack);
  const trackBadgeText = canViewAll
    ? `${staffBadgeLabel} · All content`
    : baseTrackLabel
    ? `${role === "student" ? "Your track" : "Viewing"}: ${baseTrackLabel}`
    : null;
  const unitMeta = selectedUnit ? IB_UNIT_METADATA[selectedUnit.id] ?? {} : {};

  return (
    <div className="ib-layout">
      <aside className="ib-sidebar">
        <div className="ib-sidebar__intro">
          <h1>IB Computer Science</h1>
          <p className="muted">
            Explore the structured map for Standard and Higher level learners. Select a unit to view its
            chapters and lesson pages.
          </p>
          <Link to="/curriculum" className="ib-sidebar__back">
            ⟵ Back to curriculum overview
          </Link>
        </div>

        <nav className="ib-sidebar__nav" aria-label="IB units">
          {manifest.units?.map((unit) => {
            const metadata = IB_UNIT_METADATA[unit.id] ?? {};
            const isActive = unit.id === selectedUnitId;
            const isTrackAvailable = canViewAll || !unit.availableFor || unit.availableFor.includes(selectedTrack);

            return (
              <button
                key={unit.id}
                type="button"
                className={`ib-sidebar__unit ${isActive ? "is-active" : ""}`}
                onClick={() => setSelectedUnitId(unit.id)}
                aria-current={isActive ? "true" : "false"}
              >
                <span className="ib-sidebar__unit-code">{unit.id}</span>
                <span className="ib-sidebar__unit-title">{metadata.summary ?? unit.title}</span>
                {!isTrackAvailable && <span className="ib-badge ib-badge--muted">HL only</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="ib-content" aria-live="polite">
        {selectedUnit ? (
          <>
            <header className="ib-content__header">
              <div>
                <span className="ib-content__theme">{unitMeta.theme ?? "IB Computer Science"}</span>
                <h2>
                  {selectedUnit.id} · {unitMeta.summary ?? selectedUnit.title}
                </h2>
                {unitMeta.guidingQuestion && (
                  <p className="ib-content__guiding">{unitMeta.guidingQuestion}</p>
                )}
              </div>
              <div className="ib-content__meta">
                {unitMeta.hours?.sl && <span className="ib-badge">{unitMeta.hours.sl}</span>}
                {unitMeta.hours?.hl && <span className="ib-badge">{unitMeta.hours.hl}</span>}
                {trackBadgeText && <span className="ib-badge ib-badge--outline">{trackBadgeText}</span>}
              </div>
            </header>
            {selectedUnit.id === "B1" ? (
              <B1LearningPreview />
            ) : selectedUnit.id === "B2" ? (
              <B2LearningPreview />
            ) : (
              <>
                <div className="ib-chapters">
                  {selectedUnit.subtopics?.map((subtopic) => {
                    const description = SUBTOPIC_DESCRIPTIONS[subtopic.id] ?? subtopic.title;
                    const trackAllowsChapter = !subtopic.availableFor || subtopic.availableFor.includes(selectedTrack);
                    const isUnitAvailable = !selectedUnit.availableFor || selectedUnit.availableFor.includes(selectedTrack);
                    const isChapterAvailable = trackAllowsChapter && isUnitAvailable;

                return (
                  <article className="ib-chapter" key={subtopic.id}>
                    <header className="ib-chapter__header">
                      <div>
                        <h3>
                          {subtopic.id} · {description}
                        </h3>
                        {subtopic.availableFor && !subtopic.availableFor.includes("ib-sl") && (
                          <span className="ib-chapter__tag">HL focus</span>
                        )}
                        <p className="muted">
                          {subtopic.title}
                        </p>
                      </div>
                      <div className="ib-chapter__actions">
                        <Link
                          to={canViewAll || isChapterAvailable ? `/topic/${encodeURIComponent(subtopic.id)}` : "#"}
                          className={`ib-chapter__link ${canViewAll || isChapterAvailable ? "" : "is-disabled"}`}
                          onClick={(event) => {
                            if (!canViewAll && !isChapterAvailable) {
                              event.preventDefault();
                            }
                          }}
                        >
                          View chapter
                        </Link>
                        {!canViewAll && !isChapterAvailable && (
                          <span className="ib-badge ib-badge--muted">Locked</span>
                        )}
                        {canViewAll && <span className="ib-badge ib-badge--outline">{staffBadgeLabel}</span>}
                        {!canViewAll && isChapterAvailable && (
                          <span className="ib-badge ib-badge--outline">First page unlocked</span>
                        )}
                      </div>
                    </header>

                    <ul className="ib-lessons" role="list">
                      {subtopic.lessons?.map((lesson, index) => {
                        const status = computeLessonStatus({
                          lesson,
                          lessonIndex: index,
                          unit: selectedUnit,
                          subtopic,
                          track: selectedTrack,
                          canViewAll,
                        });

                        const unlocked = status === "unlocked";
                        const hlOnly = status === "hl-only";
                        const lessonHref = `/lesson/${encodeURIComponent(lesson.id)}`;
                        const canLaunchLesson = canViewAll || unlocked;

                        return (
                          <li key={lesson.id} className={`ib-lesson ib-lesson--${status}`}>
                            <span className="ib-lesson__code">{lesson.id}</span>
                            <span className="ib-lesson__title">{lesson.title}</span>
                            <span className="ib-lesson__status">
                              {canLaunchLesson && (
                                <Link
                                  to={lessonHref}
                                  className="ib-status-pill is-unlocked ib-status-pill--link"
                                  aria-label={`Open ${lesson.title}`}
                                >
                                  {canViewAll ? "Open lesson" : "Start lesson"}
                                </Link>
                              )}
                              {canViewAll && <span className="ib-status-pill is-teacher">{staffBadgeLabel}</span>}
                              {!canViewAll && hlOnly && <span className="ib-status-pill is-hl">HL only</span>}
                              {!canViewAll && !unlocked && !hlOnly && <span className="ib-status-pill">Locked</span>}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </article>
                  );
                })}
                </div>
                <footer className="ib-unit-assessment">
                  <div>
                    <h3>End of unit assessment</h3>
                    <p className="muted">
                      Finish every chapter in {selectedUnit.id} to unlock the full unit assessment and check mastery.
                    </p>
                  </div>
                  <button type="button" className="pill pill--action" disabled>
                    Unit assessment locked
                  </button>
                </footer>
              </>
            )}
          </>
        ) : (
          <div className="ib-placeholder">
            <p className="muted">Select a unit to explore its chapters.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function B1LearningPreview() {
  const location = useLocation();
  const classId = location.state?.classId;
  return (
    <section className="ib-b1-preview">
      <div className="ib-b1-preview__intro">
        <h3>Interactive pathway available</h3>
        <p className="muted">
          Work through staged content, formative checkpoints, and the end-of-unit assessment inside the B1 learning
          path. Progress and attempts save automatically on this device.
        </p>
      </div>
      <div className="ib-b1-preview__stages">
        {b1Unit.stages.map((stage) => (
          <article key={stage.id}>
            <h4>{stage.title}</h4>
            <span>{stage.duration}</span>
            <p>{stage.description}</p>
          </article>
        ))}
      </div>
      <div className="ib-b1-preview__actions">
        <Link to="/curriculum/ib/b1" state={{ classId }} className="pill pill--action">
          Open B1 learning path
        </Link>
        <p className="muted">Formative assessments unlock sequentially—teachers can track attempts from the dashboard.</p>
      </div>
    </section>
  );
}

function B2LearningPreview() {
  const location = useLocation();
  const classId = location.state?.classId;
  return (
    <section className="ib-b2-preview">
      <div className="ib-b2-preview__intro">
        <h3>Interactive pathway available</h3>
        <p className="muted">
          Explore staged lessons on variables, strings, exceptions, and debugging. Includes an in-browser Python
          playground for safe practice—progress saves locally on this device.
        </p>
      </div>
      <div className="ib-b2-preview__stages">
        {b2Unit.stages.map((stage) => (
          <article key={stage.id}>
            <h4>{stage.title}</h4>
            <span>{stage.duration}</span>
            <p>{stage.description}</p>
          </article>
        ))}
      </div>
      <div className="ib-b2-preview__actions">
        <Link to="/curriculum/ib/b2" state={{ classId }} className="pill pill--action">
          Open B2 learning path
        </Link>
        <span className="muted">Python runs in-browser using Skulpt—no installation required.</span>
      </div>
    </section>
  );
}

export default IBCurriculumPage;
