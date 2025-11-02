import { useEffect, useState } from "react";
import manifestUrl from "../data/curriculumManifest.json?url";
import fallbackManifest from "../data/curriculumManifest.json";

let manifestCache = null;
let manifestPromise = null;

function cloneManifest(data) {
  return JSON.parse(JSON.stringify(data));
}

async function loadManifest() {
  if (manifestCache) return manifestCache;
  if (!manifestPromise) {
    manifestPromise = fetch(manifestUrl, { cache: "no-cache" })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load curriculum manifest");
        }
        return response.json();
      })
      .then((data) => {
        manifestCache = data;
        return data;
      })
      .catch((error) => {
        console.warn("Falling back to bundled curriculum manifest:", error);
        manifestCache = cloneManifest(fallbackManifest);
        return manifestCache;
      })
      .finally(() => {
        manifestPromise = null;
      });
  }
  return manifestPromise;
}

export function useCurriculumManifest() {
  const [state, setState] = useState(() => ({
    status: manifestCache ? "ready" : "loading",
    manifest: manifestCache,
    error: null,
  }));

  useEffect(() => {
    let cancelled = false;
    loadManifest()
      .then((data) => {
        if (!cancelled) {
          setState({ status: "ready", manifest: data, error: null });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ status: "ready", manifest: cloneManifest(fallbackManifest), error });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

export function resetCurriculumManifestCache() {
  manifestCache = null;
  manifestPromise = null;
}

export function getTrackLabel(manifest, track) {
  const lookup = manifest?.tracks ?? {};
  return lookup[track]?.label ?? track ?? "Unknown";
}

export function isLessonAvailableForTrack(lesson, track, manifest) {
  if (!lesson) return false;
  if (!track) return true;
  const unitAccess = manifest?.units?.some((unit) => unit.availableFor?.includes(track)) ?? true;
  if (!unitAccess) return false;
  if (lesson.hlOnly && track !== "ib-hl") {
    return false;
  }
  return true;
}
