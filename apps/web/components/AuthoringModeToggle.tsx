"use client";

import { useEffect, useState } from "react";

import {
  AUTHORING_UPDATED_EVENT,
  isAuthoringModeEnabled,
  setAuthoringMode,
} from "@/lib/authoring";
import type { Dictionary } from "@/lib/i18n";

export function AuthoringModeToggle({ dictionary }: { dictionary: Dictionary }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const refresh = () => setEnabled(isAuthoringModeEnabled());
    const frame = window.requestAnimationFrame(refresh);

    window.addEventListener(AUTHORING_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener(AUTHORING_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return (
    <button
      type="button"
      className={`authoringModeToggle${enabled ? " active" : ""}`}
      aria-pressed={enabled}
      onClick={() => setAuthoringMode(!enabled)}
    >
      {dictionary.authoring.modeLabel}
    </button>
  );
}
