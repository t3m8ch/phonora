import { AudioPlayer } from "@/components/AudioPlayer";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { ExamplesLessonBlock } from "@/lib/types";

import { audioFromBlock, blockText } from "./block-utils";

export function ExamplesBlock({ block, locale }: { block: ExamplesLessonBlock; locale: Locale }) {
  const dictionary = getDictionary(locale);
  const title = block.title ? blockText(block.title, locale) : dictionary.lessonBlockTypes.examples;

  return (
    <section className="card lessonBlock lessonBlockExamples stack-md">
      <span className="contentTypeBadge">{dictionary.lessonBlockTypes.examples}</span>
      <h2>{title}</h2>
      <div className="grid twoCols">
        {block.examples.map((example) => {
          const audio = audioFromBlock({
            id: example.id,
            title: example.word,
            audio: example.audio,
            audioUrl: example.audioUrl,
            audioAssetId: example.audioAssetId,
          });

          return (
            <article className="subCard stack-sm" key={example.id}>
              <strong>{example.word}</strong>
              {example.transcription ? <p className="mono">{example.transcription}</p> : null}
              <p className="muted">{blockText(example.translation, locale)}</p>
              {audio ? <AudioPlayer audio={audio} locale={locale} /> : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
