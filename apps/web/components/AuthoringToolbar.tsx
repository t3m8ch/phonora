"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import {
  AUTHORING_UPDATED_EVENT,
  clearDraftContent,
  exportDraftContent,
  getAuthoringMode,
  importDraftContent,
} from "@/lib/authoring";
import { DEFAULT_LOCALE, getDictionary } from "@/lib/i18n";
import { localeFromPathname } from "@/lib/routes";

export function AuthoringToolbar() {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname) ?? DEFAULT_LOCALE;
  const dictionary = getDictionary(locale);
  const [enabled, setEnabled] = useState(false);
  const [panel, setPanel] = useState<"idle" | "export" | "import">("idle");
  const [exportValue, setExportValue] = useState("");
  const [importValue, setImportValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => setEnabled(getAuthoringMode());
    const frame = window.requestAnimationFrame(refresh);

    window.addEventListener(AUTHORING_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener(AUTHORING_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return (
    <section className="authoringToolbar" aria-label={dictionary.authoring.modeLabel}>
      <div className="authoringToolbarActions">
        <div className="authoringToolbarStatus">
          <strong>{dictionary.authoring.enabledStatus}</strong>
          <span>{dictionary.authoring.localSaveHint}</span>
        </div>
        <button
          className="authoringControlButton"
          type="button"
          onClick={() => {
            setExportValue(exportDraftContent());
            setPanel("export");
            setError(null);
          }}
        >
          {dictionary.authoring.exportJson}
        </button>
        <button
          className="authoringControlButton"
          type="button"
          onClick={() => {
            setExportValue("");
            setPanel("import");
            setImportValue((current) => current || "");
            setError(null);
          }}
        >
          {dictionary.authoring.importJson}
        </button>
        <button
          className="authoringControlButton authoringDangerButton danger"
          type="button"
          onClick={() => {
            if (window.confirm(dictionary.authoring.clearDraftConfirm)) {
              clearDraftContent();
              setExportValue("");
              setImportValue("");
              setPanel("idle");
              setError(null);
            }
          }}
        >
          {dictionary.authoring.clearDraft}
        </button>
      </div>

      {panel === "export" && exportValue ? (
        <div className="authoringToolbarPanel">
          <p className="muted">{dictionary.authoring.exportHelp}</p>
          <textarea className="exportTextarea" readOnly rows={8} value={exportValue} />
        </div>
      ) : null}

      {panel === "import" ? (
        <div className="authoringToolbarPanel">
          <textarea
            className="exportTextarea"
            placeholder={dictionary.authoring.importDraftPlaceholder}
            rows={4}
            value={importValue}
            onChange={(event) => setImportValue(event.target.value)}
          />
          <div className="exerciseActions">
            <button
              className="button primary"
              type="button"
              disabled={!importValue.trim()}
              onClick={() => {
                try {
                  importDraftContent(importValue);
                  setImportValue("");
                  setPanel("idle");
                  setError(null);
                } catch {
                  setError(dictionary.authoring.importDraftError);
                }
              }}
            >
              {dictionary.authoring.importJson}
            </button>
          </div>
          {error ? <p className="feedback incorrect">{error}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
