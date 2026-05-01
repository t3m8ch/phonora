import { getDictionary, type Locale } from "@/lib/i18n";
import type { SoundVisualLessonBlock } from "@/lib/types";

import { blockText } from "./block-utils";

export function SoundVisualBlock({ block, locale }: { block: SoundVisualLessonBlock; locale: Locale }) {
  const dictionary = getDictionary(locale);

  return (
    <section className="card lessonBlock lessonBlockSoundVisual soundVisualBlock">
      <span className="contentTypeBadge">{dictionary.lessonBlockTypes.sound_visual}</span>
      <div className="symbolWrap">
        <span className="symbolBadge">{block.symbol}</span>
      </div>
      <div className="stack-sm">
        <h2>{blockText(block.title, locale)}</h2>
        <p>{blockText(block.description, locale)}</p>
      </div>
    </section>
  );
}
