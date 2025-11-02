import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSession } from "../hooks/useSession.js";
import {
  useCurriculumManifest,
  getTrackLabel,
  resetCurriculumManifestCache,
} from "../hooks/useCurriculumManifest.js";
import { IB_UNIT_METADATA, SUBTOPIC_DESCRIPTIONS } from "../lib/ibMetadata.js";
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

function computeLessonStatus({
  lesson,
  lessonIndex,
  unit,
  subtopic,
  track,
  isTeacher,
}) {
  if (isTeacher) {
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
  const canToggleTrack = role === "teacher" || role === "admin";
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(() =>
    resolveInitialTrack(isTeacher ? "ib-hl" : session?.user?.curriculumTrack, [
      { id: "ib-sl" },
      { id: "ib-hl" },
    ]),
  );

  useEffect(() => {
    if (!manifest || selectedUnitId) return;
    const defaultUnit = manifest.units?.find((unit) => unit.id === "A1") ?? manifest.units?.[0];
    if (defaultUnit) {
      setSelectedUnitId(defaultUnit.id);
    }
  }, [manifest, selectedUnitId]);

  useEffect(() => {
    if (!manifest) return;
    const focusUnit = location.state?.focusUnit;
    if (focusUnit) {
      setSelectedUnitId(focusUnit);
    }
  }, [location.state, manifest]);

  useEffect(() => {
    if (!manifest) return;
    const options = getTrackOptions(manifest);
    const resolved = resolveInitialTrack(isTeacher ? "ib-hl" : session?.user?.curriculumTrack, options);
    setSelectedTrack(resolved);
  }, [manifest, session?.user?.curriculumTrack, isTeacher]);

  const trackOptions = useMemo(() => getTrackOptions(manifest), [manifest]);

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

  const currentTrackLabel = isTeacher
    ? `${getTrackLabel(manifest, selectedTrack)} · Teacher view`
    : getTrackLabel(manifest, selectedTrack);
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

        {canToggleTrack && trackOptions.length > 1 && (
          <div className="ib-sidebar__tracks">
            <span className="ib-sidebar__tracks-label">Viewing as</span>
            <div className="ib-track-toggle" role="radiogroup" aria-label="Choose IB track">
              {trackOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selectedTrack === option.id}
                  className={`ib-track-toggle__button ${selectedTrack === option.id ? "is-active" : ""}`}
                  onClick={() => setSelectedTrack(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <nav className="ib-sidebar__nav" aria-label="IB units">
          {manifest.units?.map((unit) => {
            const metadata = IB_UNIT_METADATA[unit.id] ?? {};
            const isActive = unit.id === selectedUnitId;
            const isTrackAvailable = isTeacher || !unit.availableFor || unit.availableFor.includes(selectedTrack);

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
                <span className="ib-badge ib-badge--outline">Track: {currentTrackLabel}</span>
              </div>
            </header>

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
                          to={isTeacher || isChapterAvailable ? `/topic/${encodeURIComponent(subtopic.id)}` : "#"}
                          className={`ib-chapter__link ${isTeacher || isChapterAvailable ? "" : "is-disabled"}`}
                          onClick={(event) => {
                            if (!isTeacher && !isChapterAvailable) {
                              event.preventDefault();
                            }
                          }}
                        >
                          View chapter
                        </Link>
                        {!isTeacher && !isChapterAvailable && (
                          <span className="ib-badge ib-badge--muted">Locked</span>
                        )}
                        {isTeacher && <span className="ib-badge ib-badge--outline">Teacher view</span>}
                        {!isTeacher && isChapterAvailable && (
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
                          isTeacher,
                        });

                        const unlocked = status === "unlocked";
                        const hlOnly = status === "hl-only";

                        return (
                          <li key={lesson.id} className={`ib-lesson ib-lesson--${status}`}>
                            <span className="ib-lesson__code">{lesson.id}</span>
                            <span className="ib-lesson__title">{lesson.title}</span>
                            <span className="ib-lesson__status">
                              {unlocked && <span className="ib-status-pill is-unlocked">Unlocked</span>}
                              {isTeacher && <span className="ib-status-pill is-teacher">Teacher view</span>}
                              {!isTeacher && hlOnly && <span className="ib-status-pill is-hl">HL only</span>}
                              {!isTeacher && !unlocked && !hlOnly && <span className="ib-status-pill">Locked</span>}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </article>
                );
              })}
            </div>
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

export default IBCurriculumPage;

