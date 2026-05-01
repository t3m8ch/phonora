import { getDictionary, type Locale } from "@/lib/i18n";
import type { SoundComparisonLessonBlock } from "@/lib/types";

import { blockText } from "./block-utils";

export function SoundComparisonBlock({
  block,
  locale,
}: {
  block: SoundComparisonLessonBlock;
  locale: Locale;
}) {
  const dictionary = getDictionary(locale);

  return (
    <section className="card lessonBlock lessonBlockComparison soundComparisonBlock stack-md">
      <span className="contentTypeBadge">{dictionary.lessonBlockTypes.sound_comparison}</span>
      <div className="comparisonGrid">
        <article className="subCard stack-sm">
          <span className="symbolInline">{block.leftSymbol}</span>
          {block.leftExamples.map((example) => (
            <span key={example}>{example}</span>
          ))}
        </article>
        <article className="subCard stack-sm">
          <span className="symbolInline">{block.rightSymbol}</span>
          {block.rightExamples.map((example) => (
            <span key={example}>{example}</span>
          ))}
        </article>
      </div>
      <p>{blockText(block.explanation, locale)}</p>
    </section>
  );
}
