import { getDictionary, type Locale } from "@/lib/i18n";
import type { InfoLessonBlock } from "@/lib/types";

import { blockText } from "./block-utils";

export function InfoBlock({ block, locale }: { block: InfoLessonBlock; locale: Locale }) {
  const dictionary = getDictionary(locale);

  return (
    <section className={`card lessonBlock lessonBlockInfo infoBlock tone-${block.tone}`}>
      <span className="contentTypeBadge">{dictionary.lessonBlockTypes.info}</span>
      <h2>{blockText(block.title, locale)}</h2>
      <p>{blockText(block.body, locale)}</p>
    </section>
  );
}
