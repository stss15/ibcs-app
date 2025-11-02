import { useEffect, useState } from "react";

const MANIFEST_URL = `${import.meta.env.BASE_URL}curriculum/manifest.json`;
let manifestCache = null;
let manifestPromise = null;

function loadManifest() {
  if (manifestCache) return Promise.resolve(manifestCache);
  if (!manifestPromise) {
    manifestPromise = fetch(MANIFEST_URL, { headers: { "cache-control": "no-cache" } })
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
        manifestPromise = null;
        throw error;
      });
  }
  return manifestPromise;
}

export function useCurriculumManifest() {
  const [state, setState] = useState({ status: "loading", manifest: manifestCache, error: null });

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
          setState({ status: "error", manifest: null, error });
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
