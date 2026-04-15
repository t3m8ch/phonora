import { getDictionary, type Locale } from "@/lib/i18n";
import type { AudioAsset } from "@/lib/types";

export function AudioPlayer({
  audio,
  locale,
}: {
  audio?: AudioAsset | null;
  locale: Locale;
}) {
  const dictionary = getDictionary(locale);

  if (!audio?.url) {
    return <p className="muted">{dictionary.audio.missing}</p>;
  }

  return (
    <div className="audioPlayer">
      <div>
        <p className="eyebrow">{dictionary.audio.listen}</p>
        <strong>{audio.title}</strong>
        {audio.description ? <p className="muted">{audio.description}</p> : null}
      </div>
      <audio controls preload="none" src={audio.url} className="audioElement">
        <track kind="captions" />
      </audio>
    </div>
  );
}
