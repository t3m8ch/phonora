import { AudioPlayer } from "@/components/AudioPlayer";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { SoundAudioLessonBlock } from "@/lib/types";

import { audioFromBlock, blockText } from "./block-utils";

export function SoundAudioBlock({ block, locale }: { block: SoundAudioLessonBlock; locale: Locale }) {
  const dictionary = getDictionary(locale);
  const title = blockText(block.title, locale);
  const audio = audioFromBlock({
    id: block.id,
    title,
    audio: block.audio,
    audioUrl: block.audioUrl,
    audioAssetId: block.audioAssetId,
  });

  return (
    <section className="card lessonBlock lessonBlockSoundAudio soundAudioBlock">
      <span className="contentTypeBadge">{dictionary.lessonBlockTypes.sound_audio}</span>
      <div className="stack-sm">
        <h2>{title}</h2>
        {block.symbol || block.transcript ? (
          <p className="mono soundAudioMeta">{block.symbol ?? block.transcript}</p>
        ) : null}
        <p>{blockText(block.description, locale)}</p>
      </div>
      <AudioPlayer audio={audio} locale={locale} />
    </section>
  );
}
